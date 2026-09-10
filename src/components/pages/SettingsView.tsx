import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { INITIAL_NOTIFICATIONS, INITIAL_SECURITY } from '../../data/mockData';
import { NotificationSettings, SecuritySettings } from '../../types';
import {
  Sun,
  Moon,
  Laptop,
  Bell,
  Lock,
  User,
  Shield,
  CheckCircle2,
  KeyRound,
  Eye,
  EyeOff,
  Smartphone,
  Save,
  Check,
  AlertCircle,
} from 'lucide-react';

type SettingsTab = 'appearance' | 'notifications' | 'security' | 'profile';

export const SettingsView: React.FC = () => {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { currentUser, updateCurrentUser } = useAuth();

  const [activeTab, setActiveTab] = useState<SettingsTab>('appearance');

  // Notifications state
  const [notifications, setNotifications] = useState<NotificationSettings>(() => {
    const saved = localStorage.getItem('eduplatform-notifications');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_NOTIFICATIONS;
  });

  // Security & Password state
  const [security, setSecurity] = useState<SecuritySettings>(INITIAL_SECURITY);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [passwordFeedback, setPasswordFeedback] = useState<string | null>(null);

  // Profile fields state
  const [firstName, setFirstName] = useState(currentUser?.firstName || '');
  const [lastName, setLastName] = useState(currentUser?.lastName || '');
  const [phoneNumber, setPhoneNumber] = useState(currentUser?.phoneNumber || '');
  const [bio, setBio] = useState(currentUser?.bio || '');

  // Toast / saved confirmation
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  const showToast = (message: string) => {
    setSaveSuccess(message);
    setTimeout(() => {
      setSaveSuccess(null);
    }, 3000);
  };

  const handleToggleNotification = (key: keyof NotificationSettings) => {
    setNotifications((prev) => {
      const updated = { ...prev, [key]: !prev[key] };
      localStorage.setItem('eduplatform-notifications', JSON.stringify(updated));
      return updated;
    });
    showToast('Bildirishnoma sozlamalari saqlandi.');
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordFeedback(null);

    if (!currentPassword) {
      setPasswordFeedback('Iltimos, joriy parolingizni kiriting.');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordFeedback('Yangi parol kamida 6 ta belgidan iborat bo\'lishi kerak.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordFeedback('Yangi parollar bir-biriga mos kelmadi.');
      return;
    }

    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    showToast('Parolingiz muvaffaqiyatli o\'zgartirildi!');
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !phoneNumber.trim()) {
      showToast('Ism, familiya va telefon raqami majburiy!');
      return;
    }
    updateCurrentUser({
      firstName,
      lastName,
      phoneNumber,
      bio,
    });
    showToast('Profil ma\'lumotlari muvaffaqiyatli saqlandi!');
  };

  return (
    <div id="settings-page" className="max-w-5xl mx-auto space-y-6 pb-16">
      {/* Route Badge & Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-indigo-600 dark:text-indigo-400 mb-1">
            <span>app</span>
            <span>/</span>
            <span className="font-semibold bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-200/60 dark:border-indigo-800/60">
              /settings
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Sozlamalar (Settings)
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Mavzu (Theme), bildirishnomalar afzalliklari va xavfsizlik sozlamalarini boshqaring.
          </p>
        </div>

        {saveSuccess && (
          <div
            id="settings-save-toast"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-medium shadow-sm animate-fade-in"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{saveSuccess}</span>
          </div>
        )}
      </div>

      {/* Settings Navigation Tabs */}
      <div className="flex overflow-x-auto space-x-2 border-b border-slate-200 dark:border-slate-800 pb-1 scrollbar-none">
        <button
          id="tab-appearance-btn"
          onClick={() => setActiveTab('appearance')}
          className={`px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all flex items-center gap-2 ${
            activeTab === 'appearance'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
          }`}
        >
          <Sun className="w-4 h-4" />
          <span>Tashqi Ko'rinish & Mavzu</span>
        </button>

        <button
          id="tab-notifications-btn"
          onClick={() => setActiveTab('notifications')}
          className={`px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all flex items-center gap-2 ${
            activeTab === 'notifications'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Bildirishnomalar</span>
        </button>

        <button
          id="tab-security-btn"
          onClick={() => setActiveTab('security')}
          className={`px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all flex items-center gap-2 ${
            activeTab === 'security'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Xavfsizlik & Parol</span>
        </button>

        <button
          id="tab-profile-btn"
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all flex items-center gap-2 ${
            activeTab === 'profile'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Shaxsiy Profil</span>
        </button>
      </div>

      {/* Tab 1: Appearance & Theme Toggle (next-themes specification) */}
      {activeTab === 'appearance' && (
        <div id="settings-appearance-section" className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Platforma Mavzusi (Theme Toggle)
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                next-themes tizimi orqali ilovani yorug' (Light), qorong'u (Dark) yoki tizim (System) rejimiga o'tkazing.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Light Mode Card */}
              <button
                id="theme-select-light"
                onClick={() => {
                  setTheme('light');
                  showToast('Yorug\' rejim (Light mode) yoqildi.');
                }}
                className={`p-4 rounded-xl border-2 text-left transition-all relative ${
                  theme === 'light'
                    ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/20 ring-2 ring-indigo-600/20'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                }`}
              >
                {theme === 'light' && (
                  <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                )}
                <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center mb-3">
                  <Sun className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-sm text-slate-900 dark:text-white">
                  Yorug' (Light)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Oq va yorqin ranglar palitrasi. Kunduzgi o'qish uchun qulay.
                </p>
              </button>

              {/* Dark Mode Card */}
              <button
                id="theme-select-dark"
                onClick={() => {
                  setTheme('dark');
                  showToast('Qorong\'u rejim (Dark mode) yoqildi.');
                }}
                className={`p-4 rounded-xl border-2 text-left transition-all relative ${
                  theme === 'dark'
                    ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/20 ring-2 ring-indigo-600/20'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                }`}
              >
                {theme === 'dark' && (
                  <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                )}
                <div className="w-10 h-10 rounded-lg bg-slate-800 text-indigo-400 flex items-center justify-center mb-3">
                  <Moon className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-sm text-slate-900 dark:text-white">
                  Qorong'u (Dark)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Ko'zga xavfsiz tungi kontrast va batareyani tejash rejimi.
                </p>
              </button>

              {/* System Mode Card */}
              <button
                id="theme-select-system"
                onClick={() => {
                  setTheme('system');
                  showToast('Tizim sozlamalari (System mode) yoqildi.');
                }}
                className={`p-4 rounded-xl border-2 text-left transition-all relative ${
                  theme === 'system'
                    ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/20 ring-2 ring-indigo-600/20'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                }`}
              >
                {theme === 'system' && (
                  <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                )}
                <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center mb-3">
                  <Laptop className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-sm text-slate-900 dark:text-white">
                  Tizim (System)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Operatsion tizimingiz rejimiga avtomatik moslashadi.
                </p>
              </button>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 flex items-center justify-between">
              <span>Hozirgi faol rejim: <strong>{resolvedTheme === 'dark' ? 'Qorong\'u (Dark)' : 'Yorug\' (Light)'}</strong></span>
              <span className="font-mono text-[11px] bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded">
                HTML class: {resolvedTheme === 'dark' ? '.dark' : '.light'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Notifications Preferences */}
      {activeTab === 'notifications' && (
        <div id="settings-notifications-section" className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Bildirishnoma Sozlamalari (Notifications Preferences)
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Elektron pochta (Email) va platforma ichidagi bildirishnomalarni shaxsiylashtiring.
              </p>
            </div>

            {/* Email Notifications Group */}
            <div className="space-y-4 pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Email Bildirishnomalari
              </h3>

              {/* Item 1 */}
              <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    Yangi Kurslar va Yo'nalishlar
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Platformaga yangi kurs qo'shilganda pochta orqali xabardor qilish.
                  </p>
                </div>
                <button
                  id="toggle-email-new-courses"
                  onClick={() => handleToggleNotification('emailNewCourses')}
                  className={`w-12 h-6 rounded-full transition-colors relative focus:outline-none ${
                    notifications.emailNewCourses ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                >
                  <span
                    className={`block w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                      notifications.emailNewCourses ? 'translate-x-6.5' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>

              {/* Item 2 */}
              <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    Interaktiv Test Natijalari
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Topshirilgan testlar bahosi va to'liq tahlilini pochtaga yuborish.
                  </p>
                </div>
                <button
                  id="toggle-email-test-results"
                  onClick={() => handleToggleNotification('emailTestResults')}
                  className={`w-12 h-6 rounded-full transition-colors relative focus:outline-none ${
                    notifications.emailTestResults ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                >
                  <span
                    className={`block w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                      notifications.emailTestResults ? 'translate-x-6.5' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>

              {/* Item 3 */}
              <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    Haftalik O'qish Xulosasi (Weekly Digest)
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Haftalik erishilgan yutuqlar, sarflangan soatlar va tavsiyalar.
                  </p>
                </div>
                <button
                  id="toggle-email-weekly-digest"
                  onClick={() => handleToggleNotification('emailWeeklyDigest')}
                  className={`w-12 h-6 rounded-full transition-colors relative focus:outline-none ${
                    notifications.emailWeeklyDigest ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                >
                  <span
                    className={`block w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                      notifications.emailWeeklyDigest ? 'translate-x-6.5' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Platform Alerts Group */}
            <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Platforma Ogohlantirishlari
              </h3>

              {/* Item 4 */}
              <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    Administrator E'lonlari va Yangiliklar
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Tizim ma'muriyatidan kelgan muhim xabarlar va yangilanishlar.
                  </p>
                </div>
                <button
                  id="toggle-platform-announcements"
                  onClick={() => handleToggleNotification('platformAnnouncements')}
                  className={`w-12 h-6 rounded-full transition-colors relative focus:outline-none ${
                    notifications.platformAnnouncements ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                >
                  <span
                    className={`block w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                      notifications.platformAnnouncements ? 'translate-x-6.5' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>

              {/* Item 5 */}
              <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    Darslar va Test Muddatlari (Deadlines)
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Topshiriqlar va oraliq nazoratlar muddatlari yaqinlashganda eslatish.
                  </p>
                </div>
                <button
                  id="toggle-platform-deadlines"
                  onClick={() => handleToggleNotification('platformDeadlineAlerts')}
                  className={`w-12 h-6 rounded-full transition-colors relative focus:outline-none ${
                    notifications.platformDeadlineAlerts ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                >
                  <span
                    className={`block w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                      notifications.platformDeadlineAlerts ? 'translate-x-6.5' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Security Settings (Password change inputs) */}
      {activeTab === 'security' && (
        <div id="settings-security-section" className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Xavfsizlik & Parolni Yangilash (Security Settings)
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Hisobingiz himoyasini kuchaytirish uchun yangi va mustahkam parol o'rnating.
              </p>
            </div>

            {passwordFeedback && (
              <div
                id="password-feedback-alert"
                className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-amber-800 dark:text-amber-200 text-xs flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <span>{passwordFeedback}</span>
              </div>
            )}

            <form onSubmit={handlePasswordChange} className="space-y-4 max-w-lg">
              {/* Current Password */}
              <div>
                <label
                  htmlFor="current-password-input"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
                >
                  Joriy Parol (Current Password)
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="current-password-input"
                    type={showPasswords ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Joriy parolingizni kiriting"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords(!showPasswords)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label
                  htmlFor="new-password-input"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
                >
                  Yangi Parol (New Password)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="new-password-input"
                    type={showPasswords ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Kamida 6 ta belgi"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Confirm New Password */}
              <div>
                <label
                  htmlFor="confirm-password-input"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
                >
                  Yangi Parolni Tasdiqlang (Confirm Password)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="confirm-password-input"
                    type={showPasswords ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Yangi parolni takrorlang"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <button
                id="save-new-password-btn"
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-md shadow-indigo-600/20 transition-all flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>Parolni Saqlash</span>
              </button>
            </form>

            {/* Additional Security Options: 2FA */}
            <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      Ikki Bosqichli Tasdiqlash (2FA)
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Tizimga kirishda telefon raqamingizga SMS orqali bir martalik kod yuborish.
                    </p>
                  </div>
                </div>
                <button
                  id="toggle-2fa-btn"
                  onClick={() => {
                    setSecurity((prev) => ({
                      ...prev,
                      twoFactorEnabled: !prev.twoFactorEnabled,
                    }));
                    showToast('2FA holati o\'zgartirildi.');
                  }}
                  className={`w-12 h-6 rounded-full transition-colors relative focus:outline-none ${
                    security.twoFactorEnabled ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                >
                  <span
                    className={`block w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                      security.twoFactorEnabled ? 'translate-x-6.5' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Profile editing */}
      {activeTab === 'profile' && (
        <div id="settings-profile-section" className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Shaxsiy Profil Ma'lumotlari
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Ism, familiya va telefon raqamingizni tahrirlash.
              </p>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4 max-w-lg">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Ism
                </label>
                <input
                  id="profile-edit-firstname"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Familiya
                </label>
                <input
                  id="profile-edit-lastname"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Telefon Raqam (Phone Number)
                </label>
                <input
                  id="profile-edit-phone"
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  O'zingiz haqingizda (Bio)
                </label>
                <textarea
                  id="profile-edit-bio"
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <button
                id="profile-save-btn"
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-md shadow-indigo-600/20 transition-all flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>O'zgarishlarni Saqlash</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
