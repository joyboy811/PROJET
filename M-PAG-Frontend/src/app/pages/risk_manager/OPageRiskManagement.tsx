import React, { useState, useEffect } from 'react';
import { opageApi, pillarsApi, type OPageKeyPillar, type OPageRisk, type OPageIndicator } from '../../services/api';
import { AlertTriangle, RefreshCw, ShieldAlert, Activity, Pencil, Trash2 } from 'lucide-react';

const getCategoryColor = (category: string) => {
  switch (category?.toUpperCase()) {
    case 'LOW':
      return { bg: 'bg-green-100', text: 'text-green-800', label: 'Low' };
    case 'MODERATE':
      return { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Moderate' };
    case 'HIGH':
      return { bg: 'bg-orange-100', text: 'text-orange-800', label: 'High' };
    case 'CRITICAL':
      return { bg: 'bg-red-100', text: 'text-red-800', label: 'Critical' };
    default:
      return { bg: 'bg-gray-100', text: 'text-gray-800', label: 'N/A' };
  }
};

const getLatestScore = (risk: OPageRisk) => {
  if (risk.scores && risk.scores.length > 0) {
    return risk.scores[risk.scores.length - 1];
  }
  return null;
};

export function OPageRiskManagement() {
  const [risks, setRisks] = useState<OPageRisk[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showCreateRisk, setShowCreateRisk] = useState(false);
  const [showCreatePillar, setShowCreatePillar] = useState(false);
  const [newRiskName, setNewRiskName] = useState('');
  const [newRiskDescription, setNewRiskDescription] = useState('');
  const [newPillarName, setNewPillarName] = useState('');
  const [newPillarType, setNewPillarType] = useState('');
  const [keyPillars, setKeyPillars] = useState<OPageKeyPillar[]>([]);
  const [showEditPillar, setShowEditPillar] = useState(false);
  const [selectedPillarToEdit, setSelectedPillarToEdit] = useState<OPageKeyPillar | null>(null);
  const [editPillarName, setEditPillarName] = useState('');
  const [editPillarType, setEditPillarType] = useState('');
  const [showCreateIndicator, setShowCreateIndicator] = useState(false);
  const [selectedRiskForIndicator, setSelectedRiskForIndicator] = useState<OPageRisk | null>(null);
  const [newIndicatorLabel, setNewIndicatorLabel] = useState('');
  const [newIndicatorWeight, setNewIndicatorWeight] = useState('0.1');
  const [newIndicatorStatus, setNewIndicatorStatus] = useState('POSITIVE');
  const [newIndicatorMin, setNewIndicatorMin] = useState('0');
  const [newIndicatorMax, setNewIndicatorMax] = useState('10');
  const [submitLoading, setSubmitLoading] = useState(false);

  // Edit risk state
  const [showEditRisk, setShowEditRisk] = useState(false);
  const [selectedRiskToEdit, setSelectedRiskToEdit] = useState<OPageRisk | null>(null);
  const [editRiskName, setEditRiskName] = useState('');
  const [editRiskDescription, setEditRiskDescription] = useState('');

  // Edit indicator state
  const [showEditIndicator, setShowEditIndicator] = useState(false);
  const [selectedIndicatorToEdit, setSelectedIndicatorToEdit] = useState<OPageIndicator | null>(null);
  const [editIndicatorLabel, setEditIndicatorLabel] = useState('');
  const [editIndicatorWeight, setEditIndicatorWeight] = useState('0.1');
  const [editIndicatorStatus, setEditIndicatorStatus] = useState('POSITIVE');
  const [editIndicatorMin, setEditIndicatorMin] = useState('0');
  const [editIndicatorMax, setEditIndicatorMax] = useState('10');

  const fetchRisks = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await opageApi.risks();
      setRisks(Array.isArray(data) ? data : (data as any).results || []);
    } catch (e: any) {
      setError(e.message || 'Unable to retrieve risks from O-PAGe');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRisks();
    fetchKeyPillars();
  }, []);

  const fetchKeyPillars = async () => {
    try {
      const data = await opageApi.keyPillars();
      setKeyPillars(Array.isArray(data) ? data : (data as any).results || []);
    } catch (e: any) {
      console.error('Unable to retrieve O-PAGe Key Pillars', e);
    }
  };

  const createRisk = async () => {
    if (!newRiskName.trim()) {
      setError('Risk name is required.');
      return;
    }
    setSubmitLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      await opageApi.createRisk({
        name: newRiskName.trim(),
        description: newRiskDescription.trim(),
      });
      setSuccessMessage('New risk created successfully.');
      setShowCreateRisk(false);
      setNewRiskName('');
      setNewRiskDescription('');
      fetchRisks();
    } catch (e: any) {
      setError(e.message || 'Unable to create risk.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const createKeyPillar = async () => {
    if (!newPillarName.trim() || !newPillarType.trim()) {
      setError('Key Pillar name and type are required.');
      return;
    }
    setSubmitLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      await opageApi.createKeyPillar({
        name: newPillarName.trim(),
        type: newPillarType.trim(),
      });

      // Auto-create corresponding M-PAGe pillar using the O-PAGe type directly.
      const pillarType = (newPillarType.trim() || newPillarName.trim() || `opage-${Date.now()}`).toLowerCase();
      const normalizedCode = pillarType.replace(/\s+/g, '-') || `opage-${Date.now()}`;

      try {
        await pillarsApi.create({
          name: newPillarName.trim(),
          code: normalizedCode,
          pillar_type: pillarType,
        });
      } catch (e) {
        console.warn('Could not auto-create M-PAGe pillar:', e);
      }

      setSuccessMessage('New Key Pillar created successfully. Use "Reference Configuration" to add dimensions.');
      setShowCreatePillar(false);
      setNewPillarName('');
      setNewPillarType('');
      fetchRisks();
      fetchKeyPillars();
    } catch (e: any) {
      setError(e.message || 'Unable to create Key Pillar.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const openCreateIndicator = (risk: OPageRisk) => {
    setSelectedRiskForIndicator(risk);
    setShowCreateIndicator(true);
    setNewIndicatorLabel('');
    setNewIndicatorWeight('0.1');
    setNewIndicatorStatus('POSITIVE');
    setNewIndicatorMin('0');
    setNewIndicatorMax('10');
    setError('');
    setSuccessMessage('');
  };

  const createIndicator = async () => {
    if (!selectedRiskForIndicator) {
      setError('No risk selected for the indicator.');
      return;
    }
    if (!newIndicatorLabel.trim()) {
      setError('Indicator label is mandatory.');
      return;
    }
    const weight = parseFloat(newIndicatorWeight);
    const val_min = parseFloat(newIndicatorMin);
    const val_max = parseFloat(newIndicatorMax);
    if (Number.isNaN(weight) || Number.isNaN(val_min) || Number.isNaN(val_max)) {
      setError('Weight and min/max values must be numbers.');
      return;
    }
    setSubmitLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      await opageApi.createIndicator({
        risk: selectedRiskForIndicator.id,
        label: newIndicatorLabel.trim(),
        weight,
        status: newIndicatorStatus,
        val_min,
        val_max,
      });
      setSuccessMessage('Indicator created successfully.');
      setShowCreateIndicator(false);
      setSelectedRiskForIndicator(null);
      fetchRisks();
    } catch (e: any) {
      setError(e.message || 'Unable to create indicator.');
    } finally {
      setSubmitLoading(false);
    }
  };

  // ── Risk edit / delete ──
  const openEditRisk = (risk: OPageRisk) => {
    setSelectedRiskToEdit(risk);
    setEditRiskName(risk.name);
    setEditRiskDescription(risk.description || '');
    setShowEditRisk(true);
    setError('');
    setSuccessMessage('');
  };

  const updateRisk = async () => {
    if (!selectedRiskToEdit) {
      setError('No risk selected for modification.');
      return;
    }
    if (!editRiskName.trim()) {
      setError('Risk name is required.');
      return;
    }
    setSubmitLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      await opageApi.updateRisk(selectedRiskToEdit.id, {
        name: editRiskName.trim(),
        description: editRiskDescription.trim(),
      });
      setSuccessMessage('Risk updated successfully.');
      setShowEditRisk(false);
      setSelectedRiskToEdit(null);
      fetchRisks();
    } catch (e: any) {
      setError(e.message || 'Unable to update risk.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const deleteRisk = async (risk: OPageRisk) => {
    setError('');
    setSuccessMessage('');
    try {
      await opageApi.deleteRisk(risk.id);
      setSuccessMessage('Risk deleted successfully.');
      fetchRisks();
    } catch (e: any) {
      setError(e.message || 'Unable to delete the risk.');
    }
  };

  // ── Indicator edit / delete ──
  const openEditIndicator = (indicator: OPageIndicator) => {
    setSelectedIndicatorToEdit(indicator);
    setEditIndicatorLabel(indicator.label);
    setEditIndicatorWeight(String(indicator.weight));
    setEditIndicatorStatus(indicator.status);
    setEditIndicatorMin(String(indicator.val_min));
    setEditIndicatorMax(String(indicator.val_max));
    setShowEditIndicator(true);
    setError('');
    setSuccessMessage('');
  };

  const updateIndicator = async () => {
    if (!selectedIndicatorToEdit) {
      setError('No indicator selected for modification.');
      return;
    }
    if (!editIndicatorLabel.trim()) {
      setError('Indicator label is mandatory.');
      return;
    }
    const weight = parseFloat(editIndicatorWeight);
    const val_min = parseFloat(editIndicatorMin);
    const val_max = parseFloat(editIndicatorMax);
    if (Number.isNaN(weight) || Number.isNaN(val_min) || Number.isNaN(val_max)) {
      setError('Weight and min/max values must be numbers.');
      return;
    }
    setSubmitLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      await opageApi.updateIndicator(selectedIndicatorToEdit.id, {
        label: editIndicatorLabel.trim(),
        weight,
        status: editIndicatorStatus,
        val_min,
        val_max,
      });
      setSuccessMessage('Indicator updated successfully.');
      setShowEditIndicator(false);
      setSelectedIndicatorToEdit(null);
      fetchRisks();
    } catch (e: any) {
      setError(e.message || 'Unable to update indicator.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const deleteIndicator = async (indicator: OPageIndicator) => {
    setError('');
    setSuccessMessage('');
    try {
      await opageApi.deleteIndicator(indicator.id);
      setSuccessMessage('Indicator deleted successfully.');
      fetchRisks();
    } catch (e: any) {
      setError(e.message || 'Unable to delete the indicator.');
    }
  };

  const openEditPillar = (pillar: OPageKeyPillar) => {
    setSelectedPillarToEdit(pillar);
    setEditPillarName(pillar.name);
    setEditPillarType(pillar.type);
    setShowEditPillar(true);
    setError('');
    setSuccessMessage('');
  };

  const updateKeyPillar = async () => {
    if (!selectedPillarToEdit) {
      setError('No Key Pillar selected for modification.');
      return;
    }
    if (!editPillarName.trim() || !editPillarType.trim()) {
      setError('Key Pillar name and type are required.');
      return;
    }
    setSubmitLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      await opageApi.updateKeyPillar(selectedPillarToEdit.id, {
        name: editPillarName.trim(),
        type: editPillarType.trim(),
      });
      setSuccessMessage('Key Pillar updated successfully.');
      setShowEditPillar(false);
      setSelectedPillarToEdit(null);
      setEditPillarName('');
      setEditPillarType('');
      fetchKeyPillars();
    } catch (e: any) {
      setError(e.message || 'Unable to update Key Pillar.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const deleteLinkedMpagePillars = async (pillar: OPageKeyPillar) => {
    try {
      const existingPillars = await pillarsApi.list();
      const normalizedType = pillar.type?.trim().toLowerCase();
      const normalizedCode = normalizedType?.replace(/\s+/g, '-') || '';
      const normalizedName = pillar.name?.trim().toLowerCase();
      const normalizedNameCode = normalizedName?.replace(/\s+/g, '-') || '';

      const toRemove = existingPillars.filter((mp) => {
        const mpType = mp.pillar_type?.trim().toLowerCase();
        const mpCode = mp.code?.trim().toLowerCase();
        const mpName = mp.name?.trim().toLowerCase();

        const matchesType = normalizedType && (
          mpType === normalizedType ||
          mpType.startsWith(normalizedType) ||
          normalizedType.startsWith(mpType)
        );
        const matchesCode = normalizedCode && (
          mpCode === normalizedCode ||
          mpCode.startsWith(normalizedCode) ||
          mpCode === normalizedNameCode
        );
        const matchesName = normalizedName && (
          mpName === normalizedName ||
          mpName.startsWith(normalizedName) ||
          normalizedName.startsWith(mpName)
        );

        return matchesType || matchesCode || matchesName;
      });

      await Promise.all(toRemove.map((mp) => pillarsApi.delete(mp.id)));
    } catch (e) {
      console.warn('Unable to delete linked M-PAGe pillars:', e);
    }
  };

  const deleteKeyPillar = async (pillar: OPageKeyPillar) => {
    if (!window.confirm(`Permanently delete Key Pillar "${pillar.name}"?`)) {
      return;
    }
    setSubmitLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      await opageApi.deleteKeyPillar(pillar.id);
      await deleteLinkedMpagePillars(pillar);
      setSuccessMessage('Key Pillar deleted successfully.');
      window.dispatchEvent(new CustomEvent('opageKeyPillarUpdated', { detail: { id: pillar.id } }));
      fetchKeyPillars();
      fetchRisks();
    } catch (e: any) {
      setError(e.message || 'Unable to delete the Key Pillar.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const totalRisks = risks.length;
  const risksWithScores = risks.filter((risk: OPageRisk) => getLatestScore(risk));
  const criticalCount = risksWithScores.filter((risk: OPageRisk) => getLatestScore(risk)?.category?.toUpperCase() === 'CRITICAL').length;
  const highCount = risksWithScores.filter((risk: OPageRisk) => getLatestScore(risk)?.category?.toUpperCase() === 'HIGH').length;

  return (
    <div className="p-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">O-PAGe Risk Management</h1>
          <p className="text-gray-600 mt-2">
            Tracking mitigation actions and recommendations for risks identified by O-PAGe.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setShowCreateRisk(true)}
            className="rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            + New risk
          </button>
          <button
            onClick={() => setShowCreatePillar(true)}
            className="rounded-2xl bg-slate-800 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-900"
          >
            + New Key Pillar
          </button>
          <button
            onClick={fetchRisks}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-2xl bg-blue-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>
      {successMessage && (
        <div className="mb-6 rounded-3xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
          {successMessage}
        </div>
      )}

      {(showCreateRisk || showCreatePillar || showCreateIndicator || showEditPillar || showEditRisk || showEditIndicator) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">
                  {showCreateRisk
                    ? 'New risk'
                    : showEditRisk
                    ? 'Edit risk'
                    : showCreateIndicator
                    ? 'New indicator'
                    : showEditIndicator
                    ? 'Edit indicator'
                    : showEditPillar
                    ? 'Edit Key Pillar'
                    : 'New Key Pillar'}
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  {showCreateRisk
                    ? 'Enter the O-PAGe risk name and description.'
                    : showEditRisk
                    ? 'Modify the risk name or description.'
                    : showCreateIndicator
                    ? 'Add an indicator to the selected risk before entering its values.'
                    : showEditIndicator
                    ? 'Modify the indicator settings.'
                    : showEditPillar
                    ? 'Modify the Key Pillar name or type.'
                    : 'Enter the Key Pillar name and type.'}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowCreateRisk(false);
                  setShowCreatePillar(false);
                  setShowCreateIndicator(false);
                  setShowEditPillar(false);
                  setShowEditRisk(false);
                  setShowEditIndicator(false);
                  setError('');
                }}
                className="rounded-full bg-slate-100 p-2 text-slate-600 hover:bg-slate-200"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {showCreateRisk ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Risk name</label>
                    <input
                      value={newRiskName}
                      onChange={(e) => setNewRiskName(e.target.value)}
                      className="mt-2 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900"
                      placeholder="e.g. Algorithmic bias"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                      value={newRiskDescription}
                      onChange={(e) => setNewRiskDescription(e.target.value)}
                      className="mt-2 h-28 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900"
                      placeholder="Risk description..."
                    />
                  </div>
                </>
              ) : showEditRisk ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Risk name</label>
                    <input
                      value={editRiskName}
                      onChange={(e) => setEditRiskName(e.target.value)}
                      className="mt-2 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900"
                      placeholder="e.g. Algorithmic bias"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                      value={editRiskDescription}
                      onChange={(e) => setEditRiskDescription(e.target.value)}
                      className="mt-2 h-28 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900"
                      placeholder="Risk description..."
                    />
                  </div>
                </>
              ) : showCreateIndicator ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Associated Risk</label>
                    <input
                      value={selectedRiskForIndicator?.name || ''}
                      disabled
                      className="mt-2 w-full rounded-2xl border border-gray-200 bg-slate-100 px-4 py-3 text-sm text-gray-700"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Indicator Label</label>
                    <input
                      value={newIndicatorLabel}
                      onChange={(e) => setNewIndicatorLabel(e.target.value)}
                      className="mt-2 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900"
                      placeholder="Ex: Compliance Rate"
                    />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Weight</label>
                      <input
                        value={newIndicatorWeight}
                        onChange={(e) => setNewIndicatorWeight(e.target.value)}
                        className="mt-2 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900"
                        placeholder="0.1"
                        type="number"
                        step="0.01"
                        min="0"
                        max="1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Type</label>
                      <select
                        value={newIndicatorStatus}
                        onChange={(e) => setNewIndicatorStatus(e.target.value)}
                        className="mt-2 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900"
                      >
                        <option value="POSITIVE">POSITIVE</option>
                        <option value="NEGATIVE">NEGATIVE</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Min value</label>
                      <input
                        value={newIndicatorMin}
                        onChange={(e) => setNewIndicatorMin(e.target.value)}
                        className="mt-2 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900"
                        type="number"
                        step="0.1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Max value</label>
                      <input
                        value={newIndicatorMax}
                        onChange={(e) => setNewIndicatorMax(e.target.value)}
                        className="mt-2 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900"
                        type="number"
                        step="0.1"
                      />
                    </div>
                  </div>
                </>
              ) : showEditIndicator ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Indicator Label</label>
                    <input
                      value={editIndicatorLabel}
                      onChange={(e) => setEditIndicatorLabel(e.target.value)}
                      className="mt-2 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900"
                      placeholder="Ex: Compliance Rate"
                    />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Weight</label>
                      <input
                        value={editIndicatorWeight}
                        onChange={(e) => setEditIndicatorWeight(e.target.value)}
                        className="mt-2 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900"
                        placeholder="0.1"
                        type="number"
                        step="0.01"
                        min="0"
                        max="1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Type</label>
                      <select
                        value={editIndicatorStatus}
                        onChange={(e) => setEditIndicatorStatus(e.target.value)}
                        className="mt-2 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900"
                      >
                        <option value="POSITIVE">POSITIVE</option>
                        <option value="NEGATIVE">NEGATIVE</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Min value</label>
                      <input
                        value={editIndicatorMin}
                        onChange={(e) => setEditIndicatorMin(e.target.value)}
                        className="mt-2 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900"
                        type="number"
                        step="0.1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Max value</label>
                      <input
                        value={editIndicatorMax}
                        onChange={(e) => setEditIndicatorMax(e.target.value)}
                        className="mt-2 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900"
                        type="number"
                        step="0.1"
                      />
                    </div>
                  </div>
                </>
              ) : showEditPillar ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Key Pillar name</label>
                    <input
                      value={editPillarName}
                      onChange={(e) => setEditPillarName(e.target.value)}
                      className="mt-2 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900"
                      placeholder="e.g. KP1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Type</label>
                    <input
                      value={editPillarType}
                      onChange={(e) => setEditPillarType(e.target.value)}
                      className="mt-2 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900"
                      placeholder="e.g. Governance"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Key Pillar name</label>
                    <input
                      value={newPillarName}
                      onChange={(e) => setNewPillarName(e.target.value)}
                      className="mt-2 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900"
                      placeholder="e.g. KP1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Type</label>
                    <input
                      value={newPillarType}
                      onChange={(e) => setNewPillarType(e.target.value)}
                      className="mt-2 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900"
                      placeholder="e.g. Governance"
                    />
                  </div>
                </>
              )}
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                onClick={showCreateRisk ? createRisk : showEditRisk ? updateRisk : showCreateIndicator ? createIndicator : showEditIndicator ? updateIndicator : showEditPillar ? updateKeyPillar : createKeyPillar}
                disabled={submitLoading}
                className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
              >
                {submitLoading
                  ? 'Saving...'
                  : showCreateRisk
                  ? 'Create Risk'
                  : showEditRisk
                  ? 'Update Risk'
                  : showCreateIndicator
                  ? 'Create Indicator'
                  : showEditIndicator
                  ? 'Update Indicator'
                  : showEditPillar
                  ? 'Update Key Pillar'
                  : 'Create Key Pillar'}
              </button>
              <button
                onClick={() => {
                  setShowCreateRisk(false);
                  setShowCreatePillar(false);
                  setShowCreateIndicator(false);
                  setShowEditPillar(false);
                  setShowEditRisk(false);
                  setShowEditIndicator(false);
                  setSelectedRiskForIndicator(null);
                  setSelectedRiskToEdit(null);
                  setSelectedIndicatorToEdit(null);
                  setError('');
                }}
                className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 rounded-3xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-1 h-5 w-5 text-red-600" />
            <div>
              <p className="font-semibold text-red-900">Connection error</p>
              <p>{error}</p>
              <p className="mt-1 text-xs text-red-600">Assurez-vous que l’API O-PAGe est disponible depuis la plateforme.</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm font-semibold text-slate-500">Tracked risks</p>
            <Activity className="h-5 w-5 text-blue-600" />
          </div>
          <p className="mt-5 text-3xl font-semibold text-gray-900">{totalRisks}</p>
          <p className="mt-2 text-sm text-slate-500">Risks retrieved from O-PAGe</p>
        </div>
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm font-semibold text-slate-500">Critical</p>
            <ShieldAlert className="h-5 w-5 text-red-600" />
          </div>
          <p className="mt-5 text-3xl font-semibold text-gray-900">{criticalCount}</p>
          <p className="mt-2 text-sm text-slate-500">Critical risks to prioritize</p>
        </div>
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm font-semibold text-slate-500">High</p>
            <AlertTriangle className="h-5 w-5 text-orange-600" />
          </div>
          <p className="mt-5 text-3xl font-semibold text-gray-900">{highCount}</p>
          <p className="mt-2 text-sm text-slate-500">Risks requiring an action plan</p>
        </div>
      </div>
      <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm mb-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-lg font-semibold text-gray-900">Created Key Pillars</p>
            <p className="mt-1 text-sm text-slate-500">Pillars added by the risk manager.</p>
          </div>
          <button
            onClick={() => {
              setShowCreatePillar(true);
              setShowEditPillar(false);
            }}
            className="rounded-2xl bg-slate-800 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-900"
          >
            + New Key Pillar
          </button>
        </div>
        {keyPillars.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
            No Key Pillars created yet.
          </div>
        ) : (
          <div className="space-y-4">
            {keyPillars.map((pillar) => (
              <div key={pillar.id} className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-slate-50 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold text-gray-900">{pillar.name}</p>
                  <p className="mt-1 text-sm text-slate-500">Type : {pillar.type}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => openEditPillar(pillar)}
                    className="rounded-2xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteKeyPillar(pillar)}
                    className="rounded-2xl border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {loading ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center text-slate-600 shadow-sm">
          <RefreshCw className="mx-auto h-10 w-10 animate-spin text-blue-600" />
          <p className="mt-4">Loading O-PAGe data...</p>
        </div>
      ) : risks.length === 0 ? (
        <div className="rounded-3xl border border-gray-200 bg-white p-12 text-center text-slate-600 shadow-sm">
          <p className="text-lg font-semibold text-gray-900">No risks to manage for now</p>
          <p className="mt-2 text-sm text-slate-500">No data returned by the O-PAGe observatory.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {risks.map((risk) => {
            const latestScore = getLatestScore(risk);
            const category = getCategoryColor(latestScore?.category || '');
            return (
              <div key={risk.id} className="rounded-3xl border border-gray-200 bg-white shadow-sm">
                <div className="flex flex-col gap-4 border-b border-slate-200 p-6 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-lg font-semibold text-gray-900">{risk.name}</p>
                    {risk.description && <p className="mt-2 text-sm text-slate-600">{risk.description}</p>}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => openEditRisk(risk)}
                      title="Edit risk"
                      aria-label="Edit risk"
                      className="rounded-full p-2 text-slate-500 transition hover:bg-blue-50 hover:text-blue-600"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => deleteRisk(risk)}
                      title="Delete risk"
                      aria-label="Delete risk"
                      className="rounded-full p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${category.bg} ${category.text}`}>{category.label}</span>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700">{risk.indicators?.length || 0} indicators</span>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700">{risk.rmms?.length || 0} RMM</span>
                  </div>
                </div>
                <div className="p-6 border-b border-slate-200 text-right">
                  <button
                    onClick={() => openCreateIndicator(risk)}
                    className="rounded-2xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                  >
                    + Add indicator
                  </button>
                </div>
                <div className="space-y-4 border-t border-slate-200 p-6">
                  {risk.indicators && risk.indicators.length > 0 ? (
                    <div className="space-y-3">
                      {risk.indicators.map((indicator) => (
                        <div
                          key={indicator.id}
                          className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm"
                        >
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                              <p className="font-semibold text-gray-900">{indicator.label}</p>
                              <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-600">
                                <span className="rounded-full bg-slate-100 px-2 py-1">W: {indicator.weight}</span>
                                <span className={`rounded-full px-2 py-1 ${indicator.status === 'POSITIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                                  {indicator.status === 'POSITIVE' ? 'POSITIVE' : 'NEGATIVE'}
                                </span>
                                <span className="rounded-full bg-slate-100 px-2 py-1">{indicator.val_min} - {indicator.val_max}</span>
                              </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 text-xs">
                              <button
                                onClick={() => openEditIndicator(indicator)}
                                title="Edit indicator"
                                aria-label="Edit indicator"
                                className="rounded-full p-2 text-slate-500 transition hover:bg-blue-50 hover:text-blue-600"
                              >
                                <Pencil className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => deleteIndicator(indicator)}
                                title="Delete indicator"
                                aria-label="Delete indicator"
                                className="rounded-full p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-600"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                              <span className="rounded-full bg-amber-100 px-2 py-1 font-semibold text-amber-800">
                                {indicator.latest_value ? 'Value recorded' : 'Awaiting value'}
                              </span>
                              {indicator.latest_value && (
                                <span className="rounded-full bg-slate-100 px-2 py-1 text-slate-700">
                                  {indicator.latest_value.raw_value} / {indicator.latest_value.normalized_value.toFixed(2)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
                      No indicator attached for this risk.
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          <div className="grid gap-6 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm lg:grid-cols-3">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm uppercase tracking-wide text-slate-500">Management action</p>
              <p className="mt-3 text-sm text-slate-700">Review associated mechanisms and align controls with key factors.</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm uppercase tracking-wide text-slate-500">Indicators</p>
              <p className="mt-3 text-sm text-slate-700">Check indicator thresholds and calibrate operational alerts.</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm uppercase tracking-wide text-slate-500">Recommendation</p>
              <p className="mt-3 text-sm text-slate-700">Set up mitigation plans and track the evolution of scores.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
