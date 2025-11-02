import prisma from '../config/database';
import { decryptData, encryptData, hashPhoneNumber } from '../utils/encryption';
import { sendWhatsAppMessage } from './whatsapp.service';
import { parseCV } from './cv-parser.service';
import { calculateCandidateScore } from './scoring.service';
import { generateAgentResponse, generateCandidateSummary } from './ai-agent.service';
import { downloadMediaFromTwilio, formatPhoneNumber } from './whatsapp.service';
import { getJobIdFromCode, extractCodeFromMessage } from './job-mapping.service';
import { uploadToS3 } from './storage.service';
import { getUserApiKeys } from './api-config.service';

interface IncomingWhatsAppMessage {
  From: string;
  Body: string;
  MediaUrl0?: string;
  MediaContentType0?: string;
  MessageSid: string;
}

/**
 * Traite un message WhatsApp entrant et gère la conversation avec l'agent IA
 */
export async function handleIncomingWhatsAppMessage(
  message: IncomingWhatsAppMessage
): Promise<void> {
  const phoneNumber = formatPhoneNumber(message.From.replace('whatsapp:', ''));
  const messageBody = message.Body?.trim() || '';
  const hasMedia = !!message.MediaUrl0;

  console.log(`📱 Traitement message de ${phoneNumber}:`, {
    body: messageBody.substring(0, 50),
    hasMedia,
  });

  // Identifier le job depuis le code court ou la conversation existante
  let jobId: string | null = null;

  // Essayer d'extraire le code depuis le message
  const shortCode = extractCodeFromMessage(messageBody);
  if (shortCode) {
    jobId = await getJobIdFromCode(shortCode);
  }

  // Si pas de jobId, chercher une conversation existante avec le hash
  if (!jobId) {
    const phoneHash = hashPhoneNumber(phoneNumber);
    
    // Recherche optimisée avec le hash
    const existingCandidate = await prisma.candidate.findFirst({
      where: {
        phoneHash,
        conversation: {
          completedAt: null,
        },
      },
      include: {
        conversation: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (existingCandidate && existingCandidate.conversation) {
      jobId = existingCandidate.jobId;
    }
  }

  if (!jobId) {
    // Nouvelle conversation sans code - envoyer un message d'erreur
    // Utiliser fallback .env si pas de jobId
    const fallbackKeys = await getUserApiKeys('fallback');
    await sendWhatsAppMessage(
      phoneNumber,
      'Bonjour ! Pour postuler, veuillez utiliser le lien WhatsApp fourni dans l\'offre d\'emploi. Merci.',
      {
        accountSid: fallbackKeys.twilioAccountSid,
        authToken: fallbackKeys.twilioAuthToken,
        whatsappNumber: fallbackKeys.twilioWhatsappNumber,
      }
    );
    return;
  }

  // Charger le job
  const job = await prisma.job.findUnique({
    where: { id: jobId },
    include: {
      organization: {
        select: {
          name: true,
        },
      },
    },
  });

  if (!job) {
    // Fallback sur .env si pas de job (cas d'erreur)
    const fallbackKeys = await getUserApiKeys('fallback');
    await sendWhatsAppMessage(
      phoneNumber, 
      'Offre d\'emploi non trouvée. Veuillez contacter le recruteur.',
      {
        accountSid: fallbackKeys.twilioAccountSid,
        authToken: fallbackKeys.twilioAuthToken,
        whatsappNumber: fallbackKeys.twilioWhatsappNumber,
      }
    );
    return;
  }

  // Récupérer les clés API de l'utilisateur propriétaire du job
  const userApiKeys = await getUserApiKeys(job.userId);

  // Trouver ou créer le candidat (recherche optimisée avec hash)
  const encryptedPhone = encryptData(phoneNumber);
  const phoneHash = hashPhoneNumber(phoneNumber);
  
  // Recherche optimisée avec hash indexé
  let candidate = await prisma.candidate.findUnique({
    where: {
      jobId_phoneHash: {
        jobId: job.id,
        phoneHash,
      },
    },
  });

  if (!candidate) {
    // Créer nouveau candidat
    candidate = await prisma.candidate.create({
      data: {
        jobId: job.id,
        phoneNumber: encryptedPhone,
        phoneHash,
        status: 'IN_PROGRESS',
      },
    });
  }

  // Trouver ou créer la conversation
  let conversation = await prisma.conversation.findUnique({
    where: { candidateId: candidate.id },
  });

  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: {
        candidateId: candidate.id,
        messages: [],
        currentStep: 'intro',
      },
    });
  }

  // Si média (CV), le télécharger et parser
  if (hasMedia && message.MediaUrl0) {
    try {
      console.log('📄 Traitement CV - Téléchargement depuis Twilio...');
      const mediaBuffer = await downloadMediaFromTwilio(message.MediaUrl0, {
        accountSid: userApiKeys.twilioAccountSid,
        authToken: userApiKeys.twilioAuthToken,
      });
      
      console.log('📄 CV téléchargé, taille:', mediaBuffer.length, 'bytes');
      
      const contentType = message.MediaContentType0 || 'application/pdf';
      console.log('📄 Content-Type détecté:', contentType);
      
      const fileExtension = contentType.includes('pdf') || contentType.includes('application/pdf')
        ? '.pdf'
        : contentType.includes('word') || contentType.includes('msword') || contentType.includes('document')
        ? '.docx'
        : '.pdf';

      console.log('📄 Extension détectée:', fileExtension);

      // Parser le CV en premier (plus important que l'upload S3)
      console.log('📄 Parsing du CV...');
      const cvParsedData = await parseCV(mediaBuffer, fileExtension);
      console.log('✅ CV parsé avec succès:', {
        name: cvParsedData.name,
        email: cvParsedData.email,
        experience: cvParsedData.yearsOfExperience,
      });

      // Uploader le CV vers S3 (optionnel - si échoue, on continue quand même)
      let cvUrl: string | null = null;
      try {
        const s3Key = `cvs/${candidate.id}/${Date.now()}${fileExtension}`;
        cvUrl = await uploadToS3(mediaBuffer, s3Key, contentType, {
          accessKeyId: userApiKeys.awsAccessKeyId,
          secretAccessKey: userApiKeys.awsSecretAccessKey,
          bucket: userApiKeys.awsS3Bucket,
          region: userApiKeys.awsRegion,
        });
        console.log('✅ CV uploadé vers S3:', cvUrl);
      } catch (s3Error) {
        console.warn('⚠️ Erreur upload S3 (ignoré):', s3Error);
        // On continue sans l'URL S3
      }

      // Mettre à jour le candidat avec les données du CV
      await prisma.candidate.update({
        where: { id: candidate.id },
        data: {
          cvUrl,
          cvParsedData,
          name: cvParsedData.name || candidate.name,
          email: cvParsedData.email || candidate.email,
        },
      });

      // Mettre à jour la conversation
      const messages = (conversation.messages as any[]) || [];
      messages.push({
        role: 'candidate',
        content: '[CV envoyé]',
        timestamp: new Date().toISOString(),
      });

      await prisma.conversation.update({
        where: { id: conversation.id },
        data: {
          messages,
          currentStep: 'cv',
        },
      });

      // Répondre au candidat
      await sendWhatsAppMessage(
        phoneNumber,
        'Merci ! J\'ai bien reçu votre CV. Je vais maintenant vous poser quelques questions pour mieux comprendre votre profil.',
        {
          accountSid: userApiKeys.twilioAccountSid,
          authToken: userApiKeys.twilioAuthToken,
          whatsappNumber: userApiKeys.twilioWhatsappNumber,
        }
      );

      // Poser la première question
      await processNextAgentMessage(candidate.id, job, conversation, userApiKeys);
      return;
    } catch (error: any) {
      console.error('❌ Erreur traitement CV:', error);
      console.error('❌ Stack:', error.stack?.substring(0, 500));
      console.error('❌ Message:', error.message);
      const errorMsg = error.message?.substring(0, 80) || 'Erreur technique';
      await sendWhatsAppMessage(
        phoneNumber,
        `Désolé, je n'ai pas pu traiter votre CV (${errorMsg}). Veuillez réessayer avec un fichier PDF valide (moins de 10MB).`,
        {
          accountSid: userApiKeys.twilioAccountSid,
          authToken: userApiKeys.twilioAuthToken,
          whatsappNumber: userApiKeys.twilioWhatsappNumber,
        }
      );
      return;
    }
  }

  // Traiter le message texte avec l'agent IA
  await processCandidateMessage(candidate.id, job, conversation, messageBody, userApiKeys);
}

/**
 * Traite un message texte du candidat et génère la réponse de l'agent
 */
async function processCandidateMessage(
  candidateId: string,
  job: any,
  conversation: any,
  messageBody: string,
  userApiKeys: {
    openaiApiKey: string;
    twilioAccountSid: string;
    twilioAuthToken: string;
    twilioWhatsappNumber: string;
    awsAccessKeyId?: string;
    awsSecretAccessKey?: string;
    awsS3Bucket?: string;
    awsRegion?: string;
  }
): Promise<void> {
  // Charger le candidat
  const candidate = await prisma.candidate.findUnique({
    where: { id: candidateId },
  });

  if (!candidate) return;

  // Construire le contexte pour l'agent IA
  const messages = (conversation.messages as any[]) || [];
  const conversationHistory = messages.map((m: any) => ({
    role: m.role === 'candidate' ? 'user' : 'assistant',
    content: m.content,
  }));

  const context = {
    job: {
      title: job.title,
      companyName: job.organization?.name,
      description: job.description,
      essentialCriteria: job.essentialCriteria,
      niceToHave: job.niceToHave,
    },
    conversationHistory,
    currentStep: conversation.currentStep,
    candidateInfo: {
      name: candidate.name,
      email: candidate.email,
      cvReceived: !!candidate.cvParsedData,
    },
  };

  // Générer la réponse de l'agent
  const agentResponse = await generateAgentResponse(messageBody, context, userApiKeys.openaiApiKey);

  // Sauvegarder les messages
  const updatedMessages = [
    ...messages,
    {
      role: 'candidate',
      content: messageBody,
      timestamp: new Date().toISOString(),
    },
    {
      role: 'agent',
      content: agentResponse.response,
      timestamp: new Date().toISOString(),
    },
  ];

  // Mettre à jour la conversation
  await prisma.conversation.update({
    where: { id: conversation.id },
    data: {
      messages: updatedMessages,
      currentStep: agentResponse.nextStep,
      completedAt: agentResponse.isComplete ? new Date() : null,
    },
  });

  // Mettre à jour le candidat si on a récupéré des infos
  const updateData: any = {};
  if (!candidate.name && messageBody.length > 2 && conversation.currentStep === 'intro') {
    updateData.name = messageBody.trim();
  }
  if (!candidate.email && messageBody.includes('@') && conversation.currentStep === 'name') {
    updateData.email = messageBody.trim();
  }

  if (Object.keys(updateData).length > 0) {
    await prisma.candidate.update({
      where: { id: candidateId },
      data: updateData,
    });
  }

  // Envoyer la réponse WhatsApp
  const phoneNumber = decryptData(candidate.phoneNumber);
  await sendWhatsAppMessage(phoneNumber, agentResponse.response, {
    accountSid: userApiKeys.twilioAccountSid,
    authToken: userApiKeys.twilioAuthToken,
    whatsappNumber: userApiKeys.twilioWhatsappNumber,
  });

  // Si conversation terminée, calculer le score et générer le résumé
  if (agentResponse.isComplete) {
    await finalizeCandidate(candidateId, job, conversation, userApiKeys);
  }
}

/**
 * Génère le prochain message de l'agent après réception du CV
 */
async function processNextAgentMessage(
  candidateId: string,
  job: any,
  conversation: any,
  userApiKeys: {
    openaiApiKey: string;
    twilioAccountSid: string;
    twilioAuthToken: string;
    twilioWhatsappNumber: string;
    awsAccessKeyId?: string;
    awsSecretAccessKey?: string;
    awsS3Bucket?: string;
    awsRegion?: string;
  }
): Promise<void> {
  const candidate = await prisma.candidate.findUnique({
    where: { id: candidateId },
  });

  if (!candidate) return;

  const messages = (conversation.messages as any[]) || [];
  const conversationHistory = messages.map((m: any) => ({
    role: m.role === 'candidate' ? 'user' : 'assistant',
    content: m.content,
  }));

  const context = {
    job: {
      title: job.title,
      companyName: job.organization?.name,
      description: job.description,
      essentialCriteria: job.essentialCriteria,
      niceToHave: job.niceToHave,
    },
    conversationHistory,
    currentStep: 'questions',
    candidateInfo: {
      name: candidate.name,
      email: candidate.email,
      cvReceived: true,
    },
  };

  // Générer la première question
  const agentResponse = await generateAgentResponse(
    '[CV reçu, commencer les questions]',
    context,
    userApiKeys.openaiApiKey
  );

  // Sauvegarder
  const updatedMessages = [
    ...messages,
    {
      role: 'agent',
      content: agentResponse.response,
      timestamp: new Date().toISOString(),
    },
  ];

  await prisma.conversation.update({
    where: { id: conversation.id },
    data: {
      messages: updatedMessages,
      currentStep: agentResponse.nextStep,
    },
  });

  // Envoyer
  const phoneNumber = decryptData(candidate.phoneNumber);
  await sendWhatsAppMessage(phoneNumber, agentResponse.response, {
    accountSid: userApiKeys.twilioAccountSid,
    authToken: userApiKeys.twilioAuthToken,
    whatsappNumber: userApiKeys.twilioWhatsappNumber,
  });
}

/**
 * Finalise la candidature : calcule le score et génère le résumé
 */
async function finalizeCandidate(
  candidateId: string,
  job: any,
  conversation: any,
  userApiKeys: {
    openaiApiKey: string;
    twilioAccountSid: string;
    twilioAuthToken: string;
    twilioWhatsappNumber: string;
    awsAccessKeyId?: string;
    awsSecretAccessKey?: string;
    awsS3Bucket?: string;
    awsRegion?: string;
  }
): Promise<void> {
  const candidate = await prisma.candidate.findUnique({
    where: { id: candidateId },
  });

  if (!candidate || !candidate.cvParsedData) {
    console.error('Candidat ou CV manquant pour finalisation');
    return;
  }

  // Extraire les réponses de la conversation
  const messages = (conversation.messages as any[]) || [];
  const conversationAnswers = messages
    .filter((m: any) => m.role === 'candidate')
    .map((m: any) => m.content);

  // Calculer le score
  const scoreResult = await calculateCandidateScore(
    {
      cvParsedData: candidate.cvParsedData,
      conversationAnswers,
    },
    {
      essential: job.essentialCriteria,
      niceToHave: job.niceToHave,
    },
    userApiKeys.openaiApiKey
  );

  // Générer le résumé
  const summary = await generateCandidateSummary({
    name: candidate.name || 'Candidat',
    email: candidate.email || '',
    cvParsedData: candidate.cvParsedData,
    conversationHistory: messages.map((m: any) => ({
      role: m.role === 'candidate' ? 'user' : 'assistant',
      content: m.content,
    })),
    score: scoreResult.percentage,
    scoreDetails: scoreResult.details,
  }, userApiKeys.openaiApiKey);

  // Mettre à jour le candidat
  await prisma.candidate.update({
    where: { id: candidateId },
    data: {
      score: Math.round(scoreResult.totalScore),
      scoreDetails: scoreResult.details,
      summary,
      status: 'COMPLETED',
    },
  });

  console.log(`✅ Candidature finalisée: ${candidate.name} - Score: ${scoreResult.percentage}%`);

  // TODO: Notifier le recruteur (webhook, email, etc.)
}

