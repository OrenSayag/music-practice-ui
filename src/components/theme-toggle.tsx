import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/components/theme-provider';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const { t } = useTranslation();

  return (
    <div className="flex gap-2">
      <Button
        variant={theme === 'light' ? 'default' : 'outline'}
        size="sm"
        onClick={() => setTheme('light')}
      >
        <Sun className="mr-2 h-4 w-4" />
        {t('theme.light')}
      </Button>
      <Button
        variant={theme === 'dark' ? 'default' : 'outline'}
        size="sm"
        onClick={() => setTheme('dark')}
      >
        <Moon className="mr-2 h-4 w-4" />
        {t('theme.dark')}
      </Button>
    </div>
  );
}
