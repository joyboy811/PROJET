import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { opageApi, type OPageIndicator, type OPageRisk } from '../../services/api';
import {
  AlertTriangle,
  RefreshCw,
  TrendingUp,
  Activity,
  ShieldAlert,
} from 'lucide-react';

export function OPageRisks() {
  const { user } = useAuth();
  const isAuditor = user?.role === 'auditeur';
  const [risks, setRisks] = useState<OPageRisk[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [indicatorInputs, setIndicatorInputs] = useState<Record<number, string>>({});
  const [indicatorSubmitting, setIndicatorSubmitting] = useState<Record<number, boolean>>({});

  const fetchRisks = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await opageApi.risks();
      // The API may return results array or direct array
      setRisks(Array.isArray(data) ? data : (data as any).results || []);
    } catch (e: any) {
      setError(e.message || 'Unable to retrieve risks from O-PAGe');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRisks();
  }, []);

  const handleIndicatorChange = (indicatorId: number, value: string) => {
    setIndicatorInputs((prev) => ({ ...prev, [indicatorId]: value }));
  };

  const submitIndicatorValue = async (indicatorId: number) => {
    const rawValue = Number(indicatorInputs[indicatorId]);
    if (Number.isNaN(rawValue)) {
      setError('Please enter a valid numeric value for the indicator.');
      return;
    }

    setIndicatorSubmitting((prev) => ({ ...prev, [indicatorId]: true }));
    setError('');
    setSuccessMessage('');
    try {
      await opageApi.createIndicatorValue({ indicator: indicatorId, raw_value: rawValue });
      setSuccessMessage('Value recorded successfully.');
      setIndicatorInputs((prev) => ({ ...prev, [indicatorId]: '' }));
      fetchRisks();
    } catch (e: any) {
      setError(e.message || 'Unable to save the indicator value.');
    } finally {
      setIndicatorSubmitting((prev) => ({ ...prev, [indicatorId]: false }));
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category?.toUpperCase()) {
      case 'LOW':
        return { bg: 'bg-green-100', text: 'text-green-800', bar: 'bg-green-500', label: 'Low' };
      case 'MODERATE':
        return { bg: 'bg-yellow-100', text: 'text-yellow-800', bar: 'bg-yellow-500', label: 'Moderate' };
      case 'HIGH':
        return { bg: 'bg-orange-100', text: 'text-orange-800', bar: 'bg-orange-500', label: 'High' };
      case 'CRITICAL':
        return { bg: 'bg-red-100', text: 'text-red-800', bar: 'bg-red-600', label: 'Critical' };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-800', bar: 'bg-gray-400', label: 'N/A' };
    }
  };

  const getLatestScore = (risk: OPageRisk) => {
    if (risk.scores && risk.scores.length > 0) {
      return risk.scores[risk.scores.length - 1];
    }
    return null;
  };

  // Global metrics
  const risksWithScores = risks.filter((r) => getLatestScore(r));
  const avgScore =
    risksWithScores.length > 0
      ? risksWithScores.reduce((acc, r) => acc + (getLatestScore(r)?.score || 0), 0) /
        risksWithScores.length
      : 0;
  const criticalCount = risksWithScores.filter(
    (r) => getLatestScore(r)?.category?.toUpperCase() === 'CRITICAL'
  ).length;
  const highCount = risksWithScores.filter(
    (r) => getLatestScore(r)?.category?.toUpperCase() === 'HIGH'
  ).length;

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">
            O-PAGe Risks
          </h1>
          <p className="text-gray-600 mt-2">
            {isAuditor
              ? 'Record raw indicator values for each risk.'
              : 'Risks identified by the O-PAGe observatory.'}
          </p>
        </div>
        <button
          onClick={fetchRisks}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-red-900">Connection error</p>
            <p className="text-sm text-red-700 mt-1">{error}</p>
            <p className="text-xs text-red-600 mt-2">
              Make sure the O-PAGe platform is running (port 8000).
            </p>
          </div>
        </div>
      )}

      {/* Metrics */}
      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-gray-600">Identified risks</p>
              <Activity className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-3xl font-semibold text-gray-900">{risks.length}</p>
            <p className="text-xs text-gray-500 mt-2">From O-PAGe</p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-gray-600">Average score</p>
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-3xl font-semibold text-gray-900">
              {(avgScore * 100).toFixed(0)}%
            </p>
            <p className="text-xs text-gray-500 mt-2">Average severity</p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-gray-600">Critical risks</p>
              <ShieldAlert className="w-5 h-5 text-red-600" />
            </div>
            <p className="text-3xl font-semibold text-red-600">{criticalCount}</p>
            <p className="text-xs text-gray-500 mt-2">Critical level</p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-gray-600">High risks</p>
              <AlertTriangle className="w-5 h-5 text-orange-600" />
            </div>
            <p className="text-3xl font-semibold text-orange-600">{highCount}</p>
            <p className="text-xs text-gray-500 mt-2">High level</p>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading risks from O-PAGe...</p>
        </div>
      )}
      {/* Risks Table */}
      {!loading && !error && successMessage && (
        <div className="mb-6 rounded-3xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
          {successMessage}
        </div>
      )}
      {!loading && !error && risks.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Risk table
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Data from the O-PAGe observatory
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">
                    Risk
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">
                    Score
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">
                    Level
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">
                    Indicators
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">
                    Mechanisms (RMM)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {risks.map((risk) => {
                  const latestScore = getLatestScore(risk);
                  const scoreVal = latestScore?.score || 0;
                  const cat = getCategoryColor(latestScore?.category || '');
                  const indicatorCount = risk.indicators?.length || 0;
                  const rmmCount = risk.rmms?.length || 0;

                  return (
                    <tr key={risk.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900">{risk.name}</p>
                          {risk.description && (
                            <p className="text-xs text-gray-500 mt-1 max-w-xs truncate">
                              {risk.description}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 bg-gray-200 rounded-full h-2.5 max-w-[120px]">
                            <div
                              className={`${cat.bar} h-2.5 rounded-full transition-all`}
                              style={{ width: `${scoreVal * 100}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-gray-700">
                            {(scoreVal * 100).toFixed(1)}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${cat.bg} ${cat.text}`}
                        >
                          {cat.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600">
                          {indicatorCount} indicator{indicatorCount > 1 ? 's' : ''}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600">
                          {rmmCount} RMM
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Indicators detail per risk */}
      {!loading && !error && risks.length > 0 && (
        <div className="mt-8 space-y-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Indicator details by risk
          </h2>
          {risks.map((risk) => (
            <div
              key={risk.id}
              className="bg-white rounded-lg border border-gray-200 overflow-hidden"
            >
              <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                <h3 className="font-medium text-gray-900">{risk.name}</h3>
                {getLatestScore(risk) && (
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                      getCategoryColor(getLatestScore(risk)?.category || '').bg
                    } ${getCategoryColor(getLatestScore(risk)?.category || '').text}`}
                  >
                    Score: {((getLatestScore(risk)?.score || 0) * 100).toFixed(1)}%
                  </span>
                )}
              </div>
              {risk.indicators && risk.indicators.length > 0 ? (
                <div className="p-4">
                  <table className="w-full">
                    <thead>
                      <tr className="text-xs text-gray-500 uppercase">
                        <th className="text-left pb-2">Indicateur</th>
                        <th className="text-left pb-2">Weight</th>
                        <th className="text-left pb-2">Type</th>
                        <th className="text-left pb-2">Raw Value</th>
                        <th className="text-left pb-2">Normalized Value</th>
                        {isAuditor && <th className="text-left pb-2">Input</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {risk.indicators.map((ind) => (
                        <tr key={ind.id} className="text-sm">
                          <td className="py-2 text-gray-900">{ind.label}</td>
                          <td className="py-2 text-gray-600">{ind.weight}</td>
                          <td className="py-2">
                            <span className="px-2 py-0.5 bg-gray-100 rounded text-xs text-gray-700">
                              {ind.status}
                            </span>
                          </td>
                          <td className="py-2 text-gray-600">
                            {ind.latest_value?.raw_value?.toFixed(3) ?? '—'}
                          </td>
                          <td className="py-2 text-gray-600">
                            {ind.latest_value?.normalized_value?.toFixed(3) ?? '—'}
                          </td>
                          {isAuditor && (
                            <td className="py-2">
                              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                                <input
                                  type="number"
                                  step="0.01"
                                  placeholder={ind.val_min?.toString() ?? 'Value'}
                                  value={indicatorInputs[ind.id] ?? ''}
                                  onChange={(e) => handleIndicatorChange(ind.id, e.target.value)}
                                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900"
                                />
                                <button
                                  onClick={() => submitIndicatorValue(ind.id)}
                                  disabled={indicatorSubmitting[ind.id]}
                                  className="rounded-2xl bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
                                >
                                  {indicatorSubmitting[ind.id] ? 'Sending...' : 'Submit'}
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-4 text-center text-sm text-gray-500">
                  No indicator entered
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && risks.length === 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No risks found
          </h3>
          <p className="text-gray-600">
            The O-PAGe platform does not contain any risks yet.
          </p>
        </div>
      )}

      {/* Info */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> The data above is retrieved in real time
          from the O-PAGe API. Any changes in O-PAGe will be automatically reflected
          here when refreshed.
        </p>
      </div>
    </div>
  );
}
