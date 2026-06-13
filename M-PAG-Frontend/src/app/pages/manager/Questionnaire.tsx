import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { opageApi, campaignsApi, responsesApi, dimensionsApi, pillarsApi, OPageKeyPillar, Dimension, Campaign } from '../../services/api';
import {
  Shield,
  Scale,
  Cpu,
  Users,
  Building,
  Euro,
  ChevronDown,
  ChevronRight,
  Save,
  Send,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

const getPillarIcon = (pillarCode?: string) => {
  const key = pillarCode?.toLowerCase() || '';
  if (key.includes('legal')) return Scale;
  if (key.includes('tech')) return Cpu;
  if (key.includes('human')) return Users;
  if (key.includes('org')) return Building;
  if (key.includes('fin')) return Euro;
  return Shield;
};

interface OpPagePillarWithDimensions extends OPageKeyPillar {
  dimensions: Dimension[];
  mappedPillarId?: number;
  code?: string;
}

export function Questionnaire() {
  const navigate = useNavigate();
  const [pillars, setPillars] = useState<OpPagePillarWithDimensions[]>([]);
  const [activeCampaign, setActiveCampaign] = useState<Campaign | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [selectedPillar, setSelectedPillar] = useState<number | null>(null);
  const [expandedDimensions, setExpandedDimensions] = useState<number[]>([]);
  
  const [responses, setResponses] = useState<{ [key: number]: number }>({});
  const [comments, setComments] = useState<{ [key: number]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [opagePillars, campaignsData, mpagePillars] = await Promise.all([
          opageApi.keyPillars(),
          campaignsApi.list(),
          pillarsApi.list()
        ]);

        const mpagePillarMap = new Map<string, number>();
        mpagePillars.forEach((p) => {
          mpagePillarMap.set(p.pillar_type.toLowerCase(), p.id);
          mpagePillarMap.set(p.name.toLowerCase(), p.id);
          mpagePillarMap.set(p.code.toLowerCase(), p.id);
        });

        const pillarsWithDimensions = await Promise.all(
          opagePillars.map(async (pillar) => {
            const mappedId = mpagePillarMap.get(pillar.type.toLowerCase()) ?? mpagePillarMap.get(pillar.name.toLowerCase());
            if (!mappedId) {
              return { ...pillar, dimensions: [], mappedPillarId: undefined } as OpPagePillarWithDimensions;
            }

            const dimensions = await dimensionsApi.list(mappedId).catch(() => []);
            return { ...pillar, dimensions, mappedPillarId: mappedId } as OpPagePillarWithDimensions;
          })
        );

        setPillars(pillarsWithDimensions);
        if (pillarsWithDimensions.length > 0) {
          setSelectedPillar(pillarsWithDimensions[0].id);
          if (pillarsWithDimensions[0].dimensions?.length > 0) {
            setExpandedDimensions([pillarsWithDimensions[0].dimensions[0].id]);
          }
        }

        const active = campaignsData.find(c => c.status !== 'completed');
        if (active) {
          setActiveCampaign(active);
        }
      } catch (error) {
        toast.error('Error loading the questionnaire');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Calculate progress
  const totalQuestions = pillars.reduce(
    (acc, p) =>
      acc +
      (p.dimensions?.reduce(
        (acc2, d) =>
          acc2 + (d.factors?.reduce((acc3, f) => acc3 + (f.items?.length || 0), 0) || 0),
        0
      ) || 0),
    0
  );
  
  const answeredQuestions = Object.keys(responses).length;
  const progress = totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0;

  const toggleDimension = (dimensionId: number) => {
    setExpandedDimensions((prev) =>
      prev.includes(dimensionId)
        ? prev.filter((id) => id !== dimensionId)
        : [...prev, dimensionId]
    );
  };

  const handleResponse = (itemId: number, value: number) => {
    setResponses({ ...responses, [itemId]: value });
  };

  const handleComment = (itemId: number, value: string) => {
    setComments({ ...comments, [itemId]: value });
  };

  const handleSubmit = async () => {
    if (!activeCampaign) {
      toast.error('No active campaign found. Please create a campaign first.');
      return;
    }

    const payload = Object.entries(responses).map(([itemIdStr, value]) => ({
      item_id: parseInt(itemIdStr, 10),
      response: value,
      comment: comments[parseInt(itemIdStr, 10)] || ''
    }));

    setIsSubmitting(true);
    try {
      await responsesApi.batchSubmit(activeCampaign.id, payload);
      toast.success('Responses submitted successfully!');
      if (answeredQuestions === totalQuestions) {
        navigate('/submission-confirmation');
      }
    } catch (error: any) {
      toast.error(error.message || 'Error submitting the questionnaire');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!activeCampaign) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow max-w-md text-center">
          <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">No active campaign</h2>
          <p className="text-gray-600 mb-6">
            You do not have a campaign in progress. Please go to the Campaigns section to create a new one before completing the questionnaire.
          </p>
          <button
            onClick={() => navigate('/campaigns')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go to campaigns
          </button>
        </div>
      </div>
    );
  }

  const currentPillar = pillars.find((p) => p.id === selectedPillar);
  if (!currentPillar) return null;

  const pillarProgress = (pillarId: number) => {
    const pillar = pillars.find((p) => p.id === pillarId);
    if (!pillar) return 0;
    const pillarQuestions = pillar.dimensions?.reduce(
      (acc, d) =>
        acc + (d.factors?.reduce((acc2, f) => acc2 + (f.items?.length || 0), 0) || 0),
      0
    ) || 0;
    if (pillarQuestions === 0) return 0;
    
    const pillarAnswered = pillar.dimensions?.reduce(
      (acc, d) =>
        acc +
        (d.factors?.reduce(
          (acc2, f) =>
            acc2 + (f.items?.filter((i) => responses[i.id] !== undefined).length || 0),
          0
        ) || 0),
      0
    ) || 0;
    return (pillarAnswered / pillarQuestions) * 100;
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left sidebar - Pillars */}
      <aside className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            M-PAGe Questionnaire
          </h2>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Overall progress</span>
              <span className="font-medium text-gray-900">
                {progress.toFixed(0)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-gray-500">
              {answeredQuestions} / {totalQuestions} questions answered
            </p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {pillars.map((pillar) => {
            const Icon = getPillarIcon(pillar.type);
            const isActive = selectedPillar === pillar.id;
            const progress = pillarProgress(pillar.id);

            return (
              <button
                key={pillar.id}
                onClick={() => setSelectedPillar(pillar.id)}
                className={`w-full text-left p-4 rounded-lg transition-colors ${
                  isActive ? 'bg-blue-50 border-2 border-blue-500' : 'border-2 border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-gray-600'}`} />
                  <span className={`font-medium ${isActive ? 'text-blue-900' : 'text-gray-900'}`}>
                    {pillar.name}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full ${isActive ? 'bg-blue-600' : 'bg-gray-400'}`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {progress.toFixed(0)}% complete
                </p>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-8 max-w-4xl">
          <h1 className="text-2xl font-semibold text-gray-900 mb-6">
            {currentPillar.name}
          </h1>

          <div className="space-y-4">
            {currentPillar.dimensions?.map((dimension) => (
              <div
                key={dimension.id}
                className="bg-white rounded-lg border border-gray-200 overflow-hidden"
              >
                <button
                  onClick={() => toggleDimension(dimension.id)}
                  className="w-full flex items-center gap-3 p-5 bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  {expandedDimensions.includes(dimension.id) ? (
                    <ChevronDown className="w-5 h-5 text-gray-600" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-600" />
                  )}
                  <span className="font-semibold text-gray-900">
                    {dimension.name}
                  </span>
                </button>

                {expandedDimensions.includes(dimension.id) && (
                  <div className="p-6 space-y-6">
                    {dimension.factors?.map((factor) => (
                      <div key={factor.id} className="space-y-4">
                        <h4 className="font-medium text-gray-900">
                          {factor.name}
                        </h4>
                        {factor.items?.map((item) => (
                          <div
                            key={item.id}
                            className="pl-4 border-l-2 border-gray-200 space-y-3"
                          >
                            <p className="text-gray-700"><span className="font-semibold">{item.code}</span>: {item.label}</p>
                            
                            {/* Rating scale 1-5 */}
                            <div className="flex gap-2">
                              {[1, 2, 3, 4, 5].map((value) => (
                                <button
                                  key={value}
                                  onClick={() => handleResponse(item.id, value)}
                                  className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${
                                    responses[item.id] === value
                                      ? 'border-blue-500 bg-blue-50 text-blue-900 font-medium'
                                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                                  }`}
                                >
                                  {value}
                                </button>
                              ))}
                            </div>
                            <div className="flex justify-between text-xs text-gray-500">
                              <span>Very Low</span>
                              <span>Very High</span>
                            </div>

                            {/* Comment field */}
                            <textarea
                              placeholder="Optional comment..."
                              value={comments[item.id] || ''}
                              onChange={(e) => handleComment(item.id, e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                              rows={2}
                            />
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Fixed bottom bar */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6">
          <div className="max-w-4xl flex items-center justify-between gap-4">
            <button 
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              Save draft
            </button>
            <button
              onClick={handleSubmit}
              disabled={answeredQuestions < totalQuestions || isSubmitting}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-colors ${
                answeredQuestions === totalQuestions
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              } disabled:opacity-50`}
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              Submit Assessment
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
