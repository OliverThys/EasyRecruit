import OpenAI from 'openai';
import { env } from '../config/env';
import pdfParse from 'pdf-parse';

const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });

interface ParsedCV {
  name: string | null;
  email: string | null;
  phone: string | null;
  yearsOfExperience: number | null;
  currentPosition: string | null;
  currentCompany: string | null;
  skills: string[];
  languages: string[];
  education: string[];
  experience: Array<{
    title: string;
    company: string;
    duration: string;
    description: string;
  }>;
}

/**
 * Extrait le texte d'un fichier PDF
 */
async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    console.log('📄 Extraction texte PDF, taille buffer:', buffer.length);
    const data = await pdfParse(buffer, {
      max: 0, // Pas de limite de pages
    });
    
    const text = data.text || '';
    console.log('📄 Texte extrait:', text.length, 'caractères');
    
    if (text.length < 10) {
      throw new Error('Le PDF semble vide ou ne contient pas de texte extractible');
    }
    
    return text;
  } catch (error: any) {
    console.error('❌ Erreur extraction PDF:', error);
    console.error('❌ Détails:', error.message, error.stack?.substring(0, 200));
    throw new Error(`Impossible d'extraire le texte du PDF: ${error.message || 'Format non supporté'}`);
  }
}

/**
 * Extrait le texte d'un fichier Word (simplifié - nécessiterait une lib spécifique)
 */
async function extractTextFromDocx(buffer: Buffer): Promise<string> {
  // TODO: Implémenter avec une lib comme 'docx' ou 'mammoth'
  // Pour l'instant, on retourne une chaîne vide
  throw new Error('Extraction DOCX non implémentée - veuillez utiliser un PDF');
}

/**
 * Parse un CV et extrait les informations structurées avec GPT-4
 */
export async function parseCV(cvBuffer: Buffer, fileExtension: string): Promise<ParsedCV> {
  let text: string;

  // Extraire le texte selon le type de fichier
  if (fileExtension.toLowerCase() === '.pdf') {
    text = await extractTextFromPDF(cvBuffer);
  } else if (['.doc', '.docx'].includes(fileExtension.toLowerCase())) {
    text = await extractTextFromDocx(cvBuffer);
  } else {
    throw new Error(`Format de fichier non supporté: ${fileExtension}`);
  }

  if (!text || text.trim().length < 50) {
    throw new Error('Le CV semble vide ou corrompu');
  }

  // Utiliser GPT-4 pour parser le CV
  const prompt = `Tu es un expert en analyse de CV. Analyse ce CV et extrais les informations suivantes au format JSON strict.

CV :
${text.substring(0, 4000)} ${text.length > 4000 ? '...' : ''}

Réponds UNIQUEMENT avec un objet JSON valide, sans texte avant ou après :

{
  "name": "Nom complet du candidat ou null",
  "email": "Email si présent ou null",
  "phone": "Téléphone si présent ou null",
  "yearsOfExperience": nombre d'années d'expérience totale (entier) ou null,
  "currentPosition": "Poste actuel ou null",
  "currentCompany": "Entreprise actuelle ou null",
  "skills": ["Liste des compétences techniques"],
  "languages": ["Langues parlées avec niveaux"],
  "education": ["Diplômes obtenus"],
  "experience": [
    {
      "title": "Titre du poste",
      "company": "Entreprise",
      "duration": "Durée (ex: 2020-2023)",
      "description": "Description courte du poste"
    }
  ]
}

Si une information n'est pas présente, utilise null ou un tableau vide.`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'Tu es un expert en analyse de CV. Tu réponds uniquement avec du JSON valide.',
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

    const parsed = JSON.parse(content) as ParsedCV;
    return parsed;
  } catch (error) {
    console.error('Erreur parsing CV avec GPT-4:', error);
    throw new Error('Impossible d\'analyser le CV. Veuillez vérifier le format.');
  }
}

