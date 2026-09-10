import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCourses } from '../../context/CourseContext';
import { ProtectedVideoPlayer } from '../common/ProtectedVideoPlayer';
import { Course, Lesson } from '../../types';
import { NeonButton } from '../common/NeonButton';
import {
  BookOpen,
  Play,
  Clock,
  CheckCircle2,
  Lock,
  Search,
  Sparkles,
  ArrowLeft,
  GraduationCap,
  Star,
  Users,
  AlertCircle,
  Film,
  FileText,
  Image as ImageIcon,
  Download,
  ExternalLink,
  Paperclip,
  Video,
  Eye,
  Maximize2,
} from 'lucide-react';

interface CoursesViewProps {
  onNavigateToAdmin?: () => void;
}

export const CoursesView: React.FC<CoursesViewProps> = ({ onNavigateToAdmin }) => {
  const { currentUser } = useAuth();
  const { courses, toggleLessonCompleted, selectedCourseId, setSelectedCourseId } = useCourses();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeCourse, setActiveCourse] = useState<Course | null>(null);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [lessonTab, setLessonTab] = useState<'info' | 'pdf' | 'image' | 'materials'>('info');

  const isPending = currentUser?.status === 'pending';

  // Synchronize with selectedCourseId from Dashboard or search
  React.useEffect(() => {
    if (selectedCourseId) {
      const target = courses.find((c) => c.id === selectedCourseId);
      if (target) {
        setActiveCourse(target);
        if (target.lessons && target.lessons.length > 0) {
          setActiveLesson(target.lessons[0]);
        }
      }
    }
  }, [selectedCourseId, courses]);

  // Extract unique categories
  const categories: string[] = ['all', ...Array.from(new Set<string>(courses.map((c) => c.category)))];

  // Filter courses
  const filteredCourses = courses.filter((course) => {
    const matchesCategory =
      selectedCategory === 'all' || course.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch =
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.instructor.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleOpenCourse = (course: Course) => {
    if (isPending) return;
    setActiveCourse(course);
    if (course.lessons && course.lessons.length > 0) {
      setActiveLesson(course.lessons[0]);
    } else {
      setActiveLesson(null);
    }
  };

  // If viewing active lesson player in active course
  if (activeCourse) {
    return (
      <div id="course-player-view" className="max-w-7xl mx-auto space-y-6 pb-16">
        {/* Top Back Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => {
              setSelectedCourseId(null);
              setActiveCourse(null);
              setActiveLesson(null);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold shadow-sm transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Barcha kurslarga qaytish</span>
          </button>

          <div className="text-right">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Kurs: <strong className="text-slate-900 dark:text-white">{activeCourse.title}</strong>
            </span>
          </div>
        </div>

        {/* Player & Lessons Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Video Player Column */}
          <div className="lg:col-span-8 space-y-4">
            <div className="rounded-2xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-800 bg-black">
              <ProtectedVideoPlayer
                directUrl={activeLesson?.videoUrl}
                videoId={activeLesson?.bunnyVideoId || '4a5e3f42-4f05-4c07-9b22-861c8a1495c2'}
                title={activeLesson?.title || activeCourse.title}
                duration={activeLesson?.duration}
              />
            </div>

            {/* Current Lesson Info Card */}
            <div className="p-6 rounded-2xl bg-white/80 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)] space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="px-3 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-bold">
                  {activeCourse.category}
                </span>
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {activeLesson?.duration || activeCourse.duration}
                </span>
              </div>

              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  {activeLesson?.title || activeCourse.title}
                </h1>
                {activeLesson?.videoName && (
                  <p className="text-xs text-indigo-600 dark:text-indigo-400 font-mono mt-0.5">
                    🎬 Video fayl: {activeLesson.videoName}
                  </p>
                )}
              </div>

              {/* MEDIA & MATERIALS TABS */}
              <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
                <button
                  type="button"
                  onClick={() => setLessonTab('info')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                    lessonTab === 'info'
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/20'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Konspekt & Tavsif</span>
                </button>

                <button
                  type="button"
                  onClick={() => setLessonTab('pdf')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                    lessonTab === 'pdf'
                      ? 'bg-rose-600 text-white shadow-sm shadow-rose-600/20'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>PDF Qo'llanma</span>
                  {activeLesson?.pdfUrl && (
                    <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setLessonTab('image')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                    lessonTab === 'image'
                      ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/20'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>Rasm / Sxema</span>
                  {activeLesson?.imageUrl && (
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setLessonTab('materials')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                    lessonTab === 'materials'
                      ? 'bg-purple-600 text-white shadow-sm shadow-purple-600/20'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <Paperclip className="w-3.5 h-3.5" />
                  <span>Materiallar</span>
                  {activeLesson?.attachments && activeLesson.attachments.length > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-purple-200 dark:bg-purple-900 text-purple-800 dark:text-purple-200 font-bold">
                      {activeLesson.attachments.length}
                    </span>
                  )}
                </button>
              </div>

              {/* TAB 1: KONSPEKT & TAVSIF */}
              {lessonTab === 'info' && (
                <div className="space-y-3">
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                    {activeLesson?.description || activeCourse.description}
                  </p>
                </div>
              )}

              {/* TAB 2: PDF QO'LLANMA & KITOB */}
              {lessonTab === 'pdf' && (
                <div className="space-y-3">
                  {activeLesson?.pdfUrl ? (
                    <div className="space-y-3">
                      <div className="p-4 rounded-2xl bg-rose-50/70 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-rose-500 text-white flex items-center justify-center font-bold shrink-0">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                              {activeLesson.pdfName || 'Darslik_Qo\'llanmasi.pdf'}
                            </h4>
                            <span className="text-xs text-slate-500">PDF Hujjat / Darslik materiallari</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <a
                            href={activeLesson.pdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3.5 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-800 dark:text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-all"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Yangi oynada ochish</span>
                          </a>
                          <a
                            href={activeLesson.pdfUrl}
                            download={activeLesson.pdfName || 'Darslik.pdf'}
                            className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold inline-flex items-center gap-1.5 transition-all shadow-md shadow-rose-600/20"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Yuklab Olish</span>
                          </a>
                        </div>
                      </div>

                      {/* PDF Embed Preview */}
                      <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 h-96">
                        <iframe
                          src={activeLesson.pdfUrl}
                          title="PDF Preview"
                          className="w-full h-full border-0"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 px-4 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 text-slate-500 text-xs space-y-1">
                      <FileText className="w-8 h-8 mx-auto text-slate-400" />
                      <p className="font-semibold text-slate-700 dark:text-slate-300">
                        Ushbu dars uchun alohida PDF yuklanmagan
                      </p>
                      <p className="text-slate-400">
                        Admin paneldan darsga to'g'ridan-to'g'ri PDF qo'llanma yuklashingiz mumkin.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: RASM / SXEMA */}
              {lessonTab === 'image' && (
                <div className="space-y-3">
                  {activeLesson?.imageUrl ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <ImageIcon className="w-4 h-4 text-emerald-500" />
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                            {activeLesson.imageName || 'Dars sxemasi va infografikasi'}
                          </span>
                        </div>
                        <a
                          href={activeLesson.imageUrl}
                          download={activeLesson.imageName || 'sxema.png'}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold inline-flex items-center gap-1.5 transition-all shadow-sm"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Rasmni Yuklab Olish</span>
                        </a>
                      </div>

                      <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950 flex items-center justify-center p-2">
                        <img
                          src={activeLesson.imageUrl}
                          alt="Dars sxemasi"
                          className="max-h-[450px] w-auto object-contain rounded-xl"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 px-4 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 text-slate-500 text-xs space-y-1">
                      <ImageIcon className="w-8 h-8 mx-auto text-slate-400" />
                      <p className="font-semibold text-slate-700 dark:text-slate-300">
                        Ushbu dars uchun maxsus rasm yoki sxema mavjud emas
                      </p>
                      <p className="text-slate-400">
                        Admin paneldan darsga infografika yoki vizual sxemalarni yuklashingiz mumkin.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: QO'SHIMCHA MATERIALLAR */}
              {lessonTab === 'materials' && (
                <div className="space-y-3">
                  {activeLesson?.attachments && activeLesson.attachments.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {activeLesson.attachments.map((att, i) => (
                        <div
                          key={att.id || i}
                          className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex items-center justify-between gap-2"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                              <Paperclip className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{att.name}</p>
                              <span className="text-[10px] text-slate-400">{att.size || 'Fayl'} • {att.uploadedAt || "Yaqinda"}</span>
                            </div>
                          </div>

                          <a
                            href={att.url}
                            download={att.name}
                            className="p-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs shrink-0 transition-all shadow-sm"
                            title="Yuklab olish"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 px-4 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 text-slate-500 text-xs space-y-1">
                      <Paperclip className="w-8 h-8 mx-auto text-slate-400" />
                      <p className="font-semibold text-slate-700 dark:text-slate-300">
                        Qo'shimcha materiallar yo'q
                      </p>
                      <p className="text-slate-400">
                        Ushbu dars uchun barcha asosiy ma'lumotlar yuqoridagi video va tavsifda keltirilgan.
                      </p>
                    </div>
                  )}
                </div>
              )}

              <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
                <span>O'qituvchi: <strong className="text-slate-800 dark:text-slate-200">{activeCourse.instructor}</strong></span>
                {activeLesson && (
                  <button
                    onClick={() => toggleLessonCompleted(activeCourse.id, activeLesson.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      activeLesson.isCompleted
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                        : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{activeLesson.isCompleted ? 'Bajarildi' : 'Bajarilgan deb belgilash'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Lessons Syllabus Sidebar */}
          <div className="lg:col-span-4 space-y-3">
            <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)]">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center justify-between mb-3">
                <span>Darslar Mundarijasi</span>
                <span className="text-xs font-normal text-slate-500">
                  {activeCourse.lessons.length} ta dars
                </span>
              </h2>

              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                {activeCourse.lessons.map((lesson, index) => {
                  const isCurrent = activeLesson?.id === lesson.id;
                  return (
                    <button
                      key={lesson.id}
                      onClick={() => {
                        setActiveLesson(lesson);
                        setLessonTab('info');
                      }}
                      className={`w-full text-left p-3 rounded-xl text-xs transition-all flex items-start justify-between gap-2.5 cursor-pointer ${
                        isCurrent
                          ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-600/20 font-bold'
                          : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60'
                      }`}
                    >
                      <div className="flex items-start gap-2 min-w-0">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] shrink-0 ${
                          isCurrent ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                        }`}>
                          {index + 1}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate font-medium">{lesson.title}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className={`text-[11px] font-normal ${isCurrent ? 'text-indigo-100' : 'text-slate-500 dark:text-slate-400'}`}>
                              {lesson.duration}
                            </span>
                            {/* Badges for uploaded media in syllabus */}
                            {(lesson.videoUrl || lesson.bunnyVideoId) && (
                              <Video className={`w-3 h-3 ${isCurrent ? 'text-white' : 'text-blue-500'}`} />
                            )}
                            {lesson.pdfUrl && (
                              <FileText className={`w-3 h-3 ${isCurrent ? 'text-white' : 'text-rose-500'}`} />
                            )}
                            {lesson.imageUrl && (
                              <ImageIcon className={`w-3 h-3 ${isCurrent ? 'text-white' : 'text-emerald-500'}`} />
                            )}
                            {lesson.attachments && lesson.attachments.length > 0 && (
                              <Paperclip className={`w-3 h-3 ${isCurrent ? 'text-white' : 'text-purple-500'}`} />
                            )}
                          </div>
                        </div>
                      </div>

                      {lesson.isCompleted && (
                        <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${isCurrent ? 'text-white' : 'text-emerald-500'}`} />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Catalog View
  return (
    <div id="courses-catalog-view" className="max-w-7xl mx-auto space-y-6 pb-16">
      {/* Header Banner with Atmospheric Ambient Light */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 text-white p-6 sm:p-9 border border-indigo-500/30 shadow-2xl shadow-indigo-950/40">
        {/* Atmospheric Ambient Radial Orbs */}
        <div className="absolute -top-24 -left-20 w-80 h-80 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none animate-pulse" />
        <div className="absolute -bottom-24 -right-16 w-80 h-80 rounded-full bg-purple-500/20 blur-3xl pointer-events-none animate-pulse" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff06_1px,transparent_1px),linear-gradient(to_bottom,#ffffff06_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent pointer-events-none" />

        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-indigo-200 backdrop-blur-md border border-white/10">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>EduPlatform Barcha Kurslar & Yo'nalishlar</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
            Zamonaviy IT va AI Kurslari
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Sun'iy intellekt, Prompt injiniring, Rasm va video yaratish, hamda zamonaviy veb dasturlash bo'yicha interaktiv amaliy darslar to'plami.
          </p>
        </div>
      </div>

      {/* Pending status warning banner */}
      {isPending && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-amber-900 dark:text-amber-200 text-xs sm:text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
            <div>
              <strong className="block font-bold">Hisobingiz administrator tomonidan tasdiqlanishi kutilmoqda:</strong>
              <span>Darslarni ochish va videolarni tomosha qilish uchun administrator arizangizni tasdiqlashi zarur.</span>
            </div>
          </div>
          {currentUser?.role === 'admin' && onNavigateToAdmin && (
            <button
              onClick={onNavigateToAdmin}
              className="px-3.5 py-1.5 rounded-xl bg-amber-600 text-white font-semibold text-xs hover:bg-amber-500 transition-all shrink-0 cursor-pointer"
            >
              Admin CMS ga o'tish
            </button>
          )}
        </div>
      )}

      {/* Search and Categories Toolbar */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Kurs nomi, o'qituvchi yoki tavsif bo'yicha qidiring..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm transition-all"
            />
          </div>

          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Jami: <strong className="text-slate-900 dark:text-white">{filteredCourses.length}</strong> ta kurs topildi
          </div>
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => {
            const isSelected = selectedCategory.toLowerCase() === cat.toLowerCase();
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-600/20'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {cat === 'all' ? 'Barcha Kurslar' : cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Course Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => (
          <div
            key={course.id}
            id={`course-card-${course.id}`}
            className="relative group rounded-2xl transition-all duration-300 flex flex-col justify-between"
          >
            {/* Ambient Border Hover Glow Aura */}
            <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-[2px] -z-10 pointer-events-none" />

            <div className="bg-white/75 dark:bg-slate-900/65 backdrop-blur-xl rounded-2xl border border-slate-200/80 dark:border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] group-hover:border-indigo-400/50 dark:group-hover:border-indigo-400/40 group-hover:shadow-[0_16px_36px_-4px_rgba(99,102,241,0.25)] transition-all duration-300 overflow-hidden flex flex-col justify-between h-full">
              <div>
                {/* Thumbnail Container */}
                <div className="relative aspect-video w-full overflow-hidden bg-slate-950">
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />

                  {/* Badges on Thumbnail */}
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-indigo-900/80 backdrop-blur-md text-white text-[10px] font-bold border border-indigo-400/30 shadow-sm">
                      {course.category}
                    </span>
                    <span className="px-2 py-0.5 rounded-lg bg-slate-900/80 backdrop-blur-md text-slate-200 text-[10px] font-semibold border border-white/10">
                      {course.level}
                    </span>
                  </div>

                  {isPending && (
                    <div className="absolute top-3 right-3 px-2 py-1 rounded-lg bg-amber-500/90 backdrop-blur-md text-white text-[10px] font-bold flex items-center gap-1 shadow-md border border-amber-300/30">
                      <Lock className="w-3 h-3" />
                      <span>Qulflangan</span>
                    </div>
                  )}
                </div>

                {/* Card Body */}
                <div className="p-5 space-y-3">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug line-clamp-2">
                    {course.title}
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {course.description}
                  </p>

                  {/* Course Metadata */}
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-indigo-500" />
                      {course.duration}
                    </span>
                    <span className="flex items-center gap-1">
                      <Film className="w-3.5 h-3.5 text-purple-500" />
                      {course.lessonsCount || course.lessons?.length || 0} ta dars
                    </span>
                    <span className="flex items-center gap-1 text-amber-500 font-bold">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      {course.rating || 5.0}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="p-5 pt-3 border-t border-slate-200/70 dark:border-white/10 flex items-center justify-between bg-slate-50/40 dark:bg-slate-950/20 backdrop-blur-sm">
                <span className="text-xs text-slate-600 dark:text-slate-300 font-medium truncate max-w-[150px]">
                  {course.instructor}
                </span>

                <NeonButton
                  onClick={() => handleOpenCourse(course)}
                  disabled={isPending}
                  variant={isPending ? 'primary-gradient' : 'primary-gradient'}
                  size="sm"
                  pulse={!isPending}
                  leftIcon={
                    isPending ? (
                      <Lock className="w-3.5 h-3.5" />
                    ) : (
                      <Play className="w-3.5 h-3.5" />
                    )
                  }
                >
                  <span>{isPending ? 'Tasdiq Kutilmoqda' : 'Darsni Boshlash'}</span>
                </NeonButton>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CoursesView;
