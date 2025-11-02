import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('4000'),
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url().optional(),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('7d'),
  OPENAI_API_KEY: z.string().startsWith('sk-').optional(),
  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  TWILIO_WHATSAPP_NUMBER: z.string().optional(),
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  AWS_S3_BUCKET: z.string().optional(),
  AWS_REGION: z.string().default('eu-west-1'),
  ENCRYPTION_KEY: z.string().min(32),
  FRONTEND_URL: z.string().url().default('http://localhost:3000'),
  N8N_WEBHOOK_URL: z.string().url().optional(),
  // Email configuration (SMTP)
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().optional(),
  SMTP_SECURE: z.string().optional().transform((val) => val === 'true'),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().email().optional(),
  SMTP_FROM_NAME: z.string().optional().default('EasyRecruit'),
});

export type Env = z.infer<typeof envSchema>;

function validateEnv(): Env {
  try {
    console.log('🔍 Validating environment variables...');
    const validated = envSchema.parse(process.env);
    console.log('✅ Environment variables validated');
    return validated;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Erreur de configuration environnement:');
      console.error('Missing or invalid environment variables:');
      error.errors.forEach((err) => {
        const path = err.path.join('.');
        console.error(`  - ${path}: ${err.message}`);
        if (process.env[path] === undefined) {
          console.error(`    (Variable ${path} is not set)`);
        }
      });
      console.error('\nPlease check your environment variables configuration.');
      process.exit(1);
    }
    throw error;
  }
}

export const env = validateEnv();

