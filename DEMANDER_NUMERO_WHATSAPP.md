# 🚀 Demander un Numéro WhatsApp Business (Production)

## ⚠️ Pourquoi c'est nécessaire ?

Le **Sandbox Twilio** ne fonctionne qu'avec des numéros pré-inscrits. Les candidats externes ne peuvent pas l'utiliser.

Pour recevoir des candidatures de **n'importe qui**, il faut un **numéro WhatsApp Business approuvé**.

---

## 📋 Étapes pour obtenir un numéro WhatsApp Business

### 1. Préparer votre compte Meta Business

⚠️ **Important** : Twilio nécessite un compte Meta Business vérifié.

1. Créer un compte sur [business.facebook.com](https://business.facebook.com)
2. Vérifier votre profil Business (peut prendre quelques heures)
3. Ajouter votre entreprise et vos informations

### 2. Demander le numéro dans Twilio

1. **Se connecter à Twilio Console**
   - Aller sur [console.twilio.com](https://console.twilio.com)
   - Se connecter avec votre compte

2. **Aller dans Messaging → Senders**
   - Menu latéral : **Messaging** → **Senders**
   - Cliquer sur **WhatsApp senders**

3. **Demander un nouveau sender**
   - Cliquer sur **"Request a WhatsApp sender"** ou **"Add new"**
   - Remplir le formulaire :
     - **Phone number** : Sélectionner "Request a new phone number"
     - **Display Name** : Nom de votre entreprise (ex: "EasyRecruit Recrutement")
     - **Business verification** : Lier votre compte Meta Business
     - **Category** : Business ou Services
     - **Website** : URL de votre site/application
     - **Description** : Description de votre service de recrutement

4. **Soumission et attente**
   - Cliquer sur **"Submit"**
   - **Délai d'approbation** : 3-14 jours (généralement 5-7 jours)

### 3. Vérifier l'approbation

- Vous recevrez un email de Twilio quand c'est approuvé
- Ou vérifier régulièrement dans **Messaging → Senders → WhatsApp senders**

---

## ✅ Une fois approuvé

### 1. Récupérer le numéro

Dans **Messaging → Senders → WhatsApp senders**, vous verrez :
- Votre nouveau numéro WhatsApp Business (ex: `+1234567890`)
- Le statut : "Approved"

### 2. Mettre à jour `.env`

```env
TWILIO_WHATSAPP_NUMBER=whatsapp:+1234567890
```

Remplacez `+1234567890` par votre numéro réel.

### 3. Tester

Envoyez un message WhatsApp au numéro depuis n'importe quel téléphone. Ça devrait fonctionner **sans** avoir besoin de `join <code>` !

---

## 💰 Coûts

- **Demande de numéro** : Gratuit
- **Coût par message** : ~$0.005-0.01 USD
- **Exemple** : 1000 candidatures = ~$5-10 USD

---

## 🆘 Si la demande est refusée

1. Vérifier que votre compte Meta Business est bien vérifié
2. Ajouter plus de détails dans la description
3. Contacter le support Twilio pour comprendre le refus
4. Envisager **360Dialog** comme alternative (plus simple)

---

## 🔄 Alternative : 360Dialog

Si Twilio prend trop de temps :

1. Créer un compte sur [360dialog.com](https://www.360dialog.com)
2. Obtenir un numéro WhatsApp Business (1-3 jours généralement)
3. Adapter le code (service `whatsapp-360dialog.service.ts` fourni)

---

## ⏱️ Timeline recommandé

- **Maintenant** : Demander le numéro Twilio (5-7 jours d'attente)
- **En parallèle** : Continuer les tests avec le Sandbox
- **Après approbation** : Changer juste `.env` et c'est bon !

---

**Note** : Une fois le numéro approuvé, votre code fonctionne **sans modification** - il suffit de changer `TWILIO_WHATSAPP_NUMBER` dans `.env`.

