-- Script SQL pour initialiser les données M-PAGe legacy
-- Ce script crée les 6 piliers originaux avec leurs dimensions, facteurs et items
-- Il peut être exécuté automatiquement lors du setup initial

-- Insertion des Key Pillars (Piliers principaux)
INSERT OR IGNORE INTO mpage_keypillar (name, code, pillar_type, icon) VALUES
('Humain', 'human', 'human', 'users'),
('Organisationnel', 'org', 'organizational', 'building'),
('Gouvernance', 'gov', 'governance', 'shield'),
('Juridique', 'legal', 'legal', 'scale'),
('Technique', 'tech', 'technical', 'cpu'),
('Financier', 'financial', 'financial', 'euro');

-- Insertion des Dimensions
INSERT OR IGNORE INTO mpage_dimension (pillar_id, name, code) VALUES
-- Humain (pillar_id = 1)
(1, 'Competences IA', 'H'),
-- Organisationnel (pillar_id = 2)
(2, 'Structure organisationnelle', 'O'),
-- Gouvernance (pillar_id = 3)
(3, 'Structure de gouvernance', 'G'),
-- Juridique (pillar_id = 4)
(4, 'Conformite reglementaire', 'L'),
-- Technique (pillar_id = 5)
(5, 'Infrastructure technique', 'T'),
-- Financier (pillar_id = 6)
(6, 'Budget et ressources', 'F');

-- Insertion des Factors
INSERT OR IGNORE INTO mpage_factor (dimension_id, name, code) VALUES
-- Humain - Competences IA (dimension_id = 1)
(1, 'Formation et expertise', 'H1'),
(1, 'Sensibilisation', 'H2'),
(1, 'Ressources humaines', 'H3'),
-- Organisationnel - Structure organisationnelle (dimension_id = 2)
(2, 'Processus et procedures', 'O1'),
(2, 'Coordination inter-services', 'O2'),
(2, 'Culture organisationnelle', 'O3'),
-- Gouvernance - Structure de gouvernance (dimension_id = 3)
(3, 'Comite de supervision IA', 'G1'),
(3, 'Politiques et procedures', 'G2'),
(3, 'Audit et controle', 'G3'),
-- Juridique - Conformite reglementaire (dimension_id = 4)
(4, 'Cadre reglementaire', 'L1'),
(4, 'Protection des droits', 'L2'),
(4, 'Veille juridique', 'L3'),
-- Technique - Infrastructure technique (dimension_id = 5)
(5, 'Capacites de calcul', 'T1'),
(5, 'Qualite des donnees', 'T2'),
(5, 'Securite', 'T3'),
(5, 'Outils de monitoring', 'T4'),
-- Financier - Budget et ressources (dimension_id = 6)
(6, 'Budget alloue', 'F1'),
(6, 'Allocation strategique', 'F2'),
(6, 'Retour sur investissement', 'F3');

-- Insertion des Items (questions)
INSERT OR IGNORE INTO mpage_item (factor_id, code, label) VALUES
-- Humain - Formation et expertise (factor_id = 1)
(1, 'H1-Q1', "Presence d'experts IA qualifies dans l'equipe"),
(1, 'H1-Q2', "Programmes de formation continue en IA"),
(1, 'H1-Q3', "Certification des competences IA du personnel"),
-- Humain - Sensibilisation (factor_id = 2)
(2, 'H2-Q1', "Sensibilisation de la direction aux enjeux IA"),
(2, 'H2-Q2', "Communication interne sur les risques algorithmiques"),
(2, 'H2-Q3', "Implication des parties prenantes dans la gouvernance IA"),
-- Humain - Ressources humaines (factor_id = 3)
(3, 'H3-Q1', "Equipe dediee a la gestion des risques IA"),
(3, 'H3-Q2', "Capacite de recrutement de profils IA"),
(3, 'H3-Q3', "Retention des talents specialises en IA"),
-- Organisationnel - Processus et procedures (factor_id = 4)
(4, 'O1-Q1', "Existence de processus formalises de gestion des risques IA"),
(4, 'O1-Q2', "Integration de l'IA dans la strategie organisationnelle"),
(4, 'O1-Q3', "Mecanismes de retour d'experience et d'amelioration continue"),
-- Organisationnel - Coordination inter-services (factor_id = 5)
(5, 'O2-Q1', "Collaboration entre les departements sur les projets IA"),
(5, 'O2-Q2', "Partage d'information sur les risques IA entre services"),
(5, 'O2-Q3', "Coordination des actions de mitigation"),
-- Organisationnel - Culture organisationnelle (factor_id = 6)
(6, 'O3-Q1', "Culture d'innovation responsable"),
(6, 'O3-Q2', "Engagement de la direction sur l'ethique IA"),
(6, 'O3-Q3', "Transparence dans la prise de decision algorithmique"),
-- Gouvernance - Comite de supervision IA (factor_id = 7)
(7, 'G1-Q1', "Existence d'un comite dedie a la supervision de l'IA"),
(7, 'G1-Q2', "Frequence des reunions du comite IA"),
(7, 'G1-Q3', "Pouvoir de decision du comite de supervision"),
-- Gouvernance - Politiques et procedures (factor_id = 8)
(8, 'G2-Q1', "Politique IA formalisee et approuvee"),
(8, 'G2-Q2', "Procedures de gestion des incidents IA"),
(8, 'G2-Q3', "Cadre de responsabilite clairement defini"),
-- Gouvernance - Audit et controle (factor_id = 9)
(9, 'G3-Q1', "Audit regulier des systemes algorithmiques"),
(9, 'G3-Q2', "Mecanismes de controle interne"),
(9, 'G3-Q3', "Reporting sur les risques IA a la direction"),
-- Juridique - Cadre reglementaire (factor_id = 10)
(10, 'L1-Q1', "Conformite avec la reglementation nationale sur l'IA"),
(10, 'L1-Q2', "Prise en compte des directives europeennes (AI Act)"),
(10, 'L1-Q3', "Analyse d'impact RGPD pour les systemes IA"),
-- Juridique - Protection des droits (factor_id = 11)
(11, 'L2-Q1', "Mecanismes de contestation des decisions automatisees"),
(11, 'L2-Q2', "Transparence algorithmique envers les citoyens"),
(11, 'L2-Q3', "Protection des donnees personnelles"),
-- Juridique - Veille juridique (factor_id = 12)
(12, 'L3-Q1', "Suivi de l'evolution reglementaire"),
(12, 'L3-Q2', "Adaptation proactive aux nouvelles normes"),
(12, 'L3-Q3', "Conseil juridique specialise en IA"),
-- Technique - Capacites de calcul (factor_id = 13)
(13, 'T1-Q1', "Infrastructure adaptee aux modeles IA"),
(13, 'T1-Q2', "Capacite de traitement des donnees a grande echelle"),
(13, 'T1-Q3', "Disponibilite et fiabilite de l'infrastructure"),
-- Technique - Qualite des donnees (factor_id = 14)
(14, 'T2-Q1', "Processus de validation de la qualite des donnees"),
(14, 'T2-Q2', "Gestion des biais dans les jeux de donnees"),
(14, 'T2-Q3', "Interoperabilite des systemes de donnees"),
-- Technique - Securite (factor_id = 15)
(15, 'T3-Q1', "Securite des modeles IA contre les attaques adversariales"),
(15, 'T3-Q2', "Journalisation et tracabilite des decisions algorithmiques"),
(15, 'T3-Q3', "Tests de robustesse des systemes IA"),
-- Technique - Outils de monitoring (factor_id = 16)
(16, 'T4-Q1', "Surveillance continue des performances des modeles"),
(16, 'T4-Q2', "Detection automatique des derives algorithmiques"),
(16, 'T4-Q3', "Tableaux de bord de suivi des metriques IA"),
-- Financier - Budget alloue (factor_id = 17)
(17, 'F1-Q1', "Budget dedie a la gouvernance IA"),
(17, 'F1-Q2', "Investissement dans la formation IA"),
(17, 'F1-Q3', "Financement de la recherche en IA responsable"),
-- Financier - Allocation strategique (factor_id = 18)
(18, 'F2-Q1', "Repartition budgetaire entre les piliers de mitigation"),
(18, 'F2-Q2', "Capacite d'investissement d'urgence"),
(18, 'F2-Q3', "Suivi financier des initiatives IA"),
-- Financier - Retour sur investissement (factor_id = 19)
(19, 'F3-Q1', "Mesure du ROI des actions de mitigation"),
(19, 'F3-Q2', "Analyse cout-benefice des mecanismes deployes"),
(19, 'F3-Q3', "Optimisation des ressources financieres");