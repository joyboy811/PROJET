import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Plus, Settings, Shield } from 'lucide-react';
import { MITIGATION_MECHANISMS } from '../../data/mockData';

export function MitigationMechanisms() {
  const navigate = useNavigate();
  const [mechanisms] = useState(MITIGATION_MECHANISMS);

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Mitigation mechanisms (RMM)
            </h1>
            <p className="text-gray-600">
              Manage risk mitigation mechanisms and configure their pillar weights
            </p>
          </div>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Add mechanism
          </button>
        </div>

        {/* Mechanisms List */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-semibold text-gray-900">
                  Mechanism name
                </th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-gray-900">
                  Associated risk
                </th>
                <th className="text-center px-6 py-3 text-sm font-semibold text-gray-900">
                  RMMC
                </th>
                <th className="text-center px-6 py-3 text-sm font-semibold text-gray-900">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {mechanisms.map((mechanism) => (
                <tr key={mechanism.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Shield className="w-5 h-5 text-blue-600" />
                      </div>
                      <span className="font-medium text-gray-900">{mechanism.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-700">
                    {mechanism.associatedRisk}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-lg font-bold text-gray-900">
                          {(mechanism.rmmc! * 100).toFixed(0)}%
                        </div>
                        <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden mt-1">
                          <div 
                            className={`h-full ${
                              mechanism.rmmc! >= 0.7 ? 'bg-green-500' :
                              mechanism.rmmc! >= 0.5 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${mechanism.rmmc! * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => navigate(`/app/mechanisms/${mechanism.id}`)}
                        className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-2"
                      >
                        <Settings className="w-4 h-4" />
                        Configure
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-900">
            <strong>Note :</strong> Click "Configure" to set the 6 pillar weights for each mitigation mechanism.
          </p>
        </div>
      </div>
    </div>
  );
}
