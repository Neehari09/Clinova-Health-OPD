import React, { useState } from 'react';
import { useQueue } from '../context/QueueContext';
import { X, PlusCircle, Check } from 'lucide-react';

export default function AddPatient({ isOpen, onClose }) {
    const { addToken } = useQueue();
    const [name, setName] = useState('');
    const [age, setAge] = useState('');
    const [isUrgent, setIsUrgent] = useState(false);
    const [done, setDone] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name.trim()) return;

        // Add token with optional urgent note
        addToken(
            name.trim(),
            age || 30,
            'M',
            isUrgent ? 'Senior / Urgent Triage' : 'General'
        );

        setDone(true);
        setTimeout(() => {
            setDone(false);
            setName('');
            setAge('');
            setIsUrgent(false);
            onClose();
        }, 500);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 border border-slate-200">

                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-bold text-slate-800">Add New Patient</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-3">
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Patient Name *
                        </label>
                        <input
                            type="text"
                            required
                            placeholder="e.g. Ramesh Kumar"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-cyan-500"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Age
                        </label>
                        <input
                            type="number"
                            placeholder="e.g. 45"
                            value={age}
                            onChange={(e) => setAge(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-cyan-500"
                        />
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                        <input
                            type="checkbox"
                            id="urgent"
                            checked={isUrgent}
                            onChange={(e) => setIsUrgent(e.target.checked)}
                            className="w-4 h-4 text-cyan-600 rounded-sm"
                        />
                        <label htmlFor="urgent" className="text-xs text-slate-700 font-medium">
                            Senior Citizen / Urgent Case
                        </label>
                    </div>

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
                            className="px-4 py-2 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-700 rounded-xl flex items-center gap-1.5 shadow-sm"
                        >
                            {done ? <Check className="w-4 h-4" /> : <PlusCircle className="w-4 h-4" />}
                            {done ? 'Added!' : 'Create Token'}
                        </button>
                    </div>
                </form>

            </div>
        </div>
    );
}