import { useAuth } from '../context/AuthContext';
import { Shield, Users, BarChart3, FileText, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router';

export function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const getWelcomeMessage = () => {
    switch (user?.role) {
      case 'risk_manager':
        return 'Enter O-PAGe risks, manage mitigation mechanisms, and review the reference data';
      case 'manager':
        return 'Complete your institutional capacity assessments';
      case 'auditor':
        return 'Analyze results and prepare your recommendations';
      default:
        return '';
    }
  };

  const getQuickActions = () => {
    if (user?.role === 'risk_manager') {
      return [
        {
          title: 'O-PAGe risk entry',
          description: 'Enter indicators, normalize values, and generate risk scores',
          icon: AlertTriangle,
          color: 'bg-red-500',
          action: () => navigate('/opage-risks'),
        },
        {
          title: 'O-PAGe risk management',
          description: 'Analyze, track, and prioritize risks detected by the observatory',
          icon: Database,
          color: 'bg-slate-500',
          action: () => navigate('/opage-risk-management'),
        },
        {
          title: 'Mitigation mechanisms',
          description: 'Manage RMMs and configure pillar weights',
          icon: Shield,
          color: 'bg-purple-500',
          action: () => navigate('/mechanisms'),
        },
        {
          title: 'Reference',
          description: 'Configure pillars, dimensions, factors, and items',
          icon: FileText,
          color: 'bg-blue-500',
          action: () => navigate('/reference'),
        },
      ];
    }

    if (user?.role === 'manager') {
      return [
        {
          title: 'My campaigns',
          description: 'View and complete ongoing assessments',
          icon: FileText,
          color: 'bg-blue-500',
          action: () => navigate('/campaigns'),
        },
      ];
    }

    if (user?.role === 'auditor') {
      return [
        {
          title: 'M-PAGe results',
          description: 'View dashboards and analyses',
          icon: BarChart3,
          color: 'bg-green-500',
          action: () => navigate('/results'),
        },
        {
          title: 'Comparative view',
          description: 'Compare results across campaigns',
          icon: BarChart3,
          color: 'bg-indigo-500',
          action: () => navigate('/comparative'),
        },
      ];
    }

    return [];
  };

  const quickActions = getQuickActions();
  const displayName = user?.first_name
    ? `${user.first_name} ${user.last_name}`
    : user?.username;

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome, {displayName}
          </h1>
          <p className="text-gray-600">{getWelcomeMessage()}</p>
        </div>

        {/* Info Card */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-8 text-white mb-8">
          <div className="flex items-start gap-6">
            <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <Shield className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-2">M-PAGe Module</h2>
              <p className="text-blue-100 mb-4">
                Assessment of your institution’s capacity to mitigate algorithmic risks
              </p>
              <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                <p className="text-sm">
                  This module evaluates whether your organization has the human, technical, legal, financial, organizational, and governance capabilities to address identified risks.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <button
                  key={index}
                  onClick={action.action}
                  className="bg-white rounded-xl p-6 border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all text-left group"
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">{action.title}</h4>
                      <p className="text-sm text-gray-600">{action.description}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* System Info */}
        <div className="mt-8 bg-gray-100 rounded-xl p-6">
          <h4 className="font-semibold text-gray-900 mb-3">M-PAGe data structure</h4>
          <div className="text-sm text-gray-700 space-y-2">
            <p>The scores roll up through the hierarchy as follows:</p>
            <div className="bg-white rounded-lg p-4 font-mono text-xs space-y-1">
              <div>Items (1-5) → Factor score</div>
              <div className="ml-4">Factors → Dimension score</div>
              <div className="ml-8">Dimensions → Pillar readiness level (RL)</div>
              <div className="ml-12">Pillars → Mechanism RMMC</div>
              <div className="ml-16">Mechanisms → Risk RMC</div>
              <div className="ml-20">Risks → Global Performance Metric (GPM)</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
