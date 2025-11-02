# Frontend EasyRecruit - Next.js 14

Dashboard employeur pour le système de recrutement EasyRecruit.

## Installation

```bash
cd frontend
npm install
```

## Configuration

Créer un fichier `.env.local` :

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

## Développement

```bash
npm run dev
```

Le frontend sera accessible sur `http://localhost:3000`

## Pages disponibles

- `/` - Redirection automatique
- `/login` - Connexion / Inscription
- `/dashboard` - Vue d'ensemble des offres
- `/dashboard/jobs/new` - Créer une nouvelle offre
- `/dashboard/jobs/[id]` - Détails d'une offre et liste des candidats
- `/dashboard/candidates/[id]` - Détails d'un candidat

