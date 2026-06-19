-- ================================================================
-- PAGe Platform - Example data for simulation
-- Run in pgAdmin on opage_db after cleanup_db.sql
-- Prerequisite: admin account exists
-- ================================================================

BEGIN;

-- 1. Project
INSERT INTO mpage_project (name, description, is_active, created_at)
VALUES ('Project Alpha', 'AI governance pilot project', true, NOW());

-- 2. M-PAGe Key Pillars
INSERT INTO mpage_keypillar (project_id, name, code, pillar_type, icon)
VALUES
((SELECT id FROM mpage_project WHERE name='Project Alpha' LIMIT 1), 'AI Governance', 'P-GOV', 'governance', 'shield'),
((SELECT id FROM mpage_project WHERE name='Project Alpha' LIMIT 1), 'Technical & Security', 'P-TECH', 'technical', 'cpu'),
((SELECT id FROM mpage_project WHERE name='Project Alpha' LIMIT 1), 'Organizational', 'P-ORG', 'organizational', 'users');

-- 3. Dimensions
INSERT INTO mpage_dimension (pillar_id, name, code) VALUES
((SELECT id FROM mpage_keypillar WHERE code='P-GOV'), 'AI Strategy', 'D-GOV-1'),
((SELECT id FROM mpage_keypillar WHERE code='P-GOV'), 'Policies', 'D-GOV-2'),
((SELECT id FROM mpage_keypillar WHERE code='P-TECH'), 'Data Quality', 'D-TECH-1'),
((SELECT id FROM mpage_keypillar WHERE code='P-TECH'), 'Security', 'D-TECH-2'),
((SELECT id FROM mpage_keypillar WHERE code='P-ORG'), 'Processes', 'D-ORG-1'),
((SELECT id FROM mpage_keypillar WHERE code='P-ORG'), 'Resources', 'D-ORG-2');

-- 4. Factors
INSERT INTO mpage_factor (dimension_id, name, code) VALUES
((SELECT id FROM mpage_dimension WHERE code='D-GOV-1'), 'Strategic Alignment', 'F-GOV-1-1'),
((SELECT id FROM mpage_dimension WHERE code='D-GOV-1'), 'Oversight', 'F-GOV-1-2'),
((SELECT id FROM mpage_dimension WHERE code='D-GOV-2'), 'Regulatory Framework', 'F-GOV-2-1'),
((SELECT id FROM mpage_dimension WHERE code='D-GOV-2'), 'Ethics', 'F-GOV-2-2'),
((SELECT id FROM mpage_dimension WHERE code='D-TECH-1'), 'Completeness', 'F-TECH-1-1'),
((SELECT id FROM mpage_dimension WHERE code='D-TECH-1'), 'Reliability', 'F-TECH-1-2'),
((SELECT id FROM mpage_dimension WHERE code='D-TECH-2'), 'Protection', 'F-TECH-2-1'),
((SELECT id FROM mpage_dimension WHERE code='D-TECH-2'), 'Resilience', 'F-TECH-2-2'),
((SELECT id FROM mpage_dimension WHERE code='D-ORG-1'), 'Documentation', 'F-ORG-1-1'),
((SELECT id FROM mpage_dimension WHERE code='D-ORG-1'), 'Quality Control', 'F-ORG-1-2'),
((SELECT id FROM mpage_dimension WHERE code='D-ORG-2'), 'Skills', 'F-ORG-2-1'),
((SELECT id FROM mpage_dimension WHERE code='D-ORG-2'), 'Budget', 'F-ORG-2-2');

-- 5. Items (24 questions)
INSERT INTO mpage_item (factor_id, label, code) VALUES
((SELECT id FROM mpage_factor WHERE code='F-GOV-1-1'), 'Does the organization have an AI strategy aligned with its objectives?', 'Q-GOV-1-1-1'),
((SELECT id FROM mpage_factor WHERE code='F-GOV-1-1'), 'Are AI performance indicators monitored regularly?', 'Q-GOV-1-1-2'),
((SELECT id FROM mpage_factor WHERE code='F-GOV-1-2'), 'Is there an algorithm oversight committee?', 'Q-GOV-1-2-1'),
((SELECT id FROM mpage_factor WHERE code='F-GOV-1-2'), 'Are algorithmic decisions reviewed periodically?', 'Q-GOV-1-2-2'),
((SELECT id FROM mpage_factor WHERE code='F-GOV-2-1'), 'Does the organization comply with applicable AI regulations?', 'Q-GOV-2-1-1'),
((SELECT id FROM mpage_factor WHERE code='F-GOV-2-1'), 'Is a regulatory watch process in place?', 'Q-GOV-2-1-2'),
((SELECT id FROM mpage_factor WHERE code='F-GOV-2-2'), 'Has an AI ethics code been formalized?', 'Q-GOV-2-2-1'),
((SELECT id FROM mpage_factor WHERE code='F-GOV-2-2'), 'Are stakeholders consulted on ethical issues?', 'Q-GOV-2-2-2'),
((SELECT id FROM mpage_factor WHERE code='F-TECH-1-1'), 'Do datasets cover the diversity of use cases?', 'Q-TECH-1-1-1'),
((SELECT id FROM mpage_factor WHERE code='F-TECH-1-1'), 'Are missing data identified and handled?', 'Q-TECH-1-1-2'),
((SELECT id FROM mpage_factor WHERE code='F-TECH-1-2'), 'Is data verified and validated before use?', 'Q-TECH-1-2-1'),
((SELECT id FROM mpage_factor WHERE code='F-TECH-1-2'), 'Is a data update process defined?', 'Q-TECH-1-2-2'),
((SELECT id FROM mpage_factor WHERE code='F-TECH-2-1'), 'Are AI systems protected against cyberattacks?', 'Q-TECH-2-1-1'),
((SELECT id FROM mpage_factor WHERE code='F-TECH-2-1'), 'Are model accesses controlled and traced?', 'Q-TECH-2-1-2'),
((SELECT id FROM mpage_factor WHERE code='F-TECH-2-2'), 'Are continuity plans in place for AI failures?', 'Q-TECH-2-2-1'),
((SELECT id FROM mpage_factor WHERE code='F-TECH-2-2'), 'Do critical systems have fallback mechanisms?', 'Q-TECH-2-2-2'),
((SELECT id FROM mpage_factor WHERE code='F-ORG-1-1'), 'Are algorithmic processes documented?', 'Q-ORG-1-1-1'),
((SELECT id FROM mpage_factor WHERE code='F-ORG-1-1'), 'Is documentation kept up to date?', 'Q-ORG-1-1-2'),
((SELECT id FROM mpage_factor WHERE code='F-ORG-1-2'), 'Are quality controls applied to algorithm outputs?', 'Q-ORG-1-2-1'),
((SELECT id FROM mpage_factor WHERE code='F-ORG-1-2'), 'Are detected anomalies corrected within a defined timeframe?', 'Q-ORG-1-2-2'),
((SELECT id FROM mpage_factor WHERE code='F-ORG-2-1'), 'Does staff have the necessary skills to manage AI?', 'Q-ORG-2-1-1'),
((SELECT id FROM mpage_factor WHERE code='F-ORG-2-1'), 'Are AI training programs offered regularly?', 'Q-ORG-2-1-2'),
((SELECT id FROM mpage_factor WHERE code='F-ORG-2-2'), 'Is a dedicated AI governance budget allocated?', 'Q-ORG-2-2-1'),
((SELECT id FROM mpage_factor WHERE code='F-ORG-2-2'), 'Are AI investments evaluated in terms of ROI?', 'Q-ORG-2-2-2');


-- ================================================================
-- 6. O-PAGe: Risks
-- ================================================================
INSERT INTO "OPAGe_risk" (name, description, project_id)
VALUES
('Algorithmic Bias', 'Risk of discrimination in automated decisions', (SELECT id FROM mpage_project WHERE name='Project Alpha' LIMIT 1)),
('Decision Opacity', 'Lack of transparency in AI processes', (SELECT id FROM mpage_project WHERE name='Project Alpha' LIMIT 1)),
('Personal Data Breach', 'Risk of privacy violation by algorithms', (SELECT id FROM mpage_project WHERE name='Project Alpha' LIMIT 1));

-- 7. O-PAGe Indicators
INSERT INTO "OPAGe_indicator" (risk_id, label, weight, status, val_min, val_max)
VALUES
((SELECT id FROM "OPAGe_risk" WHERE name='Algorithmic Bias' LIMIT 1), 'False positive rate', 0.4, 'NEGATIVE', 0, 1),
((SELECT id FROM "OPAGe_risk" WHERE name='Algorithmic Bias' LIMIT 1), 'Fairness score', 0.35, 'POSITIVE', 0, 1),
((SELECT id FROM "OPAGe_risk" WHERE name='Algorithmic Bias' LIMIT 1), 'Data diversity', 0.25, 'POSITIVE', 0, 1),
((SELECT id FROM "OPAGe_risk" WHERE name='Decision Opacity' LIMIT 1), 'Explainability score', 0.5, 'POSITIVE', 0, 1),
((SELECT id FROM "OPAGe_risk" WHERE name='Decision Opacity' LIMIT 1), 'Complaint rate', 0.3, 'NEGATIVE', 0, 1),
((SELECT id FROM "OPAGe_risk" WHERE name='Decision Opacity' LIMIT 1), 'Available documentation', 0.2, 'POSITIVE', 0, 1),
((SELECT id FROM "OPAGe_risk" WHERE name='Personal Data Breach' LIMIT 1), 'Security incidents', 0.5, 'NEGATIVE', 0, 1),
((SELECT id FROM "OPAGe_risk" WHERE name='Personal Data Breach' LIMIT 1), 'GDPR compliance', 0.3, 'POSITIVE', 0, 1),
((SELECT id FROM "OPAGe_risk" WHERE name='Personal Data Breach' LIMIT 1), 'Data encryption', 0.2, 'POSITIVE', 0, 1);

-- 8. Indicator values
INSERT INTO "OPAGe_indicatorvalue" (indicator_id, raw_value, normalized_value, created_at)
VALUES
((SELECT id FROM "OPAGe_indicator" WHERE label='False positive rate' LIMIT 1), 0.65, 0.35, NOW()),
((SELECT id FROM "OPAGe_indicator" WHERE label='Fairness score' LIMIT 1), 0.45, 0.45, NOW()),
((SELECT id FROM "OPAGe_indicator" WHERE label='Data diversity' LIMIT 1), 0.55, 0.55, NOW()),
((SELECT id FROM "OPAGe_indicator" WHERE label='Explainability score' LIMIT 1), 0.30, 0.30, NOW()),
((SELECT id FROM "OPAGe_indicator" WHERE label='Complaint rate' LIMIT 1), 0.70, 0.30, NOW()),
((SELECT id FROM "OPAGe_indicator" WHERE label='Available documentation' LIMIT 1), 0.40, 0.40, NOW()),
((SELECT id FROM "OPAGe_indicator" WHERE label='Security incidents' LIMIT 1), 0.80, 0.20, NOW()),
((SELECT id FROM "OPAGe_indicator" WHERE label='GDPR compliance' LIMIT 1), 0.35, 0.35, NOW()),
((SELECT id FROM "OPAGe_indicator" WHERE label='Data encryption' LIMIT 1), 0.60, 0.60, NOW());

-- 9. Risk Scores
INSERT INTO "OPAGe_riskscore" (risk_id, score, category, calculated_date)
VALUES
((SELECT id FROM "OPAGe_risk" WHERE name='Algorithmic Bias' LIMIT 1), 0.435, 'MODERATE', NOW()),
((SELECT id FROM "OPAGe_risk" WHERE name='Decision Opacity' LIMIT 1), 0.32, 'MODERATE', NOW()),
((SELECT id FROM "OPAGe_risk" WHERE name='Personal Data Breach' LIMIT 1), 0.325, 'MODERATE', NOW());

-- 10. O-PAGe Key Pillars
INSERT INTO "OPAGe_keypillar" (name, type, project_id)
VALUES
('AI Governance', 'governance', (SELECT id FROM mpage_project WHERE name='Project Alpha' LIMIT 1)),
('Technical & Security', 'technical', (SELECT id FROM mpage_project WHERE name='Project Alpha' LIMIT 1)),
('Organizational', 'organizational', (SELECT id FROM mpage_project WHERE name='Project Alpha' LIMIT 1));

-- 11. O-PAGe RMMs
INSERT INTO "OPAGe_rmm" (risk_id, name, description, project_id)
VALUES
((SELECT id FROM "OPAGe_risk" WHERE name='Algorithmic Bias' LIMIT 1), 'Regular algorithmic audit', 'Periodic audits of models and training data', (SELECT id FROM mpage_project WHERE name='Project Alpha' LIMIT 1)),
((SELECT id FROM "OPAGe_risk" WHERE name='Algorithmic Bias' LIMIT 1), 'Technical data improvements', 'Improve data quality and coverage', (SELECT id FROM mpage_project WHERE name='Project Alpha' LIMIT 1)),
((SELECT id FROM "OPAGe_risk" WHERE name='Decision Opacity' LIMIT 1), 'Transparency program', 'Publication of explainability reports', (SELECT id FROM mpage_project WHERE name='Project Alpha' LIMIT 1)),
((SELECT id FROM "OPAGe_risk" WHERE name='Decision Opacity' LIMIT 1), 'Training & awareness', 'Ongoing staff training on AI governance', (SELECT id FROM mpage_project WHERE name='Project Alpha' LIMIT 1)),
((SELECT id FROM "OPAGe_risk" WHERE name='Personal Data Breach' LIMIT 1), 'Enhanced data protection', 'Multi-layer encryption and access controls', (SELECT id FROM mpage_project WHERE name='Project Alpha' LIMIT 1)),
((SELECT id FROM "OPAGe_risk" WHERE name='Personal Data Breach' LIMIT 1), 'Data governance framework', 'Formal data governance program', (SELECT id FROM mpage_project WHERE name='Project Alpha' LIMIT 1));

-- 12. O-PAGe RMM Key Pillar Weights
INSERT INTO "OPAGe_rmmkeypillarweight" (rmm_id, key_pillar_id, weight)
SELECT rmm.id, kp.id,
  CASE kp.name WHEN 'AI Governance' THEN 0.30 WHEN 'Technical & Security' THEN 0.45 WHEN 'Organizational' THEN 0.25 END
FROM "OPAGe_rmm" rmm CROSS JOIN "OPAGe_keypillar" kp WHERE rmm.name='Regular algorithmic audit';

INSERT INTO "OPAGe_rmmkeypillarweight" (rmm_id, key_pillar_id, weight)
SELECT rmm.id, kp.id,
  CASE kp.name WHEN 'AI Governance' THEN 0.15 WHEN 'Technical & Security' THEN 0.60 WHEN 'Organizational' THEN 0.25 END
FROM "OPAGe_rmm" rmm CROSS JOIN "OPAGe_keypillar" kp WHERE rmm.name='Technical data improvements';

INSERT INTO "OPAGe_rmmkeypillarweight" (rmm_id, key_pillar_id, weight)
SELECT rmm.id, kp.id,
  CASE kp.name WHEN 'AI Governance' THEN 0.40 WHEN 'Technical & Security' THEN 0.25 WHEN 'Organizational' THEN 0.35 END
FROM "OPAGe_rmm" rmm CROSS JOIN "OPAGe_keypillar" kp WHERE rmm.name='Transparency program';

INSERT INTO "OPAGe_rmmkeypillarweight" (rmm_id, key_pillar_id, weight)
SELECT rmm.id, kp.id,
  CASE kp.name WHEN 'AI Governance' THEN 0.25 WHEN 'Technical & Security' THEN 0.20 WHEN 'Organizational' THEN 0.55 END
FROM "OPAGe_rmm" rmm CROSS JOIN "OPAGe_keypillar" kp WHERE rmm.name='Training & awareness';

INSERT INTO "OPAGe_rmmkeypillarweight" (rmm_id, key_pillar_id, weight)
SELECT rmm.id, kp.id,
  CASE kp.name WHEN 'AI Governance' THEN 0.20 WHEN 'Technical & Security' THEN 0.55 WHEN 'Organizational' THEN 0.25 END
FROM "OPAGe_rmm" rmm CROSS JOIN "OPAGe_keypillar" kp WHERE rmm.name='Enhanced data protection';

INSERT INTO "OPAGe_rmmkeypillarweight" (rmm_id, key_pillar_id, weight)
SELECT rmm.id, kp.id,
  CASE kp.name WHEN 'AI Governance' THEN 0.35 WHEN 'Technical & Security' THEN 0.40 WHEN 'Organizational' THEN 0.25 END
FROM "OPAGe_rmm" rmm CROSS JOIN "OPAGe_keypillar" kp WHERE rmm.name='Data governance framework';


-- ================================================================
-- 13. M-PAGe RMMs
-- ================================================================
INSERT INTO mpage_rmm (project_id, name, description, associated_risk_id, associated_risk_name)
VALUES
((SELECT id FROM mpage_project WHERE name='Project Alpha' LIMIT 1), 'Regular algorithmic audit', 'Periodic audits of models', (SELECT id FROM "OPAGe_risk" WHERE name='Algorithmic Bias' LIMIT 1), 'Algorithmic Bias'),
((SELECT id FROM mpage_project WHERE name='Project Alpha' LIMIT 1), 'Technical data improvements', 'Improve data quality and coverage', (SELECT id FROM "OPAGe_risk" WHERE name='Algorithmic Bias' LIMIT 1), 'Algorithmic Bias'),
((SELECT id FROM mpage_project WHERE name='Project Alpha' LIMIT 1), 'Transparency program', 'Publication of explainability reports', (SELECT id FROM "OPAGe_risk" WHERE name='Decision Opacity' LIMIT 1), 'Decision Opacity'),
((SELECT id FROM mpage_project WHERE name='Project Alpha' LIMIT 1), 'Training & awareness', 'Ongoing staff training', (SELECT id FROM "OPAGe_risk" WHERE name='Decision Opacity' LIMIT 1), 'Decision Opacity'),
((SELECT id FROM mpage_project WHERE name='Project Alpha' LIMIT 1), 'Enhanced data protection', 'Multi-layer encryption and access controls', (SELECT id FROM "OPAGe_risk" WHERE name='Personal Data Breach' LIMIT 1), 'Personal Data Breach'),
((SELECT id FROM mpage_project WHERE name='Project Alpha' LIMIT 1), 'Data governance framework', 'Formal data governance program', (SELECT id FROM "OPAGe_risk" WHERE name='Personal Data Breach' LIMIT 1), 'Personal Data Breach');

-- 14. M-PAGe RMM Key Pillar Weights
INSERT INTO mpage_rmm_kp_weight (rmm_id, key_pillar_id, weight)
SELECT rmm.id, kp.id,
  CASE kp.code WHEN 'P-GOV' THEN 0.30 WHEN 'P-TECH' THEN 0.45 WHEN 'P-ORG' THEN 0.25 END
FROM mpage_rmm rmm CROSS JOIN mpage_keypillar kp
WHERE rmm.name='Regular algorithmic audit' AND kp.code IN ('P-GOV','P-TECH','P-ORG');

INSERT INTO mpage_rmm_kp_weight (rmm_id, key_pillar_id, weight)
SELECT rmm.id, kp.id,
  CASE kp.code WHEN 'P-GOV' THEN 0.15 WHEN 'P-TECH' THEN 0.60 WHEN 'P-ORG' THEN 0.25 END
FROM mpage_rmm rmm CROSS JOIN mpage_keypillar kp
WHERE rmm.name='Technical data improvements' AND kp.code IN ('P-GOV','P-TECH','P-ORG');

INSERT INTO mpage_rmm_kp_weight (rmm_id, key_pillar_id, weight)
SELECT rmm.id, kp.id,
  CASE kp.code WHEN 'P-GOV' THEN 0.40 WHEN 'P-TECH' THEN 0.25 WHEN 'P-ORG' THEN 0.35 END
FROM mpage_rmm rmm CROSS JOIN mpage_keypillar kp
WHERE rmm.name='Transparency program' AND kp.code IN ('P-GOV','P-TECH','P-ORG');

INSERT INTO mpage_rmm_kp_weight (rmm_id, key_pillar_id, weight)
SELECT rmm.id, kp.id,
  CASE kp.code WHEN 'P-GOV' THEN 0.25 WHEN 'P-TECH' THEN 0.20 WHEN 'P-ORG' THEN 0.55 END
FROM mpage_rmm rmm CROSS JOIN mpage_keypillar kp
WHERE rmm.name='Training & awareness' AND kp.code IN ('P-GOV','P-TECH','P-ORG');

INSERT INTO mpage_rmm_kp_weight (rmm_id, key_pillar_id, weight)
SELECT rmm.id, kp.id,
  CASE kp.code WHEN 'P-GOV' THEN 0.20 WHEN 'P-TECH' THEN 0.55 WHEN 'P-ORG' THEN 0.25 END
FROM mpage_rmm rmm CROSS JOIN mpage_keypillar kp
WHERE rmm.name='Enhanced data protection' AND kp.code IN ('P-GOV','P-TECH','P-ORG');

INSERT INTO mpage_rmm_kp_weight (rmm_id, key_pillar_id, weight)
SELECT rmm.id, kp.id,
  CASE kp.code WHEN 'P-GOV' THEN 0.35 WHEN 'P-TECH' THEN 0.40 WHEN 'P-ORG' THEN 0.25 END
FROM mpage_rmm rmm CROSS JOIN mpage_keypillar kp
WHERE rmm.name='Data governance framework' AND kp.code IN ('P-GOV','P-TECH','P-ORG');

-- ================================================================
-- 15. Campaign + Responses + Results
-- ================================================================
INSERT INTO mpage_campaign (project_id, name, organization, status, launch_date)
VALUES ((SELECT id FROM mpage_project WHERE name='Project Alpha' LIMIT 1), 'Q2 2026 Assessment', 'IT Department', 'completed', '2026-06-01');

INSERT INTO mpage_item_response (campaign_id, item_id, response, comment)
SELECT (SELECT id FROM mpage_campaign WHERE name='Q2 2026 Assessment' LIMIT 1), i.id,
  CASE i.code
    WHEN 'Q-GOV-1-1-1' THEN 4 WHEN 'Q-GOV-1-1-2' THEN 3
    WHEN 'Q-GOV-1-2-1' THEN 4 WHEN 'Q-GOV-1-2-2' THEN 3
    WHEN 'Q-GOV-2-1-1' THEN 4 WHEN 'Q-GOV-2-1-2' THEN 2
    WHEN 'Q-GOV-2-2-1' THEN 3 WHEN 'Q-GOV-2-2-2' THEN 2
    WHEN 'Q-TECH-1-1-1' THEN 3 WHEN 'Q-TECH-1-1-2' THEN 4
    WHEN 'Q-TECH-1-2-1' THEN 4 WHEN 'Q-TECH-1-2-2' THEN 3
    WHEN 'Q-TECH-2-1-1' THEN 5 WHEN 'Q-TECH-2-1-2' THEN 4
    WHEN 'Q-TECH-2-2-1' THEN 3 WHEN 'Q-TECH-2-2-2' THEN 2
    WHEN 'Q-ORG-1-1-1' THEN 3 WHEN 'Q-ORG-1-1-2' THEN 2
    WHEN 'Q-ORG-1-2-1' THEN 4 WHEN 'Q-ORG-1-2-2' THEN 3
    WHEN 'Q-ORG-2-1-1' THEN 3 WHEN 'Q-ORG-2-1-2' THEN 2
    WHEN 'Q-ORG-2-2-1' THEN 4 WHEN 'Q-ORG-2-2-2' THEN 3
  END, ''
FROM mpage_item i;

-- Readiness Levels
INSERT INTO mpage_readiness_level (campaign_id, key_pillar_id, rmm_id, score)
SELECT (SELECT id FROM mpage_campaign WHERE name='Q2 2026 Assessment' LIMIT 1), kp.id, NULL,
  CASE kp.code WHEN 'P-GOV' THEN 0.5625 WHEN 'P-TECH' THEN 0.5938 WHEN 'P-ORG' THEN 0.5000 END
FROM mpage_keypillar kp WHERE kp.code IN ('P-GOV','P-TECH','P-ORG');

-- RMMC
INSERT INTO mpage_rmmc_result (campaign_id, rmm_id, score)
SELECT (SELECT id FROM mpage_campaign WHERE name='Q2 2026 Assessment' LIMIT 1), rmm.id, 0.56
FROM mpage_rmm rmm;

-- RMC
INSERT INTO mpage_rmc_result (campaign_id, risk_id, risk_name, score)
VALUES
((SELECT id FROM mpage_campaign WHERE name='Q2 2026 Assessment' LIMIT 1), (SELECT id FROM "OPAGe_risk" WHERE name='Algorithmic Bias' LIMIT 1), 'Algorithmic Bias', 0.56),
((SELECT id FROM mpage_campaign WHERE name='Q2 2026 Assessment' LIMIT 1), (SELECT id FROM "OPAGe_risk" WHERE name='Decision Opacity' LIMIT 1), 'Decision Opacity', 0.55),
((SELECT id FROM mpage_campaign WHERE name='Q2 2026 Assessment' LIMIT 1), (SELECT id FROM "OPAGe_risk" WHERE name='Personal Data Breach' LIMIT 1), 'Personal Data Breach', 0.56);

-- GPM
INSERT INTO mpage_gpm_result (campaign_id, score)
VALUES ((SELECT id FROM mpage_campaign WHERE name='Q2 2026 Assessment' LIMIT 1), 0.556);

-- ================================================================
-- 16. I-PAGe Scenarios
-- ================================================================
INSERT INTO ipage_scenario (project_id, name, description, created_at)
VALUES
((SELECT id FROM mpage_project WHERE name='Project Alpha' LIMIT 1), 'Governance & technical strengthening', 'Scenario combining governance controls and technical actions to reduce risk.', NOW()),
((SELECT id FROM mpage_project WHERE name='Project Alpha' LIMIT 1), 'Compliance-focused approach', 'Scenario centered on regulatory compliance and formal audits.', NOW()),
((SELECT id FROM mpage_project WHERE name='Project Alpha' LIMIT 1), 'Full mitigation', 'All mechanisms activated at maximum level.', NOW());

COMMIT;
