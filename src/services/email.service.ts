import nodemailer from 'nodemailer';
import { env } from '../config/env';

// Configuration du transporteur email
const createTransporter = () => {
  // Si aucune config SMTP, utiliser un transporteur de test (pour dev)
  if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASS) {
    console.warn('⚠️  SMTP non configuré. Les emails seront envoyés en mode test.');
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: 'ethereal.user@ethereal.email',
        pass: 'ethereal.pass',
      },
    });
  }

  return nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT ? parseInt(env.SMTP_PORT) : 587,
    secure: env.SMTP_SECURE || false,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
  });
};

const transporter = createTransporter();

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Envoie un email
 */
export async function sendEmail(options: EmailOptions): Promise<void> {
  try {
    const fromEmail = env.SMTP_FROM || env.SMTP_USER || 'noreply@easyrecruit.com';
    const fromName = env.SMTP_FROM_NAME || 'EasyRecruit';

    const mailOptions = {
      from: `${fromName} <${fromEmail}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || options.html.replace(/<[^>]*>/g, ''), // Plain text fallback
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email envoyé:', info.messageId);

    // En mode dev/test, afficher l'URL de prévisualisation
    if (nodemailer.getTestMessageUrl && info.messageId) {
      const testUrl = nodemailer.getTestMessageUrl(info);
      if (testUrl) {
        console.log('📧 Prévisualisation email:', testUrl);
      }
    }
  } catch (error) {
    console.error('❌ Erreur envoi email:', error);
    throw new Error('Impossible d\'envoyer l\'email');
  }
}

/**
 * Envoie un email de reset de mot de passe
 */
export async function sendPasswordResetEmail(
  email: string,
  resetToken: string,
  userName?: string
): Promise<void> {
  const resetUrl = `${env.FRONTEND_URL}/reset-password?token=${resetToken}`;
  const userNameText = userName || email;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>EasyRecruit</h1>
          <p>Réinitialisation de mot de passe</p>
        </div>
        <div class="content">
          <p>Bonjour ${userNameText},</p>
          <p>Vous avez demandé à réinitialiser votre mot de passe pour votre compte EasyRecruit.</p>
          <p style="text-align: center;">
            <a href="${resetUrl}" class="button">Réinitialiser mon mot de passe</a>
          </p>
          <p>Ou copiez ce lien dans votre navigateur :</p>
          <p style="word-break: break-all; color: #667eea;">${resetUrl}</p>
          <p><strong>Ce lien expire dans 1 heure.</strong></p>
          <p>Si vous n'avez pas demandé cette réinitialisation, ignorez simplement cet email.</p>
        </div>
        <div class="footer">
          <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
          <p>&copy; ${new Date().getFullYear()} EasyRecruit - Par Maolys</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await sendEmail({
    to: email,
    subject: 'Réinitialisation de votre mot de passe EasyRecruit',
    html,
  });
}

/**
 * Envoie un email d'invitation à rejoindre une organisation
 */
export async function sendInvitationEmail(
  email: string,
  invitationToken: string,
  organizationName: string,
  inviterName?: string
): Promise<void> {
  const inviteUrl = `${env.FRONTEND_URL}/join?token=${invitationToken}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>EasyRecruit</h1>
          <p>Invitation à rejoindre une organisation</p>
        </div>
        <div class="content">
          <p>Bonjour,</p>
          ${inviterName ? `<p><strong>${inviterName}</strong> vous invite à rejoindre l'organisation <strong>${organizationName}</strong> sur EasyRecruit.</p>` : `<p>Vous avez été invité(e) à rejoindre l'organisation <strong>${organizationName}</strong> sur EasyRecruit.</p>`}
          <p>EasyRecruit est une plateforme innovante de recrutement via WhatsApp avec agent IA conversationnel.</p>
          <p style="text-align: center;">
            <a href="${inviteUrl}" class="button">Rejoindre l'organisation</a>
          </p>
          <p>Ou copiez ce lien dans votre navigateur :</p>
          <p style="word-break: break-all; color: #667eea;">${inviteUrl}</p>
          <p><strong>Cette invitation expire dans 7 jours.</strong></p>
          <p>Si vous ne souhaitez pas rejoindre cette organisation, ignorez simplement cet email.</p>
        </div>
        <div class="footer">
          <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
          <p>&copy; ${new Date().getFullYear()} EasyRecruit - Par Maolys</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await sendEmail({
    to: email,
    subject: `Invitation à rejoindre ${organizationName} sur EasyRecruit`,
    html,
  });
}

