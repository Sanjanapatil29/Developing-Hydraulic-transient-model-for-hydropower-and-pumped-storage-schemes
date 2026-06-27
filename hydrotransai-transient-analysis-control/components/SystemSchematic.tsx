import React from 'react';
import { SystemState, OperationMode } from '../types';

interface Props {
  state: SystemState;
  mode: OperationMode;
}

const SystemSchematic: React.FC<Props> = ({ state, mode }) => {
  // Calculate dynamic colors based on pressure/flow
  const isHighPressure = state.penstockPressure > 600;
  const isReverseFlow = state.flowRate < 0;
  
  const waterColor = isReverseFlow ? '#3b82f6' : '#0ea5e9'; // Blue vs Sky
  const pipeColor = isHighPressure ? '#ef4444' : '#64748b'; // Red if high pressure

  // Surge tank height calc
  const surgeHeightPx = Math.min(100, Math.max(0, (state.surgeTankLevel - 400) / 4)); 

  return (
    <div className="relative w-full h-full bg-slate-900 rounded-lg border border-slate-800 overflow-hidden flex items-center justify-center p-4">
      <div className="absolute top-2 left-2 text-xs text-slate-400 font-mono">SCHEMATIC VIEW</div>
      
      <svg viewBox="0 0 800 400" className="w-full h-full select-none">
        <defs>
          <linearGradient id="waterGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.8"/>
            <stop offset="100%" stopColor="#2563eb" stopOpacity="0.9"/>
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Upper Reservoir */}
        <path d="M50,150 L200,150 L200,300 L50,300 Z" fill="#1e293b" stroke="#334155" strokeWidth="2" />
        <rect x="50" y="160" width="150" height="140" fill="url(#waterGradient)" opacity="0.6" />
        <text x="125" y="140" textAnchor="middle" fill="#94a3b8" fontSize="12">Upper Reservoir</text>

        {/* Penstock */}
        <path d="M200,250 L400,250 L500,300" fill="none" stroke={pipeColor} strokeWidth="12" strokeLinejoin="round" />
        {/* Water inside Penstock (Animated dash for flow) */}
        <path 
          d="M200,250 L400,250 L500,300" 
          fill="none" 
          stroke={waterColor} 
          strokeWidth="6" 
          strokeDasharray="10 5"
          className={Math.abs(state.flowRate) > 1 ? "animate-pulse" : ""}
        />

        {/* Surge Tank */}
        <g transform="translate(380, 150)">
           <rect x="0" y="0" width="40" height="100" fill="#1e293b" stroke="#334155" strokeWidth="2" />
           {/* Water Level */}
           <rect 
             x="2" 
             y={100 - surgeHeightPx} 
             width="36" 
             height={surgeHeightPx} 
             fill="url(#waterGradient)" 
             className="transition-all duration-300 ease-out"
           />
           <text x="20" y="-10" textAnchor="middle" fill="#94a3b8" fontSize="10">Surge Tank</text>
        </g>

        {/* Powerhouse / Turbine */}
        <g transform="translate(500, 280)">
           <circle cx="0" cy="0" r="30" fill="#334155" stroke="#475569" strokeWidth="2" />
           {/* Turbine Blades (Rotating) */}
           <g className="transition-transform" style={{ transform: `rotate(${Date.now() / 1000 * state.turbineSpeed / 60 * 360}deg)` }}>
              <path d="M0,-25 L5,0 L0,25 L-5,0 Z" fill="#94a3b8" />
              <path d="M-25,0 L0,5 L25,0 L0,-5 Z" fill="#94a3b8" />
           </g>
           <text x="0" y="50" textAnchor="middle" fill="#94a3b8" fontSize="12">Francis Turbine</text>
           <text x="0" y="65" textAnchor="middle" fill={state.turbineSpeed > 350 ? "#ef4444" : "#22c55e"} fontSize="12" fontWeight="bold">
             {Math.round(state.turbineSpeed)} RPM
           </text>
        </g>

        {/* Tailrace */}
        <path d="M530,300 L750,300" fill="none" stroke="#334155" strokeWidth="12" />
        <path d="M530,300 L750,300" fill="none" stroke={waterColor} strokeWidth="8" opacity="0.7" />
        <rect x="650" y="280" width="100" height="40" fill="url(#waterGradient)" opacity="0.6" />
        <text x="700" y="270" textAnchor="middle" fill="#94a3b8" fontSize="12">Lower Reservoir</text>

        {/* Sensors Indicators */}
        <circle cx="450" cy="275" r="5" fill={isHighPressure ? "#ef4444" : "#22c55e"} filter="url(#glow)" />
        <text x="450" y="260" textAnchor="middle" fill="#cbd5e1" fontSize="10">PT-101</text>
      </svg>
    </div>
  );
};

export default SystemSchematic;