# Initialisation des données M-PAGe Legacy

## Vue d'ensemble

Le système d'initialisation des données legacy M-PAGe a été refactorisé pour utiliser un script SQL au lieu d'une commande Django Python.

## Fichiers

- `init_legacy_data.sql` : Script SQL contenant toutes les données des 6 piliers M-PAGe originaux
- `init_legacy_data.py` : Script Python autonome pour exécuter le SQL (optionnel)
- `mpage/signals.py` : Signal Django qui exécute automatiquement l'initialisation lors des migrations

## Fonctionnement

1. **Automatique** : Lors de la première migration Django (`python manage.py migrate`), le signal `post_migrate` déclenche l'exécution du script SQL si le fichier existe.

2. **Optionnel** : Si le fichier `init_legacy_data.sql` n'existe pas, l'application fonctionne normalement mais sans les données legacy.

3. **Sécurisé** : Utilise `INSERT OR IGNORE` pour éviter les conflits si les données existent déjà.

## Suppression des données legacy

Pour supprimer complètement les données legacy :
1. Supprimez le fichier `init_legacy_data.sql`
2. Les migrations suivantes n'inséreront plus les données legacy
3. L'application continuera de fonctionner normalement

## Données incluses

Le script crée :
- 6 piliers principaux (Humain, Organisationnel, Gouvernance, Juridique, Technique, Financier)
- Leurs dimensions respectives
- Tous les facteurs et items de questionnaire (45 questions au total)

## Test manuel

Pour tester manuellement l'initialisation :

```bash
# Via Python (si disponible)
python init_legacy_data.py

# Via sqlite3 (si installé)
sqlite3 db.sqlite3 < init_legacy_data.sql
```

## Migration depuis l'ancien système

L'ancien fichier `mpage/management/commands/seed_mpage.py` a été supprimé et remplacé par ce système SQL automatique.