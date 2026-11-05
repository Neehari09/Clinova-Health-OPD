import StethoscopeHeartLogo from './components/StethoscopeHeartLogo';
import React, { useState } from 'react';
import { QueueProvider, useQueue } from './context/QueueContext';
import {
  Activity,
  Play,
  ArrowUp,
  ArrowDown,
  XCircle,
  PlusCircle,
  CheckCheck,
  Stethoscope,
  ChevronDown,
  Clock,
  AlertTriangle,
  Plus,
  BarChart3,
  LayoutGrid,
  LogOut,
  Menu,
  X,
  Users
} from 'lucide-react';

// Modals and Sub-Pages
import AddPatient from './components/AddPatient';
import AddQueue from './components/AddQueue';
import Analytics from './components/Analytics';
import Clinics from './components/Clinics';
import Login from './components/Login';
import { getDoctorAvatar, getFirstLetter, getInitialColor } from './utils/avatarUtils';

function Dashboard() {
  const {
    currentUser,
    logout,
    queues,
    selectedQueueId,
    setSelectedQueueId,
    activeQueue,
    waitingTokens,
    currentlyServing,
    serveNext,
    moveTokenUp,
    moveTokenDown,
    cancelToken,
    completeActiveConsultation,
    analytics
  } = useQueue();

  const [activeTab, setActiveTab] = useState('clinics');
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
  const [isQueueModalOpen, setIsQueueModalOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedRx, setSelectedRx] = useState('');
  const [customRx, setCustomRx] = useState('');


  // Department-specific Prescription Templates
  const currentDeptRxList = React.useMemo(() => {
    const qName = (activeQueue?.name || '').toLowerCase();
    const dept = (activeQueue?.department || '').toLowerCase();

    if (qName.includes('pediatric') || dept.includes('pediatric')) {
      return [
        'Pediatric Vitals Checked & Drops Prescribed',
        'Oral Rehydration & Paracetamol Syrup Prescribed',
        'Immunization Recorded & Review in 1 Month'
      ];
    } else if (qName.includes('ortho') || dept.includes('ortho')) {
      return [
        'X-Ray Evaluated & Pain Relief Gel Prescribed',
        'Physiotherapy Recommended & Review in 7 Days',
        'Calcium & Vitamin D3 Supplements Issued'
      ];
    } else if (qName.includes('cardio') || dept.includes('cardio')) {
      return [
        'ECG Normal — Blood Pressure Medication Adjusted',
        'Lipid Profile Advised & Pharmacy Order Sent',
        'Echocardiogram Review Completed & Low Sodium Diet Prescribed'
      ];
    } else if (qName.includes('pathology') || qName.includes('lab') || dept.includes('diag')) {
      return [
        'Blood Sample Analyzed — CBC & Platelet Report Ready',
        'Thyroid Profile Processed & Digital Copy Sent',
        'Fasting Glucose & HbA1c Sample Collected'
      ];
    } else {
      return [
        'Antibiotic Course & Follow-up in 3 Days',
        'Routine Vitals Checked & Rest Advised',
        'Antacid & Fever Medication Issued'
      ];
    }
  }, [activeQueue]);

  if (!currentUser?.isLoggedIn) {
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-20 sm:pb-8">

      {/* 1. Responsive Hospital Header with Glassmorphism & Status */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-18">

            {/* Hospital Logo: Option 3 Stethoscope & Heart Rhythm */}
            <div className="flex items-center gap-3">
              <StethoscopeHeartLogo size={44} />
              <div>
                <h1 className="text-base sm:text-lg font-black text-slate-900 leading-tight tracking-tight flex items-center gap-1">
                  <span>Clinova</span>
                  <span className="text-teal-600">Health</span>
                </h1>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  Smart OPD & Patient Flow System
                </p>
              </div>
            </div>

            {/* Desktop Navigation Tabs */}
            <nav className="hidden md:flex items-center gap-1.5 bg-slate-100/80 p-1 rounded-2xl border border-slate-200/70">
              <button
                onClick={() => setActiveTab('clinics')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'clinics'
                    ? 'bg-white text-cyan-800 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                Clinics Hub
              </button>

              <button
                onClick={() => setActiveTab('board')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'board'
                    ? 'bg-white text-cyan-800 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                Live OPD Board
              </button>

              <button
                onClick={() => setActiveTab('analytics')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'analytics'
                    ? 'bg-white text-cyan-800 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                Analytics & Trends
              </button>
            </nav>

            {/* Right Header Actions with Generous Spacing / Gap */}
            <div className="flex items-center gap-3 sm:gap-4 md:ml-6 lg:ml-8">

              {/* Doctor / Department Selector — visible before Register Patient ONLY in Live OPD Board */}
              {activeTab === 'board' && queues && queues.length > 0 && (
                <div className="flex items-center gap-2 px-3.5 py-2 bg-white rounded-xl border border-slate-200 shadow-xs ring-1 ring-slate-100">
                  <Stethoscope className="w-4 h-4 text-cyan-700 shrink-0" />
                  <span className="text-[11px] font-extrabold text-slate-500 hidden xl:inline">Doctor / Department:</span>
                  <select
                    value={selectedQueueId || ''}
                    onChange={(e) => setSelectedQueueId(Number(e.target.value))}
                    className="bg-transparent text-xs font-bold text-slate-800 focus:outline-hidden cursor-pointer max-w-[160px] sm:max-w-[240px] truncate"
                    title="Select Doctor / Department"
                  >
                    {queues.map((q) => {
                      const cleanName = (q.name || '').replace(/\s*\((?:Room|Lab)[^)]*\)/gi, '').trim();
                      return (
                        <option key={q.id} value={q.id}>
                          {cleanName} ({q.room})
                        </option>
                      );
                    })}
                  </select>
                </div>
              )}

              {/* + Register Patient Button */}
              <button
                onClick={() => setIsPatientModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 text-white font-bold text-xs rounded-xl shadow-md shadow-cyan-600/20 transition active:scale-95 cursor-pointer shrink-0"
              >
                <PlusCircle className="w-4 h-4 stroke-[2.2]" />
                <span>Register Patient</span>
              </button>

              {/* Staff Profile Dropdown: Neehari Soule (Staff ID CN1021) */}
              <div className="relative pl-1 sm:pl-2 border-l border-slate-200">
                <button
                  type="button"
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 py-1 px-1.5 sm:px-2 rounded-xl hover:bg-slate-100 transition cursor-pointer select-none"
                >
                  <img
                    src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80"
                    alt="Neehari Soule"
                    className="w-8 h-8 sm:w-8.5 sm:h-8.5 rounded-full object-cover border border-slate-200 shadow-2xs"
                  />
                  <span className="text-xs font-bold text-slate-800 hidden sm:inline">Neehari S.</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform ${profileDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-slate-200/90 p-3 z-50 animate-in fade-in zoom-in-95 duration-100">
                    <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100 mb-2">
                      <img
                        src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80"
                        alt="Neehari Soule"
                        className="w-10 h-10 rounded-full object-cover border-2 border-cyan-500 shadow-xs shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="text-xs font-black text-slate-900 truncate">Neehari Soule</div>
                        <div className="text-[10px] font-bold text-cyan-700">Staff ID: CN1021</div>
                        <div className="text-[10px] text-slate-500 truncate">OPD Department — Desk 1</div>
                        <div className="text-[9px] font-bold text-emerald-600 flex items-center gap-1 mt-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Active Shift Online
                        </div>
                      </div>
                    </div>

                    <div className="pt-1 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          if (window.confirm("Are you sure you want to log out of Clinova Health?")) {
                            logout();
                          }
                        }}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                      >
                        <span className="flex items-center gap-2">
                          <LogOut className="w-4 h-4" />
                          Log Out
                        </span>
                        <span className="text-[10px] font-semibold text-rose-400">End Session</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

            </div>

          </div>
        </div>
      </header>

      {/* 2. Main Body Container */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-4 sm:pt-6">

        {/* View 1: Clinics Hub */}
        {activeTab === 'clinics' && (
          <Clinics
            onOpenQueue={(queueId) => {
              setSelectedQueueId(queueId);
              setActiveTab('board');
            }}
            onOpenAddQueue={() => setIsQueueModalOpen(true)}
          />
        )}

        {/* View 2: Live OPD Board */}
        {activeTab === 'board' && (
          <div className="space-y-4 sm:space-y-6">

            {/* KPI Cards Row with Premium Glass & Accent Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5">

              {/* Card 1: Currently Serving (Spotlight Card) */}
              <div className="bg-gradient-to-br from-white via-cyan-50/20 to-teal-50/30 rounded-2xl border border-cyan-200/80 p-5 shadow-sm sm:col-span-2 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-400/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />

                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <img
                      src={getDoctorAvatar(activeQueue?.name, activeQueue?.id)}
                      alt="Doctor"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80';
                      }}
                      className="w-7 h-7 rounded-full object-cover border border-cyan-300 shadow-2xs"
                    />
                    <span className="text-[11px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Now In Consultation
                    </span>
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 flex items-center gap-1.5 shadow-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    {activeQueue?.room}
                  </span>
                </div>

                {currentlyServing ? (
                  <div className="mt-2 space-y-3">
                    {/* Top Row: Patient Info & Finish Consultation Button */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-base border shadow-xs shrink-0 ${getInitialColor(currentlyServing.patientName)}`}>
                          {getFirstLetter(currentlyServing.patientName)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-2xl font-black text-cyan-900 tracking-tight">
                              {currentlyServing.tokenNumber}
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-cyan-100 text-cyan-800 border border-cyan-200">
                              Active Token
                            </span>
                          </div>
                          <div className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-1.5 mt-0.5">
                            <span>{currentlyServing.patientName}</span>
                            <span className="text-xs text-slate-500 font-normal">
                              ({currentlyServing.age} yrs • {currentlyServing.gender === 'F' ? 'Female' : 'Male'})
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Prominent Finish Consultation Button (Always Visible) */}
                      <button
                        type="button"
                        onClick={() => {
                          const rxToSave = customRx.trim() || selectedRx || currentDeptRxList[0];
                          completeActiveConsultation(currentlyServing.id, rxToSave);
                          setSelectedRx('');
                          setCustomRx('');
                        }}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-black shadow-md shadow-emerald-600/25 transition active:scale-95 cursor-pointer shrink-0"
                      >
                        <CheckCheck className="w-4 h-4 stroke-[3]" />
                        <span>Finish Consultation & Save</span>
                      </button>
                    </div>

                    {/* Bottom Row: Prescription Dropdown & Custom Advice Input */}
                    <div className="p-3 rounded-xl bg-white/90 border border-slate-200 shadow-2xs space-y-2">
                      <label className="block text-[11px] font-extrabold text-slate-700 flex items-center justify-between">
                        <span className="flex items-center gap-1">
                          <span>💊</span>
                          <span>Select / Type Prescription & Clinical Advice:</span>
                        </span>
                        <span className="text-[10px] text-cyan-700 font-bold bg-cyan-50 px-2 py-0.5 rounded">
                          Saved to Total Consultations
                        </span>
                      </label>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <select
                          value={selectedRx}
                          onChange={(e) => {
                            setSelectedRx(e.target.value);
                            setCustomRx(e.target.value);
                          }}
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-cyan-500 cursor-pointer shadow-2xs"
                        >
                          <option value="">-- Choose Prescription Template --</option>
                          {currentDeptRxList.map((rx, idx) => (
                            <option key={idx} value={rx}>{rx}</option>
                          ))}
                        </select>

                        <input
                          type="text"
                          placeholder="Or type custom prescription / advice here..."
                          value={customRx}
                          onChange={(e) => setCustomRx(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-cyan-500 shadow-2xs"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 py-3 text-slate-400">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-semibold text-slate-600">Consultation Room Available</p>
                      <p className="text-[11px] text-slate-400">Call the next waiting patient from the queue below.</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Card 2: Waiting Patients */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Waiting in Hall
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                    <Clock className="w-4 h-4" />
                  </div>
                </div>
                <div className="my-2">
                  <div className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                    {waitingTokens.length}
                    <span className="text-xs sm:text-sm font-bold text-slate-400 ml-1.5">Patients</span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                  <span>Triage order</span>
                  <span className="font-bold text-cyan-600">{waitingTokens.filter(t => t.notes?.toLowerCase().includes('urgent')).length} Urgent</span>
                </div>
              </div>

              {/* Card 3: Avg Wait Time */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Avg Consultation
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Activity className="w-4 h-4" />
                  </div>
                </div>
                <div className="my-2">
                  <div className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                    {analytics.avgWaitMinutes || '8.4'}
                    <span className="text-xs sm:text-sm font-bold text-slate-400 ml-1.5">mins</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 font-bold pt-2 border-t border-slate-100">
                  <span>✓ Within Hospital Target</span>
                </div>
              </div>

            </div>

            {/* Waiting Queue List Card with Glassy Header & Action Buttons */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">

              <div className="p-4 sm:px-6 sm:py-4.5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-slate-50/80 via-white to-slate-50/80">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-50 border border-cyan-100 flex items-center justify-center text-cyan-700 font-black text-sm shrink-0">
                    {waitingTokens.length}
                  </div>
                  <div>
                    <h2 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                      <span>Live Waiting Queue</span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        {waitingTokens.length} in line
                      </span>
                    </h2>
                    <p className="text-[11px] text-slate-400 truncate max-w-xs sm:max-w-md">
                      Active: <span className="font-semibold text-slate-600">{activeQueue?.name}</span>
                    </p>
                  </div>
                </div>

                {waitingTokens.length > 0 && (
                  <button
                    onClick={() => serveNext()}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-xs shadow-md shadow-emerald-600/20 transition active:scale-95 cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>Call Next: {waitingTokens[0]?.tokenNumber} ({waitingTokens[0]?.patientName})</span>
                  </button>
                )}
              </div>

              {waitingTokens.length > 0 ? (
                <>
                  {/* Desktop / Tablet View: Full Polished Table */}
                  <div className="hidden sm:block overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200/70 text-[11px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50/70">
                          <th className="py-3.5 px-4 font-bold text-center w-14">Queue #</th>
                          <th className="py-3.5 px-4">Token</th>
                          <th className="py-3.5 px-4">Patient & Symptoms</th>
                          <th className="py-3.5 px-4">Triage Status</th>
                          <th className="py-3.5 px-4 text-right pr-6">Priority Reorder / Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-sm">
                        {waitingTokens.map((token, index) => {
                          const isUrgent = token.notes?.toLowerCase().includes('urgent') || token.notes?.toLowerCase().includes('senior');
                          return (
                            <tr key={token.id} className="hover:bg-cyan-50/30 transition-colors group">
                              <td className="py-4 px-4 text-center">
                                <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-black ${
                                  index === 0 ? 'bg-cyan-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600'
                                }`}>
                                  {index + 1}
                                </span>
                              </td>
                              <td className="py-4 px-4">
                                <span className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-xs font-black text-slate-900 group-hover:border-cyan-300 transition-colors">
                                  {token.tokenNumber}
                                </span>
                              </td>
                              <td className="py-4 px-4">
                                <div className="flex items-center gap-3">
                                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs border shadow-2xs shrink-0 ${getInitialColor(token.patientName)}`}>
                                    {getFirstLetter(token.patientName)}
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className="font-bold text-slate-900">{token.patientName}</span>
                                      <span className="text-xs text-slate-400">({token.age}y • {token.gender === 'F' ? 'Female' : 'Male'})</span>
                                    </div>
                                    {token.notes && (
                                      <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                                        <span className="text-slate-400">🩺</span>
                                        <span>{token.notes}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="py-4 px-4">
                                {isUrgent ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-rose-50 text-rose-700 border border-rose-200 shadow-xs">
                                    <AlertTriangle className="w-3 h-3 text-rose-600" />
                                    HIGH PRIORITY
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                    <Clock className="w-3 h-3 text-amber-500" />
                                    WAITING
                                  </span>
                                )}
                              </td>
                              <td className="py-4 px-4 text-right pr-6">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={() => moveTokenUp(token.id)}
                                    disabled={index === 0}
                                    title="Move Priority Up (Requirement 5)"
                                    className="p-2 rounded-xl border border-slate-200 hover:border-cyan-300 hover:bg-cyan-50 text-slate-600 hover:text-cyan-700 disabled:opacity-20 disabled:hover:bg-transparent cursor-pointer transition shadow-2xs"
                                  >
                                    <ArrowUp className="w-4 h-4 stroke-[2.2]" />
                                  </button>
                                  <button
                                    onClick={() => moveTokenDown(token.id)}
                                    disabled={index === waitingTokens.length - 1}
                                    title="Move Priority Down (Requirement 5)"
                                    className="p-2 rounded-xl border border-slate-200 hover:border-cyan-300 hover:bg-cyan-50 text-slate-600 hover:text-cyan-700 disabled:opacity-20 disabled:hover:bg-transparent cursor-pointer transition shadow-2xs"
                                  >
                                    <ArrowDown className="w-4 h-4 stroke-[2.2]" />
                                  </button>
                                  <button
                                    onClick={() => cancelToken(token.id)}
                                    title="Cancel Token from Queue (Requirement 7)"
                                    className="p-2 rounded-xl border border-slate-200 hover:border-rose-300 hover:bg-rose-50 text-slate-400 hover:text-rose-600 cursor-pointer transition shadow-2xs ml-1"
                                  >
                                    <XCircle className="w-4 h-4 stroke-[2.2]" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile View: High-Touch Clean Card Layout */}
                  <div className="sm:hidden divide-y divide-slate-100">
                    {waitingTokens.map((token, index) => {
                      const isUrgent = token.notes?.toLowerCase().includes('urgent') || token.notes?.toLowerCase().includes('senior');
                      return (
                        <div key={token.id} className="p-4 flex flex-col gap-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center">
                                #{index + 1}
                              </span>
                              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-xs font-extrabold text-slate-800 border border-slate-200">
                                {token.tokenNumber}
                              </span>
                              <span className="font-bold text-sm text-slate-900">{token.patientName}</span>
                            </div>
                            {isUrgent ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-50 text-rose-700 border border-rose-200">
                                Urgent
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                Waiting
                              </span>
                            )}
                          </div>

                          {token.notes && (
                            <div className="text-xs text-slate-600 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100">
                              <span className="font-semibold text-slate-400 text-[10px] uppercase block">Reason/Notes:</span>
                              {token.notes}
                            </div>
                          )}

                          {/* Mobile Action Touch Targets */}
                          <div className="flex items-center justify-between pt-1">
                            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Priority:</span>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => moveTokenUp(token.id)}
                                disabled={index === 0}
                                className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white active:bg-cyan-50 text-slate-700 text-xs font-bold flex items-center gap-1 shadow-2xs disabled:opacity-30"
                              >
                                <ArrowUp className="w-3.5 h-3.5" />
                                Up
                              </button>
                              <button
                                onClick={() => moveTokenDown(token.id)}
                                disabled={index === waitingTokens.length - 1}
                                className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white active:bg-cyan-50 text-slate-700 text-xs font-bold flex items-center gap-1 shadow-2xs disabled:opacity-30"
                              >
                                <ArrowDown className="w-3.5 h-3.5" />
                                Down
                              </button>
                              <button
                                onClick={() => cancelToken(token.id)}
                                className="p-2 rounded-xl border border-slate-200 text-rose-500 hover:bg-rose-50 active:bg-rose-100 shadow-2xs"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div className="p-10 text-center text-slate-400">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 mx-auto mb-3 flex items-center justify-center text-slate-400">
                    <Users className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-700">No Patients in Waiting Line</h3>
                  <p className="text-xs text-slate-400 mt-1">All OPD patients have been attended to or click below to register one.</p>
                </div>
              )}

            </div>

          </div>
        )}

        {/* View 3: Clinical Analytics */}
        {activeTab === 'analytics' && (
          <Analytics />
        )}

      </main>

      {/* 3. Mobile Bottom Navigation Bar (Visible only on mobile screens < 768px) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-2 z-40 flex items-center justify-around shadow-lg">
        <button
          onClick={() => setActiveTab('clinics')}
          className={`flex flex-col items-center gap-1 text-[10px] font-bold transition ${activeTab === 'clinics' ? 'text-cyan-700' : 'text-slate-400'
            }`}
        >
          <LayoutGrid className="w-5 h-5" />
          <span>Clinics</span>
        </button>

        <button
          onClick={() => setActiveTab('board')}
          className={`flex flex-col items-center gap-1 text-[10px] font-bold transition ${activeTab === 'board' ? 'text-cyan-700' : 'text-slate-400'
            }`}
        >
          <Activity className="w-5 h-5" />
          <span>Live Board</span>
        </button>

        <button
          onClick={() => setIsPatientModalOpen(true)}
          className="flex flex-col items-center -mt-5 bg-cyan-600 text-white p-2.5 rounded-full shadow-lg shadow-cyan-600/30 active:scale-95 transition"
        >
          <Plus className="w-5 h-5 stroke-[3]" />
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex flex-col items-center gap-1 text-[10px] font-bold transition ${activeTab === 'analytics' ? 'text-cyan-700' : 'text-slate-400'
            }`}
        >
          <BarChart3 className="w-5 h-5" />
          <span>Analytics</span>
        </button>
      </div>

      {/* Modals */}
      <AddPatient
        isOpen={isPatientModalOpen}
        onClose={() => setIsPatientModalOpen(false)}
      />

      <AddQueue
        isOpen={isQueueModalOpen}
        onClose={() => setIsQueueModalOpen(false)}
      />

    </div>
  );
}

export default function App() {
  return (
    <QueueProvider>
      <Dashboard />
    </QueueProvider>
  );
}