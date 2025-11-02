# Configuration de l'environnement

## 📝 Créer le fichier .env

Créez un fichier `.env` à la racine du projet avec le contenu suivant :

```env
# ==========================================
# DATABASE
# ==========================================
DATABASE_URL=postgresql://easyrecruit:easyrecruit_dev_password@localhost:5432/easyrecruit

# ==========================================
# REDIS (obligatoire pour mapping jobs)
# ==========================================
REDIS_URL=redis://localhost:6380

# ==========================================
# SERVEUR
# ==========================================
PORT=4000
NODE_ENV=development

# ==========================================
# JWT (GÉNÉRER UN SECRET UNIQUE)
# ==========================================
JWT_SECRET=easyrecruit-super-secret-jwt-key-change-in-production-minimum-32-characters
JWT_EXPIRES_IN=7d

# ==========================================
# OPENAI (OBLIGATOIRE - Obtenir sur https://platform.openai.com/api-keys)
# ==========================================
OPENAI_API_KEY=sk-votre-cle-openai-ici

# ==========================================
# WHATSAPP - TWILIO (Voir TWILIO_SETUP.md pour configuration)
# ==========================================
TWILIO_ACCOUNT_SID=ACxxxxx
TWILIO_AUTH_TOKEN=votre-auth-token
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886

# ==========================================
# AWS S3 (OPTIONNEL - Pour stockage CV)
# Laisser vide si pas configuré, les CV ne seront pas stockés mais le système fonctionnera
# ==========================================
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_S3_BUCKET=
AWS_REGION=eu-west-1

# ==========================================
# ENCRYPTION (GÉNÉRER UNE CLÉ UNIQUE DE 32+ CARACTÈRES)
# ==========================================
ENCRYPTION_KEY=easyrecruit-encryption-key-minimum-32-characters-long

# ==========================================
# FRONTEND
# ==========================================
FRONTEND_URL=http://localhost:3000

# ==========================================
# N8N (OPTIONNEL)
# ==========================================
N8N_WEBHOOK_URL=
```

## 🔑 Générer des secrets sécurisés

### JWT_SECRET
Générez un secret aléatoire de 32+ caractères :
```bash
# Sur Windows PowerShell
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 40 | % {[char]$_})
```

### ENCRYPTION_KEY
Générez une clé de chiffrement de 32+ caractères (différente du JWT_SECRET) :
```bash
# Sur Windows PowerShell
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 40 | % {[char]$_})
```

## ⚠️ Variables Obligatoires

Pour que le backend démarre, vous devez absolument définir :

1. ✅ `OPENAI_API_KEY` - Pour l'agent IA et le parsing CV
2. ✅ `JWT_SECRET` - Pour l'authentification (32+ caractères)
3. ✅ `ENCRYPTION_KEY` - Pour chiffrer les numéros (32+ caractères)
4. ✅ `DATABASE_URL` - Pour la base de données
5. ✅ `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_WHATSAPP_NUMBER` - Pour WhatsApp

## 📋 Variables Optionnelles

- `AWS_*` - Si pas configuré, les CV ne seront pas stockés sur S3 (mais le système fonctionnera)
- `REDIS_URL` - Si pas configuré, le mapping jobId ne fonctionnera pas (mais le reste fonctionnera)
- `N8N_WEBHOOK_URL` - Optionnel

## 🔍 Vérification

Après avoir créé `.env`, vérifiez qu'il n'y a pas d'erreurs :

```bash
npm run dev
```

Si vous voyez des erreurs comme "Erreur de configuration environnement", vérifiez que toutes les variables obligatoires sont définies.

