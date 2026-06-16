import React, { useMemo, useState } from 'react';
import { Outlet, Link, NavLink, useNavigate, useLocation } from 'react-router';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  FileText,
  LogOut,
  BarChart3,
  Database,
  ClipboardList,
  Download,
  Shield,
  AlertTriangle,
  TrendingUp,
} from 'lucide-react';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from './ui/accordion';

export function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeGroup, setActiveGroup] = useState<string | undefined>();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (!user) return null;

  const displayName = user.first_name
    ? `${user.first_name} ${user.last_name}`
    : user.username;

  const roleLabels: Record<string, string> = {
    system_admin: 'System Administrator',
    administrateur: 'Administrative Organizer',
    responsable_risques: 'Risk Manager',
    responsable_org: 'Organizational Manager',
    auditeur: 'Auditor / Expert',
    decideur: 'Decision Maker',
    observateur: 'Observer',
  };

  const moduleGroups = useMemo(
    () => [
      {
        id: 'opage',
        label: 'O-PAGe',
        description: 'Algorithmic Risks',
        items: [
          {
            path: '/opage-risks',
            label: 'Risk Assessment',
            icon: AlertTriangle,
            roles: ['responsable_risques', 'auditeur'],
          },
          {
            path: '/opage-risk-management',
            label: 'Risk Management',
            icon: Database,
            roles: ['responsable_risques'],
          },
        ],
      },
      {
        id: 'mpage',
        label: 'M-PAGe',
        description: 'Mitigation Capacity',
        items: [
          {
            path: '/dashboard',
            label: 'Dashboard',
            icon: LayoutDashboard,
            roles: ['administrateur', 'responsable_org', 'observateur'],
          },
          {
            path: '/reference',
            label: 'Reference Framework Configuration',
            icon: Database,
            roles: ['administrateur'],
          },
          {
            path: '/mechanisms',
            label: 'Mitigation Mechanisms',
            icon: Shield,
            roles: ['administrateur'],
          },
          {
            path: '/campaigns',
            label: 'Assessment Campaigns',
            icon: FileText,
            roles: ['administrateur', 'responsable_org'],
          },
          {
            path: '/questionnaire',
            label: 'Questionnaire',
            icon: ClipboardList,
            roles: ['responsable_org'],
          },
          {
            path: '/results',
            label: 'Assessment Results',
            icon: BarChart3,
            roles: ['auditeur', 'observateur'],
          },
          {
            path: '/comparative',
            label: 'Comparative Analysis',
            icon: FileText,
            roles: ['auditeur', 'observateur'],
          },
        ],
      },
      {
        id: 'ipage',
        label: 'I-PAGe',
        description: 'Impact Simulation',
        items: [
          {
            path: '/impact-simulation',
            label: 'Impact Simulation',
            icon: TrendingUp,
            roles: ['responsable_org', 'decideur', 'observateur'],
          },
        ],
      },
      {
        id: 'reports',
        label: 'Reporting & Export',
        description: 'Documentation and export',
        items: [
          {
            path: '/export',
            label: 'Export',
            icon: Download,
            roles: ['administrateur', 'responsable_org', 'auditeur', 'decideur', 'observateur'],
          },
        ],
      },
      {
        id: 'system',
        label: 'Administration',
        description: 'Account Management',
        items: [
          {
            path: '/admin/users',
            label: 'Account Management',
            icon: Shield,
            roles: ['system_admin'],
          },
          {
            path: '/admin/projects',
            label: 'Project Management',
            icon: Database,
            roles: ['system_admin'],
          },
        ],
      },
    ],
    [],
  );

  const visibleGroups = moduleGroups.filter((group) =>
    group.items.some((item) => item.roles.includes(user.role)),
  );

  const currentPath = location.pathname;
  const currentActiveGroup =
    visibleGroups.find((group) =>
      group.items.some((item) => currentPath.startsWith(item.path)),
    )?.id ?? 'mpage';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex min-h-screen">
        <aside className="hidden w-80 flex-col border-r border-slate-200 bg-white px-4 py-6 lg:flex">
          <div className="mb-8 flex items-center gap-3 px-2">
            <div className="h-12 w-12 rounded-2xl overflow-hidden flex items-center justify-center">
              <img src="/assets/logo_PAGe.PNG" alt="PAGe" className="h-12 w-12 object-cover" />
            </div>
            <div>
              <p className="text-lg font-semibold">PAGe Platform</p>
              <p className="text-sm text-slate-500">Global Module Menu</p>
            </div>
          </div>

          <div className="space-y-3">
            <Accordion
              type="single"
              collapsible
              value={activeGroup ?? currentActiveGroup}
              onValueChange={(value) => setActiveGroup(value ?? undefined)}
              className="space-y-3"
            >
              {visibleGroups.map((group) => (
                <AccordionItem
                  key={group.id}
                  value={group.id}
                  className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-50"
                >
                  <AccordionTrigger className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left text-sm font-semibold text-slate-900 hover:bg-slate-100">
                    <span>{group.label}</span>
                    <span className="text-xs text-slate-500">View</span>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-2 px-4 pb-4 pt-2">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{group.description}</p>
                    <div className="space-y-1">
                      {group.items
                        .filter((item) => item.roles.includes(user.role))
                        .map((item) => {
                          const Icon = item.icon;
                          return (
                            <NavLink
                              key={item.path}
                              to={item.path}
                              className={({ isActive }) =>
                                `flex items-center gap-2 rounded-2xl px-3 py-2 text-sm transition ${
                                  isActive
                                    ? 'bg-blue-600 text-white'
                                    : 'text-slate-700 hover:bg-slate-100'
                                }`
                              }
                            >
                              <Icon className="h-4 w-4" />
                              <span>{item.label}</span>
                            </NavLink>
                          );
                        })}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </aside>

        <div className="flex flex-1 flex-col">
          <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur sm:px-6 lg:px-8">
            <div className="lg:hidden">
              <p className="text-lg font-semibold">PAGe Platform</p>
              <p className="text-sm text-slate-500">Global Navigation</p>
            </div>
            <div className="ml-auto flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2">
              <div className="text-right">
                <p className="text-sm font-semibold text-slate-900">{displayName}</p>
                <p className="text-xs text-slate-500">{roleLabels[user.role] || user.role}</p>
              </div>
              {user.project && (
                <p className="text-base font-bold" style={{ color: '#155AF0' }}>{user.project.name}</p>
              )}
              <button
                onClick={handleLogout}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-100"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </header>

          <main className="flex-1 bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
