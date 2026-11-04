import React, { useState } from 'react';
import { useQueue } from '../context/QueueContext';
import { X, Stethoscope, Check } from 'lucide-react';

export default function AddQueue({ isOpen, onClose }) {
    const { createQueue } = useQueue();
    const [doctorName, setDoctorName] = useState('');
    const [department, setDepartment] = useState('General Medicine');
    const [room, setRoom] = useState('');
    const [done, setDone] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!doctorName.trim()) return;

        // Build the full display name (Requirement 2: Each queue has a name)
        const fullName = `${doctorName.trim()} - ${department} (${room ? `Room ${room}` : 'OPD'})`;

        // Call createQueue from QueueContext
        createQueue(fullName, department, room ? `Room ${room}` : 'Room 105');

        setDone(true);
        setTimeout(() => {
            setDone(false);
            setDoctorName('');
            setRoom('');
            onClose();
        }, 500);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 border border-slate-200">

                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center">
                            <Stethoscope className="w-4 h-4" />
                        </div>
                        <h3 className="text-base font-bold text-slate-800">Create Doctor Queue</h3>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-3">

                    {/* Doctor / Clinic Name */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Doctor / Queue Name *
                        </label>
                        <input
                            type="text"
                            required
                            placeholder="e.g. Dr. Rajesh Verma"
                            value={doctorName}
                            onChange={(e) => setDoctorName(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                        />
                    </div>

                    {/* Department */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Department
                        </label>
                        <select
                            value={department}
                            onChange={(e) => setDepartment(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-500 bg-white"
                        >
                            <option value="General Medicine">General Medicine</option>
                            <option value="Pediatrics & Child Care">Pediatrics & Child Care</option>
                            <option value="Cardiology">Cardiology</option>
                            <option value="Orthopedics">Orthopedics</option>
                            <option value="Diagnostics & Lab">Diagnostics & Lab</option>
                        </select>
                    </div>

                    {/* Room Number */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Room / Counter Number
                        </label>
                        <input
                            type="text"
                            placeholder="e.g. 105 or Room 202"
                            value={room}
                            onChange={(e) => setRoom(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                        />
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-end gap-2 pt-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl flex items-center gap-1.5 shadow-sm"
                        >
                            {done ? <Check className="w-4 h-4" /> : <Stethoscope className="w-4 h-4" />}
                            {done ? 'Created!' : 'Add Queue'}
                        </button>
                    </div>

                </form>

            </div>
        </div>
    );
}