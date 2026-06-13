import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, Plus, Edit, Trash2, Loader2 } from 'lucide-react';
import { AddEditDimensionModal } from '../../components/modals/AddEditDimensionModal';
import { AddEditFactorModal } from '../../components/modals/AddEditFactorModal';
import { AddEditItemModal } from '../../components/modals/AddEditItemModal';
import { opageApi, pillarsApi, dimensionsApi, factorsApi, itemsApi, Dimension, OPageKeyPillar } from '../../services/api';
import { toast } from 'sonner';

interface PillarWithDimensions extends OPageKeyPillar {
  dimensions: Dimension[];
  code?: string;
  pillar_type?: string;
  mappedPillarId?: number;
}

export function ReferenceManagement() {
  const [pillars, setPillars] = useState<PillarWithDimensions[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [expandedPillars, setExpandedPillars] = useState<number[]>([]);
  const [expandedDimensions, setExpandedDimensions] = useState<number[]>([]);
  const [expandedFactors, setExpandedFactors] = useState<number[]>([]);

  // Modal states
  const [dimensionModal, setDimensionModal] = useState<{
    isOpen: boolean;
    pillarName: string;
    pillarId?: number;
    dimension?: any;
  }>({ isOpen: false, pillarName: '' });

  const [factorModal, setFactorModal] = useState<{
    isOpen: boolean;
    dimensionName: string;
    dimensionId?: number;
    factor?: any;
  }>({ isOpen: false, dimensionName: '' });

  const [itemModal, setItemModal] = useState<{
    isOpen: boolean;
    factorName: string;
    factorId?: number;
    item?: any;
  }>({ isOpen: false, factorName: '' });

  const fetchPillars = async () => {
    setIsLoading(true);
    try {
      const [opagePillars, mpagePillars] = await Promise.all([
        opageApi.keyPillars(),
        pillarsApi.listWithLegacy(),
      ]);

      const normalizeKey = (value?: string) => value?.trim().toLowerCase() || '';

      const createMpagePillar = async (pillar: OPageKeyPillar) => {
        const pillar_type = (pillar.type?.trim() || pillar.name?.trim() || `opage-${pillar.id}`).toLowerCase();
        const name = pillar.name.trim() || pillar.type.trim() || `O-PAGe Pillar ${pillar.id}`;
        const code = normalizeKey(pillar.type || pillar.name).replace(/\s+/g, '-') || `opage-${pillar.id}`;

        try {
          return await pillarsApi.create({ name, code, pillar_type });
        } catch {
          return undefined;
        }
      };

      const mpagePillarMap = new Map<string, number>();
      const mpagePillarInfo = new Map<number, { code: string; pillar_type: string; name: string }>();
      mpagePillars.forEach((p) => {
        mpagePillarMap.set(normalizeKey(p.pillar_type), p.id);
        mpagePillarMap.set(normalizeKey(p.name), p.id);
        mpagePillarMap.set(normalizeKey(p.code), p.id);
        mpagePillarInfo.set(p.id, { code: p.code, pillar_type: p.pillar_type, name: p.name });
      });

      const pillarsWithDims: PillarWithDimensions[] = await Promise.all(
        opagePillars.map(async (pillar) => {
          let mappedId = mpagePillarMap.get(normalizeKey(pillar.type)) ?? mpagePillarMap.get(normalizeKey(pillar.name));
          let mappedInfo = mappedId ? mpagePillarInfo.get(mappedId) : undefined;

          if (!mappedId) {
            const createdPillar = await createMpagePillar(pillar);
            if (createdPillar) {
              mappedId = createdPillar.id;
              mappedInfo = { code: createdPillar.code, pillar_type: createdPillar.pillar_type, name: createdPillar.name };
              mpagePillarMap.set(normalizeKey(createdPillar.pillar_type), mappedId);
              mpagePillarMap.set(normalizeKey(createdPillar.name), mappedId);
              mpagePillarMap.set(normalizeKey(createdPillar.code), mappedId);
              mpagePillarInfo.set(mappedId, mappedInfo);
            }
          }

          if (!mappedId) {
            return { ...pillar, dimensions: [], mappedPillarId: undefined };
          }

          try {
            const dims = await dimensionsApi.list(mappedId);
            return {
              ...pillar,
              dimensions: dims,
              mappedPillarId: mappedId,
              code: mappedInfo?.code,
              pillar_type: mappedInfo?.pillar_type,
            };
          } catch {
            return {
              ...pillar,
              dimensions: [],
              mappedPillarId: mappedId,
              code: mappedInfo?.code,
              pillar_type: mappedInfo?.pillar_type,
            };
          }
        })
      );
      
      setPillars(pillarsWithDims);
    } catch (error) {
      toast.error('Error loading reference');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPillars();
  }, []);

  const togglePillar = (pillarId: number) => {
    setExpandedPillars((prev) =>
      prev.includes(pillarId)
        ? prev.filter((id) => id !== pillarId)
        : [...prev, pillarId]
    );
  };

  const toggleDimension = (dimensionId: number) => {
    setExpandedDimensions((prev) =>
      prev.includes(dimensionId)
        ? prev.filter((id) => id !== dimensionId)
        : [...prev, dimensionId]
    );
  };

  const toggleFactor = (factorId: number) => {
    setExpandedFactors((prev) =>
      prev.includes(factorId)
        ? prev.filter((id) => id !== factorId)
        : [...prev, factorId]
    );
  };

  const handleDeleteDimension = async (id: number) => {
    if (!window.confirm('Confirm deletion of this dimension?')) return;
    try {
      await dimensionsApi.delete(id);
      toast.success('Dimension deleted');
      fetchPillars();
    } catch (e) {
      toast.error('Error deleting dimension');
    }
  };

  const handleDeleteFactor = async (id: number) => {
    if (!window.confirm('Confirm deletion of this factor?')) return;
    try {
      await factorsApi.delete(id);
      toast.success('Factor deleted');
      fetchPillars();
    } catch (e) {
      toast.error('Error deleting factor');
    }
  };

  const handleDeleteItem = async (id: number) => {
    if (!window.confirm('Confirm deletion of this question?')) return;
    try {
      await itemsApi.delete(id);
      toast.success('Question deleted');
      fetchPillars();
    } catch (e) {
      toast.error('Error deleting question');
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 flex justify-center items-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900">
          Reference Management
        </h1>
        <p className="text-gray-600 mt-2">
          Configure the hierarchical structure: Pillars, Dimensions, Factors, and Items
        </p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="space-y-2">
          {pillars.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <p className="text-gray-500">No pillars created. Go to "Risk Management" to add Key Pillars.</p>
            </div>
          )}
          {pillars.map((pillar) => (
            <div key={pillar.id} className="border border-gray-200 rounded-lg">
              {/* Pillar Level */}
              <div className="flex items-center gap-3 p-4 bg-gray-50">
                <button
                  onClick={() => togglePillar(pillar.id)}
                  className="text-gray-600 hover:text-gray-900"
                >
                  {expandedPillars.includes(pillar.id) ? (
                    <ChevronDown className="w-5 h-5" />
                  ) : (
                    <ChevronRight className="w-5 h-5" />
                  )}
                </button>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{pillar.name} ({pillar.code})</p>
                  <p className="text-sm text-gray-500">Pillar - {pillar.pillar_type}</p>
                </div>
              </div>

              {/* Dimensions */}
              {expandedPillars.includes(pillar.id) && (
                <div className="p-4 space-y-2">
                  {pillar.dimensions?.map((dimension) => (
                    <div key={dimension.id} className="border border-gray-200 rounded-lg ml-8">
                      <div className="flex items-center gap-3 p-3 bg-blue-50">
                        <button
                          onClick={() => toggleDimension(dimension.id)}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          {expandedDimensions.includes(dimension.id) ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </button>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{dimension.name} <span className="text-sm text-gray-500">({dimension.code})</span></p>
                          <p className="text-xs text-gray-500">Dimension</p>
                        </div>
                        <button
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded"
                          onClick={() =>
                            setDimensionModal({
                              isOpen: true,
                              pillarName: pillar.name,
                              pillarId: pillar.mappedPillarId ?? pillar.id,
                              dimension: dimension,
                            })
                          }
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          className="p-2 text-red-600 hover:bg-red-100 rounded"
                          onClick={() => handleDeleteDimension(dimension.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Factors */}
                      {expandedDimensions.includes(dimension.id) && (
                        <div className="p-3 space-y-2">
                          {dimension.factors?.map((factor) => (
                            <div key={factor.id} className="border border-gray-200 rounded-lg ml-8">
                              <div className="flex items-center gap-3 p-3 bg-green-50">
                                <button
                                  onClick={() => toggleFactor(factor.id)}
                                  className="text-gray-600 hover:text-gray-900"
                                >
                                  {expandedFactors.includes(factor.id) ? (
                                    <ChevronDown className="w-4 h-4" />
                                  ) : (
                                    <ChevronRight className="w-4 h-4" />
                                  )}
                                </button>
                                <div className="flex-1">
                                  <p className="font-medium text-gray-900">{factor.name} <span className="text-sm text-gray-500">({factor.code})</span></p>
                                  <p className="text-xs text-gray-500">Factor</p>
                                </div>
                                <button
                                  className="p-2 text-blue-600 hover:bg-blue-100 rounded"
                                  onClick={() =>
                                    setFactorModal({
                                      isOpen: true,
                                      dimensionName: dimension.name,
                                      dimensionId: dimension.id,
                                      factor: factor,
                                    })
                                  }
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button 
                                  className="p-2 text-red-600 hover:bg-red-100 rounded"
                                  onClick={() => handleDeleteFactor(factor.id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>

                              {/* Items */}
                              {expandedFactors.includes(factor.id) && (
                                <div className="p-3 space-y-2">
                                  {factor.items?.map((item) => (
                                    <div
                                      key={item.id}
                                      className="flex items-center gap-3 p-3 bg-purple-50 border border-purple-200 rounded ml-8"
                                    >
                                      <div className="flex-1">
                                        <p className="text-sm text-gray-900"><span className="font-semibold">{item.code}</span>: {item.label}</p>
                                        <p className="text-xs text-gray-500">Item / Question</p>
                                      </div>
                                      <button
                                        className="p-2 text-blue-600 hover:bg-blue-100 rounded"
                                        onClick={() =>
                                          setItemModal({
                                            isOpen: true,
                                            factorName: factor.name,
                                            factorId: factor.id,
                                            item: item,
                                          })
                                        }
                                      >
                                        <Edit className="w-4 h-4" />
                                      </button>
                                      <button 
                                        className="p-2 text-red-600 hover:bg-red-100 rounded"
                                        onClick={() => handleDeleteItem(item.id)}
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </div>
                                  ))}
                                  <button
                                    className="flex items-center gap-2 px-3 py-2 text-sm text-purple-700 hover:bg-purple-100 rounded ml-8"
                                    onClick={() =>
                                      setItemModal({
                                        isOpen: true,
                                        factorName: factor.name,
                                        factorId: factor.id,
                                      })
                                    }
                                  >
                                    <Plus className="w-4 h-4" />
                                    Add an item
                                  </button>
                                </div>
                              )}
                            </div>
                          ))}
                          <button
                            className="flex items-center gap-2 px-3 py-2 text-sm text-green-700 hover:bg-green-100 rounded ml-8"
                            onClick={() =>
                              setFactorModal({
                                isOpen: true,
                                dimensionName: dimension.name,
                                dimensionId: dimension.id,
                              })
                            }
                          >
                            <Plus className="w-4 h-4" />
                            Add a factor
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                  <button
                    className="flex items-center gap-2 px-3 py-2 text-sm text-blue-700 hover:bg-blue-100 rounded ml-8 disabled:text-gray-400 disabled:hover:bg-transparent"
                    onClick={() =>
                      setDimensionModal({
                        isOpen: true,
                        pillarName: pillar.name,
                        pillarId: pillar.mappedPillarId,
                      })
                    }
                    disabled={!pillar.mappedPillarId}
                    title={pillar.mappedPillarId ? 'Add a Dimension' : 'This pillar is not linked to an M-PAGe pillar'}
                  >
                    <Plus className="w-4 h-4" />
                    Add a dimension
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Modals */}
      <AddEditDimensionModal
        isOpen={dimensionModal.isOpen}
        onClose={() => setDimensionModal({ isOpen: false, pillarName: '' })}
        onSuccess={fetchPillars}
        pillarName={dimensionModal.pillarName}
        pillarId={dimensionModal.pillarId}
        dimension={dimensionModal.dimension}
      />
      <AddEditFactorModal
        isOpen={factorModal.isOpen}
        onClose={() => setFactorModal({ isOpen: false, dimensionName: '' })}
        onSuccess={fetchPillars}
        dimensionName={factorModal.dimensionName}
        dimensionId={factorModal.dimensionId}
        factor={factorModal.factor}
      />
      <AddEditItemModal
        isOpen={itemModal.isOpen}
        onClose={() => setItemModal({ isOpen: false, factorName: '' })}
        onSuccess={fetchPillars}
        factorName={itemModal.factorName}
        factorId={itemModal.factorId}
        item={itemModal.item}
      />
    </div>
  );
}