import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router';
import { ArrowLeft, Save } from 'lucide-react';
import { opageApi, rmmsApi, type OPageRisk } from '../../services/api';

export function CreateMechanism() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [selectedRiskId, setSelectedRiskId] = useState<number | null>(null);
  const [availableRisks, setAvailableRisks] = useState<OPageRisk[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadRisks = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await opageApi.risks();
        const risks = Array.isArray(data) ? data : (data as any).results || [];
        setAvailableRisks(risks);
        if (risks.length > 0) {
          setSelectedRiskId(risks[0].id);
        }
      } catch (e: any) {
        setError(e.message || 'Unable to load O-PAGe risks.');
      } finally {
        setLoading(false);
      }
    };

    loadRisks();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedRiskId) {
      setError('Please select an associated risk.');
      return;
    }

    const risk = availableRisks.find((item) => item.id === selectedRiskId);
    if (!risk) {
      setError('O-PAGe risk not found.');
      return;
    }

    setSaving(true);
    try {
      await rmmsApi.create({
        name,
        associated_risk_id: risk.id,
        associated_risk_name: risk.name,
      });
      navigate('/mechanisms');
    } catch (e: any) {
      setError(e.message || "Unable to create the mechanism. Check the API.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <Link
          to="/mechanisms"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to mechanisms
        </Link>
        <h1 className="text-3xl font-semibold text-gray-900">
          Create a new mechanism
        </h1>
        <p className="text-gray-600 mt-2">
          Add a new mitigation mechanism for an O-PAGe risk.
        </p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6 max-w-3xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Mechanism name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Model validation mechanism"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="risk"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Associated risk <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                id="risk"
                required
                value={selectedRiskId ?? ''}
                onChange={(e) => setSelectedRiskId(Number(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              >
                {availableRisks.map((risk) => (
                  <option key={risk.id} value={risk.id}>
                    {risk.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> After creating the mechanism, you can configure pillar weights on the configuration screen.
            </p>
          </div>

          {error && (
            <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={saving || loading}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              Create mechanism
            </button>
            <Link
              to="/mechanisms"
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
