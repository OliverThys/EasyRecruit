import { redisClient } from '../config/redis';
import crypto from 'crypto';

/**
 * Génère un code court unique pour un job (6 caractères)
 */
function generateShortCode(): string {
  return crypto.randomBytes(3).toString('hex').substring(0, 6).toUpperCase();
}

/**
 * Crée un mapping entre un code court et un jobId dans Redis
 * Expire après 90 jours
 */
export async function createJobMapping(jobId: string): Promise<string> {
  const shortCode = generateShortCode();
  const key = `job:${shortCode}`;
  
  // Stocker dans Redis avec expiration de 90 jours
  await redisClient.setEx(key, 90 * 24 * 60 * 60, jobId);
  
  return shortCode;
}

/**
 * Récupère le jobId depuis un code court
 */
export async function getJobIdFromCode(shortCode: string): Promise<string | null> {
  const key = `job:${shortCode}`;
  const jobId = await redisClient.get(key);
  return jobId;
}

/**
 * Génère un lien WhatsApp avec un code court
 */
export async function generateWhatsAppLinkWithCode(
  jobId: string,
  whatsappNumber: string
): Promise<{ link: string; shortCode: string }> {
  const shortCode = await createJobMapping(jobId);
  
  // Format: wa.me/number?text=CODE-ABC123
  const message = encodeURIComponent(`CODE-${shortCode}`);
  const number = whatsappNumber.replace('whatsapp:', '').replace('+', '');
  const link = `https://wa.me/${number}?text=${message}`;
  
  return { link, shortCode };
}

/**
 * Extrait le code depuis un message WhatsApp
 */
export function extractCodeFromMessage(message: string): string | null {
  const match = message.match(/CODE-([A-F0-9]{6})/i);
  return match ? match[1].toUpperCase() : null;
}

