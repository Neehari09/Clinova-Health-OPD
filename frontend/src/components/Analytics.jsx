import React, { useState, useMemo } from 'react';
import { useQueue } from '../context/QueueContext';
import {
    Zap,
    TrendingUp,
    ShieldCheck,
    Clock,
    Users,
    Calendar,
    Download,
    ChevronRight,
    Activity,
    Search,
    Stethoscope,
    ArrowLeft,
    Pill
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
    const { activeQueue, analytics, queues, tokens } = useQueue();
    const [filter, setFilter] = useState('today');
    const [viewMode, setViewMode] = useState('dashboard'); // 'dashboard' | 'detail'
    const [selectedMetric, setSelectedMetric] = useState('consultations'); // 'wait' | 'consultations' | 'density'
    const [deptFilter, setDeptFilter] = useState('ALL'); // 'ALL' | 'PED' | 'ORT' | 'CARD' | 'GP' | 'LAB'
    const [searchQuery, setSearchQuery] = useState('');

    // Dynamic Automatic Dates calculation
    const dates = useMemo(() => {
        const now = new Date();
        const formatDate = (d) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const todayStr = formatDate(now);

        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = formatDate(yesterday);

        const weekAgo = new Date(now);
        weekAgo.setDate(weekAgo.getDate() - 6);
        const weekStr = `${formatDate(weekAgo)} - ${todayStr}`;

        return { todayStr, yesterdayStr, weekStr };
    }, []);

    // Department-Wise Average Wait Times (Option 2)
    const deptWaitAverages = useMemo(() => [
        { code: 'GP', name: 'General Physician', doctor: 'Dr. Srikanth', avgWait: '6.2', statusText: 'Smooth Flow', tagColor: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
        { code: 'PED', name: 'Pediatrics', doctor: 'Dr. Anita', avgWait: '7.8', statusText: 'Fast Moving', tagColor: 'text-purple-700 bg-purple-50 border-purple-200' },
        { code: 'ORT', name: 'Orthopedics', doctor: 'Dr. Ashwin', avgWait: '9.5', statusText: 'Mobility Checks', tagColor: 'text-blue-700 bg-blue-50 border-blue-200' },
        { code: 'CARD', name: 'Cardiology', doctor: 'Dr. Rajesh Verma', avgWait: '11.8', statusText: 'ECG & Vitals', tagColor: 'text-rose-700 bg-rose-50 border-rose-200' },
        { code: 'LAB', name: 'Pathology & Lab', doctor: 'Dr. Ajay Sharma', avgWait: '4.1', statusText: 'Rapid Tests', tagColor: 'text-amber-700 bg-amber-50 border-amber-200' },
    ], []);

    // Total waiting patients across ALL doctors (0 if empty)
    const totalHospitalWaitingCount = useMemo(() => {
        const count = queues.reduce((acc, q) => acc + (q.waiting_count || 0), 0);
        return count;
    }, [queues]);

    // All currently waiting patients across all queues
    const allHospitalWaitingPatients = useMemo(() => {
        const list = [];
        queues.forEach((q) => {
            const isPed = (q.name || '').toLowerCase().includes('pediatric');
            const isOrt = (q.name || '').toLowerCase().includes('orthopedic');
            const isCard = (q.name || '').toLowerCase().includes('cardio');
            const isGp = (q.name || '').toLowerCase().includes('general') || (q.name || '').toLowerCase().includes('srikanth');
            const deptCode = isPed ? 'PED' : isOrt ? 'ORT' : isCard ? 'CARD' : isGp ? 'GP' : 'LAB';

            if (q.waiting_tokens && q.waiting_tokens.length > 0) {
                q.waiting_tokens.forEach((t, idx) => {
                    // Extract live registered time from notes (e.g., 'Reg: 05:38:15 PM') or createdAt
                    let regTime = 'Waiting Now';
                    if (t.notes && t.notes.includes('Reg:')) {
                        regTime = t.notes.split('Reg:')[1].trim();
                    } else if (t.createdAt) {
                        const d = new Date(t.createdAt);
                        regTime = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
                    }

                    list.push({
                        token: t.tokenNumber || `${deptCode}${String(idx + 1).padStart(2, '0')}`,
                        name: `${t.patientName}`,
                        ageGender: `${t.age || 30} ${t.gender || 'M'}`,
                        deptCode: deptCode,
                        attendedTime: regTime,
                        prescription: 'Awaiting Consultation & Doctor Examination',
                        doctor: q.name,
                        room: q.room,
                        status: 'WAITING'
                    });
                });
            }
        });

        if (list.length === 0 && tokens && tokens.length > 0) {
            tokens.filter(t => t.status === 'WAITING').forEach((t, idx) => {
                const code = t.token_number?.replace(/[0-9#]/g, '') || 'GP';
                let regTime = 'Waiting Now';
                if (t.notes && t.notes.includes('Reg:')) {
                    regTime = t.notes.split('Reg:')[1].trim();
                } else if (t.created_at) {
                    const d = new Date(t.created_at);
                    regTime = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
                }

                list.push({
                    token: t.token_number || `${code}${String(idx + 1).padStart(2, '0')}`,
                    name: `${t.patient_name}`,
                    ageGender: `${t.age} ${t.gender}`,
                    deptCode: code,
                    attendedTime: regTime,
                    prescription: 'Awaiting Consultation in Hall',
                    doctor: activeQueue?.name || 'General OPD',
                    room: activeQueue?.room || 'OPD Desk',
                    status: 'WAITING'
                });
            });
        }
        return list;
    }, [queues, tokens, activeQueue]);

    // Past date consultations generator (for Nov 5th Yesterday = 88 patients, This Week = 542)
    const yesterdayConsultationsList = useMemo(() => {
        const names = [
            'Aarav', 'Ananya', 'Rudransh', 'Kavya', 'Aditya', 'Pooja', 'Sai Teja', 'Sunita', 'Rohan', 'Eshwar',
            'Tarun', 'Vikas', 'Meera', 'Priya', 'Divya', 'Sneha', 'Kartik', 'Deepak', 'Kunal', 'Varun',
            'Sanjay', 'Ajay', 'Sachin', 'Harish', 'Praveen', 'Alok', 'Mohit', 'Rakesh', 'Manish', 'Gaurav',
            'Nikhil', 'Neha', 'Komal', 'Ritu', 'Swati', 'Shreya', 'Anjali', 'Tanvi', 'Payal', 'Bhavna',
            'Ashish', 'Chetan', 'Dinesh', 'Girish', 'Hemant', 'Jitendra', 'Lalit', 'Manoj', 'Nitin', 'Pradeep',
            'Rahul', 'Sandip', 'Tushar', 'Umesh', 'Vipul', 'Yogesh', 'Amit', 'Bhupesh', 'Chirag', 'Devendra',
            'Gagan', 'Inder', 'Jayant', 'Kapil', 'Lokendra', 'Mayank', 'Naval', 'Omkar', 'Pankaj', 'Rajiv',
            'Sumit', 'Tejas', 'Utkarsh', 'Vivek', 'Yash', 'Abhinav', 'Brijesh', 'Chandan', 'Darshan', 'Gopal',
            'Harshit', 'Ishwar', 'Jagdish', 'Kailash', 'Lokesh', 'Madhav', 'Nirmal', 'Pramod'
        ];

        const depts = [
            { code: 'GP', doctor: 'Dr. Srikanth (General Physician)', room: 'Room 201', prefix: 'GP', count: 20, ageBase: 32, rx: 'Antibiotic Course & Rest Advised' },
            { code: 'PED', doctor: 'Dr. Anita (Pediatrics)', room: 'Room 104', prefix: 'PED', count: 18, ageBase: 5, rx: 'Pediatric Vitals Checked & Drops Prescribed' },
            { code: 'ORT', doctor: 'Dr. Ashwin (Orthopedics)', room: 'Room 101', prefix: 'ORT', count: 18, ageBase: 44, rx: 'X-Ray Evaluated & Pain Relief Gel Prescribed' },
            { code: 'CARD', doctor: 'Dr. Rajesh Verma (Cardiology)', room: 'Room 205', prefix: 'CARD', count: 16, ageBase: 56, rx: 'ECG Normal — Blood Pressure Medication Adjusted' },
            { code: 'LAB', doctor: 'Dr. Ajay Sharma (Pathology & Lab)', room: 'Lab 1', prefix: 'LAB', count: 16, ageBase: 36, rx: 'Blood Sample Analyzed — CBC & Platelet Report Ready' }
        ];

        const list = [];
        let nameIdx = 0;

        depts.forEach(dept => {
            for (let i = 1; i <= dept.count; i++) {
                const name = names[nameIdx++] || `Patient ${i}`;
                const totalMinutes = 8 * 60 + 30 + (i * 12) % 360;
                const hour24 = Math.floor(totalMinutes / 60);
                const minute = totalMinutes % 60;
                const ampm = hour24 >= 12 ? 'PM' : 'AM';
                const hour12 = hour24 > 12 ? hour24 - 12 : hour24;
                const timeString = `${String(hour12).padStart(2, '0')}:${String(minute).padStart(2, '0')} ${ampm}`;
                const age = dept.code === 'PED' ? (2 + (i % 8)) : (dept.ageBase + (i % 20));
                const gender = (i % 3 === 0) ? 'F' : 'M';

                list.push({
                    token: `${dept.prefix}${String(i).padStart(2, '0')}`,
                    name,
                    ageGender: `${age} ${gender}`,
                    deptCode: dept.code,
                    attendedTime: timeString,
                    prescription: dept.rx,
                    doctor: dept.doctor,
                    room: dept.room,
                    status: 'COMPLETED'
                });
            }
        });

        return list;
    }, []);

    // Full 542 Consultations List for "This Week" view
    const weekConsultationsList = useMemo(() => {
        const firstNames = [
            'Aarav', 'Ananya', 'Rudransh', 'Kavya', 'Aditya', 'Pooja', 'Sai Teja', 'Sunita', 'Rohan', 'Eshwar',
            'Tarun', 'Vikas', 'Meera', 'Priya', 'Divya', 'Sneha', 'Kartik', 'Deepak', 'Kunal', 'Varun',
            'Sanjay', 'Ajay', 'Sachin', 'Harish', 'Praveen', 'Alok', 'Mohit', 'Rakesh', 'Manish', 'Gaurav',
            'Nikhil', 'Neha', 'Komal', 'Ritu', 'Swati', 'Shreya', 'Anjali', 'Tanvi', 'Payal', 'Bhavna',
            'Ashish', 'Chetan', 'Dinesh', 'Girish', 'Hemant', 'Jitendra', 'Lalit', 'Manoj', 'Nitin', 'Pradeep',
            'Rahul', 'Sandip', 'Tushar', 'Umesh', 'Vipul', 'Yogesh', 'Amit', 'Bhupesh', 'Chirag', 'Devendra',
            'Gagan', 'Inder', 'Jayant', 'Kapil', 'Lokendra', 'Mayank', 'Naval', 'Omkar', 'Pankaj', 'Rajiv',
            'Sumit', 'Tejas', 'Utkarsh', 'Vivek', 'Yash', 'Abhinav', 'Brijesh', 'Chandan', 'Darshan', 'Gopal'
        ];
        const lastNames = ['Sharma', 'Reddy', 'Patel', 'Verma', 'Rao', 'Kumar', 'Singh', 'Gupta', 'Mehta', 'Nair'];

        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const depts = [
            { code: 'GP', doctor: 'Dr. Srikanth (General Physician)', room: 'Room 201', prefix: 'GP', weight: 125, ageBase: 32, rx: 'Antibiotic Course & Rest Advised' },
            { code: 'PED', doctor: 'Dr. Anita (Pediatrics)', room: 'Room 104', prefix: 'PED', weight: 110, ageBase: 5, rx: 'Pediatric Vitals Checked & Drops Prescribed' },
            { code: 'ORT', doctor: 'Dr. Ashwin (Orthopedics)', room: 'Room 101', prefix: 'ORT', weight: 105, ageBase: 44, rx: 'X-Ray Evaluated & Pain Relief Gel Prescribed' },
            { code: 'CARD', doctor: 'Dr. Rajesh Verma (Cardiology)', room: 'Room 205', prefix: 'CARD', weight: 102, ageBase: 56, rx: 'ECG Normal — Blood Pressure Medication Adjusted' },
            { code: 'LAB', doctor: 'Dr. Ajay Sharma (Pathology & Lab)', room: 'Lab 1', prefix: 'LAB', weight: 100, ageBase: 36, rx: 'Blood Sample Analyzed — CBC & Platelet Report Ready' }
        ];

        const list = [];
        let count = 0;
        const target = 542;

        depts.forEach((dept) => {
            const deptTarget = Math.min(dept.weight, target - count);
            for (let i = 1; i <= deptTarget; i++) {
                count++;
                const fn = firstNames[(count * 7) % firstNames.length];
                const ln = lastNames[(count * 3) % lastNames.length];
                const day = days[(count * 2) % days.length];
                const totalMinutes = 8 * 60 + 30 + (i * 7) % 400;
                const hour24 = Math.floor(totalMinutes / 60);
                const minute = totalMinutes % 60;
                const ampm = hour24 >= 12 ? 'PM' : 'AM';
                const hour12 = hour24 > 12 ? hour24 - 12 : hour24;
                const timeString = `${day} ${String(hour12).padStart(2, '0')}:${String(minute).padStart(2, '0')} ${ampm}`;
                const age = dept.code === 'PED' ? (1 + (i % 9)) : (dept.ageBase + (i % 25));
                const gender = (i % 2 === 0) ? 'F' : 'M';

                list.push({
                    token: `${dept.prefix}${String(i).padStart(3, '0')}`,
                    name: `${fn} ${ln}`,
                    ageGender: `${age} ${gender}`,
                    deptCode: dept.code,
                    attendedTime: timeString,
                    prescription: dept.rx,
                    doctor: dept.doctor,
                    room: dept.room,
                    status: 'COMPLETED'
                });
            }
        });

        return list;
    }, []);

    // Distinct Dataset for Date Filter
    const currentViewData = useMemo(() => {
        if (filter === 'yesterday') {
            return {
                label: 'Yesterday',
                avgWait: '9.4',
                totalConsultations: 88,
                waitingDensity: '0 (Shift Closed)',
                peakTime: '11:00 AM',
                waitTrend: '+0.8 mins vs Last Week',
                isTrendGood: false,
                lineLabels: ['8 AM', '9 AM', '10 AM', '11 AM', '12 PM', '1 PM', '2 PM', '3 PM', '4 PM', '5 PM'],
                arrivals: [6, 14, 21, 19, 13, 8, 12, 10, 6, 2],
                consulted: [5, 12, 19, 18, 14, 8, 11, 11, 6, 2],
            };
        } else if (filter === 'week') {
            return {
                label: 'This Week',
                avgWait: '7.9',
                totalConsultations: 542,
                waitingDensity: '12 Avg Daily',
                peakTime: 'Mon & Wed 10 AM',
                waitTrend: '-1.6 mins vs Last Week',
                isTrendGood: true,
                lineLabels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                arrivals: [95, 88, 102, 79, 91, 65, 22],
                consulted: [92, 85, 98, 77, 89, 64, 22],
            };
        } else {
            const todayCount = (analytics.completedTokensList?.length || 0);
            return {
                label: 'Today',
                avgWait: todayCount > 0 ? (analytics.avgWaitMinutes || '8.4') : '0.0',
                totalConsultations: todayCount,
                waitingDensity: `${totalHospitalWaitingCount} Waiting`,
                peakTime: todayCount > 0 ? '10:30 AM' : 'Shift Active',
                waitTrend: 'Live Session',
                isTrendGood: true,
                lineLabels: ['8 AM', '9 AM', '10 AM', '11 AM', '12 PM', '1 PM', '2 PM', '3 PM', '4 PM'],
                arrivals: [todayCount, 0, 0, 0, 0, 0, 0, 0, 0],
                consulted: [todayCount, 0, 0, 0, 0, 0, 0, 0, 0],
            };
        }
    }, [filter, analytics, totalHospitalWaitingCount]);

    // Active Metric Details Setup
    const activeData = useMemo(() => {
        let title = '';
        let subtitle = '';
        let icon = Users;
        let color = 'text-teal-600';
        let rawRecords = [];

        if (selectedMetric === 'consultations') {
            let baseList = [];
            if (filter === 'yesterday') {
                baseList = yesterdayConsultationsList; // 88 patients for Nov 5th Yesterday
            } else if (filter === 'week') {
                baseList = weekConsultationsList; // 542 patients for This Week
            } else {
                // Today: dynamic live consultations starting from 0
                baseList = (analytics.completedTokensList || []).map(r => ({
                    ...r,
                    deptCode: r.token?.includes('PED') ? 'PED' : r.token?.includes('ORT') ? 'ORT' : r.token?.includes('CARD') ? 'CARD' : r.token?.includes('LAB') ? 'LAB' : 'GP'
                }));
            }
            
            // Sort by Department and Token Number
            const sortedCompleted = [...baseList].sort((a, b) => {
                const deptOrder = { PED: 1, ORT: 2, CARD: 3, GP: 4, LAB: 5 };
                const orderA = deptOrder[a.deptCode] || 99;
                const orderB = deptOrder[b.deptCode] || 99;
                if (orderA !== orderB) return orderA - orderB;

                const numA = parseInt(a.token?.replace(/\D/g, '') || '0', 10) || 0;
                const numB = parseInt(b.token?.replace(/\D/g, '') || '0', 10) || 0;
                return numA - numB;
            });

            title = `Completed Consultations Audit (${currentViewData.label})`;
            subtitle = sortedCompleted.length > 0
                ? `All attended patients who completed consultation (${sortedCompleted.length} patients in ${currentViewData.label}).`
                : 'No patients have completed consultation yet today. Register and attend patients to see their completed audit record.';
            icon = Users;
            color = 'text-teal-600';
            rawRecords = sortedCompleted;
        } else if (selectedMetric === 'density') {
            title = 'Live Hospital OPD Waiting Queue (All Doctors)';
            subtitle = allHospitalWaitingPatients.length > 0
                ? `Real-time breakdown of all patients waiting for consultation across doctor queues (${allHospitalWaitingPatients.length} waiting).`
                : 'No patients currently waiting in the OPD queue.';
            icon = Activity;
            color = 'text-cyan-600';
            rawRecords = allHospitalWaitingPatients;
        } else {
            // 'wait'
            title = 'Department-Wise Average Wait Times';
            subtitle = 'Comparison of patient waiting times across each hospital department and clinic.';
            icon = Clock;
            color = 'text-cyan-600';
            rawRecords = (analytics.completedTokensList || []).map(r => ({
                ...r,
                deptCode: r.token?.includes('PED') ? 'PED' : r.token?.includes('ORT') ? 'ORT' : r.token?.includes('CARD') ? 'CARD' : r.token?.includes('LAB') ? 'LAB' : 'GP'
            }));
        }

        // Apply Department Filter
        let filteredByDept = rawRecords;
        if (deptFilter !== 'ALL') {
            filteredByDept = rawRecords.filter(r => r.deptCode === deptFilter);
        }

        // Apply Search
        const filteredRecords = filteredByDept.filter((item) => {
            if (!searchQuery.trim()) return true;
            const q = searchQuery.toLowerCase().trim();
            return (
                (item.name || '').toLowerCase().includes(q) ||
                (item.token || '').toLowerCase().includes(q) ||
                (item.doctor || '').toLowerCase().includes(q) ||
                (item.prescription || '').toLowerCase().includes(q)
            );
        });

        return {
            title,
            subtitle,
            icon,
            color,
            records: filteredRecords,
            totalCount: filteredByDept.length,
            unfilteredCount: rawRecords.length
        };
    }, [selectedMetric, deptFilter, filter, yesterdayConsultationsList, weekConsultationsList, allHospitalWaitingPatients, analytics.completedTokensList, searchQuery, currentViewData]);

    const openDetailPage = (metric) => {
        setSelectedMetric(metric);
        setDeptFilter('ALL');
        setSearchQuery('');
        setViewMode('detail');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const backToDashboard = () => {
        setViewMode('dashboard');
        setSearchQuery('');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const exportCSV = () => {
        const escapeCSV = (val) => {
            const str = String(val ?? '').replace(/"/g, '""');
            return `"${str}"`;
        };

        const rows = [];
        rows.push(['Token #', 'Patient Name', 'Age / Gender', 'Department / Doctor', selectedMetric === 'density' ? 'Registered Time' : 'Attended Time', 'Prescription / Rx Issued', 'Status'].map(escapeCSV).join(','));

        if (activeData.records && activeData.records.length > 0) {
            activeData.records.forEach((r) => {
                rows.push([
                    escapeCSV(r.token),
                    escapeCSV(r.name),
                    escapeCSV(r.ageGender || ''),
                    escapeCSV(r.doctor || activeQueue?.name || 'Clinova OPD'),
                    escapeCSV(r.attendedTime || ''),
                    escapeCSV(r.prescription || ''),
                    escapeCSV(r.status)
                ].join(','));
            });
        }

        rows.push('');
        rows.push(['--- CLINICAL METRIC SUMMARY ---', '', '', '', '', '', ''].join(','));
        rows.push([escapeCSV('Active View'), escapeCSV(activeData.title), '', '', '', '', ''].join(','));
        rows.push([escapeCSV('Time Period'), escapeCSV(currentViewData.label), '', '', '', '', ''].join(','));
        rows.push([escapeCSV('Overall Hospital Avg Wait'), escapeCSV(`${currentViewData.avgWait} mins`), '', '', '', '', ''].join(','));

        const csvString = '\uFEFF' + rows.join('\r\n');
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Clinova_OPD_${selectedMetric}_${deptFilter}_${filter}_${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const lineData = {
        labels: currentViewData.lineLabels,
        datasets: [
            {
                label: 'Arrivals',
                data: currentViewData.arrivals,
                borderColor: '#0891b2',
                backgroundColor: 'rgba(8, 145, 178, 0.12)',
                tension: 0.4,
                fill: true,
                pointBackgroundColor: '#0891b2',
                pointRadius: 4,
            },
            {
                label: 'Consulted',
                data: currentViewData.consulted,
                borderColor: '#10b981',
                borderDash: [3, 3],
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
            legend: { position: 'top', labels: { boxWidth: 10, font: { size: 10 } } },
        },
        scales: {
            y: { beginAtZero: true, grid: { color: '#f8fafc' }, ticks: { font: { size: 10 } } },
            x: { grid: { display: false }, ticks: { font: { size: 10 }, maxRotation: 0 } },
        },
    };

    const deptBarData = {
        labels: ['General Physician', 'Pediatrics', 'Orthopedics', 'Cardiology', 'Pathology Lab'],
        datasets: [
            {
                label: 'Avg Wait (mins)',
                data: [6.2, 7.8, 9.5, 11.8, 4.1],
                backgroundColor: ['#10b981', '#a855f7', '#3b82f6', '#f43f5e', '#f59e0b'],
                borderRadius: 8,
            },
        ],
    };

    const deptBarOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
            y: {
                beginAtZero: true,
                max: 15,
                ticks: { callback: (v) => `${v}m`, font: { size: 10 } },
                grid: { color: '#f8fafc' }
            },
            x: { grid: { display: false }, ticks: { font: { size: 9 }, maxRotation: 0 } },
        },
    };

    // =========================================================================
    // DEDICATED SEPARATE FULL-PAGE VIEW
    // =========================================================================
    if (viewMode === 'detail') {
        const IconComponent = activeData.icon;
        return (
            <div className="space-y-5 animate-in fade-in duration-200">
                {/* Dedicated Top Action Bar */}
                <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={backToDashboard}
                            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition active:scale-95 cursor-pointer shrink-0"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span>Back to Analytics Dashboard</span>
                        </button>
                        <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>
                        <div className="flex items-center gap-2">
                            <div className="w-9 h-9 rounded-xl bg-cyan-50 flex items-center justify-center shrink-0">
                                <IconComponent className={`w-5 h-5 ${activeData.color}`} />
                            </div>
                            <div>
                                <h2 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                                    {activeData.title}
                                </h2>
                                <p className="text-xs text-slate-500">
                                    {activeData.subtitle}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        <button
                            onClick={exportCSV}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs shadow-md shadow-cyan-600/20 transition active:scale-95 cursor-pointer"
                        >
                            <Download className="w-4 h-4" />
                            <span>Export View as CSV</span>
                        </button>
                    </div>
                </div>

                {/* 5 Department Average Wait Stat Cards (Shown in Wait-Time detail view) */}
                {selectedMetric === 'wait' && (
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                        {deptWaitAverages.map((dept) => (
                            <div
                                key={dept.code}
                                onClick={() => setDeptFilter(dept.code)}
                                className={`p-3.5 rounded-xl border transition-all cursor-pointer bg-white hover:shadow-md ${
                                    deptFilter === dept.code ? 'border-2 border-cyan-500 ring-2 ring-cyan-500/20 shadow-xs' : 'border-slate-200'
                                }`}
                            >
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                    {dept.name}
                                </div>
                                <div className="text-xs text-slate-500 font-semibold">{dept.doctor}</div>
                                <div className="text-2xl font-black text-slate-900 mt-0.5">
                                    {dept.avgWait} <span className="text-xs font-semibold text-slate-500">mins</span>
                                </div>
                                <div className={`inline-block mt-1.5 px-2 py-0.5 rounded-md text-[10px] font-extrabold border ${dept.tagColor}`}>
                                    {dept.statusText}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Sub-header Navigation Tabs */}
                <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto text-xs font-bold">
                    <button
                        onClick={() => { setSelectedMetric('consultations'); setSearchQuery(''); }}
                        className={`px-4 py-2 rounded-xl transition cursor-pointer shrink-0 flex items-center gap-2 ${
                            selectedMetric === 'consultations'
                                ? 'bg-teal-600 text-white shadow-xs'
                                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                        }`}
                    >
                        <Users className="w-3.5 h-3.5" />
                        <span>Total Consultations ({currentViewData.totalConsultations})</span>
                    </button>

                    <button
                        onClick={() => { setSelectedMetric('density'); setSearchQuery(''); }}
                        className={`px-4 py-2 rounded-xl transition cursor-pointer shrink-0 flex items-center gap-2 ${
                            selectedMetric === 'density'
                                ? 'bg-cyan-600 text-white shadow-xs'
                                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                        }`}
                    >
                        <Activity className="w-3.5 h-3.5" />
                        <span>OPD Waiting ({allHospitalWaitingPatients.length} Waiting)</span>
                    </button>

                    <button
                        onClick={() => { setSelectedMetric('wait'); setSearchQuery(''); }}
                        className={`px-4 py-2 rounded-xl transition cursor-pointer shrink-0 flex items-center gap-2 ${
                            selectedMetric === 'wait'
                                ? 'bg-cyan-600 text-white shadow-xs'
                                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                        }`}
                    >
                        <Clock className="w-3.5 h-3.5" />
                        <span>Department Wait Times</span>
                    </button>
                </div>

                {/* Department Grouping Filter Bar */}
                <div className="bg-slate-50/90 rounded-2xl border border-slate-200/80 p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mr-1">
                            Filter By Department:
                        </span>

                        <button
                            onClick={() => setDeptFilter('ALL')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                                deptFilter === 'ALL'
                                    ? 'bg-slate-900 text-white shadow-xs'
                                    : 'bg-white text-slate-600 hover:bg-slate-200/70 border border-slate-200'
                            }`}
                        >
                            All ({activeData.unfilteredCount})
                        </button>

                        <button
                            onClick={() => setDeptFilter('GP')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                                deptFilter === 'GP'
                                    ? 'bg-emerald-600 text-white shadow-xs'
                                    : 'bg-white text-emerald-700 hover:bg-emerald-50 border border-emerald-200'
                            }`}
                        >
                            <span>🩺 GP (Dr. Srikanth)</span>
                        </button>

                        <button
                            onClick={() => setDeptFilter('PED')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                                deptFilter === 'PED'
                                    ? 'bg-purple-600 text-white shadow-xs'
                                    : 'bg-white text-purple-700 hover:bg-purple-50 border border-purple-200'
                            }`}
                        >
                            <span>👶 Pediatrics (Dr. Anita)</span>
                        </button>

                        <button
                            onClick={() => setDeptFilter('ORT')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                                deptFilter === 'ORT'
                                    ? 'bg-blue-600 text-white shadow-xs'
                                    : 'bg-white text-blue-700 hover:bg-blue-50 border border-blue-200'
                            }`}
                        >
                            <span>🦴 Orthopedics (Dr. Ashwin)</span>
                        </button>

                        <button
                            onClick={() => setDeptFilter('CARD')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                                deptFilter === 'CARD'
                                    ? 'bg-rose-600 text-white shadow-xs'
                                    : 'bg-white text-rose-700 hover:bg-rose-50 border border-rose-200'
                            }`}
                        >
                            <span>❤️ Cardiology (Dr. Rajesh Verma)</span>
                        </button>

                        <button
                            onClick={() => setDeptFilter('LAB')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                                deptFilter === 'LAB'
                                    ? 'bg-amber-600 text-white shadow-xs'
                                    : 'bg-white text-amber-700 hover:bg-amber-50 border border-amber-200'
                            }`}
                        >
                            <span>🔬 Pathology Lab (Dr. Ajay Sharma)</span>
                        </button>
                    </div>

                    {/* Search Input Bar */}
                    <div className="relative w-full sm:w-72 shrink-0">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                            <Search className="w-4 h-4" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search name, token, prescription..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-cyan-500 shadow-2xs"
                        />
                    </div>
                </div>

                {/* Updated Table: Token #, Patient Name, Age / Gender, Department / Doctor, Attended Time, Prescription / Rx Issued, Status */}
                <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
                    <div className="p-3 sm:px-6 border-b border-slate-100 flex items-center justify-between bg-white text-xs">
                        <span className="font-bold text-slate-600">
                            Showing: <strong className="text-slate-900 font-extrabold">{activeData.records.length}</strong> of {activeData.totalCount} records in this view
                        </span>
                        {deptFilter !== 'ALL' && (
                            <span className="text-[11px] font-bold text-slate-400">
                                Sequential Token Sequence: 01, 02, 03, 04, 05...
                            </span>
                        )}
                    </div>

                    {/* Table View */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs min-w-[750px]">
                            <thead>
                                <tr className="border-b border-slate-200/70 text-slate-400 font-bold uppercase tracking-wider bg-slate-50/60 text-[11px]">
                                    <th className="py-3.5 px-4">Token #</th>
                                    <th className="py-3.5 px-4">Patient Name</th>
                                    <th className="py-3.5 px-4">Age / Gender</th>
                                    <th className="py-3.5 px-4">Department / Doctor</th>
                                    <th className="py-3.5 px-4">{selectedMetric === 'density' ? 'Registered Time' : 'Attended Time'}</th>
                                    <th className="py-3.5 px-4">Prescription / Rx Issued</th>
                                    <th className="py-3.5 px-4 text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {activeData.records.length > 0 ? (
                                    activeData.records.map((r, idx) => {
                                        const isPed = r.deptCode === 'PED';
                                        const isOrt = r.deptCode === 'ORT';
                                        const isCard = r.deptCode === 'CARD';
                                        const isGp = r.deptCode === 'GP';
                                        const badgeColor = isPed
                                            ? 'bg-purple-100 text-purple-800 border-purple-300'
                                            : isOrt
                                            ? 'bg-blue-100 text-blue-800 border-blue-300'
                                            : isCard
                                            ? 'bg-rose-100 text-rose-800 border-rose-300'
                                            : isGp
                                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                            : 'bg-amber-100 text-amber-800 border-amber-300';

                                        return (
                                            <tr key={idx} className="hover:bg-cyan-50/40 transition-colors">
                                                <td className="py-3.5 px-4">
                                                    <span className={`inline-block px-2.5 py-1 rounded-lg font-black text-xs tracking-wider border shadow-2xs ${badgeColor}`}>
                                                        {r.token}
                                                    </span>
                                                </td>
                                                <td className="py-3.5 px-4 font-bold text-slate-800 text-[13px]">{r.name}</td>
                                                <td className="py-3.5 px-4 font-bold text-slate-600">
                                                    <span className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-[11px]">
                                                        {r.ageGender}
                                                    </span>
                                                </td>
                                                <td className="py-3.5 px-4 text-slate-600 font-medium">
                                                    <div className="flex items-center gap-1.5">
                                                        <Stethoscope className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
                                                        <span>{r.doctor}</span>
                                                    </div>
                                                </td>
                                                <td className="py-3.5 px-4 font-bold text-slate-700">
                                                    <div className="flex items-center gap-1 text-[11px]">
                                                        <Clock className="w-3 h-3 text-cyan-600" />
                                                        <span>{r.attendedTime}</span>
                                                    </div>
                                                </td>
                                                <td className="py-3.5 px-4">
                                                    <div className="flex items-center gap-1.5 text-slate-800 font-medium max-w-md">
                                                        <Pill className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                                                        <span className="truncate">{r.prescription}</span>
                                                    </div>
                                                </td>
                                                <td className="py-3.5 px-4 text-right">
                                                    <span className="px-2.5 py-1 rounded-full font-extrabold text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                        {r.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="py-12 text-center text-slate-400">
                                            {selectedMetric === 'density'
                                                ? 'No patients currently waiting in the OPD queue. Register a patient to see them in this waiting list.'
                                                : `No matching patient found for "${searchQuery}".`}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    }

    // =========================================================================
    // MAIN ANALYTICS DASHBOARD VIEW
    // =========================================================================
    return (
        <div className="space-y-4 sm:space-y-6">

            {/* Title & Filter Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                        Hospital OPD Analytics & Wait Times
                    </h2>
                    <p className="text-[11px] sm:text-xs text-slate-500 truncate max-w-xs sm:max-w-md">
                        Comprehensive clinical analytics for: <strong className="text-slate-700">All Doctor Queues</strong>
                    </p>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto w-full sm:w-auto">
                    <div className="flex-1 sm:flex-initial flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 shadow-xs">
                        <Calendar className="w-4 h-4 text-cyan-600 shrink-0" />
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="bg-transparent focus:outline-hidden cursor-pointer w-full text-xs font-semibold"
                        >
                            <option value="today">Today: {dates.todayStr}</option>
                            <option value="yesterday">Yesterday: {dates.yesterdayStr}</option>
                            <option value="week">This Week: {dates.weekStr}</option>
                        </select>
                    </div>

                    <button
                        onClick={exportCSV}
                        className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs shadow-md shadow-cyan-600/20 transition active:scale-95 cursor-pointer shrink-0"
                    >
                        <Download className="w-4 h-4" />
                        <span className="hidden sm:inline">Export CSV</span>
                        <span className="sm:hidden">CSV</span>
                    </button>
                </div>
            </div>

            {/* 3 KPI Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">

                {/* Card 1: Department-Wise Wait Times Card */}
                <button
                    type="button"
                    onClick={() => openDetailPage('wait')}
                    className="text-left rounded-2xl p-5 bg-white border border-slate-200/90 shadow-sm hover:shadow-lg hover:border-cyan-400 transition-all duration-200 cursor-pointer group"
                >
                    <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                        <span>Avg Wait Time</span>
                        <Clock className="w-4 h-4 text-slate-400 group-hover:text-cyan-600 transition" />
                    </div>
                    <div className="flex items-baseline justify-between mt-1">
                        <div className="text-3xl font-black text-slate-900">
                            {currentViewData.avgWait} <span className="text-xs font-semibold text-slate-500">mins (Hospital)</span>
                        </div>
                    </div>

                    <div className="mt-2.5 flex items-center gap-1.5 flex-wrap text-[10px] font-bold">
                        <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">GP: 6.2m</span>
                        <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200">PED: 7.8m</span>
                        <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">ORT: 9.5m</span>
                        <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200">CARD: 11.8m</span>
                        <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200">LAB: 4.1m</span>
                    </div>

                    <div className="mt-3 text-[11px] text-cyan-600 font-bold flex items-center justify-between border-t border-slate-100 pt-2">
                        <span>View Department-Wise Wait Times</span>
                        <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
                    </div>
                </button>

                {/* Card 2: Total Consultations */}
                <button
                    type="button"
                    onClick={() => openDetailPage('consultations')}
                    className="text-left rounded-2xl p-5 bg-white border border-slate-200/90 shadow-sm hover:shadow-lg hover:border-teal-400 transition-all duration-200 cursor-pointer group"
                >
                    <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                        <span>Total Consultations</span>
                        <Users className="w-4 h-4 text-slate-400 group-hover:text-teal-600 transition" />
                    </div>
                    <div className="text-3xl font-black text-slate-900 mt-1">
                        {currentViewData.totalConsultations} <span className="text-xs font-semibold text-slate-500">Patients</span>
                    </div>
                    <div className="text-xs text-teal-700 font-semibold mt-2">
                        {filter === 'today' ? '100% Completed consultations' : `${currentViewData.label} Summary`}
                    </div>
                    <div className="mt-3 text-[11px] text-teal-600 font-bold flex items-center justify-between border-t border-slate-100 pt-2">
                        <span>View all {currentViewData.totalConsultations} patients (Separate Page)</span>
                        <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
                    </div>
                </button>

                {/* Card 3: OPD Queue Density */}
                <button
                    type="button"
                    onClick={() => openDetailPage('density')}
                    className="text-left rounded-2xl p-5 bg-white border border-slate-200/90 shadow-sm hover:shadow-lg hover:border-cyan-400 transition-all duration-200 cursor-pointer group"
                >
                    <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                        <span>OPD Queue Density (All Doctors)</span>
                        <Activity className="w-4 h-4 text-slate-400 group-hover:text-cyan-600 transition" />
                    </div>
                    <div className="text-3xl font-black text-slate-900 mt-1">
                        {totalHospitalWaitingCount} <span className="text-xs font-semibold text-slate-500">Waiting</span>
                    </div>
                    <div className="text-xs text-cyan-700 font-semibold mt-2">
                        Across all 5 Doctor Clinics
                    </div>
                    <div className="mt-3 text-[11px] text-cyan-600 font-bold flex items-center justify-between border-t border-slate-100 pt-2">
                        <span>View waiting patients (Separate Page)</span>
                        <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
                    </div>
                </button>

            </div>

            {/* Responsive Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">

                {/* Line Chart */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <div>
                            <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                                {filter === 'week' ? 'Daily Patient Volume (This Week)' : 'Hourly Patient Arrivals & Consultations'}
                            </h3>
                            <p className="text-xs text-slate-400">
                                {filter === 'week' ? 'Monday to Sunday patient volume' : 'Arrivals vs Completed consultations'}
                            </p>
                        </div>
                        <span className="text-xs px-2.5 py-1 rounded-lg bg-cyan-50 text-cyan-700 font-bold border border-cyan-100">
                            Peak: {currentViewData.peakTime}
                        </span>
                    </div>
                    <div className="h-56 sm:h-64 w-full">
                        <Line data={lineData} options={lineOptions} />
                    </div>

                    {/* Point 3: Hourly Doctor Clearance Rate / Efficiency Metric Strip */}
                    <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3">
                        
                        {/* 1. Clearance Rate */}
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/80 shadow-2xs">
                            <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center text-white shrink-0 shadow-xs">
                                <Zap className="w-5 h-5" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">Clearance Rate</div>
                                <div className="text-lg font-black text-emerald-950 leading-tight">92%</div>
                                <div className="text-[10px] text-emerald-700 font-medium truncate">Arrivals attended on schedule</div>
                            </div>
                        </div>

                        {/* 2. Busiest Hour */}
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 shadow-2xs">
                            <div className="w-9 h-9 rounded-lg bg-amber-500 flex items-center justify-center text-white shrink-0 shadow-xs">
                                <TrendingUp className="w-5 h-5" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="text-[10px] font-bold uppercase tracking-wider text-amber-800">Busiest Hour</div>
                                <div className="text-lg font-black text-amber-950 leading-tight">10:30 AM</div>
                                <div className="text-[10px] text-amber-700 font-medium truncate">22 Patient Arrivals</div>
                            </div>
                        </div>

                        {/* 3. Fastest Clearance Hour */}
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-cyan-50/70 border border-cyan-200/80 shadow-2xs">
                            <div className="w-9 h-9 rounded-lg bg-cyan-600 flex items-center justify-center text-white shrink-0 shadow-xs">
                                <ShieldCheck className="w-5 h-5" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="text-[10px] font-bold uppercase tracking-wider text-cyan-800">Fastest Clearance</div>
                                <div className="text-lg font-black text-cyan-950 leading-tight">1:00 PM</div>
                                <div className="text-[10px] text-cyan-700 font-medium truncate">100% Attended (0 backlog)</div>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Department Wait-Time Comparison Bar Chart */}
                <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm">
                    <h3 className="font-extrabold text-sm sm:text-base text-slate-900 mb-0.5">
                        Department Wait Times
                    </h3>
                    <p className="text-xs text-slate-400 mb-3">Average wait per clinic (mins)</p>
                    <div className="h-56 sm:h-64 w-full">
                        <Bar data={deptBarData} options={deptBarOptions} />
                    </div>
                </div>

            </div>

        </div>
    );
}
