# PAGe Platform — AI Risk Governance

> Plateforme de gouvernance des risques algorithmiques, développée avec **Django REST Framework** (backend) et **React** (frontend).

---

## Modules

| Module | Description | Statut |
|--------|-------------|--------|
| **O-PAGe** | Évaluation et scoring des risques algorithmiques | ✅ En cours |
| **M-PAGe** | Analyse de capacité | 🔜 À venir |
| **I-PAGe** | Simulation d'impact | 🔜 À venir |

---

## Stack technique

**Backend**
- Python 3.13
- Django 5.2
- Django REST Framework
- PostgreSQL
- psycopg2

**Frontend**
- React 18
- React Router DOM
- Axios

---

## Structure du projet

```
OPAGe-Platform/
├── config/                  # Configuration Django (settings, urls, wsgi)
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
├── opage/                   # App Django — Module O-PAGe
│   ├── models.py            # Risk, Indicator, IndicatorValue, RiskScore
│   ├── serializers.py       # Sérialisation JSON ↔ Python
│   ├── views.py             # Logique métier + endpoints API
│   ├── urls.py              # Routing API
│   └── admin.py             # Interface d'administration
├── frontend/                # Application React
│   └── src/
│       ├── components/      # Sidebar, composants réutilisables
│       ├── pages/           # Dashboard, RiskAssessment
│       └── services/        # api.js — appels vers le backend
└── manage.py
```

---

## Modèle de données (O-PAGe)

```
Risk
 ├── id, nom, description, weight
 └── → indicators (ForeignKey)
       Indicator
        ├── id, libelle, weight, statut (POSITIVE/NEGATIVE/SPECIAL)
        ├── val_min, val_max
        └── → values (ForeignKey)
              IndicatorValue
               ├── raw_value
               ├── normalized_value (calculé automatiquement)
               └── date_saisie

RiskScore
 ├── score (agrégation pondérée)
 ├── categorie (LOW / MODERATE / HIGH / CRITICAL)
 └── date_calcul
```

---

## Formule de calcul du Risk Score

```
Risk_Score = Σ (W_Ind_i × Val_norm_Ind_i)
```

Normalisation selon le statut de l'indicateur :
- **POSITIVE** → `Val_norm = Val_brute`
- **NEGATIVE** → `Val_norm = 1 − Val_brute`
- **SPECIAL**  → `Val_norm = valeur définie par l'utilisateur`

Catégorisation :

| Score | Niveau |
|-------|--------|
| < 0.25 | 🟢 Low |
| 0.25 – 0.50 | 🟡 Moderate |
| 0.50 – 0.75 | 🟠 High |
| ≥ 0.75 | 🔴 Critical |

---

## Installation

### Prérequis
- Python 3.13+
- Node.js 18+
- PostgreSQL 15+

### Backend

```bash
# Cloner le projet
git clone https://github.com/ton-user/OPAGe-Platform.git
cd OPAGe-Platform

# Installer les dépendances Python
pip install django djangorestframework psycopg2-binary django-cors-headers

# Configurer la base de données dans config/settings.py
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'opage_db',
        'USER': 'postgres',
        'PASSWORD': 'votremotdepasse',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}

# Créer la base dans PostgreSQL puis migrer
python manage.py makemigrations opage
python manage.py migrate

# Créer un superutilisateur
python manage.py createsuperuser

# Lancer le serveur
python manage.py runserver
```

### Frontend

```bash
cd frontend
npm install
npm start
```

---

## Endpoints API

| Méthode | URL | Description |
|---------|-----|-------------|
| GET | `/api/risks/` | Liste de tous les risques |
| POST | `/api/risks/` | Créer un risque |
| GET | `/api/risks/{id}/` | Détail d'un risque |
| POST | `/api/risks/{id}/compute-score/` | Calculer le Risk Score |
| GET | `/api/indicators/` | Liste des indicateurs |
| POST | `/api/indicators/` | Créer un indicateur |
| POST | `/api/indicator-values/` | Soumettre une valeur brute |
| GET | `/api/risk-scores/` | Historique des scores |

Interface admin : `http://localhost:8000/admin/`  
Interface API : `http://localhost:8000/api/`  
Frontend React : `http://localhost:3000/`

---

## Auteur

Développé dans le cadre d'un projet académique — PAGe Platform.
