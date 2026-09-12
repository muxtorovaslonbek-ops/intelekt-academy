import React, { useState, useEffect, useRef } from 'react';
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
  ArrowLeft,
  Plus,
  ChevronRight,
  CheckCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useFeedback, ensureThreadMessages } from '../../context/FeedbackContext';
import { FeedbackMessage, FeedbackType } from '../../types';
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

const TYPE_META: Record<string, { label: string; icon: React.ComponentType<{ className?: string }> }> = {
  suggestion: { label: 'Taklif', icon: Lightbulb },
  request: { label: 'Talab / Istak', icon: Target },
  opinion: { label: 'Fikr / Mulohaza', icon: MessageCircle },
  comment: { label: 'Izoh / Sharh', icon: FileText },
  question: { label: 'Savol', icon: HelpCircle },
  complaint: { label: 'Muammo / Xatolik', icon: AlertTriangle },
};

type ModalView = 'list' | 'form' | 'chat';

export const ContactAdminModal: React.FC<ContactAdminModalProps> = ({ isOpen, onClose }) => {
  const { currentUser } = useAuth();
  const { sendFeedback, sendUserMessage, getUserConversations, markThreadSeenByUser, getUnseenCountForUser } = useFeedback();

  const conversations = getUserConversations(currentUser?.id);

  const [view, setView] = useState<ModalView>('form');
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);

  const [selectedType, setSelectedType] = useState<FeedbackType>('suggestion');
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [userTelegram, setUserTelegram] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [rating, setRating] = useState<number>(5);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [soundOn, setSoundOn] = useState<boolean>(() => isSoundEnabled());
  const [chatInput, setChatInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // When the modal opens, decide which screen to show: if the user already
  // has murojaat threads, show the list first; otherwise go straight to the
  // form so first-time users aren't stuck on an empty list.
  useEffect(() => {
    if (!isOpen) return;
    if (conversations.length > 0) {
      setView('list');
    } else {
      setView('form');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

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

  const activeThread: FeedbackMessage | undefined = conversations.find((c) => c.id === activeThreadId);

  // Mark the open thread as seen (clears its unread badge) and keep the chat
  // scrolled to the latest message whenever it updates (real-time replies).
  useEffect(() => {
    if (view === 'chat' && activeThreadId) {
      markThreadSeenByUser(activeThreadId);
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, activeThreadId, activeThread?.messages?.length]);

  if (!isOpen) return null;

  const openThread = (id: string) => {
    setActiveThreadId(id);
    setView('chat');
  };

  const startNewRequest = () => {
    setSubject('');
    setMessage('');
    setErrorMsg(null);
    setView('form');
  };

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
      const created = await sendFeedback({
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

      setSubject('');
      setMessage('');

      // Logged-in users go straight into the chat thread for what they just
      // sent, so a reply from the admin shows up right there.
      if (currentUser?.id) {
        setActiveThreadId(created.id);
        setView('chat');
      } else {
        onClose();
      }
    } catch {
      setErrorMsg('Xatolik yuz berdi. Iltimos, qayta urinib ko\'ring.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendChatMessage = () => {
    if (!activeThreadId || !chatInput.trim()) return;
    sendUserMessage(activeThreadId, chatInput);
    setChatInput('');
  };

  const headerTitle =
    view === 'chat' ? activeThread?.subject || 'Suhbat' : view === 'list' ? "Murojaatlarim" : "Admin Bilan Bog'lanish";
  const headerSubtitle =
    view === 'chat'
      ? "Admin javob yozganda shu yerda ko'rinadi — bemalol yozishingiz mumkin."
      : view === 'list'
      ? "Yuborgan murojaatlaringiz va admin javoblari."
      : "Talab, taklif, fikr va izohlaringizni to'g'ridan-to'g'ri bosh ma'muriyatga qoldiring.";

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
          className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl shadow-2xl p-5 sm:p-7 z-10 my-auto text-slate-900 dark:text-white max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              {view === 'chat' && conversations.length > 0 ? (
                <button
                  type="button"
                  onClick={() => setView('list')}
                  className="w-11 h-11 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer shrink-0"
                  title="Ro'yxatga qaytish"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              ) : (
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 shrink-0">
                  <MessageSquarePlus className="w-6 h-6" />
                </div>
              )}
              <div className="min-w-0">
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2 truncate">
                  <span className="truncate">{headerTitle}</span>
                  {view !== 'chat' && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 shrink-0">
                      Murojaat Markazi
                    </span>
                  )}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                  {headerSubtitle}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
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

          {/* LIST VIEW: past murojaat threads for this user */}
          {view === 'list' && (
            <div className="mt-4 flex-1 min-h-0 flex flex-col">
              <button
                type="button"
                onClick={startNewRequest}
                className="mb-3 shrink-0 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-md shadow-indigo-600/20 transition-all hover:scale-[1.01] cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Yangi Murojaat Yuborish</span>
              </button>

              <div className="space-y-2 overflow-y-auto pr-1">
                {conversations
                  .slice()
                  .sort((a, b) => (a.id < b.id ? 1 : -1))
                  .map((thread) => {
                    const meta = TYPE_META[thread.type] || TYPE_META.comment;
                    const TypeIcon = meta.icon;
                    const threadMessages = ensureThreadMessages(thread);
                    const lastMsg = threadMessages[threadMessages.length - 1];
                    const unseen = getUnseenCountForUser(thread);
                    return (
                      <button
                        key={thread.id}
                        type="button"
                        onClick={() => openThread(thread.id)}
                        className="w-full text-left p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer flex items-center gap-3"
                      >
                        <span className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-300 flex items-center justify-center shrink-0">
                          <TypeIcon className="w-4 h-4" />
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                              {thread.subject}
                            </span>
                            {unseen > 0 && (
                              <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0 animate-pulse" />
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                            {lastMsg?.sender === 'admin' ? 'Admin: ' : 'Siz: '}
                            {lastMsg?.text}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              thread.status === 'new'
                                ? 'bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300'
                                : thread.status === 'reviewed'
                                ? 'bg-sky-100 dark:bg-sky-950/70 text-sky-700 dark:text-sky-300'
                                : 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300'
                            }`}
                          >
                            {thread.status === 'new' && 'Yangi'}
                            {thread.status === 'reviewed' && 'Javob berildi'}
                            {thread.status === 'resolved' && 'Bajarildi'}
                          </span>
                          <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600" />
                        </div>
                      </button>
                    );
                  })}
              </div>
            </div>
          )}

          {/* CHAT VIEW: two-way conversation for a single murojaat */}
          {view === 'chat' && activeThread && (
            <div className="mt-4 flex-1 min-h-0 flex flex-col">
              <div className="flex-1 min-h-0 overflow-y-auto space-y-3 pr-1 pb-2">
                {ensureThreadMessages(activeThread).map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap ${
                        msg.sender === 'user'
                          ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-br-sm'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-bl-sm'
                      }`}
                    >
                      <p>{msg.text}</p>
                      <div
                        className={`mt-1 flex items-center gap-1 text-[10px] ${
                          msg.sender === 'user' ? 'text-indigo-100/80 justify-end' : 'text-slate-400'
                        }`}
                      >
                        {msg.sender === 'admin' && <ShieldBadge />}
                        <span>{msg.createdAt}</span>
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input */}
              <div className="pt-3 mt-1 border-t border-slate-100 dark:border-slate-800 flex items-end gap-2 shrink-0">
                <textarea
                  rows={1}
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendChatMessage();
                    }
                  }}
                  placeholder="Xabaringizni yozing..."
                  className="flex-1 resize-none px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                />
                <button
                  type="button"
                  onClick={handleSendChatMessage}
                  disabled={!chatInput.trim()}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-md shadow-indigo-600/25 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shrink-0 flex items-center justify-center"
                  title="Yuborish"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* FORM VIEW: start a new murojaat */}
          {view === 'form' && (
            <form onSubmit={handleSubmit} className="mt-5 space-y-5 overflow-y-auto pr-1">
              {conversations.length > 0 && (
                <button
                  type="button"
                  onClick={() => setView('list')}
                  className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Murojaatlarim ro'yxatiga qaytish</span>
                </button>
              )}

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
                    onClick={conversations.length > 0 ? () => setView('list') : onClose}
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

// Tiny inline "verified admin" badge shown next to admin chat timestamps.
const ShieldBadge: React.FC = () => (
  <span className="inline-flex items-center justify-center w-3 h-3 rounded-full bg-indigo-500 text-white">
    <CheckCheck className="w-2 h-2" />
  </span>
);
