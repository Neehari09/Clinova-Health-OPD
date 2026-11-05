import React from 'react';

/**
 * Option 3: Stethoscope & Heart Rhythm Logo for Clinova Health
 * A modern physician's stethoscope looped into an elegant heart with an embedded ECG pulse wave.
 */
export default function StethoscopeHeartLogo({ size = 44, className = '' }) {
    return (
        <div 
            style={{ width: size, height: size }}
            className={`relative rounded-2xl bg-gradient-to-br from-cyan-500 via-teal-500 to-emerald-600 p-2 shadow-md shadow-cyan-600/25 flex items-center justify-center shrink-0 border border-white/20 ${className}`}
        >
            <svg 
                viewBox="0 0 100 100" 
                className="w-full h-full drop-shadow-xs" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
            >
                {/* 1. Stethoscope Binaural Earpieces & Upper Yoke */}
                <path 
                    d="M 32 18 C 32 14, 37 13, 39 16 C 41 20, 44 26, 47 28" 
                    stroke="white" 
                    strokeWidth="4" 
                    strokeLinecap="round"
                />
                <circle cx="32" cy="18" r="3" fill="white" />
                
                <path 
                    d="M 68 18 C 68 14, 63 13, 61 16 C 59 20, 56 26, 53 28" 
                    stroke="white" 
                    strokeWidth="4" 
                    strokeLinecap="round"
                />
                <circle cx="68" cy="18" r="3" fill="white" />

                {/* Yoke Connector */}
                <circle cx="50" cy="30" r="3.5" fill="#f0fdfa" />

                {/* 2. Tubing loops down into Heart Shape Contour */}
                <path 
                    d="M 50 32 C 50 36, 42 36, 32 40 C 20 46, 18 60, 26 71 C 33 80, 44 87, 50 92 C 56 87, 67 80, 74 71 C 82 60, 80 46, 68 40 C 58 36, 50 36, 50 32" 
                    stroke="white" 
                    strokeWidth="4.5" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                />

                {/* 3. Stethoscope Chest Piece / Diaphragm */}
                <circle cx="75" cy="52" r="7" fill="#0f766e" stroke="white" strokeWidth="2.5" />
                <circle cx="75" cy="52" r="3" fill="#a7f3d0" />

                {/* 4. Vivid Glowing ECG Lifeline Spanning the Center */}
                <path 
                    d="M 28 62 L 37 62 L 41 53 L 46 72 L 52 46 L 57 66 L 61 62 L 70 62" 
                    stroke="#ecfdf5" 
                    strokeWidth="3.5" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                />
            </svg>
        </div>
    );
}
