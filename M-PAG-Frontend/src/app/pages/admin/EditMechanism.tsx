import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';
import { opageApi, rmmsApi, type OPageRisk, type RMM } from '../../services/api';

export function EditMechanism() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [mechanism, setMechanism] = useState<RMM | null>(null);
  const [name, setName] = useState('');
  const [selectedRiskId, setSelectedRiskId] = useState<number | null>(null);
  const [availableRisks, setAvailableRisks] = useState<OPageRisk[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const loadMechanism = async () => {
      if (!id) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');

      try {
        const mechanismId = Number(id);
        const [rmm, risksData] = await Promise.all([
          rmmsApi.get(mechanismId),
          opageApi.risks(),
        ]);
        const risks = Array.isArray(risksData) ? risksData : (risksData as any).results || [];

        setMechanism(rmm);
        setName(rmm.name);
        setSelectedRiskId(rmm.associated_risk_id ?? risks[0]?.id ?? null);
        setAvailableRisks(risks);
      } catch (e: any) {
        const message = e?.message || 'Unable to load the mechanism.';
        if (message.includes('404')) {
          setNotFound(true);
        } else {
          setError(message);
        }
      } finally {
        setLoading(false);
      }
    };

    loadMechanism();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mechanism || selectedRiskId === null) {
      setError('Select an O-PAGe risk before saving.');
      return;
    }

    const associatedRisk = availableRisks.find((risk) => risk.id === selectedRiskId);
    if (!associatedRisk) {
      setError('The selected O-PAGe risk is invalid.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      await rmmsApi.update(mechanism.id, {
        name,
        associated_risk_id: associatedRisk.id,
        associated_risk_name: associatedRisk.name,
      });
      navigate('/mechanisms');
    } catch (e: any) {
      setError(e.message || 'Unable to update the mechanism.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this mechanism?')) {
      navigate('/mechanisms');
    }
  };

  if (loading) {
    return <div className="p-8">Loading mechanism...</div>;
  }

  if (notFound || !mechanism) {
    return <div className="p-8">Mechanism not found</div>;
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <Link
          to="/mechanisms"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Mechanisms
        </Link>
        <h1 className="text-3xl font-semibold text-gray-900">
          Edit Mechanism
        </h1>
        <p className="text-gray-600 mt-2">
          Edit the mechanism details and its association with the O-PAGe risk.
        </p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6 max-w-3xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-red-700">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Mechanism Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="risk" className="block text-sm font-medium text-gray-700 mb-2">
              Associated Risk <span className="text-red-500">*</span>
            </label>
            <select
              id="risk"
              required
              value={selectedRiskId ?? ''}
              onChange={(e) => setSelectedRiskId(Number(e.target.value))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="" disabled>
                Select an O-PAGe Risk
              </option>
              {availableRisks.map((risk) => (
                <option key={risk.id} value={risk.id}>
                  {risk.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleDelete}
              className="flex items-center gap-2 px-6 py-3 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors"
            >
              <Trash2 className="w-5 h-5" />
              Delete
            </button>
            <div className="flex gap-4">
              <Link
                to="/mechanisms"
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:cursor-not-allowed disabled:bg-blue-300"
              >
                <Save className="w-5 h-5" />
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
