import React, { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { campaignsApi, opageApi, rmmsApi, type Campaign, type CampaignResults, type OPageRisk, type OPageKeyPillar, type RMM } from '../../services/api';
import { TrendingUp, Shield, AlertTriangle, FileText } from 'lucide-react';

export function AuditorDashboard() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [completedCampaigns, setCompletedCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState<number | null>(null);
  const [results, setResults] = useState<CampaignResults | null>(null);
  const [opageRisks, setOpageRisks] = useState<OPageRisk[]>([]);
  const [opagePillars, setOpagePillars] = useState<OPageKeyPillar[]>([]);
  const [rmms, setRmms] = useState<RMM[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchCampaignResults = async (campaignId: number) => {
    try {
      const resultsData = await campaignsApi.results(campaignId);
      const hasResults =
        resultsData?.gpm?.length ||
        resultsData?.rmc?.length ||
        resultsData?.readiness_levels?.length;

      setResults(hasResults ? resultsData : null);
    } catch (e: any) {
      setError(e.message || 'Unable to load selected campaign results.');
      setResults(null);
    }
  };

  const fetchDashboard = async () => {
    setLoading(true);
    setError('');

    try {
      const campaignsData = await campaignsApi.list();
      setCampaigns(campaignsData);

      const completed = campaignsData.filter((campaign) => campaign.status === 'completed');
      setCompletedCampaigns(completed);

      const opageRisksData = await opageApi.risks();
      setOpageRisks(Array.isArray(opageRisksData) ? opageRisksData : (opageRisksData as any).results || []);

      const opagePillarsData = await opageApi.keyPillars();
      setOpagePillars(Array.isArray(opagePillarsData) ? opagePillarsData : (opagePillarsData as any).results || []);

      const rmmsData = await rmmsApi.list();
      setRmms(rmmsData);

      const initialCampaign =
        completed.find((campaign) => campaign.progress > 0) ||
        completed[0] ||
        campaignsData[0] ||
        null;
      if (initialCampaign) {
        setSelectedCampaignId(initialCampaign.id);
        await fetchCampaignResults(initialCampaign.id);
      } else {
        setResults(null);
      }
    } catch (e: any) {
      setError(e.message || 'Unable to load M-PAGe results.');
      setResults(null);
    } finally {
      setLoading(false);
    }
  };

  const gpmGlobal = results?.gpm?.[0]?.score || 0;
  const criticalPillars = results?.readiness_levels?.filter(
    (p: any) => p.score < 0.25
  ).length || 0;
  const campaignsAnalyzed = campaigns.filter((campaign) => campaign.status === 'completed').length;

  const getScoreColor = (score: number) => {
    if (score >= 0.7) return 'bg-green-600';
    if (score >= 0.5) return 'bg-yellow-500';
    return 'bg-red-600';
  };

  const getScoreTextColor = (score: number) => {
    if (score >= 0.7) return 'text-green-600';
    if (score >= 0.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getLatestOPageRiskScore = (risk: OPageRisk) => {
    const latestScore = risk.scores?.slice().sort((a, b) => new Date(b.calculated_date).getTime() - new Date(a.calculated_date).getTime())[0];
    if (latestScore) {
      return latestScore.score;
    }

    if (!risk.indicators?.length) {
      return 0;
    }

    return risk.indicators.reduce((sum, indicator) => {
      const normalized = indicator.latest_value?.normalized_value;
      if (normalized == null) {
        return sum;
      }
      return sum + indicator.weight * normalized;
    }, 0);
  };

  const mechanismsByRiskId = new Map<number, RMM>(
    rmms.map((mechanism: RMM) => [mechanism.associated_risk_id, mechanism])
  );
  const mpageRiskIds = new Set(results?.rmc?.map((risk: any) => risk.risk_id) ?? []);
  const mergedRiskRows = [
    ...(results?.rmc ?? []).map((risk: any) => {
      const mechanism = mechanismsByRiskId.get(risk.risk_id);
      return {
        key: mechanism ? String(mechanism.id) : `risk-${risk.risk_id}`,
        routeId: mechanism ? mechanism.id : `risk-${risk.risk_id}`,
        label: risk.risk_name,
        score: risk.score,
        source: 'mpage' as const,
        hasMechanism: Boolean(mechanism),
      };
    }),
    ...opageRisks
      .filter((risk: any) => !mpageRiskIds.has(risk.id))
      .map((risk: any) => {
        const mechanism = (risk.rmms || [])[0];
        return {
          key: mechanism ? String(mechanism.id) : `risk-${risk.id}`,
          routeId: mechanism ? mechanism.id : `risk-${risk.id}`,
          label: risk.name,
          score: getLatestOPageRiskScore(risk),
          source: 'opage' as const,
          hasMechanism: Boolean(mechanism),
        };
      }),
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900">
          Evaluation results
        </h1>
        <p className="text-gray-600 mt-2">
          Overview of M-PAGe results for evaluated campaigns
        </p>
      </div>

      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm text-gray-500">Selected campaign</p>
          <select
            value={selectedCampaignId ?? ''}
            onChange={(event) => {
              const id = Number(event.target.value);
              setSelectedCampaignId(id);
              fetchCampaignResults(id);
            }}
            className="mt-2 w-full max-w-sm rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          >
            {completedCampaigns.length > 0 ? (
              completedCampaigns.map((campaign) => (
                <option key={campaign.id} value={campaign.id}>
                  {campaign.name}
                </option>
              ))
            ) : (
              <option value="">No completed campaigns</option>
            )}
          </select>
        </div>

        <div className="rounded-3xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Campaigns analyzed</p>
          <p className="mt-2 text-3xl font-semibold text-gray-900">{campaigns.filter((campaign) => campaign.status === 'completed').length}</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-3xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-1 h-5 w-5 text-red-600" />
            <div>
              <p className="font-semibold text-red-900">Load error</p>
              <p>{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-gray-600">GPM Global</p>
            <TrendingUp className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-3xl font-semibold text-gray-900">
            {(gpmGlobal * 100).toFixed(0)}%
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Governance and risk mitigation
          </p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-gray-600">RMM assessed</p>
            <Shield className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-3xl font-semibold text-gray-900">
            {results?.rmmc?.length ?? 0}
          </p>
          <p className="text-xs text-gray-500 mt-2">Mitigation mechanisms</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-gray-600">
              Critical pillars
            </p>
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <p className="text-3xl font-semibold text-gray-900">
            {criticalPillars}
          </p>
          <p className="text-xs text-gray-500 mt-2">RL {'<'} 0.25</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-gray-600">
              Campaigns analyzed
            </p>
            <FileText className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-3xl font-semibold text-gray-900">
            {campaignsAnalyzed}
          </p>
          <p className="text-xs text-gray-500 mt-2">Complete evaluations</p>
        </div>
      </div>

      {loading ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center text-slate-600 shadow-sm">
          <p>Loading M-PAGe results...</p>
        </div>
      ) : !results ? (
        <div className="rounded-3xl border border-gray-200 bg-white p-12 text-center text-slate-600 shadow-sm">
          <p className="text-lg font-semibold text-gray-900">No M-PAGe results are available at the moment</p>
          <p className="mt-2 text-sm text-gray-500">Ensure a campaign is configured and M-PAGe results have been calculated.</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-8">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Mitigation capacity by risk (RMC)
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">
                      Risk
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">
                      Score RMC
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-medium text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {mergedRiskRows.map((risk) => (
                    <tr key={risk.key} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-gray-900 font-medium">
                        <span>{risk.label}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 bg-gray-200 rounded-full h-3 max-w-xs">
                            <div
                              className={`h-3 rounded-full ${getScoreColor(risk.score)}`}
                              style={{ width: `${risk.score * 100}%` }}
                            />
                          </div>
                          <span className={`text-sm font-bold ${getScoreTextColor(risk.score)}`}>
                            {(risk.score * 100).toFixed(0)}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          to={`/mechanisms/${encodeURIComponent(String(risk.routeId))}/analysis`}
                          state={{ riskLabel: risk.label }}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Analyze →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              Readiness level by pillar (RL)
            </h2>
            {opagePillars.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-6 text-center text-sm text-gray-600">
                No O-PAGe pillars available.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {opagePillars.map((pillar) => {
                  const matchingRL = results?.readiness_levels?.find(
                    (rl) =>
                      rl.pillar_name?.toLowerCase().includes(pillar.name?.toLowerCase() || '') ||
                      rl.pillar_name?.toLowerCase().includes(pillar.type?.toLowerCase() || '')
                  );
                  const score = matchingRL?.score || 0;

                  return (
                    <div key={pillar.id} className="space-y-3 p-4 border border-gray-100 rounded-xl bg-gray-50/80">
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-gray-800">{pillar.name}</p>
                        <span className={`text-sm font-bold ${getScoreTextColor(score)}`}>
                          {(score * 100).toFixed(0)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div className={`h-3 rounded-full ${getScoreColor(score)}`} style={{ width: `${score * 100}%` }} />
                      </div>
                      <div className="flex justify-between items-center text-[10px] text-gray-500 uppercase tracking-wider font-semibold">
                        <span>Fragile</span>
                        <span>Resilient</span>
                      </div>
                      <p className="text-xs text-gray-600 mt-2">Type: {pillar.type}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </>
      )}
    </div>
  );
}
