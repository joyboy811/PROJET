# PAGe Platform — Architecture Docker Complète

Ce dossier contient une orchestration Docker complète pour tous les modules de la plateforme PAGe.

## Structure

```
M-PAG-fix/
├── docker-compose.yml          # Orchestration globale
├── .dockerignore                # Ignore Docker global
├── OPAGe-Platform/              # Module O-PAGe (Risques)
│   ├── Dockerfile               # Backend Django
│   ├── docker-compose.yml       # (Non utilisé en prod, mais reste)
│   ├── opage_frontend/          # Frontend React CRA
│   └── ...
├── M-PAG-Frontend/              # Module M-PAGe (Mitigation)
│   ├── backend/
│   │   └── Dockerfile           # Backend Django
│   ├── Dockerfile               # Frontend Vite
│   └── ...
├── I-PAGe/                      # Module I-PAGe (Impact & Simulation)
│   └── frontend/
│       ├── Dockerfile           # Frontend React CRA
│       └── src/
│           └── IPage.jsx        # Composant I-PAGe
└── README.md                    # Ce fichier
```

## Démarrage rapide

### Prérequis

- Docker & Docker Compose (version 3.9+)
- Pas besoin d'installer Node.js ou Python localement !

### Lancer tous les services

Depuis le dossier `M-PAG-fix/` :

```bash
docker compose up --build
```

### Que se passe-t-il ?

1. **PostgreSQL** démarre sur le port `5432`
2. **Backend O-PAGe** (Django) démarre sur le port `8000`
3. **Frontend O-PAGe** (React) démarre sur le port `3000`
4. **Backend M-PAGe** (Django) démarre sur le port `8001`
5. **Frontend M-PAGe** (Vite) démarre sur le port `5173`
6. **Frontend I-PAGe** (React) démarre sur le port `3002`

### Accéder à l'application

- **O-PAGe Frontend** : http://localhost:3000
- **O-PAGe Backend API** : http://localhost:8000/api/
- **O-PAGe Admin** : http://localhost:8000/admin/
- **M-PAGe Frontend** : http://localhost:5173
- **M-PAGe Backend API** : http://localhost:8001/api/
- **I-PAGe Frontend** : http://localhost:3002

## Arrêter tous les services

```bash
docker compose down
```

### Nettoyer les volumes (réinitialiser la BD)

```bash
docker compose down -v
```

## Détails des services

### PostgreSQL
- Container : `opage-db`
- Port : `5432`
- DB : `opage_db`
- User : `postgres`
- Password : `akramsql`
- Volumes : `postgres_data`

### O-PAGe Backend
- Container : `opage-backend`
- Port : `8000`
- Framework : Django 5.2
- API : `/api/`
- Commandes :
  - Migrations : `docker exec opage-backend python manage.py makemigrations`
  - Créer superuser : `docker exec opage-backend python manage.py createsuperuser`

### O-PAGe Frontend
- Container : `opage-frontend`
- Port : `3000`
- Framework : React 19 (Create React App)
- Hot reload : Activé

### M-PAGe Backend
- Container : `mpage-backend`
- Port : `8001`
- Framework : Django 5.2
- API : `/api/`

### M-PAGe Frontend
- Container : `mpage-frontend`
- Port : `5173`
- Framework : Vite + React

### I-PAGe Frontend
- Container : `ipage-frontend`
- Port : `3002`
- Framework : React (Create React App)
- API : Pointe vers O-PAGe Backend (`http://opage-backend:8000/api`)

## Commandes utiles

### Voir les logs d'un service

```bash
docker compose logs -f opage-backend
docker compose logs -f opage-frontend
docker compose logs -f mpage-backend
docker compose logs -f mpage-frontend
docker compose logs -f ipage-frontend
```

### Exécuter une commande Django

```bash
# O-PAGe
docker exec opage-backend python manage.py createsuperuser
docker exec opage-backend python manage.py migrate

# M-PAGe
docker exec mpage-backend python manage.py createsuperuser
docker exec mpage-backend python manage.py migrate
```

### Redémarrer un service

```bash
docker compose restart opage-backend
docker compose restart opage-frontend
```

### Rebuild après changements de code

```bash
docker compose up --build
```

## Communication inter-services

Les services communiquent via leurs noms dans le réseau Docker :

- Frontend O-PAGe → `http://opage-backend:8000/api`
- Frontend M-PAGe → `http://mpage-backend:8001/api`
- Frontend I-PAGe → `http://opage-backend:8000/api` (actuellement)

Variables d'environnement configurées dans le `docker-compose.yml`.

## Troubleshooting

### Port déjà utilisé

Si un port est déjà en utilisation, modifier le port hôte dans `docker-compose.yml` :

```yaml
ports:
  - "9000:8000"  # Nouvelle mapping : 9000 (hôte) → 8000 (container)
```

### Base de données non synchronisée

```bash
docker compose down -v
docker compose up --build
```

### Frontend ne peut pas se connecter au backend

Vérifier que le service backend est démarré et en bonne santé :

```bash
docker compose ps
docker compose logs mpage-backend
```

## Documentation complète

Consultez les README individuels :
- `OPAGe-Platform/README.md` — Module O-PAGe
- `M-PAG-Frontend/README.md` — Module M-PAGe
- `I-PAGe/README.md` — Module I-PAGe (si créé)

## Sécurité

 **Cette configuration est pour le développement uniquement.**

- Les secrets (DB password) sont en dur dans le compose
- DEBUG=True est activé
- CORS est ouvert

Pour la production :
- Utiliser des variables d'environnement
- Générer des secrets forts
- Configurer HTTPS
- Restriction CORS

## Notes de développement

- Chaque service a son propre dossier indépendant
- Les changes au code source sont reflétés automatiquement via hot reload
- Les volumes sont montés pour développement local
- La BD PostgreSQL est commune à tous les services

---

**Créé pour le projet PAGe Platform — Algorithmic Risk Governance & Assessment**
