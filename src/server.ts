import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import 'express-async-errors';
import { env } from './config/env';
import { connectRedis } from './config/redis';
import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFoundHandler';
import { generalLimiter, authLimiter, webhookLimiter } from './middleware/rateLimiter';

// Routes
import authRoutes from './routes/auth';
import jobRoutes from './routes/jobs';
import candidateRoutes from './routes/candidates';
import webhookRoutes from './routes/webhooks';
import statsRoutes from './routes/stats';
import settingsRoutes from './routes/settings';
import organizationsRoutes from './routes/organizations';

const app = express();

// Middleware de sécurité
app.use(helmet());
app.use(cors({
  origin: env.FRONTEND_URL,
  credentials: true,
}));
app.use(express.json({ limit: '10mb' })); // Limiter la taille des requêtes
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting global
app.use(generalLimiter);

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes avec rate limiting spécifique
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/webhooks', webhookLimiter, webhookRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/candidates', candidateRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/organizations', organizationsRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Démarrage du serveur
async function start() {
  try {
    // Connecter Redis
    if (env.REDIS_URL) {
      await connectRedis();
    }

    const port = parseInt(env.PORT, 10);
    app.listen(port, () => {
      console.log(`🚀 Server running on port ${port}`);
      console.log(`📍 Environment: ${env.NODE_ENV}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

start();

