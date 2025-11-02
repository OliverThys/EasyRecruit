# Configuration OpenAI API Key

## 🔑 Obtenir votre clé API OpenAI

1. Allez sur https://platform.openai.com/api-keys
2. Connectez-vous ou créez un compte
3. Cliquez sur "Create new secret key"
4. Copiez la clé (elle commence par `sk-` et ressemble à `sk-proj-...`)
5. ⚠️ **Important** : Copiez-la immédiatement, vous ne pourrez plus la voir après !

## 📝 Mettre à jour le .env

Ouvrez le fichier `.env` à la racine du projet et remplacez :
```env
OPENAI_API_KEY=sk-placeholder
```

Par votre vraie clé :
```env
OPENAI_API_KEY=sk-proj-votre-cle-ici
```

## 🔄 Redémarrer le backend

Après avoir mis à jour le `.env`, redémarrez le backend :
1. Dans la fenêtre PowerShell du backend, appuyez sur `Ctrl+C`
2. Relancez : `npm run dev`

## ✅ Tester

Une fois configuré, envoyez à nouveau le code `CODE-0DF7E2` (ou un nouveau code depuis le dashboard) au numéro Sandbox Twilio depuis WhatsApp, et l'agent IA devrait répondre !

