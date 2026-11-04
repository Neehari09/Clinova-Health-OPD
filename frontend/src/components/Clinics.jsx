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

export default function Clinics({ onOpenQueue, onOpenAddQueue }) {
    const { queues, tokens } = useQueue();
    const [searchTerm, setSearchTerm] = useState('');

    // Calculate live waiting count for each doctor's queue
    const getWaitingCount = (queueId) => {
        return tokens.filter((t) => t.queueId === queueId && t.status === 'WAITING').length;
    };

    const filtered = queues.filter((q) =>
        q.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.department.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">

            {/* Header & Create Queue Button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                        Manage Clinic & Consultation Queues
                    </h2>
                    <p className="text-xs text-slate-500">
                        Monitor doctor consultation rooms, waiting hall density, and launch live triage boards.
                    </p>
                </div>

                <button
                    onClick={onOpenAddQueue}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs shadow-xs transition active:scale-95 cursor-pointer self-start sm:self-auto"
                >
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                    <span>Create New Doctor Queue</span>
                </button>
            </div>

            {/* Search Bar */}
            <div className="relative max-w-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Search className="w-3.5 h-3.5" />
                </div>
                <input
                    type="text"
                    placeholder="Search by doctor, department, or room..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-300 bg-white text-xs focus:outline-hidden focus:ring-2 focus:ring-cyan-500 shadow-xs"
                />
            </div>

            {/* Doctor Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filtered.map((q) => {
                    const count = getWaitingCount(q.id);
                    const queueWaitingTokens = tokens.filter((t) => t.queueId === q.id && t.status === 'WAITING');

                    return (
                        <div
                            key={q.id}
                            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between group"
                        >
                            <div>
                                {/* Status Badges */}
                                <div className="flex items-center justify-between mb-3">
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                        Active
                                    </span>
                                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                                        {q.room}
                                    </span>
                                </div>

                                {/* Queue / Doctor Name */}
                                <h3 className="font-bold text-sm text-slate-900 group-hover:text-cyan-700 transition">
                                    {q.name}
                                </h3>
                                <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                                    <span>{q.department}</span>
                                </div>

                                {/* Waiting & Avg Wait Stats */}
                                <div className="grid grid-cols-2 gap-2 my-4 p-3 rounded-xl bg-slate-50 border border-slate-100">
                                    <div>
                                        <div className="text-[10px] font-bold text-slate-400 uppercase">
                                            In Queue
                                        </div>
                                        <div className="text-base font-black text-slate-800 flex items-center gap-1 mt-0.5">
                                            <Users className="w-3.5 h-3.5 text-cyan-600" />
                                            {count} Patients
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-bold text-slate-400 uppercase">
                                            Avg Wait
                                        </div>
                                        <div className="text-base font-black text-slate-800 flex items-center gap-1 mt-0.5">
                                            <Clock className="w-3.5 h-3.5 text-amber-500" />
                                            {q.avgWait || '5m'}
                                        </div>
                                    </div>
                                </div>

                                {/* Next in Line Preview */}
                                <div className="mb-4">
                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                                        Next in Line
                                    </div>
                                    {queueWaitingTokens.length > 0 ? (
                                        <div className="space-y-1">
                                            {queueWaitingTokens.slice(0, 2).map((t) => (
                                                <div
                                                    key={t.id}
                                                    className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-slate-50 border border-slate-100"
                                                >
                                                    <span className="font-semibold text-slate-700">{t.patientName}</span>
                                                    <span className="font-bold text-slate-500 text-[11px]">{t.tokenNumber}</span>
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

                            {/* Action Button */}
                            <button
                                onClick={() => onOpenQueue(q.id)}
                                className="w-full mt-2 py-2 px-3 rounded-xl bg-cyan-50 hover:bg-cyan-600 text-cyan-700 hover:text-white font-semibold text-xs transition flex items-center justify-center gap-1.5 group-hover:bg-cyan-600 group-hover:text-white cursor-pointer"
                            >
                                <span>Open Live Queue</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    );
                })}
            </div>

        </div>
    );
}

