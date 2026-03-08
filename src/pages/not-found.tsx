import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { FileQuestion } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFoundPage() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
        <FileQuestion className="h-6 w-6 text-muted-foreground" />
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="text-lg font-semibold">{t('error.notFoundTitle')}</h3>
        <p className="text-sm text-muted-foreground">
          {t('error.notFoundMessage')}
        </p>
      </div>
      <Button variant="outline" asChild>
        <Link to="/">{t('error.goHome')}</Link>
      </Button>
    </div>
  );
}
