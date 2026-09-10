import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Sparkles, Send, Compass, Award, BookOpen, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import { useCourses } from '../../context/CourseContext';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  time: string;
}

export const FloatingAiChat: React.FC = () => {
  const { currentUser } = useAuth();
  const { courses } = useCourses();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-msg',
      sender: 'assistant',
      text: `Assalomu alaykum ${currentUser?.firstName || 'qadrli talaba'}! Men "AI Future" platformasining sun'iy intellekt bo'yicha shaxsiy tyutoriman. Kurslar, darslar, prompt injiniring yoki sertifikat olish bo'yicha har qanday savolingizga javob berishga tayyorman!`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Quick suggestion chips
  const suggestions = [
    "Sertifikat olish shartlari",
    "Prompt injiniring asoslari",
    "Mavjud kurslar ro'yxati",
    "Dars videolarini ko'rish tartibi"
  ];

  const generateSmartReply = (userQuery: string): string => {
    const q = userQuery.toLowerCase();

    if (q.includes('sertifikat') || q.includes('diplom') || q.includes('test')) {
      return `AI Future platformasida sertifikat olish uchun "Testlar" bo'limiga o'ting va tanlangan yo'nalish bo'yicha imtihondan kamida 60% ball to'plang. Muvaffaqiyatli topshirganingizdan so'ng, verifikatsiya QR-kodiga ega xalqaro darajadagi raqamli sertifikat avtomatik tarzda yaratiladi va profilingizda saqlanadi!`;
    }

    if (q.includes('kurs') || q.includes('dars') || q.includes('ro\'yxat')) {
      const activeTitles = courses.slice(0, 3).map(c => `• ${c.title}`).join('\n');
      return `Hozirda platformada ${courses.length} ta zamonaviy AI kurslari mavjud:\n${activeTitles}\nHar bir dars Bunny.net xavfsiz video strimi va interaktiv materiallar bilan jihozlangan. "Kurslar" bo'limiga kirib o'rganishni boshlashingiz mumkin!`;
    }

    if (q.includes('video') || q.includes('ochilmayapti') || q.includes('ijozat') || q.includes('status') || q.includes('pending')) {
      if (currentUser?.status === 'pending') {
        return `Hurmatli ${currentUser.firstName}, sizning akkauntingiz hozirda "Kutilmoqda" (Pending) holatida. Platforma ma'murlari (Admin) arizangizni tasdiqlaganidan (Approved) so'ng barcha himoyalangan video darslar to'liq ochiladi. Iltimos, admin javobini kuting.`;
      }
      return `Darslarimiz xavfsiz Bunny.net CDN va dinamik suv belgisi (anti-piracy watermark) orqali uzatiladi. Har qanday qurilmada yuqori sifatda tomosha qilishingiz mumkin.`;
    }

    if (q.includes('prompt') || q.includes('chatgpt') || q.includes('claude') || q.includes('midjourney')) {
      return `Prompt Injiniring bo'yicha oltin qoida: Modelga aniq rol bering (Masalan: "Sen tajribali dasturchisan"), vazifani kontekst bilan tushuntiring va kutilayotgan natija formatini belgilang (Masalan: "JSON yoki punktlar shaklida"). AI Future kurslarimizda bunga batafsil to'xtalamiz!`;
    }

    if (q.includes('salom') || q.includes('assalom') || q.includes('qalesan')) {
      return `Assalomu alaykum! AI Future platformasida o'rganishingiz samarali bo'lishi uchun yordam berishdan mamnunman. Sizni qaysi yo'nalish ko'proq qiziqtiradi: Dasturlash, Sun'iy Intellekt modellarini sozlash yoki Test sinovlarimi?`;
    }

    return `"${userQuery}" bo'yicha savolingiz qabul qilindi. AI Future ekotizimida ta'lim materiallari muntazam yangilanib boradi. Barcha mavzularni to'liq o'zlashtirish uchun dars videolarini ketma-ketlikda ko'rib, har bir mavzu yakunidagi amaliy topshiriqlarni bajarishingizni maslahat beraman!`;
  };

  const handleSend = (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    setTimeout(() => {
      const replyText = generateSmartReply(text);
      const assistantMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: replyText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 700);
  };

  return (
    <>
      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          id="floating-ai-btn"
          onClick={() => setIsOpen(!isOpen)}
          className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-cyan-500 text-white shadow-xl shadow-indigo-600/30 flex items-center justify-center hover:scale-105 active:scale-95 transition-all cursor-pointer border border-white/20"
          aria-label="AI Yordamchini ochish"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Sparkles className="w-6 h-6 animate-pulse" />}
        </button>
      </div>

      {/* Floating Chat Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="floating-ai-window"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-6 w-96 max-w-[calc(100vw-2.5rem)] h-[520px] bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl z-40 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-700 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20">
                  <Bot className="w-5 h-5 text-cyan-300" />
                </div>
                <div>
                  <h4 className="text-sm font-bold leading-tight flex items-center gap-1.5">
                    AI Future Tyutor
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  </h4>
                  <p className="text-[11px] text-white/80">Sun'iy Intellekt shaxsiy maslahatchisi</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-xl text-white/80 hover:text-white hover:bg-white/15 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Suggestions Chips */}
            <div className="px-3 py-2 bg-slate-50 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800/80 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {suggestions.map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(chip)}
                  className="px-2.5 py-1 rounded-full text-[10px] font-semibold whitespace-nowrap bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-indigo-500 hover:text-indigo-600 transition-all shrink-0 cursor-pointer"
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] p-3.5 rounded-2xl leading-relaxed whitespace-pre-line ${
                      m.sender === 'user'
                        ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-tr-none shadow-md shadow-indigo-600/10'
                        : 'bg-slate-100 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-200/50 dark:border-slate-700/50'
                    }`}
                  >
                    {m.text}
                    <div
                      className={`text-[9px] mt-1.5 text-right font-mono ${
                        m.sender === 'user' ? 'text-indigo-200' : 'text-slate-400'
                      }`}
                    >
                      {m.time}
                    </div>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center gap-2 rounded-tl-none">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-500" />
                    <span className="text-[11px] font-medium">AI javob tayyorlamoqda...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="AI ga savolingizni yozing..."
                  className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-40 transition-all cursor-pointer shadow-md shadow-indigo-600/20"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

