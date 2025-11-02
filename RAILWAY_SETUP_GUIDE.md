# Guide de configuration Railway - Étape par étape

## 📋 Étape 1 : Accéder à votre projet Railway

1. Allez sur [railway.app](https://railway.app)
2. Connectez-vous à votre compte
3. Sélectionnez votre projet (ou créez-en un nouveau si nécessaire)

## 📋 Étape 2 : Accéder au service backend

1. Dans votre projet Railway, vous verrez vos services listés
2. Cliquez sur le service **backend** (celui qui contient votre application Node.js)
   - Il peut s'appeler "web", "backend", "api" ou le nom que vous avez donné

## 📋 Étape 3 : Ouvrir l'onglet Variables

1. Une fois dans le service backend, vous verrez plusieurs onglets en haut :
   - **Deployments** (déploiements)
   - **Metrics** (métriques)
   - **Settings** (paramètres)
   - **Variables** ← **CLIQUEZ ICI**

2. Vous verrez la liste des variables d'environnement actuelles

## 📋 Étape 4 : Générer les secrets (sur votre machine locale)

Avant d'ajouter les variables, générez les secrets nécessaires :

```bash
# Exécutez cette commande dans votre terminal local (dans le dossier du projet)
node scripts/generate-secrets.js
```

Cela vous donnera deux valeurs à copier :
- `JWT_SECRET=...`
- `ENCRYPTION_KEY=...`

**OU** générez-les manuellement :

```bash
# Pour JWT_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Pour ENCRYPTION_KEY (exécutez à nouveau pour avoir une valeur différente)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 📋 Étape 5 : Ajouter les variables obligatoires

Dans l'onglet Variables de Railway, cliquez sur **"+ New Variable"** pour chaque variable :

### Variable 1 : DATABASE_URL

1. **Nom de la variable** : `DATABASE_URL`
2. **Valeur** :
   - Si vous avez déjà créé un service PostgreSQL :
     - Allez dans le service PostgreSQL
     - Onglet "Variables"
     - Copiez la valeur de `DATABASE_URL` ou `POSTGRES_URL`
     - Collez-la dans votre service backend
   - Si vous n'avez pas de PostgreSQL :
     - Créez un nouveau service : cliquez sur "+ New" → "Database" → "Add PostgreSQL"
     - Railway créera automatiquement `DATABASE_URL`
     - **Liez le service PostgreSQL au backend** :
       - Dans le service backend → Settings → Variables
       - Railway devrait détecter automatiquement la variable du PostgreSQL
       - Ou copiez `DATABASE_URL` depuis le service PostgreSQL

### Variable 2 : JWT_SECRET

1. **Nom de la variable** : `JWT_SECRET`
2. **Valeur** : Collez la valeur générée à l'étape 4
   - Exemple : `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2`
   - Doit faire au moins 32 caractères (64 caractères hex recommandé)

### Variable 3 : ENCRYPTION_KEY

1. **Nom de la variable** : `ENCRYPTION_KEY`
2. **Valeur** : Collez la deuxième valeur générée à l'étape 4
   - Doit être différente de JWT_SECRET
   - Doit faire au moins 32 caractères (64 caractères hex recommandé)

### Variable 4 : NODE_ENV

1. **Nom de la variable** : `NODE_ENV`
2. **Valeur** : `production`

### Variable 5 : PORT (optionnel - généralement automatique)

Railway définit généralement `PORT` automatiquement. Si ce n'est pas le cas :
1. **Nom de la variable** : `PORT`
2. **Valeur** : Le port fourni par Railway (généralement visible dans les Settings)

## 📋 Étape 6 : Variables optionnelles (recommandées)

### FRONTEND_URL

1. **Nom de la variable** : `FRONTEND_URL`
2. **Valeur** : L'URL de votre frontend
   - Si vous utilisez Railway : `https://votre-service-frontend.railway.app`
   - Ou votre domaine personnalisé : `https://votre-domaine.com`

### REDIS_URL (optionnel)

Si vous utilisez Redis :
1. Créez un service Redis : "+ New" → "Database" → "Add Redis"
2. Railway créera automatiquement `REDIS_URL`
3. Liez-le au backend de la même manière que PostgreSQL

## 📋 Étape 7 : Redéployer

Après avoir ajouté toutes les variables :

1. Railway devrait redéployer automatiquement
2. Sinon, allez dans l'onglet **"Deployments"**
3. Cliquez sur les **"..."** du dernier déploiement
4. Cliquez sur **"Redeploy"**

## 📋 Étape 8 : Vérifier les logs

1. Allez dans l'onglet **"Deployments"**
2. Cliquez sur le dernier déploiement
3. Allez dans **"Logs"** ou **"Runtime"**
4. Vous devriez voir :
   - `🔍 Validating environment variables...`
   - `✅ Environment variables validated`
   - `🔧 Starting server...`
   - `✅ Server running on port XXXX`

Si vous voyez des erreurs ❌, elles indiqueront exactement quelle variable manque.

## 🔍 Vérification rapide

Vos variables devraient ressembler à ceci :

```
✅ DATABASE_URL = postgresql://...
✅ JWT_SECRET = [64 caractères hex]
✅ ENCRYPTION_KEY = [64 caractères hex]
✅ NODE_ENV = production
✅ PORT = [automatique ou nombre]
✅ FRONTEND_URL = https://...
```

## ❓ Problèmes courants

### "Variable not found"
- Vérifiez que vous avez bien cliqué sur "Add" après avoir entré la variable
- Vérifiez l'orthographe exacte (sensible à la casse)

### "Invalid value"
- JWT_SECRET et ENCRYPTION_KEY doivent faire au moins 32 caractères
- NODE_ENV doit être exactement `production` (en minuscules)

### "Database connection failed"
- Vérifiez que le service PostgreSQL est bien démarré
- Vérifiez que DATABASE_URL est bien copié depuis le service PostgreSQL
- Vérifiez que les services sont bien liés dans le même projet Railway

### Les logs ne s'affichent pas
- Attendez quelques secondes après le redéploiement
- Rafraîchissez la page
- Vérifiez l'onglet "Runtime" au lieu de "Build"

