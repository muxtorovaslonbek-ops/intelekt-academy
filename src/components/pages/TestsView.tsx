import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCourses } from '../../context/CourseContext';
import { Quiz, QuizQuestion } from '../../types';
import { NeonButton } from '../common/NeonButton';
import {
  Lock,
  Clock,
  CheckSquare,
  Award,
  AlertCircle,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Sparkles,
  ShieldCheck,
  Download,
  Share2,
} from 'lucide-react';

export const TestsView: React.FC<{ onNavigateToAdmin?: () => void }> = ({
  onNavigateToAdmin,
}) => {
  const { currentUser } = useAuth();
  const { quizzes, selectedQuizId, setSelectedQuizId } = useCourses();

  const isLocked = !currentUser || currentUser.status === 'pending' || currentUser.status === 'rejected';

  // Active quiz runner state
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [showCertificate, setShowCertificate] = useState(false);

  // Synchronize with selectedQuizId
  useEffect(() => {
    if (selectedQuizId) {
      const target = quizzes.find((q) => q.id === selectedQuizId);
      if (target) {
        setActiveQuiz(target);
        setCurrentQuestionIndex(0);
        setSelectedAnswers({});
        setIsSubmitted(false);
        setShowCertificate(false);
      }
    }
  }, [selectedQuizId, quizzes]);

  useEffect(() => {
    if (!activeQuiz || isSubmitted) return;

    setTimeLeft(activeQuiz.durationMinutes * 60);

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsSubmitted(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [activeQuiz, isSubmitted]);

  // If status is 'pending' or 'rejected', show Admin Approval Lock!
  if (isLocked) {
    return (
      <div id="tests-locked-container" className="max-w-4xl mx-auto py-10 px-4 text-center">
        <div className="bg-slate-900/90 backdrop-blur-2xl rounded-3xl p-8 sm:p-12 border border-amber-500/30 shadow-2xl relative overflow-hidden text-white">
          <div className="absolute -top-16 -right-16 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Locked Icon Badge */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-amber-500/10 text-amber-400 mb-6 shadow-inner ring-8 ring-amber-500/10 border border-amber-500/30">
            <Lock className="w-10 h-10" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40 mb-4">
            <Clock className="w-3.5 h-3.5 animate-pulse text-amber-400" />
            <span>Holat: Admin Tasdig'i Kutilmoqda (Pending Approval)</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Interaktiv Testlar Bo'limi Qulflangan
          </h1>

          <p className="mt-3 text-slate-300 max-w-lg mx-auto text-sm leading-relaxed">
            Hurmatli <strong className="text-cyan-300">{currentUser?.firstName || 'Talaba'} {currentUser?.lastName || ''}</strong>,
            test topshirish va rasmiy AI Future sertifikatini qo'lga kiritish faqat administrator tomonidan tasdiqlangan talabalarga taqdim etiladi.
          </p>

          {/* User Details Box */}
          <div className="mt-6 max-w-md mx-auto p-4 rounded-2xl bg-slate-950/70 border border-slate-800 text-left space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Talaba:</span>
              <span className="font-semibold text-white">{currentUser?.firstName} {currentUser?.lastName}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Telefon:</span>
              <span className="font-mono text-cyan-300">{currentUser?.phoneNumber || 'Kiritilmagan'}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Holat:</span>
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Arizangiz kutilmoqda
              </span>
            </div>
          </div>

          <div className="mt-8">
            <div className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-medium max-w-lg">
              <Clock className="w-4 h-4 animate-spin text-amber-400 shrink-0" />
              <span>
                Administrator arizangizni tasdiqlagan zahoti testlar tizimi to'liq ochiladi.
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const startQuiz = (quiz: Quiz) => {
    setActiveQuiz(quiz);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setIsSubmitted(false);
    setShowCertificate(false);
  };

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    if (isSubmitted) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  const calculateScore = () => {
    if (!activeQuiz) return { correct: 0, total: 0, percentage: 0 };
    let correct = 0;
    activeQuiz.questions.forEach((q) => {
      if (selectedAnswers[q.id] === q.correctIndex) {
        correct++;
      }
    });
    const total = activeQuiz.questions.length;
    const percentage = Math.round((correct / total) * 100);
    return { correct, total, percentage };
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div id="tests-active-container" className="max-w-5xl mx-auto space-y-6 pb-16">
      {/* Header */}
      {!activeQuiz && (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-cyan-600 dark:text-cyan-400 mb-1">
                <span>app</span>
                <span>/</span>
                <span className="font-semibold bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                  /interactive-tests
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                Interaktiv Testlar va Bilim Sinovi
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                O'zlashtirgan bilimlaringizni real vaqtda tekshiring va natijalarni tahlil qiling.
              </p>
            </div>
          </div>

          {/* Test Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {quizzes.map((quiz) => (
              <div
                key={quiz.id}
                id={`quiz-card-${quiz.id}`}
                className="relative group rounded-2xl transition-all duration-300 flex flex-col justify-between"
              >
                {/* Ambient Border Hover Glow Aura */}
                <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-[2px] -z-10 pointer-events-none" />

                <div className="bg-white/75 dark:bg-slate-900/65 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/80 dark:border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] group-hover:border-cyan-400/50 dark:group-hover:border-cyan-400/40 group-hover:shadow-[0_16px_36px_-4px_rgba(6,182,212,0.25)] transition-all duration-300 flex flex-col justify-between h-full">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30 backdrop-blur-md">
                        {quiz.category}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 font-mono">
                        <Clock className="w-3.5 h-3.5 text-cyan-500" />
                        {quiz.durationMinutes} daqiqa
                      </span>
                    </div>

                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                      {quiz.title}
                    </h2>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                      {quiz.description}
                    </p>

                    <div className="mt-4 flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                      <span>Savollar: <strong>{quiz.questionsCount} ta</strong></span>
                      <span>Daraja: <strong>{quiz.difficulty}</strong></span>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-200/70 dark:border-white/10">
                    <NeonButton
                      id={`start-quiz-btn-${quiz.id}`}
                      onClick={() => startQuiz(quiz)}
                      variant="cyan"
                      size="sm"
                      fullWidth
                      rightIcon={<ArrowRight className="w-4 h-4" />}
                    >
                      <span>Testni Boshlash</span>
                    </NeonButton>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Active Quiz Runner */}
      {activeQuiz && (
        <div id="quiz-runner-box" className="space-y-6">
          {/* Runner Top Bar */}
          <div className="bg-white/80 dark:bg-slate-900/70 backdrop-blur-xl p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-xs font-semibold text-cyan-500 uppercase tracking-wider">
                {activeQuiz.category}
              </span>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {activeQuiz.title}
              </h2>
            </div>

            <div className="flex items-center gap-4">
              {/* Timer */}
              <div
                className={`px-3.5 py-1.5 rounded-xl font-mono text-xs font-bold flex items-center gap-1.5 ${
                  timeLeft < 60
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse'
                    : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>Qolgan vaqt: {formatTime(timeLeft)}</span>
              </div>

              <button
                onClick={() => {
                  if (window.confirm("Testdan chiqishni xohlaysizmi? Natijalar saqlanmaydi.")) {
                    setSelectedQuizId(null);
                    setActiveQuiz(null);
                  }
                }}
                className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                Chiqish
              </button>
            </div>
          </div>

          {/* Quiz Question Body */}
          {!isSubmitted ? (
            <div className="bg-white/80 dark:bg-slate-900/70 backdrop-blur-xl p-6 sm:p-8 rounded-2xl border border-slate-200/80 dark:border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)] space-y-6">
              {/* Question progress */}
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>
                  Savol <strong>{currentQuestionIndex + 1}</strong> / {activeQuiz.questions.length}
                </span>
                <span>
                  Javob berildi: {Object.keys(selectedAnswers).length} ta
                </span>
              </div>

              {/* Question text */}
              {activeQuiz.questions[currentQuestionIndex] && (
                <div className="space-y-4">
                  <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white leading-relaxed">
                    {currentQuestionIndex + 1}. {activeQuiz.questions[currentQuestionIndex].question}
                  </h3>

                  {/* Options */}
                  <div className="space-y-2.5 pt-2">
                    {activeQuiz.questions[currentQuestionIndex].options.map((opt, idx) => {
                      const qId = activeQuiz.questions[currentQuestionIndex].id;
                      const isSelected = selectedAnswers[qId] === idx;

                      return (
                        <button
                          key={idx}
                          id={`quiz-option-${idx}`}
                          onClick={() => handleSelectOption(qId, idx)}
                          className={`w-full p-4 rounded-xl border text-left text-xs sm:text-sm font-medium transition-all flex items-center justify-between cursor-pointer backdrop-blur-md ${
                            isSelected
                              ? 'border-cyan-500 bg-cyan-500/15 text-cyan-300 ring-2 ring-cyan-500/30 font-semibold shadow-[0_0_15px_rgba(6,182,212,0.25)]'
                              : 'border-slate-200/80 dark:border-white/10 bg-slate-50/60 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 hover:border-cyan-400/40 dark:hover:border-cyan-400/30'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-mono font-bold ${
                                isSelected
                                  ? 'bg-cyan-500 text-slate-950'
                                  : 'bg-slate-200/80 dark:bg-slate-700/80 text-slate-600 dark:text-slate-300'
                              }`}
                            >
                              {String.fromCharCode(65 + idx)}
                            </span>
                            <span>{opt}</span>
                          </div>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Navigation buttons */}
              <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                  disabled={currentQuestionIndex === 0}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-600 dark:text-slate-400 disabled:opacity-40"
                >
                  Oldingisi
                </button>

                {currentQuestionIndex < activeQuiz.questions.length - 1 ? (
                  <button
                    onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                    className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Keyingisi</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    id="submit-quiz-btn"
                    onClick={() => setIsSubmitted(true)}
                    className="px-6 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-500/20 transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckSquare className="w-4 h-4" />
                    <span>Testni Yakunlash</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* Results Scorecard & Certificate */
            <div id="quiz-results-card" className="bg-white/85 dark:bg-slate-900/75 backdrop-blur-2xl p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-white/10 shadow-2xl space-y-6 text-center">
              {(() => {
                const { correct, total, percentage } = calculateScore();
                const isPassed = percentage >= 60;

                return (
                  <div>
                    <div
                      className={`w-20 h-20 rounded-3xl mx-auto flex items-center justify-center mb-4 ${
                        isPassed
                          ? 'bg-emerald-500/15 text-emerald-400 ring-8 ring-emerald-500/10 border border-emerald-500/40'
                          : 'bg-rose-500/15 text-rose-400 ring-8 ring-rose-500/10 border border-rose-500/40'
                      }`}
                    >
                      <Award className="w-10 h-10" />
                    </div>

                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                      {isPassed ? "Tabriklaymiz! Test Muvaffaqiyatli Topshirildi" : "Qayta Urinib Ko'ring"}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                      Siz {total} ta savoldan {correct} tasiga to'g'ri javob berdingiz.
                    </p>

                    <div className="mt-6 inline-flex items-center gap-6 p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/50 backdrop-blur-md border border-slate-200/80 dark:border-white/10 shadow-sm">
                      <div>
                        <span className="block text-2xl font-black text-cyan-500">
                          {percentage}%
                        </span>
                        <span className="text-[11px] text-slate-400 uppercase font-semibold">
                          Umumiy Ball
                        </span>
                      </div>
                      <div className="h-8 w-px bg-slate-200 dark:bg-slate-700" />
                      <div>
                        <span className="block text-2xl font-black text-slate-800 dark:text-slate-200">
                          {correct}/{total}
                        </span>
                        <span className="text-[11px] text-slate-400 uppercase font-semibold">
                          To'g'ri Javoblar
                        </span>
                      </div>
                    </div>

                    {/* Official Certificate Card (If Passed) */}
                    {isPassed && (
                      <div className="mt-8 p-6 rounded-3xl bg-gradient-to-br from-slate-950/90 via-slate-900/80 to-indigo-950/90 backdrop-blur-xl border border-cyan-500/40 shadow-2xl text-left relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                          <Award className="w-48 h-48 text-cyan-400" />
                        </div>

                        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-cyan-400" />
                            <span className="font-bold text-sm text-white uppercase tracking-wider">
                              AI Future • Rasmiy Elektron Sertifikat
                            </span>
                          </div>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                            TASDIQLANGAN
                          </span>
                        </div>

                        <div className="space-y-1">
                          <p className="text-xs text-slate-400">Ushbu sertifikat quyidagi talabaga topshiriladi:</p>
                          <h4 className="text-xl font-bold text-cyan-300">
                            {currentUser?.firstName} {currentUser?.lastName}
                          </h4>
                          <p className="text-xs text-slate-300 pt-2">
                            <strong>{activeQuiz.title}</strong> kursi bo'yicha yakuniy bilim sinovini <strong>{percentage}%</strong> natija bilan muvaffaqiyatli tamomlaganligi tasdiqlanadi.
                          </p>
                        </div>

                        <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
                          <span>Sertifikat ID: AIF-{Math.floor(100000 + Math.random() * 900000)}</span>
                          <span>Sana: {new Date().toLocaleDateString('uz-UZ')}</span>
                        </div>
                      </div>
                    )}

                    {/* Explanations Accordion */}
                    <div className="mt-8 text-left space-y-4">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Savollar va To'g'ri Javoblar Tahlili:
                      </h4>

                      <div className="space-y-3">
                        {activeQuiz.questions.map((q, idx) => {
                          const userAnswer = selectedAnswers[q.id];
                          const isCorrect = userAnswer === q.correctIndex;

                          return (
                            <div
                              key={q.id}
                              className={`p-4 rounded-xl border text-xs space-y-2 ${
                                isCorrect
                                  ? 'border-emerald-500/30 bg-emerald-950/20 text-slate-200'
                                  : 'border-rose-500/30 bg-rose-950/20 text-slate-200'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <span className="font-semibold text-white">
                                  {idx + 1}. {q.question}
                                </span>
                                {isCorrect ? (
                                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                                ) : (
                                  <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                                )}
                              </div>

                              <p className="text-slate-300">
                                <strong>To'g'ri javob:</strong> {q.options[q.correctIndex]}
                              </p>
                              <p className="text-slate-400 italic">
                                💡 {q.explanation}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="mt-8 flex justify-center gap-3">
                      <button
                        onClick={() => startQuiz(activeQuiz)}
                        className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
                      >
                        <RotateCcw className="w-4 h-4" />
                        <span>Qayta topshirish</span>
                      </button>
                      <button
                        onClick={() => {
                          setSelectedQuizId(null);
                          setActiveQuiz(null);
                        }}
                        className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold cursor-pointer"
                      >
                        Barcha testlarga qaytish
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
