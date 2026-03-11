import { AppSidebar } from '@/components/app-sidebar';
import { MobileTabBar } from '@/components/mobile-tab-bar';
import { FloatingPlayer } from '@/components/floating-player';
import { ErrorPage } from '@/components/error-page';
import { Spinner } from '@/components/ui/spinner';
import { ApiError } from '@/services/api/api-client';
import { getMe, logout } from '@/services/auth/auth-api';
import type { User } from '@/services/auth/auth-types';
import { MetronomeProvider } from '@/components/practice/metronome';
import { PracticeSessionProvider } from '@/components/practice/practice-session-provider';
import { LogOut, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';

interface AuthContextValue {
  user: User;
  setUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuthUser(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthUser must be used within AuthenticatedLayout');
  return ctx;
}

export default function AuthenticatedLayout() {
  const { t } = useTranslation();
  const { user, setUser, error, isLoading, retry, handleLogout } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorPage
        title={t('error.failedToLoad')}
        message={error}
        onRetry={retry}
      />
    );
  }

  if (!user) return null;

  return (
    <AuthContext value={{ user, setUser }}>
      <MetronomeProvider>
        <PracticeSessionProvider>
          <LayoutShell handleLogout={handleLogout} />
        </PracticeSessionProvider>
      </MetronomeProvider>
    </AuthContext>
  );
}

function LayoutShell({ handleLogout }: { handleLogout: () => void }) {
  const { pathname } = useLocation();
  const isPractice = pathname.startsWith('/practice');

  return (
    <>
      <div className="flex h-screen overflow-hidden">
        <AppSidebar />
        <div className="flex flex-1 flex-col">
          <MobileHeader handleLogout={handleLogout} />
          <main
            className={`flex min-h-0 flex-1 flex-col ${
              isPractice ? '' : 'overflow-y-auto p-6 pb-20 md:p-10 md:pb-10'
            }`}
          >
            <Outlet />
          </main>
        </div>
      </div>
      <FloatingPlayer />
      <MobileTabBar />
    </>
  );
}

function MobileHeader({ handleLogout }: { handleLogout: () => void }) {
  const { t } = useTranslation();

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between border-b bg-background/95 px-4 py-2 backdrop-blur md:hidden supports-[backdrop-filter]:bg-background/60">
      <span className="text-sm font-medium">{t('appName')}</span>
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/settings">
            <Settings className="h-4 w-4" />
          </Link>
        </Button>
        <Button variant="ghost" size="icon" onClick={handleLogout}>
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}

function useAuth() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await getMe();
      setUser(response.user);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) return;
      setError(
        err instanceof ApiError ? err.message : t('error.failedToLoadUser'),
      );
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      // continue to login regardless
    }
    navigate('/login');
  };

  return { user, setUser, error, isLoading, retry: fetchUser, handleLogout };
}
