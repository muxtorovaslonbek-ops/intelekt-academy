import React, { useState, useEffect, useRef } from 'react';
import {
  TELEGRAM_BOT_USERNAME,
  createTelegramAuthSession,
  getActiveTelegramAuthSession,
  verifyTelegramCode,
  getTelegramBotLink,
  startTelegramBotPolling,
  TelegramAuthSession,
} from '../../lib/telegramBot';
import { Send, CheckCircle2, RefreshCw, ExternalLink, ShieldCheck, KeyRound, Sparkles, MessageCircle } from 'lucide-react';

interface TelegramBotAuthWidgetProps {
  mode: 'register' | 'login';
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  telegramHandle: string;
  setTelegramHandle: (handle: string) => void;
  onVerified: (code: string, session?: TelegramAuthSession) => Promise<void> | void;
  isSubmitting: boolean;
  onError: (msg: string | null) => void;
}

export const TelegramBotAuthWidget: React.FC<TelegramBotAuthWidgetProps> = ({
  mode,
  firstName = '',
  lastName = '',
  phoneNumber = '',
  telegramHandle,
  setTelegramHandle,
  onVerified,
  isSubmitting,
  onError,
}) => {
  const [codeRequested, setCodeRequested] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [session, setSession] = useState<TelegramAuthSession | null>(null);
  const [autoDetected, setAutoDetected] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const cooldownTimerRef = useRef<any>(null);

  // Initialize or resume existing session and start bot polling immediately
  useEffect(() => {
    const existing = getActiveTelegramAuthSession();
    if (existing) {
      setSession(existing);
      setCodeRequested(true);
    }

    const stopPolling = startTelegramBotPolling((detectedCode, fromUser) => {
      setVerificationCode(detectedCode);
      setAutoDetected(true);
      setCodeRequested(true);
      if (fromUser?.username && (!telegramHandle || telegramHandle === '@')) {
        setTelegramHandle(`@${fromUser.username}`);
      }
    });

    return () => {
      stopPolling();
    };
  }, [telegramHandle, setTelegramHandle]);

  // Cooldown countdown effect
  useEffect(() => {
    if (resendCooldown > 0) {
      cooldownTimerRef.current = setTimeout(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (cooldownTimerRef.current) clearTimeout(cooldownTimerRef.current);
    };
  }, [resendCooldown]);

  // Request code from bot
  const handleRequestCode = () => {
    onError(null);
    const cleanHandle = telegramHandle.trim();
    if (!cleanHandle || cleanHandle === '@') {
      onError("Iltimos, Telegram @username'ingizni kiriting (Masalan: @alijon).");
      return;
    }

    if (mode === 'register' && (!firstName.trim() || !lastName.trim())) {
      onError("Iltimos, ism va familiyangizni to'liq kiriting.");
      return;
    }

    const newSession = createTelegramAuthSession({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phoneNumber: phoneNumber.trim(),
      telegramHandle: cleanHandle.startsWith('@') ? cleanHandle : `@${cleanHandle}`,
    });

    setSession(newSession);
    setCodeRequested(true);
    setResendCooldown(60);
    setVerificationCode('');
    setAutoDetected(false);

    // Open bot link automatically
    const botUrl = getTelegramBotLink(newSession.code);
    window.open(botUrl, '_blank');
  };

  // Verify entered code
  const handleVerifySubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    onError(null);

    if (!verificationCode.trim() || verificationCode.trim().length < 6) {
      onError("Iltimos, botdan kelgan 6 xonali kodni kiriting.");
      return;
    }

    const result = verifyTelegramCode(verificationCode);
    if (!result.success) {
      onError(result.error || "Noto'g'ri kod kiritildi.");
      return;
    }

    onVerified(verificationCode, result.session);
  };

  return (
    <div className="space-y-3.5 bg-sky-50/70 dark:bg-sky-950/30 p-4 rounded-2xl border border-sky-200/90 dark:border-sky-800/80 shadow-sm">
      {/* Bot Identity Header */}
      <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-sky-100 dark:border-sky-900/50">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 text-white flex items-center justify-center shadow-md shadow-sky-500/20 shrink-0">
            <Send className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5 flex-wrap">
              <span>EduPlatform Telegram Boti</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-sky-100 dark:bg-sky-900/80 text-sky-700 dark:text-sky-300 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                @{TELEGRAM_BOT_USERNAME}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Tasdiqlash kodi rasmiy botimiz orqali yuboriladi
            </p>
          </div>
        </div>

        <a
          href={getTelegramBotLink(session?.code)}
          target="_blank"
          rel="noopener noreferrer"
          className="px-2.5 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold flex items-center gap-1 shrink-0 shadow-sm transition-all"
        >
          <span>Botni Ochish</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* Step 1: Telegram Handle Input */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
          Telegram foydalanuvchi nomi (@username)
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-sky-500">
            <MessageCircle className="w-4 h-4" />
          </div>
          <input
            type="text"
            required
            value={telegramHandle}
            onChange={(e) => {
              const val = e.target.value;
              if (!val.startsWith('@') && val.length > 0) {
                setTelegramHandle(`@${val}`);
              } else {
                setTelegramHandle(val);
              }
            }}
            placeholder="@foydalanuvchi"
            className="w-full pl-9 pr-3.5 py-2 rounded-xl text-xs font-mono bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
          />
        </div>
        <p className="text-[10px] text-slate-400 mt-1">
          Telegram profilingizdagi @username'ni kiriting (Masalan: @alijon).
        </p>
      </div>

      {/* Action: Request Code or Direct Enter */}
      {!codeRequested ? (
        <div className="space-y-2 pt-1">
          <button
            type="button"
            onClick={handleRequestCode}
            disabled={isSubmitting}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-bold text-xs shadow-md shadow-sky-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
          >
            <Send className="w-4 h-4" />
            <span>@{TELEGRAM_BOT_USERNAME} orqali Kod Olish</span>
          </button>

          <button
            type="button"
            onClick={() => setCodeRequested(true)}
            className="w-full text-center text-xs text-sky-600 dark:text-sky-400 hover:underline font-medium py-1 cursor-pointer"
          >
            Botdan kod oldingizmi? Kodni to'g'ridan-to'g'ri kiritish →
          </button>
        </div>
      ) : (
        /* Step 2: Verification Code Input Area */
        <div className="space-y-3 pt-1">
          {/* Direct Link & Instructions Box */}
          <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-sky-200 dark:border-sky-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-sky-500" />
                <span>Tasdiqlash ko'rsatmasi:</span>
              </span>
              {autoDetected && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 animate-pulse">
                  <CheckCircle2 className="w-3 h-3" />
                  Botdan qabul qilindi!
                </span>
              )}
            </div>

            <ol className="text-[11px] text-slate-600 dark:text-slate-300 space-y-1 list-decimal list-inside leading-relaxed">
              <li>
                <strong>@{TELEGRAM_BOT_USERNAME}</strong> botini oching;
              </li>
              <li>
                Botda <strong>Start</strong> tugmasini bosing yoki <strong>/code</strong> yuboring;
              </li>
              <li>
                Bot javobida kelgan 6 xonali kodni kiriting:
              </li>
            </ol>

            <a
              href={getTelegramBotLink(session?.code)}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2 rounded-lg bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Telegram Botni Ochish (@{TELEGRAM_BOT_USERNAME})</span>
              <ExternalLink className="w-3.5 h-3.5 ml-1" />
            </a>
          </div>

          {/* Code Input Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              6 xonali tasdiqlash kodi:
            </label>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <input
                type="text"
                maxLength={6}
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                placeholder="482910"
                className="w-full sm:flex-1 min-w-0 px-3 py-2.5 rounded-xl text-center text-lg font-mono font-black tracking-widest bg-white dark:bg-slate-900 border-2 border-sky-400 dark:border-sky-600 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
              <button
                type="button"
                onClick={() => handleVerifySubmit()}
                disabled={isSubmitting || verificationCode.length < 6}
                className="w-full sm:w-auto sm:shrink-0 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Tasdiqlash</span>
              </button>
            </div>
          </div>

          {/* Resend & Status Footer */}
          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Bot faol va kutilmoqda</span>
            </span>

            <button
              type="button"
              disabled={resendCooldown > 0}
              onClick={handleRequestCode}
              className="text-sky-600 dark:text-sky-400 hover:underline font-semibold disabled:text-slate-400 flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className={`w-3 h-3 ${resendCooldown > 0 ? 'animate-spin' : ''}`} />
              <span>
                {resendCooldown > 0
                  ? `Kodni qayta olish (${resendCooldown}s)`
                  : 'Yangi kod olish'}
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
