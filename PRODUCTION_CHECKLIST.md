# ✅ Checklist Production - EasyRecruit

## 🔒 Sécurité

- ✅ **Helmet.js** - Headers de sécurité configurés
- ✅ **CORS** - Restrictions par origine (FRONTEND_URL)
- ✅ **Rate Limiting** - Protection contre les attaques
  - Général : 100 req/15min (production)
  - Auth : 5 tentatives/15min (anti brute-force)
  - Webhooks : 100 req/min
- ✅ **JWT** - Authentification avec tokens sécurisés
- ✅ **Chiffrement** - Clés API chiffrées en base (AES-256)
- ✅ **Validation** - Zod pour validation des entrées
- ✅ **Limite taille requêtes** - 10MB max

## 🗄️ Base de données

- ✅ **Migrations Prisma** - Système de migration en place
- ✅ **Organisations** - Architecture multi-tenant
- ✅ **Indexation** - Index pour performances (phoneHash, organizationId)
- ⚠️ **Backup** - À configurer selon votre hébergeur
- ⚠️ **Connexions pool** - Vérifier configuration Prisma si haute charge

## 🔐 Configuration Environnement

### Variables OBLIGATOIRES en production :

```env
NODE_ENV=production
DATABASE_URL=postgresql://user:password@host:port/database
REDIS_URL=redis://host:port
JWT_SECRET=<générer un secret unique de 32+ caractères>
ENCRYPTION_KEY=<générer une clé unique de 32+ caractères>
FRONTEND_URL=https://votre-domaine.com
```

### Variables OPTIONNELLES (clés API client) :

Ces clés peuvent être configurées via l'interface `/dashboard/settings` :

```env
OPENAI_API_KEY=sk-... (ou via UI)
TWILIO_ACCOUNT_SID=... (ou via UI)
TWILIO_AUTH_TOKEN=... (ou via UI)
TWILIO_WHATSAPP_NUMBER=... (ou via UI)
AWS_ACCESS_KEY_ID=... (ou via UI - optionnel)
AWS_SECRET_ACCESS_KEY=... (ou via UI - optionnel)
AWS_S3_BUCKET=... (ou via UI - optionnel)
```

## 📊 Monitoring & Logs

- ✅ **Health Check** - `/health` endpoint
- ✅ **Error Logging** - Erreurs 500+ loggées en production
- ⚠️ **Logging structuré** - À améliorer (Winston, Pino recommandé)
- ⚠️ **Monitoring** - À configurer (Sentry, DataDog, etc.)

## 🚀 Déploiement

### Backend

1. **Build** : `npm run build`
2. **Migrations** : `npx prisma migrate deploy`
3. **Démarrage** : `npm start` (utilise `dist/server.js`)

### Frontend

1. **Build** : `cd frontend && npm run build`
2. **Démarrage** : `npm start` (Next.js standalone)

### Docker

- ✅ **Dockerfile** présent
- ✅ **docker-compose.yml** pour développement

## 🔧 Configuration Production Recommandée

### PostgreSQL

- Pool de connexions : `connection_limit` dans Prisma
- Backup automatique quotidien
- SSL activé en production

### Redis

- Persistence activée (AOF ou RDB)
- Monitoring de la mémoire

### Variables d'environnement

✅ **SECRETS GÉNÉRÉS** : Des secrets uniques ont été générés pour vous !

```bash
# Pour générer de nouveaux secrets (si nécessaire)
node scripts/generate-secrets.js
```

**Secrets générés pour la production :**
- `JWT_SECRET`: `7ff3cbd94922d3ea97cb17d39c96b71f6cc0a846b9181b658ab91288bee818c6`
- `ENCRYPTION_KEY`: `b1a0e5120fa71d8ff79baee76e43cc1ebf567f8d2d8da2ee269db0cb9cae9e1e`

⚠️ **Copiez ces valeurs dans votre fichier `.env` de production !**

## 📝 Checklist Pré-Déploiement

- [x] ✅ Générer `JWT_SECRET` unique (FAIT)
- [x] ✅ Générer `ENCRYPTION_KEY` unique (FAIT)
- [ ] Configurer `DATABASE_URL` (production)
- [ ] Configurer `REDIS_URL` (production)
- [ ] Configurer `FRONTEND_URL` (domaine production)
- [ ] Tester les migrations : `npx prisma migrate deploy`
- [ ] Vérifier les health checks
- [ ] Tester l'authentification
- [ ] Configurer HTTPS/SSL (côté serveur web)
- [ ] Configurer les backups de base de données
- [ ] Tester le système d'organisations
- [ ] Vérifier le rate limiting
- [ ] Tester les webhooks Twilio

## 🎯 Post-Déploiement

- [ ] Vérifier les logs pour erreurs
- [ ] Monitorer les performances
- [ ] Configurer alertes (erreurs, downtime)
- [ ] Documenter les procédures de backup/restore
- [ ] Tester la récupération après panne

## ⚠️ Notes Importantes

1. **Clés API** : Chaque client configure ses propres clés via `/dashboard/settings`
2. **Organisations** : Chaque client = une organisation avec ses propres clés
3. **Chiffrement** : Les clés API sont chiffrées en base (AES-256)
4. **Rate Limiting** : Configuré pour protéger contre les abus
5. **Backups** : À configurer selon votre stratégie de backup

## 🐛 En cas de problème

- Vérifier les logs du serveur
- Vérifier la connexion à la base de données
- Vérifier Redis (si utilisé)
- Vérifier les variables d'environnement
- Tester `/health` endpoint

