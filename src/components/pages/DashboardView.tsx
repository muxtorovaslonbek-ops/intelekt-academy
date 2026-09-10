import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCourses } from '../../context/CourseContext';
import { ActiveRoute, Course, Quiz } from '../../types';
import {
  BookOpen,
  CheckSquare,
  Clock,
  ArrowRight,
  Sparkles,
  Flame,
  Play,
  Award,
  Brain,
  Settings,
  ShieldCheck,
  UserCheck,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { NeonButton } from '../common/NeonButton';
import { AmbientGlow } from '../common/AmbientGlow';
import { AnimatedAnnouncementBanner } from '../dashboard/AnimatedAnnouncementBanner';

export const DashboardView: React.FC<{ onRouteChange: (route: ActiveRoute) => void }> = ({
  onRouteChange,
}) => {
  const { currentUser } = useAuth();
  const { courses, quizzes, completedLessons, setSelectedCourseId, setSelectedQuizId } = useCourses();

  const isPending = currentUser?.status === 'pending';
  const userId = currentUser?.id || 'guest';

  // --------------------------------------------------------------------------
  // 1. REAL STUDY TIME & TIMER CALCULATION
  // --------------------------------------------------------------------------
  const [platformStudySeconds, setPlatformStudySeconds] = useState<number>(() => {
    const saved = localStorage.getItem(`eduplatform_study_seconds_${userId}`);
    return saved ? parseInt(saved, 10) : 0;
  });

  // Track active learning seconds while browsing
  useEffect(() => {
    const timer = setInterval(() => {
      setPlatformStudySeconds((prev) => {
        const next = prev + 10;
        localStorage.setItem(`eduplatform_study_seconds_${userId}`, String(next));
        return next;
      });
    }, 10000);
    return () => clearInterval(timer);
  }, [userId]);

  // Parse minutes from completed lessons
  const completedLessonsMinutes = React.useMemo(() => {
    let total = 0;
    completedLessons.forEach((lessonId) => {
      for (const course of courses) {
        const found = course.lessons.find((l) => l.id === lessonId);
        if (found) {
          const matchHours = found.duration.match(/(\d+)\s*(?:soat|hour|h)/i);
          const matchMins = found.duration.match(/(\d+)\s*(?:daqiqa|min|m)/i);
          if (matchHours) total += parseInt(matchHours[1], 10) * 60;
          if (matchMins) total += parseInt(matchMins[1], 10);
          if (!matchHours && !matchMins) total += 20; // default 20 min per completed lesson
          break;
        }
      }
    });
    return total;
  }, [completedLessons, courses]);

  const totalStudyMinutes = completedLessonsMinutes + Math.floor(platformStudySeconds / 60);
  const realStudyHours = (totalStudyMinutes / 60).toFixed(1);

  // --------------------------------------------------------------------------
  // 2. REAL STREAK CALCULATION
  // --------------------------------------------------------------------------
  const realStreak = React.useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const streakKey = `eduplatform_streak_${userId}`;
    const dateKey = `eduplatform_last_active_${userId}`;

    const lastDate = localStorage.getItem(dateKey);
    const storedStreak = parseInt(localStorage.getItem(streakKey) || '0', 10);

    if (!lastDate) {
      localStorage.setItem(dateKey, today);
      localStorage.setItem(streakKey, '1');
      return 1;
    }

    if (lastDate === today) {
      return storedStreak || 1;
    }

    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    if (lastDate === yesterday) {
      const nextStreak = (storedStreak || 1) + 1;
      localStorage.setItem(streakKey, String(nextStreak));
      localStorage.setItem(dateKey, today);
      return nextStreak;
    } else {
      // New streak cycle
      localStorage.setItem(streakKey, '1');
      localStorage.setItem(dateKey, today);
      return 1;
    }
  }, [userId]);

  // --------------------------------------------------------------------------
  // 3. COURSES & QUIZZES REAL COUNTS
  // --------------------------------------------------------------------------
  const activeCourses = courses.filter((c) => c.status === 'active' || !c.status);
  const totalQuestions = quizzes.reduce(
    (sum, q) => sum + (q.questionsCount || q.questions?.length || 0),
    0
  );

  // Course launcher helper
  const handleLaunchCourse = (course: Course) => {
    setSelectedCourseId(course.id);
    onRouteChange('courses');
  };

  // Quiz launcher helper
  const handleLaunchQuiz = (quiz: Quiz) => {
    setSelectedQuizId(quiz.id);
    onRouteChange('tests');
  };

  return (
    <div id="dashboard-view" className="max-w-7xl mx-auto space-y-7 pb-16">
      {/* Welcome Banner with Atmospheric Ambient Light */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-slate-900 to-purple-950 text-white p-6 sm:p-9 border border-indigo-500/30 shadow-2xl shadow-indigo-950/40">
        <AmbientGlow variant="hero" intensity="medium" pulseSpeed="slow" showGrid showOrbs />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-indigo-200 border border-white/10">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>EduPlatform Innovatsion Ta'lim Portali</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
              Xush kelibsiz, {currentUser?.firstName || 'Talaba'}!
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              Interaktiv kurslar, amaliy topshiriqlar va sun'iy intellekt asosidagi yordamchi orqali bilimlaringizni oshiring.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Primary Main CTA using reusable NeonButton */}
            <NeonButton
              id="dashboard-explore-courses-btn"
              onClick={() => onRouteChange('courses')}
              variant="primary-white"
              size="md"
              leftIcon={<BookOpen className="w-4 h-4 text-indigo-600" />}
              rightIcon={<ArrowRight className="w-4 h-4 text-indigo-600 group-hover/neon-btn:translate-x-1 transition-transform" />}
            >
              <span>{isPending ? 'Kurslar (Qulflangan)' : "Boshlash va Kurslarni Ko'rish"}</span>
            </NeonButton>

            {/* AI Assistant Button */}
            <button
              id="dashboard-open-ai-btn"
              onClick={() => onRouteChange('ai-assistant')}
              className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs sm:text-sm backdrop-blur-md transition-all flex items-center gap-2 cursor-pointer shadow-sm hover:scale-[1.02] active:scale-[0.98]"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>AI Yordamchi</span>
            </button>
          </div>
        </div>
      </div>

      {/* Animated Important Announcement Banner (flies to notification bell after 5s) */}
      <AnimatedAnnouncementBanner />

      {/* Real Stats Grid - All Cards are Clickable and Functional */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat 1: Mavjud Kurslar */}
        <button
          type="button"
          id="stat-card-courses"
          onClick={() => onRouteChange('courses')}
          className="text-left bg-white/80 dark:bg-slate-900/70 backdrop-blur-xl p-5 rounded-2xl border border-slate-200/80 dark:border-white/10 hover:border-indigo-500/50 dark:hover:border-indigo-500/50 shadow-[0_8px_30px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)] hover:shadow-indigo-500/10 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              Mavjud Kurslar
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {courses.length}
            </span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" />
              {activeCourses.length} faol
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            <span>Kurslar ro'yxatiga o'tish</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </button>

        {/* Stat 2: Interaktiv Testlar */}
        <button
          type="button"
          id="stat-card-quizzes"
          onClick={() => onRouteChange('tests')}
          className="text-left bg-white/80 dark:bg-slate-900/70 backdrop-blur-xl p-5 rounded-2xl border border-slate-200/80 dark:border-white/10 hover:border-purple-500/50 dark:hover:border-purple-500/50 shadow-[0_8px_30px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)] hover:shadow-purple-500/10 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              Interaktiv Testlar
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CheckSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {quizzes.length}
            </span>
            <span className="text-xs text-purple-600 dark:text-purple-400 font-semibold">
              Faol sinovlar
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
            <span>{totalQuestions} ta savol mavjud</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </button>

        {/* Stat 3: O'quv Soatlari */}
        <button
          type="button"
          id="stat-card-hours"
          onClick={() => onRouteChange('courses')}
          className="text-left bg-white/80 dark:bg-slate-900/70 backdrop-blur-xl p-5 rounded-2xl border border-slate-200/80 dark:border-white/10 hover:border-amber-500/50 dark:hover:border-amber-500/50 shadow-[0_8px_30px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)] hover:shadow-amber-500/10 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              O'quv Soatlari
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {realStudyHours}
            </span>
            <span className="text-xs text-slate-400 font-semibold">soat</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
            <span>
              {completedLessons.length > 0
                ? `${completedLessons.length} ta dars yakunlangan`
                : 'Hozir darsni boshlash'}
            </span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </button>

        {/* Stat 4: Ketma-ketlik (Streak) */}
        <button
          type="button"
          id="stat-card-streak"
          onClick={() => onRouteChange('profile')}
          className="text-left bg-white/80 dark:bg-slate-900/70 backdrop-blur-xl p-5 rounded-2xl border border-slate-200/80 dark:border-white/10 hover:border-rose-500/50 dark:hover:border-rose-500/50 shadow-[0_8px_30px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)] hover:shadow-rose-500/10 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              Ketma-ketlik (Streak)
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {realStreak} kun
            </span>
            <span className="text-xs text-rose-500 font-semibold flex items-center gap-0.5">
              <Flame className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
              Faol
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
            <span>Profil va yutuqlarni ko'rish</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </button>
      </div>

      {/* Featured Courses Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              <span>Tavsiya etilayotgan Kurslar</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Eng talabgir sohalar bo'yicha saralangan amaliy darslar
            </p>
          </div>
          <button
            id="dashboard-view-all-courses-btn"
            onClick={() => onRouteChange('courses')}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1 cursor-pointer group"
          >
            <span>Barchasini ko'rish ({courses.length})</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {courses.slice(0, 2).map((course) => (
            <div
              key={course.id}
              onClick={() => handleLaunchCourse(course)}
              className="relative group rounded-2xl transition-all duration-300 cursor-pointer"
            >
              {/* Ambient Border Glow Aura on Hover */}
              <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-[2px] -z-10 pointer-events-none" />

              <div className="bg-white/80 dark:bg-slate-900/70 backdrop-blur-xl p-5 rounded-2xl border border-slate-200/80 dark:border-white/10 group-hover:border-indigo-400/50 dark:group-hover:border-indigo-400/40 shadow-[0_8px_30px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)] group-hover:shadow-[0_16px_36px_-4px_rgba(99,102,241,0.25)] flex flex-col justify-between h-full transition-all duration-300">
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
                    <span className="font-semibold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                      {course.category}
                    </span>
                    <span className="font-mono text-[11px]">{course.lessons.length} ta dars • {course.duration}</span>
                  </div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {course.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                    {course.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200/70 dark:border-white/10 flex items-center justify-between">
                  <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                    {course.instructor}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLaunchCourse(course);
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm hover:scale-[1.03] active:scale-[0.98]"
                  >
                    <span>{isPending ? 'Kursni Ko\'rish' : 'Boshlash'}</span>
                    <Play className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Featured Interactive Tests Section */}
      {quizzes.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-purple-600" />
                <span>Interaktiv Testlar va Viktorinalar</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                O'zlashtirgan bilimlaringizni sinab ko'ring va sertifikat oling
              </p>
            </div>
            <button
              id="dashboard-view-all-quizzes-btn"
              onClick={() => onRouteChange('tests')}
              className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 flex items-center gap-1 cursor-pointer group"
            >
              <span>Barcha testlar ({quizzes.length})</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quizzes.slice(0, 2).map((quiz) => (
              <div
                key={quiz.id}
                onClick={() => handleLaunchQuiz(quiz)}
                className="bg-white/80 dark:bg-slate-900/70 backdrop-blur-xl p-5 rounded-2xl border border-slate-200/80 dark:border-white/10 hover:border-purple-500/40 shadow-[0_8px_30px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)] flex flex-col justify-between transition-all duration-300 cursor-pointer group"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
                    <span className="font-semibold px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400">
                      {quiz.category}
                    </span>
                    <span className="font-mono text-[11px] flex items-center gap-1">
                      <Clock className="w-3 h-3 text-purple-500" />
                      {quiz.durationMinutes} daqiqa
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                    {quiz.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                    {quiz.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200/70 dark:border-white/10 flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-mono">
                    Jami: {quiz.questions.length} ta savol
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLaunchQuiz(quiz);
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm hover:scale-[1.03] active:scale-[0.98]"
                  >
                    <span>Sinovni Boshlash</span>
                    <Play className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Access Platform Modules Bar */}
      <div className="bg-slate-50 dark:bg-slate-900/50 p-5 rounded-3xl border border-slate-200/70 dark:border-white/5 space-y-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Platformaning Tezkor Bo'limlari
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            type="button"
            id="quick-nav-courses"
            onClick={() => onRouteChange('courses')}
            className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 text-left transition-all hover:scale-[1.02] cursor-pointer shadow-sm group"
          >
            <BookOpen className="w-5 h-5 text-indigo-600 mb-2 group-hover:scale-110 transition-transform" />
            <div className="text-xs font-bold text-slate-900 dark:text-white">Kurslar & Darslar</div>
            <div className="text-[11px] text-slate-400 mt-0.5">{courses.length} ta amaliy kurs</div>
          </button>

          <button
            type="button"
            id="quick-nav-tests"
            onClick={() => onRouteChange('tests')}
            className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-purple-500 dark:hover:border-purple-500 text-left transition-all hover:scale-[1.02] cursor-pointer shadow-sm group"
          >
            <CheckSquare className="w-5 h-5 text-purple-600 mb-2 group-hover:scale-110 transition-transform" />
            <div className="text-xs font-bold text-slate-900 dark:text-white">Testlar Markazi</div>
            <div className="text-[11px] text-slate-400 mt-0.5">{quizzes.length} ta viktorina</div>
          </button>

          <button
            type="button"
            id="quick-nav-ai"
            onClick={() => onRouteChange('ai-assistant')}
            className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-500 dark:hover:border-amber-500 text-left transition-all hover:scale-[1.02] cursor-pointer shadow-sm group"
          >
            <Brain className="w-5 h-5 text-amber-500 mb-2 group-hover:scale-110 transition-transform" />
            <div className="text-xs font-bold text-slate-900 dark:text-white">AI Maslahatchi</div>
            <div className="text-[11px] text-slate-400 mt-0.5">24/7 savol-javob</div>
          </button>

          <button
            type="button"
            id="quick-nav-profile"
            onClick={() => onRouteChange('profile')}
            className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 text-left transition-all hover:scale-[1.02] cursor-pointer shadow-sm group"
          >
            <Award className="w-5 h-5 text-emerald-500 mb-2 group-hover:scale-110 transition-transform" />
            <div className="text-xs font-bold text-slate-900 dark:text-white">Mening Profilim</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Yutuqlar va sertifikatlar</div>
          </button>
        </div>
      </div>
    </div>
  );
};
