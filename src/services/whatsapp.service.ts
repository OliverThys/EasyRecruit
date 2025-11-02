import twilio from 'twilio';

/**
 * Envoie un message WhatsApp via Twilio
 */
export async function sendWhatsAppMessage(
  to: string, 
  message: string,
  twilioConfig: {
    accountSid: string;
    authToken: string;
    whatsappNumber: string;
  }
): Promise<void> {
  try {
    const client = twilio(twilioConfig.accountSid, twilioConfig.authToken);
    const whatsappTo = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;
    
    await client.messages.create({
      from: twilioConfig.whatsappNumber,
      to: whatsappTo,
      body: message,
    });

    console.log(`✅ Message WhatsApp envoyé à ${to}`);
  } catch (error) {
    console.error('❌ Erreur envoi WhatsApp:', error);
    throw error;
  }
}

/**
 * Télécharge un média (CV) depuis Twilio
 */
export async function downloadMediaFromTwilio(
  mediaUrl: string,
  twilioConfig: {
    accountSid: string;
    authToken: string;
  }
): Promise<Buffer> {
  try {
    console.log('📥 Téléchargement média depuis:', mediaUrl);

    const response = await fetch(mediaUrl, {
      headers: {
        'Authorization': `Basic ${Buffer.from(`${twilioConfig.accountSid}:${twilioConfig.authToken}`).toString('base64')}`,
      },
    });

    console.log('📥 Réponse Twilio:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Erreur inconnue');
      console.error('❌ Erreur HTTP:', errorText);
      throw new Error(`Erreur téléchargement média: ${response.status} ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    console.log('✅ Média téléchargé:', buffer.length, 'bytes');
    
    if (buffer.length === 0) {
      throw new Error('Le fichier téléchargé est vide');
    }
    
    return buffer;
  } catch (error: any) {
    console.error('❌ Erreur téléchargement média:', error);
    console.error('❌ Détails:', error.message);
    throw new Error(`Impossible de télécharger le fichier: ${error.message || 'Erreur réseau'}`);
  }
}

/**
 * Formate un numéro de téléphone pour WhatsApp
 */
export function formatPhoneNumber(phone: string): string {
  // Supprimer le préfixe whatsapp: s'il existe
  let formatted = phone.replace('whatsapp:', '');
  
  // Ajouter + si absent
  if (!formatted.startsWith('+')) {
    formatted = `+${formatted}`;
  }
  
  return formatted;
}

