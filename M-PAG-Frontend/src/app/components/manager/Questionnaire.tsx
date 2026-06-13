import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ChevronDown, ChevronUp, Save, Send, CheckCircle } from 'lucide-react';
import { mockPillars, mockCampaigns, Pillar, Campaign } from '../../data/mockData';
import * as LucideIcons from 'lucide-react';

export function Questionnaire() {
  const { campaignId } = useParams();
  const navigate = useNavigate();
  const campaign = mockCampaigns.find((c: Campaign) => c.id === campaignId);
  
  const [selectedPillar, setSelectedPillar] = useState(mockPillars[0].id);
  const [expandedDimensions, setExpandedDimensions] = useState<Set<string>>(new Set([mockPillars[0].dimensions[0]?.id]));
  const [responses, setResponses] = useState<Record<string, number>>({});
  const [comments, setComments] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);

  if (!campaign) {
    return <div className="p-8">Campaign not found</div>;
  }

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

  const handleResponseChange = (itemId: string, value: number) => {
    setResponses(prev => ({ ...prev, [itemId]: value }));
    setSaved(false);
  };

  const handleCommentChange = (itemId: string, value: string) => {
    setComments(prev => ({ ...prev, [itemId]: value }));
    setSaved(false);
  };

  const handleSaveDraft = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleSubmit = () => {
    navigate('/app/submission-confirmation');
  };

  // Calculate progress for each pillar
  const getPillarProgress = (pillarId: string) => {
    const pillar = mockPillars.find((p: Pillar) => p.id === pillarId);
    if (!pillar) return 0;

    let totalItems = 0;
    let answeredItems = 0;

    pillar.dimensions.forEach((dimension: any) => {
      dimension.factors.forEach((factor: any) => {
        factor.items.forEach((item: any) => {
          totalItems++;
          if (responses[item.id]) answeredItems++;
        });
      });
    });

    return totalItems > 0 ? (answeredItems / totalItems) * 100 : 0;
  };

  // Calculate overall progress
  const getOverallProgress = () => {
    let totalItems = 0;
    let answeredItems = 0;

    mockPillars.forEach((pillar: Pillar) => {
      pillar.dimensions.forEach((dimension: any) => {
        dimension.factors.forEach((factor: any) => {
          factor.items.forEach((item: any) => {
            totalItems++;
            if (responses[item.id]) answeredItems++;
          });
        });
      });
    });

    return totalItems > 0 ? (answeredItems / totalItems) * 100 : 0;
  };

  const overallProgress = getOverallProgress();
  const currentPillar = mockPillars.find((p: Pillar) => p.id === selectedPillar);

  // Check if all questions are answered
  let totalQuestions = 0;
  mockPillars.forEach((pillar: Pillar) => {
    pillar.dimensions.forEach((dimension: any) => {
      dimension.factors.forEach((factor: any) => {
        totalQuestions += factor.items.length;
      });
    });
  });
  const allAnswered = Object.keys(responses).length === totalQuestions;

  const getIcon = (iconName: string) => {
    const Icon = (LucideIcons as any)[iconName.split('-').map((word: string) => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join('')] || LucideIcons.Circle;
    return Icon;
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Top Progress Bar */}
      <div className="bg-white border-b border-gray-200 px-8 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-semibold text-gray-900">{campaign.name}</h2>
            <span className="text-sm font-medium text-gray-900">{overallProgress.toFixed(0)}% complete</span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 rounded-full transition-all"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Pillars Navigation */}
        <aside className="w-80 bg-white border-r border-gray-200 overflow-y-auto">
          <div className="p-4">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Key Pillars
            </h3>
            <div className="space-y-2">
              {mockPillars.map((pillar: Pillar) => {
                const Icon = getIcon(pillar.icon);
                const progress = getPillarProgress(pillar.id);
                const isActive = selectedPillar === pillar.id;

                return (
                  <button
                    key={pillar.id}
                    onClick={() => setSelectedPillar(pillar.id)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                      isActive ? 'bg-blue-50 border-2 border-blue-500' : 'border-2 border-transparent hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-gray-600'}`} />
                      <span className={`font-medium ${isActive ? 'text-blue-900' : 'text-gray-900'}`}>
                        {pillar.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${isActive ? 'bg-blue-600' : 'bg-gray-400'}`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-600">{progress.toFixed(0)}%</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto p-8">
            {currentPillar && (
              <>
                <div className="mb-6">
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">{currentPillar.name}</h1>
                  <p className="text-gray-600">
                    Answer the questions to assess your capacity within this pillar
                  </p>
                </div>

                {/* Dimensions */}
                <div className="space-y-4">
                  {currentPillar.dimensions.map((dimension: any) => {
                    const isExpanded = expandedDimensions.has(dimension.id);

                    return (
                      <div key={dimension.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                        {/* Dimension Header */}
                        <button
                          onClick={() => toggleDimension(dimension.id)}
                          className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                        >
                          <h3 className="font-semibold text-gray-900">{dimension.name}</h3>
                          {isExpanded ? (
                            <ChevronUp className="w-5 h-5 text-gray-600" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-600" />
                          )}
                        </button>

                        {/* Dimension Content */}
                        {isExpanded && (
                          <div className="px-6 pb-6">
                            {dimension.factors.map((factor: any) => (
                              <div key={factor.id} className="mb-6 last:mb-0">
                                <h4 className="font-medium text-gray-900 mb-4 bg-gray-50 px-4 py-2 rounded-lg">
                                  {factor.name}
                                </h4>

                                {/* Items/Questions */}
                                <div className="space-y-6">
                                  {factor.items.map((item: any) => (
                                    <div key={item.id} className="pl-4">
                                      <label className="block text-gray-900 mb-3">
                                        {item.question}
                                      </label>

                                      {/* Rating Scale 1-5 */}
                                      <div className="flex gap-2 mb-3">
                                        {[1, 2, 3, 4, 5].map((value) => (
                                          <button
                                            key={value}
                                            onClick={() => handleResponseChange(item.id, value)}
                                            className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all ${
                                              responses[item.id] === value
                                                ? 'border-blue-500 bg-blue-50 text-blue-900 font-medium'
                                                : 'border-gray-200 hover:border-gray-300 text-gray-700'
                                            }`}
                                          >
                                            {value}
                                          </button>
                                        ))}
                                      </div>
                                      <div className="flex justify-between text-xs text-gray-500 mb-3">
                                        <span>Very low</span>
                                        <span>Very high</span>
                                      </div>

                                      {/* Optional Comment */}
                                      <textarea
                                        value={comments[item.id] || ''}
                                        onChange={(e) => handleCommentChange(item.id, e.target.value)}
                                        placeholder="Optional comment..."
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                        rows={2}
                                      />
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}

                            <button className="w-full mt-4 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors">
                              Save and continue
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </main>
      </div>

      {/* Bottom Action Bar */}
      <div className="bg-white border-t border-gray-200 px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {saved && (
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle className="w-5 h-5" />
              <span className="text-sm">Draft saved</span>
            </div>
          )}
          {!saved && <div></div>}
          
          <div className="flex gap-3">
            <button
              onClick={handleSaveDraft}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <Save className="w-5 h-5" />
              Save draft
            </button>
            <button
              onClick={handleSubmit}
              disabled={!allAnswered}
              className={`px-6 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors ${
                allAnswered
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <Send className="w-5 h-5" />
              Submit assessment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
