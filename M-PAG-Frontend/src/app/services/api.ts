const API_BASE = '/api';

// ── Helper ──────────────────────────────────────────────────

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${path}`;
  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  const csrfMatch = document.cookie.match(/csrftoken=([^;]+)/);
  if (csrfMatch) {
    defaultHeaders['X-CSRFToken'] = csrfMatch[1];
  }

  const res = await fetch(url, {
    credentials: 'include',
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(error.error || error.detail || `HTTP ${res.status}`);
  }

  if (res.status === 204) {
    return undefined as unknown as T;
  }

  const text = await res.text();
  if (!text) {
    return undefined as unknown as T;
  }

  return JSON.parse(text) as T;
}

function get<T>(path: string): Promise<T> {
  return request<T>(path, { method: 'GET' });
}

function post<T>(path: string, body: unknown): Promise<T> {
  return request<T>(path, { method: 'POST', body: JSON.stringify(body) });
}

function put<T>(path: string, body: unknown): Promise<T> {
  return request<T>(path, { method: 'PUT', body: JSON.stringify(body) });
}

function patch<T>(path: string, body: unknown): Promise<T> {
  return request<T>(path, { method: 'PATCH', body: JSON.stringify(body) });
}

function del<T>(path: string): Promise<T> {
  return request<T>(path, { method: 'DELETE' });
}


// ── Types ───────────────────────────────────────────────────

export type UserRole = 'system_admin' | 'administrateur' | 'responsable_risques' | 'responsable_org' | 'auditeur' | 'decideur' | 'observateur';

export interface Project {
  id: number;
  name: string;
  description: string;
  is_active: boolean;
  created_at: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  project?: { id: number; name: string } | null;
}

export interface Item {
  id: number;
  factor: number;
  label: string;
  code: string;
}

export interface Factor {
  id: number;
  dimension: number;
  name: string;
  code: string;
  items: Item[];
}

export interface Dimension {
  id: number;
  pillar: number;
  name: string;
  code: string;
  factors: Factor[];
}

export interface KeyPillar {
  id: number;
  name: string;
  code: string;
  pillar_type: string;
  icon: string;
  dimensions: Dimension[];
}

export interface KeyPillarListItem {
  id: number;
  name: string;
  code: string;
  pillar_type: string;
  icon: string;
}

export interface OPageKeyPillar {
  id: number;
  name: string;
  type: string;
}

export interface RMMKPWeight {
  id: number;
  rmm: number;
  key_pillar: number;
  key_pillar_name: string;
  key_pillar_code: string;
  weight: number;
}

export interface RMM {
  id: number;
  name: string;
  description: string;
  associated_risk_id: number;
  associated_risk_name: string;
  kp_weights: RMMKPWeight[];
}

export interface Campaign {
  id: number;
  name: string;
  organization: string;
  status: 'draft' | 'in_progress' | 'completed';
  launch_date: string;
  progress: number;
  total_items: number;
  answered_items: number;
}

export interface ItemResponse {
  id: number;
  campaign: number;
  item: number;
  item_code: string;
  item_label: string;
  response: number;
  comment: string;
}

export interface ReadinessLevel {
  id: number;
  campaign: number;
  key_pillar: number;
  pillar_name: string;
  pillar_code: string;
  rmm: number | null;
  score: number;
}

export interface RMMCResult {
  id: number;
  campaign: number;
  rmm: number;
  rmm_name: string;
  associated_risk_name: string;
  score: number;
}

export interface RMCResult {
  id: number;
  campaign: number;
  risk_id: number;
  risk_name: string;
  score: number;
}

export interface GPMResult {
  id: number;
  campaign: number;
  score: number;
}

export interface CampaignResults {
  campaign: Campaign;
  readiness_levels: ReadinessLevel[];
  rmmc: RMMCResult[];
  rmc: RMCResult[];
  gpm: GPMResult[];
}

// O-PAGe types
export interface OPageIndicatorValue {
  id: number;
  indicator: number;
  raw_value: number;
  normalized_value: number;
  created_at: string;
}

export interface OPageIndicator {
  id: number;
  risk: number;
  label: string;
  weight: number;
  status: string;
  val_min: number;
  val_max: number;
  latest_value: OPageIndicatorValue | null;
}

export interface OPageRiskScore {
  id: number;
  risk: number;
  score: number;
  category: string;
  calculated_date: string;
}

export interface OPageIndicatorValue {
  id: number;
  indicator: number;
  raw_value: number;
  normalized_value: number;
  created_at: string;
}

export interface OPageIndicator {
  id: number;
  risk: number;
  label: string;
  weight: number;
  status: string;
  val_min: number;
  val_max: number;
  latest_value?: OPageIndicatorValue | null;
}

export interface OPageRisk {
  id: number;
  name: string;
  description: string;
  indicators: OPageIndicator[];
  scores: OPageRiskScore[];
  rmms: any[];
}


// ── Auth API ────────────────────────────────────────────────

export const authApi = {
  login: (username: string, password: string) =>
    post<User>('/auth/login/', { username, password }),

  logout: () =>
    post<{ message: string }>('/auth/logout/', {}),

  me: () =>
    get<User>('/auth/me/'),
};


// ── Users API ──────────────────────────────────────────────
export const usersApi = {
  list: () => get<User[]>('/users/'),
  create: (data: { username: string; email?: string; first_name?: string; last_name?: string; password: string; role: UserRole; project_id?: number | null }) =>
    post<User>('/users/', data),
  update: (id: number, data: Partial<{ username: string; email: string; first_name: string; last_name: string; password?: string; role?: UserRole; project_id?: number | null }>) =>
    patch<User>(`/users/${id}/`, data),
  delete: (id: number) => del(`/users/${id}/`),
};


// ── Projects API ────────────────────────────────────────────
export const projectsApi = {
  list: () => get<Project[]>('/projects/'),
  get: (id: number) => get<Project>(`/projects/${id}/`),
  create: (data: { name: string; description?: string }) =>
    post<Project>('/projects/', data),
  update: (id: number, data: Partial<Project>) =>
    patch<Project>(`/projects/${id}/`, data),
  delete: (id: number) => del(`/projects/${id}/`),
};


// ── Pillars API ─────────────────────────────────────────────

export const pillarsApi = {
  list: () => get<KeyPillarListItem[]>('/pillars/'),
  listWithLegacy: () => get<KeyPillarListItem[]>('/pillars/?include_legacy=true'),
  listFull: () => get<KeyPillar[]>('/pillars/?detail=full'),
  get: (id: number) => get<KeyPillar>(`/pillars/${id}/`),  create: (data: { name: string; code: string; pillar_type: string; icon?: string }) =>
    post<KeyPillar>('/pillars/', data),
  update: (id: number, data: Partial<Pick<KeyPillar, 'name' | 'code' | 'pillar_type' | 'icon'>>) =>
    patch<KeyPillar>(`/pillars/${id}/`, data),
  delete: (id: number) => del(`/pillars/${id}/`),};


// ── Dimensions API ──────────────────────────────────────────

export const dimensionsApi = {
  list: (pillarId?: number) =>
    get<Dimension[]>(pillarId ? `/dimensions/?pillar=${pillarId}` : '/dimensions/'),
  create: (data: { pillar: number; name: string; code: string }) =>
    post<Dimension>('/dimensions/', data),
  update: (id: number, data: Partial<Dimension>) =>
    patch<Dimension>(`/dimensions/${id}/`, data),
  delete: (id: number) => del(`/dimensions/${id}/`),
};


// ── Factors API ─────────────────────────────────────────────

export const factorsApi = {
  list: (dimensionId?: number) =>
    get<Factor[]>(dimensionId ? `/factors/?dimension=${dimensionId}` : '/factors/'),
  create: (data: { dimension: number; name: string; code: string }) =>
    post<Factor>('/factors/', data),
  update: (id: number, data: Partial<Factor>) =>
    patch<Factor>(`/factors/${id}/`, data),
  delete: (id: number) => del(`/factors/${id}/`),
};


// ── Items API ───────────────────────────────────────────────

export const itemsApi = {
  list: (factorId?: number) =>
    get<Item[]>(factorId ? `/items/?factor=${factorId}` : '/items/'),
  create: (data: { factor: number; label: string; code: string }) =>
    post<Item>('/items/', data),
  update: (id: number, data: Partial<Item>) =>
    patch<Item>(`/items/${id}/`, data),
  delete: (id: number) => del(`/items/${id}/`),
};


// ── RMM API ─────────────────────────────────────────────────

export const rmmsApi = {
  list: () => get<RMM[]>('/rmms/'),
  get: (id: number) => get<RMM>(`/rmms/${id}/`),
  create: (data: {
    name: string;
    description?: string;
    associated_risk_id: number;
    associated_risk_name: string;
  }) => post<RMM>('/rmms/', data),
  update: (id: number, data: Partial<RMM>) =>
    patch<RMM>(`/rmms/${id}/`, data),
  delete: (id: number) => del(`/rmms/${id}/`),
  configureWeights: (id: number, weights: { key_pillar_id: number; weight: number }[]) =>
    post<RMM>(`/rmms/${id}/configure_weights/`, { weights }),
};


// ── Campaign API ────────────────────────────────────────────

export const campaignsApi = {
  list: () => get<Campaign[]>('/campaigns/'),
  get: (id: number) => get<Campaign>(`/campaigns/${id}/`),
  create: (data: { name: string; organization?: string }) =>
    post<Campaign>('/campaigns/', data),
  compute: (id: number) =>
    post<any>(`/campaigns/${id}/compute/`, {}),
  results: (id: number) =>
    get<CampaignResults>(`/campaigns/${id}/results/`),
  delete: (id: number) => del(`/campaigns/${id}/`),
  exportTemplate: (id: number) => {
    return fetch(`/api/campaigns/${id}/export_template/`, {
      method: 'GET',
      credentials: 'include',
    }).then(res => res.blob());
  },
  importResponses: (id: number, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    // Attempt to get CSRF token from cookies just in case
    const csrfMatch = document.cookie.match(/csrftoken=([^;]+)/);
    const headers: Record<string, string> = {};
    if (csrfMatch) {
      headers['X-CSRFToken'] = csrfMatch[1];
    }
    
    return fetch(`/api/campaigns/${id}/import_responses/`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
      headers: headers,
    }).then(async res => {
      if (!res.ok) {
        const text = await res.text();
        console.error("Backend error detail:", text);
        throw new Error(`Error ${res.status}: ${text}`);
      }
      return res.json();
    });
  },
};


// ── Responses API ───────────────────────────────────────────

export const responsesApi = {
  list: (campaignId?: number) =>
    get<ItemResponse[]>(campaignId ? `/responses/?campaign=${campaignId}` : '/responses/'),
  batchSubmit: (campaignId: number, responses: { item_id: number; response: number; comment?: string }[]) =>
    post<{ saved: number; total_items: number; answered: number; progress: number }>(
      '/batch-responses/',
      { campaign_id: campaignId, responses },
    ),
};


// ── Results API ─────────────────────────────────────────────

export const resultsApi = {
  readinessLevels: (campaignId?: number) =>
    get<ReadinessLevel[]>(campaignId ? `/readiness-levels/?campaign=${campaignId}` : '/readiness-levels/'),
  rmmcResults: () => get<RMMCResult[]>('/rmmc-results/'),
  rmcResults: () => get<RMCResult[]>('/rmc-results/'),
  gpmResults: () => get<GPMResult[]>('/gpm-results/'),
};


// ── O-PAGe Proxy API ────────────────────────────────────────

export const opageApi = {
  risks: () => get<OPageRisk[]>('/opage/risks/'),
  createRisk: (payload: { name: string; description?: string }) => post<OPageRisk>('/opage/risks/', payload),
  updateRisk: (id: number, payload: { name?: string; description?: string }) => patch<OPageRisk>(`/opage/risks/${id}/`, payload),
  deleteRisk: (id: number) => del(`/opage/risks/${id}/`),
  keyPillars: () => get<OPageKeyPillar[]>('/opage/key-pillars/'),
  createKeyPillar: (payload: { name: string; type: string }) => post<OPageKeyPillar>('/opage/key-pillars/', payload),
  updateKeyPillar: (id: number, payload: { name: string; type: string }) => patch<OPageKeyPillar>(`/opage/key-pillars/${id}/`, payload),
  deleteKeyPillar: (id: number) => del(`/opage/key-pillars/${id}/`),
  riskScores: () => get<OPageRiskScore[]>('/opage/risk-scores/'),  indicators: (riskId?: number) =>
    get<OPageIndicator[]>(`/opage/indicators/${riskId ? `?risk=${riskId}` : ''}`),
  createIndicator: (payload: {
    risk: number;
    label: string;
    weight: number;
    status: string;
    val_min: number;
    val_max: number;
  }) => post<OPageIndicator>('/opage/indicators/', payload),
  updateIndicator: (id: number, payload: {
    label?: string;
    weight?: number;
    status?: string;
    val_min?: number;
    val_max?: number;
  }) => patch<OPageIndicator>(`/opage/indicators/${id}/`, payload),
  deleteIndicator: (id: number) => del(`/opage/indicators/${id}/`),
  createIndicatorValue: (payload: { indicator: number; raw_value: number }) =>
    post<OPageIndicatorValue>('/opage/indicator-values/', payload),};


// ── I-PAGe Types ────────────────────────────────────────────

export interface IPageIndicator {
  id: number;
  name: string;
  code: string;
  order: number;
}

export interface IPageMechanismEffect {
  id: number;
  mechanism: number;
  indicator: number;
  indicator_name: string;
  indicator_code: string;
  value: number;
}

export interface IPageMechanism {
  id: number;
  name: string;
  description: string;
  default_active: boolean;
  default_level: number;
  effects: IPageMechanismEffect[];
}

export interface IPageScenarioMechanism {
  id: number;
  scenario: number;
  mechanism: number;
  mechanism_name: string;
  active: boolean;
  level: number;
}

export interface IPageScenario {
  id: number;
  name: string;
  description: string;
  created_at: string;
  scenario_mechanisms?: IPageScenarioMechanism[];
}

export interface IPageSimulationMechanism {
  id: number;
  simulation: number;
  mechanism: number;
  mechanism_name: string;
  active: boolean;
  level: number;
}

export interface IPageSimulationResult {
  id: number;
  simulation: number;
  indicator: number;
  indicator_name: string;
  indicator_code: string;
  impact_value: number;
  reduction_pct: number;
}

export interface IPageSimulation {
  id: number;
  name: string;
  organization: string;
  department: string;
  risk_id: number;
  risk_name: string;
  risk_score: number;
  scenario: number | null;
  scenario_name: string;
  method: string;
  confidence: string;
  horizon: string;
  iterations: number;
  created_by: number | null;
  created_at: string;
  risk_score_after: number;
  reduction_absolute: number;
  reduction_relative: number;
  confidence_score: number;
  risk_level_before: string;
  risk_level_after: string;
  computed: boolean;
  sim_mechanisms: IPageSimulationMechanism[];
  results: IPageSimulationResult[];
}

export interface IPageSimulationRunResponse {
  simulation: IPageSimulation;
  before_trend: { label: string; value: number }[];
  after_trend: { label: string; value: number }[];
  scenario_comparison: {
    name: string;
    initial: number;
    after: number;
    reduction: number;
    level: string;
    best: boolean;
    confidence: number;
  }[];
  indicator_results: {
    indicator: string;
    impact_value: number;
    reduction_pct: number;
  }[];
}


// ── I-PAGe API ──────────────────────────────────────────────

export const ipageApi = {
  // Indicators
  indicators: () => get<IPageIndicator[]>('/ipage/indicators/'),

  // Mechanisms (with nested effects)
  mechanisms: () => get<IPageMechanism[]>('/ipage/mechanisms/'),

  // Scenarios
  scenarios: () => get<IPageScenario[]>('/ipage/scenarios/'),
  scenario: (id: number) => get<IPageScenario>(`/ipage/scenarios/${id}/`),
  createScenario: (payload: { name: string; description?: string }) =>
    post<IPageScenario>('/ipage/scenarios/', payload),

  // Simulations
  simulations: () => get<IPageSimulation[]>('/ipage/simulations/'),
  simulation: (id: number) => get<IPageSimulation>(`/ipage/simulations/${id}/`),
  createSimulation: (payload: {
    name?: string;
    organization?: string;
    department?: string;
    risk_id: number;
    risk_name?: string;
    risk_score: number;
    scenario?: number | null;
    method?: string;
    confidence?: string;
    horizon?: string;
    iterations?: number;
    mechanisms?: { mechanism_id: number; active: boolean; level: number }[];
  }) => post<IPageSimulation>('/ipage/simulations/', payload),
  deleteSimulation: (id: number) => del(`/ipage/simulations/${id}/`),

  // Run simulation engine
  runSimulation: (id: number) =>
    post<IPageSimulationRunResponse>(`/ipage/simulations/${id}/run/`, {}),

  // Bootstrap seed data
  bootstrap: () => post<{ status: string }>('/ipage/bootstrap/', {}),
};

