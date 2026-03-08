import { AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface ErrorPageProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorPage({
  title,
  message,
  onRetry,
}: ErrorPageProps) {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertCircle className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle>{title ?? t('error.defaultTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{message ?? t('error.defaultMessage')}</p>
        </CardContent>
        {onRetry && (
          <CardFooter className="justify-center">
            <Button onClick={onRetry}>{t('error.tryAgain')}</Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
