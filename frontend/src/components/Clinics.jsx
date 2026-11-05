import React, { useState } from 'react';
import { useQueue } from '../context/QueueContext';
import {
    Stethoscope,
    Users,
    Clock,
    Plus,
    Search,
    ArrowRight,
    Building2
} from 'lucide-react';
import { getDoctorAvatar } from '../utils/avatarUtils';

export default function Clinics({ onOpenQueue, onOpenAddQueue }) {
    const { queues, tokens } = useQueue();
    const [searchTerm, setSearchTerm] = useState('');

    const getWaitingCount = (queueId) => {
        return tokens.filter((t) => t.queueId === queueId && t.status === 'WAITING').length;
    };

    const filtered = queues.filter((q) =>
        (q.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (q.department || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-4 sm:space-y-6">

            {/* Responsive Header Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                        Manage Clinic & Consultation Queues
                    </h2>
                    <p className="text-[11px] sm:text-xs text-slate-500">
                        Monitor doctor rooms, waiting density, and launch live triage boards.
                    </p>
                </div>

                <button
                    onClick={onOpenAddQueue}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-bold text-xs shadow-md shadow-teal-600/20 transition active:scale-95 cursor-pointer"
                >
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                    <span>Create New Doctor Queue</span>
                </button>
            </div>

            {/* Search Bar */}
            <div className="relative w-full sm:max-w-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Search className="w-3.5 h-3.5" />
                </div>
                <input
                    type="text"
                    placeholder="Search by doctor, department, or room..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 bg-white text-xs focus:outline-hidden focus:ring-2 focus:ring-cyan-500 shadow-xs"
                />
            </div>

            {/* Doctor Cards Grid with Doctor Portraits Only */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {filtered.map((q) => {
                    const count = q.waiting_count !== undefined ? q.waiting_count : getWaitingCount(q.id);
                    const queueWaitingTokens = (q.waiting_tokens && q.waiting_tokens.length > 0)
                        ? q.waiting_tokens
                        : tokens.filter((t) => (t.queueId === q.id || t.queue === q.id) && t.status === 'WAITING');
                    const doctorAvatar = getDoctorAvatar(q.name, q.id);

                    return (
                        <div
                            key={q.id}
                            className="card-hover-lift shimmer-card bg-gradient-to-b from-white via-white to-slate-50/70 rounded-2xl border border-slate-200/90 p-5.5 shadow-sm hover:border-cyan-400/80 hover:shadow-xl hover:shadow-cyan-500/10 transition-all duration-300 flex flex-col justify-between group relative overflow-hidden"
                        >
                            <div className="absolute -top-12 -right-12 w-32 h-32 bg-gradient-to-bl from-cyan-400/15 via-teal-300/10 to-transparent rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform duration-500" />
                            <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-400/5 rounded-full blur-xl pointer-events-none group-hover:bg-cyan-400/10 transition-colors" />

                            <div>
                                {/* Badges & Doctor Avatar */}
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2.5">
                                        <img
                                            src={doctorAvatar}
                                            alt={q.name}
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80';
                                            }}
                                            className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-md ring-1 ring-slate-200 shrink-0"
                                        />
                                        <div>
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                Active
                                            </span>
                                        </div>
                                    </div>
                                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200">
                                        {q.room}
                                    </span>
                                </div>

                                {/* Queue Name */}
                                <h3 className="font-extrabold text-sm sm:text-base text-slate-900 group-hover:text-cyan-700 transition-colors line-clamp-1">
                                    {q.name}
                                </h3>
                                <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                                    <Building2 className="w-3.5 h-3.5 text-cyan-600" />
                                    <span className="font-medium text-slate-500">{q.department}</span>
                                </div>

                                {/* Stats Grid */}
                                <div className="grid grid-cols-2 gap-2.5 my-4 p-3 rounded-xl bg-slate-50/90 border border-slate-100">
                                    <div>
                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                            Patients Waiting
                                        </div>
                                        <div className="text-base font-black text-slate-900 flex items-center gap-1.5 mt-0.5">
                                            <Users className="w-4 h-4 text-cyan-600" />
                                            {count}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                            Avg Wait
                                        </div>
                                        <div className="text-base font-black text-slate-900 flex items-center gap-1.5 mt-0.5">
                                            <Clock className="w-4 h-4 text-amber-500" />
                                            {q.avgWait || '5m'}
                                        </div>
                                    </div>
                                </div>

                                {/* Clean Patient List Pills (No patient images, clean badges only) */}
                                <div className="mb-4">
                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                                        Patient List
                                    </div>
                                    {queueWaitingTokens.length > 0 ? (
                                        <div className="flex flex-wrap gap-1.5">
                                            {queueWaitingTokens.slice(0, 3).map((t) => (
                                                <div
                                                    key={t.id}
                                                    className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200/80 text-xs font-bold text-slate-700 shadow-2xs"
                                                >
                                                    <span className="text-[10px] text-slate-400">👤</span>
                                                    <span className="truncate max-w-[100px]">{t.patientName}</span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-xs text-slate-400 italic py-1">
                                            No patients waiting
                                        </div>
                                    )}
                                </div>
                            </div>

                            <button
                                onClick={() => onOpenQueue(q.id)}
                                className="w-full mt-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-50 to-teal-50 group-hover:from-cyan-600 group-hover:to-teal-600 text-cyan-700 group-hover:text-white font-bold text-xs transition-all flex items-center justify-center gap-2 border border-cyan-200/60 group-hover:border-transparent group-hover:shadow-md group-hover:shadow-cyan-600/20 active:scale-98 cursor-pointer"
                            >
                                <span>Open Queue</span>
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                            </button>
                        </div>
                    );
                })}
            </div>

        </div>
    );
}
