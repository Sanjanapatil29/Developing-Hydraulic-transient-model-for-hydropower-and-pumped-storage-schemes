import React, { useEffect, useState } from 'react';
import { Database, Download, Trash2, FileText } from 'lucide-react';
import { mockDb } from '../services/mockDatabase';
import type { DatasetInfo } from '../types';

const DatasetViewer: React.FC = () => {
    const [dataset, setDataset] = useState<DatasetInfo | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDataset();
    }, []);

    const loadDataset = async () => {
        setLoading(true);
        const data = await mockDb.getDataset();
        setDataset(data);
        setLoading(false);
    };

    const handleClear = async () => {
        if (confirm('Are you sure you want to clear the uploaded dataset?')) {
            await mockDb.clearDataset();
            setDataset(null);
        }
    };

    const downloadCSV = () => {
        if (!dataset) return;

        const csvContent = [
            dataset.headers.join(','),
            ...dataset.data.map(row =>
                dataset.headers.map(h => row[h]).join(',')
            )
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = dataset.fileName;
        a.click();
        URL.revokeObjectURL(url);
    };

    if (loading) {
        return (
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 animate-pulse">
                <div className="h-8 bg-slate-800 rounded w-1/3 mb-4"></div>
                <div className="h-4 bg-slate-800 rounded w-2/3"></div>
            </div>
        );
    }

    if (!dataset) {
        return (
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                    <Database className="text-slate-500" size={24} />
                    <h3 className="text-xl font-semibold text-slate-300">No Dataset Uploaded</h3>
                </div>
                <p className="text-slate-500 text-sm">
                    Upload a dataset in the Project Setup to enable data-driven simulations.
                </p>
            </div>
        );
    }

    return (
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 hover:border-blue-500/30 transition-all">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                        <FileText className="text-blue-400" size={20} />
                    </div>
                    <div>
                        <h3 className="text-xl font-semibold text-slate-100">{dataset.fileName}</h3>
                        <p className="text-sm text-slate-500">
                            Uploaded {new Date(dataset.uploadedAt).toLocaleString()}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={downloadCSV}
                        className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                        title="Download CSV"
                    >
                        <Download size={18} />
                    </button>
                    <button
                        onClick={handleClear}
                        className="p-2 rounded-lg bg-red-900/20 hover:bg-red-900/40 text-red-400 transition-colors"
                        title="Clear Dataset"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-slate-950 rounded-lg p-4">
                    <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Total Rows</p>
                    <p className="text-2xl font-bold text-blue-400">{dataset.rowCount}</p>
                </div>
                <div className="bg-slate-950 rounded-lg p-4">
                    <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Columns</p>
                    <p className="text-2xl font-bold text-emerald-400">{dataset.headers.length}</p>
                </div>
            </div>

            <div className="bg-slate-950 rounded-lg p-4">
                <p className="text-slate-400 text-sm font-semibold mb-3">Column Headers:</p>
                <div className="flex flex-wrap gap-2">
                    {dataset.headers.map((header, idx) => (
                        <span
                            key={idx}
                            className="px-3 py-1 bg-slate-800 text-slate-300 rounded-full text-xs font-mono"
                        >
                            {header}
                        </span>
                    ))}
                </div>
            </div>

            {dataset.data.length > 0 && (
                <div className="mt-4 bg-slate-950 rounded-lg p-4 overflow-x-auto">
                    <p className="text-slate-400 text-sm font-semibold mb-3">Sample Data (First Row):</p>
                    <table className="w-full text-sm">
                        <tbody>
                            {dataset.headers.map((header, idx) => (
                                <tr key={idx} className="border-b border-slate-800 last:border-0">
                                    <td className="py-2 pr-4 text-slate-500 font-mono text-xs">{header}</td>
                                    <td className="py-2 text-slate-300 font-semibold">{dataset.data[0][header]}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default DatasetViewer;
