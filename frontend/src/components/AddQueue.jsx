import React, { useState } from 'react';
import { useQueue } from '../context/QueueContext';
import { X, Stethoscope, Check } from 'lucide-react';
import { getDoctorAvatar } from '../utils/avatarUtils';

export default function AddQueue({ isOpen, onClose }) {
    const { createQueue } = useQueue();
    const [doctorName, setDoctorName] = useState('');
    const [gender, setGender] = useState('M'); // <-- Doctor Gender
    const [department, setDepartment] = useState('General Physician');
    const [room, setRoom] = useState('');
    const [done, setDone] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!doctorName.trim()) return;

        const fullName = `${doctorName.trim()} - ${department} (${room ? `Room ${room}` : 'OPD'})`;
        createQueue(fullName, department, room ? `Room ${room}` : 'Room 105');

        setDone(true);
        setTimeout(() => {
            setDone(false);
            setDoctorName('');
            setRoom('');
            setGender('M');
            onClose();
        }, 500);
    };

    const previewDoctorAvatar = getDoctorAvatar(gender === 'F' ? 'Anita' : doctorName, doctorName.length || 1);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 border border-slate-200">

                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <img
                            src={previewDoctorAvatar}
                            alt="Doctor Avatar"
                            className="w-10 h-10 rounded-full object-cover border-2 border-teal-500 shadow-xs"
                        />
                        <div>
                            <h3 className="text-base font-extrabold text-slate-800">Create Doctor Queue</h3>
                            <p className="text-[11px] text-slate-400">Launch a new clinical counter</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-3.5">

                    {/* Doctor Name */}
                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                            Doctor / Queue Name *
                        </label>
                        <input
                            type="text"
                            required
                            placeholder="e.g. Dr. Srikanth or Dr. Anita Roy"
                            value={doctorName}
                            onChange={(e) => setDoctorName(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                        />
                    </div>

                    {/* Doctor Gender Toggle */}
                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                            Doctor Gender (For Avatar) *
                        </label>
                        <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-slate-100 border border-slate-200">
                            <button
                                type="button"
                                onClick={() => setGender('M')}
                                className={`py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                                    gender === 'M' ? 'bg-white text-teal-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                                }`}
                            >
                                <span>👨‍⚕️ Male Doctor</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setGender('F')}
                                className={`py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                                    gender === 'F' ? 'bg-white text-teal-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                                }`}
                            >
                                <span>👩‍⚕️ Female Doctor</span>
                            </button>
                        </div>
                    </div>

                    {/* Department Dropdown */}
                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                            Department
                        </label>
                        <select
                            value={department}
                            onChange={(e) => setDepartment(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-hidden focus:ring-2 focus:ring-teal-500 bg-white"
                        >
                            <option value="General Physician">General Physician</option>
                            <option value="General Medicine">General Medicine</option>
                            <option value="Cardiology">Cardiology</option>
                            <option value="Pediatrics">Pediatrics</option>
                            <option value="Orthopedics">Orthopedics</option>
                            <option value="Pathology & Lab">Pathology & Lab</option>
                            <option value="Dermatology">Dermatology</option>
                        </select>
                    </div>

                    {/* Room / Counter Number */}
                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                            Room / Counter Number
                        </label>
                        <input
                            type="text"
                            placeholder="e.g. 202 or Counter 4"
                            value={room}
                            onChange={(e) => setRoom(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                        />
                    </div>

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
                            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-teal-600/20 transition active:scale-95 cursor-pointer"
                        >
                            {done ? (
                                <>
                                    <Check className="w-4 h-4 stroke-[3]" />
                                    <span>Queue Created!</span>
                                </>
                            ) : (
                                <>
                                    <Stethoscope className="w-4 h-4" />
                                    <span>Add Queue</span>
                                </>
                            )}
                        </button>
                    </div>

                </form>

            </div>
        </div>
    );
}
