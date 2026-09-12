import React, { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CourseProvider } from './context/CourseContext';
import { AnnouncementProvider } from './context/AnnouncementContext';
import { FeedbackProvider } from './context/FeedbackContext';
import { Layout } from './components/layout/Layout';
import { IntroView } from './components/pages/IntroView';
import { DashboardView } from './components/pages/DashboardView';
import { ProfileView } from './components/pages/ProfileView';
import { CoursesView } from './components/pages/CoursesView';
import { TestsView } from './components/pages/TestsView';
import { AiAssistantView } from './components/pages/AiAssistantView';
import { SettingsView } from './components/pages/SettingsView';
import { AdminCmsView } from './components/pages/AdminCmsView';
import { NotFoundView } from './components/pages/NotFoundView';
import { ActiveRoute } from './types';

// F5 bilan sahifa yangilanganda foydalanuvchi qaysi bo'limda turgan bo'lsa,
// o'sha bo'limda qolishi uchun joriy bo'lim nomini sessionStorage'da saqlaymiz.
// Bu FAQAT "qaysi bo'lim ochiq edi" degan bitta matnni saqlaydi — hech qanday
// kurs/foydalanuvchi/boshqa ma'lumotga tegmaydi va ularning yuklanishiga
// ta'sir qilmaydi.
const ACTIVE_ROUTE_STORAGE_KEY = 'eduplatform-active-route';

const VALID_ROUTES: ActiveRoute[] = [
  'dashboard',
  'profile',
  'courses',
  'tests',
  'ai-assistant',
  'settings',
  'admin-cms',
];

function getInitialActiveRoute(): ActiveRoute {
  try {
    const saved = sessionStorage.getItem(ACTIVE_ROUTE_STORAGE_KEY);
    if (saved && (VALID_ROUTES as string[]).includes(saved)) {
      return saved as ActiveRoute;
    }
  } catch (e) {
    // sessionStorage mavjud bo'lmasa (masalan, xususiy rejim cheklovi),
    // shunchaki standart bo'limdan boshlaymiz.
  }
  return 'dashboard';
}

function MainApp() {
  const { isAuthenticated, currentUser } = useAuth();
  const [activeRoute, setActiveRouteState] = useState<ActiveRoute>(getInitialActiveRoute);

  const setActiveRoute = (route: ActiveRoute) => {
    setActiveRouteState(route);
    try {
      // "intro" va "not-found" vaqtinchalik holatlar — ularni saqlab qo'ysak,
      // keyingi safar sahifa ochilganda noqulay holatga tushirib qo'yishi
      // mumkin, shuning uchun faqat haqiqiy bo'limlarni saqlaymiz.
      if ((VALID_ROUTES as string[]).includes(route)) {
        sessionStorage.setItem(ACTIVE_ROUTE_STORAGE_KEY, route);
      }
    } catch (e) {
      // sessionStorage ishlamasa ham dastur ishlashda davom etadi.
    }
  };

  // If user is not authenticated: Show the Animated IT & AI Learning Intro with embedded Auth/Admin portal
  if (!isAuthenticated || !currentUser) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
        <IntroView
          onSuccessAuth={() => setActiveRoute('dashboard')}
          onRouteChange={(route) => setActiveRoute(route)}
        />
      </div>
    );
  }

  return (
    <Layout activeRoute={activeRoute} onRouteChange={setActiveRoute}>
      {activeRoute === 'dashboard' && (
        <DashboardView onRouteChange={setActiveRoute} />
      )}

      {activeRoute === 'profile' && (
        <ProfileView onRouteChange={setActiveRoute} />
      )}

      {activeRoute === 'courses' && (
        <CoursesView onNavigateToAdmin={() => setActiveRoute('admin-cms')} />
      )}

      {activeRoute === 'tests' && (
        <TestsView onNavigateToAdmin={() => setActiveRoute('admin-cms')} />
      )}

      {activeRoute === 'ai-assistant' && <AiAssistantView />}

      {activeRoute === 'settings' && <SettingsView />}

      {activeRoute === 'admin-cms' && <AdminCmsView />}

      {activeRoute === 'intro' && (
        <IntroView
          onSuccessAuth={() => setActiveRoute('dashboard')}
          onRouteChange={setActiveRoute}
        />
      )}

      {activeRoute === 'not-found' && (
        <NotFoundView onNavigate={(p) => setActiveRoute(p as ActiveRoute)} onRouteChange={setActiveRoute} />
      )}
    </Layout>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CourseProvider>
          <AnnouncementProvider>
            <FeedbackProvider>
              <MainApp />
            </FeedbackProvider>
          </AnnouncementProvider>
        </CourseProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
