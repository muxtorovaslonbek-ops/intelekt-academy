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

function MainApp() {
  const { isAuthenticated, currentUser } = useAuth();
  const [activeRoute, setActiveRoute] = useState<ActiveRoute>('dashboard');

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
