# 🔄 Migration vers EasyRecruit

## Étapes de migration

### 1. Arrêter les conteneurs Docker existants

```bash
docker-compose down
```

### 2. Sauvegarder les données (si vous avez des données importantes)

```bash
# Sauvegarder la base de données (si vous avez des données)
docker exec amolant-postgres pg_dump -U amolant amolant > backup_amolant.sql
```

### 3. Supprimer les anciens volumes (optionnel - supprime les données)

```bash
# ATTENTION : Cela supprime toutes les données !
docker volume rm andreas_postgres_data andreas_redis_data
```

### 4. Mettre à jour votre fichier `.env`

Mettre à jour `DATABASE_URL` dans votre `.env` :

```env
DATABASE_URL=postgresql://easyrecruit:easyrecruit_dev_password@localhost:5432/easyrecruit
```

### 5. Recréer les conteneurs avec les nouveaux noms

```bash
docker-compose up -d
```

### 6. Recréer la base de données (ou restaurer depuis backup)

```bash
# Si vous avez fait un backup :
docker exec -i easyrecruit-postgres psql -U easyrecruit easyrecruit < backup_amolant.sql

# Sinon, recréer les tables :
npx prisma migrate dev
```

### 7. Vérifier que tout fonctionne

```bash
# Vérifier les conteneurs
docker-compose ps

# Tester la connexion
npm run dev
```

## ✅ Vérification

- ✅ Conteneurs démarrés : `easyrecruit-postgres` et `easyrecruit-redis`
- ✅ Base de données accessible
- ✅ Application démarre sans erreur
- ✅ Frontend accessible sur http://localhost:3000

