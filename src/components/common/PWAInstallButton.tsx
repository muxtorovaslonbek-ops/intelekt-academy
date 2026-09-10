import React, { useState } from 'react';
import { Download, Smartphone, X, Check, Share, PlusSquare } from 'lucide-react';
import { usePWAInstall } from '../../utils/usePWAInstall';

interface PWAInstallButtonProps {
  variant?: 'navbar' | 'sidebar' | 'banner';
  className?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  variant = 'navbar',
  className = '',
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  // If already running as an installed standalone PWA, hide
  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      setIsInstalling(true);
      await install();
      setIsInstalling(false);
    } else if (isIOS) {
      setShowIOSGuide(true);
    } else {
      // If browser doesn't support beforeinstallprompt yet, show helpful prompt
      setShowIOSGuide(true);
    }
  };

  // Sidebar variant: Full futuristic widget card
  if (variant === 'sidebar') {
    return (
      <>
        <div
          id="pwa-sidebar-install-card"
          className={`p-3.5 rounded-2xl bg-gradient-to-br from-indigo-950/80 via-purple-950/60 to-slate-900 border border-indigo-500/30 shadow-lg text-white relative overflow-hidden ${className}`}
        >
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/20">
                <Smartphone className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold leading-none text-white">AI Future App</p>
                <p className="text-[10px] text-cyan-300">PWA Ilova</p>
              </div>
            </div>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              Tezkor
            </span>
          </div>

          <p className="text-[11px] text-slate-300 mb-3 leading-relaxed">
            Ilovani kompyuter yoki telefoningizga o'rnatib, oflayn va bir bosishda oching.
          </p>

          <button
            id="pwa-install-sidebar-btn"
            onClick={handleInstallClick}
            disabled={isInstalling}
            className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-98"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Ilovani o'rnatish</span>
          </button>
        </div>

        {/* Modal for iOS or manual install steps */}
        {showIOSGuide && (
          <IOSInstallModal onClose={() => setShowIOSGuide(false)} isIOS={isIOS} />
        )}
      </>
    );
  }

  // Navbar variant: Sleek neon action button
  return (
    <>
      <button
        id="pwa-install-navbar-btn"
        onClick={handleInstallClick}
        disabled={isInstalling}
        title="AI Future ilovasini qurilmaga o'rnatish"
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500/10 via-indigo-500/10 to-purple-500/10 hover:from-cyan-500/20 hover:to-indigo-500/20 border border-cyan-500/40 text-cyan-700 dark:text-cyan-300 text-xs font-semibold shadow-sm transition-all cursor-pointer ${className}`}
      >
        <Download className="w-3.5 h-3.5 text-cyan-500 animate-bounce" />
        <span className="hidden sm:inline">Ilovani o'rnatish</span>
      </button>

      {showIOSGuide && (
        <IOSInstallModal onClose={() => setShowIOSGuide(false)} isIOS={isIOS} />
      )}
    </>
  );
};

// Modal for iOS / Safari or general browsers without native prompt
const IOSInstallModal: React.FC<{ onClose: () => void; isIOS: boolean }> = ({ onClose, isIOS }) => {
  return (
    <div
      id="pwa-install-guide-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-sm p-4 animate-in fade-in duration-200"
    >
      <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl relative text-left">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          aria-label="Yopish"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-cyan-500/30">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              AI Future ilovasini o'rnatish
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isIOS ? "iOS (iPhone & iPad) uchun yo'riqnoma" : "Brauzer orqali o'rnatish"}
            </p>
          </div>
        </div>

        {isIOS ? (
          <div className="space-y-3.5 text-sm text-slate-600 dark:text-slate-300">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800">
              <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                <Share className="w-4 h-4" />
              </div>
              <div>
                <p className="font-semibold text-slate-900 dark:text-white text-xs">1-bosqich</p>
                <p className="text-xs mt-0.5">
                  Safari brauzeri pastki panelidagi <strong>"Ulashish" (Share)</strong> tugmasini bosing.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800">
              <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                <PlusSquare className="w-4 h-4" />
              </div>
              <div>
                <p className="font-semibold text-slate-900 dark:text-white text-xs">2-bosqich</p>
                <p className="text-xs mt-0.5">
                  Ro'yxatdan <strong>"Bosh ekranga qo'shish" (Add to Home Screen)</strong> bandini tanlang.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800">
              <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                <Check className="w-4 h-4" />
              </div>
              <div>
                <p className="font-semibold text-slate-900 dark:text-white text-xs">3-bosqich</p>
                <p className="text-xs mt-0.5">
                  Yuqori o'ng burchakdagi <strong>"Qo'shish" (Add)</strong> tugmasini bosing. AI Future ilovasi telefoningiz bosh ekranida paydo bo'ladi.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
            <p className="text-xs leading-relaxed">
              Brauzeringizning manzil qatorida (URL) paydo bo'ladigan <strong>"O'rnatish" (Install)</strong> belgisini yoki menyudagi <strong>"Ilovani o'rnatish"</strong> tugmasini bosishingiz mumkin.
            </p>
            <div className="p-3 rounded-xl bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800 text-xs text-cyan-800 dark:text-cyan-300">
              PWA ilova internet tezligi past bo'lgan holatlarda ham tez yuklanadi va to'liq ekranda ishlaydi.
            </div>
          </div>
        )}

        <button
          onClick={onClose}
          className="mt-5 w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold transition cursor-pointer"
        >
          Tushundim, yopish
        </button>
      </div>
    </div>
  );
};
