import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  X,
  BookOpen,
  PlayCircle,
  HelpCircle,
  Megaphone,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { useCourses } from '../../context/CourseContext';
import { useAnnouncements } from '../../context/AnnouncementContext';
import { ActiveRoute, Course, Quiz } from '../../types';

interface GlobalSearchProps {
  onRouteChange?: (route: ActiveRoute) => void;
  className?: string;
  isMobileModal?: boolean;
  onCloseMobile?: () => void;
}

interface SearchResultItem {
  id: string;
  type: 'course' | 'lesson' | 'quiz' | 'announcement';
  title: string;
  subtitle: string;
  category?: string;
  targetRoute: ActiveRoute;
  payload?: any;
}

export const GlobalSearch: React.FC<GlobalSearchProps> = ({
  onRouteChange,
  className = '',
  isMobileModal = false,
  onCloseMobile,
}) => {
  const { courses, quizzes } = useCourses();
  const { announcements } = useAnnouncements();

  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Global shortcut Ctrl+K or Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
        inputRef.current?.focus();
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
        if (onCloseMobile) onCloseMobile();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onCloseMobile]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Compute search results
  const trimmed = query.trim().toLowerCase();

  const results: SearchResultItem[] = React.useMemo(() => {
    if (!trimmed) return [];

    const items: SearchResultItem[] = [];

    // 1. Search Courses
    courses.forEach((c) => {
      const matchTitle = c.title.toLowerCase().includes(trimmed);
      const matchDesc = c.description?.toLowerCase().includes(trimmed);
      const matchCat = c.category?.toLowerCase().includes(trimmed);
      const matchInstructor = c.instructor?.toLowerCase().includes(trimmed);

      if (matchTitle || matchDesc || matchCat || matchInstructor) {
        items.push({
          id: `course-${c.id}`,
          type: 'course',
          title: c.title,
          subtitle: `${c.category || 'Dasturlash'} • ${c.lessonsCount || c.lessons?.length || 0} ta dars • ${c.level}`,
          category: c.category,
          targetRoute: 'courses',
          payload: c,
        });
      }

      // Also search within lessons of the course
      c.lessons?.forEach((lesson, idx) => {
        if (
          lesson.title.toLowerCase().includes(trimmed) ||
          lesson.description?.toLowerCase().includes(trimmed)
        ) {
          items.push({
            id: `lesson-${c.id}-${lesson.id || idx}`,
            type: 'lesson',
            title: lesson.title,
            subtitle: `${c.title} • ${lesson.duration || 'Video dars'}`,
            category: c.category,
            targetRoute: 'courses',
            payload: { course: c, lesson },
          });
        }
      });
    });

    // 2. Search Quizzes / Tests
    quizzes.forEach((q) => {
      const matchTitle = q.title.toLowerCase().includes(trimmed);
      const matchCat = q.category?.toLowerCase().includes(trimmed);
      if (matchTitle || matchCat) {
        items.push({
          id: `quiz-${q.id}`,
          type: 'quiz',
          title: q.title,
          subtitle: `${q.questions?.length || 0} ta savol • ${q.category || 'Test'}`,
          category: q.category,
          targetRoute: 'tests',
          payload: q,
        });
      }
    });

    // 3. Search Announcements
    announcements.forEach((a) => {
      const matchTitle = a.title.toLowerCase().includes(trimmed);
      const matchMsg = a.message.toLowerCase().includes(trimmed);
      if (matchTitle || matchMsg) {
        items.push({
          id: `ann-${a.id}`,
          type: 'announcement',
          title: a.title,
          subtitle: a.message.slice(0, 75) + '...',
          targetRoute: 'dashboard',
          payload: a,
        });
      }
    });

    return items.slice(0, 8); // Limit to top 8 results
  }, [trimmed, courses, quizzes, announcements]);

  const handleSelectItem = (item: SearchResultItem) => {
    if (onRouteChange) {
      onRouteChange(item.targetRoute);
    }
    setIsOpen(false);
    setQuery('');
    if (onCloseMobile) onCloseMobile();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (results.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % results.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + results.length) % results.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const current = results[selectedIndex];
      if (current) {
        handleSelectItem(current);
      }
    }
  };

  const getTypeBadge = (type: SearchResultItem['type']) => {
    switch (type) {
      case 'course':
        return {
          icon: BookOpen,
          label: 'Kurs',
          className: 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300',
        };
      case 'lesson':
        return {
          icon: PlayCircle,
          label: 'Dars',
          className: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300',
        };
      case 'quiz':
        return {
          icon: HelpCircle,
          label: 'Test',
          className: 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300',
        };
      case 'announcement':
        return {
          icon: Megaphone,
          label: "E'lon",
          className: 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300',
        };
    }
  };

  return (
    <div
      ref={containerRef}
      id="global-search-container"
      className={`relative ${className}`}
    >
      {/* Search Input Bar */}
      <div className="relative flex items-center">
        <div className="absolute left-3.5 flex items-center pointer-events-none text-slate-400">
          <Search className="w-4 h-4" />
        </div>

        <input
          ref={inputRef}
          type="text"
          id="global-search-input"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!isOpen) setIsOpen(true);
            setSelectedIndex(0);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Qidiruv: kurslar, darslar, testlar..."
          className="w-full pl-9.5 pr-8 py-2 text-xs md:text-sm rounded-xl bg-slate-100/90 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent focus:border-indigo-500 dark:focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-inner"
        />

        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              inputRef.current?.focus();
            }}
            className="absolute right-2.5 p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Instant Dropdown Results */}
      {isOpen && (
        <div
          id="global-search-results-dropdown"
          className="absolute left-0 right-0 top-full mt-2 w-full sm:min-w-[420px] max-h-[460px] overflow-y-auto bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl z-50 p-2 space-y-1 backdrop-blur-lg animate-in fade-in-50 duration-150"
        >
          {trimmed.length === 0 ? (
            /* Recent / Quick Links when query is empty */
            <div className="p-3 text-xs">
              <div className="flex items-center justify-between text-slate-400 pb-2 border-b border-slate-100 dark:border-slate-800 font-medium">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                  Tezkor bo'limlar
                </span>
                <span className="text-[10px]">Tugmalarni tanlang</span>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => handleSelectItem({
                    id: 'quick-courses',
                    type: 'course',
                    title: 'Barcha Kurslar',
                    subtitle: 'Amaliy darslar ro\'yxati',
                    targetRoute: 'courses',
                  })}
                  className="flex items-center gap-2 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/70 border border-slate-100 dark:border-slate-800/60 text-left transition-colors cursor-pointer"
                >
                  <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-800 dark:text-slate-200">Kurslar</div>
                    <div className="text-[10px] text-slate-400">{courses.length} ta mavjud</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectItem({
                    id: 'quick-tests',
                    type: 'quiz',
                    title: 'Testlar & Viktorinalar',
                    subtitle: 'Bilimni sinash',
                    targetRoute: 'tests',
                  })}
                  className="flex items-center gap-2 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/70 border border-slate-100 dark:border-slate-800/60 text-left transition-colors cursor-pointer"
                >
                  <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
                    <HelpCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-800 dark:text-slate-200">Testlar</div>
                    <div className="text-[10px] text-slate-400">{quizzes.length} ta test</div>
                  </div>
                </button>
              </div>
            </div>
          ) : results.length === 0 ? (
            /* No Results Found */
            <div className="p-6 text-center">
              <Search className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                "{query}" bo'yicha hech narsa topilmadi
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Boshqa kalit so'z yoki mavzu orqali qidirib ko'ring.
              </p>
            </div>
          ) : (
            /* Results List */
            <div className="space-y-1">
              <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
                <span>Topilgan natijalar ({results.length})</span>
                <span className="text-[10px] hidden sm:inline">Tanlash uchun Enter bosing</span>
              </div>

              {results.map((item, idx) => {
                const badge = getTypeBadge(item.type);
                const BadgeIcon = badge.icon;
                const isSelected = idx === selectedIndex;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectItem(item)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-50/80 dark:bg-indigo-950/60 text-indigo-950 dark:text-indigo-100 shadow-sm border border-indigo-200/60 dark:border-indigo-800/60'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3 truncate pr-2">
                      <span className={`p-2 rounded-xl shrink-0 ${badge.className}`}>
                        <BadgeIcon className="w-4 h-4" />
                      </span>
                      <div className="truncate">
                        <div className="text-xs font-bold text-slate-900 dark:text-white truncate flex items-center gap-1.5">
                          <span>{item.title}</span>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${badge.className}`}>
                            {badge.label}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                          {item.subtitle}
                        </div>
                      </div>
                    </div>

                    <ArrowRight className={`w-3.5 h-3.5 shrink-0 transition-transform ${
                      isSelected ? 'text-indigo-600 dark:text-indigo-400 translate-x-0.5' : 'text-slate-300 dark:text-slate-600'
                    }`} />
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
