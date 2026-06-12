# PAGe Platform — AI Risk Governance

> Plateforme complète de gouvernance et de gestion des risques algorithmiques. 
> Ce projet est constitué de plusieurs modules développés avec **Django REST Framework** (Backend) et **React/Vite** (Frontend).

##  Modules du Projet

Le projet global PAGe (Plateforme d'Analyse et de Gestion d'Évaluation) se divise en plusieurs composants clés :

| Module | Description | Technologies |
|--------|-------------|--------------|
| **O-PAGe (Observatory)** | Évaluation et scoring des risques algorithmiques via des indicateurs et modèles de calcul (Risk Score). | Django + React |
| **M-PAGe (Mitigation)** | Plateforme d'analyse de capacité, gestion de hiérarchie institutionnelle, questionnaires d'évaluation, et moteur de calcul GPM/RMC avec export PDF/CSV. | Django + Vite/React |
| **I-PAGe (Impact)** | Simulation d'impact (Module futur). | - |

---

##  Stack Technique Globale

**Backend**
- Python 3.13
- Django 5.2 & Django REST Framework
- PostgreSQL / SQLite

**Frontend**
- React 18
- Vite (pour M-PAGe) / Create React App (pour O-PAGe)
- React Router DOM, Axios

---

## Comment lancer le projet complet

Le projet est divisé en deux répertoires principaux contenant chacun leur partie backend et frontend : `OPAGe-Platform` et `M-PAG-Frontend`.

### 1️ Lancer le module O-PAGe (Évaluation des Risques)

**Backend (O-PAGe) :**
```bash
# Se placer dans le dossier OPAGe
cd OPAGe-Platform

# Installer les dépendances Python
pip install -r requirements.txt

# Appliquer les migrations et lancer le serveur Django (Port par défaut : 8000)
python manage.py migrate
python manage.py runserver
```

**Frontend (O-PAGe) :**
```bash
# Dans un nouveau terminal, se placer dans le frontend de O-PAGe
cd OPAGe-Platform/opage_frontend

# Installer les dépendances Node
npm install

# Lancer l'application React (Port par défaut : 3000)
npm start
```

### 2️ Lancer le module M-PAGe (Plateforme de Mitigation)

**Backend (M-PAGe) :**
```bash
# Se placer dans le dossier backend de M-PAGe
cd M-PAG-Frontend/backend

# Installer les dépendances Python
pip install -r requirements.txt

# Appliquer les migrations et lancer le serveur Django 
# (Note : Si O-PAGe tourne déjà sur le port 8000, lancez M-PAG sur un autre port, ex: 8001)
python manage.py migrate
python manage.py runserver 8001
```

**Frontend (M-PAGe) :**
```bash
# Dans un nouveau terminal, se placer à la racine de M-PAG-Frontend
cd M-PAG-Frontend

# Installer les dépendances Node
npm install

# Lancer le serveur de développement Vite
npm run dev
```

---

##  Architecture des bases de données et Scores

### Modèle O-PAGe (Risk Score)
- **Indicateurs et Risques** : Le Risk Score est calculé par agrégation pondérée : `Σ (Poids × Valeur_Normalisée)`.
- **Catégorisation** : Low (<0.25), Moderate (0.25-0.50), High (0.50-0.75), Critical (≥0.75).

### Modèle M-PAGe (Mitigation)
- Intègre des **vues basées sur les rôles** : Administrateur, Responsable Organisationnel, Auditeur.
- Permet l'évaluation via des **questionnaires interactifs**.
- Moteur de calcul pour générer les scores de maturité (GPM / RMC).
- Inclut des fonctionnalités complètes d'**exportation des rapports (PDF, CSV)**.

---

##  Auteur & Projet

Développé dans le cadre du projet académique de conception de la plateforme globale **PAGe Risk-Based Observatory**.
