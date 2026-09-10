import React, { useState, useEffect, useRef } from 'react';
import {
  BrainCircuit,
  Code2,
  Terminal,
  ShieldCheck,
  Sparkles,
  Play,
  ArrowRight,
  Bot,
  Cpu,
  Briefcase,
  GraduationCap,
  PenTool,
  CheckCircle,
  KeyRound,
  User,
  Phone,
  Mail,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  Clock,
  Sun,
  Moon,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { ActiveRoute } from '../../types';
import { TelegramBotAuthWidget } from '../auth/TelegramBotAuthWidget';
import { TelegramAuthSession } from '../../lib/telegramBot';
import { NeonButton } from '../common/NeonButton';
import { AmbientGlow } from '../common/AmbientGlow';

interface IntroViewProps {
  onSuccessAuth?: () => void;
  onRouteChange?: (route: ActiveRoute) => void;
}

export const IntroView: React.FC<IntroViewProps> = ({
  onSuccessAuth,
  onRouteChange,
}) => {
  const { theme, toggleTheme } = useTheme();
  const {
    isAuthenticated,
    register,
    login,
    loginWithGoogle,
    loginWithFirebaseGoogle,
    loginWithGmail,
    loginWithTelegram,
    loginAsAdminWithCredentials,
  } = useAuth();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Auth Section Tab: 'register' | 'login' | 'admin'
  const [authMode, setAuthMode] = useState<'register' | 'login' | 'admin'>('register');
  // Auth Method: 'google' | 'telegram' | 'gmail'
  const [authMethod, setAuthMethod] = useState<'google' | 'telegram' | 'gmail'>('google');

  // Form states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('+998 ');
  const [telegramHandle, setTelegramHandle] = useState('@');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Admin credentials state
  const [adminLogin, setAdminLogin] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);

  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Direct real Google Supabase OAuth authentication
  const handleRealGoogleAuth = async () => {
    setAuthError(null);
    setAuthSuccess(null);
    setIsSubmitting(true);
    try {
      const success = await loginWithFirebaseGoogle();
      if (success) {
        setAuthSuccess("Google hisobingiz orqali muvaffaqiyatli kirdingiz!");
        setTimeout(() => {
          if (onSuccessAuth) onSuccessAuth();
        }, 400);
      } else {
        setAuthError("Google orqali kirish amalga oshmadi yoki bekor qilindi.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setAuthError(msg || "Google hisobi bilan ulanishda xatolik yuz berdi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Animated Terminal Typing Effect State
  const [terminalCodeIndex, setTerminalCodeIndex] = useState(0);
  const terminalLines = [
    '# 1. Initialize Neural AI Tutor Model',
    'import eduplatform.ai as gemini_core',
    'model = gemini_core.load_assistant(engine="deep-learning-v3")',
    '',
    '# 2. Compile Real-Time Student Learning Path',
    'student_stack = ["React 19", "AI & Neyrotarmoqlar", "Prompt Engineering", "FullStack Web"]',
    'pipeline = model.generate_roadmap(student_stack, mode="adaptive")',
    '',
    '# 3. Interactive Code Execution: SUCCESS (0 errors)',
    '>>> Ready to transform your tech career! 🚀',
  ];

  // Dynamic code typing simulation
  useEffect(() => {
    const timer = setInterval(() => {
      setTerminalCodeIndex((prev) => (prev < terminalLines.length ? prev + 1 : prev));
    }, 450);
    return () => clearInterval(timer);
  }, [terminalLines.length]);

  // Interactive Neural Particle Grid (Canvas Animation)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 800);
    let height = (canvas.height = 360);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = 360;
    };
    window.addEventListener('resize', handleResize);

    // Particle nodes for neural web
    const nodeCount = 38;
    const nodes: { x: number; y: number; vx: number; vy: number; radius: number; color: string }[] = [];
    const colors = ['#818cf8', '#a855f7', '#38bdf8', '#34d399', '#fbbf24'];

    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        radius: Math.random() * 2.2 + 1.2,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw connecting filaments
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 110) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(129, 140, 248, ${0.35 * (1 - dist / 110)})`;
            ctx.lineWidth = 0.9;
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw and update particle nodes
      nodes.forEach((node) => {
        node.x += node.vx;
        node.y += node.vy;

        if (node.x < 0 || node.x > width) node.vx *= -1;
        if (node.y < 0 || node.y > height) node.vy *= -1;

        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const scrollToAuth = () => {
    const el = document.getElementById('intro-auth-portal-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleTelegramVerified = async (code: string, session?: TelegramAuthSession) => {
    setAuthError(null);
    setAuthSuccess(null);
    setIsSubmitting(true);
    try {
      const handle = session?.telegramHandle || telegramHandle;
      if (authMode === 'register') {
        const fullName = `${firstName.trim()} ${lastName.trim()}`.trim() || `${session?.firstName || ''} ${session?.lastName || ''}`.trim() || 'Telegram Foydalanuvchisi';
        const phone = phoneNumber.trim() || session?.phoneNumber || undefined;
        await loginWithTelegram(handle, fullName, phone);
        setAuthSuccess("Telegram (@edusatbot) orqali kodingiz tasdiqlandi va ro'yxatdan o'tdingiz!");
      } else {
        const success = await loginWithTelegram(handle);
        if (success) {
          setAuthSuccess("Telegram (@edusatbot) orqali tizimga muvaffaqiyatli kirdingiz!");
        } else {
          setAuthError("Bunday Telegram foydalanuvchisi topilmadi. Iltimos, avval ro'yxatdan o'ting.");
          setIsSubmitting(false);
          return;
        }
      }
      setTimeout(() => {
        if (onSuccessAuth) onSuccessAuth();
      }, 500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setAuthError(msg || "Telegram orqali tasdiqlashda xatolik yuz berdi");
    } finally {
      setIsSubmitting(false);
    }
  };

  // RO'YXATDAN O'TISH (Google, Telegram, Gmail)
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccess(null);
    setIsSubmitting(true);

    try {
      if (!firstName.trim()) {
        setAuthError('Ismingizni kiriting.');
        setIsSubmitting(false);
        return;
      }
      if (!lastName.trim()) {
        setAuthError('Familiyangizni kiriting.');
        setIsSubmitting(false);
        return;
      }

      const fullName = `${firstName.trim()} ${lastName.trim()}`;
      const phone = phoneNumber.trim().length > 5 ? phoneNumber.trim() : undefined;

      // 1. Google orqali ro'yxatdan o'tish
      if (authMethod === 'google') {
        if (!emailInput.trim() || !emailInput.includes('@')) {
          setAuthError('Google hisobingiz elektron pochtasini kiriting.');
          setIsSubmitting(false);
          return;
        }
        await loginWithGoogle(emailInput.trim(), fullName, phone);
        setAuthSuccess("Google hisobi orqali ro'yxatdan o'tdingiz! Arizangiz adminga yuborildi.");
        setTimeout(() => {
          if (onSuccessAuth) onSuccessAuth();
        }, 400);
        return;
      }

      // 2. Gmail orqali ro'yxatdan o'tish
      if (authMethod === 'gmail') {
        if (!emailInput.trim() || !emailInput.includes('@')) {
          setAuthError('Gmail elektron pochta manzilingizni kiriting.');
          setIsSubmitting(false);
          return;
        }
        await loginWithGmail(emailInput.trim(), fullName, phone);
        setAuthSuccess("Gmail hisobi orqali ro'yxatdan o'tdingiz! Arizangiz adminga yuborildi.");
        setTimeout(() => {
          if (onSuccessAuth) onSuccessAuth();
        }, 400);
        return;
      }

      // 3. Telegram orqali ro'yxatdan o'tish
      if (authMethod === 'telegram') {
        if (!telegramHandle.trim() || telegramHandle.trim() === '@' || telegramHandle.trim().length < 2) {
          setAuthError('Telegram @username kiriting (Masalan: @username).');
          setIsSubmitting(false);
          return;
        }
        await loginWithTelegram(telegramHandle.trim(), fullName, phone);
        setAuthSuccess("Telegram orqali ro'yxatdan o'tdingiz! Arizangiz adminga yuborildi.");
        setTimeout(() => {
          if (onSuccessAuth) onSuccessAuth();
        }, 400);
        return;
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setAuthError(msg || "Ro'yxatdan o'tishda xatolik yuz berdi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // KIRISH (Google, Telegram, Gmail)
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccess(null);
    setIsSubmitting(true);

    try {
      if (authMethod === 'google') {
        if (!emailInput.trim() || !emailInput.includes('@')) {
          setAuthError('Google elektron pochta manzilingizni kiriting.');
          setIsSubmitting(false);
          return;
        }
        const success = await loginWithGoogle(emailInput.trim());
        if (success) {
          setAuthSuccess('Google hisobi orqali tizimga kirdingiz!');
          setTimeout(() => {
            if (onSuccessAuth) onSuccessAuth();
          }, 400);
        } else {
          setAuthError("Bunday Google hisobli foydalanuvchi topilmadi. Avval ro'yxatdan o'ting.");
        }
        return;
      }

      if (authMethod === 'gmail') {
        if (!emailInput.trim() || !emailInput.includes('@')) {
          setAuthError('Gmail elektron pochta manzilingizni kiriting.');
          setIsSubmitting(false);
          return;
        }
        const success = await loginWithGmail(emailInput.trim());
        if (success) {
          setAuthSuccess('Gmail hisobi orqali tizimga kirdingiz!');
          setTimeout(() => {
            if (onSuccessAuth) onSuccessAuth();
          }, 400);
        } else {
          setAuthError("Bunday Gmail hisobli foydalanuvchi topilmadi. Avval ro'yxatdan o'ting.");
        }
        return;
      }

      if (authMethod === 'telegram') {
        if (!telegramHandle.trim() || telegramHandle.trim() === '@') {
          setAuthError('Telegram @username kiriting.');
          setIsSubmitting(false);
          return;
        }
        const success = await loginWithTelegram(telegramHandle.trim());
        if (success) {
          setAuthSuccess('Telegram orqali tizimga kirdingiz!');
          setTimeout(() => {
            if (onSuccessAuth) onSuccessAuth();
          }, 400);
        } else {
          setAuthError("Bunday Telegram foydalanuvchisi topilmadi. Avval ro'yxatdan o'ting.");
        }
        return;
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setAuthError(msg || 'Kirishda xatolik yuz berdi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ADMIN KIRISH
  const handleAdminLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccess(null);

    if (!adminLogin.trim()) {
      setAuthError('Administrator loginini kiriting.');
      return;
    }
    if (!adminPassword.trim()) {
      setAuthError('Administrator parolini kiriting.');
      return;
    }

    const res = loginAsAdminWithCredentials(adminLogin.trim(), adminPassword.trim());
    if (res.success) {
      setAuthSuccess('Administrator sifatida muvaffaqiyatli kirdingiz!');
      setTimeout(() => {
        if (onSuccessAuth) onSuccessAuth();
      }, 400);
    } else {
      setAuthError(res.error || "Noto'g'ri administrator login yoki parol!");
    }
  };

  return (
    <div id="intro-view-container" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 pb-16 transition-colors">
      {/* 0. TOP BRAND & THEME SWITCHER BAR FOR GUEST / LANDING */}
      <header className="flex items-center justify-between py-4 border-b border-slate-200 dark:border-slate-800/80 transition-colors">
        <div className="flex items-center gap-3 select-none">
          {/* Logo Icon with Ambient Glow Aura */}
          <div className="relative flex items-center justify-center">
            <div className="absolute -inset-1 bg-gradient-to-tr from-indigo-500 via-violet-500 to-purple-500 rounded-2xl blur-md opacity-40 dark:opacity-55 transition-opacity duration-300" />
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-purple-600 text-white font-black text-base shadow-md shadow-indigo-500/25 ring-1 ring-white/25 overflow-hidden">
              <div className="absolute inset-x-0 top-0 h-1/2 bg-white/20 rounded-t-xl pointer-events-none" />
              <span className="relative z-10 tracking-tighter">AI</span>
            </div>
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5 z-20">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-60"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-gradient-to-r from-pink-500 to-violet-500 shadow-sm shadow-pink-500/50"></span>
            </span>
          </div>

          <div>
            <span className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              AI Darslar
            </span>
            <span className="hidden sm:inline-block ml-2 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300">
              EduPlatform
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all shadow-sm cursor-pointer"
            aria-label="Mavzuni almashtirish"
            title="Mavzuni almashtirish (Yorug' / Qorong'i)"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
          </button>

          {!isAuthenticated && (
            <>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  scrollToAuth();
                }}
                className="px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all shadow-sm cursor-pointer"
              >
                Kirish
              </button>

              {/* Reusable Glowing Neon CTA Button */}
              <NeonButton
                type="button"
                onClick={() => {
                  setAuthMode('register');
                  scrollToAuth();
                }}
                variant="primary-gradient"
                size="sm"
              >
                Ro'yxatdan o'tish
              </NeonButton>
            </>
          )}
        </div>
      </header>

      {/* 1. HERO SECTION */}
      <section
        id="intro-hero-section"
        className="relative rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-white p-6 sm:p-10 lg:p-12 overflow-hidden border border-indigo-900/50 dark:border-slate-800/80 shadow-2xl transition-colors"
      >
        {/* Interactive Neural Canvas Background */}
        <div className="absolute inset-0 pointer-events-none opacity-40 overflow-hidden">
          <canvas ref={canvasRef} className="w-full h-full" />
        </div>

        {/* CSS-based Ambient Glow Component with slowly pulsing semi-transparent radial gradient */}
        <AmbientGlow variant="hero" intensity="medium" pulseSpeed="slow" showGrid showOrbs />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Vision & Action */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 dark:bg-white/5 border border-white/15 text-indigo-200 text-xs font-semibold backdrop-blur-md">
              <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
              <span>Next-Gen Sun'iy Intellekt & Dasturlash Ekotizimi</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight text-white">
              Zamonaviy IT, AI va Dasturlashni{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-purple-300 to-emerald-300">
                Interaktiv O'rganing
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
              Neyrotarmoqlar, Prompt muhandisligi, AI video va rasmlar yaratish, zamonaviy veb-saytlar va dasturlar ishlab chiqish bo'yicha professional ta'lim.
            </p>

            {/* Quick Feature Chips */}
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="px-3 py-1 rounded-lg bg-white/10 text-xs font-medium border border-white/15 text-slate-200 flex items-center gap-1.5">
                <BrainCircuit className="w-3.5 h-3.5 text-purple-400" />
                <span>AI Algoritmlar</span>
              </span>
              <span className="px-3 py-1 rounded-lg bg-white/10 text-xs font-medium border border-white/15 text-slate-200 flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5 text-indigo-400" />
                <span>Full-Stack Web Dasturlash</span>
              </span>
              <span className="px-3 py-1 rounded-lg bg-white/10 text-xs font-medium border border-white/15 text-slate-200 flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                <span>Jonli Amaliyot</span>
              </span>
              <span className="px-3 py-1 rounded-lg bg-white/10 text-xs font-medium border border-white/15 text-slate-200 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>Admin Boshqaruvi</span>
              </span>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-3.5">
              {!isAuthenticated ? (
                <>
                  {/* Primary Main CTA using reusable NeonButton */}
                  <NeonButton
                    id="hero-start-register-btn"
                    onClick={scrollToAuth}
                    variant="primary-white"
                    size="lg"
                    leftIcon={<Sparkles className="w-4 h-4 text-indigo-600 animate-pulse" />}
                    rightIcon={<ArrowRight className="w-4 h-4 text-indigo-600 group-hover/neon-btn:translate-x-1 transition-transform" />}
                  >
                    <span>Boshlash va Ro'yxatdan O'tish</span>
                  </NeonButton>

                  <button
                    id="hero-admin-quick-btn"
                    onClick={() => {
                      setAuthMode('admin');
                      scrollToAuth();
                    }}
                    className="px-5 py-4 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 text-sm font-semibold border border-white/15 hover:border-amber-400/50 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <KeyRound className="w-4 h-4 text-amber-400" />
                    <span>Admin Sifatida Kirish</span>
                  </button>
                </>
              ) : (
                <NeonButton
                  onClick={() => onRouteChange && onRouteChange('dashboard')}
                  variant="primary-white"
                  size="lg"
                  leftIcon={<Play className="w-4 h-4 text-indigo-600" />}
                >
                  <span>Mening O'quv Kabinetimga O'tish</span>
                </NeonButton>
              )}
            </div>
          </div>

          {/* Right Column: Live Simulated Animated IT Terminal */}
          <div className="lg:col-span-5">
            <div className="rounded-2xl bg-slate-900/95 border border-indigo-800/60 shadow-2xl overflow-hidden backdrop-blur-xl">
              {/* Terminal Header Bar */}
              <div className="bg-slate-950 px-4 py-3 border-b border-indigo-900/50 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500/90" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/90" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/90" />
                </div>
                <div className="flex items-center gap-1.5 text-[11px] font-mono text-indigo-300">
                  <Bot className="w-3.5 h-3.5 text-indigo-400" />
                  <span>gemini-ai-kernel.py</span>
                </div>
                <div className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>ONLINE</span>
                </div>
              </div>

              {/* Terminal Body */}
              <div className="p-4 font-mono text-xs space-y-1.5 bg-slate-950/90 min-h-[220px]">
                {terminalLines.slice(0, terminalCodeIndex).map((line, idx) => (
                  <div
                    key={idx}
                    className={`leading-relaxed ${
                      line.startsWith('#')
                        ? 'text-slate-500 font-semibold'
                        : line.startsWith('>>>')
                        ? 'text-emerald-300 font-bold'
                        : line.includes('import') || line.includes('from')
                        ? 'text-purple-300'
                        : 'text-indigo-200'
                    }`}
                  >
                    {line}
                  </div>
                ))}
                <div className="flex items-center gap-1 text-indigo-400 pt-2">
                  <span>eduplatform@ai-core:~$</span>
                  <span className="w-2 h-4 bg-indigo-400 animate-pulse" />
                </div>
              </div>

              {/* Terminal Quick Insight Bar */}
              <div className="bg-slate-900/90 px-4 py-2.5 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1 text-indigo-300">
                  <Cpu className="w-3.5 h-3.5" /> Yuqori Tezlikdagi Arxitektura
                </span>
                <span className="text-emerald-400 font-mono">Latency: 12ms</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. IT & AI LEARNING DIRECTIONS GRID */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            Zamonaviy IT va Sun'iy Intellekt Yo'nalishlari
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Dasturlash, AI neyrotarmoqlari va zamonaviy ta'lim yechimlarini amalda o'rganing.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Direction 1 */}
          <div className="relative group rounded-2xl transition-all duration-300">
            <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-[2px] -z-10 pointer-events-none" />
            <div className="p-6 rounded-2xl bg-white/75 dark:bg-slate-900/65 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 group-hover:border-transparent shadow-[0_8px_30px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)] group-hover:shadow-[0_12px_32px_-4px_rgba(99,102,241,0.25)] transition-all duration-300 space-y-3 h-full">
              <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <BrainCircuit className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                🤖 Sun'iy Intellekt (AI) sirlari
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Neyrotarmoqlardan professional darajada foydalanish va ish jarayonlarini avtomatlashtirish.
              </p>
            </div>
          </div>

          {/* Direction 2 */}
          <div className="relative group rounded-2xl transition-all duration-300">
            <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-[2px] -z-10 pointer-events-none" />
            <div className="p-6 rounded-2xl bg-white/75 dark:bg-slate-900/65 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 group-hover:border-transparent shadow-[0_8px_30px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)] group-hover:shadow-[0_12px_32px_-4px_rgba(99,102,241,0.25)] transition-all duration-300 space-y-3 h-full">
              <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <PenTool className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                🧠 Prompt Engineering san'ati
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                ChatGPT, Claude va Gemini kabi AI modellari bilan to'g'ri muloqot qilish va aniq natijalar olish.
              </p>
            </div>
          </div>

          {/* Direction 3 */}
          <div className="relative group rounded-2xl transition-all duration-300">
            <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-[2px] -z-10 pointer-events-none" />
            <div className="p-6 rounded-2xl bg-white/75 dark:bg-slate-900/65 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 group-hover:border-transparent shadow-[0_8px_30px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)] group-hover:shadow-[0_12px_32px_-4px_rgba(99,102,241,0.25)] transition-all duration-300 space-y-3 h-full">
              <div className="w-12 h-12 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                🎨 AI orqali Rasm va Video yaratish
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Midjourney, Stable Diffusion va video generatorlar orqali professional sifatdagi media kontent yaratish.
              </p>
            </div>
          </div>

          {/* Direction 4 */}
          <div className="relative group rounded-2xl transition-all duration-300">
            <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-[2px] -z-10 pointer-events-none" />
            <div className="p-6 rounded-2xl bg-white/75 dark:bg-slate-900/65 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 group-hover:border-transparent shadow-[0_8px_30px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)] group-hover:shadow-[0_12px_32px_-4px_rgba(99,102,241,0.25)] transition-all duration-300 space-y-3 h-full">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Code2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                🌐 Zamonaviy Veb-saytlar yaratish
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Frontend va backend dasturlash: HTML, CSS, JavaScript, React va sun'iy intellekt integratsiyalari.
              </p>
            </div>
          </div>

          {/* Direction 5 */}
          <div className="relative group rounded-2xl transition-all duration-300">
            <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-[2px] -z-10 pointer-events-none" />
            <div className="p-6 rounded-2xl bg-white/75 dark:bg-slate-900/65 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 group-hover:border-transparent shadow-[0_8px_30px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)] group-hover:shadow-[0_12px_32px_-4px_rgba(99,102,241,0.25)] transition-all duration-300 space-y-3 h-full">
              <div className="w-12 h-12 rounded-xl bg-cyan-100 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Terminal className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                💻 Dasturlar yaratish
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Eng so'nggi texnologiyalar yordamida o'z g'oyalaringizni real loyihalarga aylantirish va dasturlar tuzish.
              </p>
            </div>
          </div>

          {/* Direction 6 */}
          <div className="relative group rounded-2xl transition-all duration-300">
            <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-[2px] -z-10 pointer-events-none" />
            <div className="p-6 rounded-2xl bg-white/75 dark:bg-slate-900/65 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 group-hover:border-transparent shadow-[0_8px_30px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)] group-hover:shadow-[0_12px_32px_-4px_rgba(99,102,241,0.25)] transition-all duration-300 space-y-3 h-full">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Briefcase className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                💼 Shaxsiy biznesingizni rivojlantirish
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                IT va AI yechimlarini qo'llagan holda o'z biznesingizni raqamlashtirish va samaradorlikni oshirish.
              </p>
            </div>
          </div>

          {/* Direction 7 */}
          <div className="relative group rounded-2xl transition-all duration-300 md:col-span-2 lg:col-span-3">
            <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-[2px] -z-10 pointer-events-none" />
            <div className="p-6 rounded-2xl bg-white/75 dark:bg-slate-900/65 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 group-hover:border-transparent shadow-[0_8px_30px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)] group-hover:shadow-[0_12px_32px_-4px_rgba(99,102,241,0.25)] transition-all duration-300 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-teal-100 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    🎓 O'qituvchilar uchun zamonaviy dars tizimlari
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Ta'lim jarayonini interaktiv tashkil etish, innovatsion o'qitish metodikalari va har bir o'qituvchi uchun shaxsiy veb-platforma yaratish sirlari.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. AUTHENTICATION & ACCESS PORTAL: Register, Login, or Login as Admin */}
      <section
        id="intro-auth-portal-section"
        className="rounded-3xl bg-slate-100/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 p-6 sm:p-10 shadow-xl transition-colors relative overflow-hidden"
      >
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-semibold">
              <KeyRound className="w-3.5 h-3.5" />
              <span>Platformaga Kirish Markazi</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Ro'yxatdan O'ting yoki Tizimga Kiring
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Google, Telegram yoki Gmail hisobingiz orqali qulay ro'yxatdan o'ting va ta'limni boshlang.
            </p>
          </div>

          {/* Mode Tabs (Register / Login / Admin) */}
          <div className="flex bg-white dark:bg-slate-950 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-md mx-auto shadow-sm">
            <button
              type="button"
              onClick={() => {
                setAuthMode('register');
                setAuthError(null);
                setAuthSuccess(null);
              }}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                authMode === 'register'
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Ro'yxatdan O'tish</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setAuthMode('login');
                setAuthError(null);
                setAuthSuccess(null);
              }}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                authMode === 'login'
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Kirish</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setAuthMode('admin');
                setAuthError(null);
                setAuthSuccess(null);
              }}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                authMode === 'admin'
                  ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-md shadow-amber-600/30'
                  : 'text-amber-700 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin Kirish</span>
            </button>
          </div>

          {/* Error & Success Messages */}
          {authError && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs font-medium text-center">
              {authError}
            </div>
          )}
          {authSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-medium text-center flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>{authSuccess}</span>
            </div>
          )}

          {/* Form Container */}
          <div className="bg-white dark:bg-slate-950 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg transition-colors">
            
            {/* METHOD SELECTOR: GOOGLE, TELEGRAM, GMAIL */}
            {(authMode === 'register' || authMode === 'login') && (
              <div className="mb-6 space-y-3">
                <div className="text-center text-xs font-semibold text-slate-600 dark:text-slate-400">
                  {authMode === 'register'
                    ? "Qaysi usul orqali ro'yxatdan o'tmoqchisiz?"
                    : "Qaysi usul orqali kirmoqchisiz?"}
                </div>

                <div className="grid grid-cols-3 gap-2.5 max-w-md mx-auto">
                  {/* Google Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMethod('google');
                      setAuthError(null);
                    }}
                    className={`py-2.5 px-2 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      authMethod === 'google'
                        ? 'bg-indigo-50 dark:bg-indigo-950/80 border-indigo-600 dark:border-indigo-500 text-indigo-700 dark:text-indigo-200 ring-2 ring-indigo-500/20 shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80'
                    }`}
                  >
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
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
                    <span>Google</span>
                  </button>

                  {/* Telegram Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMethod('telegram');
                      setAuthError(null);
                    }}
                    className={`py-2.5 px-2 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      authMethod === 'telegram'
                        ? 'bg-[#229ED9]/10 dark:bg-[#229ED9]/20 border-[#229ED9] text-[#229ED9] ring-2 ring-[#229ED9]/20 shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80'
                    }`}
                  >
                    <svg className="w-4 h-4 fill-current text-[#229ED9] shrink-0" viewBox="0 0 24 24">
                      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.121l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.832.926z" />
                    </svg>
                    <span>Telegram</span>
                  </button>

                  {/* Gmail Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMethod('gmail');
                      setAuthError(null);
                    }}
                    className={`py-2.5 px-2 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      authMethod === 'gmail'
                        ? 'bg-rose-50 dark:bg-rose-950/80 border-rose-500 text-rose-600 dark:text-rose-300 ring-2 ring-rose-500/20 shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80'
                    }`}
                  >
                    <Mail className="w-4 h-4 text-rose-500 shrink-0" />
                    <span>Gmail</span>
                  </button>
                </div>
              </div>
            )}

            {/* TAB 1: RO'YXATDAN O'TISH FORMASI */}
            {authMode === 'register' && (
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                {/* Admin Approval Requirement Notice */}
                <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-800 dark:text-amber-200 text-xs flex items-start gap-2.5">
                  <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <strong>Muhim eslatma:</strong> Ro'yxatdan o'tganingizdan so'ng hisobingiz kutilmoqda holatida ochiladi. Barcha darslar va materiallar administrator tasdiqlaganidan so'ng ochiladi.
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Ism <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="Ismingiz"
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Familiya <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Familiyangiz"
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Specific Method Input */}
                {authMethod === 'google' && (
                  <div className="space-y-3">
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={handleRealGoogleAuth}
                      className="w-full py-2.5 px-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:border-indigo-500 text-slate-800 dark:text-slate-100 font-bold text-xs shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.87c2.26-2.09 3.675-5.17 3.675-9.15z" />
                        <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.87-3.05c-1.08.72-2.45 1.16-4.06 1.16-3.13 0-5.78-2.11-6.73-4.96H1.25v3.15C3.26 21.36 7.34 24 12 24z" />
                        <path fill="#FBBC05" d="M5.27 14.24c-.25-.72-.38-1.49-.38-2.24s.13-1.52.38-2.24V6.61H1.25C.45 8.24 0 10.06 0 12s.45 3.76 1.25 5.39l4.02-3.15z" />
                        <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.61l4.02 3.15c.95-2.85 3.6-4.96 6.73-4.96z" />
                      </svg>
                      <span>Google hisobingiz orqali real ro'yxatdan o'tish</span>
                    </button>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        Yoki Google Elektron Pochta Manzili <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center justify-center">
                          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
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
                        </div>
                        <input
                          type="email"
                          required
                          value={emailInput}
                          onChange={(e) => setEmailInput(e.target.value)}
                          placeholder="pochta@gmail.com"
                          className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {authMethod === 'gmail' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Gmail Elektron Pochtasi <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-rose-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        placeholder="pochta@gmail.com"
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                )}

                {authMethod === 'telegram' ? (
                  <TelegramBotAuthWidget
                    mode="register"
                    firstName={firstName}
                    lastName={lastName}
                    phoneNumber={phoneNumber}
                    telegramHandle={telegramHandle}
                    setTelegramHandle={setTelegramHandle}
                    onVerified={handleTelegramVerified}
                    isSubmitting={isSubmitting}
                    onError={setAuthError}
                  />
                ) : (
                  <>
                    {/* Phone Number Input */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        Telefon Raqami (Bog'lanish uchun)
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="tel"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          placeholder="+998 90 123 45 67"
                          className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-sm font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                        Administrator siz bilan bog'lanishi va arizangizni tasdiqlashi uchun telefon raqamingizni kiriting.
                      </p>
                    </div>

                    <NeonButton
                      type="submit"
                      disabled={isSubmitting}
                      variant="primary-gradient"
                      size="md"
                      fullWidth
                      containerClassName="mt-3"
                      rightIcon={<ArrowRight className="w-4 h-4" />}
                    >
                      <span>
                        {isSubmitting
                          ? "Yuklanmoqda..."
                          : authMethod === 'google'
                          ? "Google bilan Ro'yxatdan O'tish"
                          : "Gmail bilan Ro'yxatdan O'tish"}
                      </span>
                    </NeonButton>
                  </>
                )}
              </form>
            )}

            {/* TAB 2: KIRISH FORMASI */}
            {authMode === 'login' && (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                {authMethod === 'google' && (
                  <div className="space-y-3">
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={handleRealGoogleAuth}
                      className="w-full py-2.5 px-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:border-indigo-500 text-slate-800 dark:text-slate-100 font-bold text-xs shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.87c2.26-2.09 3.675-5.17 3.675-9.15z" />
                        <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.87-3.05c-1.08.72-2.45 1.16-4.06 1.16-3.13 0-5.78-2.11-6.73-4.96H1.25v3.15C3.26 21.36 7.34 24 12 24z" />
                        <path fill="#FBBC05" d="M5.27 14.24c-.25-.72-.38-1.49-.38-2.24s.13-1.52.38-2.24V6.61H1.25C.45 8.24 0 10.06 0 12s.45 3.76 1.25 5.39l4.02-3.15z" />
                        <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.61l4.02 3.15c.95-2.85 3.6-4.96 6.73-4.96z" />
                      </svg>
                      <span>Google hisobi orqali to'g'ridan-to'g'ri kirish (Supabase OAuth)</span>
                    </button>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        Yoki Google Elektron Pochta Manzili <span className="text-indigo-600 dark:text-indigo-400">*</span>
                      </label>
                      <div className="relative">
                        <div className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center justify-center">
                          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
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
                        </div>
                        <input
                          type="email"
                          required
                          value={emailInput}
                          onChange={(e) => setEmailInput(e.target.value)}
                          placeholder="pochta@gmail.com"
                          className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {authMethod === 'gmail' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Gmail Manzilingiz <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-rose-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        placeholder="pochta@gmail.com"
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                )}

                {authMethod === 'telegram' ? (
                  <TelegramBotAuthWidget
                    mode="login"
                    telegramHandle={telegramHandle}
                    setTelegramHandle={setTelegramHandle}
                    onVerified={handleTelegramVerified}
                    isSubmitting={isSubmitting}
                    onError={setAuthError}
                  />
                ) : (
                  <NeonButton
                    type="submit"
                    disabled={isSubmitting}
                    variant="primary-gradient"
                    size="md"
                    fullWidth
                    containerClassName="mt-3"
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    <span>{isSubmitting ? "Kirilmoqda..." : "Platformaga Kirish"}</span>
                  </NeonButton>
                )}
              </form>
            )}

            {/* TAB 3: ADMIN KIRISH FORMASI */}
            {authMode === 'admin' && (
              <form onSubmit={handleAdminLoginSubmit} className="space-y-4">
                <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-800 dark:text-amber-200 text-xs flex items-start gap-2.5">
                  <ShieldCheck className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-bold">Administrator Xavfsiz Boshqaruv Tizimi:</strong>
                    Ushbu bo'lim faqat platforma ma'murlari uchun mo'ljallangan. Maxsus hisob ma'lumotlaringizni kiriting.
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Admin Logini <span className="text-amber-600 dark:text-amber-400">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={adminLogin}
                      onChange={(e) => setAdminLogin(e.target.value)}
                      placeholder="Login kiriting"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Admin Paroli <span className="text-amber-600 dark:text-amber-400">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showAdminPassword ? 'text' : 'password'}
                      required
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAdminPassword(!showAdminPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                    >
                      {showAdminPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <NeonButton
                  type="submit"
                  variant="amber"
                  size="md"
                  fullWidth
                  containerClassName="mt-3"
                  leftIcon={<ShieldCheck className="w-4 h-4" />}
                >
                  <span>Admin Boshqaruv Paneliga Kirish</span>
                </NeonButton>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default IntroView;
