export type UserRole = 'student' | 'admin';
export type UserStatus = 'pending' | 'approved' | 'rejected';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  email?: string;
  telegramHandle?: string;
  authProvider?: 'email' | 'phone' | 'google' | 'gmail' | 'telegram';
  role: UserRole;
  status: UserStatus;
  avatarUrl?: string;
  joinedDate: string;
  bio?: string;
  /**
   * Foydalanuvchi qaysi kurslarga kira oladi:
   * - 'all'        -> barcha kurslar ochiq (admin "Barchasini ochish" tugmasini bosgan)
   * - string[]     -> faqat shu ro'yxatdagi kurs id'lari ochiq (admin tanlab ochgan)
   * - undefined    -> eski (oldingi) foydalanuvchilar uchun, tasdiqlangan bo'lsa hammasi ochiq deb hisoblanadi
   */
  courseAccess?: 'all' | string[];
}

export interface LessonAttachment {
  id: string;
  name: string;
  type: 'pdf' | 'image' | 'video' | 'file';
  url: string;
  size?: string;
  uploadedAt?: string;
}

export interface Lesson {
  id: string;
  title: string;
  duration: string;
  isCompleted?: boolean;
  bunnyVideoId?: string;
  libraryId?: string;
  videoUrl?: string;
  videoName?: string;
  videoType?: 'direct' | 'bunny' | 'embed';
  pdfUrl?: string;
  pdfName?: string;
  imageUrl?: string;
  imageName?: string;
  attachments?: LessonAttachment[];
  description?: string;
  courseName?: string;
  order?: number;
}

export interface Course {
  id: string;
  title: string;
  category: string;
  level: 'Boshlang\'ich' | 'O\'rta' | 'Yuqori';
  duration: string;
  lessonsCount: number;
  studentsCount: number;
  rating: number;
  description: string;
  instructor: string;
  thumbnail: string;
  introVideoUrl?: string;
  lessons: Lesson[];
  status: 'active' | 'draft';
  order?: number;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  imageUrl?: string;
  imageName?: string;
  videoUrl?: string;
  videoName?: string;
  points?: number;
}

export interface Quiz {
  id: string;
  title: string;
  category: string;
  questionsCount: number;
  durationMinutes: number;
  difficulty: 'Oson' | 'O\'rtacha' | 'Qiyin';
  description: string;
  passingScore?: number;
  thumbnail?: string;
  questions: QuizQuestion[];
}

export interface NotificationSettings {
  emailNewCourses: boolean;
  emailTestResults: boolean;
  emailWeeklyDigest: boolean;
  platformAnnouncements: boolean;
  platformDeadlineAlerts: boolean;
  smsSecurityAlerts: boolean;
}

export interface SecuritySettings {
  twoFactorEnabled: boolean;
  loginAlerts: boolean;
}

export interface Announcement {
  id: string;
  title: string;
  message: string;
  category: 'important' | 'news' | 'system' | 'update';
  author: string;
  createdAt: string;
  isPinned?: boolean;
}

export type FeedbackType = 'suggestion' | 'request' | 'opinion' | 'comment' | 'complaint' | 'question';
export type FeedbackStatus = 'new' | 'reviewed' | 'resolved';

export interface FeedbackMessage {
  id: string;
  userId?: string;
  userName: string;
  userEmail?: string;
  userPhone?: string;
  userTelegram?: string;
  type: FeedbackType; // taklif, talab, fikr, izoh, shikoyat, savol
  subject: string;
  message: string;
  rating?: number;
  status: FeedbackStatus;
  adminReply?: string;
  adminRepliedAt?: string;
  createdAt: string;
}

export type ActiveRoute =
  | 'dashboard'
  | 'profile'
  | 'courses'
  | 'tests'
  | 'ai-assistant'
  | 'settings'
  | 'admin-cms'
  | 'intro'
  | 'not-found';

export interface TestResult {
  id: string;
  quizId: string;
  userId: string;
  score: number;
  totalQuestions: number;
  completedAt: string;
}

