import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  Moon,
  Sun,
  Sparkles,
  User,
  Info,
  Bell,
  Pin,
  ExternalLink,
  Volume2,
  VolumeX,
  Search,
  X,
} from 'lucide-react';

import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useAnnouncements } from '../../context/AnnouncementContext';
import { isSoundEnabled, toggleSoundEnabled, playNotificationSound } from '../../utils/audio';
import { GlobalSearch } from '../common/GlobalSearch';
import { ActiveRoute } from '../../types';

interface NavbarProps {
  onToggleSidebar?: () => void;
  activeRoute?: ActiveRoute;
  onRouteChange?: (route: ActiveRoute) => void;
  onOpenAuthModal?: () => void;
  onNavigate?: (page: string) => void;
  onOpenContactModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onToggleSidebar,
  activeRoute = 'dashboard',
  onRouteChange,
  onOpenAuthModal,
  onNavigate,
}) => {
  const { currentUser, user, profile } = useAuth();
  const activeUser = currentUser || user;
  const { theme, toggleTheme } = useTheme();
  const { announcements, unreadCount, readIds, markAsRead, markAllAsRead } = useAnnouncements();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [soundOn, setSoundOn] = useState<boolean>(() => isSoundEnabled());
  const notifRef = useRef<HTMLDivElement | null>(null);

  // Sync sound preference
  useEffect(() => {
    const handleSoundChange = (e: Event) => {
      const customEvent = e as CustomEvent<boolean>;
      if (customEvent.detail !== undefined) {
        setSoundOn(customEvent.detail);
      } else {
        setSoundOn(isSoundEnabled());
      }
    };
    window.addEventListener('sound_preference_changed', handleSoundChange);
    return () => window.removeEventListener('sound_preference_changed', handleSoundChange);
  }, []);

  const handleToggleSound = () => {
    const nextState = toggleSoundEnabled();
    setSoundOn(nextState);
    if (nextState) {
      playNotificationSound('chime', true);
    }
  };

  const handleNav = (target: string) => {
    if (onRouteChange) {
      onRouteChange(target as ActiveRoute);
    }
    if (onNavigate) {
      onNavigate(target);
    }
  };

  // Listen for flying announcement landing on bell
  const [isBellHighlight, setIsBellHighlight] = useState(false);

  useEffect(() => {
    const handleHighlight = () => {
      setIsBellHighlight(true);
      setTimeout(() => setIsBellHighlight(false), 3500);
    };
    window.addEventListener('highlight_notification_bell', handleHighlight);
    return () => window.removeEventListener('highlight_notification_bell', handleHighlight);
  }, []);

  // Close notifications dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header
      id="global-navbar"
      className="safe-top sticky top-0 z-40 w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors"
    >
      <div className="max-w-7xl mx-auto safe-x px-2.5 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-1.5 sm:gap-4">
        {/* Left: Hamburger & Logo */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0 min-w-0">
          {onToggleSidebar && (
            <button
              id="hamburger-menu-btn"
              onClick={onToggleSidebar}
              className="p-2 sm:p-2.5 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 transition-colors flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer shrink-0"
              aria-label="Menyuni ochish"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          {/* Dynamic Glowing AI Darslar Logo */}
          <div 
            id="navbar-glowing-logo"
            onClick={() => handleNav('dashboard')} 
            className="group flex items-center gap-1.5 sm:gap-3 cursor-pointer select-none min-w-0"
          >
            {/* Logo Icon with Ambient Glow Aura */}
            <div className="relative flex items-center justify-center shrink-0">
              {/* Soft Ambient Halo Aura */}
              <div className="absolute -inset-1 bg-gradient-to-tr from-indigo-500 via-violet-500 to-purple-500 rounded-2xl blur-md opacity-40 dark:opacity-55 group-hover:opacity-85 transition-opacity duration-300 group-hover:scale-105" />

              {/* Logo Icon Badge */}
              <div className="relative flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-purple-600 text-white font-black text-sm sm:text-base shadow-md shadow-indigo-500/25 ring-1 ring-white/25 overflow-hidden">
                {/* Subtle top gloss shine */}
                <div className="absolute inset-x-0 top-0 h-1/2 bg-white/20 rounded-t-xl pointer-events-none" />
                <span className="relative z-10 tracking-tighter">AI</span>
              </div>

              {/* Micro Corner Sparkle */}
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5 z-20">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-60"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-gradient-to-r from-pink-500 to-violet-500 shadow-sm shadow-pink-500/50"></span>
              </span>
            </div>

            {/* Logo Text */}
            <div className="relative items-center hidden xs:flex min-w-0">
              <span className="text-base sm:text-xl font-black tracking-tight text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors duration-200 truncate">
                AI Darslar
              </span>
            </div>
          </div>
        </div>

        {/* Center: Global Search Bar for Main View */}
        <div className="hidden md:flex flex-1 max-w-md lg:max-w-lg mx-2 lg:mx-6">
          <GlobalSearch
            onRouteChange={onRouteChange}
            className="w-full"
          />
        </div>

        {/* Right Action Buttons — horizontally scrollable safeguard so a button
            can never be pushed off-screen and become invisible/unreachable */}
        <div className="flex items-center gap-1 sm:gap-2.5 shrink-0 overflow-x-auto no-scrollbar max-w-full">
          {/* Mobile Search Button */}
          <button
            id="mobile-search-toggle-btn"
            onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
            className="md:hidden shrink-0 p-2 sm:p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition-colors cursor-pointer"
            title="Qidiruv"
            aria-label="Qidiruv"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Quick Sound Mute/Unmute Toggle (kichik ekranlarda bildirishnoma panelida ham mavjud) */}
          <button
            id="navbar-sound-toggle-btn"
            type="button"
            onClick={handleToggleSound}
            className={`hidden xs:flex shrink-0 p-2 sm:p-2.5 rounded-xl border transition-colors cursor-pointer items-center justify-center ${
              soundOn
                ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800/80 hover:bg-indigo-100/70'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-800'
            }`}
            title={soundOn ? "Bildirishnoma tovushlarini o'chirish (Mute)" : "Bildirishnoma tovushlarini yoqish (Unmute)"}
            aria-label="Tovushni yoqish yoki o'chirish"
          >
            {soundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-rose-500" />}
          </button>

          {/* Notifications Dropdown */}
          <div className="relative shrink-0" ref={notifRef}>
            <button
              id="navbar-notifications-bell-btn"
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className={`p-2.5 rounded-xl border transition-all relative cursor-pointer ${
                isBellHighlight
                  ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-950 border-indigo-500 ring-4 ring-indigo-500/40 scale-110 shadow-lg shadow-indigo-500/30 animate-bounce'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
              }`}
              title="Admin Bildirishnomalari"
              aria-label="Bildirishnomalar"
            >
              <Bell className={`w-4 h-4 ${isBellHighlight ? 'text-indigo-600 dark:text-indigo-400 animate-spin' : ''}`} />
              {(unreadCount > 0 || isBellHighlight) && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center ring-2 ring-white dark:ring-slate-900 animate-pulse">
                  {unreadCount > 0 ? (unreadCount > 9 ? '9+' : unreadCount) : '1'}
                </span>
              )}
            </button>

            {isNotifOpen && (
              <div className="fixed top-[calc(var(--safe-top,0px)+3.75rem)] sm:top-[calc(var(--safe-top,0px)+4.25rem)] right-2 sm:right-4 w-[88vw] max-w-80 sm:max-w-96 max-h-[calc(100vh-6rem)] overflow-y-auto rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-4 z-50 space-y-3 animate-in fade-in-50 duration-150">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
                  <div className="flex items-center gap-1.5">
                    <Bell className="w-4 h-4 text-indigo-600" />
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      Bildirishnomalar
                    </span>
                    {unreadCount > 0 && (
                      <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-300">
                        {unreadCount} yangi
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Sound Mute / Unmute Toggle Button */}
                    <button
                      type="button"
                      onClick={handleToggleSound}
                      title={soundOn ? "Tovushni o'chirish (Mute)" : "Tovushni yoqish (Unmute)"}
                      className={`p-1 px-2 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer border ${
                        soundOn
                          ? 'bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {soundOn ? (
                        <>
                          <Volume2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                          <span>Tovush: Yoqiq</span>
                        </>
                      ) : (
                        <>
                          <VolumeX className="w-3.5 h-3.5 text-rose-500" />
                          <span>Tovush: O'chiq</span>
                        </>
                      )}
                    </button>

                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                      >
                        O'qish
                      </button>
                    )}
                  </div>
                </div>

                <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                  {announcements.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-400">
                      Hozircha yangi bildirishnomalar yo'q.
                    </div>
                  ) : (
                    announcements.map((ann) => {
                      const isRead = readIds.includes(ann.id);
                      return (
                        <div
                          key={ann.id}
                          onClick={() => {
                            markAsRead(ann.id);
                            if (ann.link) {
                              handleNav(ann.link);
                              setIsNotifOpen(false);
                            }
                          }}
                          className={`p-3 rounded-xl border text-xs transition-all cursor-pointer ${
                            !isRead
                              ? 'bg-indigo-50/50 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-800/60 font-medium'
                              : 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="font-bold text-slate-900 dark:text-white truncate">
                              {ann.title}
                            </span>
                            {ann.isPinned && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 shrink-0 flex items-center gap-0.5">
                                <Pin className="w-2.5 h-2.5" /> Pin
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                            {ann.message}
                          </p>
                          <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                            <span>{ann.createdAt}</span>
                            {!isRead && <span className="text-indigo-600 font-bold">• Yangi</span>}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-center flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => playNotificationSound('chime', true)}
                    className="text-[10px] text-slate-500 hover:text-indigo-600 font-medium flex items-center gap-1 cursor-pointer"
                  >
                    <Volume2 className="w-3 h-3 text-indigo-500" />
                    <span>Sinov ohangi</span>
                  </button>

                  <button
                    onClick={() => {
                      handleNav('dashboard');
                      setIsNotifOpen(false);
                    }}
                    className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Barcha xabarlar</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="shrink-0 p-2 sm:p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition-colors cursor-pointer"
            title="Mavzuni o'zgartirish"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" /> : <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />}
          </button>

          {/* User Auth / Profile */}
          {activeUser ? (
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => handleNav('profile')}
                className="flex items-center gap-2 sm:gap-2.5 px-2 sm:px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-sm cursor-pointer shrink-0"
              >
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full overflow-hidden bg-indigo-100 dark:bg-indigo-950/80 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-sm shrink-0">
                  {activeUser.avatarUrl || profile?.avatar_url ? (
                    <img
                      src={activeUser.avatarUrl || profile?.avatar_url}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    (activeUser.firstName?.[0] || profile?.first_name?.[0] || 'U').toUpperCase()
                  )}
                </div>
                <div className="text-left hidden sm:block">
                  <div className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                    {activeUser.firstName || profile?.first_name || 'Talaba'}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">
                    {activeUser.role === 'admin' ? 'Administrator' : 'O\'quvchi'}
                  </div>
                </div>
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="shrink-0 flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-xs rounded-xl shadow-md shadow-indigo-600/20 transition-all hover:scale-[1.02] cursor-pointer"
            >
              <User className="w-4 h-4" />
              <span>Kirish</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile Search Overlay */}
      {isMobileSearchOpen && (
        <div className="md:hidden px-4 pb-3 pt-1 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 animate-in slide-in-from-top-2 duration-150">
          <div className="flex items-center gap-2">
            <GlobalSearch
              onRouteChange={onRouteChange}
              className="flex-1"
              isMobileModal={true}
              onCloseMobile={() => setIsMobileSearchOpen(false)}
            />
            <button
              type="button"
              onClick={() => setIsMobileSearchOpen(false)}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
