import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCourses } from '../../context/CourseContext';
import { useAnnouncements } from '../../context/AnnouncementContext';
import { useFeedback } from '../../context/FeedbackContext';
import { Course, User, UserStatus, Quiz, QuizQuestion, Lesson, FeedbackType, FeedbackStatus, FeedbackMessage } from '../../types';
import { isSoundEnabled, toggleSoundEnabled, playNotificationSound } from '../../utils/audio';
import {
  ShieldCheck,
  Users,
  BookOpen,
  CheckCircle,
  XCircle,
  Plus,
  Trash2,
  Edit,
  Clock,
  Search,
  Check,
  X,
  FileText,
  AlertTriangle,
  Sparkles,
  HelpCircle,
  Megaphone,
  Pin,
  BarChart3,
  Send,
  Video,
  ListPlus,
  Layers,
  UserPlus,
  Phone,
  Mail,
  UserCheck,
  ShieldAlert,
  MessageSquarePlus,
  MessageSquare,
  Lightbulb,
  Target,
  MessageCircle,
  Star,
  CheckCheck,
  Reply,
  Filter,
  Volume2,
  VolumeX,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { LessonManagerModal } from '../admin/LessonManagerModal';

export const AdminCmsView: React.FC = () => {
  const { currentUser, users, approveUser, rejectUser, switchUserRoleOrStatus, updateAnyUser, addUser, deleteUser, clearDemoUsers } = useAuth();
  const {
    courses,
    addCourse,
    updateCourse,
    deleteCourse,
    addLessonToCourse,
    updateLessonInCourse,
    deleteLessonFromCourse,
    quizzes,
    addQuiz,
    updateQuiz,
    deleteQuiz,
    addQuestionToQuiz,
    updateQuestionInQuiz,
    deleteQuestionFromQuiz,
    clearAllCourses,
    clearAllQuizzes,
  } = useCourses();
  const {
    announcements,
    addAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    togglePinAnnouncement,
    clearAllAnnouncements,
  } = useAnnouncements();

  const {
    feedbacks,
    unreadFeedbacksCount,
    updateFeedbackStatus,
    replyToFeedback,
    deleteFeedback,
    clearAllFeedbacks,
  } = useFeedback();

  // Active Admin CMS Tab: 'users' | 'courses' | 'quizzes' | 'announcements' | 'analytics' | 'feedbacks'
  const [activeTab, setActiveTab] = useState<'users' | 'courses' | 'quizzes' | 'announcements' | 'analytics' | 'feedbacks'>('users');
  const tabsContainerRef = useRef<HTMLDivElement>(null);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftPos, setScrollLeftPos] = useState(0);

  const scrollTabs = (direction: 'left' | 'right') => {
    if (tabsContainerRef.current) {
      const scrollAmount = direction === 'left' ? -250 : 250;
      tabsContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleTabsMouseDown = (e: React.MouseEvent) => {
    if (!tabsContainerRef.current) return;
    setIsMouseDown(true);
    setStartX(e.pageX - tabsContainerRef.current.offsetLeft);
    setScrollLeftPos(tabsContainerRef.current.scrollLeft);
  };

  const handleTabsMouseLeave = () => {
    setIsMouseDown(false);
  };

  const handleTabsMouseUp = () => {
    setIsMouseDown(false);
  };

  const handleTabsMouseMove = (e: React.MouseEvent) => {
    if (!isMouseDown || !tabsContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - tabsContainerRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    tabsContainerRef.current.scrollLeft = scrollLeftPos - walk;
  };

  const handleTabsWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (tabsContainerRef.current) {
      tabsContainerRef.current.scrollLeft += e.deltaY;
    }
  };

  const selectTab = (tab: typeof activeTab) => {
    setActiveTab(tab);
    setTimeout(() => {
      const activeBtn = document.getElementById(`admin-tab-${tab}`);
      if (activeBtn && tabsContainerRef.current) {
        activeBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }, 50);
  };

  useEffect(() => {
    const activeBtn = document.getElementById(`admin-tab-${activeTab}`);
    if (activeBtn && tabsContainerRef.current) {
      activeBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [activeTab]);

  // FEEDBACK MANAGEMENT STATE
  const [feedbackSearch, setFeedbackSearch] = useState('');
  const [feedbackTypeFilter, setFeedbackTypeFilter] = useState<'all' | FeedbackType>('all');
  const [feedbackStatusFilter, setFeedbackStatusFilter] = useState<'all' | FeedbackStatus>('all');
  const [replyingFeedbackId, setReplyingFeedbackId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [soundOn, setSoundOn] = useState<boolean>(() => isSoundEnabled());

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
    const next = toggleSoundEnabled();
    setSoundOn(next);
    if (next) {
      playNotificationSound('chime', true);
    }
  };

  // USER MANAGEMENT STATE
  const [userSearch, setUserSearch] = useState('');
  const [userStatusFilter, setUserStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userFirstName, setUserFirstName] = useState('');
  const [userLastName, setUserLastName] = useState('');
  const [userPhoneNumber, setUserPhoneNumber] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userRole, setUserRole] = useState<'student' | 'admin'>('student');
  const [userStatus, setUserStatus] = useState<UserStatus>('pending');

  // COURSE MANAGEMENT STATE
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [courseTitle, setCourseTitle] = useState('');
  const [courseCategory, setCourseCategory] = useState('Dasturlash');
  const [courseLevel, setCourseLevel] = useState<'Boshlang\'ich' | 'O\'rta' | 'Yuqori'>('Boshlang\'ich');
  const [courseDuration, setCourseDuration] = useState('20 soat');
  const [courseInstructor, setCourseInstructor] = useState('');
  const [courseDescription, setCourseDescription] = useState('');
  const [courseThumbnail, setCourseThumbnail] = useState('');

  // Course Lessons management
  const [managingCourseLessons, setManagingCourseLessons] = useState<Course | null>(null);
  const [newLessonTitle, setNewLessonTitle] = useState('');
  const [newLessonDuration, setNewLessonDuration] = useState('15 daqiqa');
  const [newLessonBunnyId, setNewLessonBunnyId] = useState('');
  const [newLessonLibraryId, setNewLessonLibraryId] = useState('384729');
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const [editingLessonTitle, setEditingLessonTitle] = useState('');
  const [editingLessonDuration, setEditingLessonDuration] = useState('');
  const [editingLessonBunnyId, setEditingLessonBunnyId] = useState('');
  const [editingLessonLibraryId, setEditingLessonLibraryId] = useState('384729');


  // QUIZ MANAGEMENT STATE
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
  const [quizTitle, setQuizTitle] = useState('');
  const [quizCategory, setQuizCategory] = useState('Sun\'iy Intellekt');
  const [quizDifficulty, setQuizDifficulty] = useState<'Oson' | 'O\'rtacha' | 'Qiyin'>('O\'rtacha');
  const [quizDuration, setQuizDuration] = useState(15);
  const [quizDescription, setQuizDescription] = useState('');

  // Quiz questions management
  const [managingQuiz, setManagingQuiz] = useState<Quiz | null>(null);
  const [newQuestionText, setNewQuestionText] = useState('');
  const [newOption0, setNewOption0] = useState('');
  const [newOption1, setNewOption1] = useState('');
  const [newOption2, setNewOption2] = useState('');
  const [newOption3, setNewOption3] = useState('');
  const [correctOptionIndex, setCorrectOptionIndex] = useState(0);
  const [newQuestionExplanation, setNewQuestionExplanation] = useState('');
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);

  // ANNOUNCEMENTS MANAGEMENT STATE
  const [editingAnnId, setEditingAnnId] = useState<string | null>(null);
  const [annTitle, setAnnTitle] = useState('');
  const [annMessage, setAnnMessage] = useState('');
  const [annCategory, setAnnCategory] = useState<'important' | 'news' | 'system' | 'update'>('important');
  const [annIsPinned, setAnnIsPinned] = useState(false);
  const [annSentSuccess, setAnnSentSuccess] = useState(false);

  // SYSTEM SETTINGS STATE
  const [systemAlertMessage, setSystemAlertMessage] = useState<string | null>(null);

  const pendingUsersCount = users.filter((u) => u.status === 'pending').length;

  // USER ACTIONS
  const handleOpenEditUser = (u: User) => {
    setEditingUser(u);
    setUserFirstName(u.firstName);
    setUserLastName(u.lastName);
    setUserPhoneNumber(u.phoneNumber);
    setUserEmail(u.email || '');
    setUserRole(u.role);
    setUserStatus(u.status);
    setIsUserModalOpen(true);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser || !userFirstName.trim() || !userLastName.trim() || !userPhoneNumber.trim()) return;

    updateAnyUser(editingUser.id, {
      firstName: userFirstName.trim(),
      lastName: userLastName.trim(),
      phoneNumber: userPhoneNumber.trim(),
      email: userEmail.trim(),
      role: userRole,
      status: userStatus,
    });
    setIsUserModalOpen(false);
  };

  const handleAddNewUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userFirstName.trim() || !userLastName.trim() || !userPhoneNumber.trim()) return;

    addUser({
      firstName: userFirstName.trim(),
      lastName: userLastName.trim(),
      phoneNumber: userPhoneNumber.trim(),
      email: userEmail.trim() || `${userFirstName.toLowerCase()}@eduplatform.uz`,
      role: userRole,
      status: userStatus,
      bio: 'Administrator tomonidan qo\'shilgan foydalanuvchi.',
    });
    setIsAddUserModalOpen(false);
    setUserFirstName('');
    setUserLastName('');
    setUserPhoneNumber('');
    setUserEmail('');
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      `${u.firstName} ${u.lastName}`.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.phoneNumber.includes(userSearch);
    const matchesFilter = userStatusFilter === 'all' || u.status === userStatusFilter;
    return matchesSearch && matchesFilter;
  });

  // COURSE ACTIONS
  const handleOpenCreateCourse = () => {
    setEditingCourse(null);
    setCourseTitle('');
    setCourseCategory('Dasturlash');
    setCourseLevel('Boshlang\'ich');
    setCourseDuration('24 soat');
    setCourseInstructor('Senior Mutaxassis');
    setCourseDescription('');
    setCourseThumbnail('https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&auto=format&fit=crop&q=80');
    setIsCourseModalOpen(true);
  };

  const handleOpenEditCourse = (course: Course) => {
    setEditingCourse(course);
    setCourseTitle(course.title);
    setCourseCategory(course.category);
    setCourseLevel(course.level);
    setCourseDuration(course.duration);
    setCourseInstructor(course.instructor);
    setCourseDescription(course.description);
    setCourseThumbnail(course.thumbnail);
    setIsCourseModalOpen(true);
  };

  const handleSaveCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseTitle.trim() || !courseInstructor.trim()) return;

    if (editingCourse) {
      updateCourse(editingCourse.id, {
        title: courseTitle.trim(),
        category: courseCategory,
        level: courseLevel,
        duration: courseDuration,
        instructor: courseInstructor.trim(),
        description: courseDescription.trim(),
        thumbnail: courseThumbnail.trim(),
      });
    } else {
      addCourse({
        title: courseTitle.trim(),
        category: courseCategory,
        level: courseLevel,
        duration: courseDuration,
        instructor: courseInstructor.trim(),
        description: courseDescription.trim(),
        thumbnail: courseThumbnail.trim(),
        lessonsCount: 3,
        studentsCount: 0,
        rating: 5.0,
        status: 'active',
        lessons: [
          { id: `l-${Date.now()}-1`, title: 'Kirish va muhitni sozlash', duration: '15 daqiqa', isCompleted: false },
          { id: `l-${Date.now()}-2`, title: 'Asosiy tushunchalar va arxitektura', duration: '25 daqiqa', isCompleted: false },
          { id: `l-${Date.now()}-3`, title: 'Amaliy mashg\'ulot va kod yozish', duration: '35 daqiqa', isCompleted: false },
        ],
      });
    }
    setIsCourseModalOpen(false);
  };

  const handleAddLesson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!managingCourseLessons || !newLessonTitle.trim()) return;

    const lessonData: Omit<Lesson, 'id'> = {
      title: newLessonTitle.trim(),
      duration: newLessonDuration.trim() || '15 daqiqa',
      isCompleted: false,
      bunnyVideoId: newLessonBunnyId.trim() || undefined,
      libraryId: newLessonLibraryId.trim() || '384729',
      courseName: managingCourseLessons.title,
    };

    addLessonToCourse(managingCourseLessons.id, lessonData);
    const newLessonObj: Lesson = {
      id: `lesson-${Date.now()}`,
      ...lessonData,
    };
    setManagingCourseLessons((prev) =>
      prev ? { ...prev, lessons: [...prev.lessons, newLessonObj] } : null
    );
    setNewLessonTitle('');
    setNewLessonBunnyId('');
  };

  const handleStartEditLesson = (lesson: Lesson) => {
    setEditingLessonId(lesson.id);
    setEditingLessonTitle(lesson.title);
    setEditingLessonDuration(lesson.duration);
    setEditingLessonBunnyId(lesson.bunnyVideoId || '');
    setEditingLessonLibraryId(lesson.libraryId || '384729');
  };

  const handleSaveEditLesson = (courseId: string, lessonId: string) => {
    if (!editingLessonTitle.trim()) return;
    updateLessonInCourse(courseId, lessonId, {
      title: editingLessonTitle.trim(),
      duration: editingLessonDuration.trim() || '15 daqiqa',
      bunnyVideoId: editingLessonBunnyId.trim() || undefined,
      libraryId: editingLessonLibraryId.trim() || '384729',
    });
    setManagingCourseLessons((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        lessons: prev.lessons.map((l) =>
          l.id === lessonId
            ? {
                ...l,
                title: editingLessonTitle.trim(),
                duration: editingLessonDuration.trim() || l.duration,
                bunnyVideoId: editingLessonBunnyId.trim() || undefined,
                libraryId: editingLessonLibraryId.trim() || '384729',
              }
            : l
        ),
      };
    });
    setEditingLessonId(null);
    setEditingLessonTitle('');
    setEditingLessonDuration('');
    setEditingLessonBunnyId('');
  };


  // QUIZ ACTIONS
  const handleOpenEditQuiz = (q: Quiz) => {
    setEditingQuiz(q);
    setQuizTitle(q.title);
    setQuizCategory(q.category);
    setQuizDifficulty(q.difficulty);
    setQuizDuration(q.durationMinutes);
    setQuizDescription(q.description);
    setIsQuizModalOpen(true);
  };

  const handleSaveQuiz = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quizTitle.trim()) return;

    if (editingQuiz) {
      updateQuiz(editingQuiz.id, {
        title: quizTitle.trim(),
        category: quizCategory,
        difficulty: quizDifficulty,
        durationMinutes: Number(quizDuration) || 15,
        description: quizDescription.trim() || 'Platforma bo\'yicha yangi test sinovi.',
      });
      setEditingQuiz(null);
    } else {
      addQuiz({
        title: quizTitle.trim(),
        category: quizCategory,
        difficulty: quizDifficulty,
        durationMinutes: Number(quizDuration) || 15,
        description: quizDescription.trim() || 'Platforma bo\'yicha yangi test sinovi.',
        questionsCount: 0,
        questions: [],
      });
    }
    setIsQuizModalOpen(false);
    setQuizTitle('');
    setQuizDescription('');
  };

  const handleOpenEditQuestion = (q: QuizQuestion) => {
    setEditingQuestionId(q.id);
    setNewQuestionText(q.question);
    setNewOption0(q.options[0] || '');
    setNewOption1(q.options[1] || '');
    setNewOption2(q.options[2] || '');
    setNewOption3(q.options[3] || '');
    setCorrectOptionIndex(q.correctIndex);
    setNewQuestionExplanation(q.explanation || '');
  };

  const handleCancelEditQuestion = () => {
    setEditingQuestionId(null);
    setNewQuestionText('');
    setNewOption0('');
    setNewOption1('');
    setNewOption2('');
    setNewOption3('');
    setNewQuestionExplanation('');
  };

  const handleSaveQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!managingQuiz || !newQuestionText.trim() || !newOption0.trim() || !newOption1.trim()) return;

    const options = [newOption0.trim(), newOption1.trim()];
    if (newOption2.trim()) options.push(newOption2.trim());
    if (newOption3.trim()) options.push(newOption3.trim());

    if (editingQuestionId) {
      updateQuestionInQuiz(managingQuiz.id, editingQuestionId, {
        question: newQuestionText.trim(),
        options,
        correctIndex: Number(correctOptionIndex) || 0,
        explanation: newQuestionExplanation.trim() || 'To\'g\'ri javob dasturlash standartlariga mos keladi.',
      });
      setManagingQuiz((prev) =>
        prev
          ? {
              ...prev,
              questions: prev.questions.map((q) =>
                q.id === editingQuestionId
                  ? {
                      ...q,
                      question: newQuestionText.trim(),
                      options,
                      correctIndex: Number(correctOptionIndex) || 0,
                      explanation: newQuestionExplanation.trim(),
                    }
                  : q
              ),
            }
          : null
      );
      setEditingQuestionId(null);
    } else {
      addQuestionToQuiz(managingQuiz.id, {
        question: newQuestionText.trim(),
        options,
        correctIndex: Number(correctOptionIndex) || 0,
        explanation: newQuestionExplanation.trim() || 'To\'g\'ri javob dasturlash standartlariga mos keladi.',
      });

      const updated = quizzes.find((q) => q.id === managingQuiz.id);
      if (updated) {
        setManagingQuiz({
          ...updated,
          questionsCount: updated.questions.length + 1,
        });
      }
    }

    setNewQuestionText('');
    setNewOption0('');
    setNewOption1('');
    setNewOption2('');
    setNewOption3('');
    setNewQuestionExplanation('');
  };

  // ANNOUNCEMENTS ACTION
  const handleOpenEditAnnouncement = (ann: { id: string; title: string; message: string; category: 'important' | 'news' | 'system' | 'update'; isPinned?: boolean }) => {
    setEditingAnnId(ann.id);
    setAnnTitle(ann.title);
    setAnnMessage(ann.message);
    setAnnCategory(ann.category);
    setAnnIsPinned(Boolean(ann.isPinned));
  };

  const handleCancelEditAnnouncement = () => {
    setEditingAnnId(null);
    setAnnTitle('');
    setAnnMessage('');
    setAnnCategory('important');
    setAnnIsPinned(false);
  };

  const handleSendAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim() || !annMessage.trim()) return;

    if (editingAnnId) {
      updateAnnouncement(editingAnnId, {
        title: annTitle.trim(),
        message: annMessage.trim(),
        category: annCategory,
        isPinned: annIsPinned,
      });
      setEditingAnnId(null);
    } else {
      addAnnouncement(annTitle, annMessage, annCategory, annIsPinned);
    }

    setAnnTitle('');
    setAnnMessage('');
    setAnnSentSuccess(true);
    setTimeout(() => setAnnSentSuccess(false), 3500);
  };

  if (currentUser?.role !== 'admin') {
    return (
      <div id="admin-cms-forbidden" className="max-w-xl mx-auto py-16 px-4 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 mx-auto flex items-center justify-center shadow-lg">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          Admin Paneliga Kirish Taqiqlangan
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
          Ushbu boshqaruv paneliga faqat maxsus login va parol bilan tizimga kirgan administrator ruxsatiga ega. Oddiy talabalar uchun bu bo'lim yopiq.
        </p>
      </div>
    );
  }

  return (
    <div id="admin-cms-view" className="max-w-7xl mx-auto space-y-6 pb-20">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-indigo-600 dark:text-indigo-400 mb-1">
            <span>admin</span>
            <span>/</span>
            <span className="font-semibold bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-200/60 dark:border-indigo-800/60">
              /super-cms
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
            <span>Boshqaruv Paneli (Admin CMS)</span>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              Super Admin
            </span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Foydalanuvchilarni tasdiqlash, kurslar, darslar, interaktiv testlar va talabalarga bildirishnoma yuborish tizimi.
          </p>
        </div>

        {/* Global Pending Quick Badge */}
        {pendingUsersCount > 0 && (
          <div className="flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs font-semibold">
            <Clock className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{pendingUsersCount} ta talaba tasdiqlash kutmoqda</span>
          </div>
        )}
      </div>

      {/* Navigation Tabs with Smooth Horizontal Scroll and Arrow Controls */}
      <div className="relative border-b border-slate-200 dark:border-slate-800 pb-2">
        <div className="flex items-center gap-1.5">
          {/* Left Scroll Arrow (Visible on all devices for fast navigation) */}
          <button
            type="button"
            onClick={() => scrollTabs('left')}
            className="flex items-center justify-center w-8 h-8 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 shadow-sm shrink-0 cursor-pointer transition-all active:scale-95"
            title="Chapga surish"
            aria-label="Chapga surish"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Scrollable Tabs Track */}
          <div
            ref={tabsContainerRef}
            onWheel={handleTabsWheel}
            onMouseDown={handleTabsMouseDown}
            onMouseLeave={handleTabsMouseLeave}
            onMouseUp={handleTabsMouseUp}
            onMouseMove={handleTabsMouseMove}
            className={`flex-1 flex items-center gap-2 overflow-x-auto scroll-smooth py-1 px-1 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700 select-none touch-pan-x ${
              isMouseDown ? 'cursor-grabbing' : 'cursor-grab'
            }`}
          >
            <button
              id="admin-tab-users"
              type="button"
              onClick={() => selectTab('users')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 whitespace-nowrap cursor-pointer ${
                activeTab === 'users'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Talabalar Boshqaruvi</span>
              {pendingUsersCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-slate-900">
                  {pendingUsersCount}
                </span>
              )}
            </button>

            <button
              id="admin-tab-courses"
              type="button"
              onClick={() => selectTab('courses')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 whitespace-nowrap cursor-pointer ${
                activeTab === 'courses'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Kurslar va Darslar ({courses.length})</span>
            </button>

            <button
              id="admin-tab-quizzes"
              type="button"
              onClick={() => selectTab('quizzes')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 whitespace-nowrap cursor-pointer ${
                activeTab === 'quizzes'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
              }`}
            >
              <HelpCircle className="w-4 h-4" />
              <span>Interaktiv Testlar ({quizzes.length})</span>
            </button>

            <button
              id="admin-tab-announcements"
              type="button"
              onClick={() => selectTab('announcements')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 whitespace-nowrap cursor-pointer ${
                activeTab === 'announcements'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
              }`}
            >
              <Megaphone className="w-4 h-4" />
              <span>E'lonlar ({announcements.length})</span>
            </button>

            <button
              id="admin-tab-feedbacks"
              type="button"
              onClick={() => selectTab('feedbacks')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 whitespace-nowrap cursor-pointer ${
                activeTab === 'feedbacks'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
              }`}
            >
              <MessageSquarePlus className="w-4 h-4" />
              <span>Murojaat va Takliflar ({feedbacks.length})</span>
              {unreadFeedbacksCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500 text-white animate-pulse">
                  {unreadFeedbacksCount} yangi
                </span>
              )}
            </button>

            <button
              id="admin-tab-analytics"
              type="button"
              onClick={() => selectTab('analytics')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 whitespace-nowrap cursor-pointer ${
                activeTab === 'analytics'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Statistika & Tizim</span>
            </button>
          </div>

          {/* Right Scroll Arrow (Visible on all devices) */}
          <button
            type="button"
            onClick={() => scrollTabs('right')}
            className="flex items-center justify-center w-8 h-8 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 shadow-sm shrink-0 cursor-pointer transition-all active:scale-95"
            title="O'ngga surish"
            aria-label="O'ngga surish"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. USERS MANAGEMENT TAB                                                   */}
      {/* ========================================================================= */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Ism, familiya yoki telefon bo'yicha qidirish..."
                className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={userStatusFilter}
                onChange={(e) => setUserStatusFilter(e.target.value as any)}
                className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 focus:outline-none"
              >
                <option value="all">Barcha holatlar ({users.length})</option>
                <option value="pending">Kutilmoqda (Pending) ({pendingUsersCount})</option>
                <option value="approved">Tasdiqlangan ({users.filter((u) => u.status === 'approved').length})</option>
                <option value="rejected">Rad etilgan ({users.filter((u) => u.status === 'rejected').length})</option>
              </select>

              <button
                id="admin-add-user-btn"
                onClick={() => {
                  setUserFirstName('');
                  setUserLastName('');
                  setUserPhoneNumber('+998 ');
                  setUserEmail('');
                  setUserRole('student');
                  setUserStatus('approved');
                  setIsAddUserModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <UserPlus className="w-4 h-4" />
                <span>Yangi Foydalanuvchi</span>
              </button>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] uppercase font-bold text-slate-500 dark:text-slate-400">
                  <tr>
                    <th className="px-5 py-3.5">Talaba / Foydalanuvchi</th>
                    <th className="px-5 py-3.5">Telefon Raqami</th>
                    <th className="px-5 py-3.5">Rol</th>
                    <th className="px-5 py-3.5">Tasdiqlash Holati</th>
                    <th className="px-5 py-3.5 text-right">Boshqaruv</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-8 text-center text-slate-400">
                        Foydalanuvchilar topilmadi.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={u.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                              alt=""
                              className="w-9 h-9 rounded-xl object-cover ring-2 ring-slate-100 dark:ring-slate-800"
                            />
                            <div>
                              <span className="font-bold text-slate-900 dark:text-white block">
                                {u.firstName} {u.lastName}
                              </span>
                              <span className="text-[11px] text-slate-400 font-mono">
                                {u.email || 'Email yo\'q'} • Qo'shildi: {u.joinedDate}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4 font-mono font-semibold text-slate-800 dark:text-slate-200">
                          <div className="flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 shrink-0" />
                            <a
                              href={`tel:${u.phoneNumber}`}
                              className="hover:text-cyan-600 dark:hover:text-cyan-400 hover:underline"
                            >
                              {u.phoneNumber || 'Kiritilmagan'}
                            </a>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              u.role === 'admin'
                                ? 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-300'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            {u.role === 'admin' ? 'Administrator' : 'Talaba'}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          {u.status === 'pending' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                              <Clock className="w-3 h-3 text-amber-600" />
                              Kutilmoqda (Pending)
                            </span>
                          )}
                          {u.status === 'approved' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                              <CheckCircle className="w-3 h-3 text-emerald-600" />
                              Tasdiqlangan
                            </span>
                          )}
                          {u.status === 'rejected' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
                              <XCircle className="w-3 h-3 text-rose-600" />
                              Rad etilgan
                            </span>
                          )}
                        </td>

                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {u.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => approveUser(u.id)}
                                  title="Tasdiqlash (Approve)"
                                  className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all cursor-pointer"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => rejectUser(u.id)}
                                  title="Rad etish (Reject)"
                                  className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 hover:bg-rose-600 hover:text-white transition-all cursor-pointer"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </>
                            )}

                            {(u.status === 'approved' || u.status === 'rejected') && u.role !== 'admin' && (
                              <button
                                onClick={() => switchUserRoleOrStatus(u.id, 'pending')}
                                title="Kutilmoqda holatiga qaytarish"
                                className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 hover:bg-amber-600 hover:text-white transition-all cursor-pointer"
                              >
                                <Clock className="w-4 h-4" />
                              </button>
                            )}

                            <button
                              onClick={() => handleOpenEditUser(u)}
                              title="Tahrirlash"
                              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-indigo-600 hover:text-white text-slate-600 dark:text-slate-300 transition-all cursor-pointer"
                            >
                              <Edit className="w-4 h-4" />
                            </button>

                            {u.role !== 'admin' && (
                              <button
                                onClick={() => {
                                  if (confirm(`${u.firstName} ${u.lastName} ni tizimdan o'chirishga ishonchingiz komilmi?`)) {
                                    deleteUser(u.id);
                                  }
                                }}
                                title="O'chirish"
                                className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-rose-600 hover:text-white text-slate-400 transition-all cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. COURSES & LESSONS MANAGEMENT TAB                                      */}
      {/* ========================================================================= */}
      {activeTab === 'courses' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Platforma Kurslari va Darslar
              </h2>
              <p className="text-xs text-slate-500">
                Kurslarni tahrirlash, yangi darslar qo'shish va dars mundarijasini boshqarish
              </p>
            </div>

            <button
              id="admin-create-course-btn"
              onClick={handleOpenCreateCourse}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Yangi Kurs Qo'shish</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map((course) => (
              <div
                key={course.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-36 overflow-hidden bg-slate-950">
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-full object-cover opacity-90 hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-600 text-white">
                      {course.category}
                    </div>
                    <div className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-900/80 text-white backdrop-blur-sm">
                      {course.level}
                    </div>
                  </div>

                  <div className="p-4 space-y-2">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                      {course.title}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2">
                      {course.description}
                    </p>

                    <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                      <span>{course.instructor}</span>
                      <span>{course.lessons.length} ta dars • {course.duration}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 pt-0 border-t border-slate-100 dark:border-slate-800 mt-3 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setManagingCourseLessons(course)}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    <ListPlus className="w-3.5 h-3.5" />
                    <span>Darslar ({course.lessons.length})</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditCourse(course)}
                      className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-indigo-600 hover:text-white text-slate-600 dark:text-slate-300 transition-all cursor-pointer"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`"${course.title}" kursini o'chirishga ishonchingiz komilmi?`)) {
                          deleteCourse(course.id);
                        }
                      }}
                      className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-rose-600 hover:text-white text-slate-400 transition-all cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. INTERACTIVE QUIZZES MANAGEMENT TAB                                     */}
      {/* ========================================================================= */}
      {activeTab === 'quizzes' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Interaktiv Testlar va Viktorinalar
              </h2>
              <p className="text-xs text-slate-500">
                Test sinovlarini yaratish, savollar, 4 ta variant va to'g'ri javoblarni kiritish
              </p>
            </div>

            <button
              onClick={() => setIsQuizModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Yangi Test Yaratish</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quizzes.map((quiz) => (
              <div
                key={quiz.id}
                className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                    <span className="px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-300 font-semibold">
                      {quiz.category}
                    </span>
                    <span>{quiz.durationMinutes} daqiqa</span>
                  </div>

                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    {quiz.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                    {quiz.description}
                  </p>

                  <div className="mt-3 inline-block px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] font-mono text-slate-600 dark:text-slate-300">
                    Jami: {quiz.questions.length} ta savol
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <button
                    onClick={() => setManagingQuiz(quiz)}
                    className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-600 hover:text-white text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Savollarni Boshqarish</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditQuiz(quiz)}
                      title="Testni tahrirlash"
                      className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-indigo-600 hover:text-white text-slate-600 dark:text-slate-300 transition-all cursor-pointer"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`"${quiz.title}" testini o'chirishga ishonchingiz komilmi?`)) {
                          deleteQuiz(quiz.id);
                        }
                      }}
                      title="O'chirish"
                      className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-rose-600 hover:text-white text-slate-400 transition-all cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. ANNOUNCEMENTS & NOTIFICATIONS CENTER (Admin to User Feed)              */}
      {/* ========================================================================= */}
      {activeTab === 'announcements' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Create or Edit Announcement Form */}
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Send className="w-4 h-4 text-indigo-600" />
                  <span>{editingAnnId ? "E'lonni Tahrirlash" : "Yangi Bildirishnoma Yozish"}</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  {editingAnnId
                    ? "Mavjud bildirishnoma matni va holatini yangilang."
                    : "Yozilgan xabar darhol barcha talabalarning asosiy sahifasiga yetkaziladi."}
                </p>
              </div>
              {editingAnnId && (
                <button
                  type="button"
                  onClick={handleCancelEditAnnouncement}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                >
                  Bekor qilish
                </button>
              )}
            </div>

            {annSentSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 text-emerald-800 dark:text-emerald-200 text-xs font-semibold flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <span>Bildirishnoma muvaffaqiyatli saqlandi va saytda yangilandi!</span>
              </div>
            )}

            <form onSubmit={handleSendAnnouncement} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Sarlavha (Title) *
                </label>
                <input
                  type="text"
                  required
                  value={annTitle}
                  onChange={(e) => setAnnTitle(e.target.value)}
                  placeholder="Ertaga soat 18:00 da AI bo'yicha amaliy vebinar"
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Xabar Kategoriya
                </label>
                <select
                  value={annCategory}
                  onChange={(e) => setAnnCategory(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                >
                  <option value="important">Muhim Ogohlantirish</option>
                  <option value="news">Platforma Yangiligi</option>
                  <option value="update">Dars & Dastur Yangilanishi</option>
                  <option value="system">Tizim Xabarnomasi</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Xabar Matni (Message) *
                </label>
                <textarea
                  required
                  rows={4}
                  value={annMessage}
                  onChange={(e) => setAnnMessage(e.target.value)}
                  placeholder="Xabarning to'liq matnini kiriting..."
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="pin-ann-checkbox"
                  checked={annIsPinned}
                  onChange={(e) => setAnnIsPinned(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                <label htmlFor="pin-ann-checkbox" className="text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer flex items-center gap-1">
                  <Pin className="w-3.5 h-3.5 text-amber-500" />
                  <span>Asosiy sahifada eng yuqoriga biriktirish (Pin to top)</span>
                </label>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/30 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{editingAnnId ? "O'zgarishlarni Saqlash" : "Talabalarga Yuborish"}</span>
                </button>
                {editingAnnId && (
                  <button
                    type="button"
                    onClick={handleCancelEditAnnouncement}
                    className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold cursor-pointer"
                  >
                    Bekor qilish
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* List of Sent Announcements */}
          <div className="lg:col-span-7 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Yuborilgan E'lonlar Tarixi ({announcements.length})
              </h3>
            </div>

            {announcements.length === 0 ? (
              <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500">
                Hali hech qanday e'lon yuborilmagan.
              </div>
            ) : (
              announcements.map((ann) => (
                <div
                  key={ann.id}
                  className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-start justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {ann.isPinned && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 flex items-center gap-1">
                          <Pin className="w-3 h-3" /> Pin
                        </span>
                      )}
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {ann.category}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">{ann.createdAt}</span>
                    </div>

                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                      {ann.title}
                    </h4>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {ann.message}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => togglePinAnnouncement(ann.id)}
                      title="Biriktirish / Bo'shatish"
                      className={`p-1.5 rounded-lg text-xs cursor-pointer ${
                        ann.isPinned
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-amber-500'
                      }`}
                    >
                      <Pin className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleOpenEditAnnouncement(ann)}
                      title="E'lonni tahrirlash"
                      className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-indigo-600 hover:text-white text-slate-600 dark:text-slate-300 cursor-pointer"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => deleteAnnouncement(ann.id)}
                      title="O'chirish"
                      className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-rose-600 hover:text-white text-slate-400 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. SYSTEM ANALYTICS TAB                                                   */}
      {/* ========================================================================= */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-xs text-slate-400 font-semibold uppercase">Jami Talabalar</span>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
                {users.length}
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-xs text-amber-500 font-semibold uppercase">Tasdiqlash Kutmoqda</span>
              <div className="text-2xl font-black text-amber-600 mt-2">
                {pendingUsersCount}
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-xs text-emerald-500 font-semibold uppercase">Tasdiqlangan</span>
              <div className="text-2xl font-black text-emerald-600 mt-2">
                {users.filter((u) => u.status === 'approved').length}
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-xs text-indigo-500 font-semibold uppercase">Kurslar & Darslar</span>
              <div className="text-2xl font-black text-indigo-600 mt-2">
                {courses.length} / {courses.reduce((acc, c) => acc + c.lessons.length, 0)} dars
              </div>
            </div>
          </div>

          {/* Platform Data Management & Clear Actions */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <span>Platforma Ma'lumotlarini Boshqarish & Tozalash</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Saytdagi demo ma'lumotlarni tozalash yoki platformani haqiqiy ishlab chiqarish (production) holatiga o'tkazish.
                </p>
              </div>
              <button
                onClick={() => {
                  if (confirm("DIQQAT: Saytdagi barcha kurslar, testlar, e'lonlar va demo talabalarni to'liq tozalashni xohlaysizmi? Admin hisobi saqlanib qoladi.")) {
                    clearDemoUsers();
                    clearAllCourses();
                    clearAllQuizzes();
                    clearAllAnnouncements();
                    alert("Barcha demo ma'lumotlar tozalandi! Sayt toza holatga keltirildi.");
                  }
                }}
                className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-md shadow-rose-600/20 flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Barcha Demo Ma'lumotlarni Tozalash</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Foydalanuvchilar</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Jami: {users.length} ta (faqat admin qoladi)</p>
                </div>
                <button
                  onClick={() => {
                    if (confirm("Barcha sinov foydalanuvchilarini o'chirishga ishonchingiz komilmi?")) {
                      clearDemoUsers();
                    }
                  }}
                  className="mt-3 w-full py-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-rose-600 hover:text-white text-slate-700 dark:text-slate-200 text-xs font-semibold transition-all cursor-pointer"
                >
                  Talabalarni Tozalash
                </button>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Kurslar Bazasi</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Jami: {courses.length} ta kurs</p>
                </div>
                <button
                  onClick={() => {
                    if (confirm("Barcha kurslarni o'chirishga ishonchingiz komilmi?")) {
                      clearAllCourses();
                    }
                  }}
                  className="mt-3 w-full py-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-rose-600 hover:text-white text-slate-700 dark:text-slate-200 text-xs font-semibold transition-all cursor-pointer"
                >
                  Kurslarni Tozalash
                </button>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Test Sinovlari</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Jami: {quizzes.length} ta test</p>
                </div>
                <button
                  onClick={() => {
                    if (confirm("Barcha testlarni o'chirishga ishonchingiz komilmi?")) {
                      clearAllQuizzes();
                    }
                  }}
                  className="mt-3 w-full py-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-rose-600 hover:text-white text-slate-700 dark:text-slate-200 text-xs font-semibold transition-all cursor-pointer"
                >
                  Testlarni Tozalash
                </button>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">E'lonlar & Yangiliklar</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Jami: {announcements.length} ta bildirishnoma</p>
                </div>
                <button
                  onClick={() => {
                    if (confirm("Barcha e'lonlarni o'chirishga ishonchingiz komilmi?")) {
                      clearAllAnnouncements();
                    }
                  }}
                  className="mt-3 w-full py-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-rose-600 hover:text-white text-slate-700 dark:text-slate-200 text-xs font-semibold transition-all cursor-pointer"
                >
                  E'lonlarni Tozalash
                </button>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Tizim Boshqaruvi va Xavfsizlik
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Platforma to'liq rollar nazorati (RBAC), talabalar akkauntini tasdiqlash lock mexanizmi va sun'iy intellekt moduli bilan integratsiya qilingan. Admin tomonidan qilingan har qanday o'zgartirish darhol barcha foydalanuvchilar sahifasida aks etadi.
            </p>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. FEEDBACKS & CONTACT ADMIN MANAGEMENT TAB                               */}
      {/* ========================================================================= */}
      {activeTab === 'feedbacks' && (
        <div className="space-y-6">
          {/* Header & Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <MessageSquarePlus className="w-5 h-5 text-indigo-600" />
                <span>Murojaatlar, Takliflar, Talablar va Izohlar</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Foydalanuvchilar tomonidan yuborilgan fikr-mulohazalar, taklif va talablarni ko'rib chiqish hamda admin javobini yo'llash.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Sound Mute/Unmute Toggle */}
              <button
                type="button"
                onClick={handleToggleSound}
                className={`px-3 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  soundOn
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300'
                    : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400'
                }`}
                title={soundOn ? "Bildirishnoma tovushini o'chirish (Mute)" : "Bildirishnoma tovushini yoqish (Unmute)"}
              >
                {soundOn ? (
                  <>
                    <Volume2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <span>Tovush: Yoqiq</span>
                  </>
                ) : (
                  <>
                    <VolumeX className="w-4 h-4 text-rose-500" />
                    <span>Tovush: O'chiq</span>
                  </>
                )}
              </button>

              {/* Sound Test Chime */}
              <button
                type="button"
                onClick={() => playNotificationSound('chime', true)}
                className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                title="Tovushni sinab ko'rish"
              >
                <span>Sinash</span>
              </button>

              {feedbacks.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    if (confirm("Haqiqatan ham barcha murojaat va takliflarni o'chirmoqchimisiz?")) {
                      clearAllFeedbacks();
                    }
                  }}
                  className="px-3 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                  title="Barcha murojaatlarni tozalash"
                >
                  <Trash2 className="w-4 h-4 text-rose-600" />
                  <span>Tozalash</span>
                </button>
              )}
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-semibold uppercase">Jami Murojaatlar</span>
                <MessageSquare className="w-4 h-4 text-slate-400" />
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                {feedbacks.length}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs text-rose-500 font-semibold uppercase">Yangi (Ko'rilmagan)</span>
                <Clock className="w-4 h-4 text-rose-500" />
              </div>
              <div className="text-2xl font-black text-rose-600 mt-1">
                {unreadFeedbacksCount}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs text-amber-500 font-semibold uppercase">Taklif & Talablar</span>
                <Lightbulb className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl font-black text-amber-600 mt-1">
                {feedbacks.filter((f) => f.type === 'suggestion' || f.type === 'request').length}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs text-emerald-500 font-semibold uppercase">Bajarilganlar</span>
                <CheckCircle className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-2xl font-black text-emerald-600 mt-1">
                {feedbacks.filter((f) => f.status === 'resolved').length}
              </div>
            </div>
          </div>

          {/* Filters & Search */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex flex-col md:flex-row gap-3">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={feedbackSearch}
                  onChange={(e) => setFeedbackSearch(e.target.value)}
                  placeholder="Ism, email, mavzu yoki xabar bo'yicha qidirish..."
                  className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-thin py-0.5">
                <span className="text-xs text-slate-400 font-medium mr-1 flex items-center gap-1 shrink-0">
                  <Filter className="w-3.5 h-3.5" />
                  Holat:
                </span>
                {(['all', 'new', 'reviewed', 'resolved'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setFeedbackStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 whitespace-nowrap cursor-pointer ${
                      feedbackStatusFilter === st
                        ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {st === 'all' && 'Barchasi'}
                    {st === 'new' && 'Yangi'}
                    {st === 'reviewed' && 'Ko\'rib chiqildi'}
                    {st === 'resolved' && 'Bajarildi'}
                  </button>
                ))}
              </div>
            </div>

            {/* Type Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-thin py-1 pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="text-xs text-slate-400 font-medium mr-1 shrink-0">Turi:</span>
              {[
                { id: 'all', label: 'Barchasi' },
                { id: 'suggestion', label: '💡 Taklif' },
                { id: 'request', label: '🎯 Talab' },
                { id: 'opinion', label: '💬 Fikr' },
                { id: 'comment', label: '📝 Izoh' },
                { id: 'question', label: '❓ Savol' },
                { id: 'issue', label: '⚠️ Muammo' },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setFeedbackTypeFilter(t.id as any)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all shrink-0 whitespace-nowrap cursor-pointer ${
                    feedbackTypeFilter === t.id
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Feedback Items List */}
          <div className="space-y-3">
            {feedbacks
              .filter((item) => {
                // Status filter
                if (feedbackStatusFilter !== 'all' && item.status !== feedbackStatusFilter) {
                  return false;
                }
                // Type filter
                if (feedbackTypeFilter !== 'all' && item.type !== feedbackTypeFilter) {
                  return false;
                }
                // Search query
                if (feedbackSearch.trim()) {
                  const q = feedbackSearch.toLowerCase();
                  const inUser = item.userName?.toLowerCase().includes(q) || false;
                  const inEmail = item.userEmail?.toLowerCase().includes(q) || false;
                  const inPhone = item.userPhone?.toLowerCase().includes(q) || false;
                  const inSubject = item.subject?.toLowerCase().includes(q) || false;
                  const inMessage = item.message?.toLowerCase().includes(q) || false;
                  return inUser || inEmail || inPhone || inSubject || inMessage;
                }
                return true;
              })
              .length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <MessageSquare className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
                <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  Murojaat yoki takliflar topilmadi
                </h4>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Tanlangan filtrlarga mos keluvchi xabarlar mavjud emas. Foydalanuvchilar "Admin bilan bog'lanish" orqali xabar qoldirganda bu yerda paydo bo'ladi.
                </p>
              </div>
            ) : (
              feedbacks
                .filter((item) => {
                  if (feedbackStatusFilter !== 'all' && item.status !== feedbackStatusFilter) return false;
                  if (feedbackTypeFilter !== 'all' && item.type !== feedbackTypeFilter) return false;
                  if (feedbackSearch.trim()) {
                    const q = feedbackSearch.toLowerCase();
                    return (
                      item.userName?.toLowerCase().includes(q) ||
                      item.userEmail?.toLowerCase().includes(q) ||
                      item.userPhone?.toLowerCase().includes(q) ||
                      item.subject?.toLowerCase().includes(q) ||
                      item.message?.toLowerCase().includes(q)
                    );
                  }
                  return true;
                })
                .map((item) => {
                  const typeStyles: Record<string, { label: string; badge: string; icon: any }> = {
                    suggestion: { label: 'Taklif', badge: 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800', icon: Lightbulb },
                    request: { label: 'Talab / Istak', badge: 'bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800', icon: Target },
                    opinion: { label: 'Fikr-mulohaza', badge: 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800', icon: MessageCircle },
                    comment: { label: 'Izoh', badge: 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700', icon: FileText },
                    question: { label: 'Savol', badge: 'bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-800', icon: HelpCircle },
                    issue: { label: 'Xatolik / Muammo', badge: 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800', icon: AlertTriangle },
                  };

                  const currentType = typeStyles[item.type] || typeStyles.suggestion;
                  const TypeIcon = currentType.icon;

                  return (
                    <div
                      key={item.id}
                      className={`p-5 rounded-2xl bg-white dark:bg-slate-900 border transition-all ${
                        item.status === 'new'
                          ? 'border-indigo-300 dark:border-indigo-800 shadow-md ring-1 ring-indigo-500/20'
                          : 'border-slate-200 dark:border-slate-800 shadow-sm'
                      }`}
                    >
                      {/* Item Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold border ${currentType.badge}`}>
                            <TypeIcon className="w-3.5 h-3.5" />
                            <span>{currentType.label}</span>
                          </span>

                          <span className="text-xs font-bold text-slate-900 dark:text-white">
                            {item.userName || 'Foydalanuvchi'}
                          </span>

                          {item.userRole && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 font-mono">
                              {item.userRole}
                            </span>
                          )}

                          <span className="text-slate-300 dark:text-slate-700">•</span>

                          <span className="text-xs text-slate-400 font-mono">
                            {item.createdAt}
                          </span>
                        </div>

                        {/* Status Badge */}
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                              item.status === 'new'
                                ? 'bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 animate-pulse'
                                : item.status === 'reviewed'
                                ? 'bg-sky-100 dark:bg-sky-950/70 text-sky-700 dark:text-sky-300'
                                : 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300'
                            }`}
                          >
                            {item.status === 'new' && 'Yangi'}
                            {item.status === 'reviewed' && 'Ko\'rib chiqildi'}
                            {item.status === 'resolved' && 'Bajarildi'}
                          </span>
                        </div>
                      </div>

                      {/* Contact Channels & Rating */}
                      <div className="flex flex-wrap items-center gap-4 py-2.5 text-xs text-slate-600 dark:text-slate-400">
                        {item.userEmail && (
                          <a
                            href={`mailto:${item.userEmail}?subject=Re: ${encodeURIComponent(item.subject)}`}
                            className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline"
                            title="Email orqali javob yozish"
                          >
                            <Mail className="w-3.5 h-3.5" />
                            <span>{item.userEmail}</span>
                          </a>
                        )}

                        {item.userPhone && (
                          <a
                            href={`tel:${item.userPhone}`}
                            className="flex items-center gap-1 text-slate-700 dark:text-slate-300 hover:text-indigo-600 font-mono"
                            title="Qo'ng'iroq qilish"
                          >
                            <Phone className="w-3.5 h-3.5" />
                            <span>{item.userPhone}</span>
                          </a>
                        )}

                        {item.telegramUsername && (
                          <a
                            href={`https://t.me/${item.telegramUsername.replace('@', '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-sky-600 dark:text-sky-400 hover:underline font-mono"
                            title="Telegram orqali bog'lanish"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>@{item.telegramUsername.replace('@', '')}</span>
                          </a>
                        )}

                        {item.rating && item.rating > 0 && (
                          <div className="flex items-center gap-1 ml-auto">
                            <span className="text-[11px] text-slate-400 font-medium">Baho:</span>
                            <div className="flex items-center text-amber-400">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`w-3.5 h-3.5 ${
                                    star <= (item.rating || 0)
                                      ? 'fill-amber-400 text-amber-400'
                                      : 'text-slate-200 dark:text-slate-700'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-0.5">
                              {item.rating}/5
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Content Subject & Message */}
                      <div className="mt-1 space-y-2">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                          {item.subject}
                        </h4>
                        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 text-xs leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                          {item.message}
                        </div>
                      </div>

                      {/* Existing Admin Reply */}
                      {item.adminReply && (
                        <div className="mt-3 p-3.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 space-y-1">
                          <div className="flex items-center justify-between text-xs text-purple-800 dark:text-purple-300 font-bold">
                            <span className="flex items-center gap-1.5">
                              <Reply className="w-3.5 h-3.5" />
                              <span>Admin Javobi:</span>
                            </span>
                            {item.repliedAt && (
                              <span className="text-[10px] font-mono text-purple-600 dark:text-purple-400 font-normal">
                                {item.repliedAt}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
                            {item.adminReply}
                          </p>
                        </div>
                      )}

                      {/* Inline Reply Form */}
                      {replyingFeedbackId === item.id && (
                        <div className="mt-3 p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 space-y-2">
                          <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                            Foydalanuvchiga javob yo'llash:
                          </label>
                          <textarea
                            rows={3}
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder="Murojaat bo'yicha qabul qilingan qaror yoki javobingizni yozing..."
                            className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setReplyingFeedbackId(null);
                                setReplyText('');
                              }}
                              className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
                            >
                              Bekor qilish
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (!replyText.trim()) return;
                                replyToFeedback(item.id, replyText);
                                playNotificationSound('success');
                                setReplyingFeedbackId(null);
                                setReplyText('');
                              }}
                              className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
                            >
                              <Send className="w-3 h-3" />
                              <span>Javobni Saqlash</span>
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {/* Change Status Buttons */}
                          {item.status !== 'reviewed' && (
                            <button
                              type="button"
                              onClick={() => updateFeedbackStatus(item.id, 'reviewed')}
                              className="px-2.5 py-1 rounded-lg text-xs font-semibold text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/50 hover:bg-sky-100 dark:hover:bg-sky-900/60 border border-sky-200 dark:border-sky-800 transition-all cursor-pointer"
                            >
                              Ko'rib chiqildi
                            </button>
                          )}

                          {item.status !== 'resolved' && (
                            <button
                              type="button"
                              onClick={() => {
                                updateFeedbackStatus(item.id, 'resolved');
                                playNotificationSound('success');
                              }}
                              className="px-2.5 py-1 rounded-lg text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 transition-all flex items-center gap-1 cursor-pointer"
                            >
                              <CheckCheck className="w-3.5 h-3.5" />
                              <span>Bajarildi</span>
                            </button>
                          )}

                          {item.status === 'resolved' && (
                            <button
                              type="button"
                              onClick={() => updateFeedbackStatus(item.id, 'new')}
                              className="px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer"
                            >
                              Qayta ochish
                            </button>
                          )}

                          {/* Reply Trigger */}
                          {replyingFeedbackId !== item.id && (
                            <button
                              type="button"
                              onClick={() => {
                                setReplyingFeedbackId(item.id);
                                setReplyText(item.adminReply || '');
                              }}
                              className="px-2.5 py-1 rounded-lg text-xs font-semibold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/50 hover:bg-purple-100 dark:hover:bg-purple-900/60 border border-purple-200 dark:border-purple-800 transition-all flex items-center gap-1 cursor-pointer"
                            >
                              <Reply className="w-3.5 h-3.5" />
                              <span>{item.adminReply ? 'Javobni tahrirlash' : 'Javob yozish'}</span>
                            </button>
                          )}
                        </div>

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm("Ushbu murojaatni o'chirishga ishonchingiz komilmi?")) {
                              deleteFeedback(item.id);
                            }
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                          title="Murojaatni o'chirish"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: EDIT USER                                                          */}
      {/* ========================================================================= */}
      {isUserModalOpen && editingUser && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 max-w-lg w-full rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Foydalanuvchini Tahrirlash
              </h3>
              <button
                onClick={() => setIsUserModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Ism</label>
                  <input
                    type="text"
                    required
                    value={userFirstName}
                    onChange={(e) => setUserFirstName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Familiya</label>
                  <input
                    type="text"
                    required
                    value={userLastName}
                    onChange={(e) => setUserLastName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Telefon</label>
                <input
                  type="text"
                  required
                  value={userPhoneNumber}
                  onChange={(e) => setUserPhoneNumber(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Email</label>
                <input
                  type="email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Rol</label>
                  <select
                    value={userRole}
                    onChange={(e) => setUserRole(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="student">Talaba</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Holat</label>
                  <select
                    value={userStatus}
                    onChange={(e) => setUserStatus(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="pending">Kutilmoqda (Pending)</option>
                    <option value="approved">Tasdiqlangan</option>
                    <option value="rejected">Rad etilgan</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsUserModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold"
                >
                  Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD NEW USER                                                       */}
      {/* ========================================================================= */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 max-w-lg w-full rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-indigo-600" />
                <span>Yangi Foydalanuvchi Qo'shish</span>
              </h3>
              <button
                onClick={() => setIsAddUserModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddNewUser} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Ism *</label>
                  <input
                    type="text"
                    required
                    value={userFirstName}
                    onChange={(e) => setUserFirstName(e.target.value)}
                    placeholder="Ismni kiriting"
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Familiya *</label>
                  <input
                    type="text"
                    required
                    value={userLastName}
                    onChange={(e) => setUserLastName(e.target.value)}
                    placeholder="Familiyani kiriting"
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Telefon Raqami *</label>
                <input
                  type="text"
                  required
                  value={userPhoneNumber}
                  onChange={(e) => setUserPhoneNumber(e.target.value)}
                  placeholder="+998 90 123 45 67"
                  className="w-full px-3 py-2 rounded-xl text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Email</label>
                <input
                  type="email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  placeholder="azizbek@eduplatform.uz"
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Rol</label>
                  <select
                    value={userRole}
                    onChange={(e) => setUserRole(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="student">Talaba</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Holat</label>
                  <select
                    value={userStatus}
                    onChange={(e) => setUserStatus(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="approved">Tasdiqlangan</option>
                    <option value="pending">Kutilmoqda (Pending)</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddUserModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold cursor-pointer"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold cursor-pointer"
                >
                  Qo'shish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CREATE / EDIT COURSE                                               */}
      {/* ========================================================================= */}
      {isCourseModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 max-w-lg w-full rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {editingCourse ? 'Kursni Tahrirlash' : 'Yangi Kurs Yaratish'}
              </h3>
              <button
                onClick={() => setIsCourseModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCourse} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Kurs Nomi *</label>
                <input
                  type="text"
                  required
                  value={courseTitle}
                  onChange={(e) => setCourseTitle(e.target.value)}
                  placeholder="Kurs nomini kiriting"
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Kategoriya</label>
                  <select
                    value={courseCategory}
                    onChange={(e) => setCourseCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="Dasturlash">Dasturlash</option>
                    <option value="Sun'iy Intellekt">Sun'iy Intellekt</option>
                    <option value="Algoritmlar">Algoritmlar</option>
                    <option value="Data Science">Data Science</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Daraja</label>
                  <select
                    value={courseLevel}
                    onChange={(e) => setCourseLevel(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="Boshlang'ich">Boshlang'ich</option>
                    <option value="O'rta">O'rta</option>
                    <option value="Yuqori">Yuqori</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">O'qituvchi / Murabbiy</label>
                  <input
                    type="text"
                    required
                    value={courseInstructor}
                    onChange={(e) => setCourseInstructor(e.target.value)}
                    placeholder="Aslonbek Muxtorov"
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Davomiyligi</label>
                  <input
                    type="text"
                    required
                    value={courseDuration}
                    onChange={(e) => setCourseDuration(e.target.value)}
                    placeholder="25 soat"
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Rasm URL</label>
                <input
                  type="url"
                  value={courseThumbnail}
                  onChange={(e) => setCourseThumbnail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Tavsif</label>
                <textarea
                  rows={3}
                  value={courseDescription}
                  onChange={(e) => setCourseDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white resize-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCourseModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold"
                >
                  {editingCourse ? 'Yangilash' : 'Yaratish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: MANAGE COURSE LESSONS & MEDIA (VIDEO, PDF, IMAGE, ATTACHMENTS)     */}
      {/* ========================================================================= */}
      {managingCourseLessons && (
        <LessonManagerModal
          course={courses.find((c) => c.id === managingCourseLessons.id) || managingCourseLessons}
          onClose={() => setManagingCourseLessons(null)}
          onAddLesson={(courseId, lesson) => {
            addLessonToCourse(courseId, lesson);
            const updated = courses.find((c) => c.id === courseId);
            if (updated) setManagingCourseLessons({ ...updated });
          }}
          onUpdateLesson={(courseId, lessonId, updates) => {
            updateLessonInCourse(courseId, lessonId, updates);
            const updated = courses.find((c) => c.id === courseId);
            if (updated) setManagingCourseLessons({ ...updated });
          }}
          onDeleteLesson={(courseId, lessonId) => {
            deleteLessonFromCourse(courseId, lessonId);
            const updated = courses.find((c) => c.id === courseId);
            if (updated) setManagingCourseLessons({ ...updated });
          }}
        />
      )}

      {/* ========================================================================= */}
      {/* MODAL: CREATE / EDIT QUIZ                                                 */}
      {/* ========================================================================= */}
      {isQuizModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 max-w-lg w-full rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {editingQuiz ? "Testni Tahrirlash" : "Yangi Interaktiv Test Yaratish"}
              </h3>
              <button
                onClick={() => {
                  setIsQuizModalOpen(false);
                  setEditingQuiz(null);
                }}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveQuiz} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Test Nomi *</label>
                <input
                  type="text"
                  required
                  value={quizTitle}
                  onChange={(e) => setQuizTitle(e.target.value)}
                  placeholder="Sun'iy Intellekt Asoslari va Neyron Tarmoqlar"
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Kategoriya</label>
                  <select
                    value={quizCategory}
                    onChange={(e) => setQuizCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="Sun'iy Intellekt">Sun'iy Intellekt</option>
                    <option value="Dasturlash">Dasturlash</option>
                    <option value="Algoritmlar">Algoritmlar</option>
                    <option value="Web Texnologiyalar">Web Texnologiyalar</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Qiyinlik Darajasi</label>
                  <select
                    value={quizDifficulty}
                    onChange={(e) => setQuizDifficulty(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="Oson">Oson</option>
                    <option value="O'rtacha">O'rtacha</option>
                    <option value="Qiyin">Qiyin</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Vaqt Chegarasi (Daqiqa)</label>
                <input
                  type="number"
                  min="5"
                  max="120"
                  value={quizDuration}
                  onChange={(e) => setQuizDuration(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Tavsif</label>
                <textarea
                  rows={2}
                  value={quizDescription}
                  onChange={(e) => setQuizDescription(e.target.value)}
                  placeholder="Ushbu test qaysi mavzularni qamrab oladi..."
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white resize-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsQuizModalOpen(false);
                    setEditingQuiz(null);
                  }}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold cursor-pointer"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold cursor-pointer"
                >
                  {editingQuiz ? "O'zgarishlarni Saqlash" : 'Yaratish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: MANAGE QUIZ QUESTIONS                                              */}
      {/* ========================================================================= */}
      {managingQuiz && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 max-w-2xl w-full rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Test Savollarini Boshqarish
                </h3>
                <p className="text-xs text-slate-500 font-mono">
                  {managingQuiz.title} ({managingQuiz.questions.length} ta savol)
                </p>
              </div>
              <button
                onClick={() => setManagingQuiz(null)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Add / Edit Question Form */}
            <form onSubmit={handleSaveQuestion} className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  {editingQuestionId ? "Savolni Tahrirlash" : "Yangi Savol va Javob Variantlari Qo'shish"}
                </span>
                {editingQuestionId && (
                  <button
                    type="button"
                    onClick={handleCancelEditQuestion}
                    className="text-[11px] font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white"
                  >
                    Bekor qilish
                  </button>
                )}
              </div>

              <div>
                <input
                  type="text"
                  required
                  value={newQuestionText}
                  onChange={(e) => setNewQuestionText(e.target.value)}
                  placeholder="Savol matnini kiriting..."
                  className="w-full px-3 py-2 rounded-lg text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  required
                  value={newOption0}
                  onChange={(e) => setNewOption0(e.target.value)}
                  placeholder="Variant A *"
                  className="px-3 py-1.5 rounded-lg text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
                <input
                  type="text"
                  required
                  value={newOption1}
                  onChange={(e) => setNewOption1(e.target.value)}
                  placeholder="Variant B *"
                  className="px-3 py-1.5 rounded-lg text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
                <input
                  type="text"
                  value={newOption2}
                  onChange={(e) => setNewOption2(e.target.value)}
                  placeholder="Variant C (ixtiyoriy)"
                  className="px-3 py-1.5 rounded-lg text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
                <input
                  type="text"
                  value={newOption3}
                  onChange={(e) => setNewOption3(e.target.value)}
                  placeholder="Variant D (ixtiyoriy)"
                  className="px-3 py-1.5 rounded-lg text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">To'g'ri variant qaysi?</label>
                  <select
                    value={correctOptionIndex}
                    onChange={(e) => setCorrectOptionIndex(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-lg text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value={0}>Variant A (1-javob)</option>
                    <option value={1}>Variant B (2-javob)</option>
                    <option value={2}>Variant C (3-javob)</option>
                    <option value={3}>Variant D (4-javob)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">Tushuntirish (Explanation)</label>
                  <input
                    type="text"
                    value={newQuestionExplanation}
                    onChange={(e) => setNewQuestionExplanation(e.target.value)}
                    placeholder="Nima uchun bu to'g'ri..."
                    className="w-full px-3 py-1.5 rounded-lg text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all cursor-pointer"
                >
                  {editingQuestionId ? "Savolni Yangilash" : "Savolni Qo'shish"}
                </button>
                {editingQuestionId && (
                  <button
                    type="button"
                    onClick={handleCancelEditQuestion}
                    className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 cursor-pointer"
                  >
                    Bekor qilish
                  </button>
                )}
              </div>
            </form>

            {/* Questions List */}
            <div className="space-y-2.5">
              {managingQuiz.questions.map((q, idx) => (
                <div
                  key={q.id}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-1.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-bold text-xs text-slate-900 dark:text-white">
                      {idx + 1}. {q.question}
                    </span>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleOpenEditQuestion(q)}
                        className="text-slate-400 hover:text-indigo-600 p-1 cursor-pointer"
                        title="Savolni tahrirlash"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          deleteQuestionFromQuiz(managingQuiz.id, q.id);
                          setManagingQuiz((prev) =>
                            prev
                              ? { ...prev, questions: prev.questions.filter((item) => item.id !== q.id) }
                              : null
                          );
                        }}
                        className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                        title="Savolni o'chirish"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                    {q.options.map((opt, oIdx) => (
                      <div
                        key={oIdx}
                        className={`p-1.5 rounded-md ${
                          oIdx === q.correctIndex
                            ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-300 dark:border-emerald-800'
                            : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {String.fromCharCode(65 + oIdx)}. {opt}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
