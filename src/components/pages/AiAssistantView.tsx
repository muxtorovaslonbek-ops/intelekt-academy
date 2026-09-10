import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  Code2,
  BookOpen,
  HelpCircle,
  Trash2,
  Copy,
  Check,
  User,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: 'm-1',
    sender: 'assistant',
    text: "Assalomu alaykum! Men EduPlatform ning Sun'iy Intellekt ta'lim yordamchisiman. Dasturlash, matematika, chet tillari yoki oraliq testlar bo'yicha qanday savolingiz bor?",
    timestamp: 'Hozir',
  },
];

const SUGGESTIONS = [
  "React da useTransition va Suspense farqi nima?",
  "Python da list comprehension qanday ishlaydi?",
  "IELTS Writing Task 2 uchun kuchli kirish qismi namunasi",
  "Kombinatorika bo'yicha qisqa tushuncha bering",
];

export const AiAssistantView: React.FC = () => {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    // Smart contextual response generator in Uzbek
    setTimeout(() => {
      let botResponse = '';
      const lower = text.toLowerCase();

      if (lower.includes('react') || lower.includes('transition') || lower.includes('hook')) {
        botResponse = `React 18 da **useTransition** va **Suspense** ilovaning tezkorligi (responsiveness) uchun xizmat qiladi:\n\n1. **useTransition**: Shoshilinch bo'lmagan state yangilanishlarini past ustuvorlikda bajarishga imkon beradi. Natijada foydalanuvchi klaviaturada yozayotganda yoki tugmani bosganda UI qotib qolmaydi.\n\n2. **Suspense**: Ma'lumotlar yuklanayotganda kutish holatini (fallback UI, masalan skelton) chiroyli ko'rsatish uchun ishlatiladi.\n\nMisol kod:\n\`\`\`tsx\nconst [isPending, startTransition] = useTransition();\n\nstartTransition(() => {\n  setFilterQuery(value); // sekin yangilanish\n});\n\`\`\``;
      } else if (lower.includes('python') || lower.includes('list')) {
        botResponse = `Python da **List Comprehension** ro'yxat yaratishning eng qisqa va qulay sintaksisidir:\n\n\`\`\`python\n# Standart usul:\nkvadratlar = []\nfor x in range(1, 6):\n    kvadratlar.append(x**2)\n\n# List comprehension usuli:\nkvadratlar = [x**2 for x in range(1, 6) if x % 2 == 0]\nprint(kvadratlar) # [4, 16]\n\`\`\`\nBu kod ancha tezroq ishlaydi va o'qish uchun soddadir!`;
      } else if (lower.includes('ielts') || lower.includes('writing') || lower.includes('ingliz')) {
        botResponse = `IELTS Writing Task 2 da yuqori ball (Band 7.0+) olish uchun kirish (Introduction) qismini 2 ta gapda yozish tavsiya etiladi:\n\n1. **Paraphrase the prompt** (Savolni o'z so'zlaringiz bilan qayta bayon qilish):\n*"It is often argued that technological advancements have revolutionized contemporary education."*\n\n2. **Thesis statement** (O'z shaxsiy pozitsiyangizni aniq ko'rsatish):\n*"In my opinion, while digital platforms enhance accessibility, traditional classroom interactions remain indispensable for holistic development."*`;
      } else if (lower.includes('matematika') || lower.includes('kombinatorika') || lower.includes('formula')) {
        botResponse = `Kombinatorika - narsalarni tanlash va joylashtirish usullari sonini o'rganadi. Asosiy formulalar:\n\n1. **O'rin almashtirish (Permutatsiya)**: P_n = n!\n2. **Joylashtirish (A)**: A_n^k = n! / (n - k)!\n3. **Guruhlash (Kombinatsiya - C)**: C_n^k = n! / (k! * (n - k)!)\n\nMasalan, 10 kishidan 3 kishilik delegatsiya tanlash: C_10^3 = (10 * 9 * 8) / (3 * 2 * 1) = 120 xil usul.`;
      } else {
        botResponse = `Savolingiz uchun rahmat! "${text}" mavzusi bo'yicha EduPlatform tizimidagi darsliklar va testlarni tavsiya qilaman. Agar biror formula, kod namunasi yoki tushunarsiz mavzu bo'lsa, aniqroq so'rashingiz mumkin!`;
      }

      const botMessage: Message = {
        id: `msg-${Date.now() + 1}`,
        sender: 'assistant',
        text: botResponse,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMessage]);
      setIsTyping(false);
    }, 900);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div id="ai-assistant-page" className="max-w-4xl mx-auto h-[calc(100vh-12rem)] min-h-[550px] flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white flex items-center justify-center shadow-md shadow-indigo-600/20">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2">
              EduPlatform AI Yordamchi
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                Gemini Model
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Interaktiv o'qituvchi va dasturlash bo'yicha maslahatchi
            </p>
          </div>
        </div>

        <button
          onClick={() => setMessages(INITIAL_MESSAGES)}
          title="Tarixni tozalash"
          className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Messages container */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.map((message) => {
          const isUser = message.sender === 'user';
          return (
            <div
              key={message.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div
                className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center text-xs font-bold ${
                  isUser
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />}
              </div>

              <div className={`max-w-[85%] space-y-1 ${isUser ? 'items-end' : 'items-start'}`}>
                <div
                  className={`p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${
                    isUser
                      ? 'bg-indigo-600 text-white rounded-tr-sm shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 rounded-tl-sm border border-slate-200/60 dark:border-slate-700/60'
                  }`}
                >
                  {message.text}
                </div>

                <div className={`flex items-center gap-2 text-[10px] text-slate-400 px-1 ${isUser ? 'justify-end' : 'justify-start'}`}>
                  <span>{message.timestamp}</span>
                  {!isUser && (
                    <button
                      onClick={() => copyToClipboard(message.text, message.id)}
                      className="hover:text-slate-600 dark:hover:text-slate-200 inline-flex items-center gap-1"
                    >
                      {copiedId === message.id ? (
                        <Check className="w-3 h-3 text-emerald-500" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl shrink-0 bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
              <Bot className="w-4 h-4 text-indigo-600 dark:text-indigo-400 animate-pulse" />
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 rounded-tl-sm border border-slate-200/60 dark:border-slate-700/60 flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce" />
              <div className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce [animation-delay:0.2s]" />
              <div className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggestion Chips */}
      {messages.length < 3 && (
        <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800/60 overflow-x-auto flex gap-2 scrollbar-none">
          {SUGGESTIONS.map((suggestion, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(suggestion)}
              className="text-xs px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 dark:hover:text-indigo-300 whitespace-nowrap transition-colors"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}

      {/* Input Form */}
      <div className="p-3 sm:p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            id="ai-assistant-input"
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Sun'iy intellektdan savol so'rang (Python, Neyrotarmoqlar yoki Prompt)..."
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            id="ai-assistant-send-btn"
            type="submit"
            disabled={!inputText.trim() || isTyping}
            className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white shadow-sm shadow-indigo-600/30 transition-all flex items-center justify-center"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
