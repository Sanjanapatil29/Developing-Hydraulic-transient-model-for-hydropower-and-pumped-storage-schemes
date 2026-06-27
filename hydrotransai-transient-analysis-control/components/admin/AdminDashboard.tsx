import React, { useState, useEffect } from 'react';
import { User, DashboardConfig } from '../../types';
import { mockDb } from '../../services/mockDatabase';
import { Users, Layout, Activity, ShieldCheck, Plus, Trash, Save, Edit, Check, Database } from 'lucide-react';
import DatasetViewer from '../DatasetViewer';

interface Props {
    currentUser: User;
}

const AdminDashboard: React.FC<Props> = ({ currentUser }) => {
    const [activeTab, setActiveTab] = useState<'users' | 'dashboards' | 'logs' | 'dataset'>('users');
    const [users, setUsers] = useState<User[]>([]);
    const [dashboards, setDashboards] = useState<DashboardConfig[]>([]);
    const [logs, setLogs] = useState<any[]>([]);

    // Dashboard Editor State
    const [editingDash, setEditingDash] = useState<DashboardConfig | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const u = await mockDb.getUsers();
        const d = await mockDb.getDashboards();
        const l = await mockDb.getLogs();
        setUsers(u);
        setDashboards(d);
        setLogs(l);
    };

    const handleAssignDashboard = async (userId: string, dashId: string) => {
        const user = users.find(u => u.id === userId);
        if (user) {
            const updated = { ...user, assignedDashboardId: dashId };
            await mockDb.updateUser(updated);
            loadData();
        }
    };

    const handleCreateDashboard = () => {
        const newDash: DashboardConfig = {
            id: `dash-${Date.now()}`,
            name: 'New Dashboard',
            layout: 'grid-default',
            createdBy: currentUser.id,
            createdAt: Date.now(),
            widgets: []
        };
        setEditingDash(newDash);
        setActiveTab('dashboards');
    };

    const handleSaveDashboard = async () => {
        if (editingDash) {
            await mockDb.saveDashboard(editingDash);
            setEditingDash(null);
            loadData();
        }
    };

    const deleteDashboard = async (id: string) => {
        if (confirm('Are you sure you want to delete this dashboard?')) {
            await mockDb.deleteDashboard(id);
            loadData();
        }
    };

    const toggleWidget = (widgetType: any) => {
        if (!editingDash) return;
        const exists = editingDash.widgets.find(w => w.type === widgetType);
        let newWidgets = [...editingDash.widgets];

        if (exists) {
            newWidgets = newWidgets.filter(w => w.type !== widgetType);
        } else {
            newWidgets.push({
                id: `w-${Date.now()}`,
                type: widgetType,
                title: widgetType.replace('CHART_', 'Chart: ')
            });
        }
        setEditingDash({ ...editingDash, widgets: newWidgets });
    };

    return (
        <div className="flex h-full bg-slate-950 text-slate-200">
            {/* Sidebar */}
            <div className="w-64 bg-slate-900 border-r border-slate-800 p-4 flex flex-col gap-2">
                <div className="mb-6 flex items-center gap-2 px-2 text-slate-100 font-bold">
                    <ShieldCheck className="text-blue-500" /> ADMIN PANEL
                </div>

                <NavButton active={activeTab === 'users'} onClick={() => setActiveTab('users')} icon={Users} label="User Management" />
                <NavButton active={activeTab === 'dashboards'} onClick={() => setActiveTab('dashboards')} icon={Layout} label="Dashboards" />
                <NavButton active={activeTab === 'dataset'} onClick={() => setActiveTab('dataset')} icon={Database} label="Dataset" />
                <NavButton active={activeTab === 'logs'} onClick={() => setActiveTab('logs')} icon={Activity} label="System Logs" />
            </div>

            {/* Main Content */}
            <div className="flex-1 p-8 overflow-y-auto">

                {/* USERS TAB */}
                {activeTab === 'users' && (
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold mb-4">User Management</h2>
                        <div className="bg-slate-900 rounded-lg border border-slate-800 overflow-hidden">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-800 text-slate-400 uppercase text-xs">
                                    <tr>
                                        <th className="px-4 py-3">User</th>
                                        <th className="px-4 py-3">Role</th>
                                        <th className="px-4 py-3">Last Login</th>
                                        <th className="px-4 py-3">Assigned Dashboard</th>
                                        <th className="px-4 py-3">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800">
                                    {users.map(user => (
                                        <tr key={user.id} className="hover:bg-slate-800/50">
                                            <td className="px-4 py-3 font-medium text-white">{user.username}</td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-1 rounded text-xs font-bold ${user.role === 'ADMIN' ? 'bg-purple-900 text-purple-200' : 'bg-blue-900 text-blue-200'}`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-slate-400">
                                                {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}
                                            </td>
                                            <td className="px-4 py-3">
                                                <select
                                                    className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs"
                                                    value={user.assignedDashboardId || ''}
                                                    onChange={(e) => handleAssignDashboard(user.id, e.target.value)}
                                                    disabled={user.role === 'ADMIN'}
                                                >
                                                    <option value="">Default System View</option>
                                                    {dashboards.map(d => (
                                                        <option key={d.id} value={d.id}>{d.name}</option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`w-2 h-2 rounded-full inline-block mr-2 ${user.isActive ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                                {user.isActive ? 'Active' : 'Inactive'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* DASHBOARDS TAB */}
                {activeTab === 'dashboards' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold">Dashboard Configuration</h2>
                            {!editingDash && (
                                <button onClick={handleCreateDashboard} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded text-sm font-bold flex items-center gap-2">
                                    <Plus size={16} /> Create New
                                </button>
                            )}
                        </div>

                        {editingDash ? (
                            <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 space-y-6 animate-in fade-in slide-in-from-bottom-4">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-2 w-1/2">
                                        <label className="text-xs uppercase font-bold text-slate-500">Dashboard Name</label>
                                        <input
                                            type="text"
                                            value={editingDash.name}
                                            onChange={(e) => setEditingDash({ ...editingDash, name: e.target.value })}
                                            className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white"
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => setEditingDash(null)} className="px-4 py-2 text-slate-400 hover:text-white">Cancel</button>
                                        <button onClick={handleSaveDashboard} className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded font-bold flex items-center gap-2">
                                            <Save size={16} /> Save Dashboard
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs uppercase font-bold text-slate-500 mb-2 block">Available Widgets</label>
                                    <div className="flex flex-wrap gap-2">
                                        {['SCHEMATIC', 'CHART_PRESSURE', 'CHART_FLOW', 'CHART_SPEED', 'CHART_VIBRATION', 'TELEMETRY', 'AI_ADVISOR', 'ALERTS'].map(type => {
                                            const isSelected = editingDash.widgets.some(w => w.type === type);
                                            return (
                                                <button
                                                    key={type}
                                                    onClick={() => toggleWidget(type)}
                                                    className={`px-3 py-2 rounded text-xs font-bold border transition-all flex items-center gap-2
                                                ${isSelected ? 'bg-blue-900/50 border-blue-500 text-blue-200' : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-600'}
                                            `}
                                                >
                                                    {isSelected && <Check size={12} />}
                                                    {type}
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>

                                <div className="bg-slate-950 p-4 rounded border border-slate-800 min-h-[200px]">
                                    <p className="text-xs text-slate-500 mb-2 text-center">PREVIEW LAYOUT</p>
                                    <div className="grid grid-cols-3 gap-2 opacity-50 pointer-events-none">
                                        {editingDash.widgets.map(w => (
                                            <div key={w.id} className="bg-slate-800 border-slate-700 border p-4 rounded text-xs text-center">
                                                {w.title}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {dashboards.map(d => (
                                    <div key={d.id} className="bg-slate-900 border border-slate-800 rounded-lg p-4 hover:border-slate-700 transition-colors group">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-bold text-white">{d.name}</h3>
                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => setEditingDash(d)} className="p-1 hover:bg-slate-800 rounded text-blue-400"><Edit size={14} /></button>
                                                <button onClick={() => deleteDashboard(d.id)} className="p-1 hover:bg-slate-800 rounded text-red-400"><Trash size={14} /></button>
                                            </div>
                                        </div>
                                        <p className="text-xs text-slate-500 mb-3">{d.widgets.length} Widgets Configured</p>
                                        <div className="flex flex-wrap gap-1">
                                            {d.widgets.slice(0, 3).map(w => (
                                                <span key={w.id} className="text-[10px] bg-slate-950 px-1 py-0.5 rounded text-slate-400 border border-slate-800">{w.type}</span>
                                            ))}
                                            {d.widgets.length > 3 && <span className="text-[10px] text-slate-600">+ {d.widgets.length - 3}</span>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* DATASET TAB */}
                {activeTab === 'dataset' && (
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold mb-4">Dataset Management</h2>
                        <DatasetViewer />
                    </div>
                )}

                {/* LOGS TAB */}
                {activeTab === 'logs' && (
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold mb-4">System Activity logs</h2>
                        <div className="bg-black/30 rounded-lg p-4 font-mono text-xs text-slate-400 h-[500px] overflow-y-auto">
                            {logs.map((log, i) => (
                                <div key={i} className="mb-1 border-b border-slate-800/50 pb-1">
                                    <span className="text-slate-600">[{new Date(log.timestamp).toLocaleTimeString()}]</span>{' '}
                                    <span className="text-blue-500 font-bold">{log.userId}</span>{' '}
                                    <span className="text-yellow-600">{log.action}:</span>{' '}
                                    <span>{log.details}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const NavButton = ({ active, onClick, icon: Icon, label }: any) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all
            ${active ? 'bg-blue-600/10 text-blue-400 border border-blue-600/20' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}
        `}
    >
        <Icon size={18} />
        {label}
    </button>
);

export default AdminDashboard;
