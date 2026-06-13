import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router';
import { campaignsApi, CampaignResults as ResultsType } from '../../services/api';
import { TrendingUp, Shield, AlertTriangle, FileText, ArrowLeft } from 'lucide-react';

export function CampaignResults() {
  const { id } = useParams<{ id: string }>();
  const [results, setResults] = useState<ResultsType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchResults(parseInt(id));
    }
  }, [id]);

  const fetchResults = async (campaignId: number) => {
    try {
      const data = await campaignsApi.results(campaignId);
      setResults(data);
    } catch (error) {
      console.error("Error loading results", error);
    } finally {
      setLoading(false);
    }
  };

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

  const readinessLevels = results?.readiness_levels || [];

  if (loading) return <div className="p-8 text-center">Loading results...</div>;
  if (!results) return <div className="p-8 text-center">Error: Results not found.</div>;

  const hasResponses = results.campaign.answered_items > 0 || results.campaign.progress > 0;
  if (!hasResponses) {
    return (
      <div className="p-8">
        <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-10 text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">No responses available</h2>
          <p className="text-sm text-gray-600">
            This campaign has no recorded responses yet. Import responses or run calculations to display scores.
          </p>
          <div className="mt-6">
            <Link
              to="/campaigns"
              className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Back to Campaigns
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const gpm = results.gpm[0]?.score || 0;

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <Link to="/campaigns" className="text-blue-600 hover:text-blue-800 flex items-center gap-1 mb-2 text-sm">
            <ArrowLeft className="w-4 h-4" /> Back to Campaigns
          </Link>
          <h1 className="text-3xl font-semibold text-gray-900">
            Results: {results.campaign.name}
          </h1>
          <p className="text-gray-600 mt-2">
            Institutional analysis of mitigation capability
          </p>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-gray-600">GPM Global</p>
            <TrendingUp className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-3xl font-semibold text-gray-900">
            {(gpm * 100).toFixed(1)}%
          </p>
          <p className="text-xs text-gray-500 mt-2">Overall PAGe Maturity</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-gray-600">RMC Moyenne</p>
            <Shield className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-3xl font-semibold text-gray-900">
            {(results.rmc.reduce((acc, r) => acc + r.score, 0) / (results.rmc.length || 1) * 100).toFixed(1)}%
          </p>
          <p className="text-xs text-gray-500 mt-2">Mitigation Capability</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-gray-600">Critical Pillars</p>
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <p className="text-3xl font-semibold text-gray-900">
            {readinessLevels.filter(rl => rl.score < 0.25).length}
          </p>
          <p className="text-xs text-gray-500 mt-2">Readiness Score {'<'} 25%</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-gray-600">Responses</p>
            <FileText className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-3xl font-semibold text-gray-900">
            {results.campaign.progress}%
          </p>
          <p className="text-xs text-gray-500 mt-2">Completion Rate</p>
        </div>
      </div>

      {/* Risks Table (RMC) */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-8 shadow-sm">
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900">
            Mitigation Capability by Risk (RMC)
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Risk</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Score RMC</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-gray-700">Category</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {results.rmc.map((risk) => (
                <tr key={risk.risk_id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-gray-900 font-medium">{risk.risk_name}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-gray-200 rounded-full h-3 max-w-xs">
                        <div
                          className={`h-3 rounded-full ${getScoreColor(risk.score)}`}
                          style={{ width: `${risk.score * 100}%` }}
                        />
                      </div>
                      <span className={`text-sm font-bold ${getScoreTextColor(risk.score)}`}>
                        {(risk.score * 100).toFixed(1)}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      risk.score >= 0.7 ? 'bg-green-100 text-green-700' : 
                      risk.score >= 0.5 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {risk.score >= 0.7 ? 'Optimized' : risk.score >= 0.5 ? 'Moderate' : 'Critical'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pillars Overview (RL) */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-6 border-b pb-4">
          Readiness Level by Pillar (RL)
        </h2>
        {readinessLevels.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-6 text-center text-sm text-gray-600">
            No readiness pillar available. Verify that the campaign has been calculated for O-PAGe pillars.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {readinessLevels.map((rl) => (
              <div key={rl.id} className="space-y-3 p-4 border border-gray-100 rounded-xl bg-gray-50/30">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-gray-800">{rl.pillar_name}</p>
                  <span className={`text-sm font-bold ${getScoreTextColor(rl.score)}`}>
                    {(rl.score * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full ${getScoreColor(rl.score)}`}
                    style={{ width: `${rl.score * 100}%` }}
                  />
                </div>
                <div className="flex justify-between items-center text-[10px] text-gray-500 uppercase tracking-wider font-semibold">
                  <span>Fragile</span>
                  <span>Resilient</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
