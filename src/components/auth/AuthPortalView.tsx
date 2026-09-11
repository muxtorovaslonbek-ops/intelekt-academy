import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  User,
  Phone,
  Lock,
  ArrowRight,
  ShieldCheck,
  Clock,
  Sparkles,
  BookOpen,
  CheckCircle2,
  GraduationCap,
  Info,
  ChevronRight,
  Database,
  Download,
} from 'lucide-react';
import { PWAInstallButton } from '../common/PWAInstallButton';

interface AuthPortalViewProps {
  onSuccess?: () => void;
  onNavigateToIntro?: () => void;
}

export const AuthPortalView: React.FC<AuthPortalViewProps> = ({
  onSuccess,
  onNavigateToIntro,
}) => {
  const { register, loginWithCredentials, isSupabaseActive } = useAuth();
  const [isRegisterMode, setIsRegisterMode] = useState(true);

  // Form states - Mandatory fields: First Name, Last Name, Phone Number
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('+998 ');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (isRegisterMode) {
        if (!firstName.trim()) {
          setError('Iltimos, ismingizni kiriting (Ism majburiy).');
          setIsSubmitting(false);
          return;
        }
        if (!lastName.trim()) {
          setError('Iltimos, familiyangizni kiriting (Familiya majburiy).');
          setIsSubmitting(false);
          return;
        }
        if (!phoneNumber.trim() || phoneNumber.trim().length < 9) {
          setError('Iltimos, telefon raqamingizni to\'liq kiriting (Telefon raqam majburiy).');
          setIsSubmitting(false);
          return;
        }

        const success = await register(
          firstName.trim(),
          lastName.trim(),
          phoneNumber.trim(),
          undefined,
          'email',
          undefined,
          password
        );
        if (success && onSuccess) {
          onSuccess();
        } else if (!success) {
          setError("Ro'yxatdan o'tish yakunlanmadi. Supabase Auth va profiles jadvali sozlamalarini tekshiring.");
        }
      } else {
        if (!phoneNumber.trim()) {
          setError('Iltimos, telefon raqamingizni kiriting.');
          setIsSubmitting(false);
          return;
        }
        const result = await loginWithCredentials(phoneNumber.trim(), password);
        if (result.success) {
          if (onSuccess) onSuccess();
        } else {
          setError(result.error || "Kirish ma'lumotlari noto'g'ri.");
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message || "Xatolik yuz berdi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      id="auth-portal-page"
      className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8"
    >
      <div className="w-full max-w-5xl bg-slate-900 rounded-3xl shadow-2xl border border-slate-800 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[620px]">
        {/* Left Panel: Visual Branding & Value */}
        <div
          id="auth-portal-left-panel"
          className="lg:col-span-5 bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden border-b lg:border-b-0 lg:border-r border-slate-800"
        >
          <div className="absolute -top-16 -left-16 w-64 h-64 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-16 -right-16 w-64 h-64 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

          {/* Top Brand */}
          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 text-white shadow-lg shadow-cyan-500/20 flex items-center justify-center">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                  <span>AI Future</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    PWA
                  </span>
                </h2>
                <p className="text-xs text-slate-400 font-mono">Sun'iy Intellekt & IT Portali</p>
              </div>
            </div>

            <div className="pt-4 space-y-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-[11px] font-medium">
                <Sparkles className="w-3 h-3 text-cyan-400" />
                Interaktiv Ta'lim Portali
              </span>
              <h3 className="text-2xl font-bold leading-snug text-white">
                Zamonaviy IT va Sun'iy Intellekt bilimlarini puxta egallang.
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Himoyalangan Bunny.net video darsliklari, interaktiv testlar, Gemini AI yordamchisi va xavfsiz admin tasdiqlash arxitekturasi.
              </p>
            </div>

            {/* Feature Bullets */}
            <div className="pt-4 space-y-2.5">
              <div className="flex items-center gap-2 text-xs text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Bir martalik ro'yxatdan o'tish (Ism, Familiya, Tel)</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Admin tasdig'i (Pending kutilmoqda xavfsizlik filtri)</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>PWA qulayligi: Oflayn kesh va tezkoriq ishlash</span>
              </div>
            </div>
          </div>

          {/* Bottom Action: Go to Platform Intro & Install */}
          <div className="relative z-10 pt-6 mt-6 border-t border-slate-800 space-y-3">
            <PWAInstallButton variant="navbar" className="w-full justify-center py-2" />
            {onNavigateToIntro && (
              <button
                id="auth-go-intro-btn"
                type="button"
                onClick={onNavigateToIntro}
                className="w-full py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-semibold border border-white/10 transition-all flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Info className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Platforma bilan to'liq tanishuv (Intro)</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </button>
            )}
          </div>
        </div>

        {/* Right Panel: Authentication Form */}
        <div id="auth-portal-right-panel" className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between">
          <div>
            {/* Nav Switch Tabs: Ro'yxatdan o'tish vs Kirish */}
            <div className="flex items-center justify-between pb-6 border-b border-slate-800 mb-6">
              <div>
                <h2 className="text-xl font-bold text-white">
                  {isRegisterMode ? "Ro'yxatdan O'tish Paneli" : "Tizimga Kirish Paneli"}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {isRegisterMode
                    ? "Yangi hisob yaratish uchun ma'lumotlaringizni kiriting"
                    : "Mavjud hisobingiz orqali platformaga kiring"}
                </p>
              </div>

              {/* Mode Toggle Pills */}
              <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  id="portal-tab-register"
                  type="button"
                  onClick={() => {
                    setIsRegisterMode(true);
                    setError(null);
                  }}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    isRegisterMode
                      ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Ro'yxatdan o'tish
                </button>
                <button
                  id="portal-tab-login"
                  type="button"
                  onClick={() => {
                    setIsRegisterMode(false);
                    setError(null);
                  }}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    !isRegisterMode
                      ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Kirish
                </button>
              </div>
            </div>

            {error && (
              <div
                id="portal-error-alert"
                className="mb-4 p-3 rounded-xl bg-rose-950/50 border border-rose-800 text-rose-300 text-xs font-medium flex items-center gap-2"
              >
                <span>{error}</span>
              </div>
            )}

            {/* Auth Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {isRegisterMode ? (
                <>
                  {/* Notice about Admin Approval */}
                  <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-800/80 flex items-start gap-2.5 text-xs text-amber-200">
                    <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span>
                      Ro'yxatdan o'tgach hisobingiz <strong>Pending (kutilmoqda)</strong> holatida
                      ochiladi. Administrator tasdiqlagach kurslar ochiladi.
                    </span>
                  </div>

                  {/* Mandatory First & Last Name */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label
                        htmlFor="portal-first-name-input"
                        className="block text-xs font-semibold text-slate-300 mb-1"
                      >
                        Ism (First Name) <span className="text-cyan-400">*</span>
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          id="portal-first-name-input"
                          type="text"
                          required
                          autoFocus
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          placeholder="Ismingizni kiriting"
                          className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="portal-last-name-input"
                        className="block text-xs font-semibold text-slate-300 mb-1"
                      >
                        Familiya (Last Name) <span className="text-cyan-400">*</span>
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          id="portal-last-name-input"
                          type="text"
                          required
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          placeholder="Familiyangizni kiriting"
                          className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Phone Number - Mandatory */}
                  <div>
                    <label
                      htmlFor="portal-phone-input"
                      className="block text-xs font-semibold text-slate-300 mb-1"
                    >
                      Telefon Raqami (Phone Number) <span className="text-cyan-400">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        id="portal-phone-input"
                        type="tel"
                        required
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="+998 90 123 45 67"
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-sm font-mono text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="portal-password-input" className="block text-xs font-semibold text-slate-300 mb-1">
                      Parol <span className="text-cyan-400">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        id="portal-password-input"
                        type="password"
                        required
                        minLength={6}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Kamida 6 ta belgi"
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Login Phone */}
                  <div>
                    <label
                      htmlFor="portal-login-phone-input"
                      className="block text-xs font-semibold text-slate-300 mb-1"
                    >
                      Telefon Raqamingiz
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        id="portal-login-phone-input"
                        type="tel"
                        required
                        autoFocus
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="+998 90 123 45 67"
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-sm font-mono text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="portal-login-password-input" className="block text-xs font-semibold text-slate-300 mb-1">
                      Parol
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        id="portal-login-password-input"
                        type="password"
                        required={isSupabaseActive}
                        minLength={6}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Parolingizni kiriting"
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                </>
              )}

              <button
                id="portal-submit-btn"
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-sm font-semibold shadow-lg shadow-indigo-600/20 transition flex items-center justify-center gap-2 mt-3 cursor-pointer"
              >
                <span>{isRegisterMode ? "Ro'yxatdan O'tish va Boshlash" : 'Platformaga Kirish'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Security Assurance */}
          <div className="mt-8 pt-6 border-t border-slate-800 text-center">
            <p className="text-xs text-slate-400 flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>AI Future • Xavfsiz, Shifrlangan va Himoyalangan Ta'lim Tizimi</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
