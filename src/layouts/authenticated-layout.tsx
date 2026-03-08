import { AppSidebar } from '@/components/app-sidebar';
import { MobileTabBar } from '@/components/mobile-tab-bar';
import { ErrorPage } from '@/components/error-page';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Spinner } from '@/components/ui/spinner';
import { ApiError } from '@/services/api/api-client';
import { getMe, logout } from '@/services/auth/auth-api';
import type { User } from '@/services/auth/auth-types';
import { LogOut, Settings } from 'lucide-react';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { Link, Outlet, useNavigate } from 'react-router';
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
      <SidebarProvider>
        <div className="hidden md:contents">
          <AppSidebar />
        </div>
        <SidebarInset>
          <header className="sticky top-0 z-50 flex items-center justify-between border-b bg-background/95 px-4 py-2 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <SidebarTrigger className="hidden md:flex" />
            <span className="text-sm font-medium md:hidden">{t('appName')}</span>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" asChild>
                <Link to="/settings">
                  <Settings className="h-4 w-4" />
                </Link>
              </Button>
              <Avatar className="h-8 w-8">
                {user.image && <AvatarImage src={user.image} />}
                <AvatarFallback>
                  {user.isGuest ? 'G' : getInitials(`${user.firstName} ${user.lastName}`)}
                </AvatarFallback>
              </Avatar>
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </header>

          <main className="flex-1 p-6 pb-24 md:pb-6">
            <Outlet />
          </main>
        </SidebarInset>
        <MobileTabBar />
      </SidebarProvider>
    </AuthContext>
  );
}

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
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
    } catch (err) {
      console.error('Logout failed:', err);
    } finally {
      navigate('/login');
    }
  };

  return { user, setUser, error, isLoading, retry: fetchUser, handleLogout };
}
