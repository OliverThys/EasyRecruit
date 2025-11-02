# Configuration Twilio WhatsApp pour Tests

## 📱 Utilisation du Sandbox Twilio (Développement)

Pour tester sans numéro WhatsApp Business approuvé, utilisez le **Twilio Sandbox**.

### Étapes de configuration

1. **Créer un compte Twilio** (gratuit)
   - Aller sur [https://www.twilio.com/try-twilio](https://www.twilio.com/try-twilio)
   - Créer un compte gratuit

2. **Activer WhatsApp Sandbox**
   - Dans la console Twilio, aller dans : **Messaging** → **Try it out** → **Send a WhatsApp message**
   - Vous verrez un numéro Sandbox : `whatsapp:+14155238886`
   - Et un code à envoyer : `join <code>`

3. **Configurer votre numéro pour le Sandbox**
   - Ouvrir WhatsApp sur votre téléphone (0471034785)
   - Envoyer un message à : `+1 415 523 8886` (le numéro Sandbox)
   - Message à envoyer : `join <code>` (remplacer `<code>` par le code affiché)
   - Vous recevrez une confirmation : "You're all set!"

4. **Récupérer vos credentials Twilio**
   - Dans la console, aller dans : **Settings** → **General** → **Account Info**
   - Copier :
     - **Account SID** (commence par `AC...`)
     - **Auth Token** (cliquez sur "view" pour le révéler)

5. **Configurer le webhook**
   - Dans : **Messaging** → **Settings** → **WhatsApp Sandbox Settings**
   - **When a message comes in** : 
     ```
     https://votre-domaine.com/api/webhooks/whatsapp
     ```
   - Pour développement local, utiliser **ngrok** :
     ```bash
     ngrok http 4000
     ```
     Utiliser l'URL ngrok (ex: `https://abc123.ngrok.io/api/webhooks/whatsapp`)

6. **Mettre à jour `.env`**
   ```env
   TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   TWILIO_AUTH_TOKEN=votre_auth_token
   TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
   ```

## ✅ Vérification

Une fois configuré, vous pouvez tester :

1. **Envoyer un message depuis votre code** :
   ```bash
   curl -X POST http://localhost:4000/api/webhooks/whatsapp \
     -d "From=whatsapp:+32471034785" \
     -d "Body=CODE-ABC123"
   ```

2. **Depuis WhatsApp** :
   - Envoyez "CODE-ABC123" au numéro Sandbox
   - Votre backend devrait recevoir le message

## 🔄 Limitations du Sandbox

- ⚠️ Vous devez envoyer `join <code>` tous les **24h** pour rester dans le sandbox
- ⚠️ Seul le numéro configuré peut recevoir des messages
- ⚠️ Limité aux tests de développement

## 🚀 Production

Pour la production, il faut :
1. Demander un numéro WhatsApp Business approuvé par Twilio
2. Processus d'approbation peut prendre plusieurs jours
3. Coûts : ~$0.005-0.01 par message

## 💡 Alternative : 360Dialog

Si Twilio est trop restrictif, envisager [360Dialog](https://www.360dialog.com/) :
- Plus simple à configurer
- Numéros WhatsApp Business disponibles plus rapidement
- Tarifs similaires

