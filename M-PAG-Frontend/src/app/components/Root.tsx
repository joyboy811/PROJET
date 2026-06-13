import { Outlet, useNavigate, useLocation } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../services/api';
import { 
  LayoutDashboard, 
  FileText, 
  Settings, 
  LogOut, 
  Shield,
  ClipboardList,
  BarChart3,
  BookOpen,
  Sliders,
  Download,
  User as UserIcon
} from 'lucide-react';
import { useEffect } from 'react';

export function Root() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!user) {
      navigate('/');
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const getNavigationItems = () => {
    const baseItems = [
      { path: '/app', label: 'Dashboard', icon: LayoutDashboard },
    ];

    if (user.role === 'responsable_risques') {
      return [
        ...baseItems,
        { path: '/app/mechanisms', label: 'Mechanisms', icon: Settings },
        { path: '/app/framework', label: 'Reference Framework', icon: BookOpen },
        { path: '/app/export', label: 'Export', icon: Download },
      ];
    }

    if (user.role === 'responsable_org') {
      return [
        ...baseItems,
        { path: '/app/campaigns', label: 'Campaigns', icon: ClipboardList },
        { path: '/app/export', label: 'Export', icon: Download },
      ];
    }

    if (user.role === 'auditeur') {
      return [
        ...baseItems,
        { path: '/app/results', label: 'Results', icon: BarChart3 },
        { path: '/app/comparative', label: 'Comparative', icon: Sliders },
        { path: '/app/export', label: 'Export', icon: Download },
      ];
    }

    return baseItems;
  };

  const navigationItems = getNavigationItems();

  const getRoleBadgeColor = () => {
    switch (user.role) {
      case 'responsable_risques':
        return 'bg-purple-100 text-purple-700';
      case 'responsable_org':
        return 'bg-blue-100 text-blue-700';
      case 'auditeur':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getRoleLabel = () => {
    switch (user.role) {
      case 'responsable_risques':
        return 'Risk Manager';
      case 'responsable_org':
        return 'Manager';
      case 'auditeur':
        return 'Auditor';
      default:
        return '';
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg overflow-hidden">
              <img src="/assets/logo_PAGe.PNG" alt="PAGe" className="w-10 h-10 object-cover" />
            </div>
            <div>
              <h1 className="font-bold text-gray-900">PAGe</h1>
              <p className="text-xs text-gray-500">M-PAGe Module</p>
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
              <UserIcon className="w-5 h-5 text-gray-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate">{user.first_name} {user.last_name}</p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
              <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor()}`}>
                {getRoleLabel()}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
