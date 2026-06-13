# PAGe Platform — Orchestration Docker Complète

Cette section explique comment tous les modules fonctionnent **ensemble** via une orchestration Docker centralisée.

## Vue d'ensemble

Le projet PAGe est structuré en trois modules indépendants mais interconnectés, tous lancés via une unique commande Docker Compose.

```
┌─────────────────────────────────────────────────────────────┐
│                    Docker Compose                           │
│  (M-PAG-fix/docker-compose.yml)                             │
└──────────────┬──────────────────────────────────────────────┘
               │
       ┌───────┼───────┬──────────┐
       ▼       ▼       ▼          ▼
   ┌────────┐ ┌──────┐ ┌────────┐ 
   │Postgres│ │O-PAGe│ │ M-PAGe │
   │        │ │      │ │ I-PAGe │
   │Backend │ │Backend │ O-PAGe │
   │DB      │ │        │frontend│
   └────────┘ └──────┘ └────────┘ 
```

## Démarrage rapide

Depuis le dossier `M-PAG-fix/` (racine du projet) :

```bash
docker compose up --build
```

Cela lance **automatiquement** :
1. PostgreSQL (port 5432)
2. Backend O-PAGe (port 8000)
4. Backend M-PAGe (port 8001)
5. Frontend O-PAGe et M-PAGe ET I-PAGe (port 5173)

## Accéder aux applications

| Module | Frontend | Backend API | Admin |
|--------|----------|-------------|-------|
| **O-PAGe** | http://localhost:3000 | http://localhost:8000/api | http://localhost:8000/admin |
| **M-PAGe** | http://localhost:5173 | http://localhost:8001/api | http://localhost:8001/admin |
| **I-PAGe** | http://localhost:3002 | *Utilise O-PAGe API* | N/A |

## Structure des fichiers

```
M-PAG-fix/
├── docker-compose.yml          # Orchestration principale
├── .dockerignore               # Ignore global
├── .env.example                # Configuration (à copier en .env)
├── START.md                    # Guide rapide
├── DOCKER_SETUP.md             # Documentation Docker détaillée
├── README_ORCHESTRATION.md     # Ce fichier
│
├── OPAGe-Platform/             # Module O-PAGe
│   ├── Dockerfile              # Backend Python
│   ├── docker-compose.yml      # (Pas utilisé en prod)
│   ├── opage_frontend/
│   │   ├── Dockerfile          # Frontend Node
│   │   ├── package.json
│   │   └── src/
│   ├── OPAGe/                  # App Django
│   ├── config/                 # Config Django
│   └── manage.py
│
├── M-PAG-Frontend/             # Module M-PAGe
│   ├── Dockerfile              # Frontend Node (Vite)
│   ├── package.json
│   ├── backend/
│   │   ├── Dockerfile          # Backend Python
│   │   ├── requirements.txt
│   │   └── manage.py
│   └── src/
│
└── I-PAGe/                     # Module I-PAGe
    └── frontend/
        ├── Dockerfile          # Frontend Node (CRA)
        ├── package.json
        ├── public/
        │   └── index.html
        └── src/
            ├── IPage.jsx       # Composant principal
            ├── App.jsx
            ├── index.jsx
            └── index.css
```

## Communication inter-services

### À l'intérieur du réseau Docker

Les services communiquent via leurs noms de service :

```javascript
// Frontend O-PAGe → Backend O-PAGe
const API_URL = 'http://opage-backend:8000/api';

// Frontend M-PAGe → Backend M-PAGe
const API_URL = 'http://mpage-backend:8001/api';

// Frontend I-PAGe → Backend O-PAGe (pour les données de risques)
const API_URL = 'http://opage-backend:8000/api';
```

### Depuis votre machine (hôte)

Depuis le navigateur :

```javascript
// O-PAGe Frontend
fetch('http://localhost:8000/api/risks/');

// M-PAGe Frontend
fetch('http://localhost:8001/api/');

// I-PAGe Frontend
fetch('http://localhost:8000/api/risks/');
```

## Flux de données

```
User (Browser)
│
├─→ O-PAGe Frontend (3000)
│   └─→ O-PAGe Backend (8000)
│       └─→ PostgreSQL (5432)
│
├─→ M-PAGe Frontend (5173)
│   └─→ M-PAGe Backend (8001)
│       └─→ PostgreSQL (5432)
│
└─→ I-PAGe Frontend (3002)
    └─→ O-PAGe Backend (8000)
        └─→ PostgreSQL (5432)
```

## Commandes utiles

### Vérifier le status

```bash
docker compose ps
```

### Voir les logs

```bash
# Tous les services
docker compose logs -f

# Un service spécifique
docker compose logs -f opage-backend
docker compose logs -f mpage-backend
docker compose logs -f ipage-frontend
```

### Exécuter des commandes Django

```bash
# O-PAGe
docker exec opage-backend python manage.py createsuperuser
docker exec opage-backend python manage.py migrate

# M-PAGe
docker exec mpage-backend python manage.py createsuperuser
docker exec mpage-backend python manage.py migrate
```

### Redémarrer

```bash
# Un service
docker compose restart opage-backend

# Tous
docker compose restart
```

### Nettoyer complètement

```bash
# Arrêter et supprimer les volumes (réinitialiser la BD)
docker compose down -v

# Reconstruire tout
docker compose up --build
```

## Sécurité & Configuration

### Variables d'environnement

Copier `.env.example` à `.env` et adapter :

```bash
cp .env.example .env
```

### Ports configurables

Éditer `docker-compose.yml` pour changer les ports :

```yaml
services:
  opage-backend:
    ports:
      - "9000:8000"  # Nouveau port externe
```

## Troubleshooting

### "Port already in use"

Trouver le processus occupant le port :

```bash
# Windows (PowerShell)
netstat -ano | findstr :3000

# Linux/Mac
lsof -i :3000
```

### Services ne démarrent pas

Vérifier les logs :

```bash
docker compose logs
```

### Base de données corrompue

Réinitialiser :

```bash
docker compose down -v
docker compose up --build
```

## Workflow de développement

1. **Code local** → Modifications dans VS Code
2. **Hot reload** → Les conteneurs detektent les changements
3. **Tests** → Accéder à http://localhost:3000 (ou autre port)
4. **Commit** → Git comme normal

### Pour une modification majeure

```bash
docker compose restart service-name
```

### Ou reconstruire

```bash
docker compose up --build
```

## Notes importantes

1. **Base de données unique** : PostgreSQL est partagée entre O-PAGe et M-PAGe
2. **I-PAGe dépend de O-PAGe** : I-PAGe consomme l'API de O-PAGe
3. **Isolation de code** : Chaque module reste dans sa structure indépendante
4. **Facile à étendre** : Ajouter un nouveau module = ajouter un service au compose

## Points clés

**Une seule commande** : `docker compose up --build`  
**Tous les services démarrent ensemble**  
**BD automatiquement initialisée**  
**Hot reload activé pour le développement**  
**Chaque module reste indépendant**  
**Communication sécurisée via réseau Docker**  

---

**Pour l'aide détaillée**, consulter :
- `START.md` — Guide express
- `DOCKER_SETUP.md` — Configuration avancée
