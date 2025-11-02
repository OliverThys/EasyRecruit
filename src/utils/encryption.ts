import crypto from 'crypto';
import { env } from '../config/env';

const algorithm = 'aes-256-cbc';
const key = crypto.scryptSync(env.ENCRYPTION_KEY, 'salt', 32);
const hashSalt = env.ENCRYPTION_KEY.substring(0, 16); // Salt pour le hash

export function encryptData(text: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  return iv.toString('hex') + ':' + encrypted;
}

export function decryptData(encryptedText: string): string {
  const parts = encryptedText.split(':');
  if (parts.length !== 2) {
    throw new Error('Format de données chiffrées invalide');
  }
  
  const iv = Buffer.from(parts[0], 'hex');
  const encrypted = parts[1];
  
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

/**
 * Génère un hash SHA-256 d'un numéro de téléphone pour recherche rapide
 * Le hash est déterministe mais ne permet pas de récupérer le numéro original
 */
export function hashPhoneNumber(phoneNumber: string): string {
  // Normaliser le numéro (supprimer espaces, +, etc.)
  const normalized = phoneNumber.replace(/[\s\+\-\(\)]/g, '');
  return crypto.createHash('sha256').update(normalized + hashSalt).digest('hex');
}

