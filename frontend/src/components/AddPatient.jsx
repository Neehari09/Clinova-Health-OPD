import React, { useState, useEffect, useMemo } from 'react';
import { useQueue } from '../context/QueueContext';
import { X, PlusCircle, Check, Stethoscope, Tag, Sparkles, Clock } from 'lucide-react';
import { getFirstLetter, getInitialColor } from '../utils/avatarUtils';

export default function AddPatient({ isOpen, onClose }) {
    const { addToken, queues, selectedQueueId } = useQueue();
    const [doctorQueueId, setDoctorQueueId] = useState(selectedQueueId || '');
    const [tokenNumber, setTokenNumber] = useState('');
    const [isTokenManual, setIsTokenManual] = useState(false);
    const [registrationTime, setRegistrationTime] = useState('');
    const [name, setName] = useState('');
    const [age, setAge] = useState('');
    const [gender, setGender] = useState('M');
    const [symptoms, setSymptoms] = useState('');
    const [isUrgent, setIsUrgent] = useState(false);
    const [done, setDone] = useState(false);

    // Live clock ticker for the registration time input
    useEffect(() => {
        const updateClock = () => {
            const now = new Date();
            setRegistrationTime(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }));
        };
        updateClock();
        const timer = setInterval(updateClock, 1000);
        return () => clearInterval(timer);
    }, [isOpen]);

    useEffect(() => {
        if (selectedQueueId) {
            setDoctorQueueId(selectedQueueId);
        } else if (queues && queues.length > 0) {
            setDoctorQueueId(queues[0].id);
        }
    }, [selectedQueueId, queues, isOpen]);

    // Active selected queue info
    const selectedQueue = useMemo(() => {
        return queues.find((q) => q.id === Number(doctorQueueId)) || queues[0];
    }, [queues, doctorQueueId]);

    // Department prefix & last token lookup (Starting from 01 sequence)
    const deptInfo = useMemo(() => {
        if (selectedQueue?.next_token_preview) {
            return selectedQueue.next_token_preview;
        }
        const dept = (selectedQueue?.department || '').toLowerCase();
        const nameLow = (selectedQueue?.name || '').toLowerCase();
        let prefix = 'GP';
        let last = 26;

        if (dept.includes('ped') || nameLow.includes('ped')) {
            prefix = 'PED';
            last = 27;
        } else if (dept.includes('ortho') || nameLow.includes('ortho')) {
            prefix = 'ORT';
            last = 26;
        } else if (dept.includes('card') || nameLow.includes('card')) {
            prefix = 'CARD';
            last = 26;
        } else if (dept.includes('diag') || dept.includes('path') || nameLow.includes('pathology')) {
            prefix = 'LAB';
            last = 26;
        }

        const nextNum = last + 1;
        return {
            prefix,
            last_token: `${prefix}${String(last).padStart(2, '0')}`,
            next_token: `${prefix}${String(nextNum).padStart(2, '0')}`
        };
    }, [selectedQueue]);

    useEffect(() => {
        if (!isTokenManual && deptInfo?.next_token) {
            setTokenNumber(deptInfo.next_token);
        }
    }, [deptInfo, isTokenManual, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim()) return;

        const finalToken = (tokenNumber || deptInfo.next_token).trim().toUpperCase();

        const notesText = isUrgent
            ? `Senior / Urgent Triage ${symptoms ? `(${symptoms})` : ''} • Reg: ${registrationTime}`
            : `${symptoms ? `${symptoms} • ` : ''}Reg: ${registrationTime}`;

        await addToken(
            name.trim(),
            age || 30,
            gender,
            notesText,
            doctorQueueId || selectedQueueId,
            finalToken
        );

        setDone(true);
        setTimeout(() => {
            setDone(false);
            setName('');
            setTokenNumber('');
            setIsTokenManual(false);
            setAge('');
            setGender('M');
            setSymptoms('');
            setIsUrgent(false);
            onClose();
        }, 500);
    };

    const initial = getFirstLetter(name || 'Patient');
    const badgeColor = getInitialColor(name || 'Patient');

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 border border-slate-200">

                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-black text-sm shadow-xs ${badgeColor}`}>
                            {initial}
                        </div>
                        <div>
                            <h3 className="text-base font-extrabold text-slate-900">Register New Patient</h3>
                            <p className="text-[11px] text-slate-400">Issue an OPD Token & Add to Waiting Queue</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-3.5">

                    {/* 1. Doctor / Clinic Queue Selection */}
                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                            <Stethoscope className="w-3.5 h-3.5 text-cyan-600" />
                            <span>Select Doctor / Department *</span>
                        </label>
                        <select
                            value={doctorQueueId}
                            onChange={(e) => {
                                setDoctorQueueId(Number(e.target.value));
                                setIsTokenManual(false);
                            }}
                            required
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-cyan-500 bg-white"
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

                    {/* 2. Token Number & Live Registration Time Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                        {/* Token Input with Last Token Hint */}
                        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                            <div className="flex items-center justify-between mb-1">
                                <label className="block text-[11px] font-extrabold text-slate-800 flex items-center gap-1">
                                    <Tag className="w-3 h-3 text-cyan-600" />
                                    <span>Token # *</span>
                                </label>
                                <span className="text-[10px] font-bold text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                                    Last: <strong className="text-cyan-700">{deptInfo?.last_token}</strong>
                                </span>
                            </div>
                            <input
                                type="text"
                                required
                                value={tokenNumber}
                                onChange={(e) => {
                                    setTokenNumber(e.target.value.toUpperCase());
                                    setIsTokenManual(true);
                                }}
                                placeholder={`e.g. ${deptInfo?.next_token}`}
                                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-black text-slate-900 tracking-wider focus:outline-hidden focus:ring-2 focus:ring-cyan-500 uppercase"
                            />
                        </div>

                        {/* Live Registration Time Field */}
                        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                            <label className="block text-[11px] font-extrabold text-slate-800 mb-1 flex items-center gap-1">
                                <Clock className="w-3 h-3 text-cyan-600" />
                                <span>Live Registration Time *</span>
                            </label>
                            <input
                                type="text"
                                value={registrationTime}
                                onChange={(e) => setRegistrationTime(e.target.value)}
                                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-bold text-cyan-900 focus:outline-hidden focus:ring-2 focus:ring-cyan-500"
                            />
                        </div>

                    </div>

                    {/* 3. Patient Name Input */}
                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                            Patient Name *
                        </label>
                        <input
                            type="text"
                            required
                            placeholder="e.g. Aarav, Ananya, or Rudransh"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-hidden focus:ring-2 focus:ring-cyan-500"
                        />
                    </div>

                    {/* 4. Age and Gender Selection Grid */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                                Age
                            </label>
                            <input
                                type="number"
                                placeholder="e.g. 28"
                                min="1"
                                max="120"
                                value={age}
                                onChange={(e) => setAge(e.target.value)}
                                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-hidden focus:ring-2 focus:ring-cyan-500"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                                Gender *
                            </label>
                            <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-slate-100 border border-slate-200">
                                <button
                                    type="button"
                                    onClick={() => setGender('M')}
                                    className={`py-1 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                                        gender === 'M' ? 'bg-white text-cyan-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                                    }`}
                                >
                                    <span>👨 Male</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setGender('F')}
                                    className={`py-1 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                                        gender === 'F' ? 'bg-white text-cyan-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                                    }`}
                                >
                                    <span>👩 Female</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* 5. Symptoms / Chief Complaint */}
                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                            Patient Suffering / Symptoms
                        </label>
                        <input
                            type="text"
                            placeholder="e.g. Fever, Cough, Knee Pain, Routine Check"
                            value={symptoms}
                            onChange={(e) => setSymptoms(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-hidden focus:ring-2 focus:ring-cyan-500"
                        />
                    </div>

                    {/* 6. Urgent Case Checkbox */}
                    <label className="flex items-center gap-2 cursor-pointer pt-1">
                        <input
                            type="checkbox"
                            checked={isUrgent}
                            onChange={(e) => setIsUrgent(e.target.checked)}
                            className="w-4 h-4 rounded text-cyan-600 focus:ring-cyan-500 border-slate-300 cursor-pointer"
                        />
                        <span className="text-xs font-semibold text-slate-700 select-none">
                            Senior Citizen / High Urgent Case
                        </span>
                    </label>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-3.5 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={done}
                            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 text-white font-bold text-xs rounded-xl shadow-md shadow-cyan-600/20 transition active:scale-95 cursor-pointer"
                        >
                            {done ? (
                                <>
                                    <Check className="w-4 h-4 stroke-[3]" />
                                    <span>Registered {tokenNumber}!</span>
                                </>
                            ) : (
                                <>
                                    <PlusCircle className="w-4 h-4" />
                                    <span>Register Token {tokenNumber || deptInfo?.next_token}</span>
                                </>
                            )}
                        </button>
                    </div>

                </form>

            </div>
        </div>
    );
}
