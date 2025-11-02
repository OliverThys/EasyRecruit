import { Router, Response } from 'express';
import { z } from 'zod';
import QRCode from 'qrcode';
import prisma from '../config/database';
import { env } from '../config/env';
import { authenticate, AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { generateWhatsAppLinkWithCode } from '../services/job-mapping.service';

const router = Router();

// Toutes les routes nécessitent une authentification
router.use(authenticate);

const createJobSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  essentialCriteria: z.array(z.object({
    name: z.string(),
    type: z.string(),
    value: z.string(),
  })),
  niceToHave: z.array(z.object({
    name: z.string(),
    type: z.string(),
    value: z.string(),
  })).optional().default([]),
});

const updateJobSchema = createJobSchema.partial();

// GET /api/jobs - Liste des offres de l'organisation
router.get('/', async (req: AuthRequest, res: Response, next) => {
  try {
    // Récupérer l'organizationId de l'utilisateur
    const user = await prisma.user.findUnique({
      where: { id: req.userId! },
      select: { organizationId: true },
    });

    if (!user) {
      throw new AppError('Utilisateur non trouvé', 404);
    }

    const jobs = await prisma.job.findMany({
      where: { organizationId: user.organizationId },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { candidates: true },
        },
      },
    });

    res.json({ jobs });
  } catch (error) {
    next(error);
  }
});

// POST /api/jobs - Créer une nouvelle offre
router.post('/', async (req: AuthRequest, res: Response, next) => {
  try {
    const data = createJobSchema.parse(req.body);

    // Récupérer l'organizationId de l'utilisateur
    const user = await prisma.user.findUnique({
      where: { id: req.userId! },
      select: { organizationId: true },
    });

    if (!user) {
      throw new AppError('Utilisateur non trouvé', 404);
    }

    const job = await prisma.job.create({
      data: {
        organizationId: user.organizationId,
        userId: req.userId!,
        title: data.title,
        description: data.description,
        essentialCriteria: data.essentialCriteria,
        niceToHave: data.niceToHave || [],
      },
    });

    res.status(201).json({ job });
  } catch (error) {
    next(error);
  }
});

// GET /api/jobs/:id - Détails d'une offre
router.get('/:id', async (req: AuthRequest, res: Response, next) => {
  try {
    // Récupérer l'organizationId de l'utilisateur
    const user = await prisma.user.findUnique({
      where: { id: req.userId! },
      select: { organizationId: true },
    });

    if (!user) {
      throw new AppError('Utilisateur non trouvé', 404);
    }

    const job = await prisma.job.findFirst({
      where: {
        id: req.params.id,
        organizationId: user.organizationId,
      },
      include: {
        _count: {
          select: { candidates: true },
        },
      },
    });

    if (!job) {
      throw new AppError('Offre non trouvée', 404);
    }

    res.json({ job });
  } catch (error) {
    next(error);
  }
});

// PUT /api/jobs/:id - Modifier une offre
router.put('/:id', async (req: AuthRequest, res: Response, next) => {
  try {
    const data = updateJobSchema.parse(req.body);

    // Récupérer l'organizationId de l'utilisateur
    const user = await prisma.user.findUnique({
      where: { id: req.userId! },
      select: { organizationId: true },
    });

    if (!user) {
      throw new AppError('Utilisateur non trouvé', 404);
    }

    // Vérifier que l'offre appartient à l'organisation
    const existingJob = await prisma.job.findFirst({
      where: {
        id: req.params.id,
        organizationId: user.organizationId,
      },
    });

    if (!existingJob) {
      throw new AppError('Offre non trouvée', 404);
    }

    const job = await prisma.job.update({
      where: { id: req.params.id },
      data,
    });

    res.json({ job });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/jobs/:id - Supprimer une offre
router.delete('/:id', async (req: AuthRequest, res: Response, next) => {
  try {
    // Récupérer l'organizationId de l'utilisateur
    const user = await prisma.user.findUnique({
      where: { id: req.userId! },
      select: { organizationId: true },
    });

    if (!user) {
      throw new AppError('Utilisateur non trouvé', 404);
    }

    const job = await prisma.job.findFirst({
      where: {
        id: req.params.id,
        organizationId: user.organizationId,
      },
    });

    if (!job) {
      throw new AppError('Offre non trouvée', 404);
    }

    await prisma.job.delete({
      where: { id: req.params.id },
    });

    res.json({ message: 'Offre supprimée avec succès' });
  } catch (error) {
    next(error);
  }
});

// POST /api/jobs/:id/generate-whatsapp - Générer lien/QR code WhatsApp
router.post('/:id/generate-whatsapp', async (req: AuthRequest, res: Response, next) => {
  try {
    const job = await prisma.job.findFirst({
      where: {
        id: req.params.id,
        userId: req.userId!,
      },
    });

    if (!job) {
      throw new AppError('Offre non trouvée', 404);
    }

    // Générer le lien WhatsApp avec code court (mapping Redis)
    const { link: whatsappLink } = await generateWhatsAppLinkWithCode(
      job.id,
      env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+1234567890' // Fallback si non configuré
    );

    // Générer le QR code
    const qrCodeDataURL = await QRCode.toDataURL(whatsappLink, {
      width: 500,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });

    // Mettre à jour le job
    const updatedJob = await prisma.job.update({
      where: { id: req.params.id },
      data: {
        whatsappLink,
        whatsappNumber: env.TWILIO_WHATSAPP_NUMBER,
        qrCodeUrl: qrCodeDataURL, // TODO: Uploader vers S3 et stocker l'URL
      },
    });

    res.json({
      job: updatedJob,
      qrCode: qrCodeDataURL,
    });
  } catch (error) {
    next(error);
  }
});

export default router;

