import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Sun, Moon, User, LogOut } from 'lucide-react';
import { NeonButton } from './NeonButton';

interface NavbarProps {
  onOpenAuthModal?: () => void;
  onNavigate?: (page: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAuthModal, onNavigate }) => {
  const { theme, toggleTheme } = useTheme();
  const { user, profile, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Logo */}
        <div 
          onClick={() => onNavigate?.('dashboard')} 
          className="flex items-center gap-3 cursor-pointer select-none"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white font-bold text-xl shadow-md shadow-indigo-500/20">
            AI
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
            AI Darslar
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition-colors cursor-pointer"
            title="Mavzuni o'zgartirish"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-indigo-600" />}
          </button>

          {/* User Auth / Profile */}
          {user ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigate?.('profile')}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full overflow-hidden bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-semibold text-sm">
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    profile?.first_name?.[0] || 'U'
                  )}
                </div>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200 hidden sm:inline">
                  {profile?.first_name || 'Foydalanuvchi'}
                </span>
              </button>

              <button
                onClick={signOut}
                className="p-2.5 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 border border-rose-200 dark:border-rose-900/40 transition-colors cursor-pointer"
                title="Chiqish"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <NeonButton
              onClick={onOpenAuthModal}
              variant="primary-gradient"
              size="sm"
              leftIcon={<User className="w-4 h-4" />}
            >
              <span>Kirish</span>
            </NeonButton>
          )}
        </div>
      </div>
    </header>
  );
};
