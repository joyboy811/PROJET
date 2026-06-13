import React, { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { campaignsApi, ipageApi, type Campaign, type IPageSimulation } from '../../services/api';
import { ClipboardList, CheckCircle, Clock, TrendingUp, AlertCircle } from 'lucide-react';

export function ManagerDashboard() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [simulations, setSimulations] = useState<IPageSimulation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadCampaigns = async () => {
      setLoading(true);
      setError('');
      try {
        const [campData, simData] = await Promise.all([
          campaignsApi.list(),
          ipageApi.simulations()
        ]);
        setCampaigns(campData);
        setSimulations(simData);
      } catch (e: any) {
        setError(e.message || 'Unable to load campaigns.');
      } finally {
        setLoading(false);
      }
    };

    loadCampaigns();
  }, []);

  const activeCampaigns = campaigns.filter((c) => c.status === 'in_progress');
  const completedCampaigns = campaigns.filter((c) => c.status === 'completed');
  const avgProgress =
    campaigns.length > 0
      ? campaigns.reduce((acc, c) => acc + c.progress, 0) / campaigns.length
      : 0;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900">
          Organizational Dashboard
        </h1>
        <p className="text-gray-600 mt-2">
          Tracking your institutional capacity assessments
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center text-gray-600">
          Loading campaigns...
        </div>
      ) : (
        <>
          {/* Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-gray-600">
                  Active campaigns
                </p>
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-3xl font-semibold text-gray-900">
                {activeCampaigns.length}
              </p>
              <Link
                to="/campaigns"
                className="text-sm text-blue-600 hover:text-blue-800 mt-2 inline-block"
              >
                View →
              </Link>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-gray-600">
                  Campaigns Completed
                </p>
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-3xl font-semibold text-gray-900">
                {completedCampaigns.length}
              </p>
              <p className="text-xs text-gray-500 mt-2">Complete Evaluations</p>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-gray-600">
                  Average Progress
                </p>
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <p className="text-3xl font-semibold text-gray-900">
                {avgProgress.toFixed(0)}%
              </p>
              <p className="text-xs text-gray-500 mt-2">All campaigns</p>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-gray-600">
                  Questions Answered
                </p>
                <ClipboardList className="w-5 h-5 text-orange-600" />
              </div>
              <p className="text-3xl font-semibold text-gray-900">
                {campaigns.reduce((sum, c) => sum + c.answered_items, 0)}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Out of {campaigns.reduce((sum, c) => sum + c.total_items, 0)} questions
              </p>
            </div>
          </div>

          {/* Active Campaign Alert */}
          {activeCampaigns.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-blue-900 mb-2">
                    Ongoing campaign
                  </h3>
                  <p className="text-blue-800 mb-4">
                    {activeCampaigns[0].name} -{' '}
                    {activeCampaigns[0].progress}% complete
                  </p>
                  <Link
                    to="/questionnaire"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Continue Assessment
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Campaigns Overview */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              My campaigns
            </h2>
            {campaigns.length === 0 ? (
              <p className="text-gray-600 text-center py-8">
                No campaigns available. Go to the Campaigns section to create one.
              </p>
            ) : (
              <div className="space-y-3">
                {campaigns.map((campaign) => (
                  <div
                    key={campaign.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <p className="font-medium text-gray-900">{campaign.name}</p>
                        {campaign.status === 'completed' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                            <CheckCircle className="w-3 h-3" />
                            Completed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                            <Clock className="w-3 h-3" />
                            In progress
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex-1 max-w-xs bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              campaign.status === 'completed'
                                ? 'bg-green-600'
                                : 'bg-blue-600'
                            }`}
                            style={{ width: `${campaign.progress}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600">
                          {campaign.progress}%
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">
                        Launched on{' '}
                        {new Date(campaign.launch_date).toLocaleDateString('en-US')}
                      </p>
                    </div>
                    <Link
                      to={
                        campaign.status === 'completed'
                          ? '/campaigns'
                          : '/questionnaire'
                      }
                      className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800"
                    >
                      {campaign.status === 'completed' ? 'View' : 'Continue'} →
                    </Link>
                  </div>
                ))}
              </div>
            )}
            <Link
              to="/campaigns"
              className="block mt-4 text-center text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              View all campaigns →
            </Link>
          </div>

          {/* I-PAGe Simulations Overview */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Recent Impact Simulations (I-PAGe)
            </h2>
            {simulations.length === 0 ? (
              <p className="text-gray-600 text-center py-8">
                No simulations recorded. Go to the I-PAGe section to create one.
              </p>
            ) : (
              <div className="space-y-3">
                {simulations.slice(0, 5).map((sim: any) => (
                  <div
                    key={sim.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <p className="font-medium text-gray-900">Simulation on {sim.risk_name}</p>
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                          {sim.scenario_name || 'Scenario'}
                        </span>
                      </div>
                      <div className="flex items-center gap-6 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">Initial score:</span>
                          <span className="text-sm font-semibold text-gray-700">{sim.risk_score?.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">Mitigated Score:</span>
                          <span className="text-sm font-semibold text-blue-700">{sim.risk_score_after?.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">Reduction:</span>
                          <span className="text-sm font-semibold text-emerald-600">-{sim.reduction_relative}%</span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500">
                        Created on {new Date(sim.created_at).toLocaleDateString('en-US')}
                      </p>
                    </div>
                    <Link
                      to="/impact-simulation"
                      className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800"
                    >
                      New simulation →
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Help Section */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-3">
              How to fill out the M-PAGe questionnaire
            </h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span>
                  Answer all questions on a scale of 1 (very low) to 5 (very high)
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span>
                  Add comments to justify your answers if necessary
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span>
                  You can save a draft and return later
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span>
                  The "Submit" button will be enabled once all questions are answered
                </span>
              </li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
