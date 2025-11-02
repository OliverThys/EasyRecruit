import prisma from '../config/database';
import { decryptData } from '../utils/encryption';
import { env } from '../config/env';

export interface UserApiKeys {
  openaiApiKey: string;
  twilioAccountSid: string;
  twilioAuthToken: string;
  twilioWhatsappNumber: string;
  awsAccessKeyId?: string;
  awsSecretAccessKey?: string;
  awsS3Bucket?: string;
  awsRegion?: string;
}

/**
 * Récupère les clés API d'une organisation depuis la base de données
 * Fallback sur .env si non configuré en DB
 */
export async function getUserApiKeys(userId: string): Promise<UserApiKeys> {
  // Si userId est 'fallback', retourner uniquement .env
  if (userId === 'fallback') {
    return {
      openaiApiKey: env.OPENAI_API_KEY || '',
      twilioAccountSid: env.TWILIO_ACCOUNT_SID || '',
      twilioAuthToken: env.TWILIO_AUTH_TOKEN || '',
      twilioWhatsappNumber: env.TWILIO_WHATSAPP_NUMBER || '',
      awsAccessKeyId: env.AWS_ACCESS_KEY_ID,
      awsSecretAccessKey: env.AWS_SECRET_ACCESS_KEY,
      awsS3Bucket: env.AWS_S3_BUCKET,
      awsRegion: env.AWS_REGION,
    };
  }

  // Récupérer l'utilisateur pour obtenir son organizationId
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { organizationId: true },
  });

  if (!user) {
    // Fallback sur .env si utilisateur non trouvé
    return {
      openaiApiKey: env.OPENAI_API_KEY || '',
      twilioAccountSid: env.TWILIO_ACCOUNT_SID || '',
      twilioAuthToken: env.TWILIO_AUTH_TOKEN || '',
      twilioWhatsappNumber: env.TWILIO_WHATSAPP_NUMBER || '',
      awsAccessKeyId: env.AWS_ACCESS_KEY_ID,
      awsSecretAccessKey: env.AWS_SECRET_ACCESS_KEY,
      awsS3Bucket: env.AWS_S3_BUCKET,
      awsRegion: env.AWS_REGION,
    };
  }

  // Récupérer la config API de l'organisation
  const apiConfig = await prisma.organizationApiConfig.findUnique({
    where: { organizationId: user.organizationId },
  });

  // Si configuré en DB, utiliser les clés de la DB (déchiffrées)
  if (apiConfig) {
    const keys: UserApiKeys = {
      openaiApiKey: apiConfig.openaiApiKey 
        ? decryptData(apiConfig.openaiApiKey) 
        : env.OPENAI_API_KEY || '',
      twilioAccountSid: apiConfig.twilioAccountSid 
        ? decryptData(apiConfig.twilioAccountSid) 
        : env.TWILIO_ACCOUNT_SID || '',
      twilioAuthToken: apiConfig.twilioAuthToken 
        ? decryptData(apiConfig.twilioAuthToken) 
        : env.TWILIO_AUTH_TOKEN || '',
      twilioWhatsappNumber: apiConfig.twilioWhatsappNumber || env.TWILIO_WHATSAPP_NUMBER || '',
      awsAccessKeyId: apiConfig.awsAccessKeyId 
        ? decryptData(apiConfig.awsAccessKeyId) 
        : env.AWS_ACCESS_KEY_ID,
      awsSecretAccessKey: apiConfig.awsSecretAccessKey 
        ? decryptData(apiConfig.awsSecretAccessKey) 
        : env.AWS_SECRET_ACCESS_KEY,
      awsS3Bucket: apiConfig.awsS3Bucket || env.AWS_S3_BUCKET,
      awsRegion: apiConfig.awsRegion || env.AWS_REGION,
    };

    return keys;
  }

  // Fallback sur .env si non configuré en DB
  return {
    openaiApiKey: env.OPENAI_API_KEY || '',
    twilioAccountSid: env.TWILIO_ACCOUNT_SID || '',
    twilioAuthToken: env.TWILIO_AUTH_TOKEN || '',
    twilioWhatsappNumber: env.TWILIO_WHATSAPP_NUMBER || '',
    awsAccessKeyId: env.AWS_ACCESS_KEY_ID,
    awsSecretAccessKey: env.AWS_SECRET_ACCESS_KEY,
    awsS3Bucket: env.AWS_S3_BUCKET,
    awsRegion: env.AWS_REGION,
  };
}

/**
 * Vérifie si les clés API essentielles sont configurées pour l'organisation de l'utilisateur
 */
export async function hasRequiredApiKeys(userId: string): Promise<{
  openai: boolean;
  twilio: boolean;
}> {
  const keys = await getUserApiKeys(userId);
  
  return {
    openai: !!keys.openaiApiKey && keys.openaiApiKey.startsWith('sk-'),
    twilio: !!(keys.twilioAccountSid && keys.twilioAuthToken && keys.twilioWhatsappNumber),
  };
}

