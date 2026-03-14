import { NAV_ITEMS } from '@/config/nav';
import { Link, useLocation } from 'react-router';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

export function MobileTabBar() {
  const { t } = useTranslation();
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur md:hidden supports-[backdrop-filter]:bg-background/80">
      <div className="flex items-center justify-around px-2 pb-[env(safe-area-inset-bottom)] pt-1.5">
        {NAV_ITEMS.map((item) => {
          const isActive =
            location.pathname === item.href ||
            location.pathname.startsWith(item.href + '/');

          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'flex flex-col items-center gap-0.5 px-3 py-1 text-xs font-medium transition-colors',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground',
              )}
            >
              <item.icon className="h-5 w-5" />
              <span>{t(item.titleKey)}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
