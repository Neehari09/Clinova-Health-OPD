import StethoscopeHeartLogo from './StethoscopeHeartLogo';
import React, { useState } from 'react';
import { useQueue } from '../context/QueueContext';
import { Activity, Lock, Mail, ShieldCheck } from 'lucide-react';

export default function Login() {
    const { login } = useQueue();
    const [email, setEmail] = useState('CN1021');
    const [password, setPassword] = useState('password123');
    const [remember, setRemember] = useState(true);

    const handleSubmit = (e) => {
        e.preventDefault();
        login(email);
    };

    return (
        <div className="min-h-screen bg-slate-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">

            {/* Hospital Logo & Header: Option 3 Stethoscope & Heart Rhythm on Pure White Card */}
            <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
                <div className="inline-flex items-center justify-center p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-md shadow-slate-200/50 mb-3.5">
                    <StethoscopeHeartLogo size={64} />
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center justify-center gap-2">
                    <span>Clinova</span>
                    <span className="text-teal-600">Health</span>
                </h2>
                <p className="text-xs font-bold uppercase tracking-wider text-cyan-700 mt-1">
                    Smart OPD & Patient Flow System
                </p>
            </div>

            {/* Login Card (Screen 1 Left) */}
            <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-6 shadow-xl shadow-slate-200/60 rounded-2xl border border-slate-200 sm:px-10">

                    <div className="mb-6">
                        <h3 className="text-base font-bold text-slate-800">
                            Welcome, OPD Receptionist / Nurse
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5">
                            Sign in to manage patient queues and triage calling.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">

                        {/* Staff ID / Email */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Staff ID / Hospital Email
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                    <Mail className="w-4 h-4" />
                                </div>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-hidden focus:ring-2 focus:ring-cyan-500"
                                    placeholder="CN1021"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                    <Lock className="w-4 h-4" />
                                </div>
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-hidden focus:ring-2 focus:ring-cyan-500"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        {/* Remember Me */}
                        <div className="flex items-center justify-between text-xs pt-1">
                            <label className="flex items-center gap-2 cursor-pointer text-slate-600">
                                <input
                                    type="checkbox"
                                    checked={remember}
                                    onChange={(e) => setRemember(e.target.checked)}
                                    className="w-4 h-4 text-cyan-600 rounded-sm"
                                />
                                Remember station
                            </label>
                            <span className="text-cyan-600 font-semibold cursor-pointer">
                                Forgot password?
                            </span>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            className="w-full mt-2 py-2.5 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-semibold text-xs shadow-md shadow-cyan-600/20 transition active:scale-98 cursor-pointer"
                        >
                            Sign In to OPD Desk
                        </button>

                    </form>

                    {/* Footer badge */}
                    <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                        <div className="flex items-center gap-1.5 text-emerald-600 font-semibold">
                            <ShieldCheck className="w-4 h-4" />
                            <span>HIPAA Compliant System</span>
                        </div>
                        <span>v1.0.0</span>
                    </div>

                </div>
            </div>

        </div>
    );
}