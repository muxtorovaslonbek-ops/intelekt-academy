import React, { useState } from 'react';
import {
  TELEGRAM_BOT_USERNAME,
  verifyTelegramCode,
  getTelegramBotLink,
  TelegramAuthSession,
} from '../../lib/telegramBot';
import { Send, CheckCircle2, ExternalLink, KeyRound, MessageCircle, Loader2 } from 'lucide-react';

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

// XAVFSIZ OQIM:
// 1. Foydalanuvchi "Botni ochish" tugmasini bosadi -> Telegram'da @edusatbot
//    ochiladi -> u yerda "Start" tugmasini bosadi (yoki istalgan xabar yozadi).
// 2. Server (webhook) darhol 6 xonali kodni generatsiya qilib, o'sha
//    foydalanuvchining shaxsiy Telegram chatiga yuboradi.
// 3. Foydalanuvchi shu kodni saytga qaytib kiritadi -> kod serverda
//    (Supabase'dagi maxfiy jadvalda) tekshiriladi.
// Kodning o'zi hech qachon brauzerda saqlanmaydi/generatsiya qilinmaydi,
// shu sababli uni soxtalashtirib bo'lmaydi.
export const TelegramBotAuthWidget: React.FC<TelegramBotAuthWidgetProps> = ({
  telegramHandle,
  setTelegramHandle,
  onVerified,
  isSubmitting,
  onError,
}) => {
  const [botOpened, setBotOpened] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const handleOpenBot = () => {
    onError(null);
    setBotOpened(true);
    window.open(getTelegramBotLink(), '_blank', 'noopener,noreferrer');
  };

  const handleVerifySubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    onError(null);

    const clean = verificationCode.trim();
    if (!clean || clean.length < 6) {
      onError("Iltimos, botdan kelgan 6 xonali kodni kiriting.");
      return;
    }

    setIsVerifying(true);
    try {
      const result = await verifyTelegramCode(clean);
      if (!result.success) {
        onError(result.error || "Noto'g'ri kod kiritildi.");
        return;
      }

      // Server tasdiqlagan haqiqiy Telegram handle'ni (agar mavjud bo'lsa)
      // foydalanuvchi qo'lda kiritgan qiymat o'rniga ishlatamiz — bu orqali
      // boshqa birovning @username'ini yozib qo'yishning oldi olinadi.
      if (result.session?.telegramHandle && (!telegramHandle || telegramHandle === '@')) {
        setTelegramHandle(result.session.telegramHandle);
      }

      await onVerified(clean, result.session);
    } finally {
      setIsVerifying(false);
    }
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
              <span>Intellekt Academy Telegram Boti</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-sky-100 dark:bg-sky-900/80 text-sky-700 dark:text-sky-300 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                @{TELEGRAM_BOT_USERNAME}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Tasdiqlash kodi rasmiy botimiz orqali, faqat sizning shaxsiy chatingizga yuboriladi
            </p>
          </div>
        </div>
      </div>

      {/* Step 1: Open the bot */}
      <div className="space-y-2 pt-1">
        <a
          href={getTelegramBotLink()}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleOpenBot}
          className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-bold text-xs shadow-md shadow-sky-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
        >
          <Send className="w-4 h-4" />
          <span>@{TELEGRAM_BOT_USERNAME} botini ochish</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>

        <ol className="text-[11px] text-slate-600 dark:text-slate-300 space-y-1 list-decimal list-inside leading-relaxed px-1">
          <li>Yuqoridagi tugma orqali botni oching;</li>
          <li>
            Botda <strong>Start</strong> tugmasini bosing (yoki istalgan xabar yuboring);
          </li>
          <li>Bot sizga shaxsiy xabar sifatida 6 xonali kod yuboradi — o'sha kodni pastga kiriting.</li>
        </ol>
      </div>

      {/* Optional: telegram handle for display purposes */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
          Telegram foydalanuvchi nomi (@username) — ixtiyoriy
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-sky-500">
            <MessageCircle className="w-4 h-4" />
          </div>
          <input
            type="text"
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
          Kodni to'g'ri kiritsangiz, haqiqiy Telegram hisobingiz avtomatik aniqlanadi.
        </p>
      </div>

      {/* Step 2: Code Input Field */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
          <KeyRound className="w-3.5 h-3.5 text-sky-500" />
          <span>Botdan kelgan 6 xonali tasdiqlash kodi:</span>
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
            disabled={isSubmitting || isVerifying || verificationCode.length < 6}
            className="w-full sm:w-auto sm:shrink-0 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
          >
            {isVerifying ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCircle2 className="w-4 h-4" />
            )}
            <span>Tasdiqlash</span>
          </button>
        </div>
        {botOpened && (
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1.5 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Bot ochildi — kod kelishi bilan shu yerga kiriting (5 daqiqa amal qiladi)
          </p>
        )}
      </div>
    </div>
  );
};
