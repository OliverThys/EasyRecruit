import { Router, Response } from 'express';
import { z } from 'zod';
import prisma from '../config/database';
import { authenticate, AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { encryptData, decryptData } from '../utils/encryption';

const router = Router();

const updateApiConfigSchema = z.object({
  openaiApiKey: z.string().startsWith('sk-').optional().or(z.literal('')),
  twilioAccountSid: z.string().optional().or(z.literal('')),
  twilioAuthToken: z.string().optional().or(z.literal('')),
  twilioWhatsappNumber: z.string().optional().or(z.literal('')),
  awsAccessKeyId: z.string().optional().or(z.literal('')),
  awsSecretAccessKey: z.string().optional().or(z.literal('')),
  awsS3Bucket: z.string().optional().or(z.literal('')),
  awsRegion: z.string().optional().or(z.literal('')),
});

// GET /api/settings/api-config - Récupérer la configuration API de l'organisation
router.get('/api-config', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    // Récupérer l'organizationId de l'utilisateur
    const user = await prisma.user.findUnique({
      where: { id: req.userId! },
      select: { organizationId: true },
    });

    if (!user) {
      throw new AppError('Utilisateur non trouvé', 404);
    }

    const apiConfig = await prisma.organizationApiConfig.findUnique({
      where: { organizationId: user.organizationId },
    });

    if (!apiConfig) {
      // Retourner une config vide si elle n'existe pas
      return res.json({
        apiConfig: {
          openaiApiKey: '',
          twilioAccountSid: '',
          twilioAuthToken: '',
          twilioWhatsappNumber: '',
          awsAccessKeyId: '',
          awsSecretAccessKey: '',
          awsS3Bucket: '',
          awsRegion: 'eu-west-1',
        },
      });
    }

    // Déchiffrer les clés sensibles
    const decrypted = {
      openaiApiKey: apiConfig.openaiApiKey ? decryptData(apiConfig.openaiApiKey) : '',
      twilioAccountSid: apiConfig.twilioAccountSid ? decryptData(apiConfig.twilioAccountSid) : '',
      twilioAuthToken: apiConfig.twilioAuthToken ? decryptData(apiConfig.twilioAuthToken) : '',
      twilioWhatsappNumber: apiConfig.twilioWhatsappNumber || '',
      awsAccessKeyId: apiConfig.awsAccessKeyId ? decryptData(apiConfig.awsAccessKeyId) : '',
      awsSecretAccessKey: apiConfig.awsSecretAccessKey ? decryptData(apiConfig.awsSecretAccessKey) : '',
      awsS3Bucket: apiConfig.awsS3Bucket || '',
      awsRegion: apiConfig.awsRegion || 'eu-west-1',
    };

    return res.json({ apiConfig: decrypted });
  } catch (error) {
    return next(error);
  }
});

// PUT /api/settings/api-config - Mettre à jour la configuration API de l'organisation
router.put('/api-config', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const data = updateApiConfigSchema.parse(req.body);

    // Récupérer l'organizationId de l'utilisateur
    const user = await prisma.user.findUnique({
      where: { id: req.userId! },
      select: { organizationId: true, role: true },
    });

    if (!user) {
      throw new AppError('Utilisateur non trouvé', 404);
    }

    // Seuls OWNER et ADMIN peuvent modifier la config API
    if (user.role !== 'OWNER' && user.role !== 'ADMIN') {
      throw new AppError('Vous n\'avez pas les permissions pour modifier la configuration', 403);
    }

    // Préparer les données à sauvegarder (chiffrer les clés sensibles)
    const configData: any = {
      organizationId: user.organizationId,
      awsRegion: data.awsRegion || 'eu-west-1',
    };

    // Chiffrer et sauvegarder seulement si fourni (non vide)
    if (data.openaiApiKey && data.openaiApiKey.trim() !== '') {
      configData.openaiApiKey = encryptData(data.openaiApiKey.trim());
    } else {
      configData.openaiApiKey = null;
    }

    if (data.twilioAccountSid && data.twilioAccountSid.trim() !== '') {
      configData.twilioAccountSid = encryptData(data.twilioAccountSid.trim());
    } else {
      configData.twilioAccountSid = null;
    }

    if (data.twilioAuthToken && data.twilioAuthToken.trim() !== '') {
      configData.twilioAuthToken = encryptData(data.twilioAuthToken.trim());
    } else {
      configData.twilioAuthToken = null;
    }

    if (data.twilioWhatsappNumber && data.twilioWhatsappNumber.trim() !== '') {
      configData.twilioWhatsappNumber = data.twilioWhatsappNumber.trim();
    } else {
      configData.twilioWhatsappNumber = null;
    }

    if (data.awsAccessKeyId && data.awsAccessKeyId.trim() !== '') {
      configData.awsAccessKeyId = encryptData(data.awsAccessKeyId.trim());
    } else {
      configData.awsAccessKeyId = null;
    }

    if (data.awsSecretAccessKey && data.awsSecretAccessKey.trim() !== '') {
      configData.awsSecretAccessKey = encryptData(data.awsSecretAccessKey.trim());
    } else {
      configData.awsSecretAccessKey = null;
    }

    if (data.awsS3Bucket && data.awsS3Bucket.trim() !== '') {
      configData.awsS3Bucket = data.awsS3Bucket.trim();
    } else {
      configData.awsS3Bucket = null;
    }

    // Upsert (créer ou mettre à jour)
    const apiConfig = await prisma.organizationApiConfig.upsert({
      where: { organizationId: user.organizationId },
      create: configData,
      update: configData,
    });

    res.json({
      message: 'Configuration mise à jour avec succès',
      apiConfig: {
        openaiApiKey: apiConfig.openaiApiKey ? '***configuré***' : '',
        twilioAccountSid: apiConfig.twilioAccountSid ? '***configuré***' : '',
        twilioAuthToken: apiConfig.twilioAuthToken ? '***configuré***' : '',
        twilioWhatsappNumber: apiConfig.twilioWhatsappNumber || '',
        awsAccessKeyId: apiConfig.awsAccessKeyId ? '***configuré***' : '',
        awsSecretAccessKey: apiConfig.awsSecretAccessKey ? '***configuré***' : '',
        awsS3Bucket: apiConfig.awsS3Bucket || '',
        awsRegion: apiConfig.awsRegion || 'eu-west-1',
      },
    });
  } catch (error) {
    return next(error);
  }
});

// GET /api/settings/status - Vérifier le statut des configurations
router.get('/status', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    // Récupérer l'organizationId de l'utilisateur
    const user = await prisma.user.findUnique({
      where: { id: req.userId! },
      select: { organizationId: true },
    });

    if (!user) {
      throw new AppError('Utilisateur non trouvé', 404);
    }

    const apiConfig = await prisma.organizationApiConfig.findUnique({
      where: { organizationId: user.organizationId },
    });

    const status = {
      openai: !!apiConfig?.openaiApiKey,
      twilio: !!(apiConfig?.twilioAccountSid && apiConfig?.twilioAuthToken && apiConfig?.twilioWhatsappNumber),
      aws: !!(apiConfig?.awsAccessKeyId && apiConfig?.awsSecretAccessKey && apiConfig?.awsS3Bucket),
      allConfigured: false,
    };

    status.allConfigured = status.openai && status.twilio;

    res.json({ status });
  } catch (error) {
    return next(error);
  }
});

export default router;

