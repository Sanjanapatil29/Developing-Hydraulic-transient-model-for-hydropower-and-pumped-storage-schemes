import React, { useState } from 'react';
import { SimulationParams } from '../types';
import { Save, Settings, Database, ArrowRight } from 'lucide-react';
import { parseCSV, mapDatasetToParams } from '../services/datasetService';

interface ProjectSetupProps {
    initialParams: SimulationParams;
    onSave: (params: SimulationParams, projectName: string) => void;
    onCancel: () => void;
}

const ProjectSetup: React.FC<ProjectSetupProps> = ({ initialParams, onSave, onCancel }) => {
    const [params, setParams] = useState<SimulationParams>(initialParams);
    const [projectName, setProjectName] = useState("Alpha Hydro Station");

    const handleChange = (field: keyof SimulationParams, value: string) => {
        setParams(prev => ({
            ...prev,
            // Parse float but handle empty string to allow typing
            [field]: value === '' ? 0 : parseFloat(value)
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(params, projectName);
    };

    return (
        <div className="h-full overflow-y-auto bg-slate-950 text-slate-100">
            <div className="w-full max-w-4xl mx-auto p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

                <div className="mb-8">
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">Project Setup</h2>
                    <p className="text-slate-400 mt-2">Configure system parameters and physical properties for the simulation environment.</p>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">

                    {/* Project Details Section */}
                    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 backdrop-blur-sm relative overflow-hidden group hover:border-blue-500/30 transition-all">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Database size={100} />
                        </div>

                        <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                            <span className="w-8 h-8 rounded bg-blue-500/20 text-blue-400 flex items-center justify-center"><Settings size={18} /></span>
                            General Information
                        </h3>

                        <div className="space-y-4 relative z-10">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Project Name</label>
                                <input
                                    type="text"
                                    value={projectName}
                                    onChange={(e) => setProjectName(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                                    placeholder="Enter project name"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Description</label>
                                <textarea
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all min-h-[100px]"
                                    placeholder="Optional project description..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Physical Parameters Section */}
                    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 backdrop-blur-sm relative overflow-hidden group hover:border-blue-500/30 transition-all">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Settings size={100} />
                        </div>

                        <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                            <span className="w-8 h-8 rounded bg-emerald-500/20 text-emerald-400 flex items-center justify-center"><Settings size={18} /></span>
                            Physical Parameters
                        </h3>

                        <div className="space-y-5 relative z-10">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Reservoir Level (m)</label>
                                    <input
                                        type="number" step="0.1" value={params.grossHead}
                                        onChange={(e) => handleChange('grossHead', e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:border-emerald-500 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Penstock Length (m)</label>
                                    <input
                                        type="number" step="10" value={params.penstockLength}
                                        onChange={(e) => handleChange('penstockLength', e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:border-emerald-500 transition-all"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Diameter (m)</label>
                                    <input
                                        type="number" step="0.1" value={params.penstockDiameter}
                                        onChange={(e) => handleChange('penstockDiameter', e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:border-emerald-500 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Pipe Material</label>
                                    <select
                                        value={params.pipeMaterial}
                                        onChange={(e) => handleChange('pipeMaterial', e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:border-emerald-500 transition-all"
                                    >
                                        <option value="Steel">Steel</option>
                                        <option value="Concrete">Concrete</option>
                                        <option value="Iron">Iron</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Roughness</label>
                                    <input
                                        type="number" step="0.001" value={params.roughness}
                                        onChange={(e) => handleChange('roughness', e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:border-emerald-500 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Wave Speed (m/s)</label>
                                    <input
                                        type="number" step="10" value={params.waveSpeed}
                                        onChange={(e) => handleChange('waveSpeed', e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:border-emerald-500 transition-all"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Initial Flow Vel (m/s)</label>
                                    <input
                                        type="number" step="0.1" value={params.flowVelocity}
                                        onChange={(e) => handleChange('flowVelocity', e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:border-emerald-500 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Gravity (m/s²)</label>
                                    <input
                                        type="number" step="0.01" value={params.gravity}
                                        onChange={(e) => handleChange('gravity', e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:border-emerald-500 transition-all"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800">
                                <div>
                                    <label className="block text-xs font-bold text-orange-500 uppercase tracking-wider mb-2">Closure Time (sec)</label>
                                    <input
                                        type="number" step="0.5" value={params.guideVaneClosureTime}
                                        onChange={(e) => handleChange('guideVaneClosureTime', e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:border-orange-500 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-red-500 uppercase tracking-wider mb-2">Sudden Load Time (sec)</label>
                                    <input
                                        type="number" step="0.1" value={params.suddenLoadChangeTime}
                                        onChange={(e) => handleChange('suddenLoadChangeTime', e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:border-red-500 transition-all"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Dataset Import Section */}
                    <div className="md:col-span-2">
                        <DataUpload onUpload={async (data) => {
                            try {
                                const parsed = parseCSV(data.content);
                                const mapped = mapDatasetToParams(parsed);

                                if (Object.keys(mapped).length > 0) {
                                    setParams(prev => ({ ...prev, ...mapped }));

                                    // Save the entire dataset to database for use across the app
                                    const { mockDb } = await import('../services/mockDatabase');
                                    const { createDatasetInfo } = await import('../services/datasetService');
                                    const datasetInfo = createDatasetInfo(data.fileName, data.content);
                                    await mockDb.saveDataset(datasetInfo);

                                    alert(`Success! Updated ${Object.keys(mapped).length} parameters from ${data.fileName}\nDataset saved with ${datasetInfo.rowCount} rows.`);
                                } else {
                                    alert("File uploaded but no matching parameters found. Please check column headers.");
                                }
                            } catch (e) {
                                console.error(e);
                                alert("Failed to process dataset file.");
                            }
                        }} />
                    </div>

                    <div className="md:col-span-2 flex justify-end gap-4 mt-4">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-6 py-3 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 font-medium transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-8 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg shadow-blue-900/20 flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
                        >
                            <Save size={18} />
                            Save & Initialize
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default ProjectSetup;

interface DataUploadProps {
    onUpload: (data: any) => void;
}

const DataUpload: React.FC<DataUploadProps> = ({ onUpload }) => {
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target?.result as string;
            // Simple naive CSV parser for now - can be enhanced based on dataset format
            // Assumes header row and values
            try {
                const lines = text.split('\n');
                const headers = lines[0].split(',').map(h => h.trim());
                // This is a placeholder for actual parsing logic once we know the dataset format
                console.log("Uploaded headers:", headers);

                // For now, just notifying parent
                onUpload({ fileName: file.name, content: text });
            } catch (err) {
                console.error("Error parsing file", err);
            }
        };
        reader.readAsText(file);
    };

    return (
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 backdrop-blur-sm relative overflow-hidden group hover:border-purple-500/30 transition-all mt-8">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Database size={100} />
            </div>
            <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <span className="w-8 h-8 rounded bg-purple-500/20 text-purple-400 flex items-center justify-center"><Database size={18} /></span>
                Import Dataset (Kaggle/CSV)
            </h3>

            <div className="relative z-10">
                <p className="text-slate-400 mb-4 text-sm">Upload a dataset to initialize simulation parameters or load historical data.</p>
                <input
                    type="file"
                    accept=".csv,.json"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-slate-400
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-full file:border-0
                        file:text-sm file:font-semibold
                        file:bg-purple-600 file:text-white
                        hover:file:bg-purple-700
                        cursor-pointer"
                />
            </div>
        </div>
    );
};

