# Guide de Migration - EasyRecruit

## Optimisations réalisées

### 1. Optimisation recherche candidat avec hash

**Problème résolu** : La recherche de candidats nécessitait de déchiffrer tous les numéros de téléphone, ce qui était très lent.

**Solution** : Ajout d'un champ `phoneHash` (SHA-256) indexé dans la table `candidates`.

**Changements** :
- Nouveau champ `phoneHash` dans le schéma Prisma
- Index sur `phoneHash` pour recherche rapide
- Fonction `hashPhoneNumber()` dans `utils/encryption.ts`
- Migration automatique du hash lors de la création de candidat

**Migration nécessaire** :
```bash
# 1. Appliquer la migration Prisma
npx prisma migrate dev --name add_phone_hash

# 2. Migrer les données existantes (si nécessaire)
npx tsx src/db/migrate-phone-hash.ts
```

### 2. Détection jobId avec mapping Redis

**Problème résolu** : Les liens WhatsApp contenant des UUID complets étaient trop longs et complexes.

**Solution** : Système de codes courts (6 caractères) stockés dans Redis.

**Changements** :
- Nouveau service `job-mapping.service.ts`
- Codes courts générés automatiquement (ex: `ABC123`)
- Mapping stocké dans Redis avec expiration 90 jours
- Format du lien : `wa.me/number?text=CODE-ABC123`

**Avantages** :
- Liens WhatsApp plus courts et lisibles
- Mapping performant via Redis
- Expiration automatique après 90 jours

### 3. Intégration S3 pour stockage CV

**Problème résolu** : Les CV n'étaient pas stockés de manière persistante.

**Solution** : Upload automatique vers S3/Cloudflare R2 lors de la réception d'un CV.

**Changements** :
- Service `storage.service.ts` avec fonctions S3
- Upload automatique dans `conversation.service.ts`
- Structure : `cvs/{candidateId}/{timestamp}.pdf`
- URL sauvegardée dans `candidate.cvUrl`

**Configuration requise** :
```env
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_S3_BUCKET=easyrecruit-cvs
AWS_REGION=eu-west-1
```

### 4. Frontend Next.js complet

**Pages créées** :
- `/login` - Authentification
- `/dashboard` - Vue d'ensemble
- `/dashboard/jobs/new` - Création d'offre
- `/dashboard/jobs/[id]` - Détails offre + candidats
- `/dashboard/candidates/[id]` - Détails candidat

**Fonctionnalités** :
- Interface moderne avec Tailwind CSS
- Authentification JWT
- Génération QR code
- Liste des candidats avec scores
- Visualisation des conversations WhatsApp
- Gestion statut candidats (accepter/refuser)

## Étapes de déploiement

### Backend

1. **Mettre à jour le schéma Prisma**
   ```bash
   npx prisma generate
   npx prisma migrate dev --name add_phone_hash
   ```

2. **Migrer les données existantes** (si nécessaire)
   ```bash
   npx tsx src/db/migrate-phone-hash.ts
   ```

3. **Vérifier Redis est configuré**
   - La variable `REDIS_URL` doit être définie dans `.env`
   - Redis doit être accessible

4. **Configurer S3** (si pas déjà fait)
   - Créer un bucket S3 ou Cloudflare R2
   - Configurer les credentials dans `.env`

### Frontend

1. **Installer les dépendances**
   ```bash
   cd frontend
   npm install
   ```

2. **Configurer l'API URL**
   ```bash
   cp .env.example .env.local
   # Éditer .env.local avec NEXT_PUBLIC_API_URL
   ```

3. **Lancer en développement**
   ```bash
   npm run dev
   ```

## Vérification

### Backend
- ✅ Recherche candidat optimisée (via hash)
- ✅ Mapping jobId via Redis fonctionnel
- ✅ Upload CV vers S3 opérationnel
- ✅ Génération codes courts automatique

### Frontend
- ✅ Toutes les pages accessibles
- ✅ Authentification fonctionnelle
- ✅ CRUD offres d'emploi
- ✅ Visualisation candidats
- ✅ Génération QR code

## Notes importantes

1. **Migration phoneHash** : Si vous avez déjà des candidats en base, exécuter le script de migration après avoir ajouté le champ.

2. **Redis obligatoire** : Le mapping jobId nécessite Redis. Sans Redis, les codes courts ne fonctionneront pas.

3. **S3 optionnel** : L'upload S3 échouera silencieusement si non configuré, mais les CV ne seront pas stockés.

4. **Sécurité** : Les numéros de téléphone restent chiffrés en base. Le hash est uniquement utilisé pour la recherche rapide.

