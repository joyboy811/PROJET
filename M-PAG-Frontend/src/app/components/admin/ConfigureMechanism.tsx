import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';
import { MITIGATION_MECHANISMS, KEY_PILLARS } from '../../data/mockData';

export function ConfigureMechanism() {
  const { id } = useParams();
  const navigate = useNavigate();
  const mechanism = MITIGATION_MECHANISMS.find(m => m.id === id);

  const [weights, setWeights] = useState<Record<string, number>>({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (mechanism) {
      const initialWeights: Record<string, number> = {};
      mechanism.pillars.forEach(pillar => {
        initialWeights[pillar.id] = pillar.weight || 1/6;
      });
      setWeights(initialWeights);
    }
  }, [mechanism]);

  if (!mechanism) {
    return (
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          <p>Mechanism not found</p>
        </div>
      </div>
    );
  }

  const totalWeight = Object.values(weights).reduce((sum, w) => sum + w, 0);
  const isValidWeight = Math.abs(totalWeight - 1) < 0.001;

  const handleWeightChange = (pillarId: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    setWeights(prev => ({ ...prev, [pillarId]: numValue }));
    setSaved(false);
  };

  const handleSave = () => {
    if (isValidWeight) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <button
          onClick={() => navigate('/app/mechanisms')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to mechanisms
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Mechanism configuration
          </h1>
          <p className="text-gray-600">
            {mechanism.name} — {mechanism.associatedRisk}
          </p>
        </div>

        {/* Weight Configuration */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900">Key Pillar weights</h2>
            <p className="text-sm text-gray-600 mt-1">
              Set each pillar weight (total must equal 1.0)
            </p>
          </div>

          <div className="p-6">
            <div className="space-y-4">
              {KEY_PILLARS.map((pillar) => (
                <div key={pillar.id} className="flex items-center gap-4">
                  <div className="flex-1">
                    <label className="block font-medium text-gray-900 mb-1">
                      {pillar.name}
                    </label>
                  </div>
                  <div className="w-32">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="1"
                      value={weights[pillar.id] || 0}
                      onChange={(e) => handleWeightChange(pillar.id, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="w-24 text-right text-gray-600">
                    {((weights[pillar.id] || 0) * 100).toFixed(1)}%
                  </div>
                </div>
              ))}
            </div>

            {/* Total Weight Indicator */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-900">Total</span>
                <div className="flex items-center gap-4">
                  <span className="text-lg font-bold text-gray-900">
                    {totalWeight.toFixed(3)}
                  </span>
                  <div className="w-24 text-right">
                    {(totalWeight * 100).toFixed(1)}%
                  </div>
                </div>
              </div>

              {!isValidWeight && (
                <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-yellow-900">Warning</p>
                    <p className="text-sm text-yellow-800 mt-1">
                      The sum of weights must equal 1.0 (currently: {totalWeight.toFixed(3)})
                    </p>
                  </div>
                </div>
              )}

              {isValidWeight && !saved && (
                <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <p className="text-sm text-green-800">
                    Total weight is valid
                  </p>
                </div>
              )}

              {saved && (
                <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-3">
                  <Save className="w-5 h-5 text-blue-600" />
                  <p className="text-sm text-blue-800">
                    Configuration saved successfully
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSave}
            disabled={!isValidWeight}
            className={`px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors ${
              isValidWeight
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <Save className="w-5 h-5" />
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
