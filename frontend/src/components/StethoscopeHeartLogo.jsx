import React from 'react';

/**
 * Option 3: Exact Stethoscope & Heart Rhythm Logo from Card 3
 * Uses the exact high-resolution transparent asset extracted directly from the Option 3 design.
 */
export default function StethoscopeHeartLogo({ size = 48, className = '' }) {
    return (
        <img
            src="/clinova_logo_option3.png"
            alt="Clinova Health Stethoscope Logo"
            style={{ height: size, width: 'auto' }}
            className={`object-contain shrink-0 select-none ${className}`}
        />
    );
}
