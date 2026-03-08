import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Mail, CheckCircle, UserRound } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { login, guestLogin } from '@/services/auth/auth-api';
import { getOrCreateGuestId } from '@/services/auth/guest-id';
import { ApiError } from '@/services/api/api-client';

export default function LoginPage() {
  const { t } = useTranslation();
  const { email, isSubmitting, isGuestLoading, isSent, handlers } = useLoginForm();

  if (isSent) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-sm text-center">
          <CardHeader>
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <CheckCircle className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>{t('login.checkEmail')}</CardTitle>
            <CardDescription>
              {t('login.sentLinkTo')} <strong>{email}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {t('login.checkSpam')}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">{t('login.title')}</CardTitle>
          <CardDescription>
            {t('login.description')}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <form onSubmit={handlers.handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">{t('login.email')}</Label>
              <Input
                id="email"
                type="email"
                placeholder={t('login.emailPlaceholder')}
                value={email}
                onChange={handlers.handleEmailChange}
                required
                autoFocus
              />
            </div>
            <Button type="submit" disabled={isSubmitting || isGuestLoading} className="w-full">
              {isSubmitting ? (
                t('login.sending')
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  {t('login.sendLink')}
                </>
              )}
            </Button>
          </form>

          <div className="flex items-center gap-3">
            <Separator className="flex-1" />
            <span className="text-sm text-muted-foreground">{t('login.or')}</span>
            <Separator className="flex-1" />
          </div>

          <Button
            variant="outline"
            onClick={handlers.handleGuestLogin}
            disabled={isSubmitting || isGuestLoading}
            className="w-full"
          >
            <UserRound className="mr-2 h-4 w-4" />
            {t('login.continueAsGuest')}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function useLoginForm() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGuestLoading, setIsGuestLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await login(email);
      setIsSent(true);
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : t('login.failedToSend');
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGuestLogin = async () => {
    setIsGuestLoading(true);

    try {
      const guestId = getOrCreateGuestId();
      await guestLogin(guestId);
      navigate('/');
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : t('login.failedToSend');
      toast.error(message);
    } finally {
      setIsGuestLoading(false);
    }
  };

  return {
    email,
    isSubmitting,
    isGuestLoading,
    isSent,
    handlers: {
      handleSubmit,
      handleGuestLogin,
      handleEmailChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        setEmail(e.target.value),
    },
  };
}
