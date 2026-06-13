import React, { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router';
import { rmmsApi, type RMM } from '../../services/api';
import { ArrowLeft, Download, Save } from 'lucide-react';

export function MechanismAnalysis() {
  const { id } = useParams();
  const location = useLocation();
  const state = location.state as { riskLabel?: string } | null;
  const [mechanism, setMechanism] = useState<RMM | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [analysis, setAnalysis] = useState('');

  useEffect(() => {
    const parsedId = id ? parseInt(id, 10) : NaN;
    if (Number.isNaN(parsedId)) {
      setLoading(false);
      setNotFound(true);
      return;
    }

    rmmsApi
      .get(parsedId)
      .then((data) => {
        setMechanism(data);
        setNotFound(false);
      })
      .catch(() => {
        setMechanism(null);
        setNotFound(true);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  const riskLabel = state?.riskLabel ?? mechanism?.associated_risk_name ?? id ?? 'risk';
  const isGenericRisk = !mechanism && !loading;

  if (loading) {
    return (
      <div className="p-8">
        <div className="rounded-3xl border border-gray-200 bg-white p-12 text-center text-gray-600 shadow-sm">
          Loading mechanism analysis...
        </div>
      </div>
    );
  }

  if (isGenericRisk) {
    return (
      <div className="p-8">
        <div className="mb-6">
          <Link
            to="/results"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to dashboard
          </Link>
          <h1 className="text-3xl font-semibold text-gray-900">
            Detailed risk analysis
          </h1>
          <p className="text-gray-600 mt-2">{riskLabel}</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <p className="text-sm text-gray-600">
            No mechanism analysis is available for this risk. Use this page to document your observations.
          </p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Analysis and recommendations
          </h3>
          <textarea
            value={analysis}
            onChange={(e) => setAnalysis(e.target.value)}
            placeholder="Enter your analysis here..."
            className="w-full h-64 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex gap-4">
          <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Save className="w-5 h-5" />
            Submit analysis
          </button>
          <button className="flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
            <Download className="w-5 h-5" />
            Export to PDF
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <Link
          to="/results"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to dashboard
        </Link>
        <h1 className="text-3xl font-semibold text-gray-900">
          Detailed mechanism analysis
        </h1>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {mechanism?.name}
            </h2>
            <p className="text-gray-600 mt-1">
              Associated risk: {mechanism?.associated_risk_name}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600 mb-1">Configured weight</p>
            <p className="text-3xl font-semibold text-blue-600">
              {mechanism?.kp_weights.length ? `${mechanism.kp_weights.length} pillars` : 'No pillar'}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-6">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Weight by pillar
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">
                  Pillar
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">
                  Weight
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {mechanism?.kp_weights.map((weight) => (
                <tr key={weight.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-gray-900 font-medium">
                    {weight.key_pillar_name}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm font-medium">
                      {(weight.weight * 100).toFixed(0)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Analysis and recommendations
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Write your observations and recommendations for this mitigation mechanism.
        </p>
        <textarea
          value={analysis}
          onChange={(e) => setAnalysis(e.target.value)}
          placeholder="Enter your analysis here..."
          className="w-full h-64 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex gap-4">
        <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <Save className="w-5 h-5" />
          Submit analysis
        </button>
        <button className="flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
          <Download className="w-5 h-5" />
          Export to PDF
        </button>
      </div>
    </div>
  );
}
