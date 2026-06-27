import React, { useState, useEffect, useRef } from 'react';
import { generateInitialState, advanceSimulation } from './services/simulationService';
import { SystemState, OperationMode, SimulationParams, User, DashboardConfig } from './types';
import SystemSchematic from './components/SystemSchematic';
import ChartsContainer from './components/ChartsContainer';
import ControlPanel from './components/ControlPanel';
import AIAdvisor from './components/AIAdvisor';
import { Activity, Droplets, Zap, Gauge, Settings as SettingsIcon, ShieldCheck, LayoutDashboard } from 'lucide-react';
import ProjectSetup from './components/ProjectSetup';
import AlertSystem from './components/AlertSystem';
import { generatePDFReport } from './services/reportGenerator';
import Login from './components/Login';
import AdminDashboard from './components/admin/AdminDashboard';
import DynamicDashboard from './components/DynamicDashboard';
import { mockDb } from './services/mockDatabase';

const MAX_HISTORY_LENGTH = 100;

const App: React.FC = () => {
  // State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const [history, setHistory] = useState<SystemState[]>([generateInitialState()]);
  const [mode, setMode] = useState<OperationMode>(OperationMode.GENERATION);
  const [targetGate, setTargetGate] = useState<number>(80);
  const [runSimulation, setRunSimulation] = useState<boolean>(true);

  // View State
  const [currentView, setCurrentView] = useState<'dashboard' | 'setup' | 'admin'>('dashboard');
  const [assignedDashboard, setAssignedDashboard] = useState<DashboardConfig | null>(null);

  // Project & Params
  const [projectName, setProjectName] = useState("Alpha Hydro Station");
  const [params, setParams] = useState<SimulationParams>({
    gravity: 9.81,
    grossHead: 500,
    penstockLength: 2000,
    penstockDiameter: 3.5,
    pipeMaterial: 'Steel',
    roughness: 0.015,
    waveSpeed: 1200,
    flowVelocity: 5.0,
    guideVaneClosureTime: 12,
    suddenLoadChangeTime: 0.1
  });

  const simulationInterval = useRef<number | null>(null);

  // Simulation Loop
  useEffect(() => {
    if (runSimulation) {
      if (simulationInterval.current) clearInterval(simulationInterval.current);

      simulationInterval.current = window.setInterval(() => {
        setHistory(prev => {
          const lastState = prev[prev.length - 1];
          const nextState = advanceSimulation(lastState, mode, targetGate, params);

          const newHistory = [...prev, nextState];
          if (newHistory.length > MAX_HISTORY_LENGTH) {
            return newHistory.slice(newHistory.length - MAX_HISTORY_LENGTH);
          }
          return newHistory;
        });
      }, 100);
    } else {
      if (simulationInterval.current) clearInterval(simulationInterval.current);
    }

    return () => {
      if (simulationInterval.current) clearInterval(simulationInterval.current);
    };
  }, [runSimulation, mode, targetGate, params]);

  const currentState = history[history.length - 1];

  const triggerEmergencyStop = () => {
    setMode(OperationMode.TRANSIENT_LOAD_REJECTION);
    setTargetGate(0);
  };

  const handleReset = (resetParams?: SimulationParams) => {
    setHistory([generateInitialState(resetParams || params)]);
    setMode(OperationMode.GENERATION);
    setTargetGate(80);
  };

  const handleSaveParams = (newParams: SimulationParams, newName: string) => {
    setParams(newParams);
    setProjectName(newName);
    handleReset(newParams);
    setCurrentView('dashboard');
  };

  const handleDownloadReport = () => {
    generatePDFReport(projectName, params, history);
  };

  const handleLogin = async (user: User) => {
    setCurrentUser(user);
    setIsAuthenticated(true);

    // Load assigned dashboard if any
    if (user.assignedDashboardId) {
      const boards = await mockDb.getDashboards();
      const found = boards.find(d => d.id === user.assignedDashboardId);
      if (found) setAssignedDashboard(found);
    } else {
      setAssignedDashboard(null); // Fallback to default
    }

    // Default view based on role
    if (user.role === 'ADMIN') {
      setCurrentView('admin');
    } else {
      setCurrentView('dashboard');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    setAssignedDashboard(null);
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-100 font-sans">
      {/* Header */}
      <header className="h-14 bg-slate-900 border-b border-slate-800 flex items-center px-6 justify-between shrink-0">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setCurrentView(currentUser?.role === 'ADMIN' ? 'admin' : 'dashboard')}>
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
            <Activity className="text-white" size={20} />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white leading-tight">HydroTrans<span className="text-blue-500">AI</span></h1>
            <p className="text-[10px] text-slate-400 font-mono">REAL-TIME TRANSIENT ANALYSIS SYSTEM</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-xs text-right mr-2">
            <div className="text-slate-400">Operator</div>
            <div className="text-white font-bold">{currentUser?.username} <span className="text-[10px] text-slate-500 font-normal">({currentUser?.role})</span></div>
          </div>
          <button onClick={handleLogout} className="text-[10px] bg-slate-800 hover:bg-red-900/50 hover:text-red-400 px-2 py-1 rounded text-slate-400 transition-colors">LOGOUT</button>

          <div className="h-4 w-px bg-slate-700 mx-1"></div>

          {/* View Switcher / Project Info */}
          <div className="flex items-center bg-slate-800 rounded-md p-1 border border-slate-700">
            {currentUser?.role === 'ADMIN' && (
              <button
                onClick={() => setCurrentView('admin')}
                className={`px-3 py-1 text-xs font-bold rounded flex items-center gap-2 transition-all ${currentView === 'admin' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
              >
                <ShieldCheck size={14} />
                ADMIN
              </button>
            )}

            <button
              onClick={() => setCurrentView('dashboard')}
              className={`px-3 py-1 text-xs font-bold rounded flex items-center gap-2 transition-all ${currentView === 'dashboard' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
            >
              <LayoutDashboard size={14} />
              DASHBOARD
            </button>

            <button
              onClick={() => setCurrentView('setup')}
              className={`px-3 py-1 text-xs font-bold rounded flex items-center gap-2 transition-all ${currentView === 'setup' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
            >
              <SettingsIcon size={14} />
              SETUP
            </button>
          </div>

          <div className="h-4 w-px bg-slate-700 mx-2"></div>

          <div className="hidden md:block text-right mr-4">
            <div className="text-[10px] text-slate-500 font-bold uppercase">Active Project</div>
            <div className="text-xs font-semibold text-slate-300">{projectName}</div>
          </div>

          {/* Top KPI Bar (Only visible in Dashboard view to avoid clutter) */}
          {currentView === 'dashboard' && (
            <div className="hidden lg:flex items-center gap-6 pl-4 border-l border-slate-700">
              <div className="flex items-center gap-2">
                <Gauge size={16} className="text-slate-500" />
                <div>
                  <div className="text-[10px] text-slate-500 font-bold">HEAD</div>
                  <div className={`text-sm font-mono font-bold ${currentState.penstockPressure > 600 ? 'text-red-500 animate-pulse' : 'text-slate-200'}`}>
                    {currentState.penstockPressure.toFixed(1)} m
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Droplets size={16} className="text-slate-500" />
                <div>
                  <div className="text-[10px] text-slate-500 font-bold">FLOW</div>
                  <div className="text-sm font-mono font-bold text-slate-200">{currentState.flowRate.toFixed(1)} m³/s</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Zap size={16} className="text-slate-500" />
                <div>
                  <div className="text-[10px] text-slate-500 font-bold">POWER</div>
                  <div className="text-sm font-mono font-bold text-slate-200">{currentState.powerOutput.toFixed(1)} MW</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden relative">
        {currentView === 'admin' && currentUser?.role === 'ADMIN' ? (
          <AdminDashboard currentUser={currentUser} />
        ) : currentView === 'setup' ? (
          <ProjectSetup
            initialParams={params}
            onSave={handleSaveParams}
            onCancel={() => setCurrentView('dashboard')}
          />
        ) : (
          // Default Dashboard View
          assignedDashboard ? (
            <DynamicDashboard
              config={assignedDashboard}
              currentState={currentState}
              history={history}
              mode={mode}
            />
          ) : (
            <div className="h-full w-full p-4 grid grid-cols-12 gap-4 animate-in fade-in duration-300 relative">
              <AlertSystem currentState={currentState} />
              {/* Left Column: Visuals & Charts */}
              <div className="col-span-12 lg:col-span-9 flex flex-col gap-4 min-h-0">
                {/* Top Half: Schematic & Primary Metrics */}
                <div className="h-1/2 min-h-[300px]">
                  <SystemSchematic state={currentState} mode={mode} />
                </div>

                {/* Bottom Half: Detailed Charts */}
                <div className="h-1/2 min-h-[250px]">
                  <ChartsContainer data={history} />
                </div>
              </div>

              {/* Right Column: AI & Detailed Stats */}
              <div className="col-span-12 lg:col-span-3 flex flex-col gap-4 min-h-0">
                {/* Detailed Telemetry List */}
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
                  <h3 className="text-xs font-bold text-slate-500 uppercase mb-3">Real-time Telemetry</h3>
                  <div className="grid grid-cols-2 gap-y-3 gap-x-2">
                    <TelemetryItem label="Turbine Speed" value={currentState.turbineSpeed.toFixed(1)} unit="RPM" />
                    <TelemetryItem label="Guide Vane" value={currentState.guideVaneOpening.toFixed(1)} unit="%" />
                    <TelemetryItem label="Surge Level" value={currentState.surgeTankLevel.toFixed(2)} unit="m" />
                    <TelemetryItem label="Vibration" value={currentState.vibration.toFixed(2)} unit="mm/s" warning={currentState.vibration > 2} />
                  </div>
                </div>

                {/* AI Advisor Panel */}
                <div className="flex-1 min-h-[300px]">
                  <AIAdvisor history={history} currentMode={mode} />
                </div>
              </div>
            </div>
          )
        )}
      </main>

      {/* Footer / Control Deck (Only in Dashboard) */}
      {currentView === 'dashboard' && (
        <footer className="shrink-0">
          <ControlPanel
            currentMode={mode}
            targetGate={targetGate}
            setTargetGate={setTargetGate}
            setMode={setMode}
            triggerEmergencyStop={triggerEmergencyStop}
            runSimulation={runSimulation}
            setRunSimulation={setRunSimulation}
            onReset={handleReset}
            onReport={handleDownloadReport}
          />
        </footer>
      )}
    </div>
  );
};

const TelemetryItem: React.FC<{ label: string; value: string; unit: string; warning?: boolean }> = ({ label, value, unit, warning }) => (
  <div>
    <div className="text-[10px] text-slate-500">{label}</div>
    <div className={`font-mono font-bold ${warning ? 'text-red-400' : 'text-slate-300'}`}>
      {value} <span className="text-slate-600 text-xs font-sans">{unit}</span>
    </div>
  </div>
);

export default App;