import { Router, Response } from 'express';
import { z } from 'zod';
import prisma from '../config/database';
import { authenticate, AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

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
    next(error);
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

    // Pour l'instant, on retourne un message d'invitation
    // TODO: Implémenter un système d'invitation avec tokens (email, lien, etc.)
    res.json({
      message: `Invitation envoyée à ${data.email}`,
      email: data.email,
      role: data.role,
      organization: currentUser.organization.name,
      note: 'Dans une version future, un email d\'invitation sera envoyé. Pour l\'instant, l\'utilisateur peut créer un compte et rejoindre via le nom de l\'organisation.',
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/organizations/join - Rejoindre une organisation existante (pour nouveaux utilisateurs)
router.post('/join', async (req: AuthRequest, res: Response, next) => {
  try {
    const { organizationId, invitationToken } = req.body;

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
    next(error);
  }
});

// GET /api/organizations/me - Informations sur l'organisation de l'utilisateur
router.get('/me', async (req: AuthRequest, res: Response, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId! },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            createdAt: true,
          },
        },
      },
      select: {
        id: true,
        email: true,
        role: true,
        organization: true,
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
    next(error);
  }
});

export default router;

