// Mock data for the M-PAGe platform

export type UserRole = 'system_admin' | 'administrateur' | 'responsable_risques' | 'responsable_org' | 'auditeur' | 'decideur' | 'observateur';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  organization?: string;
  // Fields from API
  username?: string;
  first_name?: string;
  last_name?: string;
}

export interface Item {
  id: string;
  label: string;
  response?: number; // 1-5
  comment?: string;
}

export interface Factor {
  id: string;
  name: string;
  items: Item[];
}

export interface Dimension {
  id: string;
  name: string;
  factors: Factor[];
}

export interface Pillar {
  id: string;
  name: string;
  icon: string;
  weight: number;
  readinessLevel?: number; // RL score 0-1
  dimensions: Dimension[];
}

export interface RiskMitigationMechanism {
  id: string;
  name: string;
  associatedRisk: string;
  pillars: Pillar[];
  rmmc?: number; // Overall score 0-1
}

export interface Campaign {
  id: string;
  name: string;
  organizationId: string;
  launchDate: string;
  status: 'in_progress' | 'completed';
  progress: number;
}

export interface Risk {
  id: string;
  name: string;
  rmc?: number; // Risk mitigation capacity 0-1
}

// Mock users
export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Sophie Martin',
    email: 'risk_manager@page.fr',
    role: 'risk_manager',
  },
  {
    id: '2',
    name: 'Jean Dupont',
    email: 'manager@page.fr',
    role: 'manager',
    organization: 'TechCorp SA',
  },
  {
    id: '3',
    name: 'Marie Bernard',
    email: 'auditor@page.fr',
    role: 'auditor',
  },
];

// Mock pillars (6 key pillars)
export const mockPillars: Pillar[] = [
  {
    id: 'gov',
    name: 'Governance',
    icon: 'shield',
    weight: 0.2,
    readinessLevel: 0.75,
    dimensions: [
      {
        id: 'gov-d1',
        name: 'Governance Structure',
        factors: [
          {
            id: 'gov-d1-f1',
            name: 'AI Supervision Committee',
            items: [
              { id: 'gov-d1-f1-i1', label: 'Existence of a dedicated AI committee', response: 4 },
              { id: 'gov-d1-f1-i2', label: 'Frequency of committee meetings', response: 3 },
            ],
          },
        ],
      },
      {
        id: 'gov-d2',
        name: 'Policies and Procedures',
        factors: [
          {
            id: 'gov-d2-f1',
            name: 'Policy Documentation',
            items: [
              { id: 'gov-d2-f1-i1', label: 'Formalized and approved AI policy', response: 4 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'legal',
    name: 'Legal & Compliance',
    icon: 'scale',
    weight: 0.15,
    readinessLevel: 0.65,
    dimensions: [
      {
        id: 'legal-d1',
        name: 'Regulatory Compliance',
        factors: [
          {
            id: 'legal-d1-f1',
            name: 'GDPR Compliance',
            items: [
              { id: 'legal-d1-f1-i1', label: 'GDPR impact assessment completed', response: 5 },
              { id: 'legal-d1-f1-i2', label: 'Data processing register up-to-date', response: 4 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'tech',
    name: 'Technical',
    icon: 'cpu',
    weight: 0.25,
    readinessLevel: 0.55,
    dimensions: [
      {
        id: 'tech-d1',
        name: 'Technical Infrastructure',
        factors: [
          {
            id: 'tech-d1-f1',
            name: 'Computing Capabilities',
            items: [
              { id: 'tech-d1-f1-i1', label: 'Infrastructure suitable for AI models', response: 3 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'human',
    name: 'Human',
    icon: 'users',
    weight: 0.15,
    readinessLevel: 0.45,
    dimensions: [
      {
        id: 'human-d1',
        name: 'Skills & Competencies',
        factors: [
          {
            id: 'human-d1-f1',
            name: 'AI Expertise',
            items: [
              { id: 'human-d1-f1-i1', label: 'Presence of AI experts in the team', response: 2 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'org',
    name: 'Organizational',
    icon: 'building',
    weight: 0.15,
    readinessLevel: 0.7,
    dimensions: [
      {
        id: 'org-d1',
        name: 'Organizational Structure',
        factors: [
          {
            id: 'org-d1-f1',
            name: 'Dedicated Teams',
            items: [
              { id: 'org-d1-f1-i1', label: 'Dedicated team for AI risk management', response: 4 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'financial',
    name: 'Financial',
    icon: 'euro',
    weight: 0.1,
    readinessLevel: 0.6,
    dimensions: [
      {
        id: 'fin-d1',
        name: 'Budget and Resources',
        factors: [
          {
            id: 'fin-d1-f1',
            name: 'Budget Allocation',
            items: [
              { id: 'fin-d1-f1-i1', label: 'Dedicated budget for AI governance', response: 3 },
            ],
          },
        ],
      },
    ],
  },
];

// Mock mechanisms
export const mockMechanisms: RiskMitigationMechanism[] = [
  {
    id: 'rmm-1',
    name: 'Model Validation Mechanism',
    associatedRisk: 'Algorithmic Bias',
    pillars: mockPillars,
    rmmc: 0.68,
  },
  {
    id: 'rmm-2',
    name: 'Data Quality Control',
    associatedRisk: 'Non-representative Data',
    pillars: mockPillars.map(p => ({ ...p, weight: 1/6 })),
    rmmc: 0.72,
  },
  {
    id: 'rmm-3',
    name: 'Human Oversight',
    associatedRisk: 'Incorrect Automated Decisions',
    pillars: mockPillars.map(p => ({ ...p, weight: 1/6 })),
    rmmc: 0.55,
  },
];

// Mock campaigns
export const mockCampaigns: Campaign[] = [
  {
    id: 'camp-1',
    name: 'Q1 2026 Assessment',
    organizationId: 'org-1',
    launchDate: '2026-01-15',
    status: 'in_progress',
    progress: 65,
  },
  {
    id: 'camp-2',
    name: 'Annual 2025 Assessment',
    organizationId: 'org-1',
    launchDate: '2025-12-01',
    status: 'completed',
    progress: 100,
  },
];

// Mock risks
export const mockRisks: Risk[] = [
  { id: 'risk-1', name: 'Algorithmic Bias', rmc: 0.68 },
  { id: 'risk-2', name: 'Non-representative Data', rmc: 0.72 },
  { id: 'risk-3', name: 'Incorrect Automated Decisions', rmc: 0.55 },
  { id: 'risk-4', name: 'Lack of Transparency', rmc: 0.45 },
  { id: 'risk-5', name: 'Model Security', rmc: 0.80 },
];
