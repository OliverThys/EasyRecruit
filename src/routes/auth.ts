import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import crypto from 'crypto';
import { z } from 'zod';
import prisma from '../config/database';
import { env } from '../config/env';
import { authenticate, AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { sendPasswordResetEmail } from '../services/email.service';

const router = Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  organizationName: z.string().min(1), // Nom de l'entreprise obligatoire
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

// POST /api/auth/register
router.post('/register', async (req, res: Response, next) => {
  try {
    const data = registerSchema.parse(req.body);

    // Vérifier si l'email existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new AppError('Cet email est déjà utilisé', 400);
    }

    // Hasher le mot de passe
    const passwordHash = await bcrypt.hash(data.password, 10);

    // Créer l'organisation et l'utilisateur en une transaction
    const result = await prisma.$transaction(async (tx) => {
      // Créer l'organisation
      const organization = await tx.organization.create({
        data: {
          name: data.organizationName,
        },
      });

      // Créer l'utilisateur (OWNER de l'organisation)
      const user = await tx.user.create({
        data: {
          email: data.email,
          passwordHash,
          organizationId: organization.id,
          role: 'OWNER',
        },
        include: {
          organization: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      return { user, organization };
    });

    // Générer le token JWT
    const token = jwt.sign(
      { userId: result.user.id },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN } as SignOptions
    );

    res.status(201).json({
      user: {
        id: result.user.id,
        email: result.user.email,
        organization: result.user.organization,
        role: result.user.role,
        createdAt: result.user.createdAt,
      },
      token,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/login
router.post('/login', async (req, res: Response, next) => {
  try {
    const data = loginSchema.parse(req.body);

    // Trouver l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      throw new AppError('Email ou mot de passe incorrect', 401);
    }

    // Vérifier le mot de passe
    const isValidPassword = await bcrypt.compare(data.password, user.passwordHash);

    if (!isValidPassword) {
      throw new AppError('Email ou mot de passe incorrect', 401);
    }

    // Générer le token JWT
    const token = jwt.sign(
      { userId: user.id },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN } as SignOptions
    );

    // Récupérer l'organisation de l'utilisateur
    const userWithOrg = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    res.json({
      user: {
        id: user.id,
        email: user.email,
        organization: userWithOrg?.organization,
        role: userWithOrg?.role,
        createdAt: user.createdAt,
      },
      token,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/auth/me
router.get('/me', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId! },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        organization: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!user) {
      throw new AppError('Utilisateur non trouvé', 404);
    }

    res.json({ user });
  } catch (error) {
    next(error);
  }
});

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res: Response, next) => {
  try {
    const { email } = forgotPasswordSchema.parse(req.body);

    // Chercher l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Ne pas révéler si l'email existe ou non (sécurité)
    if (!user) {
      // Retourner un succès même si l'email n'existe pas (pour éviter l'énumération d'emails)
      res.json({
        message: 'Si cet email existe dans notre système, vous recevrez un lien de réinitialisation.',
      });
      return;
    }

    // Générer un token de reset
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 heure

    // Sauvegarder le token hashé et l'expiration
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: resetTokenHash,
        resetPasswordExpires: resetExpires,
      },
    });

    // Envoyer l'email de reset
    try {
      await sendPasswordResetEmail(email, resetToken, user.email);
      console.log(`✅ Email de reset envoyé à ${email}`);
    } catch (emailError) {
      console.error('❌ Erreur envoi email:', emailError);
      // Ne pas échouer la requête si l'email échoue (pour éviter l'énumération)
    }

    res.json({
      message: 'Si cet email existe dans notre système, vous recevrez un lien de réinitialisation.',
    });
  } catch (error) {
    next(error);
  }
});

const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8),
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req, res: Response, next) => {
  try {
    const { token, password } = resetPasswordSchema.parse(req.body);

    // Hasher le token pour la comparaison
    const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');

    // Chercher l'utilisateur avec ce token valide et non expiré
    const user = await prisma.user.findFirst({
      where: {
        resetPasswordToken: resetTokenHash,
        resetPasswordExpires: {
          gt: new Date(), // Non expiré
        },
      },
    });

    if (!user) {
      throw new AppError('Token invalide ou expiré', 400);
    }

    // Hasher le nouveau mot de passe
    const passwordHash = await bcrypt.hash(password, 10);

    // Mettre à jour le mot de passe et supprimer le token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      },
    });

    res.json({
      message: 'Mot de passe réinitialisé avec succès. Vous pouvez maintenant vous connecter.',
    });
  } catch (error) {
    next(error);
  }
});

export default router;

