import { useTranslation } from 'react-i18next';
import { useAuthUser } from '@/layouts/authenticated-layout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function DashboardPage() {
  const { t } = useTranslation();
  const { user } = useAuthUser();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">
          {t('dashboard.welcomeName', { name: user.firstName })}
        </h1>
        <p className="text-muted-foreground">{t('dashboard.subtitle')}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('dashboard.welcome')}</CardTitle>
          <CardDescription>{t('dashboard.subtitle')}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Start building your music practice app from here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
