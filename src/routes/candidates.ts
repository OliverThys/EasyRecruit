import { Router, Response } from 'express';
import prisma from '../config/database';
import { authenticate, AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { sendWhatsAppMessage } from '../services/whatsapp.service';
import { decryptData } from '../utils/encryption';
import { getUserApiKeys } from '../services/api-config.service';

const router = Router();

// Toutes les routes nécessitent une authentification
router.use(authenticate);

// GET /api/jobs/:jobId/candidates - Liste des candidats pour une offre
router.get('/job/:jobId', async (req: AuthRequest, res: Response, next) => {
  try {
    // Récupérer l'organizationId de l'utilisateur
    const user = await prisma.user.findUnique({
      where: { id: req.userId! },
      select: { organizationId: true },
    });

    if (!user) {
      throw new AppError('Utilisateur non trouvé', 404);
    }

    // Vérifier que l'offre appartient à l'organisation
    const job = await prisma.job.findFirst({
      where: {
        id: req.params.jobId,
        organizationId: user.organizationId,
      },
    });

    if (!job) {
      throw new AppError('Offre non trouvée', 404);
    }

    // Récupérer tous les candidats
    const allCandidates = await prisma.candidate.findMany({
      where: { jobId: req.params.jobId },
      include: {
        conversation: {
          select: {
            messages: true,
            currentStep: true,
            completedAt: true,
          },
        },
      },
    });

    // Trier par score décroissant (les null en dernier)
    const candidates = allCandidates.sort((a, b) => {
      // Si les deux ont un score, trier par score décroissant
      if (a.score !== null && b.score !== null) {
        return b.score - a.score;
      }
      // Si seul a a un score, a vient avant
      if (a.score !== null && b.score === null) {
        return -1;
      }
      // Si seul b a un score, b vient avant
      if (a.score === null && b.score !== null) {
        return 1;
      }
      // Si les deux sont null, trier par date de création décroissante
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    res.json({ candidates });
  } catch (error) {
    next(error);
  }
});

// GET /api/candidates/:id - Détails d'un candidat
router.get('/:id', async (req: AuthRequest, res: Response, next) => {
  try {
    const candidate = await prisma.candidate.findFirst({
      where: {
        id: req.params.id,
        job: {
          userId: req.userId!,
        },
      },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            description: true,
          },
        },
        conversation: true,
      },
    });

    if (!candidate) {
      throw new AppError('Candidat non trouvé', 404);
    }

    res.json({ candidate });
  } catch (error) {
    next(error);
  }
});

// PUT /api/candidates/:id - Mettre à jour statut (accepter/rejeter)
router.put('/:id', async (req: AuthRequest, res: Response, next) => {
  try {
    const { status } = req.body;

    if (!['ACCEPTED', 'REJECTED', 'COMPLETED', 'IN_PROGRESS'].includes(status)) {
      throw new AppError('Statut invalide', 400);
    }

    // Récupérer l'organizationId de l'utilisateur
    const user = await prisma.user.findUnique({
      where: { id: req.userId! },
      select: { organizationId: true },
    });

    if (!user) {
      throw new AppError('Utilisateur non trouvé', 404);
    }

    const candidate = await prisma.candidate.findFirst({
      where: {
        id: req.params.id,
        job: {
          organizationId: user.organizationId,
        },
      },
      include: {
        job: true,
      },
    });

    if (!candidate) {
      throw new AppError('Candidat non trouvé', 404);
    }

    const updatedCandidate = await prisma.candidate.update({
      where: { id: req.params.id },
      data: { status },
    });

    // Envoyer un message WhatsApp au candidat si accepté ou refusé
    if (status === 'ACCEPTED' || status === 'REJECTED') {
      try {
        const phoneNumber = decryptData(candidate.phoneNumber);
        const candidateName = candidate.name || 'Cher candidat';
        const jobTitle = candidate.job.title;

        let message = '';
        if (status === 'ACCEPTED') {
          message = `Bonjour ${candidateName},\n\n🎉 Excellente nouvelle !\n\nVotre candidature pour le poste de "${jobTitle}" a été retenue.\n\nNous serions ravis de vous rencontrer pour la suite du processus de recrutement.\n\nNos équipes vous contacteront très prochainement pour organiser un entretien.\n\nCordialement,\nL'équipe de recrutement`;
        } else {
          message = `Bonjour ${candidateName},\n\nNous vous remercions pour votre candidature au poste de "${jobTitle}".\n\nAprès examen approfondi de votre profil, nous avons dû faire un choix difficile et nous ne pourrons malheureusement pas donner suite à votre candidature pour ce poste.\n\nNous vous souhaitons beaucoup de succès dans vos recherches et gardons votre candidature dans nos fichiers pour de futurs postes correspondant à votre profil.\n\nCordialement,\nL'équipe de recrutement`;
        }

        // Récupérer les clés API de l'utilisateur
        const userApiKeys = await getUserApiKeys(req.userId!);

        // Envoyer le message de manière asynchrone (ne pas bloquer la réponse)
        setImmediate(async () => {
          try {
            await sendWhatsAppMessage(phoneNumber, message, {
              accountSid: userApiKeys.twilioAccountSid,
              authToken: userApiKeys.twilioAuthToken,
              whatsappNumber: userApiKeys.twilioWhatsappNumber,
            });
          } catch (error) {
            console.error('Erreur envoi message WhatsApp:', error);
          }
        });
      } catch (error) {
        console.error('Erreur préparation message WhatsApp:', error);
        // Ne pas bloquer la mise à jour du statut si l'envoi échoue
      }
    }

    res.json({ candidate: updatedCandidate });
  } catch (error) {
    next(error);
  }
});

// GET /api/candidates/:id/conversation - Historique de la conversation
router.get('/:id/conversation', async (req: AuthRequest, res: Response, next) => {
  try {
    // Récupérer l'organizationId de l'utilisateur
    const user = await prisma.user.findUnique({
      where: { id: req.userId! },
      select: { organizationId: true },
    });

    if (!user) {
      throw new AppError('Utilisateur non trouvé', 404);
    }

    const candidate = await prisma.candidate.findFirst({
      where: {
        id: req.params.id,
        job: {
          organizationId: user.organizationId,
        },
      },
      include: {
        conversation: true,
      },
    });

    if (!candidate) {
      throw new AppError('Candidat non trouvé', 404);
    }

    res.json({
      conversation: candidate.conversation || null,
      messages: candidate.conversation?.messages || [],
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/candidates/:id/gdpr-delete - Supprimer données RGPD
router.delete('/:id/gdpr-delete', async (req: AuthRequest, res: Response, next) => {
  try {
    // Récupérer l'organizationId de l'utilisateur
    const user = await prisma.user.findUnique({
      where: { id: req.userId! },
      select: { organizationId: true },
    });

    if (!user) {
      throw new AppError('Utilisateur non trouvé', 404);
    }

    const candidate = await prisma.candidate.findFirst({
      where: {
        id: req.params.id,
        job: {
          organizationId: user.organizationId,
        },
      },
    });

    if (!candidate) {
      throw new AppError('Candidat non trouvé', 404);
    }

    // Supprimer la conversation
    await prisma.conversation.deleteMany({
      where: { candidateId: req.params.id },
    });

    // Anonymiser le candidat
    await prisma.candidate.update({
      where: { id: req.params.id },
      data: {
        name: 'DELETED',
        email: 'deleted@deleted.com',
        phoneNumber: 'DELETED',
        cvUrl: null,
        cvParsedData: null as any, // Prisma Json null
      },
    });

    // TODO: Supprimer le CV de S3

    res.json({ message: 'Données supprimées conformément au RGPD' });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/candidates/:id - Supprimer un candidat
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

    const candidate = await prisma.candidate.findFirst({
      where: {
        id: req.params.id,
        job: {
          organizationId: user.organizationId,
        },
      },
    });

    if (!candidate) {
      throw new AppError('Candidat non trouvé', 404);
    }

    // Supprimer la conversation associée
    await prisma.conversation.deleteMany({
      where: { candidateId: req.params.id },
    });

    // Supprimer le candidat
    await prisma.candidate.delete({
      where: { id: req.params.id },
    });

    // TODO: Supprimer le CV de S3 si nécessaire

    res.json({ message: 'Candidat supprimé avec succès' });
  } catch (error) {
    next(error);
  }
});

export default router;

