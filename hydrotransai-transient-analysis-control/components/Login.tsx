import React, { useState } from 'react';
import { ShieldCheck, Lock, User, Activity } from 'lucide-react';
import { mockDb } from '../services/mockDatabase';
import { User as UserType } from '../types';

interface Props {
    onLogin: (user: UserType) => void;
}

const Login: React.FC<Props> = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const user = await mockDb.authenticate(username, password);
            if (user) {
                if (!user.isActive) {
                    setError('Account exists but is currently inactive. Contact Admin.');
                } else {
                    onLogin(user);
                }
            } else {
                setError('Invalid credentials. (Try admin/admin123 or operator/user123)');
            }
        } catch (err) {
            setError('Login service unreachable.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-screen w-full bg-slate-950 flex items-center justify-center relative overflow-hidden font-sans">
            {/* Background Ambience */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-900/20 blur-[120px] animate-pulse-slow"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-900/20 blur-[100px] animate-pulse-slow delay-1000"></div>
            </div>

            <div className="relative z-10 w-full max-w-md p-8">
                <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-8 animate-in fade-in slide-in-from-bottom-8 duration-700">

                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl mx-auto flex items-center justify-center shadow-lg shadow-blue-500/30 mb-4">
                            <Activity className="text-white" size={32} />
                        </div>
                        <h1 className="text-2xl font-bold text-white tracking-tight">HydroTrans<span className="text-blue-500">AI</span></h1>
                        <p className="text-slate-400 text-xs uppercase tracking-widest mt-2">Transient Analysis System</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-5">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase ml-1">Username</label>
                            <div className="relative group">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={18} />
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full bg-slate-950/50 border border-slate-700 rounded-lg py-3 pl-10 pr-4 text-slate-200 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-slate-600"
                                    placeholder="Enter username"
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase ml-1">Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={18} />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-slate-950/50 border border-slate-700 rounded-lg py-3 pl-10 pr-4 text-slate-200 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-slate-600"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-400 text-xs animate-in fade-in slide-in-from-top-1">
                                <ShieldCheck size={14} />
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3 rounded-lg shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                        >
                            {loading ? (
                                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                            ) : (
                                <>
                                    <span>SECURE LOGIN</span>
                                    <ShieldCheck size={18} />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-[10px] text-slate-500">Authorized Personnel Only • Secure Connection</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
