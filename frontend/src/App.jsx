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
  LogOut
} from 'lucide-react';

// Modals and Sub-Pages
import AddPatient from './components/AddPatient';
import AddQueue from './components/AddQueue';
import Analytics from './components/Analytics';
import Clinics from './components/Clinics';
import Login from './components/Login';

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

  // Navigation tab state: 'clinics', 'board', or 'analytics'
  const [activeTab, setActiveTab] = useState('board');

  // Modals state
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
  const [isQueueModalOpen, setIsQueueModalOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Requirement 1: If not logged in, show the Login screen
  if (!currentUser?.isLoggedIn) {
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">

      {/* 1. Hospital Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">

          {/* Logo & 3 Navigation Tabs */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-cyan-600 flex items-center justify-center text-white shadow-md shadow-cyan-600/20">
                <Activity className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div>
                <h1 className="text-base font-extrabold text-slate-900 leading-tight">
                  City Care <span className="text-cyan-600">MediQueue</span>
                </h1>
                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider -mt-0.5">
                  OPD Staff Portal
                </p>
              </div>
            </div>

            {/* 3 Navigation Tabs */}
            <nav className="hidden sm:flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/60">

              <button
                onClick={() => setActiveTab('clinics')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${activeTab === 'clinics'
                    ? 'bg-white text-cyan-800 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                  }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                Clinics Hub
              </button>

              <button
                onClick={() => setActiveTab('board')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${activeTab === 'board'
                    ? 'bg-white text-cyan-800 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                  }`}
              >
                <Activity className="w-3.5 h-3.5" />
                Live OPD Board
              </button>

              <button
                onClick={() => setActiveTab('analytics')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${activeTab === 'analytics'
                    ? 'bg-white text-cyan-800 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                  }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                Analytics & Trends
              </button>

            </nav>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-3">

            {/* Doctor Queue Dropdown (Requirements 1 & 2) */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition cursor-pointer"
              >
                <Stethoscope className="w-3.5 h-3.5 text-cyan-600" />
                <span className="max-w-[130px] sm:max-w-xs truncate">{activeQueue?.name}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-50">
                  <div className="px-2 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Switch Active Doctor Queue
                  </div>

                  <div className="space-y-1 my-1">
                    {queues.map((q) => (
                      <button
                        key={q.id}
                        onClick={() => {
                          setSelectedQueueId(q.id);
                          setDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between hover:bg-cyan-50 transition cursor-pointer ${q.id === selectedQueueId ? 'bg-cyan-50 text-cyan-700 font-bold' : 'text-slate-700'
                          }`}
                      >
                        <span className="truncate">{q.name}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                          {q.room}
                        </span>
                      </button>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-slate-100">
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        setIsQueueModalOpen(true);
                      }}
                      className="w-full text-center py-2 px-3 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-700 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer border border-teal-200"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      + Create New Doctor Queue
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* + Register Patient Button (Requirement 3) */}
            <button
              onClick={() => setIsPatientModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold text-xs rounded-xl shadow-xs transition active:scale-95 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Register Patient</span>
              <span className="sm:hidden">Add</span>
            </button>

            {/* Staff Profile Badge & Logout (Requirement 1) */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-cyan-100 text-cyan-800 flex items-center justify-center font-bold text-xs">
                NP
              </div>
              <div className="hidden xl:block text-left text-xs">
                <div className="font-semibold text-slate-800 flex items-center gap-1">
                  {currentUser.name}
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                </div>
                <div className="text-[10px] text-slate-400">{currentUser.station}</div>
              </div>

              <button
                onClick={logout}
                title="Logout from OPD Station"
                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>
      </header>

      {/* 2. Main Content Body */}
      <main className="max-w-6xl mx-auto p-4 sm:p-6">

        {/* View 1: Clinics & Queues Hub */}
        {activeTab === 'clinics' && (
          <Clinics
            onOpenQueue={(queueId) => {
              setSelectedQueueId(queueId);
              setActiveTab('board');
            }}
            onOpenAddQueue={() => setIsQueueModalOpen(true)}
          />
        )}

        {/* View 2: Live OPD Patient Queue Board */}
        {activeTab === 'board' && (
          <div className="space-y-6">

            {/* Top KPI Cards Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

              {/* Card 1: Currently in Doctor Room (Requirement 6) */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs sm:col-span-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Currently in Doctor Consultation
                  </span>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Live in {activeQueue?.room}
                  </span>
                </div>

                {currentlyServing ? (
                  <div className="flex items-center justify-between flex-wrap gap-3 mt-1">
                    <div>
                      <div className="text-2xl font-black text-cyan-800">
                        Token {currentlyServing.tokenNumber}
                      </div>
                      <div className="text-sm font-semibold text-slate-700">
                        {currentlyServing.patientName} ({currentlyServing.age}{currentlyServing.gender})
                      </div>
                    </div>

                    <button
                      onClick={() => completeActiveConsultation(currentlyServing.id)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-emerald-600 hover:text-white text-slate-700 text-xs font-semibold transition cursor-pointer"
                    >
                      <CheckCheck className="w-4 h-4" />
                      Finish Consultation
                    </button>
                  </div>
                ) : (
                  <div className="text-slate-400 italic text-sm py-2">
                    Room idle — Click "Call Next Patient" to call!
                  </div>
                )}
              </div>

              {/* Card 2: Waiting Patients (Requirement 4) */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-center">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Waiting in Hall
                </span>
                <div className="text-3xl font-black text-slate-900 mt-1">
                  {waitingTokens.length} <span className="text-sm font-semibold text-slate-500">Patients</span>
                </div>
                <span className="text-[11px] text-slate-400 mt-1">Ordered by arrival & triage</span>
              </div>

              {/* Card 3: Avg Wait Time */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-center">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Avg Consultation Time
                </span>
                <div className="text-3xl font-black text-slate-900 mt-1">
                  {analytics.avgWaitMinutes} <span className="text-sm font-semibold text-slate-500">mins</span>
                </div>
                <span className="text-[11px] text-emerald-600 font-semibold mt-1">✓ Within Hospital SLA</span>
              </div>

            </div>

            {/* Live Patient Queue Table (Requirements 4, 5, 6, 7) */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">

              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
                <div>
                  <h2 className="text-base font-bold text-slate-800">
                    Live Waiting Patients ({waitingTokens.length})
                  </h2>
                  <p className="text-xs text-slate-500">Queue for: {activeQueue?.name}</p>
                </div>

                {/* Requirement 6: Serve Next Button */}
                {waitingTokens.length > 0 && (
                  <button
                    onClick={() => serveNext()}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition active:scale-95 cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    Call Next Patient ({waitingTokens[0]?.tokenNumber})
                  </button>
                )}
              </div>

              {waitingTokens.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 text-[11px] font-bold uppercase text-slate-400 bg-slate-50/30">
                        <th className="py-3 px-4">Pos</th>
                        <th className="py-3 px-4">Token #</th>
                        <th className="py-3 px-4">Patient Details</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Triage Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                      {waitingTokens.map((token, index) => {
                        const isUrgent = token.notes?.toLowerCase().includes('urgent') || token.notes?.toLowerCase().includes('senior');
                        return (
                          <tr key={token.id} className="hover:bg-cyan-50/40 transition">

                            <td className="py-3.5 px-4 font-bold text-slate-400 text-xs">
                              #{token.position}
                            </td>

                            <td className="py-3.5 px-4 font-bold text-slate-800">
                              <span className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-xs">
                                {token.tokenNumber}
                              </span>
                            </td>

                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-slate-800">{token.patientName}</span>
                                <span className="text-xs text-slate-500">({token.age}{token.gender})</span>
                                {isUrgent && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                                    <AlertTriangle className="w-3 h-3 text-amber-600" />
                                    Triage Priority
                                  </span>
                                )}
                              </div>
                              {token.notes && (
                                <span className="text-xs text-slate-400 block mt-0.5">{token.notes}</span>
                              )}
                            </td>

                            <td className="py-3.5 px-4">
                              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                                WAITING
                              </span>
                            </td>

                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">

                                <button
                                  onClick={() => moveTokenUp(token.id)}
                                  disabled={index === 0}
                                  title="Move Up (Triage Priority)"
                                  className={`p-1.5 rounded-lg border transition cursor-pointer ${index === 0
                                      ? 'opacity-30 cursor-not-allowed border-slate-200 text-slate-400'
                                      : isUrgent
                                        ? 'border-cyan-500 bg-cyan-500 text-white hover:bg-cyan-600'
                                        : 'border-slate-200 hover:bg-cyan-50 text-slate-600'
                                    }`}
                                >
                                  <ArrowUp className="w-4 h-4" />
                                </button>

                                <button
                                  onClick={() => moveTokenDown(token.id)}
                                  disabled={index === waitingTokens.length - 1}
                                  title="Move Down"
                                  className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                                >
                                  <ArrowDown className="w-4 h-4" />
                                </button>

                                <button
                                  onClick={() => cancelToken(token.id)}
                                  title="Cancel Token"
                                  className="p-1.5 rounded-lg border border-slate-200 hover:bg-rose-50 hover:border-rose-300 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                                >
                                  <XCircle className="w-4 h-4" />
                                </button>

                              </div>
                            </td>

                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8 text-center text-slate-400 text-sm">
                  No patients waiting. Click "+ Register Patient" above to add one!
                </div>
              )}

            </div>

          </div>
        )}

        {/* View 3: Clinical Analytics & Rush Hours */}
        {activeTab === 'analytics' && (
          <Analytics />
        )}

      </main>

      {/* Patient Registration Modal (Requirement 3) */}
      <AddPatient
        isOpen={isPatientModalOpen}
        onClose={() => setIsPatientModalOpen(false)}
      />

      {/* Doctor Queue Creation Modal (Requirements 1 & 2) */}
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