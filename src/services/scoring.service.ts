import OpenAI from 'openai';

interface JobCriterion {
  name: string;
  type: string;
  value: string;
}

interface CandidateData {
  cvParsedData: any;
  conversationAnswers: any;
}

interface CriterionMatch {
  status: 'excellent' | 'good' | 'partial' | 'insufficient';
  evidence: string;
  explanation: string;
}

interface ScoreDetails {
  criterion: string;
  status: string;
  evidence: string;
  points: number;
  emoji: string;
}

interface ScoreResult {
  totalScore: number;
  maxScore: number;
  percentage: number;
  details: ScoreDetails[];
  recommendation: string;
}

/**
 * Évalue si un candidat remplit un critère spécifique
 */
async function evaluateCriterion(
  candidateData: CandidateData,
  criterion: JobCriterion,
  openaiApiKey: string
): Promise<CriterionMatch> {
  const openai = new OpenAI({ apiKey: openaiApiKey });
  const prompt = `Tu es un expert en recrutement. Évalue si ce candidat remplit le critère suivant.

CRITÈRE À ÉVALUER :
- Nom : ${criterion.name}
- Type : ${criterion.type}
- Requis : ${criterion.value}

DONNÉES DU CANDIDAT :
- CV parsé : ${JSON.stringify(candidateData.cvParsedData, null, 2)}
- Réponses conversation : ${JSON.stringify(candidateData.conversationAnswers, null, 2)}

Évalue si le candidat remplit ce critère et réponds UNIQUEMENT avec un objet JSON valide :

{
  "status": "excellent" | "good" | "partial" | "insufficient",
  "evidence": "Citation ou preuve concrète du CV/conversation",
  "explanation": "Explication courte (1 phrase)"
}

Status guide :
- "excellent" : Le critère est parfaitement rempli avec preuves solides
- "good" : Le critère est bien rempli avec preuves
- "partial" : Le critère est partiellement rempli
- "insufficient" : Le critère n'est pas rempli`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'Tu es un expert en recrutement. Tu réponds uniquement avec du JSON valide.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('Réponse vide de GPT-4');
    }

    return JSON.parse(content) as CriterionMatch;
  } catch (error) {
    console.error('Erreur évaluation critère:', error);
    // En cas d'erreur, retourner un statut neutre
    return {
      status: 'insufficient',
      evidence: 'Erreur lors de l\'évaluation',
      explanation: 'Impossible d\'évaluer ce critère',
    };
  }
}

/**
 * Calcule le score d'un candidat basé sur les critères du job
 */
export async function calculateCandidateScore(
  candidateData: CandidateData,
  jobCriteria: {
    essential: JobCriterion[];
    niceToHave: JobCriterion[];
  },
  openaiApiKey: string
): Promise<ScoreResult> {
  let score = 0;
  const maxScore = 100;
  const details: ScoreDetails[] = [];

  // Critères essentiels (70 points max)
  const essentialWeight = 70;
  const perEssential =
    jobCriteria.essential.length > 0
      ? essentialWeight / jobCriteria.essential.length
      : 0;

  for (const criterion of jobCriteria.essential) {
    const match = await evaluateCriterion(candidateData, criterion, openaiApiKey);

    let points = 0;
    let emoji = '❌';

    if (match.status === 'excellent') {
      points = perEssential;
      emoji = '✅';
    } else if (match.status === 'good') {
      points = perEssential * 0.7;
      emoji = '✅';
    } else if (match.status === 'partial') {
      points = perEssential * 0.4;
      emoji = '🔶';
    }

    score += points;

    details.push({
      criterion: criterion.name,
      status: match.status,
      evidence: match.evidence,
      points: Math.round(points * 10) / 10,
      emoji,
    });
  }

  // Critères bonus (30 points max)
  const bonusWeight = 30;
  const perBonus =
    jobCriteria.niceToHave.length > 0
      ? bonusWeight / jobCriteria.niceToHave.length
      : 0;

  for (const criterion of jobCriteria.niceToHave) {
    const match = await evaluateCriterion(candidateData, criterion, openaiApiKey);

    if (match.status === 'excellent' || match.status === 'good') {
      const points = perBonus;
      score += points;

      details.push({
        criterion: criterion.name,
        status: 'présent',
        evidence: match.evidence,
        points: Math.round(points * 10) / 10,
        emoji: '✅',
      });
    }
  }

  // Limiter le score à 100
  score = Math.min(score, maxScore);

  // Recommandation
  let recommendation: string;
  if (score >= 80) {
    recommendation = 'PRIORITÉ HAUTE - Profil excellent, à interviewer rapidement';
  } else if (score >= 60) {
    recommendation = 'PRIORITÉ MOYENNE - Profil intéressant, à considérer';
  } else if (score >= 40) {
    recommendation = 'PRIORITÉ BASSE - Profil à revoir selon le pool de candidats';
  } else {
    recommendation = 'NON RECOMMANDÉ - Critères essentiels non remplis';
  }

  return {
    totalScore: Math.round(score * 10) / 10,
    maxScore,
    percentage: Math.round((score / maxScore) * 100 * 10) / 10,
    details,
    recommendation,
  };
}

