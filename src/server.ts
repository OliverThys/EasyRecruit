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
    console.log('🔧 Starting server...');
    console.log(`📍 Environment: ${env.NODE_ENV}`);
    console.log(`🔌 Port: ${env.PORT}`);
    
    // Connecter Redis (non bloquant)
    if (env.REDIS_URL) {
      console.log('🔗 Attempting Redis connection...');
      try {
        await connectRedis();
        console.log('✅ Redis connected');
      } catch (redisError) {
        console.warn('⚠️ Redis connection failed, continuing without cache:', redisError);
      }
    } else {
      console.log('ℹ️ Redis not configured, skipping...');
    }

    const port = parseInt(env.PORT, 10);
    if (isNaN(port)) {
      throw new Error(`Invalid PORT value: ${env.PORT}`);
    }

    console.log(`🚀 Starting HTTP server on 0.0.0.0:${port}...`);
    
    const server = app.listen(port, '0.0.0.0', () => {
      console.log(`✅ Server running on port ${port}`);
      console.log(`✅ Health check available at http://0.0.0.0:${port}/health`);
      console.log(`✅ Environment: ${env.NODE_ENV}`);
    });

    server.on('error', (error: NodeJS.ErrnoException) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`❌ Port ${port} is already in use`);
      } else {
        console.error('❌ Server error:', error);
      }
      process.exit(1);
    });

  } catch (error) {
    console.error('❌ Failed to start server:');
    console.error(error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    process.exit(1);
  }
}

// Gestion des erreurs non capturées
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

start();

