import React from 'react';

export interface NeonButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary-white' | 'primary-gradient' | 'amber' | 'emerald' | 'cyan';
  size?: 'sm' | 'md' | 'lg';
  pulse?: boolean;
  shimmer?: boolean;
  fullWidth?: boolean;
  containerClassName?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const NeonButton = React.forwardRef<HTMLButtonElement, NeonButtonProps>(
  (
    {
      children,
      variant = 'primary-white',
      size = 'md',
      pulse = true,
      shimmer = true,
      fullWidth = false,
      containerClassName = '',
      className = '',
      leftIcon,
      rightIcon,
      disabled,
      ...buttonProps
    },
    ref
  ) => {
    // Determine sizing
    const sizeClasses = {
      sm: 'px-4 py-2 text-xs font-bold rounded-xl gap-2',
      md: 'px-6 py-3.5 text-xs sm:text-sm font-black rounded-xl gap-2.5',
      lg: 'px-7 py-4 text-sm font-black rounded-xl gap-3',
    }[size];

    // Variant-specific styling for Aura, Halo border, and Button surface
    const variantStyles = {
      'primary-white': {
        aura: 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-80 group-hover/neon-btn:opacity-100 group-hover/neon-btn:blur-lg',
        halo: 'border-2 border-indigo-400/90 shadow-[0_0_15px_rgba(99,102,241,0.8),0_0_30px_rgba(168,85,247,0.5)]',
        button:
          'bg-white text-indigo-900 hover:bg-slate-50 border-2 border-indigo-400/90 shadow-[0_0_20px_rgba(99,102,241,0.6),0_0_35px_rgba(168,85,247,0.4)] hover:shadow-[0_0_30px_rgba(99,102,241,0.9),0_0_55px_rgba(236,72,153,0.7)] hover:border-pink-400',
        shimmer: 'via-indigo-500/25',
      },
      'primary-gradient': {
        aura: 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-70 group-hover/neon-btn:opacity-100 group-hover/neon-btn:blur-lg',
        halo: 'border-2 border-indigo-300/80 shadow-[0_0_15px_rgba(99,102,241,0.7),0_0_30px_rgba(168,85,247,0.45)]',
        button:
          'bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600 hover:from-indigo-500 hover:via-purple-500 hover:to-violet-500 text-white border-2 border-indigo-300/90 shadow-[0_0_18px_rgba(99,102,241,0.65),0_0_35px_rgba(168,85,247,0.4)] hover:shadow-[0_0_30px_rgba(99,102,241,0.95),0_0_55px_rgba(236,72,153,0.7)] hover:border-pink-300',
        shimmer: 'via-white/30',
      },
      amber: {
        aura: 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 opacity-70 group-hover/neon-btn:opacity-100 group-hover/neon-btn:blur-lg',
        halo: 'border-2 border-amber-300/80 shadow-[0_0_15px_rgba(245,158,11,0.75),0_0_30px_rgba(234,88,12,0.45)]',
        button:
          'bg-gradient-to-r from-amber-600 via-orange-600 to-amber-600 hover:from-amber-500 hover:to-orange-500 text-white border-2 border-amber-300/90 shadow-[0_0_18px_rgba(245,158,11,0.65),0_0_35px_rgba(234,88,12,0.4)] hover:shadow-[0_0_30px_rgba(245,158,11,0.95),0_0_55px_rgba(249,115,22,0.7)] hover:border-yellow-300',
        shimmer: 'via-white/30',
      },
      emerald: {
        aura: 'bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 opacity-70 group-hover/neon-btn:opacity-100 group-hover/neon-btn:blur-lg',
        halo: 'border-2 border-emerald-300/80 shadow-[0_0_15px_rgba(16,185,129,0.75),0_0_30px_rgba(20,184,166,0.45)]',
        button:
          'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white border-2 border-emerald-300/90 shadow-[0_0_18px_rgba(16,185,129,0.65),0_0_35px_rgba(20,184,166,0.4)] hover:shadow-[0_0_30px_rgba(16,185,129,0.95),0_0_55px_rgba(6,182,212,0.7)] hover:border-emerald-200',
        shimmer: 'via-white/30',
      },
      cyan: {
        aura: 'bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 opacity-70 group-hover/neon-btn:opacity-100 group-hover/neon-btn:blur-lg',
        halo: 'border-2 border-cyan-300/80 shadow-[0_0_15px_rgba(6,182,212,0.75),0_0_30px_rgba(59,130,246,0.45)]',
        button:
          'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white border-2 border-cyan-300/90 shadow-[0_0_18px_rgba(6,182,212,0.65),0_0_35px_rgba(59,130,246,0.4)] hover:shadow-[0_0_30px_rgba(6,182,212,0.95),0_0_55px_rgba(99,102,241,0.7)] hover:border-cyan-200',
        shimmer: 'via-white/30',
      },
    }[variant];

    return (
      <div
        className={`relative group/neon-btn inline-block ${
          fullWidth ? 'w-full' : ''
        } ${containerClassName}`}
      >
        {/* Outer Pulsing Neon Glow Aura */}
        <div
          className={`absolute -inset-1 rounded-2xl blur-md pointer-events-none transition-all duration-300 ${
            variantStyles.aura
          } ${pulse && !disabled ? 'animate-pulse' : ''}`}
        />

        {/* Neon Border Halo with Pulse Effect */}
        <div
          className={`absolute -inset-0.5 rounded-xl pointer-events-none transition-all duration-300 ${
            variantStyles.halo
          } ${pulse && !disabled ? 'animate-pulse' : ''}`}
        />

        {/* Core Button with Glowing Box-Shadow on Hover and Border */}
        <button
          ref={ref}
          disabled={disabled}
          className={`relative ${
            fullWidth ? 'w-full' : ''
          } ${sizeClasses} ${variantStyles.button} transition-all duration-200 flex items-center justify-center overflow-hidden cursor-pointer group-hover/neon-btn:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 ${className}`}
          {...buttonProps}
        >
          {/* Moving Shimmer Sheen on Hover */}
          {shimmer && !disabled && (
            <span
              className={`absolute inset-0 -translate-x-full group-hover/neon-btn:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent ${variantStyles.shimmer} to-transparent pointer-events-none`}
            />
          )}

          {leftIcon && <span className="shrink-0">{leftIcon}</span>}
          <span className="relative z-10">{children}</span>
          {rightIcon && <span className="shrink-0">{rightIcon}</span>}
        </button>
      </div>
    );
  }
);

NeonButton.displayName = 'NeonButton';

export default NeonButton;
