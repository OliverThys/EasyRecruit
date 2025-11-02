# 🚀 Préparation au Déploiement - EasyRecruit

## ✅ Secrets Générés

Les secrets suivants ont été générés pour la production :

### JWT_SECRET
```
7ff3cbd94922d3ea97cb17d39c96b71f6cc0a846b9181b658ab91288bee818c6
```

### ENCRYPTION_KEY
```
b1a0e5120fa71d8ff79baee76e43cc1ebf567f8d2d8da2ee269db0cb9cae9e1e
```

⚠️ **IMPORTANT** : Sauvegardez ces secrets dans un gestionnaire de mots de passe sécurisé !

## 📋 Configuration Production

### 1. Créer le fichier .env de production

Sur votre serveur de production, créez un fichier `.env` avec le contenu suivant :

```env
# ==========================================
# EASYRECRUIT - Configuration Production
# ==========================================
NODE_ENV=production
PORT=4000

# ==========================================
# DATABASE (PostgreSQL Production)
# ==========================================
# Remplacez par votre URL de base de données de production
DATABASE_URL=postgresql://user:password@host:port/database

# ==========================================
# REDIS (Production)
# ==========================================
# Remplacez par votre URL Redis de production (ou laissez vide)
REDIS_URL=redis://host:port

# ==========================================
# JWT (SECRETS - Générés pour vous)
# ==========================================
JWT_SECRET=7ff3cbd94922d3ea97cb17d39c96b71f6cc0a846b9181b658ab91288bee818c6
JWT_EXPIRES_IN=7d

# ==========================================
# ENCRYPTION (SECRET - Généré pour vous)
# ==========================================
ENCRYPTION_KEY=b1a0e5120fa71d8ff79baee76e43cc1ebf567f8d2d8da2ee269db0cb9cae9e1e

# ==========================================
# FRONTEND (URL de production)
# ==========================================
# Remplacez par votre domaine de production
FRONTEND_URL=https://votre-domaine.com

# ==========================================
# CLÉS API (Optionnel - peuvent être configurées via l'interface)
# ==========================================
# Ces clés peuvent être configurées via /dashboard/settings
# Laisser vide si chaque client configure ses propres clés
OPENAI_API_KEY=
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_WHATSAPP_NUMBER=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_S3_BUCKET=
AWS_REGION=eu-west-1
N8N_WEBHOOK_URL=
```

### 2. Variables à Configurer

#### OBLIGATOIRES
- ✅ `DATABASE_URL` - URL de votre base PostgreSQL de production
- ✅ `REDIS_URL` - URL de votre Redis de production (ou laisser vide si non utilisé)
- ✅ `FRONTEND_URL` - Domaine de votre frontend (ex: https://easyrecruit.com)

#### OPTIONNELLES
- Les clés API (OpenAI, Twilio, AWS) peuvent être laissées vides dans `.env`
- Chaque organisation les configurera via `/dashboard/settings`

### 3. Déploiement

#### Backend

```bash
# Build
npm run build

# Migrations
npx prisma migrate deploy

# Démarrage
npm start
```

#### Frontend

```bash
cd frontend
npm run build
npm start
```

### 4. Vérifications Post-Déploiement

- [ ] Tester `/health` endpoint
- [ ] Tester l'inscription (création d'organisation)
- [ ] Tester la connexion
- [ ] Vérifier les logs pour erreurs
- [ ] Tester la configuration API via `/dashboard/settings`

## 🔐 Sécurité

- ✅ Rate limiting activé
- ✅ Helmet.js configuré
- ✅ CORS restreint à FRONTEND_URL
- ✅ Secrets générés aléatoirement
- ✅ Clés API chiffrées en base de données

## 📝 Notes

1. **Secrets** : Ne changez PAS les secrets après le premier déploiement, cela invalidera toutes les sessions
2. **Clés API** : Les clients configurent leurs propres clés via l'interface
3. **Organisations** : Chaque client = une organisation isolée
4. **Backups** : Configurez des backups automatiques de la base de données

