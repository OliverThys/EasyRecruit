/**
 * Service WhatsApp alternatif avec 360Dialog
 * À utiliser si vous choisissez 360Dialog au lieu de Twilio
 */

const API_KEY = process.env.DIALOG360_API_KEY || '';
const API_URL = 'https://waba-v2.360dialog.io/v1';

/**
 * Envoie un message WhatsApp via 360Dialog
 */
export async function sendWhatsAppMessage360Dialog(to: string, message: string): Promise<void> {
  try {
    const phoneNumber = to.replace('whatsapp:', '').replace('+', '');
    
    const response = await fetch(`${API_URL}/messages`, {
      method: 'POST',
      headers: {
        'D360-API-KEY': API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        recipient_type: 'individual',
        to: phoneNumber,
        type: 'text',
        text: {
          body: message,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: { message: 'Unknown error' } })) as { error?: { message?: string } };
      throw new Error(`Erreur 360Dialog: ${error.error?.message || response.statusText}`);
    }

    console.log(`✅ Message WhatsApp envoyé via 360Dialog à ${to}`);
  } catch (error) {
    console.error('❌ Erreur envoi WhatsApp 360Dialog:', error);
    throw error;
  }
}

/**
 * Télécharge un média depuis 360Dialog
 */
export async function downloadMediaFrom360Dialog(mediaId: string): Promise<Buffer> {
  try {
    const response = await fetch(`${API_URL}/media/${mediaId}`, {
      headers: {
        'D360-API-KEY': API_KEY,
      },
    });

    if (!response.ok) {
      throw new Error(`Erreur téléchargement média: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (error) {
    console.error('❌ Erreur téléchargement média 360Dialog:', error);
    throw error;
  }
}

