# Changelog - EasyRecruit

## [1.0.0] - Optimisations et Frontend Complet

### ✨ Nouvelles fonctionnalités

#### Backend
- ✅ **Optimisation recherche candidat** : Ajout d'un hash SHA-256 indexé pour recherche rapide
- ✅ **Mapping jobId Redis** : Système de codes courts (6 caractères) pour liens WhatsApp
- ✅ **Intégration S3** : Upload automatique des CV vers S3/Cloudflare R2
- ✅ **Service de mapping** : Gestion des codes courts avec expiration automatique

#### Frontend
- ✅ **Dashboard complet** : Vue d'ensemble avec statistiques
- ✅ **Gestion offres** : Création, modification, suppression d'offres
- ✅ **Visualisation candidats** : Liste triée par score, détails complets
- ✅ **Conversations** : Affichage des échanges WhatsApp
- ✅ **QR Code** : Génération et affichage des QR codes pour candidatures

### 🔧 Améliorations techniques

#### Performance
- Recherche candidat optimisée (O(1) au lieu de O(n))
- Index sur `phoneHash` et `[jobId, phoneHash]`
- Mapping Redis pour codes courts (accès ultra-rapide)

#### Sécurité
- Hash SHA-256 pour recherche (non réversible)
- Chiffrement conservé pour numéros de téléphone
- Validation des données avec Zod

#### Architecture
- Services modulaires et réutilisables
- Séparation claire frontend/backend
- TypeScript strict mode

### 📝 Migrations nécessaires

1. **Schema Prisma** : Ajout champ `phoneHash`
   ```bash
   npx prisma migrate dev --name add_phone_hash
   ```

2. **Données existantes** : Migration des candidats existants
   ```bash
   npx tsx src/db/migrate-phone-hash.ts
   ```

### 🐛 Corrections

- Correction de la recherche de candidats (plus de déchiffrement systématique)
- Amélioration de la gestion des erreurs dans les webhooks
- Fix de la génération des liens WhatsApp

### 📚 Documentation

- Guide de migration complet (`MIGRATION_GUIDE.md`)
- README frontend (`frontend/README.md`)
- Script de migration de données (`src/db/migrate-phone-hash.ts`)

### 🔄 Configuration requise

#### Backend
- Redis (obligatoire pour mapping jobId)
- S3 ou Cloudflare R2 (pour stockage CV)
- PostgreSQL avec Prisma

#### Frontend
- Next.js 14
- Node.js 18+

### 📦 Dépendances ajoutées

#### Backend
- `@aws-sdk/client-s3` : Gestion S3
- Fonction hash dans `utils/encryption.ts`

#### Frontend
- `@radix-ui/*` : Composants UI
- `lucide-react` : Icônes
- `tailwindcss` : Styling
- `next` 14 : Framework React

---

## [0.1.0] - Version Initiale

### Fonctionnalités de base
- Authentification JWT
- CRUD offres d'emploi
- Agent IA conversationnel
- Parsing CV avec GPT-4
- Scoring automatique
- Webhooks WhatsApp (Twilio)
- API REST complète

