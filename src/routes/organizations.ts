import { Router, Response } from 'express';
import { z } from 'zod';
import jwt from 'jsonwebtoken';
import prisma from '../config/database';
import { env } from '../config/env';
import { authenticate, AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { sendInvitationEmail } from '../services/email.service';

const router = Router();

router.use(authenticate);

const inviteUserSchema = z.object({
  email: z.string().email(),
  role: z.enum(['ADMIN', 'MEMBER']).default('MEMBER'),
});

// GET /api/organizations/members - Liste des membres de l'organisation
router.get('/members', async (req: AuthRequest, res: Response, next) => {
  try {
    // Récupérer l'organisation de l'utilisateur
    const user = await prisma.user.findUnique({
      where: { id: req.userId! },
      select: { organizationId: true, role: true },
    });

    if (!user) {
      throw new AppError('Utilisateur non trouvé', 404);
    }

    // Lister tous les membres de l'organisation
    const members = await prisma.user.findMany({
      where: { organizationId: user.organizationId },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: [
        { role: 'asc' }, // OWNER en premier
        { createdAt: 'asc' },
      ],
    });

    res.json({ members });
  } catch (error) {
    return next(error);
  }
});

// POST /api/organizations/invite - Inviter un utilisateur à rejoindre l'organisation
router.post('/invite', async (req: AuthRequest, res: Response, next) => {
  try {
    const data = inviteUserSchema.parse(req.body);

    // Récupérer l'utilisateur et vérifier ses permissions
    const currentUser = await prisma.user.findUnique({
      where: { id: req.userId! },
      select: { organizationId: true, role: true, organization: true },
    });

    if (!currentUser) {
      throw new AppError('Utilisateur non trouvé', 404);
    }

    // Seuls OWNER et ADMIN peuvent inviter
    if (currentUser.role !== 'OWNER' && currentUser.role !== 'ADMIN') {
      throw new AppError('Vous n\'avez pas les permissions pour inviter des membres', 403);
    }

    // Continuer...

    // Vérifier si l'email existe déjà dans le système
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      // Si l'utilisateur existe déjà dans une autre organisation
      if (existingUser.organizationId !== currentUser.organizationId) {
        throw new AppError('Cet utilisateur appartient déjà à une autre organisation', 400);
      }
      // Si déjà dans la même organisation
      throw new AppError('Cet utilisateur fait déjà partie de votre organisation', 400);
    }

    // Générer un token d'invitation (JWT valide 7 jours)
    const invitationToken = jwt.sign(
      {
        invitedEmail: data.email,
        organizationId: currentUser.organizationId,
        role: data.role,
        inviterId: req.userId,
      },
      env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Envoyer l'email d'invitation
    try {
      await sendInvitationEmail(
        data.email,
        invitationToken,
        currentUser.organization.name,
        req.userId // Pourrait être le nom de l'inviteur, mais on a pas ce champ pour l'instant
      );
      console.log(`✅ Email d'invitation envoyé à ${data.email}`);
    } catch (emailError) {
      console.error('❌ Erreur envoi email:', emailError);
      // Retourner quand même le lien pour le dev/test
      const invitationLink = `${env.FRONTEND_URL}/join?token=${invitationToken}`;
      return res.json({
        message: `Erreur lors de l'envoi de l'email. Lien d'invitation: ${invitationLink}`,
        email: data.email,
        role: data.role,
        organization: currentUser.organization.name,
        invitationLink, // Pour le dev/test
      });
    }

    return res.json({
      message: `Invitation envoyée à ${data.email}`,
      email: data.email,
      role: data.role,
      organization: currentUser.organization.name,
    });
  } catch (error) {
    return next(error);
  }
});

// POST /api/organizations/join - Rejoindre une organisation existante (pour nouveaux utilisateurs)
router.post('/join', async (req: AuthRequest, res: Response, next) => {
  try {
    const { organizationId } = req.body;

    // Récupérer l'utilisateur actuel
    const user = await prisma.user.findUnique({
      where: { id: req.userId! },
      select: { organizationId: true },
    });

    if (!user) {
      throw new AppError('Utilisateur non trouvé', 404);
    }

    // Vérifier que l'utilisateur n'appartient pas déjà à une organisation
    if (user.organizationId) {
      throw new AppError('Vous appartenez déjà à une organisation', 400);
    }

    // TODO: Vérifier le token d'invitation
    // Pour l'instant, on accepte directement si l'organizationId est fourni

    if (!organizationId) {
      throw new AppError('Organization ID requis', 400);
    }

    // Vérifier que l'organisation existe
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
    });

    if (!organization) {
      throw new AppError('Organisation non trouvée', 404);
    }

    // Ajouter l'utilisateur à l'organisation
    await prisma.user.update({
      where: { id: req.userId! },
      data: {
        organizationId: organizationId,
        role: 'MEMBER', // Par défaut, nouveau membre
      },
    });

    res.json({
      message: 'Vous avez rejoint l\'organisation avec succès',
      organization: {
        id: organization.id,
        name: organization.name,
      },
    });
  } catch (error) {
    return next(error);
  }
});

// GET /api/organizations/me - Informations sur l'organisation de l'utilisateur
router.get('/me', async (req: AuthRequest, res: Response, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId! },
      select: {
        id: true,
        email: true,
        role: true,
        organization: {
          select: {
            id: true,
            name: true,
            createdAt: true,
          },
        },
      },
    });

    if (!user) {
      throw new AppError('Utilisateur non trouvé', 404);
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      organization: user.organization,
    });
  } catch (error) {
    return next(error);
  }
});

export default router;

