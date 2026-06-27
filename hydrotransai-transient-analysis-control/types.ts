export enum OperationMode {
  GENERATION = 'GENERATION',
  PUMPING = 'PUMPING',
  STANDSTILL = 'STANDSTILL',
  TRANSIENT_LOAD_REJECTION = 'TRANSIENT_LOAD_REJECTION',
  TRANSIENT_PUMP_TRIP = 'TRANSIENT_PUMP_TRIP'
}

export interface SystemState {
  timestamp: number;
  penstockPressure: number; // in meters (head)
  flowRate: number; // in m3/s
  turbineSpeed: number; // in RPM
  guideVaneOpening: number; // 0-100%
  surgeTankLevel: number; // meters
  powerOutput: number; // MW
  vibration: number; // mm/s
  temperature: number; // Celsius
  cavitationRisk: boolean; // True if pressure drops below vapor pressure
}

export interface SimulationParams {
  grossHead: number; // Reservoir Level
  gravity: number;
  penstockLength: number; // Replaces pipeLength
  penstockDiameter: number;
  pipeMaterial: 'Steel' | 'Concrete' | 'Iron';
  roughness: number; // Friction factor or absolute roughness
  waveSpeed: number; // c, for water hammer (often calculated from material)
  flowVelocity: number; // Initial Flow Velocity (m/s)
  guideVaneClosureTime: number; // sec
  suddenLoadChangeTime: number; // sec
}

export interface AIAnalysisResult {
  status: 'safe' | 'warning' | 'critical';
  message: string;
  recommendations: string[];
  predictedPeakPressure?: number;
}

export type UserRole = 'ADMIN' | 'USER';

export interface User {
  id: string;
  username: string;
  passwordHash: string; // "Hashed" for simulation
  role: UserRole;
  assignedDashboardId?: string;
  lastLogin?: number;
  isActive: boolean;
}

export type WidgetType = 'SCHEMATIC' | 'CHART_PRESSURE' | 'CHART_FLOW' | 'CHART_SPEED' | 'CHART_VIBRATION' | 'CHART_TEMP' | 'TELEMETRY' | 'AI_ADVISOR' | 'ALERTS';

export interface DashboardWidget {
  id: string;
  type: WidgetType;
  title: string;
  gridArea?: string; // For CSS Grid layout
  config?: any;
}

export interface DashboardConfig {
  id: string;
  name: string;
  layout: 'grid-default' | 'focused' | 'minimal';
  widgets: DashboardWidget[];
  createdBy: string; // Admin ID
  createdAt: number;
}

export interface DatasetInfo {
  fileName: string;
  uploadedAt: number;
  rowCount: number;
  headers: string[];
  data: Array<{ [key: string]: string | number }>;
}