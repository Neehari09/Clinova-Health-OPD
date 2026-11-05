import React from 'react';

/**
 * Option 3: Stethoscope & Heart Rhythm Logo for Clinova Health
 * Exact match to the concept design:
 * - Pure clean white background (no colored gradient block)
 * - Deep teal / cyan stethoscope on the left forming earpieces & chest piece
 * - Looping into a turquoise heart contour in the center
 * - Flowing smoothly into an emerald-green ECG pulse rhythm on the right
 */
export default function StethoscopeHeartLogo({ size = 52, className = '' }) {
    // Aspect ratio 140 width x 70 height gives the exact horizontal balance shown in Option 3 card
    const width = Math.round(size * 1.6);
    const height = size;

    return (
        <div 
            style={{ width, height }}
            className={`inline-flex items-center justify-center shrink-0 bg-transparent ${className}`}
        >
            <svg 
                viewBox="0 0 160 80" 
                className="w-full h-full" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
            >
                {/* 1. LEFT: Stethoscope Binaural Headset & Earpieces (Deep Teal #0e7490) */}
                {/* Left Earpiece & Binaural Tube */}
                <path 
                    d="M 22 18 C 22 25, 26 35, 34 38" 
                    stroke="#0891b2" 
                    strokeWidth="3.5" 
                    strokeLinecap="round"
                />
                <circle cx="21" cy="17" r="2.5" fill="#0e7490" />

                {/* Right Earpiece & Binaural Tube */}
                <path 
                    d="M 38 18 C 38 24, 37 32, 34 38" 
                    stroke="#0891b2" 
                    strokeWidth="3.5" 
                    strokeLinecap="round"
                />
                <circle cx="39" cy="17" r="2.5" fill="#0e7490" />

                {/* Flexible Stethoscope Tubing curving down from headset */}
                <path 
                    d="M 34 38 C 34 48, 25 56, 32 66 C 36 71, 46 72, 54 67" 
                    stroke="#0891b2" 
                    strokeWidth="3.8" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                />

                {/* 2. CENTER: Heart Shape (Vibrant Medical Turquoise/Teal #0d9488) */}
                <path 
                    d="M 54 67 C 62 61, 74 46, 74 34 C 74 23, 62 21, 56 30 C 50 21, 38 23, 38 34 C 38 43, 46 54, 56 67" 
                    stroke="#0d9488" 
                    strokeWidth="4" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                />

                {/* Tubing loop connecting towards the chest piece / diaphragm */}
                <path 
                    d="M 56 67 C 62 74, 76 74, 82 66 C 88 58, 86 48, 80 44" 
                    stroke="#0891b2" 
                    strokeWidth="3.5" 
                    strokeLinecap="round"
                />

                {/* Stethoscope Chest Piece / Bell & Diaphragm */}
                <circle cx="80" cy="44" r="5" fill="#0e7490" stroke="#0891b2" strokeWidth="1.5" />
                <circle cx="80" cy="44" r="2" fill="#67e8f9" />

                {/* 3. RIGHT: Vivid Lifeline ECG Cardiogram Pulse Wave (Emerald Green #10b981) */}
                <path 
                    d="M 74 46 L 86 46 L 90 37 L 95 56 L 102 24 L 108 50 L 113 46 L 132 46" 
                    stroke="#10b981" 
                    strokeWidth="3.8" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                />
            </svg>
        </div>
    );
}
