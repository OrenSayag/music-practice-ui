import { NAV_ITEMS } from '@/config/nav';
import { Link, useLocation, useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useDir } from '@/hooks/use-dir';
import { Settings, LogOut } from 'lucide-react';
import { logout } from '@/services/auth/auth-api';
import { cn } from '@/lib/utils';

export function AppSidebar() {
  const { t } = useTranslation();
  const location = useLocation();
  const dir = useDir();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      // continue to login regardless
    }
    navigate('/login');
  };

  const borderSide = dir === 'rtl' ? 'border-l' : 'border-r';

  return (
    <aside
      className={cn(
        'hidden md:flex flex-col justify-between w-60 shrink-0 bg-background font-mono p-8',
        borderSide
      )}
    >
      <div className="flex flex-col gap-8">
        <Link to="/home" className="flex items-center gap-2">
          <span className="text-2xl font-bold text-accent-green">&gt;</span>
          <span className="text-xl font-medium">{t('appName')}</span>
        </Link>

        <nav className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const isActive =
              location.pathname === item.href ||
              (item.href !== '/' &&
                location.pathname.startsWith(item.href + '/'));

            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-sm px-3 py-2 text-base',
                  isActive
                    ? 'bg-accent text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <item.icon className="h-4 w-4 text-primary" />
                <span>{t(item.titleKey).toLowerCase()}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="flex flex-col gap-1">
        <Link
          to="/settings"
          className={cn(
            'flex items-center gap-3 rounded-sm px-3 py-2 text-base text-muted-foreground hover:text-foreground',
            location.pathname === '/settings' && 'bg-accent text-foreground'
          )}
        >
          <Settings className="h-4 w-4" />
          <span>{t('nav.settings').toLowerCase()}</span>
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 rounded-sm px-3 py-2 text-base text-muted-foreground hover:text-foreground"
        >
          <LogOut className="h-4 w-4" />
          <span>{t('sidebar.logout').toLowerCase()}</span>
        </button>
      </div>
    </aside>
  );
}
