import React from 'react';

export interface AmbientGlowProps {
  variant?: 'hero' | 'aurora' | 'amber' | 'subtle';
  intensity?: 'low' | 'medium' | 'high';
  pulseSpeed?: 'slow' | 'slower' | 'drift';
  showGrid?: boolean;
  showOrbs?: boolean;
  className?: string;
}

/**
 * AmbientGlow Component
 * A CSS-based atmospheric ambient glow component featuring a large,
 * semi-transparent radial gradient that pulses slowly in the background
 * to add immersive spatial depth.
 */
export const AmbientGlow: React.FC<AmbientGlowProps> = ({
  variant = 'hero',
  intensity = 'medium',
  pulseSpeed = 'slow',
  showGrid = true,
  showOrbs = true,
  className = '',
}) => {
  // Opacity intensity mapping
  const intensityMap = {
    low: 'opacity-40',
    medium: 'opacity-70',
    high: 'opacity-90',
  }[intensity];

  // Animation timing class
  const pulseClass = {
    slow: 'animate-ambient-slow',
    slower: 'animate-ambient-slower',
    drift: 'animate-ambient-drift',
  }[pulseSpeed];

  // Variant radial gradient configurations
  const variantGradients = {
    hero: {
      primaryRadial:
        'radial-gradient(ellipse 80% 65% at 50% 35%, rgba(99, 102, 241, 0.32) 0%, rgba(139, 92, 246, 0.20) 38%, rgba(236, 72, 153, 0.10) 65%, transparent 80%)',
      orb1: 'bg-indigo-500/25',
      orb2: 'bg-purple-500/25',
      orb3: 'bg-cyan-500/18',
    },
    aurora: {
      primaryRadial:
        'radial-gradient(ellipse 80% 65% at 50% 35%, rgba(16, 185, 129, 0.28) 0%, rgba(6, 182, 212, 0.20) 38%, rgba(99, 102, 241, 0.10) 65%, transparent 80%)',
      orb1: 'bg-teal-500/25',
      orb2: 'bg-emerald-500/25',
      orb3: 'bg-cyan-500/20',
    },
    amber: {
      primaryRadial:
        'radial-gradient(ellipse 80% 65% at 50% 35%, rgba(245, 158, 11, 0.28) 0%, rgba(249, 115, 22, 0.20) 38%, rgba(239, 68, 68, 0.10) 65%, transparent 80%)',
      orb1: 'bg-amber-500/25',
      orb2: 'bg-orange-500/25',
      orb3: 'bg-rose-500/18',
    },
    subtle: {
      primaryRadial:
        'radial-gradient(ellipse 70% 55% at 50% 40%, rgba(99, 102, 241, 0.18) 0%, rgba(148, 163, 184, 0.10) 45%, transparent 75%)',
      orb1: 'bg-indigo-500/15',
      orb2: 'bg-slate-400/15',
      orb3: 'bg-violet-500/12',
    },
  }[variant];

  return (
    <div
      aria-hidden="true"
      className={`absolute inset-0 overflow-hidden pointer-events-none select-none z-0 ${className}`}
    >
      {/* 1. Large CSS-based semi-transparent radial gradient container that pulses slowly */}
      <div
        className={`absolute -inset-[15%] w-[130%] h-[130%] ${intensityMap} ${pulseClass} transition-opacity duration-1000`}
        style={{
          background: variantGradients.primaryRadial,
        }}
      />

      {/* 2. Secondary orbiting radial orbs for 3D multi-planar depth */}
      {showOrbs && (
        <>
          {/* Top-Right Ambient Orb with slow pulse */}
          <div
            className={`absolute -top-32 -right-24 w-[32rem] h-[32rem] rounded-full blur-3xl ${variantGradients.orb1} ${pulseClass}`}
            style={{ animationDelay: '0s' }}
          />

          {/* Bottom-Left Ambient Orb with staggered timing */}
          <div
            className={`absolute -bottom-36 -left-20 w-[30rem] h-[30rem] rounded-full blur-3xl ${variantGradients.orb2} animate-ambient-slower`}
            style={{ animationDelay: '3s' }}
          />

          {/* Center-Left Secondary Soft Glow Accent */}
          <div
            className={`absolute top-1/3 left-1/4 w-72 h-72 rounded-full blur-3xl ${variantGradients.orb3} opacity-50 animate-ambient-drift`}
            style={{ animationDelay: '1.5s' }}
          />
        </>
      )}

      {/* 3. Subtle architectural dot grid texture to catch radial light */}
      {showGrid && (
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff07_1px,transparent_1px),linear-gradient(to_bottom,#ffffff07_1px,transparent_1px)] bg-[size:28px_28px] opacity-60" />
      )}

      {/* 4. Bottom feathering gradient to blend smoothly into surrounding sections */}
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-950/60 via-slate-950/20 to-transparent" />
    </div>
  );
};

export default AmbientGlow;
