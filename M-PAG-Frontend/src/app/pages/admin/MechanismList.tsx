import React, { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { Plus, Settings, Shield } from 'lucide-react';
import { opageApi, rmmsApi, type OPageRisk, type RMM } from '../../services/api';

export function MechanismList() {
  const [mechanisms, setMechanisms] = useState<RMM[]>([]);
  const [opageRisks, setOpageRisks] = useState<OPageRisk[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadMechanisms = async () => {
      setLoading(true);
      setError('');
      try {
        const [mechanismsData, risksData] = await Promise.all([
          rmmsApi.list(),
          opageApi.risks(),
        ]);
        const risks = Array.isArray(risksData) ? risksData : (risksData as any).results || [];
        setMechanisms(mechanismsData);
        setOpageRisks(risks);
      } catch (e: any) {
        setError(e.message || 'Unable to load mechanisms or O-PAGe risks.');
      } finally {
        setLoading(false);
      }
    };

    loadMechanisms();
  }, []);

  const handleDeleteMechanism = async (mechanismId: number) => {
    if (!window.confirm('Are you sure you want to delete this mechanism?')) {
      return;
    }

    setDeletingId(mechanismId);
    setError('');

    try {
      await rmmsApi.delete(mechanismId);
      setMechanisms((prev) => prev.filter((mechanism) => mechanism.id !== mechanismId));
    } catch (e: any) {
      setError(e.message || 'Unable to delete the mechanism.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">
            Mitigation mechanisms (RMM)
          </h1>
          <p className="text-gray-600 mt-2">
            Manage algorithmic risk mitigation mechanisms
          </p>
        </div>
        <Link
          to="/mechanisms/new"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add mechanism
        </Link>
      </div>

      {error && (
        <div className="mb-6 rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center text-slate-600 shadow-sm">
          Loading mechanisms...
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">
                  Mechanism
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">
                  Associated risk
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">
                  Score RMMC
                </th>
                <th className="px-6 py-4 text-right text-sm font-medium text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {mechanisms.map((mechanism) => {
                const totalWeight = mechanism.kp_weights?.reduce((sum, item) => sum + item.weight, 0) || 0;
                const existingRiskIds = new Set(opageRisks.map((risk) => risk.id));
                const riskExists = existingRiskIds.has(mechanism.associated_risk_id);
                return (
                  <tr
                    key={mechanism.id}
                    className={`hover:bg-gray-50 transition-colors ${!riskExists ? 'bg-red-50' : ''}`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                          <Shield className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {mechanism.name}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      <div className="flex flex-col gap-1">
                        <span>{mechanism.associated_risk_name || 'Associated risk not found'}</span>
                        {!riskExists && (
                          <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-1 text-[11px] font-semibold text-red-700">
                            O-PAGe risk missing
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[120px]">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${Math.min(Math.max(totalWeight * 100, 0), 100)}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-700">
                          {(totalWeight * 100).toFixed(0)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/mechanisms/${mechanism.id}/configure`}
                          className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                        >
                          <Settings className="w-4 h-4" />
                          Configure
                        </Link>
                        <button
                          type="button"
                          disabled={deletingId === mechanism.id}
                          onClick={() => handleDeleteMechanism(mechanism.id)}
                          className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}