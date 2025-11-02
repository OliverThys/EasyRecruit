# Variables d'environnement Railway

## Variables OBLIGATOIRES

Ces variables doivent être configurées dans Railway pour que l'application démarre :

### 1. DATABASE_URL
- **Description**: URL de connexion PostgreSQL
- **Comment l'obtenir**: 
  - Créez un service PostgreSQL dans votre projet Railway
  - Railway crée automatiquement la variable `DATABASE_URL`
  - Ou copiez la valeur depuis l'onglet "Variables" du service PostgreSQL

### 2. JWT_SECRET
- **Description**: Secret pour signer les tokens JWT (minimum 32 caractères)
- **Comment générer**:
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```
- **Exemple**: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6`

### 3. ENCRYPTION_KEY
- **Description**: Clé pour chiffrer les clés API dans la base de données (minimum 32 caractères)
- **Comment générer**: (différente de JWT_SECRET)
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```
- **Exemple**: `z9y8x7w6v5u4t3s2r1q0p9o8n7m6l5k4j3i2h1g0f9e8d7c6b5a4`

### 4. NODE_ENV
- **Valeur**: `production`

## Variables OPTIONNELLES (recommandées)

### PORT
- Railway définit automatiquement cette variable, vous n'avez pas besoin de la configurer
- Si vous voulez la définir manuellement, utilisez un nombre (ex: `4000`)

### FRONTEND_URL
- **Description**: URL de votre frontend
- **Exemple**: `https://votre-app.railway.app` ou votre domaine personnalisé

### REDIS_URL
- **Description**: URL de connexion Redis (optionnel, le serveur fonctionnera sans)
- **Comment l'obtenir**: 
  - Créez un service Redis dans Railway
  - La variable est créée automatiquement

## Variables API (optionnelles - peuvent être configurées par organisation)

Ces variables peuvent être laissées vides et configurées via l'interface de l'application :

- `OPENAI_API_KEY`
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_WHATSAPP_NUMBER`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_S3_BUCKET`
- Variables SMTP (`SMTP_HOST`, `SMTP_PORT`, etc.)

## Comment configurer les variables sur Railway

1. Allez dans votre projet Railway
2. Sélectionnez votre service backend
3. Allez dans l'onglet "Variables"
4. Cliquez sur "New Variable"
5. Ajoutez chaque variable avec sa valeur
6. Redéployez le service

## Vérification

Après configuration, redéployez et vérifiez les logs. Vous devriez voir :
- `🔍 Validating environment variables...`
- `✅ Environment variables validated`
- `🔧 Starting server...`
- `✅ Server running on port XXXX`

Si vous voyez des erreurs, elles indiqueront exactement quelle variable manque ou est invalide.

