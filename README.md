# EasyRecruit - Système de Recrutement via WhatsApp

Système innovant de recrutement où les candidats postulent via WhatsApp et sont présélectionnés par un agent IA conversationnel.

## 🚀 Démarrage Rapide

### 1. Prérequis
- Node.js 18+
- Docker Desktop (pour PostgreSQL et Redis)
- Compte Twilio (pour WhatsApp)
- Clé API OpenAI

### 2. Installation

```bash
# Cloner et installer les dépendances
npm install
cd frontend && npm install && cd ..

# Démarrer Docker
docker-compose up -d

# Configurer l'environnement (voir SETUP_ENV.md)
# Créer .env avec les variables nécessaires

# Initialiser la base de données
npx prisma migrate dev

# Lancer le backend
npm run dev

# Dans un autre terminal, lancer le frontend
cd frontend
npm run dev
```

### 3. Accès
- **Backend** : http://localhost:4000
- **Frontend** : http://localhost:3000

## 📚 Documentation

### Développement
- **[QUICK_START.md](QUICK_START.md)** - Guide de démarrage rapide
- **[SETUP_ENV.md](SETUP_ENV.md)** - Configuration des variables d'environnement
- **[TWILIO_SETUP.md](TWILIO_SETUP.md)** - Configuration WhatsApp (Twilio Sandbox)
- **[CONFIGURATION_OPENAI.md](CONFIGURATION_OPENAI.md)** - Configuration OpenAI

### Production
- **[DEPLOYMENT_QUICK.md](DEPLOYMENT_QUICK.md)** - 🚀 Guide de déploiement rapide (5 minutes)
- **[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)** - Guide complet de déploiement (Railway, Vercel, DigitalOcean)
- **[DEMANDER_NUMERO_WHATSAPP.md](DEMANDER_NUMERO_WHATSAPP.md)** - Obtenir un numéro WhatsApp Business pour la production

### Migration
- **[MIGRATE_TO_EASYRECRUIT.md](MIGRATE_TO_EASYRECRUIT.md)** - Migration depuis l'ancien nom

## 🛠️ Technologies

- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL + Prisma ORM
- **Cache**: Redis (pour mapping jobs)
- **IA**: OpenAI GPT-4 + LangChain
- **WhatsApp**: Twilio Business API
- **Storage**: AWS S3 / Cloudflare R2 (optionnel)
- **Frontend**: Next.js 14 + React + TypeScript + Tailwind CSS

## ✨ Fonctionnalités

- ✅ Recrutement via WhatsApp
- ✅ Agent IA conversationnel pour pré-sélection
- ✅ Parsing automatique des CV (PDF/Word)
- ✅ Scoring intelligent des candidats
- ✅ Dashboard employeur moderne
- ✅ QR codes pour candidatures
- ✅ Chiffrement des données personnelles (RGPD)
- ✅ Stockage S3 des CV (optionnel)

## 📖 Guides

- **Développement Web** : Consultez [QUICK_START.md](QUICK_START.md)
- **Application Desktop** : Consultez [QUICK_START_DESKTOP.md](QUICK_START_DESKTOP.md) (installateur Windows)
- **Déploiement Production** : Consultez [DEPLOYMENT_QUICK.md](DEPLOYMENT_QUICK.md) (5 minutes) ou [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) (guide complet)

## 🖥️ Application Desktop Windows

EasyRecruit est disponible en **application desktop Windows** avec :
- ✅ Installateur automatique (`EasyRecruit-Installer.exe`)
- ✅ Installation des dépendances (Node.js, Docker)
- ✅ Écran de chargement pendant l'installation
- ✅ Mise à jour automatique
- ✅ Lancement simple avec `EasyRecruit.exe`

**Voir** : [DESKTOP_APP_GUIDE.md](DESKTOP_APP_GUIDE.md) pour créer l'installateur
