-- ================================================================
-- Nettoyage complet - GARDE le compte admin
-- ================================================================

BEGIN;

-- I-PAGe (seulement scénarios, les tables mechanism ne sont plus utilisées)
DELETE FROM ipage_simulation_result;
DELETE FROM ipage_simulation_mechanism;
DELETE FROM ipage_simulation;
DELETE FROM ipage_scenario_mechanism;
DELETE FROM ipage_mechanism_effect;
DELETE FROM ipage_mechanism;
DELETE FROM ipage_scenario;
DELETE FROM ipage_indicator;

-- M-PAGe résultats
DELETE FROM mpage_gpm_result;
DELETE FROM mpage_rmc_result;
DELETE FROM mpage_rmmc_result;
DELETE FROM mpage_readiness_level;
DELETE FROM mpage_item_response;
DELETE FROM mpage_campaign;

-- M-PAGe référentiel
DELETE FROM mpage_rmm_kp_weight;
DELETE FROM mpage_rmm;
DELETE FROM mpage_item;
DELETE FROM mpage_factor;
DELETE FROM mpage_dimension;
DELETE FROM mpage_keypillar;

-- O-PAGe
DELETE FROM "OPAGe_rmmkeypillarweight";
DELETE FROM "OPAGe_rmm";
DELETE FROM "OPAGe_riskscore";
DELETE FROM "OPAGe_indicatorvalue";
DELETE FROM "OPAGe_indicator";
DELETE FROM "OPAGe_risk";
DELETE FROM "OPAGe_keypillar";


COMMIT;
