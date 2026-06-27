import React, { useEffect, useState } from 'react';
import { AlertTriangle, XCircle, Zap, Activity } from 'lucide-react';
import { SystemState } from '../types';

interface Warning {
    id: string;
    message: string;
    type: 'warning' | 'critical';
    timestamp: number;
}

interface Props {
    currentState: SystemState;
}

const AlertSystem: React.FC<Props> = ({ currentState }) => {
    const [activeWarnings, setActiveWarnings] = useState<Warning[]>([]);

    // Safety Limits (Hardcoded for now based on user specs)
    const LIMITS = {
        pressureMax: 600, // m
        pressureMin: 0,   // vacuum risk
        speedMax: 350,   // RPM
        tempMax: 65,     // Celcius
        vibeMax: 2.0     // mm/s
    };

    useEffect(() => {
        const newWarnings: Warning[] = [];
        const now = Date.now();

        if (currentState.penstockPressure > LIMITS.pressureMax) {
            newWarnings.push({ id: 'HIGH_PRESSURE', message: `⚠️ WARNING: Pressure exceeds safe limit (${currentState.penstockPressure.toFixed(1)} m)`, type: 'critical', timestamp: now });
        }
        if (currentState.penstockPressure < LIMITS.pressureMin || currentState.cavitationRisk) {
            newWarnings.push({ id: 'CAVITATION', message: `⚠️ CRITICAL: Cavitation Risk Detected!`, type: 'critical', timestamp: now });
        }
        if (currentState.turbineSpeed > LIMITS.speedMax) {
            newWarnings.push({ id: 'OVERSPEED', message: `⚠️ OVERSPEED: Turbine at ${currentState.turbineSpeed.toFixed(0)} RPM`, type: 'warning', timestamp: now });
        }
        if (currentState.temperature > LIMITS.tempMax) {
            newWarnings.push({ id: 'OVERHEAT', message: `⚠️ MOTOR OVERHEAT: ${currentState.temperature.toFixed(1)}°C`, type: 'critical', timestamp: now });
        }
        if (currentState.vibration > LIMITS.vibeMax) {
            newWarnings.push({ id: 'VIBRATION', message: `⚠️ HIGH VIBRATION: ${currentState.vibration.toFixed(2)} mm/s`, type: 'warning', timestamp: now });
        }

        setActiveWarnings(newWarnings);
    }, [currentState]);

    if (activeWarnings.length === 0) return null;

    return (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 flex flex-col gap-2 z-50 pointer-events-none w-full max-w-lg">
            {activeWarnings.map((w) => (
                <div
                    key={w.id}
                    className={`flex items-center gap-3 p-4 rounded-lg shadow-xl border backdrop-blur-md animate-in slide-in-from-top-2 duration-300
            ${w.type === 'critical' ? 'bg-red-900/80 border-red-500 text-white' : 'bg-amber-900/80 border-amber-500 text-white'}
          `}
                >
                    {w.type === 'critical' ? <XCircle size={24} className="animate-pulse" /> : <AlertTriangle size={24} />}
                    <div>
                        <div className="font-bold uppercase text-sm tracking-wider">{w.id} ALERT</div>
                        <div className="text-sm font-mono">{w.message}</div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default AlertSystem;
