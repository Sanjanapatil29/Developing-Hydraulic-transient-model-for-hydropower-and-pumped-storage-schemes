import React, { useState, useEffect } from 'react';
import { Brain, RefreshCw, CheckCircle, AlertTriangle, XOctagon } from 'lucide-react';
import { analyzeSystemWithGemini } from '../services/geminiService';
import { SystemState, OperationMode, AIAnalysisResult } from '../types';

interface Props {
  history: SystemState[];
  currentMode: OperationMode;
}

const AIAdvisor: React.FC<Props> = ({ history, currentMode }) => {
  const [analysis, setAnalysis] = useState<AIAnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const handleAnalyze = async () => {
    if (history.length < 5) return;
    setLoading(true);
    const result = await analyzeSystemWithGemini(history, currentMode);
    setAnalysis(result);
    setLastUpdated(new Date());
    setLoading(false);
  };

  // Auto-analyze on load rejection start
  useEffect(() => {
    if (currentMode === OperationMode.TRANSIENT_LOAD_REJECTION && !loading) {
      handleAnalyze();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentMode]);

  return (
    <div className="h-full bg-slate-900 border border-slate-800 rounded-lg flex flex-col overflow-hidden">
      <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
        <div className="flex items-center gap-2">
          <Brain className="text-purple-400" size={20} />
          <h2 className="text-sm font-bold text-slate-200 tracking-wider">AI TRANSIENT ANALYSIS</h2>
        </div>
        <button 
          onClick={handleAnalyze}
          disabled={loading}
          className={`text-xs px-2 py-1 rounded border flex items-center gap-1 transition-all
            ${loading ? 'bg-slate-800 border-slate-700 text-slate-500 cursor-not-allowed' : 'bg-purple-900/20 border-purple-500/30 text-purple-300 hover:bg-purple-900/40'}
          `}
        >
          <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
          {loading ? 'ANALYZING...' : 'RUN DIAGNOSTIC'}
        </button>
      </div>

      <div className="flex-1 p-4 overflow-y-auto">
        {!analysis ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-2">
            <Brain size={48} className="opacity-20" />
            <p className="text-sm">Ready for analysis.</p>
            <p className="text-xs text-center max-w-[200px]">Click "Run Diagnostic" to detect anomalies, water hammer risks, and control suggestions.</p>
          </div>
        ) : (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* Status Header */}
            <div className={`p-3 rounded-lg border flex items-start gap-3
              ${analysis.status === 'safe' ? 'bg-emerald-900/20 border-emerald-800 text-emerald-200' : 
                analysis.status === 'warning' ? 'bg-amber-900/20 border-amber-800 text-amber-200' : 
                'bg-red-900/20 border-red-800 text-red-200'}
            `}>
              <div className="mt-1">
                {analysis.status === 'safe' && <CheckCircle size={18} />}
                {analysis.status === 'warning' && <AlertTriangle size={18} />}
                {analysis.status === 'critical' && <XOctagon size={18} />}
              </div>
              <div>
                <div className="text-sm font-bold uppercase mb-1">{analysis.status} STATE DETECTED</div>
                <p className="text-xs opacity-90 leading-relaxed">{analysis.message}</p>
              </div>
            </div>

            {/* Recommendations */}
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Control Recommendations</h4>
              <ul className="space-y-2">
                {analysis.recommendations.map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-slate-300 bg-slate-800/50 p-2 rounded">
                    <span className="text-purple-400 font-mono text-xs mt-0.5">{idx + 1}.</span>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>

            {/* Predictions */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-slate-800/30 p-2 rounded border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase block">Predicted Peak</span>
                <span className="text-lg font-mono font-bold text-slate-200">{analysis.predictedPeakPressure?.toFixed(1)} m</span>
              </div>
              <div className="bg-slate-800/30 p-2 rounded border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase block">Last Updated</span>
                <span className="text-xs font-mono text-slate-400 mt-1 block">
                  {lastUpdated?.toLocaleTimeString()}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIAdvisor;