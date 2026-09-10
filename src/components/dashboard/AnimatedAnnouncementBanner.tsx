import React, { useState, useEffect, useRef } from 'react';
import { Megaphone, Bell, Sparkles, X, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { playNotificationSound } from '../../utils/audio';
import { useAnnouncements } from '../../context/AnnouncementContext';

interface AnimatedAnnouncementBannerProps {
  onFlyComplete?: () => void;
}

export const AnimatedAnnouncementBanner: React.FC<AnimatedAnnouncementBannerProps> = ({ onFlyComplete }) => {
  const { announcements, addAnnouncement } = useAnnouncements();
  const [secondsLeft, setSecondsLeft] = useState<number>(5);
  const [isFlying, setIsFlying] = useState<boolean>(false);
  const [isDismissed, setIsDismissed] = useState<boolean>(() => {
    return sessionStorage.getItem('welcome_announcement_flown') === 'true';
  });

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const triggerFlyToBell = () => {
    if (isFlying || isDismissed) return;
    setIsFlying(true);

    // Make sure the announcement is securely stored in AnnouncementContext if not already present
    const existing = announcements.find((a) => a.title.includes("EduPlatform Ta'lim Tizimiga Xush Kelibsiz"));
    if (!existing) {
      addAnnouncement(
        "EduPlatform Ta'lim Tizimiga Xush Kelibsiz!",
        "Hurmatli talabalar, platformamizda IT, sun'iy intellekt va zamonaviy dasturlash darslari yo'lga qo'yildi. Barcha savollaringiz bo'yicha admin paneliga yoki AI maslahatchiga murojaat qilishingiz mumkin.",
        'important',
        true
      );
    }

    // Play transition sound & highlight bell after flight completes (~800ms)
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('highlight_notification_bell'));
      playNotificationSound('chime');
      sessionStorage.setItem('welcome_announcement_flown', 'true');
      setIsDismissed(true);
      if (onFlyComplete) onFlyComplete();
    }, 850);
  };

  useEffect(() => {
    if (isDismissed || isFlying) return;

    // Countdown interval
    timerRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          triggerFlyToBell();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isDismissed, isFlying]);

  if (isDismissed) {
    return null;
  }

  return (
    <div
      id="dashboard-animated-important-announcement"
      className={`relative overflow-hidden rounded-2xl border transition-all duration-850 ease-[cubic-bezier(0.2,0.8,0.2,1)] shadow-xl ${
        isFlying
          ? 'scale-10 -translate-y-36 translate-x-24 sm:translate-x-64 opacity-0 blur-sm pointer-events-none'
          : 'scale-100 translate-y-0 translate-x-0 opacity-100 bg-gradient-to-br from-amber-50 via-white to-indigo-50/40 dark:from-slate-900 dark:via-slate-900/90 dark:to-indigo-950/30 border-amber-300 dark:border-amber-700/60 shadow-amber-500/10'
      }`}
    >
      {/* Decorative ambient top glow bar */}
      <div className="h-1.5 w-full bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600" />

      <div className="p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          {/* Main content */}
          <div className="space-y-2 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500 text-white shadow-sm shadow-amber-500/30 animate-pulse">
                <Megaphone className="w-3.5 h-3.5" />
                <span>Muhim</span>
              </span>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Bugun • Boshqaruvchi Admin
              </span>
            </div>

            <h2 className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <span>EduPlatform Ta'lim Tizimiga Xush Kelibsiz!</span>
              <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
            </h2>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal max-w-3xl">
              Hurmatli talabalar, platformamizda IT, sun'iy intellekt va zamonaviy dasturlash darslari yo'lga qo'yildi. Barcha savollaringiz bo'yicha admin paneliga yoki AI maslahatchiga murojaat qilishingiz mumkin.
            </p>
          </div>

          {/* Right Action / Countdown trigger */}
          <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-800 text-[11px] font-mono font-bold">
              <Bell className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 animate-bounce" />
              <span>{secondsLeft}s ichida qo'ng'iroqchaga</span>
            </div>

            <button
              type="button"
              onClick={triggerFlyToBell}
              className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all flex items-center gap-1 cursor-pointer hover:scale-105 active:scale-95"
              title="Darhol bildirishnoma qo'ng'iroqchasiga yuborish"
            >
              <span>Hozir o'tkazish</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Dynamic Countdown Progress Bar (5s smooth shrink) */}
        <div className="mt-3 pt-3 border-t border-amber-200/60 dark:border-slate-800/80 flex items-center gap-2">
          <div className="h-1.5 flex-1 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-indigo-600 transition-all duration-1000 ease-linear rounded-full"
              style={{ width: `${(secondsLeft / 5) * 100}%` }}
            />
          </div>
          <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 shrink-0">
            5 soniya
          </span>
        </div>
      </div>
    </div>
  );
};

export default AnimatedAnnouncementBanner;
