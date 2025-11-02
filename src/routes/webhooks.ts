import { Router, Request, Response } from 'express';
import { AppError } from '../middleware/errorHandler';
import { handleIncomingWhatsAppMessage } from '../services/conversation.service';

const router = Router();

// POST /api/webhooks/whatsapp - Recevoir les messages WhatsApp entrants
// Cette route sera appelée par Twilio quand un message arrive
router.post('/whatsapp', async (req: Request, res: Response, next) => {
  try {
    // Twilio envoie les données dans req.body
    const {
      From,
      Body,
      MediaUrl0,
      MediaContentType0,
      MessageSid,
    } = req.body;

    console.log('📱 Message WhatsApp reçu:', {
      from: From,
      body: Body?.substring(0, 50),
      hasMedia: !!MediaUrl0,
      messageId: MessageSid,
    });

    // Répondre immédiatement à Twilio (obligatoire)
    res.status(200).send('Message reçu');

    // Traiter le message de manière asynchrone
    // Ne pas bloquer la réponse à Twilio
    setImmediate(async () => {
      try {
        await handleIncomingWhatsAppMessage({
          From,
          Body,
          MediaUrl0,
          MediaContentType0,
          MessageSid,
        });
      } catch (error) {
        console.error('Erreur traitement message WhatsApp:', error);
      }
    });
  } catch (error) {
    // Même en cas d'erreur, répondre 200 à Twilio
    res.status(200).send('Message reçu');
    next(error);
  }
});

export default router;

