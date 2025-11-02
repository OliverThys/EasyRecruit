# 📱 Instructions pour tester EasyRecruit (Sandbox Twilio)

## Pour votre associé : Étapes à suivre

### 1. Obtenir le code du Sandbox

**Depuis la console Twilio** (vous devez le lui donner) :

1. Aller sur [console.twilio.com](https://console.twilio.com)
2. **Messaging** → **Try it out** → **Send a WhatsApp message**
3. Vous verrez un message comme :
   ```
   Send a WhatsApp message
   
   Join code: abc-xyz
   
   Send join abc-xyz to +1 415 523 8886
   ```

4. **Notez le code** (ex: `abc-xyz`)

---

### 2. Rejoindre le Sandbox depuis WhatsApp

**Sur son téléphone** (numéro +32472201535) :

1. Ouvrir WhatsApp
2. Nouveau message → Envoyer à : **+1 415 523 8886**
3. Envoyer le message : `join abc-xyz` (remplacer `abc-xyz` par le vrai code)
4. Attendre la confirmation : **"You're all set!"**

✅ **Maintenant il peut recevoir des messages du Sandbox !**

---

### 3. Tester la candidature

Une fois inscrit, il peut tester :

1. **Vous lui envoyez le QR code ou le lien WhatsApp** d'une offre d'emploi
2. Il clique sur le lien (ouvre WhatsApp avec un code, ex: `CODE-ABC123`)
3. Il envoie ce code au numéro Sandbox (`+1 415 523 8886`)
4. L'agent IA devrait répondre et commencer l'entretien

---

### 4. Envoyer son CV

Si demandé par l'agent :

1. Dans WhatsApp, il peut envoyer son CV (PDF ou Word)
2. L'agent va parser le CV et continuer les questions

---

## ⚠️ Important : Limitations

- ⏰ Le Sandbox expire **toutes les 24 heures**
- 🔄 Il doit **renvoyer `join <code>` tous les jours** pour rester actif
- 📱 Seulement les numéros inscrits peuvent recevoir des messages
- 🚫 **Pas adapté pour de vrais candidats externes**

---

## ✅ Pour la production

Pour recevoir des candidatures de n'importe qui (sans inscription), il faut :
- Un **numéro WhatsApp Business approuvé** (5-7 jours d'attente via Twilio)
- Ou utiliser **360Dialog** (1-3 jours, plus rapide)

---

## 🆘 Si ça ne marche pas

1. Vérifier qu'il a bien reçu "You're all set!" après avoir envoyé `join <code>`
2. Vérifier que le code est toujours valide (ne change que si vous réinitialisez le Sandbox)
3. Essayer de renvoyer `join <code>` si ça fait plus de 24h
4. Vérifier que votre backend reçoit bien les messages (logs dans le terminal)

