import React, { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { Shield, Database, Settings, TrendingUp, AlertCircle, Loader2 } from 'lucide-react';
import { pillarsApi, rmmsApi, KeyPillar, RMM } from '../../services/api';

export function AdminDashboard() {
  const [pillars, setPillars] = useState<KeyPillar[]>([]);
  const [mechanisms, setMechanisms] = useState<RMM[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [pillarData, mechanismData] = await Promise.all([
          pillarsApi.listFull(),
          rmmsApi.list(),
        ]);
        setPillars(pillarData);
        setMechanisms(mechanismData);
      } catch (error) {
        console.error('Error loading admin dashboard', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const totalMechanisms = mechanisms.length;
  const totalDimensions = pillars.reduce(
    (acc, p) => acc + p.dimensions.length,
    0
  );
  const totalFactors = pillars.reduce(
    (acc, p) =>
      acc + p.dimensions.reduce((acc2, d) => acc2 + d.factors.length, 0),
    0
  );
  const totalItems = pillars.reduce(
    (acc, p) =>
      acc +
      p.dimensions.reduce(
        (acc2, d) =>
          acc2 + d.factors.reduce((acc3, f) => acc3 + f.items.length, 0),
        0
      ),
    0
  );

  const configuredMechanisms = mechanisms.filter(
    (m) => m.kp_weights?.length > 0
  ).length;
  const configuredRate = mechanisms.length
    ? (configuredMechanisms / mechanisms.length) * 100
    : 0;

  if (isLoading) {
    return (
      <div className="p-8 flex justify-center items-center h-full">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900">
          Admin dashboard
        </h1>
        <p className="text-gray-600 mt-2">
          Overview of the M-PAGe system configuration
        </p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-gray-600">
              RMM mechanisms
            </p>
            <Shield className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-3xl font-semibold text-gray-900">
            {totalMechanisms}
          </p>
          <Link
            to="/mechanisms"
            className="text-sm text-blue-600 hover:text-blue-800 mt-2 inline-block"
          >
            Manage →
          </Link>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-gray-600">Dimensions</p>
            <Database className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-3xl font-semibold text-gray-900">
            {totalDimensions}
          </p>
          <Link
            to="/reference"
            className="text-sm text-green-600 hover:text-green-800 mt-2 inline-block"
          >
            Reference →
          </Link>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-gray-600">Factors</p>
            <Settings className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-3xl font-semibold text-gray-900">
            {totalFactors}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            {totalItems} questions in total
          </p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-gray-600">RMMs Configured</p>
            <TrendingUp className="w-5 h-5 text-orange-600" />
          </div>
          <p className="text-3xl font-semibold text-gray-900">
            {configuredRate.toFixed(0)}%
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Mechanisms with configured pillar weights
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Quick actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/mechanisms/new"
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-center"
          >
            <Shield className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="font-medium text-gray-700">
              Create a new mechanism
            </p>
          </Link>
          <Link
            to="/reference"
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors text-center"
          >
            <Database className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="font-medium text-gray-700">
              Manage the reference data
            </p>
          </Link>
          <Link
            to="/export"
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors text-center"
          >
            <Settings className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="font-medium text-gray-700">Export data</p>
          </Link>
        </div>
      </div>

      {/* Recent Mechanisms */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Recent mechanisms
        </h2>
        <div className="space-y-3">
          {mechanisms.slice(0, 3).map((mechanism) => (
            <div
              key={mechanism.id}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex-1">
                <p className="font-medium text-gray-900">{mechanism.name}</p>
                <p className="text-sm text-gray-600">
                  {mechanism.associated_risk_name}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm text-gray-600">Weight</p>
                  <p className="font-semibold text-blue-600">
                    {mechanism.kp_weights.length} pillars
                  </p>
                </div>
                <Link
                  to={`/mechanisms/${mechanism.id}/configure`}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <Settings className="w-5 h-5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Alerts */}
      <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-medium text-yellow-900">Warning</p>
          <p className="text-sm text-yellow-800 mt-1">
            Make sure all mechanisms have pillar weights configured before use.
          </p>
        </div>
      </div>
    </div>
  );
}
