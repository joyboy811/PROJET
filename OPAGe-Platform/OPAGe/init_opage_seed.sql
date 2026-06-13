-- Seed SQL O-PAGe pour initialiser les données de test au démarrage.
-- Si ce fichier est supprimé plus tard, l'application continuera de fonctionner.

INSERT OR IGNORE INTO OPAGe_keypillar (id, name, type) VALUES
(1, 'Data Governance', 'data'),
(2, 'AI Governance', 'governance'),
(3, 'Security & Privacy', 'security'),
(4, 'Trust & Transparency', 'trust');

INSERT OR IGNORE INTO OPAGe_risk (id, name, description) VALUES
(6, 'R1 - Institutional Data Fragmentation', 'Fragmentation des données entre les institutions publiques utilisant des systèmes IA'),
(7, 'R2 - Administrative incoherence', 'Incohérence administrative due à des décisions algorithmiques contradictoires'),
(8, 'R3 - Bias amplification', 'Amplification des biais existants par les systèmes algorithmiques'),
(9, 'R4 - Weak contestability', 'Faible capacité des citoyens à contester les décisions automatisées'),
(10, 'R5 - Opacity of algorithms', 'Opacité des algorithmes utilisés dans les services publics');

INSERT OR IGNORE INTO OPAGe_indicator (id, risk_id, label, weight, status, val_min, val_max) VALUES
(101, 6, 'Frequency indicator', 0.4, 'POSITIVE', 0.0, 1.0),
(102, 6, 'Impact indicator', 0.35, 'POSITIVE', 0.0, 1.0),
(103, 6, 'Severity indicator', 0.25, 'POSITIVE', 0.0, 1.0),
(104, 7, 'Frequency indicator', 0.4, 'POSITIVE', 0.0, 1.0),
(105, 7, 'Impact indicator', 0.35, 'POSITIVE', 0.0, 1.0),
(106, 7, 'Severity indicator', 0.25, 'POSITIVE', 0.0, 1.0),
(107, 8, 'Frequency indicator', 0.4, 'POSITIVE', 0.0, 1.0),
(108, 8, 'Impact indicator', 0.35, 'POSITIVE', 0.0, 1.0),
(109, 8, 'Severity indicator', 0.25, 'POSITIVE', 0.0, 1.0),
(110, 9, 'Frequency indicator', 0.4, 'POSITIVE', 0.0, 1.0),
(111, 9, 'Impact indicator', 0.35, 'POSITIVE', 0.0, 1.0),
(112, 9, 'Severity indicator', 0.25, 'POSITIVE', 0.0, 1.0),
(113, 10, 'Frequency indicator', 0.4, 'POSITIVE', 0.0, 1.0),
(114, 10, 'Impact indicator', 0.35, 'POSITIVE', 0.0, 1.0),
(115, 10, 'Severity indicator', 0.25, 'POSITIVE', 0.0, 1.0);

INSERT OR IGNORE INTO OPAGe_indicatorvalue (id, indicator_id, raw_value, normalized_value, created_at) VALUES
(201, 101, 0.68, 0.68, '2026-05-01 12:00:00'),
(202, 102, 0.22, 0.22, '2026-05-01 12:00:00'),
(203, 103, 0.27, 0.27, '2026-05-01 12:00:00'),
(204, 104, 0.43, 0.43, '2026-05-01 12:00:00'),
(205, 105, 0.64, 0.64, '2026-05-01 12:00:00'),
(206, 106, 0.51, 0.51, '2026-05-01 12:00:00'),
(207, 107, 0.84, 0.84, '2026-05-01 12:00:00'),
(208, 108, 0.25, 0.25, '2026-05-01 12:00:00'),
(209, 109, 0.35, 0.35, '2026-05-01 12:00:00'),
(210, 110, 0.32, 0.32, '2026-05-01 12:00:00'),
(211, 111, 0.32, 0.32, '2026-05-01 12:00:00'),
(212, 112, 0.49, 0.49, '2026-05-01 12:00:00'),
(213, 113, 0.58, 0.58, '2026-05-01 12:00:00'),
(214, 114, 0.47, 0.47, '2026-05-01 12:00:00'),
(215, 115, 0.33, 0.33, '2026-05-01 12:00:00');

INSERT OR IGNORE INTO OPAGe_riskscore (id, risk_id, score, category, calculated_date) VALUES
(101, 6, 0.4165, 'MODERATE', '2026-05-01 12:00:00'),
(102, 7, 0.5235, 'HIGH', '2026-05-01 12:00:00'),
(103, 8, 0.5110, 'HIGH', '2026-05-01 12:00:00'),
(104, 9, 0.3625, 'MODERATE', '2026-05-01 12:00:00'),
(105, 10, 0.4765, 'MODERATE', '2026-05-01 12:00:00');

INSERT OR IGNORE INTO OPAGe_rmm (id, risk_id, name, description, associated_risk_id, associated_risk_name) VALUES
(101, 6, 'RMM - Gouvernance des données', 'Renforce les mécanismes de gouvernance pour les risques de fragmentation des données', 6, 'R1 - Institutional Data Fragmentation'),
(102, 7, 'RMM - Conformité administrative', 'Supports les contrôles pour réduire l’incohérence administrative', 7, 'R2 - Administrative incoherence'),
(103, 8, 'RMM - Surveillance des biais', 'Améliore la détection et la gestion des biais algorithmiques', 8, 'R3 - Bias amplification');

INSERT OR IGNORE INTO OPAGe_rmmkeypillarweight (rmm_id, key_pillar_id, weight) VALUES
(101, 1, 0.4),
(101, 2, 0.3),
(101, 3, 0.3),
(102, 1, 0.2),
(102, 3, 0.5),
(102, 4, 0.3),
(103, 2, 0.5),
(103, 3, 0.5);
