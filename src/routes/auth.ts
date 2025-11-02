import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import prisma from '../config/database';
import { env } from '../config/env';
import { authenticate, AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

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
    const token = jwt.sign({ userId: result.user.id }, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN,
    });

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
    const token = jwt.sign({ userId: user.id }, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN,
    });

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
      include: {
        organization: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        organization: true,
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

export default router;

