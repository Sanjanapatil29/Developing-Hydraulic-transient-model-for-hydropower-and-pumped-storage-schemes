import React from 'react';
import { Activity, Power, AlertTriangle, Play, Pause, RotateCcw, FileText } from 'lucide-react';
import { OperationMode } from '../types';

interface Props {
  currentMode: OperationMode;
  targetGate: number;
  setTargetGate: (val: number) => void;
  setMode: (mode: OperationMode) => void;
  triggerEmergencyStop: () => void;
  runSimulation: boolean;
  setRunSimulation: (val: boolean) => void;
  onReset: () => void;
  onReport?: () => void;
}

const ControlPanel: React.FC<Props> = ({
  currentMode,
  targetGate,
  setTargetGate,
  setMode,
  triggerEmergencyStop,
  runSimulation,
  setRunSimulation,
  onReset,
  onReport
}) => {
  return (
    <div className="bg-slate-900 border-t border-slate-800 p-4 flex flex-col md:flex-row gap-6 items-center justify-between shadow-2xl z-10">

      {/* Simulation Controls */}
      <div className="flex items-center gap-4">
        <div className="flex flex-col">
          <span className="text-xs text-slate-500 font-bold uppercase mb-1">Sim Control</span>
          <div className="flex gap-2">
            <button
              onClick={() => setRunSimulation(!runSimulation)}
              className={`p-2 rounded-md transition-colors ${runSimulation ? 'bg-amber-600 hover:bg-amber-500' : 'bg-emerald-600 hover:bg-emerald-500'}`}
              title={runSimulation ? "Pause" : "Start"}
            >
              {runSimulation ? <Pause size={20} /> : <Play size={20} />}
            </button>
            <button
              onClick={onReset}
              className="p-2 bg-slate-700 hover:bg-slate-600 rounded-md transition-colors"
              title="Reset"
            >
              <RotateCcw size={20} />
            </button>
          </div>
        </div>

        <div className="h-10 w-px bg-slate-700 mx-2"></div>

        <div className="flex flex-col">
          <span className="text-xs text-slate-500 font-bold uppercase mb-1">Op Mode</span>
          <div className="flex bg-slate-800 rounded-md p-1">
            <button
              onClick={() => setMode(OperationMode.GENERATION)}
              className={`px-3 py-1 text-xs font-bold rounded ${currentMode === OperationMode.GENERATION ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              GEN
            </button>
            <button
              onClick={() => setMode(OperationMode.PUMPING)}
              className={`px-3 py-1 text-xs font-bold rounded ${currentMode === OperationMode.PUMPING ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              PUMP
            </button>
          </div>
        </div>
      </div>

      {/* Governor Control */}
      <div className="flex-1 w-full max-w-md">
        <div className="flex justify-between mb-1">
          <span className="text-xs text-slate-500 font-bold uppercase">Guide Vane Setpoint</span>
          <span className="text-xs text-blue-400 font-mono font-bold">{targetGate.toFixed(1)}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          step="1"
          value={targetGate}
          onChange={(e) => setTargetGate(Number(e.target.value))}
          className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
          disabled={currentMode === OperationMode.TRANSIENT_LOAD_REJECTION}
        />
        <div className="flex justify-between mt-1 text-[10px] text-slate-600 font-mono">
          <span>CLOSED</span>
          <span>OPEN</span>
        </div>
      </div>

      {/* Scenarios & Report */}
      <div className="flex gap-3">
        {onReport && (
          <button
            onClick={onReport}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-md text-sm font-bold flex items-center gap-2 transition-all"
            title="Download PDF Report"
          >
            <FileText size={16} />
            REPORT
          </button>
        )}

        <button
          onClick={() => setMode(OperationMode.TRANSIENT_LOAD_REJECTION)}
          className="px-4 py-2 bg-red-900/30 border border-red-900/50 hover:bg-red-900/50 text-red-400 rounded-md text-sm font-bold flex items-center gap-2 transition-all"
        >
          <Power size={16} />
          LOAD REJECT
        </button>
        <button
          onClick={triggerEmergencyStop}
          className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-md text-sm font-bold flex items-center gap-2 shadow-lg shadow-red-900/20 transition-all animate-pulse-slow"
        >
          <AlertTriangle size={16} />
          ESD (TRIP)
        </button>
      </div>

    </div>
  );
};

export default ControlPanel;