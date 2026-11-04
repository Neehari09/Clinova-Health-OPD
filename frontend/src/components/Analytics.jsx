import React, { useState } from 'react';
import { useQueue } from '../context/QueueContext';
import {
    Clock,
    Users,
    TrendingDown,
    AlertOctagon,
    Calendar,
    Download,
    FileText
} from 'lucide-react';

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

export default function Analytics() {
    const { activeQueue, analytics } = useQueue();
    const [filter, setFilter] = useState('today');

    // 1. Line Chart: Hourly Patient Footfall & Rush Hours (Requirement 8)
    const lineData = {
        labels: ['8 AM', '9 AM', '10 AM', '10:30 AM', '11:30 AM', '1 PM', '2:30 PM', '4 PM', '6 PM'],
        datasets: [
            {
                label: 'Patients Arrived / Hour',
                data: [4, 12, 18, 22, 19, 11, 14, 9, 3],
                borderColor: '#0891b2', // Cyan
                backgroundColor: 'rgba(8, 145, 178, 0.15)',
                tension: 0.4,
                fill: true,
                pointBackgroundColor: '#0891b2',
                pointRadius: 4,
            },
            {
                label: 'Patients Consulted',
                data: [3, 10, 16, 20, 18, 12, 13, 9, 4],
                borderColor: '#10b981', // Green
                borderDash: [4, 4],
                tension: 0.3,
                fill: false,
                pointRadius: 3,
            }
        ],
    };

    const lineOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'top', labels: { boxWidth: 12, font: { size: 11 } } },
        },
        scales: {
            y: { beginAtZero: true, grid: { color: '#f1f5f9' } },
            x: { grid: { display: false } },
        },
    };

    // 2. Bar Chart: Wait-Time Distribution (Requirement 8)
    const barData = {
        labels: ['< 10 mins', '10 - 20 mins', '> 20 mins'],
        datasets: [
            {
                label: '% of Patients',
                data: [68, 22, 10],
                backgroundColor: ['#0891b2', '#06b6d4', '#f59e0b'],
                borderRadius: 8,
            },
        ],
    };

    const barOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
            y: {
                beginAtZero: true,
                max: 100,
                ticks: { callback: (v) => `${v}%` },
                grid: { color: '#f1f5f9' }
            },
            x: { grid: { display: false } },
        },
    };

    return (
        <div className="space-y-6">

            {/* Title & Date Filter Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                        Hospital OPD Analytics & Wait Times
                    </h2>
                    <p className="text-xs text-slate-500">
                        Real-time clinical insights for: <strong className="text-slate-700">{activeQueue.name}</strong>
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 shadow-xs">
                        <Calendar className="w-3.5 h-3.5 text-cyan-600" />
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="bg-transparent focus:outline-hidden cursor-pointer"
                        >
                            <option value="today">Today: Aug 25, 2025</option>
                            <option value="yesterday">Yesterday</option>
                            <option value="week">This Week</option>
                        </select>
                    </div>

                    <button
                        onClick={() => alert('Exporting clinical audit CSV...')}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-semibold text-xs shadow-xs transition active:scale-95 cursor-pointer"
                    >
                        <Download className="w-3.5 h-3.5" />
                        <span>Export CSV</span>
                    </button>
                </div>
            </div>

            {/* 4 KPI Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

                {/* Card 1: Avg Wait Time */}
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                        <span>Avg Patient Wait Time</span>
                        <Clock className="w-4 h-4 text-cyan-600" />
                    </div>
                    <div className="text-3xl font-black text-slate-900 mt-1">
                        {analytics.avgWaitMinutes} <span className="text-sm font-semibold text-slate-500">mins</span>
                    </div>
                    <div className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <TrendingDown className="w-3 h-3" />
                        <span>-2.1 mins vs hospital SLA</span>
                    </div>
                </div>

                {/* Card 2: Total Consultations */}
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                        <span>Total Consultations</span>
                        <Users className="w-4 h-4 text-teal-600" />
                    </div>
                    <div className="text-3xl font-black text-slate-900 mt-1">
                        {analytics.totalServedCount} <span className="text-sm font-semibold text-slate-500">Patients</span>
                    </div>
                    <div className="text-[11px] text-teal-700 font-semibold mt-2">
                        94% of OPD shift completed
                    </div>
                </div>

                {/* Card 3: Current Queue Length */}
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                        <span>Current OPD Queue</span>
                        <Users className="w-4 h-4 text-cyan-600" />
                    </div>
                    <div className="text-3xl font-black text-slate-900 mt-1">
                        {analytics.waitingCount} <span className="text-sm font-semibold text-slate-500">Waiting</span>
                    </div>
                    <div className="text-[11px] text-cyan-700 font-semibold mt-2">
                        Normal waiting density
                    </div>
                </div>

                {/* Card 4: Diverted / Cancelled */}
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                        <span>Diverted / Cancelled</span>
                        <AlertOctagon className="w-4 h-4 text-rose-500" />
                    </div>
                    <div className="text-3xl font-black text-slate-900 mt-1">
                        {analytics.cancelledCount} <span className="text-sm font-semibold text-slate-500">Patients</span>
                    </div>
                    <div className="text-[11px] text-rose-600 font-semibold mt-2">
                        2.3% rate (ICU / Emergency)
                    </div>
                </div>

            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Line Chart: Rush Hours */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
                    <div className="flex items-center justify-between mb-3">
                        <div>
                            <h3 className="font-bold text-sm text-slate-900">
                                Hourly Patient Footfall & Rush Hours
                            </h3>
                            <p className="text-xs text-slate-400">Arrival curve between 8:00 AM – 6:00 PM</p>
                        </div>
                        <span className="text-xs px-2 py-0.5 rounded-lg bg-cyan-50 text-cyan-700 font-bold border border-cyan-100">
                            Peak: 10:30 AM
                        </span>
                    </div>
                    <div className="h-64 w-full">
                        <Line data={lineData} options={lineOptions} />
                    </div>
                </div>

                {/* Bar Chart: Wait Distribution */}
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
                    <h3 className="font-bold text-sm text-slate-900 mb-1">
                        Wait-Time Distribution
                    </h3>
                    <p className="text-xs text-slate-400 mb-3">Target SLA: Under 15 minutes</p>
                    <div className="h-64 w-full">
                        <Bar data={barData} options={barOptions} />
                    </div>
                </div>

            </div>

            {/* Audit Log Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-slate-400" />
                        <h3 className="font-bold text-sm text-slate-800">
                            Recent Consultations Audit Log
                        </h3>
                    </div>
                    <span className="text-xs text-slate-400 font-medium">Logged today</span>
                </div>

                <table className="w-full text-left border-collapse text-xs">
                    <thead>
                        <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase bg-slate-50/30">
                            <th className="py-2.5 px-4">Token #</th>
                            <th className="py-2.5 px-4">Patient Name</th>
                            <th className="py-2.5 px-4">Wait Duration</th>
                            <th className="py-2.5 px-4">Consultation Time</th>
                            <th className="py-2.5 px-4 text-right">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        <tr>
                            <td className="py-2.5 px-4 font-bold text-slate-800">#MED-098</td>
                            <td className="py-2.5 px-4 font-semibold text-slate-700">Hanan Amath (40M)</td>
                            <td className="py-2.5 px-4 text-slate-600">9 mins wait</td>
                            <td className="py-2.5 px-4 text-slate-600">11 mins</td>
                            <td className="py-2.5 px-4 text-right">
                                <span className="px-2 py-0.5 rounded-full font-bold bg-emerald-50 text-emerald-700 text-[11px]">
                                    COMPLETED
                                </span>
                            </td>
                        </tr>
                        <tr>
                            <td className="py-2.5 px-4 font-bold text-slate-800">#MED-099</td>
                            <td className="py-2.5 px-4 font-semibold text-slate-700">Jather Dranin (52F)</td>
                            <td className="py-2.5 px-4 text-slate-600">10 mins wait</td>
                            <td className="py-2.5 px-4 text-slate-600">13 mins</td>
                            <td className="py-2.5 px-4 text-right">
                                <span className="px-2 py-0.5 rounded-full font-bold bg-emerald-50 text-emerald-700 text-[11px]">
                                    COMPLETED
                                </span>
                            </td>
                        </tr>
                        <tr>
                            <td className="py-2.5 px-4 font-bold text-slate-800">#MED-100</td>
                            <td className="py-2.5 px-4 font-semibold text-slate-700">Mather Marrin (23F)</td>
                            <td className="py-2.5 px-4 text-slate-600">8 mins wait</td>
                            <td className="py-2.5 px-4 text-slate-600">10 mins</td>
                            <td className="py-2.5 px-4 text-right">
                                <span className="px-2 py-0.5 rounded-full font-bold bg-emerald-50 text-emerald-700 text-[11px]">
                                    COMPLETED
                                </span>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

        </div>
    );
}