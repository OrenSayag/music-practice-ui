import { useTranslation } from 'react-i18next';
import { useAuthUser } from '@/layouts/authenticated-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2 } from 'lucide-react';
import { useUpdatePreferences } from '@/services/user/user-queries';
import { SUPPORTED_LANGUAGES, isSupportedLanguage, type LanguageCode } from '@/i18n/languages';
import { teacherSchema, type TeacherPatch } from '@/services/user/teacher-schema';

export function TeacherCard() {
  const { t, i18n } = useTranslation();
  const { user, setUser } = useAuthUser();
  const updatePreferences = useUpdatePreferences();

  const teacher: TeacherPatch = user.teacher ?? {};
  const currentLanguage: LanguageCode = teacher.language && isSupportedLanguage(teacher.language)
    ? teacher.language
    : (isSupportedLanguage(i18n.language) ? i18n.language : 'en');

  const persistField = (field: keyof TeacherPatch, value: string) => {
    const trimmed = value.trim();
    if (trimmed === (teacher[field] ?? '')) return;
    const fieldCheck = teacherSchema.shape[field].safeParse(trimmed);
    if (!fieldCheck.success && trimmed !== '') return;
    const nextTeacher = { ...teacher, [field]: trimmed || undefined };
    setUser({ ...user, teacher: nextTeacher });
    updatePreferences.mutate({ teacher: { [field]: trimmed } });
  };

  const setLanguage = (code: LanguageCode) => {
    const nextTeacher = { ...teacher, language: code };
    setUser({ ...user, teacher: nextTeacher });
    updatePreferences.mutate({ teacher: { language: code } });
  };

  const removeTeacher = () => {
    setUser({ ...user, teacher: null });
    updatePreferences.mutate({ teacher: null });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('settings.teacher')}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <p className="text-base text-muted-foreground">{t('settings.teacherDescription')}</p>

        <div className="flex flex-col gap-1.5">
          <label className="text-base text-muted-foreground">{t('settings.teacherName')}</label>
          <Input
            defaultValue={teacher.name ?? ''}
            onBlur={(e) => persistField('name', e.target.value)}
            placeholder={t('settings.teacherName')}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-base text-muted-foreground">{t('settings.teacherPhone')}</label>
          <Input
            type="tel"
            defaultValue={teacher.phone ?? ''}
            onBlur={(e) => persistField('phone', e.target.value)}
            placeholder={t('settings.teacherPhonePlaceholder')}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-base text-muted-foreground">{t('settings.teacherLanguage')}</label>
          <div className="flex gap-2">
            {SUPPORTED_LANGUAGES.map((lang) => (
              <Button
                key={lang.code}
                variant={currentLanguage === lang.code ? 'default' : 'outline'}
                onClick={() => setLanguage(lang.code)}
              >
                {t(lang.labelKey)}
              </Button>
            ))}
          </div>
        </div>

        {user.teacher && (
          <Button
            variant="ghost"
            size="sm"
            className="self-start text-destructive hover:text-destructive"
            onClick={removeTeacher}
          >
            <Trash2 className="h-3 w-3" />
            {t('settings.removeTeacher')}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
