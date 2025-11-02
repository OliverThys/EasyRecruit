<div align="center">

# <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/whatsapp/whatsapp-original.svg" width="40" height="40"/> EasyRecruit

### Système de recrutement innovant via WhatsApp avec agent IA conversationnel

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Railway](https://img.shields.io/badge/Railway-0B0D0E?style=for-the-badge&logo=railway&logoColor=white)](https://railway.app/)

**Recrutez vos candidats directement via WhatsApp avec un agent IA intelligent**

[Documentation](#-documentation) • [Démarrage rapide](#-démarrage-rapide) • [Fonctionnalités](#-fonctionnalités) • [Déploiement](#-déploiement)

</div>

---

## 📋 Table des matières

- [✨ Fonctionnalités](#-fonctionnalités)
- [🏗️ Architecture](#️-architecture)
- [🛠️ Stack Technique](#️-stack-technique)
- [🚀 Démarrage rapide](#-démarrage-rapide)
- [⚙️ Configuration](#️-configuration)
- [🌐 Déploiement](#-déploiement)
- [💻 Application Desktop](#-application-desktop)
- [📚 Documentation](#-documentation)
- [🤝 Contribution](#-contribution)

---

## ✨ Fonctionnalités

<div align="center">

| <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/whatsapp/whatsapp-original.svg" width="30" height="30"/> **Recrutement WhatsApp** | <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/python/python-original.svg" width="30" height="30"/> **Agent IA Intelligent** | <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/filezilla/filezilla-plain.svg" width="30" height="30"/> **Parsing CV Automatique** |
|:---:|:---:|:---:|
| Candidatures via WhatsApp | Pré-sélection conversationnelle | PDF, Word, traitement automatique |

| <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/chartjs/chartjs-original.svg" width="30" height="30"/> **Scoring Intelligent** | <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/dashboard/dashboard-plain.svg" width="30" height="30"/> **Dashboard Moderne** | <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/qrcode/qrcode-plain.svg" width="30" height="30"/> **QR Codes** |
|:---:|:---:|:---:|
| Évaluation automatique | Interface intuitive | Candidatures rapides |

| <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/docker/docker-original.svg" width="30" height="30"/> **Multi-tenant** | <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/amazonwebservices/amazonwebservices-original.svg" width="30" height="30"/> **Stockage Cloud** | <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/lock/lock-solid.svg" width="30" height="30"/> **RGPD Compliant** |
|:---:|:---:|:---:|
| Architecture multi-organisations | S3/R2 pour CV | Chiffrement des données |

</div>

---

## 🏗️ Architecture

<div align="center">

```mermaid
graph TB
    A[Candidat WhatsApp] -->|Message| B[Twilio Webhook]
    B --> C[Backend API]
    C --> D[Agent IA OpenAI]
    C --> E[Base de données PostgreSQL]
    C --> F[Cache Redis]
    C --> G[Storage S3]
    H[Dashboard Web] --> C
    I[Email Service] --> C
```

</div>

### 🏢 Architecture Multi-tenant

- **Organisations** : Chaque entreprise a son propre espace isolé
- **Rôles** : OWNER, ADMIN, MEMBER avec permissions granulaires
- **API Keys** : Configuration par organisation (OpenAI, Twilio, AWS)
- **Invitations** : Système d'invitation par email pour les membres

---

## 🛠️ Stack Technique

<div align="center">

### Backend
<img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/nodejs/nodejs-original.svg" width="40" height="40"/> <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/typescript/typescript-original.svg" width="40" height="40"/> <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/express/express-original.svg" width="40" height="40"/> <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/prisma/prisma-original.svg" width="40" height="40"/>

### Base de données
<img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/postgresql/postgresql-original.svg" width="40" height="40"/> <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/redis/redis-original.svg" width="40" height="40"/>

### Frontend
<img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/nextjs/nextjs-original.svg" width="40" height="40"/> <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/react/react-original.svg" width="40" height="40"/> <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/tailwindcss/tailwindcss-original.svg" width="40" height="40"/>

### IA & Services
<img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/openai/openai-original.svg" width="40" height="40"/> <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/amazonwebservices/amazonwebservices-original.svg" width="40" height="40"/>

</div>

| Catégorie | Technologies |
|-----------|-------------|
| **Backend** | Node.js 18+, Express, TypeScript, Prisma ORM |
| **Base de données** | PostgreSQL, Redis |
| **Frontend** | Next.js 14, React 18, Tailwind CSS |
| **IA** | OpenAI GPT-4, LangChain |
| **Communication** | Twilio WhatsApp Business API |
| **Storage** | AWS S3 / Cloudflare R2 (optionnel) |
| **Email** | SMTP (Nodemailer) |
| **Desktop** | Electron, Electron Builder |

---

## 🚀 Démarrage rapide

### 📋 Prérequis

<div align="left">

- <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/nodejs/nodejs-original.svg" width="20" height="20"/> Node.js 18+
- <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/docker/docker-original.svg" width="20" height="20"/> Docker Desktop
- <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/git/git-original.svg" width="20" height="20"/> Git

</div>

### 📦 Installation

```bash
# 1. Cloner le repository
git clone https://github.com/OliverThys/EasyRecruit.git
cd EasyRecruit

# 2. Installer les dépendances
npm install
cd frontend && npm install && cd ..

# 3. Démarrer Docker (PostgreSQL + Redis)
docker-compose up -d

# 4. Configurer l'environnement
cp .env.example .env
# Éditer .env avec vos clés API (voir SETUP_ENV.md)

# 5. Initialiser la base de données
npx prisma migrate dev
npx prisma generate

# 6. Lancer le backend (terminal 1)
npm run dev

# 7. Lancer le frontend (terminal 2)
cd frontend
npm run dev
```

### 🌐 Accès

<div align="center">

| Service | URL |
|---------|-----|
| <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/react/react-original.svg" width="20" height="20"/> **Frontend** | http://localhost:3000 |
| <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/nodejs/nodejs-original.svg" width="20" height="20"/> **Backend API** | http://localhost:4000 |
| <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/postgresql/postgresql-original.svg" width="20" height="20"/> **PostgreSQL** | localhost:5432 |
| <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/redis/redis-original.svg" width="20" height="20"/> **Redis** | localhost:6380 |

</div>

---

## ⚙️ Configuration

### 🔑 Variables d'environnement essentielles

Créer un fichier `.env` à la racine :

```env
# Base de données
DATABASE_URL=postgresql://user:password@localhost:5432/easyrecruit
REDIS_URL=redis://localhost:6380

# Serveur
PORT=4000
NODE_ENV=development

# Sécurité (générer avec: node scripts/generate-secrets.js)
JWT_SECRET=votre-secret-jwt-minimum-32-caracteres
ENCRYPTION_KEY=votre-cle-chiffrement-minimum-32-caracteres

# OpenAI (obligatoire pour l'agent IA)
OPENAI_API_KEY=sk-votre-cle-openai

# Twilio WhatsApp (voir TWILIO_SETUP.md)
TWILIO_ACCOUNT_SID=ACxxxxx
TWILIO_AUTH_TOKEN=votre-token
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886

# AWS S3 (optionnel - pour stocker les CV)
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_S3_BUCKET=
AWS_REGION=eu-west-1

# Email (optionnel - pour reset mot de passe et invitations)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=votre-email@gmail.com
SMTP_PASS=votre-mot-de-passe-app
SMTP_FROM=noreply@votre-domaine.com
```

📖 **Guide complet** : [SETUP_ENV.md](SETUP_ENV.md)

---

## 🌐 Déploiement

### 🚂 Railway (Recommandé)

<div align="center">

<img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/railway/railway-original.svg" width="100" height="100"/>

</div>

1. **Créer un compte** sur [Railway.app](https://railway.app)
2. **Créer un nouveau projet** depuis GitHub
3. **Ajouter les services** :
   - PostgreSQL (automatique)
   - Backend (depuis le Dockerfile)
   - Frontend (optionnel, séparé)

4. **Configurer les variables d'environnement**

📖 **Guide détaillé** : [RAILWAY_SETUP_GUIDE.md](RAILWAY_SETUP_GUIDE.md)

### 🐳 Docker

```bash
# Build et run avec Docker Compose
docker-compose -f docker-compose.prod.yml up -d
```

### ☁️ Autres plateformes

- **Vercel** : Pour le frontend Next.js
- **DigitalOcean** : App Platform ou Droplets
- **AWS** : ECS, EC2, ou Elastic Beanstalk

📖 **Guide complet** : [RAILWAY_ENV_VARS.md](RAILWAY_ENV_VARS.md)

---

## 💻 Application Desktop

<div align="center">

<img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/electron/electron-original.svg" width="60" height="60"/>

</div>

EasyRecruit est disponible en **application desktop Windows** avec :

- ✅ Installateur automatique (`EasyRecruit-Installer.exe`)
- ✅ Installation des dépendances (Node.js, Docker)
- ✅ Écran de chargement pendant l'installation
- ✅ Mise à jour automatique via GitHub Releases
- ✅ Lancement simple avec `EasyRecruit.exe`

### 🏗️ Créer l'installer

```bash
# Build l'application desktop
npm run dist

# L'installer sera généré dans dist/
```

📖 **Guide complet** : Consultez les guides de déploiement

---

## 📚 Documentation

<div align="center">

### 📖 Guides principaux

| Guide | Description |
|-------|-------------|
| [🚀 QUICK_START.md](QUICK_START.md) | Démarrage rapide en développement |
| [⚙️ SETUP_ENV.md](SETUP_ENV.md) | Configuration des variables d'environnement |
| [📱 TWILIO_SETUP.md](TWILIO_SETUP.md) | Configuration WhatsApp Business |
| [🤖 CONFIGURATION_OPENAI.md](CONFIGURATION_OPENAI.md) | Configuration OpenAI API |

### 🌐 Déploiement

| Guide | Description |
|-------|-------------|
| [🚂 RAILWAY_SETUP_GUIDE.md](RAILWAY_SETUP_GUIDE.md) | Guide complet Railway |
| [🔧 RAILWAY_ENV_VARS.md](RAILWAY_ENV_VARS.md) | Variables d'environnement Railway |
| [✅ PRODUCTION_CHECKLIST.md](PRODUCTION_CHECKLIST.md) | Checklist avant production |

</div>

---

## 🏢 Architecture Multi-tenant

<div align="center">

<img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/docker/docker-original.svg" width="40" height="40"/> **Organisations isolées** <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/docker/docker-original.svg" width="40" height="40"/>

</div>

- **Multi-organisations** : Plusieurs entreprises sur la même instance
- **Isolation des données** : Chaque organisation voit uniquement ses données
- **Gestion des membres** : Invitations par email, rôles (OWNER, ADMIN, MEMBER)
- **Configuration par organisation** : Chaque entreprise configure ses propres clés API
- **Système d'invitations** : Invitez vos collaborateurs facilement

### 👥 Rôles

| Rôle | Permissions |
|------|-------------|
| **OWNER** | Toutes les permissions, gestion de l'organisation |
| **ADMIN** | Gestion des offres, candidats, invitations |
| **MEMBER** | Consultation des offres et candidats |

---

## 📊 Fonctionnalités avancées

<div align="center">

### 🤖 Agent IA Conversationnel

- Dialogue naturel en français
- Pré-sélection automatique des candidats
- Évaluation selon les critères essentiels
- Questions contextuelles intelligentes

### 📄 Parsing CV

- Support PDF et Word (.docx)
- Extraction automatique des informations
- Analyse des compétences et expériences

### 📈 Scoring

- Évaluation objective selon les critères
- Score détaillé par critère
- Classement automatique des candidats

### 🔐 Sécurité

- Chiffrement AES-256 des données sensibles
- Tokens JWT pour l'authentification
- Rate limiting pour protéger les APIs
- Conformité RGPD

</div>

---

## 🤝 Contribution

Les contributions sont les bienvenues ! Pour contribuer :

1. **Fork** le projet
2. Créez une **branch** pour votre fonctionnalité (`git checkout -b feature/AmazingFeature`)
3. **Commit** vos changements (`git commit -m 'Add some AmazingFeature'`)
4. **Push** vers la branch (`git push origin feature/AmazingFeature`)
5. Ouvrez une **Pull Request**

---

## 📄 Licence

Ce projet est sous licence **MIT**. Voir le fichier [LICENSE.txt](LICENSE.txt) pour plus de détails.

---

## 👨‍💻 Auteur

<div align="center">

**Maolys**

<img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/github/github-original.svg" width="20" height="20"/> [@OliverThys](https://github.com/OliverThys)

</div>

---

<div align="center">

### ⭐ Si ce projet vous aide, n'hésitez pas à lui donner une étoile !

<img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/github/github-original.svg" width="20" height="20"/> [GitHub](https://github.com/OliverThys/EasyRecruit)

Made with <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/javascript/javascript-original.svg" width="15" height="15"/> and ❤️

</div>
