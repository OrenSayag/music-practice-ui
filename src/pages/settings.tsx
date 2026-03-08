import { useTranslation } from 'react-i18next';
import { ThemeToggle } from '@/components/theme-toggle';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function SettingsPage() {
  const { t, i18n } = useTranslation();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">{t('settings.title')}</h1>

      <Card>
        <CardHeader>
          <CardTitle>{t('settings.theme')}</CardTitle>
        </CardHeader>
        <CardContent>
          <ThemeToggle />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('settings.language')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button
              variant={i18n.language === 'en' ? 'default' : 'outline'}
              onClick={() => i18n.changeLanguage('en')}
            >
              {t('settings.english')}
            </Button>
            <Button
              variant={i18n.language === 'he' ? 'default' : 'outline'}
              onClick={() => i18n.changeLanguage('he')}
            >
              {t('settings.hebrew')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
