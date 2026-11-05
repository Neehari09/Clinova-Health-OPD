// Reliable Avatar and Initial Badge Utilities

// Doctor Portraits
const DOCTOR_ASHWIN_AVATAR = 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80';
const DOCTOR_SRIKANTH_AVATAR = 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&auto=format&fit=crop&q=80';
const DOCTOR_RAJESH_AVATAR = 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150&auto=format&fit=crop&q=80';
const DOCTOR_ANITA_AVATAR = 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80';
const PATHOLOGY_LAB_AVATAR = 'https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=150&auto=format&fit=crop&q=80';

// Color themes for Initial Badges
const BADGE_COLORS = [
    'bg-cyan-100 text-cyan-800 border-cyan-200',
    'bg-teal-100 text-teal-800 border-teal-200',
    'bg-indigo-100 text-indigo-800 border-indigo-200',
    'bg-amber-100 text-amber-800 border-amber-200',
    'bg-rose-100 text-rose-800 border-rose-200',
    'bg-purple-100 text-purple-800 border-purple-200',
    'bg-emerald-100 text-emerald-800 border-emerald-200',
];

export const getInitialColor = (name = '') => {
    const charCode = (name || 'P').charCodeAt(0);
    return BADGE_COLORS[charCode % BADGE_COLORS.length];
};

export const getFirstLetter = (name = '') => {
    return (name || 'P').trim().charAt(0).toUpperCase();
};

export const getDoctorAvatar = (name = '', id = 0) => {
    const lower = (name || '').toLowerCase();

    // Pathology Lab
    if (lower.includes('pathology') || lower.includes('blood') || lower.includes('sample') || lower.includes('lab')) {
        return PATHOLOGY_LAB_AVATAR;
    }

    // Dr. Anita
    if (lower.includes('anita') || lower.includes('anitha')) {
        return DOCTOR_ANITA_AVATAR;
    }

    // Dr. Ashwin
    if (lower.includes('ashwin')) {
        return DOCTOR_ASHWIN_AVATAR;
    }

    // Dr. Srikanth
    if (lower.includes('srikanth')) {
        return DOCTOR_SRIKANTH_AVATAR;
    }

    // Dr. Rajesh Verma
    if (lower.includes('rajesh')) {
        return DOCTOR_RAJESH_AVATAR;
    }

    return DOCTOR_ASHWIN_AVATAR;
};
