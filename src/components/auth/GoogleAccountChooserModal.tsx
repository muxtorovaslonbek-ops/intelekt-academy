import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { X, Plus, Check, Loader2, ArrowRight } from 'lucide-react';

export interface SavedGoogleAccount {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

interface GoogleAccountChooserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  mode?: 'register' | 'login';
}

const DEFAULT_GOOGLE_ACCOUNTS: SavedGoogleAccount[] = [
  {
    id: 'g-acc-1',
    name: 'Talaba O\'quvchi',
    email: 'talaba.student@gmail.com',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'g-acc-2',
    name: 'IT Mutaxassis',
    email: 'developer.ai@gmail.com',
    avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
  },
];

export const GoogleAccountChooserModal: React.FC<GoogleAccountChooserModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  mode = 'register',
}) => {
  const { loginWithGoogle, users } = useAuth();

  // Load saved accounts from localStorage or initial
  const [savedAccounts, setSavedAccounts] = useState<SavedGoogleAccount[]>(() => {
    try {
      const stored = localStorage.getItem('aidarslar-google-accounts');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // fallback
    }
    return DEFAULT_GOOGLE_ACCOUNTS;
  });

  // Sync with registered google users
  useEffect(() => {
    const googleUsers = users
      .filter((u) => u.authProvider === 'google' && u.email)
      .map((u) => ({
        id: u.id,
        name: `${u.firstName} ${u.lastName}`.trim() || 'Google Foydalanuvchi',
        email: u.email!,
        avatarUrl: u.avatarUrl,
      }));

    if (googleUsers.length > 0) {
      setSavedAccounts((prev) => {
        const combined = [...prev];
        googleUsers.forEach((gu) => {
          if (!combined.some((c) => c.email.toLowerCase() === gu.email.toLowerCase())) {
            combined.push(gu);
          }
        });
        return combined;
      });
    }
  }, [users]);

  // States
  const [isUsingCustomAccount, setIsUsingCustomAccount] = useState(false);
  const [customFirstName, setCustomFirstName] = useState('');
  const [customLastName, setCustomLastName] = useState('');
  const [customEmail, setCustomEmail] = useState('');
  const [customPhone, setCustomPhone] = useState('+998 ');
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const saveAccountToStorage = (acc: SavedGoogleAccount) => {
    const updated = [acc, ...savedAccounts.filter((a) => a.email.toLowerCase() !== acc.email.toLowerCase())];
    setSavedAccounts(updated);
    try {
      localStorage.setItem('aidarslar-google-accounts', JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const handleSelectAccount = async (account: SavedGoogleAccount) => {
    setSelectedAccountId(account.id);
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      await loginWithGoogle(account.email, account.name);
      saveAccountToStorage(account);
      setTimeout(() => {
        setIsProcessing(false);
        onSuccess();
        onClose();
      }, 500);
    } catch {
      setIsProcessing(false);
      setErrorMessage("Google orqali ulanishda xatolik yuz berdi.");
    }
  };

  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!customFirstName.trim()) {
      setErrorMessage("Ismingizni kiriting.");
      return;
    }
    if (!customEmail.trim() || !customEmail.includes('@')) {
      setErrorMessage("To'g'ri Google elektron pochta manzilini kiriting.");
      return;
    }

    const fullName = `${customFirstName.trim()} ${customLastName.trim()}`.trim();
    const newAcc: SavedGoogleAccount = {
      id: `g-custom-${Date.now()}`,
      name: fullName,
      email: customEmail.trim().toLowerCase(),
    };

    setIsProcessing(true);
    try {
      await loginWithGoogle(customEmail.trim().toLowerCase(), fullName, customPhone);
      saveAccountToStorage(newAcc);
      setTimeout(() => {
        setIsProcessing(false);
        onSuccess();
        onClose();
      }, 500);
    } catch {
      setIsProcessing(false);
      setErrorMessage("Google orqali ulanishda xatolik yuz berdi.");
    }
  };

  return (
    <div
      id="google-account-chooser-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        id="google-account-chooser-dialog"
        className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden text-slate-900 dark:text-slate-100 animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="p-6 pb-4 flex items-start justify-between border-b border-slate-100 dark:border-slate-800">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              {/* Google 4-color Logo */}
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.87c2.26-2.09 3.675-5.17 3.675-9.15z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.87-3.05c-1.08.72-2.45 1.16-4.06 1.16-3.13 0-5.78-2.11-6.73-4.96H1.25v3.15C3.26 21.36 7.34 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.27 14.24c-.25-.72-.38-1.49-.38-2.24s.13-1.52.38-2.24V6.61H1.25C.45 8.24 0 10.06 0 12s.45 3.76 1.25 5.39l4.02-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.61l4.02 3.15c.95-2.85 3.6-4.96 6.73-4.96z"
                />
              </svg>
              <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                Google orqali {mode === 'register' ? "ro'yxatdan o'tish" : "kirish"}
              </span>
            </div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
              Hisobni tanlang
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              <strong className="text-indigo-600 dark:text-indigo-400 font-bold">AI Darslar</strong> ta'lim platformasi bilan davom etish uchun
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Yopish"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error notification */}
        {errorMessage && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs">
            {errorMessage}
          </div>
        )}

        {/* Content Body */}
        <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto">
          {!isUsingCustomAccount ? (
            <>
              {/* Account Selection List */}
              <div className="space-y-2">
                {savedAccounts.map((acc) => {
                  const isSelected = selectedAccountId === acc.id;
                  const firstLetter = (acc.name?.[0] || acc.email[0] || 'G').toUpperCase();

                  return (
                    <button
                      key={acc.id}
                      type="button"
                      disabled={isProcessing}
                      onClick={() => handleSelectAccount(acc)}
                      className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 group cursor-pointer ${
                        isSelected
                          ? 'border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/40 ring-2 ring-indigo-500/20'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-850/60 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        {acc.avatarUrl ? (
                          <img
                            src={acc.avatarUrl}
                            alt={acc.name}
                            className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-600 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-sm">
                            {firstLetter}
                          </div>
                        )}

                        <div className="min-w-0">
                          <p className="text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            {acc.name}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                            {acc.email}
                          </p>
                        </div>
                      </div>

                      {isSelected && isProcessing ? (
                        <Loader2 className="w-5 h-5 text-indigo-600 animate-spin shrink-0" />
                      ) : (
                        <div className="w-6 h-6 rounded-full border border-slate-300 dark:border-slate-700 flex items-center justify-center group-hover:border-indigo-500 transition-colors shrink-0">
                          <Check className="w-3.5 h-3.5 text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Use Another Account Button */}
              <button
                type="button"
                disabled={isProcessing}
                onClick={() => setIsUsingCustomAccount(true)}
                className="w-full p-3.5 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-400 bg-white dark:bg-slate-900 hover:bg-indigo-50/40 dark:hover:bg-indigo-950/20 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Boshqa Google hisobidan foydalanish</span>
              </button>
            </>
          ) : (
            /* Custom Account Form */
            <form onSubmit={handleCustomSubmit} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Ism <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={customFirstName}
                    onChange={(e) => setCustomFirstName(e.target.value)}
                    placeholder="Ismingiz"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Familiya
                  </label>
                  <input
                    type="text"
                    value={customLastName}
                    onChange={(e) => setCustomLastName(e.target.value)}
                    placeholder="Familiyangiz"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Google Elektron Pochta Manzili <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  placeholder="pochta@gmail.com"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Telefon Raqam (Bog'lanish uchun)
                </label>
                <input
                  type="tel"
                  value={customPhone}
                  onChange={(e) => setCustomPhone(e.target.value)}
                  placeholder="+998 90 123 45 67"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsUsingCustomAccount(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Orqaga
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Ulanmoqda...</span>
                    </>
                  ) : (
                    <>
                      <span>Davom etish</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer info */}
        <div className="p-4 bg-slate-50 dark:bg-slate-850/80 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 text-center">
          Davom etish orqali siz Google akkauntingiz ma'lumotlari xavfsiz tarzda profil yaratishda ishlatilishiga rozilik bildirasiz.
        </div>
      </div>
    </div>
  );
};
export default GoogleAccountChooserModal;
