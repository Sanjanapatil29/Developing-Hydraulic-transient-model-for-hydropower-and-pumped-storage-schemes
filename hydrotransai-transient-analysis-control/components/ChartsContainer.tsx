import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { SystemState } from '../types';

interface Props {
  data: SystemState[];
}

const ChartsContainer: React.FC<Props> = ({ data }) => {
  const chartData = data.map(d => ({
    ...d,
    velocity: d.flowRate / 10, // Approx for chart visualization if Area not passed
    timeStr: new Date(d.timestamp).toLocaleTimeString([], { hour12: false, minute: '2-digit', second: '2-digit' })
  }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 h-full overflow-y-auto">
      <SingleChart title="Pressure Head (m)" data={chartData} dataKey="penstockPressure" color="#22d3ee" limit={600} />
      <SingleChart title="Flow Rate (m³/s)" data={chartData} dataKey="flowRate" color="#3b82f6" />
      <SingleChart title="Flow Velocity (m/s)" data={chartData} dataKey="velocity" color="#06b6d4" />
      <SingleChart title="Turbine Speed (RPM)" data={chartData} dataKey="turbineSpeed" color="#f472b6" limit={350} />
      <SingleChart title="Vibration (mm/s)" data={chartData} dataKey="vibration" color="#fb923c" limit={2.0} />
      <SingleChart title="Motor Temp (°C)" data={chartData} dataKey="temperature" color="#fbbf24" limit={65} />
    </div>
  );
};

const SingleChart: React.FC<{ title: string, data: any[], dataKey: string, color: string, limit?: number }> = ({ title, data, dataKey, color, limit }) => (
  <div className="bg-slate-900 rounded-lg p-3 border border-slate-800 flex flex-col min-h-[160px]">
    <div className="flex justify-between items-center mb-2">
      <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</h3>
      <span className="text-xs font-mono text-slate-200">{data.length > 0 ? data[data.length - 1][dataKey]?.toFixed(1) : '-'}</span>
    </div>
    <div className="flex-1 w-full min-h-[100px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
          <XAxis dataKey="timeStr" hide />
          <YAxis domain={['auto', 'auto']} hide />
          <Tooltip
            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f1f5f9', fontSize: '10px' }}
            itemStyle={{ fontSize: '10px' }}
            formatter={(value: number) => value.toFixed(2)}
            labelStyle={{ display: 'none' }}
          />
          {limit && <Line type="monotone" dataKey={() => limit} stroke="#ef4444" strokeDasharray="3 3" strokeWidth={2} dot={false} isAnimationActive={false} />}
          <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={3} dot={false} animationDuration={300} filter="url(#glow)" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  </div>
);

export default ChartsContainer;