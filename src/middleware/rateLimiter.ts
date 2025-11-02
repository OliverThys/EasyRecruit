import rateLimit from 'express-rate-limit';
import { env } from '../config/env';

// Rate limiter général pour toutes les routes
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: env.NODE_ENV === 'production' ? 100 : 1000, // Limite plus stricte en production
  message: {
    error: {
      message: 'Trop de requêtes, veuillez réessayer plus tard.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter strict pour l'authentification (empêcher brute force)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 tentatives max par IP
  message: {
    error: {
      message: 'Trop de tentatives de connexion. Veuillez réessayer dans 15 minutes.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Ne pas compter les requêtes réussies
});

// Rate limiter pour les webhooks (Twilio)
export const webhookLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // 100 webhooks par minute (Twilio peut envoyer beaucoup)
  message: {
    error: {
      message: 'Trop de requêtes webhook.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

