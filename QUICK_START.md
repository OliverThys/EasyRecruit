# 🚀 Démarrage Rapide - EasyRecruit

## ⚡ Commandes Rapides

### 1. Démarrer Docker Desktop
**IMPORTANT** : Ouvrir Docker Desktop avant de continuer !

### 2. Lancer PostgreSQL et Redis
```bash
docker-compose up -d
```

### 3. Créer la base de données
```bash
npx prisma migrate dev --name init
```

### 4. Configurer .env

Créer un fichier `.env` à la racine avec au minimum :

```env
DATABASE_URL=postgresql://easyrecruit:easyrecruit_dev_password@localhost:5432/easyrecruit
REDIS_URL=redis://localhost:6380
PORT=4000
JWT_SECRET=votre-secret-jwt-tres-long-minimum-32-caracteres
OPENAI_API_KEY=sk-votre-cle-openai
TWILIO_ACCOUNT_SID=ACxxxxx
TWILIO_AUTH_TOKEN=votre-token
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
ENCRYPTION_KEY=votre-cle-encryption-32-caracteres-minimum
FRONTEND_URL=http://localhost:3000
```

### 5. Lancer le Backend
```bash
npm run dev
```

### 6. Lancer le Frontend (nouveau terminal)
```bash
cd frontend
npm run dev
```

## 📱 Configuration WhatsApp avec votre numéro (0471034785)

### Option 1 : Twilio Sandbox (Recommandé pour tests)

1. **Créer compte Twilio** : [https://www.twilio.com/try-twilio](https://www.twilio.com/try-twilio)

2. **Activer WhatsApp Sandbox** :
   - Console Twilio → **Messaging** → **Try it out** → **Send a WhatsApp message**
   - Numéro Sandbox : `+1 415 523 8886`
   - Code affiché : ex. `join abc-xyz`

3. **Configurer votre numéro** :
   - Ouvrir WhatsApp sur votre téléphone (0471034785)
   - Envoyer à `+1 415 523 8886` : `join abc-xyz` (remplacer par votre code)
   - Attendre confirmation : "You're all set!"

4. **Récupérer credentials** :
   - Console → **Settings** → **General** → **Account Info**
   - Copier `Account SID` et `Auth Token`

5. **Configurer webhook** (développement local avec ngrok) :
   ```bash
   # Dans un nouveau terminal
   ngrok http 4000
   ```
   - Copier l'URL (ex: `https://abc123.ngrok.io`)
   - Dans Twilio : **Messaging** → **Settings** → **WhatsApp Sandbox Settings**
   - **When a message comes in** : `https://abc123.ngrok.io/api/webhooks/whatsapp`

6. **Mettre à jour .env** :
   ```env
   TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   TWILIO_AUTH_TOKEN=votre_auth_token_ici
   TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
   ```

### Test avec votre numéro

Une fois configuré, quand vous créez une offre et générez le QR code :
1. Le lien WhatsApp contiendra un code (ex: `CODE-ABC123`)
2. Envoyez ce message au numéro Sandbox depuis votre WhatsApp
3. L'agent IA répondra automatiquement !

**Note** : Vous devez renvoyer `join <code>` au Sandbox tous les **24h**.

## ✅ Vérification

- Backend : [http://localhost:4000/health](http://localhost:4000/health)
- Frontend : [http://localhost:3000](http://localhost:3000)

## 🐛 Problèmes Fréquents

### Docker ne démarre pas
→ Vérifier que Docker Desktop est **ouvert et lancé**

### Erreur "Cannot connect to Docker"
→ Redémarrer Docker Desktop

### Backend ne démarre pas
→ Vérifier que `.env` contient `OPENAI_API_KEY` et `ENCRYPTION_KEY` (32+ caractères)

### Frontend erreur 404
→ Vérifier que `frontend/.env.local` contient `NEXT_PUBLIC_API_URL=http://localhost:4000`

