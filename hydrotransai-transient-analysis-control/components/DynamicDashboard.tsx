import React, { useMemo } from 'react';
import { SystemState, DashboardConfig, OperationMode } from '../types';
import SystemSchematic from './SystemSchematic';
import ChartsContainer from './ChartsContainer';
import AlertSystem from './AlertSystem';
import AIAdvisor from './AIAdvisor';
import { Gauge, Droplets, Zap, Activity } from 'lucide-react';
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Line } from 'recharts';

interface Props {
    config: DashboardConfig;
    currentState: SystemState;
    history: SystemState[];
    mode: OperationMode;
}

const DynamicDashboard: React.FC<Props> = ({ config, currentState, history, mode }) => {

    const renderWidget = (widgetInfo: any) => {
        switch (widgetInfo.type) {
            case 'SCHEMATIC':
                return <SystemSchematic state={currentState} mode={mode} />;

            case 'ALERTS':
                return <AlertSystem currentState={currentState} />;

            case 'AI_ADVISOR':
                return <AIAdvisor history={history} currentMode={mode} />;

            case 'TELEMETRY':
                return <TelemetryPanel currentState={currentState} />;

            case 'CHART_PRESSURE':
            case 'CHART_FLOW':
            case 'CHART_SPEED':
            case 'CHART_VIBRATION':
                return <SingleMetricChart type={widgetInfo.type} history={history} />;

            default:
                return <div className="text-red-500">Unknown Widget</div>;
        }
    };

    return (
        <div className="h-full w-full p-4 overflow-y-auto">
            <h2 className="text-xs font-bold text-slate-500 mb-4 uppercase tracking-widest border-b border-slate-800 pb-2">
                Viewing: {config.name}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 auto-rows-min">
                {config.widgets.map((widget, idx) => {
                    // Determine span based on widget type
                    const colSpan = widget.type === 'SCHEMATIC' ? 'md:col-span-2 lg:col-span-2' :
                        widget.type === 'AI_ADVISOR' ? 'md:col-span-1 lg:row-span-2' : 'col-span-1';

                    return (
                        <div key={widget.id + idx} className={`bg-slate-900/50 border border-slate-800 rounded-lg p-1 overflow-hidden min-h-[250px] flex flex-col ${colSpan}`}>
                            <div className="px-3 py-2 bg-slate-900 border-b border-slate-800 flex justify-between items-center">
                                <span className="text-[10px] font-bold text-slate-400 uppercase">{widget.title}</span>
                            </div>
                            <div className="flex-1 relative p-2">
                                {renderWidget(widget)}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    );
};

const TelemetryPanel = ({ currentState }: { currentState: SystemState }) => (
    <div className="grid grid-cols-2 gap-4 p-2 h-full">
        <TeleItem icon={Gauge} label="Head" value={currentState.penstockPressure.toFixed(1)} unit="m" />
        <TeleItem icon={Droplets} label="Flow" value={currentState.flowRate.toFixed(1)} unit="m³/s" />
        <TeleItem icon={Zap} label="Power" value={currentState.powerOutput.toFixed(1)} unit="MW" />
        <TeleItem icon={Activity} label="Vibration" value={currentState.vibration.toFixed(2)} unit="mm/s" warning={currentState.vibration > 1.5} />
    </div>
);

const TeleItem = ({ icon: Icon, label, value, unit, warning }: any) => (
    <div className="bg-slate-950 p-3 rounded flex flex-col justify-center items-center text-center border border-slate-800">
        <Icon size={16} className={`mb-2 ${warning ? 'text-red-500' : 'text-blue-500'}`} />
        <div className="text-[10px] text-slate-500 uppercase">{label}</div>
        <div className={`text-lg font-mono font-bold ${warning ? 'text-red-400' : 'text-slate-200'}`}>
            {value}<span className="text-[10px] text-slate-600 ml-1">{unit}</span>
        </div>
    </div>
);

const SingleMetricChart = ({ type, history }: { type: string, history: SystemState[] }) => {

    const config = useMemo(() => {
        const h = history.map(d => ({ ...d, time: new Date(d.timestamp).toLocaleTimeString() }));
        switch (type) {
            case 'CHART_PRESSURE': return { data: h, key: 'penstockPressure', color: '#60a5fa', limit: 600 };
            case 'CHART_FLOW': return { data: h, key: 'flowRate', color: '#3b82f6', limit: null };
            case 'CHART_SPEED': return { data: h, key: 'turbineSpeed', color: '#f472b6', limit: 350 };
            case 'CHART_VIBRATION': return { data: h, key: 'vibration', color: '#e879f9', limit: 2.0 };
            default: return { data: [], key: 'val', color: '#fff', limit: null };
        }
    }, [history, type]);

    return (
        <div className="w-full h-full min-h-[150px]">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={config.data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="time" hide />
                    <YAxis domain={['auto', 'auto']} hide />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f1f5f9', fontSize: '10px' }}
                        itemStyle={{ fontSize: '10px' }}
                        formatter={(value: number) => value.toFixed(2)}
                        labelStyle={{ display: 'none' }}
                    />
                    {config.limit && <Line type="monotone" dataKey={() => config.limit} stroke="red" strokeDasharray="3 3" strokeWidth={1} dot={false} isAnimationActive={false} />}
                    <Line type="monotone" dataKey={config.key} stroke={config.color} strokeWidth={2} dot={false} animationDuration={300} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    )
}

export default DynamicDashboard;
