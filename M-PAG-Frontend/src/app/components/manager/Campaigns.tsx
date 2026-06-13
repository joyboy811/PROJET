import { useNavigate } from 'react-router';
import { ClipboardList, Play, CheckCircle, Calendar } from 'lucide-react';
import { mockCampaigns, Campaign } from '../../data/mockData';
import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';

export function Campaigns() {
  const navigate = useNavigate();

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            My assessment campaigns
          </h1>
          <p className="text-gray-600">
            Manage your institutional capacity assessment campaigns
          </p>
        </div>

        {/* Campaigns Grid */}
        <div className="grid grid-cols-1 gap-4">
          {mockCampaigns.map((campaign: Campaign) => (
            <div
              key={campaign.id}
              className="bg-white rounded-xl border border-gray-200 p-6 hover:border-blue-300 hover:shadow-lg transition-all"
            >
              <div className="flex items-start gap-6">
                {/* Icon */}
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  campaign.status === 'completed' ? 'bg-green-100' : 'bg-blue-100'
                }`}>
                  {campaign.status === 'completed' ? (
                    <CheckCircle className="w-7 h-7 text-green-600" />
                  ) : (
                    <ClipboardList className="w-7 h-7 text-blue-600" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-1">
                        {campaign.name}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {format(new Date(campaign.launchDate), 'dd MMMM yyyy', { locale: enUS })}
                          </span>
                        </div>
                        <div>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            campaign.status === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {campaign.status === 'completed' ? 'Completed' : campaign.status === 'in_progress' ? 'In progress' : campaign.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {campaign.status === 'in_progress' && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-gray-600">Progress</span>
                        <span className="font-medium text-gray-900">{campaign.progress}%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-600 rounded-full transition-all"
                          style={{ width: `${campaign.progress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Action Button */}
                  <div className="flex gap-3">
                    {campaign.status === 'in_progress' ? (
                      <button
                        onClick={() => navigate(`/app/questionnaire/${campaign.id}`)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                      >
                        <Play className="w-4 h-4" />
                        Continue assessment
                      </button>
                    ) : (
                      <button
                        onClick={() => navigate(`/app/questionnaire/${campaign.id}`)}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        View results
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-900">
            <strong>Note :</strong> An assessment campaign lets you measure your organization's capacity to mitigate algorithmic risks across the 6 pillars: Governance, Legal, Technical, Human, Organizational, and Financial.
          </p>
        </div>
      </div>
    </div>
  );
}
