import React, { useEffect, useMemo, useState } from 'react';
import { campaignsApi, pillarsApi, opageApi, KeyPillarListItem, OPageKeyPillar, Campaign, CampaignResults, ReadinessLevel } from '../../services/api';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface PillarComparison {
  name: string;
  currentScore: number;
  previousScore: number;
}

export function ComparativeView() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [opagePillars, setOpagePillars] = useState<OPageKeyPillar[]>([]);
  const [mpagePillars, setMpagePillars] = useState<KeyPillarListItem[]>([]);
  const [currentCampaign, setCurrentCampaign] = useState<Campaign | null>(null);
  const [previousCampaign, setPreviousCampaign] = useState<Campaign | null>(null);
  const [currentResults, setCurrentResults] = useState<CampaignResults | null>(null);
  const [previousResults, setPreviousResults] = useState<CampaignResults | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const completedCampaigns = campaigns.filter((c) => c.status === 'completed');

  const getChange = (current: number, previous: number) => {
    const diff = current - previous;
    return {
      value: Math.abs(diff),
      trend: diff > 0 ? 'up' : diff < 0 ? 'down' : 'same',
    };
  };

  const pillarNameMap = useMemo(() => {
    const map = new Map<string, string>();

    mpagePillars.forEach((mp) => {
      const op = opagePillars.find(
        (opage) =>
          opage.type.toLowerCase() === mp.pillar_type.toLowerCase() ||
          opage.name.toLowerCase() === mp.name.toLowerCase(),
      );
      if (op) {
        map.set(mp.code.toLowerCase(), op.name);
        map.set(mp.pillar_type.toLowerCase(), op.name);
      }
    });

    opagePillars.forEach((op) => {
      map.set(op.type.toLowerCase(), op.name);
      map.set(op.name.toLowerCase(), op.name);
    });

    return map;
  }, [mpagePillars, opagePillars]);

  const buildComparison = () => {
    const currentLevels = currentResults?.readiness_levels || [];
    const previousLevels = previousResults?.readiness_levels || [];

    const normalizeName = (rl: { pillar_name: string; pillar_code: string }) => {
      return (
        pillarNameMap.get(rl.pillar_code.toLowerCase()) ||
        pillarNameMap.get(rl.pillar_name.toLowerCase()) ||
        rl.pillar_name
      );
    };

    const mapCurrent = currentLevels.reduce<Record<string, number>>((map, rl) => {
      map[normalizeName(rl)] = rl.score;
      return map;
    }, {});

    const mapPrevious = previousLevels.reduce<Record<string, number>>((map, rl) => {
      map[normalizeName(rl)] = rl.score;
      return map;
    }, {});

    const uniqueNames = Array.from(
      new Set([
        ...currentLevels.map((rl) => normalizeName(rl)),
        ...previousLevels.map((rl) => normalizeName(rl)),
      ]),
    );

    return uniqueNames.map((name) => ({
      name,
      currentScore: mapCurrent[name] || 0,
      previousScore: mapPrevious[name] || 0,
    }));
  };

  useEffect(() => {
    const loadCampaigns = async () => {
      try {
        const [data, opageData, mpageData] = await Promise.all([
          campaignsApi.list(),
          opageApi.keyPillars(),
          pillarsApi.list(),
        ]);

        const sorted = [...data].sort((a, b) => new Date(b.launch_date).getTime() - new Date(a.launch_date).getTime());
        setCampaigns(sorted);
        setOpagePillars(opageData);
        setMpagePillars(mpageData);

        const completed = sorted.filter((campaign) => campaign.status === 'completed');
        setCurrentCampaign(completed[0] || null);
        setPreviousCampaign(completed[1] || null);
      } catch (err) {
        setError('Unable to load campaigns.');
        console.error(err);
      }
    };

    loadCampaigns();
  }, []);

  useEffect(() => {
    const loadResults = async () => {
      if (!currentCampaign || !previousCampaign || currentCampaign.id === previousCampaign.id) {
        setCurrentResults(null);
        setPreviousResults(null);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const current = await campaignsApi.results(currentCampaign.id);
        setCurrentResults(current);
        const previous = await campaignsApi.results(previousCampaign.id);
        setPreviousResults(previous);
      } catch (err) {
        setError('Unable to load comparative results.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadResults();
  }, [currentCampaign, previousCampaign]);

  if (loading) {
    return <div className="p-8">Loading comparative data...</div>;
  }

  if (error) {
    return <div className="p-8 text-red-600">{error}</div>;
  }

  if (!currentCampaign || !previousCampaign || currentCampaign.id === previousCampaign.id) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-semibold text-gray-900">Comparative analysis</h1>
        <p className="mt-4 text-gray-600">Select two different assessments to compare their results.</p>
      </div>
    );
  }

  const currentGPM = currentResults?.gpm[0]?.score || 0;
  const previousGPM = previousResults?.gpm[0]?.score || 0;
  const gpmChange = getChange(currentGPM, previousGPM);
  const currentPillars = buildComparison();

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900">
          Comparative analysis
        </h1>
        <p className="text-gray-600 mt-2">
          Choose two assessments to compare.
        </p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
        <div className="grid sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Current campaign</label>
            <select
              value={currentCampaign?.id || ''}
              onChange={(e) => {
                const selected = completedCampaigns.find((c) => c.id === Number(e.target.value));
                setCurrentCampaign(selected || null);
              }}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="">Select a campaign</option>
              {completedCampaigns.map((campaign) => (
                <option key={campaign.id} value={campaign.id}>
                  {campaign.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Previous campaign</label>
            <select
              value={previousCampaign?.id || ''}
              onChange={(e) => {
                const selected = completedCampaigns.find((c) => c.id === Number(e.target.value));
                setPreviousCampaign(selected || null);
              }}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="">Select a campaign</option>
              {completedCampaigns.map((campaign) => (
                <option key={campaign.id} value={campaign.id}>
                  {campaign.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        {completedCampaigns.length < 2 && (
          <p className="mt-4 text-sm text-yellow-600">
            At least two completed campaigns are required to compare results.
          </p>
        )}
      </div>

      {/* GPM Comparison */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">
          Overall GPM trend
        </h2>
        <div className="grid grid-cols-2 gap-8">
          <div>
            <p className="text-sm text-gray-600 mb-2">
              {previousCampaign?.name || 'Previous campaign'}
            </p>
            <p className="text-4xl font-semibold text-gray-400">
              {(previousGPM * 100).toFixed(0)}%
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-2">
              {currentCampaign?.name || 'Current campaign'}
            </p>
            <div className="flex items-baseline gap-3">
              <p className="text-4xl font-semibold text-blue-600">
                {(currentGPM * 100).toFixed(0)}%
              </p>
              {gpmChange.trend === 'up' && (
                <div className="flex items-center gap-1 text-green-600">
                  <TrendingUp className="w-5 h-5" />
                  <span className="text-sm font-medium">
                    +{(gpmChange.value * 100).toFixed(0)}%
                  </span>
                </div>
              )}
              {gpmChange.trend === 'down' && (
                <div className="flex items-center gap-1 text-red-600">
                  <TrendingDown className="w-5 h-5" />
                  <span className="text-sm font-medium">
                    -{(gpmChange.value * 100).toFixed(0)}%
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Pillars Comparison */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-8">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Pillar trend
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Comparison between {previousCampaign?.name || 'previous period'} and {currentCampaign?.name || 'current period'}.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">
                  Pillar
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">
                  {previousCampaign?.name || 'Previous'}
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">
                  {currentCampaign?.name || 'Actuel'}
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">
                  Change
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">
                  Visualisation
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentPillars.map((pillar) => {
                const change = getChange(pillar.currentScore, pillar.previousScore);
                return (
                  <tr key={pillar.name} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{pillar.name}</p>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {(pillar.previousScore * 100).toFixed(0)}%
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {(pillar.currentScore * 100).toFixed(0)}%
                    </td>
                    <td className="px-6 py-4">
                      {change.trend === 'up' && (
                        <div className="flex items-center gap-2 text-green-600">
                          <TrendingUp className="w-4 h-4" />
                          <span className="font-medium">
                            +{(change.value * 100).toFixed(0)}%
                          </span>
                        </div>
                      )}
                      {change.trend === 'down' && (
                        <div className="flex items-center gap-2 text-red-600">
                          <TrendingDown className="w-4 h-4" />
                          <span className="font-medium">
                            -{(change.value * 100).toFixed(0)}%
                          </span>
                        </div>
                      )}
                      {change.trend === 'same' && (
                        <div className="flex items-center gap-2 text-gray-500">
                          <Minus className="w-4 h-4" />
                          <span>No change</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2 items-center">
                        <div className="flex-1 max-w-[150px]">
                          <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                            <div
                              className="bg-gray-400 h-2 rounded-full"
                              style={{ width: `${pillar.previousScore * 100}%` }}
                            />
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                change.trend === 'up'
                                  ? 'bg-green-600'
                                  : change.trend === 'down'
                                  ? 'bg-red-600'
                                  : 'bg-gray-600'
                              }`}
                              style={{ width: `${pillar.currentScore * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-3">Summary</h3>
        <div className="space-y-2 text-sm text-blue-800">
          <p>
            • The overall GPM score improved by{' '}
            <span className="font-medium">
              {(gpmChange.value * 100).toFixed(0)}%
            </span>{' '}
            between the two periods.
          </p>
          <p>
            • {currentPillars.filter((pillar) => pillar.currentScore > pillar.previousScore).length}{' '}
            pillars improved.
          </p>
          <p>
            • {currentPillars.filter((pillar) => pillar.currentScore < pillar.previousScore).length}{' '}
            pillars declined.
          </p>
        </div>
      </div>
    </div>
  );
}
