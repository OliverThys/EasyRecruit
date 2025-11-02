import OpenAI from 'openai';

interface ConversationMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface JobContext {
  title: string;
  companyName?: string;
  description: string;
  essentialCriteria: Array<{ name: string; type: string; value: string }>;
  niceToHave: Array<{ name: string; type: string; value: string }>;
}

interface ConversationContext {
  job: JobContext;
  conversationHistory: ConversationMessage[];
  currentStep: string;
  candidateInfo?: {
    name?: string;
    email?: string;
    cvReceived?: boolean;
  };
}

/**
 * Génère le prompt système pour l'agent EasyRecruit
 */
function generateSystemPrompt(context: ConversationContext): string {
  const { job, currentStep, candidateInfo } = context;

  return `Tu es EasyRecruit, un assistant de recrutement IA intelligent et empathique.

CONTEXTE DU POSTE :
Titre : ${job.title}
${job.companyName ? `Entreprise : ${job.companyName}` : ''}
Description : ${job.description}

CRITÈRES ESSENTIELS (obligatoires) :
${job.essentialCriteria.map((c, i) => `${i + 1}. ${c.name}: ${c.value}`).join('\n')}

CRITÈRES BONUS (nice-to-have) :
${job.niceToHave.map((c, i) => `${i + 1}. ${c.name}: ${c.value}`).join('\n') || 'Aucun'}

TON RÔLE :
Tu mènes un entretien de présélection conversationnel avec les candidats via WhatsApp.

TES OBJECTIFS :
1. Accueillir chaleureusement le candidat
2. Récupérer ses informations : nom complet, email professionnel
3. Demander son CV (fichier PDF ou Word)
4. Poser 3 à 5 questions ciblées pour évaluer les critères du poste
5. Répondre aux questions du candidat sur le poste/entreprise
6. Conclure professionnellement en indiquant les prochaines étapes

RÈGLES STRICTES :
- Pose UNE SEULE question à la fois
- Sois concis (max 3-4 phrases par message)
- Adapte tes questions selon les réponses précédentes
- Sois chaleureux mais professionnel
- Si le candidat est hors sujet, recadre poliment
- Ne promets JAMAIS un résultat ("vous êtes pris"), reste neutre
- Utilise des emojis avec parcimonie (max 1-2 par message)

FLOW OBLIGATOIRE :
Étape 1 (intro) : Bienvenue → Demander le nom
Étape 2 (name) : Confirmer nom → Demander l'email
Étape 3 (email) : Confirmer email → Demander le CV (fichier)
Étape 4 (cv) : Confirmer réception CV → Poser questions ciblées (3-5 questions)
Étape 5 (questions) : Continuer les questions selon les réponses
Étape 6 (wrapup) : Demander si le candidat a des questions
Étape 7 (completed) : Conclure et remercier

ÉTAPE ACTUELLE : ${currentStep}
${candidateInfo?.name ? `Nom candidat : ${candidateInfo.name}` : ''}
${candidateInfo?.email ? `Email candidat : ${candidateInfo.email}` : ''}
${candidateInfo?.cvReceived ? 'CV reçu ✓' : ''}

INSTRUCTIONS :
- Analyse où tu en es dans le flow
- Génère ta prochaine réponse en suivant le flow
- Si la conversation est terminée (étape completed), termine avec "CONVERSATION_COMPLETE" à la fin

RÉPONDS UNIQUEMENT AVEC TON PROCHAIN MESSAGE (pas d'explications meta).`;
}

/**
 * Génère la réponse de l'agent IA à partir du message du candidat
 */
export async function generateAgentResponse(
  candidateMessage: string,
  context: ConversationContext,
  openaiApiKey: string
): Promise<{
  response: string;
  nextStep: string;
  isComplete: boolean;
}> {
  // Créer une instance OpenAI avec la clé de l'utilisateur
  const openai = new OpenAI({ apiKey: openaiApiKey });

  const systemPrompt = generateSystemPrompt(context);

  // Construire l'historique des messages
  const messages: ConversationMessage[] = [
    {
      role: 'system',
      content: systemPrompt,
    },
    ...context.conversationHistory,
    {
      role: 'user',
      content: candidateMessage,
    },
  ];

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages,
      temperature: 0.7,
      max_tokens: 300,
    });

    let agentResponse = response.choices[0].message.content || '';

    // Vérifier si la conversation est terminée
    const isComplete = agentResponse.includes('CONVERSATION_COMPLETE');
    if (isComplete) {
      agentResponse = agentResponse.replace('CONVERSATION_COMPLETE', '').trim();
    }

    // Déterminer la prochaine étape basée sur l'étape actuelle et le message
    const nextStep = determineNextStep(context.currentStep, isComplete, candidateMessage);

    return {
      response: agentResponse,
      nextStep,
      isComplete,
    };
  } catch (error) {
    console.error('Erreur génération réponse agent:', error);
    throw new Error('Impossible de générer la réponse. Veuillez réessayer.');
  }
}

/**
 * Détermine la prochaine étape du flow conversationnel
 */
function determineNextStep(
  currentStep: string,
  isComplete: boolean,
  candidateMessage: string
): string {
  if (isComplete) {
    return 'completed';
  }

  const message = candidateMessage.toLowerCase().trim();

  // Logique de transition d'étapes
  switch (currentStep) {
    case 'intro':
      // Si on a reçu un nom (message non vide et plus de 2 caractères)
      if (message.length > 2 && !message.includes('bonjour') && !message.includes('salut')) {
        return 'name';
      }
      return 'intro';

    case 'name':
      // Si on a reçu quelque chose qui ressemble à un email
      if (message.includes('@')) {
        return 'email';
      }
      return 'name';

    case 'email':
      // Passer à l'étape CV après confirmation email
      return 'cv';

    case 'cv':
      // Si CV reçu (géré séparément dans le handler), passer aux questions
      return 'questions';

    case 'questions':
      // Rester sur questions jusqu'à complétion
      return 'questions';

    case 'wrapup':
      return 'completed';

    default:
      return currentStep;
  }
}

/**
 * Génère un résumé de candidature pour le recruteur
 */
export async function generateCandidateSummary(
  candidateData: {
    name: string;
    email: string;
    cvParsedData: any;
    conversationHistory: ConversationMessage[];
    score: number;
    scoreDetails: any[];
  },
  openaiApiKey: string
): Promise<string> {
  // Créer une instance OpenAI avec la clé de l'utilisateur
  const openai = new OpenAI({ apiKey: openaiApiKey });
  const prompt = `Génère un résumé professionnel pour un recruteur basé sur cette candidature.

CANDIDAT :
Nom : ${candidateData.name}
Email : ${candidateData.email}

CV PARSÉ :
${JSON.stringify(candidateData.cvParsedData, null, 2)}

CONVERSATION (extraits pertinents) :
${formatConversationHighlights(candidateData.conversationHistory)}

SCORE :
${candidateData.score}%

DÉTAILS DU SCORING :
${JSON.stringify(candidateData.scoreDetails, null, 2)}

Rédige un résumé en 4 paragraphes :

1. PROFIL GÉNÉRAL (2-3 phrases)
- Poste actuel, années d'expérience
- Compétences principales

2. POINTS FORTS (3-4 bullet points)
- Éléments qui correspondent bien au poste
- Citations ou preuves concrètes de la conversation/CV

3. POINTS D'ATTENTION (2-3 bullet points)
- Critères non remplis ou partiellement remplis
- Zones à creuser en entretien

4. RECOMMANDATION FINALE (1 phrase)
- Recommandes-tu un entretien ? Avec quelle priorité ?

Ton style : factuel, concis, objectif, sans jargon.`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'Tu es un expert en recrutement qui rédige des résumés de candidatures.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.5,
      max_tokens: 800,
    });

    return response.choices[0].message.content || 'Résumé non disponible';
  } catch (error) {
    console.error('Erreur génération résumé:', error);
    return 'Impossible de générer le résumé';
  }
}

/**
 * Formate les highlights de la conversation
 */
function formatConversationHighlights(history: ConversationMessage[]): string {
  // Extraire les réponses du candidat (role: user)
  const candidateMessages = history
    .filter((m) => m.role === 'user')
    .map((m, i) => `Q${i + 1}: ${m.content.substring(0, 200)}`)
    .join('\n');

  return candidateMessages || 'Aucune conversation disponible';
}

