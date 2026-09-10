import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Send,
  MessageSquarePlus,
  Sparkles,
  Lightbulb,
  Target,
  MessageCircle,
  HelpCircle,
  AlertTriangle,
  FileText,
  Star,
  CheckCircle2,
  Phone,
  Mail,
  SendHorizontal,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useFeedback } from '../../context/FeedbackContext';
import { FeedbackType } from '../../types';
import { isSoundEnabled, toggleSoundEnabled, playNotificationSound } from '../../utils/audio';

interface ContactAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FEEDBACK_TYPES: Array<{
  id: FeedbackType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  description: string;
}> = [
  {
    id: 'suggestion',
    label: 'Taklif',
    icon: Lightbulb,
    color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800',
    description: 'Platformani rivojlantirish va yaxshilash takliflari',
  },
  {
    id: 'request',
    label: 'Talab / Istak',
    icon: Target,
    color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800',
    description: 'Yangi kurslar, darsliklar yoki mavzular talabi',
  },
  {
    id: 'opinion',
    label: 'Fikr / Mulohaza',
    icon: MessageCircle,
    color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800',
    description: 'Platforma sifat va qulayligi haqida fikringiz',
  },
  {
    id: 'comment',
    label: 'Izoh / Sharh',
    icon: FileText,
    color: 'text-cyan-500 bg-cyan-50 dark:bg-cyan-950/40 border-cyan-200 dark:border-cyan-800',
    description: 'Darslar yoki testlar yuzasidan izohingiz',
  },
  {
    id: 'question',
    label: 'Savol',
    icon: HelpCircle,
    color: 'text-violet-500 bg-violet-50 dark:bg-violet-950/40 border-violet-200 dark:border-violet-800',
    description: 'O\'quv jarayoni yoki admin jamoasiga savol',
  },
  {
    id: 'complaint',
    label: 'Muammo / Xatolik',
    icon: AlertTriangle,
    color: 'text-rose-500 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800',
    description: 'Texnik nosozlik yoki takomillashtirish zarurati',
  },
];

export const ContactAdminModal: React.FC<ContactAdminModalProps> = ({ isOpen, onClose }) => {
  const { currentUser } = useAuth();
  const { sendFeedback } = useFeedback();

  const [selectedType, setSelectedType] = useState<FeedbackType>('suggestion');
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [userTelegram, setUserTelegram] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [rating, setRating] = useState<number>(5);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [soundOn, setSoundOn] = useState<boolean>(() => isSoundEnabled());

  // Synchronize sound state across all components
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

  // Auto-fill user information if logged in
  useEffect(() => {
    if (currentUser) {
      setUserName(`${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() || 'Hurmatli Talaba');
      if (currentUser.email) setUserEmail(currentUser.email);
      if (currentUser.phoneNumber) setUserPhone(currentUser.phoneNumber);
      if (currentUser.telegramHandle) setUserTelegram(currentUser.telegramHandle);
    }
  }, [currentUser, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim()) {
      setErrorMsg('Iltimos, ismingizni kiriting.');
      return;
    }
    if (!subject.trim()) {
      setErrorMsg('Iltimos, murojaat mavzusini kiriting.');
      return;
    }
    if (!message.trim()) {
      setErrorMsg('Iltimos, xabar yoki taklifingiz matnini batafsil yozing.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      await sendFeedback({
        userName,
        userEmail: userEmail || undefined,
        userPhone: userPhone || undefined,
        userTelegram: userTelegram || undefined,
        type: selectedType,
        subject,
        message,
        rating,
        userId: currentUser?.id,
      });

      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setSubject('');
        setMessage('');
        onClose();
      }, 2500);
    } catch {
      setErrorMsg('Xatolik yuz berdi. Iltimos, qayta urinib ko\'ring.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTestSound = () => {
    playNotificationSound('chime');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
        />

        {/* Modal Dialog Card */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 15 }}
          className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl shadow-2xl p-5 sm:p-7 z-10 my-auto text-slate-900 dark:text-white max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                <MessageSquarePlus className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Admin Bilan Bog'lanish</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                    Murojaat Markazi
                  </span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Talab, taklif, fikr va izohlaringizni to'g'ridan-to'g'ri bosh ma'muriyatga qoldiring.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Sound Toggle Button */}
              <button
                type="button"
                onClick={handleToggleSound}
                title={soundOn ? "Tovushni o'chirish (Mute)" : "Tovushni yoqish (Unmute)"}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  soundOn
                    ? 'bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                }`}
              >
                {soundOn ? (
                  <>
                    <Volume2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    <span className="hidden sm:inline">Tovush: Yoqiq</span>
                  </>
                ) : (
                  <>
                    <VolumeX className="w-3.5 h-3.5 text-rose-500" />
                    <span className="hidden sm:inline">Tovush: O'chiq</span>
                  </>
                )}
              </button>

              <button
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title="Yopish"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Success Notification State */}
          {isSuccess ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-12 text-center space-y-4"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto ring-8 ring-emerald-50 dark:ring-emerald-950/30">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  Murojaatingiz Qabul Qilindi!
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                  Siz qoldirgan fikr, talab yoki taklif bosh administrator paneli tizimiga muvaffaqiyatli yetkazildi. Rahmat!
                </p>
              </div>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-5 space-y-5">
              {/* 1. Select Feedback Category */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Murojaat Turi:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {FEEDBACK_TYPES.map((t) => {
                    const IconComp = t.icon;
                    const isSelected = selectedType === t.id;
                    return (
                      <button
                        type="button"
                        key={t.id}
                        onClick={() => setSelectedType(t.id)}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/50 shadow-sm ring-1 ring-indigo-500/30'
                            : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-100/60 dark:hover:bg-slate-800/80'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className={`p-1.5 rounded-lg border text-xs ${t.color}`}>
                            <IconComp className="w-3.5 h-3.5" />
                          </span>
                          <span className={`text-xs font-bold ${isSelected ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-800 dark:text-slate-200'}`}>
                            {t.label}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                          {t.description}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Sender Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Ism va Familiyangiz *
                  </label>
                  <input
                    type="text"
                    required
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="Masalan: Aslonbek Muxtorov"
                    className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Elektron Pochta (Gmail / Mail)
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                      placeholder="pochta@gmail.com"
                      className="w-full pl-9 pr-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Telegram Foydalanuvchi Nomi
                  </label>
                  <div className="relative">
                    <span className="text-slate-400 font-bold text-xs absolute left-3.5 top-2">@</span>
                    <input
                      type="text"
                      value={userTelegram}
                      onChange={(e) => setUserTelegram(e.target.value.replace(/^@/, ''))}
                      placeholder="username (ixtiyoriy)"
                      className="w-full pl-8 pr-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Telefon Raqamingiz
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="tel"
                      value={userPhone}
                      onChange={(e) => setUserPhone(e.target.value)}
                      placeholder="+998 90 123 45 67"
                      className="w-full pl-9 pr-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* 3. Subject and Rating */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Mavzu / Qisqacha Mazmuni *
                  </label>

                  {/* Rating Stars */}
                  <div className="flex items-center gap-1">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 mr-1">
                      Platforma bahosi:
                    </span>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="cursor-pointer transition-transform hover:scale-110"
                      >
                        <Star
                          className={`w-4 h-4 ${
                            star <= rating
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-slate-300 dark:text-slate-600'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Masalan: Dasturlash yo'nalishiga amaliy topshiriqlar qo'shish taklifi"
                  className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                />
              </div>

              {/* 4. Message Content */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Batafsil Xabar, Fikr, Talab yoki Izohingiz *
                </label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Taklif, fikr yoki mulohazangizni batafsil yozing. Sizning fikringiz platforma rivoji uchun nihoyatda qimmatli..."
                  className="w-full p-3 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white leading-relaxed resize-none"
                />
              </div>

              {/* Error Message */}
              {errorMsg && (
                <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Footer Actions */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Xabaringiz zudlik bilan bosh admin panelida ko'rinadi</span>
                </p>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                  >
                    Bekor qilish
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-md shadow-indigo-600/25 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <SendHorizontal className="w-3.5 h-3.5" />
                    <span>{isSubmitting ? 'Yuborilmoqda...' : 'Adminga Yuborish'}</span>
                  </button>
                </div>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
