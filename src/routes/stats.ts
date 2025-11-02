import { Router, Response } from 'express';
import prisma from '../config/database';
import { authenticate, AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

const router = Router();

// Toutes les routes nécessitent une authentification
router.use(authenticate);

// GET /api/stats/jobs/:id - Statistiques d'une offre
router.get('/jobs/:id', async (req: AuthRequest, res: Response, next) => {
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

    const candidates = await prisma.candidate.findMany({
      where: { jobId: req.params.id },
    });

    const totalCandidates = candidates.length;
    const completedCandidates = candidates.filter(c => c.status === 'COMPLETED').length;
    const acceptedCandidates = candidates.filter(c => c.status === 'ACCEPTED').length;
    const rejectedCandidates = candidates.filter(c => c.status === 'REJECTED').length;
    const inProgressCandidates = candidates.filter(c => c.status === 'IN_PROGRESS').length;

    const averageScore = candidates
      .filter(c => c.score !== null)
      .reduce((acc, c) => acc + (c.score || 0), 0) / completedCandidates || 0;

    const completionRate = totalCandidates > 0
      ? (completedCandidates / totalCandidates) * 100
      : 0;

    res.json({
      job: {
        id: job.id,
        title: job.title,
      },
      stats: {
        totalCandidates,
        completedCandidates,
        acceptedCandidates,
        rejectedCandidates,
        inProgressCandidates,
        averageScore: Math.round(averageScore * 10) / 10,
        completionRate: Math.round(completionRate * 10) / 10,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;

