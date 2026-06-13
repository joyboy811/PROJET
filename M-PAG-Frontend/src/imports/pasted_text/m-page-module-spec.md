Contexte général
Crée le module M-PAGe d'une plateforme web appelée PAGe — Algorithmic AI Risk Governance & Assessment Platform. Ce module évalue la capacité institutionnelle d'une organisation à atténuer les risques algorithmiques. Il ne collecte pas des données de risque (c'est O-PAGe) — il évalue si l'organisation a les moyens humains, techniques, juridiques, financiers, organisationnels et de gouvernance pour répondre à ces risques.
Le module est utilisé par 3 acteurs : l'Administrateur, le Responsable organisationnel, et l'Auditeur/Expert. Chaque acteur a ses propres vues. Il n'y a pas de logique de calcul à implémenter — uniquement les interfaces.

La structure de données à représenter visuellement
Avant de décrire les écrans, voici la hiérarchie que Figma doit représenter dans les interfaces :
RMM (Mécanisme de mitigation)
  └── Key Pillar (6 piliers : Gouvernance, Juridique, Technique, Humain, Organisationnel, Financier)
        └── Dimension (plusieurs par pilier)
              └── Facteur (plusieurs par dimension)
                    └── Item / Question (réponse de 1 à 5)
Les scores remontent de bas en haut :

Les items → score du facteur
Les facteurs → score de la dimension
Les dimensions → Readiness Level (RL) du pilier
Les piliers → RMMC du mécanisme
Les mécanismes → RMC du risque
Les risques → GPM (score global)


Les écrans à concevoir
VUE ADMINISTRATEUR
Écran 1 — Gestion des mécanismes de mitigation (RMM)
Une page de liste affichant tous les mécanismes de mitigation existants. Chaque ligne montre le nom du mécanisme, le risque auquel il est associé, et un bouton pour le configurer. Un bouton "Ajouter un mécanisme" en haut à droite. En cliquant sur un mécanisme, l'admin accède à sa configuration détaillée.
Écran 2 — Configuration d'un mécanisme (poids des piliers)
Page de configuration d'un RMM spécifique. En haut : nom du mécanisme et risque associé. Au centre : un tableau listant les 6 Key Pillars avec pour chacun un champ numérique permettant de saisir son poids (valeur entre 0 et 1). Un indicateur en bas du tableau affiche la somme actuelle des poids et signale si elle est différente de 1 (règle métier : la somme doit être exactement 1). Bouton "Enregistrer" en bas.
Écran 3 — Gestion du référentiel (piliers, dimensions, facteurs, items)
Page en arborescence ou en accordéon montrant la structure complète :

Niveau 1 : les 6 Key Pillars (fixes, non modifiables par l'admin standard)
Niveau 2 : les Dimensions de chaque pilier — bouton "Ajouter une dimension"
Niveau 3 : les Facteurs de chaque dimension — bouton "Ajouter un facteur"
Niveau 4 : les Items/Questions de chaque facteur — bouton "Ajouter un item"

Chaque item affiché montre son libellé et un bouton éditer/supprimer. L'admin peut ainsi construire le questionnaire complet que le Responsable organisationnel devra remplir.

VUE RESPONSABLE ORGANISATIONNEL
Écran 4 — Liste des campagnes d'évaluation
Page d'accueil du responsable. Liste des campagnes actives pour son organisation. Chaque campagne montre : nom de la campagne, date de lancement, statut (En cours / Complétée), et un bouton "Continuer l'évaluation" ou "Voir les résultats".
Écran 5 — Questionnaire M-PAGe (saisie des réponses)
C'est l'écran principal du responsable. Il est structuré en plusieurs niveaux de navigation :
En haut : une barre de progression globale montrant le pourcentage de questions répondues sur l'ensemble du questionnaire.
À gauche : un menu de navigation vertical listant les 6 Key Pillars. Chaque pilier affiche une icône, son nom, et une mini barre de progression indiquant combien de questions ont été répondues dans ce pilier. Le pilier actif est mis en évidence.
Au centre : le contenu du pilier sélectionné. Il est organisé en sections correspondant aux Dimensions. Chaque dimension est un accordéon dépliable. À l'intérieur d'une dimension, les Facteurs sont affichés comme des sous-sections. Chaque facteur contient ses Items — chaque item est une question affichée avec :

Le libellé de la question
Une échelle de réponse de 1 à 5 sous forme de boutons radio ou de sélection visuelle (1 = très faible, 5 = très élevé)
Un champ optionnel de commentaire

En bas de chaque dimension : un bouton "Enregistrer et continuer" qui sauvegarde les réponses et passe à la dimension suivante.
En bas de la page : deux boutons — "Sauvegarder le brouillon" et "Soumettre l'évaluation" (ce dernier n'est actif que si toutes les questions ont une réponse).
Écran 6 — Confirmation de soumission
Page simple confirmant que l'évaluation a été soumise avec succès. Affiche la date, le nom de la campagne, et un bouton "Voir les résultats préliminaires".

VUE AUDITEUR / EXPERT
Écran 7 — Tableau de bord des résultats M-PAGe
Page principale de l'auditeur. En haut : 4 cartes métriques affichant GPM global, nombre de RMM évalués, nombre de piliers en situation critique (RL < 0.25), et nombre de campagnes analysées.
En dessous : un tableau listant tous les risques avec pour chacun son score RMC (capacité de mitigation) représenté par une barre horizontale colorée selon le niveau.
En dessous du tableau : une section "Détail par pilier" affichant les 6 Key Pillars avec leur RL (Readiness Level) représenté sous forme de jauge ou de barre de progression. Les piliers faibles (RL bas) sont visuellement distincts des piliers forts.
Écran 8 — Analyse détaillée d'un mécanisme (RMM)
Page accessible en cliquant sur un mécanisme depuis le tableau de bord. Affiche :

En haut : nom du mécanisme, risque associé, score RMMC global
Au centre : un tableau des 6 piliers avec leur poids configuré par l'admin et leur RL calculé à partir des réponses. Pour chaque pilier, afficher également les scores par Dimension
En bas : une section "Analyse" avec un champ texte libre permettant à l'auditeur de rédiger ses observations et recommandations
Bouton "Valider l'analyse" et bouton "Exporter en PDF"

Écran 9 — Vue comparative (optionnelle mais appréciée)
Si deux campagnes existent pour la même organisation, afficher un écran comparatif côte à côte montrant l'évolution des scores RL par pilier et du GPM entre les deux périodes.

Les règles métier à refléter dans l'interface
Ces contraintes doivent être visibles dans le design — pas dans le code, mais dans la logique des écrans :

Le bouton "Soumettre" est désactivé tant que toutes les questions n'ont pas de réponse
La somme des poids des piliers doit afficher un avertissement si elle n'est pas égale à 1
Un pilier ne peut pas être évalué si aucune dimension/facteur/item n'a été configuré par l'admin
L'auditeur ne peut pas modifier les réponses — il consulte et annote uniquement
Le responsable ne voit que sa propre organisation et ses propres campagnes
Les scores (RL, RMMC, RMC, GPM) sont calculés automatiquement — aucun champ de saisie pour ces valeurs, elles s'affichent en lecture seule


Navigation globale
La sidebar de navigation principale contient :

Tableau de bord
Campagnes
Questionnaire (pour le responsable) / Résultats (pour l'auditeur)
Référentiel (admin uniquement)
Mécanismes / Poids (admin uniquement)
Exporter

Chaque acteur voit uniquement les entrées qui lui correspondent selon son rôle.