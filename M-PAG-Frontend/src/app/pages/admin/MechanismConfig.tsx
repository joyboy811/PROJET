import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router';
import { ArrowLeft, AlertCircle, CheckCircle, Save } from 'lucide-react';
import {
  rmmsApi,
  opageApi,
  pillarsApi,
  type RMM,
  type KeyPillarListItem,
  type OPageKeyPillar,
} from '../../services/api';

export function MechanismConfig() {
  const { id } = useParams();
  const [mechanism, setMechanism] = useState<RMM | null>(null);
  const [pillars, setPillars] = useState<(
    OPageKeyPillar & { mappedPillarId?: number; code?: string; pillar_type?: string }
  )[]>([]);
  const [weights, setWeights] = useState<Record<number, number>>({});
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadMechanism = async () => {
      if (!id) return;
      setLoading(true);
      setError('');

      try {
        const [rmm, opagePillarList, existingPillars] = await Promise.all([
          rmmsApi.get(Number(id)),
          opageApi.keyPillars(),
          pillarsApi.listWithLegacy(),
        ]);

        const normalizeKey = (value?: string) => value?.trim().toLowerCase() || '';
        const normalizeCode = (value?: string) => normalizeKey(value).replace(/\s+/g, '-') || '';

        const existingPillarMap = new Map<string, number>();
        const existingPillarInfo = new Map<number, { code: string; pillar_type: string; name: string }>();

        existingPillars.forEach((pillar) => {
          existingPillarMap.set(normalizeKey(pillar.pillar_type), pillar.id);
          existingPillarMap.set(normalizeKey(pillar.name), pillar.id);
          existingPillarMap.set(normalizeKey(pillar.code), pillar.id);
          existingPillarMap.set(normalizeCode(pillar.pillar_type), pillar.id);
          existingPillarMap.set(normalizeCode(pillar.name), pillar.id);
          existingPillarMap.set(normalizeCode(pillar.code), pillar.id);
          existingPillarInfo.set(pillar.id, {
            code: pillar.code,
            pillar_type: pillar.pillar_type,
            name: pillar.name,
          });
        });

        const resolvedPillars = await Promise.all(
          opagePillarList.map(async (pillar) => {
            const normalizedType = normalizeKey(pillar.type);
            const normalizedName = normalizeKey(pillar.name);
            const normalizedTypeCode = normalizeCode(pillar.type);
            const normalizedNameCode = normalizeCode(pillar.name);

            let mappedPillarId =
              existingPillarMap.get(normalizedType) ??
              existingPillarMap.get(normalizedName) ??
              existingPillarMap.get(normalizedTypeCode) ??
              existingPillarMap.get(normalizedNameCode);

            let mappedInfo = mappedPillarId ? existingPillarInfo.get(mappedPillarId) : undefined;

            if (!mappedPillarId) {
              const code = normalizedTypeCode || normalizedNameCode || `opage-${pillar.id}`;
              const pillar_type = normalizedType || normalizedName || `opage-${pillar.id}`;
              const name = pillar.name?.trim() || pillar.type?.trim() || `O-PAGe Pillar ${pillar.id}`;

              try {
                const created = await pillarsApi.create({ name, code, pillar_type });
                mappedPillarId = created.id;
                mappedInfo = {
                  code: created.code,
                  pillar_type: created.pillar_type,
                  name: created.name,
                };
              } catch (createError) {
                console.warn('Unable to create M-PAGe pillar for O-PAGe:', createError);
              }
            }

            return {
              ...pillar,
              mappedPillarId,
              code: mappedInfo?.code,
              pillar_type: mappedInfo?.pillar_type ?? pillar.type,
            };
          }),
        );

        setMechanism(rmm);
        setPillars(resolvedPillars);

        const initialWeights: Record<number, number> = {};
        resolvedPillars.forEach((pillar) => {
          if (!pillar.mappedPillarId) return;
          const existingWeight = rmm.kp_weights?.find(
            (w) => w.key_pillar === pillar.mappedPillarId,
          )?.weight;
          initialWeights[pillar.mappedPillarId] = existingWeight ?? 0;
        });
        setWeights(initialWeights);
      } catch (e: any) {
        setError(e.message || 'Unable to load mechanism or pillars.');
      } finally {
        setLoading(false);
      }
    };

    loadMechanism();

    const handleOPageKeyPillarUpdate = () => {
      loadMechanism();
    };

    window.addEventListener('opageKeyPillarUpdated', handleOPageKeyPillarUpdate);
    return () => {
      window.removeEventListener('opageKeyPillarUpdated', handleOPageKeyPillarUpdate);
    };
  }, [id]);

  if (!id) {
    return <div className="p-8">Invalid mechanism identifier.</div>;
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center text-slate-600 shadow-sm">
          Loading mechanism...
        </div>
      </div>
    );
  }

  if (!mechanism) {
    return <div className="p-8">Mechanism not found.</div>;
  }

  const totalWeight = Object.values(weights).reduce((sum, w) => sum + w, 0);
  const isValid = Math.abs(totalWeight - 1) < 0.001;

  const handleWeightChange = (pillarId: number, value: string) => {
    const numValue = parseFloat(value) || 0;
    setWeights((prev) => ({ ...prev, [pillarId]: numValue }));
    setSaved(false);
  };

  const handleSave = async () => {
    if (!isValid) {
      return;
    }

    setSaving(true);
    setError('');

    try {
      const weightPayload = pillars
        .filter((pillar) => pillar.mappedPillarId)
        .map((pillar) => ({
          key_pillar_id: pillar.mappedPillarId as number,
          weight: weights[pillar.mappedPillarId as number] ?? 0,
        }));
      await rmmsApi.configureWeights(Number(id), weightPayload);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e: any) {
      setError(e.message || 'Unable to save weights.');
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
          Back to Mechanisms
        </Link>
        <h1 className="text-3xl font-semibold text-gray-900">
          Mechanism Configuration
        </h1>
        <p className="text-gray-600 mt-2">{mechanism.name}</p>
        <p className="text-sm text-gray-500 mt-1">
          Associated Risk: {mechanism.associated_risk_name}
        </p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6 max-w-3xl">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Pillar Weights
        </h2>
        <p className="text-sm text-gray-600 mb-6">
          Configure the weight of each pillar for this mechanism. The sum of
          weights must equal 1.
        </p>

        {error && (
          <div className="mb-4 rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {pillars.map((pillar) => (
            <div
              key={pillar.id}
              className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg"
            >
              <div className="flex-1">
                <p className="font-medium text-gray-900">{pillar.name}</p>
                <p className="text-xs text-gray-500 mt-1">{pillar.code || pillar.type}</p>
              </div>
              <div className="w-32">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="1"
                  value={pillar.mappedPillarId ? weights[pillar.mappedPillarId] ?? 0 : 0}
                  onChange={(e) => pillar.mappedPillarId && handleWeightChange(pillar.mappedPillarId, e.target.value)}
                  disabled={!pillar.mappedPillarId}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 rounded-lg bg-gray-50 border border-gray-200">
          <div className="flex items-center justify-between">
            <span className="font-medium text-gray-700">Total sum:</span>
            <span className={`font-semibold ${isValid ? 'text-green-600' : 'text-red-600'}`}>
              {totalWeight.toFixed(3)}
            </span>
          </div>
        </div>

        {!isValid && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-red-900">
                The sum of weights must equal 1
              </p>
              <p className="text-sm text-red-700 mt-1">
                Adjust the values so the sum is exactly 1.000.
              </p>
            </div>
          </div>
        )}

        {saved && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-green-900">
                Configuration saved successfully.
              </p>
            </div>
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSave}
            disabled={!isValid || saving}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
              isValid
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <Save className="w-5 h-5" />
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
