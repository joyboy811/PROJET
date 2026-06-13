import { useState } from 'react';
import { ChevronDown, ChevronRight, Plus, Edit2, Trash2 } from 'lucide-react';
import { FRAMEWORK_STRUCTURE, Pillar, Dimension, Factor } from '../../data/mockData';

export function ManageFramework() {
  const [expandedPillars, setExpandedPillars] = useState<Set<string>>(new Set(['governance']));
  const [expandedDimensions, setExpandedDimensions] = useState<Set<string>>(new Set());
  const [expandedFactors, setExpandedFactors] = useState<Set<string>>(new Set());

  const togglePillar = (pillarId: string) => {
    setExpandedPillars(prev => {
      const next = new Set(prev);
      if (next.has(pillarId)) {
        next.delete(pillarId);
      } else {
        next.add(pillarId);
      }
      return next;
    });
  };

  const toggleDimension = (dimensionId: string) => {
    setExpandedDimensions(prev => {
      const next = new Set(prev);
      if (next.has(dimensionId)) {
        next.delete(dimensionId);
      } else {
        next.add(dimensionId);
      }
      return next;
    });
  };

  const toggleFactor = (factorId: string) => {
    setExpandedFactors(prev => {
      const next = new Set(prev);
      if (next.has(factorId)) {
        next.delete(factorId);
      } else {
        next.add(factorId);
      }
      return next;
    });
  };

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Framework management
          </h1>
          <p className="text-gray-600">
            Configure the full structure: Pillars, Dimensions, Factors, and Items/Questions
          </p>
        </div>

        {/* Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-900">
            <strong>Note:</strong> The 6 key pillars are fixed. You can add, edit, and delete dimensions, factors, and items.
          </p>
        </div>

        {/* Tree Structure */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="divide-y divide-gray-200">
            {FRAMEWORK_STRUCTURE.map((pillar) => (
              <div key={pillar.id}>
                {/* Pillar Level */}
                <div className="bg-gray-50">
                  <button
                    onClick={() => togglePillar(pillar.id)}
                    className="w-full px-6 py-4 flex items-center gap-3 hover:bg-gray-100 transition-colors"
                  >
                    {expandedPillars.has(pillar.id) ? (
                      <ChevronDown className="w-5 h-5 text-gray-600" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-600" />
                    )}
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                      <span className="text-white text-sm font-bold">P</span>
                    </div>
                    <span className="font-semibold text-gray-900 flex-1 text-left">
                      {pillar.name}
                    </span>
                    <span className="text-sm text-gray-500">
                      {pillar.dimensions.length} dimension(s)
                    </span>
                  </button>
                </div>

                {/* Dimensions */}
                {expandedPillars.has(pillar.id) && (
                  <div className="bg-white">
                    {pillar.dimensions.map((dimension) => (
                      <div key={dimension.id}>
                        {/* Dimension Level */}
                        <div className="ml-8 border-l-2 border-gray-200">
                          <button
                            onClick={() => toggleDimension(dimension.id)}
                            className="w-full px-6 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors"
                          >
                            {expandedDimensions.has(dimension.id) ? (
                              <ChevronDown className="w-4 h-4 text-gray-600" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-gray-600" />
                            )}
                            <div className="w-7 h-7 bg-green-100 rounded flex items-center justify-center">
                              <span className="text-green-700 text-xs font-bold">D</span>
                            </div>
                            <span className="font-medium text-gray-900 flex-1 text-left">
                              {dimension.name}
                            </span>
                            <span className="text-sm text-gray-500">
                              {dimension.factors.length} factors
                            </span>
                            <div className="flex items-center gap-1">
                              <button className="p-1.5 hover:bg-gray-200 rounded transition-colors">
                                <Edit2 className="w-4 h-4 text-gray-600" />
                              </button>
                              <button className="p-1.5 hover:bg-gray-200 rounded transition-colors">
                                <Trash2 className="w-4 h-4 text-red-600" />
                              </button>
                            </div>
                          </button>
                        </div>

                        {/* Factors */}
                        {expandedDimensions.has(dimension.id) && (
                          <div className="ml-16 border-l-2 border-gray-200">
                            {dimension.factors.map((factor) => (
                              <div key={factor.id}>
                                {/* Factor Level */}
                                <button
                                  onClick={() => toggleFactor(factor.id)}
                                  className="w-full px-6 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors"
                                >
                                  {expandedFactors.has(factor.id) ? (
                                    <ChevronDown className="w-4 h-4 text-gray-600" />
                                  ) : (
                                    <ChevronRight className="w-4 h-4 text-gray-600" />
                                  )}
                                  <div className="w-6 h-6 bg-yellow-100 rounded flex items-center justify-center">
                                    <span className="text-yellow-700 text-xs font-bold">F</span>
                                  </div>
                                  <span className="text-gray-900 flex-1 text-left">
                                    {factor.name}
                                  </span>
                                  <span className="text-sm text-gray-500">
                                    {factor.items.length} items
                                  </span>
                                  <div className="flex items-center gap-1">
                                    <button className="p-1.5 hover:bg-gray-200 rounded transition-colors">
                                      <Edit2 className="w-4 h-4 text-gray-600" />
                                    </button>
                                    <button className="p-1.5 hover:bg-gray-200 rounded transition-colors">
                                      <Trash2 className="w-4 h-4 text-red-600" />
                                    </button>
                                  </div>
                                </button>

                                {/* Items */}
                                {expandedFactors.has(factor.id) && (
                                  <div className="ml-8 bg-gray-50">
                                    {factor.items.map((item) => (
                                      <div
                                        key={item.id}
                                        className="px-6 py-3 flex items-center gap-3 border-b border-gray-200 last:border-b-0"
                                      >
                                        <div className="w-5 h-5 bg-purple-100 rounded flex items-center justify-center">
                                          <span className="text-purple-700 text-xs font-bold">I</span>
                                        </div>
                                        <span className="text-gray-700 flex-1 text-sm">
                                          {item.question}
                                        </span>
                                        <div className="flex items-center gap-1">
                                          <button className="p-1.5 hover:bg-gray-200 rounded transition-colors">
                                            <Edit2 className="w-4 h-4 text-gray-600" />
                                          </button>
                                          <button className="p-1.5 hover:bg-gray-200 rounded transition-colors">
                                            <Trash2 className="w-4 h-4 text-red-600" />
                                          </button>
                                        </div>
                                      </div>
                                    ))}
                                    <button className="w-full px-6 py-3 flex items-center gap-2 text-purple-700 hover:bg-purple-50 transition-colors border-t border-gray-200">
                                      <Plus className="w-4 h-4" />
                                      <span className="text-sm">Add item</span>
                                    </button>
                                  </div>
                                )}
                              </div>
                            ))}
                            <button className="w-full px-6 py-3 flex items-center gap-2 text-yellow-700 hover:bg-yellow-50 transition-colors border-t border-gray-200">
                              <Plus className="w-4 h-4" />
                              <span className="text-sm">Add factor</span>
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                    <div className="ml-8 border-l-2 border-gray-200">
                      <button className="w-full px-6 py-3 flex items-center gap-2 text-green-700 hover:bg-green-50 transition-colors">
                        <Plus className="w-4 h-4" />
                        <span className="text-sm">Add dimension</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
