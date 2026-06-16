import { createBrowserRouter, Navigate } from 'react-router';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { MechanismList } from './pages/admin/MechanismList';
import { MechanismConfig } from './pages/admin/MechanismConfig';
import { CreateMechanism } from './pages/admin/CreateMechanism';
import { EditMechanism } from './pages/admin/EditMechanism';
import { ReferenceManagement } from './pages/admin/ReferenceManagement';
import { AdminDashboard } from './pages/admin/Dashboard';
import { UserManagement } from './pages/UserManagement';
import { ProjectManagement } from './pages/ProjectManagement';
import { OPageRisks } from './pages/risk_manager/OPageRisks';
import { OPageRiskManagement } from './pages/risk_manager/OPageRiskManagement';
import { ImpactSimulation } from './pages/ImpactSimulation';
import { CampaignList } from './pages/manager/CampaignList';
import { Questionnaire } from './pages/manager/Questionnaire';
import { SubmissionConfirmation } from './pages/manager/SubmissionConfirmation';
import { ManagerDashboard } from './pages/manager/Dashboard';
import { CampaignResults } from './pages/manager/CampaignResults';
import { AuditorDashboard } from './pages/auditor/Dashboard';
import { MechanismAnalysis } from './pages/auditor/MechanismAnalysis';
import { ComparativeView } from './pages/auditor/ComparativeView';
import { Export } from './pages/Export';
import { ProtectedRoute } from './components/ProtectedRoute';

export const router = createBrowserRouter([
  {
    path: '/login',
    Component: Login,
  },
  {
    path: '/submission-confirmation',
    element: <ProtectedRoute><SubmissionConfirmation /></ProtectedRoute>,
  },
  {
    path: '/',
    element: <ProtectedRoute><Layout /></ProtectedRoute>,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', Component: Dashboard },
      
      // Risk Manager routes (formerly admin)
      { path: 'opage-risks', Component: OPageRisks },
      { path: 'opage-risk-management', Component: OPageRiskManagement },
      { path: 'impact-simulation', Component: ImpactSimulation },
      { path: 'mechanisms', Component: MechanismList },
      { path: 'mechanisms/new', Component: CreateMechanism },
      { path: 'mechanisms/:id/configure', Component: MechanismConfig },
      { path: 'mechanisms/:id/edit', Component: EditMechanism },
      { path: 'reference', Component: ReferenceManagement },
      { path: 'admin-dashboard', Component: AdminDashboard },
      { path: 'admin/users', Component: UserManagement },
      { path: 'admin/projects', Component: ProjectManagement },
      
      // Manager routes
      { path: 'campaigns', Component: CampaignList },
      { path: 'campaigns/:id/results', Component: CampaignResults },
      { path: 'questionnaire', Component: Questionnaire },
      { path: 'manager-dashboard', Component: ManagerDashboard },
      
      // Auditor routes
      { path: 'results', Component: AuditorDashboard },
      { path: 'mechanisms/:id/analysis', Component: MechanismAnalysis },
      { path: 'comparative', Component: ComparativeView },
      
      // Common routes
      { path: 'export', Component: Export },
    ],
  },
]);