import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from '@/components/theme-provider';
import { TooltipProvider } from '@/components/ui/tooltip';
import { DirProvider } from '@/components/dir-provider';
import i18n from '@/i18n';

const queryClient = new QueryClient({
  defaultOptions: {
    mutations: {
      onError: () => {
        toast.error(i18n.t('error.defaultTitle'));
      },
    },
  },
});
import LandingPage from '@/pages/landing';
import LoginPage from '@/pages/login';
import DashboardPage from '@/pages/dashboard';
import PracticePage from '@/pages/practice';
import SessionsPage from '@/pages/sessions';
import SessionDetailPage from '@/pages/session-detail';
import SettingsPage from '@/pages/settings';
import RecordingsPage from '@/pages/recordings';
import NotFoundPage from '@/pages/not-found';
import AuthenticatedLayout from '@/layouts/authenticated-layout';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <DirProvider>
            <BrowserRouter>
              <Routes>
                <Route index element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route element={<AuthenticatedLayout />}>
                  <Route path="home" element={<DashboardPage />} />
                  <Route path="practice" element={<PracticePage />} />
                  <Route path="practice/chat" element={<PracticePage />} />
                  <Route path="sessions" element={<SessionsPage />} />
                  <Route path="sessions/:sessionId" element={<SessionDetailPage />} />
                  <Route path="recordings" element={<RecordingsPage />} />
                  <Route path="settings" element={<SettingsPage />} />
                  <Route path="*" element={<NotFoundPage />} />
                </Route>
              </Routes>
            </BrowserRouter>
            <Toaster />
          </DirProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </StrictMode>,
);
