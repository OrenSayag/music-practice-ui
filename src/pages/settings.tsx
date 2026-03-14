import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthUser } from '@/layouts/authenticated-layout';
import { ThemeToggle } from '@/components/theme-toggle';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  useUpdatePreferences,
  useUpdateProfile,
  useUploadAvatar,
  useDeleteAvatar,
} from '@/services/user/user-queries';
import { playPreviewClick } from '@/hooks/use-metronome';
import type { MetronomeSound } from '@/services/auth/auth-types';
import { AudioInputDialog } from '@/components/settings/audio-input-dialog';
import { Camera, Trash2 } from 'lucide-react';

const METRONOME_SOUNDS: MetronomeSound[] = ['wood', 'glass', 'electromagnetic', 'arcane'];

export default function SettingsPage() {
  const { handlers, audioDialogOpen, setAudioDialogOpen } = useSettingsPage();
  const { t, i18n } = useTranslation();
  const { user } = useAuthUser();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">{t('settings.title')}</h1>

      {!user.isGuest && (
        <ProfileCard
          handlers={handlers}
        />
      )}

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

      <Card>
        <CardHeader>
          <CardTitle>{t('settings.weekStartDay')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button
              variant={user.weekStartDay === 0 ? 'default' : 'outline'}
              onClick={() => handlers.setWeekStartDay(0)}
            >
              {t('settings.sunday')}
            </Button>
            <Button
              variant={user.weekStartDay === 1 ? 'default' : 'outline'}
              onClick={() => handlers.setWeekStartDay(1)}
            >
              {t('settings.monday')}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('settings.metronomeSound')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {METRONOME_SOUNDS.map((sound) => (
              <Button
                key={sound}
                variant={user.metronomeSound === sound ? 'default' : 'outline'}
                onClick={() => handlers.setMetronomeSound(sound)}
              >
                {t(`settings.sound.${sound}`)}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('settings.metronomeVolume')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min={0}
              max={100}
              value={Math.round(handlers.volume * 100)}
              onChange={(e) => handlers.setVolume(Number(e.target.value) / 100)}
              className="flex-1 accent-accent-green"
            />
            <span className="w-10 text-end font-mono text-sm text-muted-foreground">
              {Math.round(handlers.volume * 100)}%
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('settings.audioInput')}</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={() => setAudioDialogOpen(true)}>
            {t('settings.audioInputSettings')}
          </Button>
        </CardContent>
      </Card>
      <AudioInputDialog
        open={audioDialogOpen}
        onOpenChange={setAudioDialogOpen}
      />
    </div>
  );
}

function ProfileCard({
  handlers,
}: {
  handlers: ReturnType<typeof useSettingsPage>['handlers'];
}) {
  const { t } = useTranslation();
  const { user } = useAuthUser();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const initial = user.firstName?.[0] ?? user.email?.[0] ?? 'U';
  const avatarSrc = user.image
    ? `${user.image}?t=${Date.now()}`
    : undefined;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('settings.profile')}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <div className="group relative cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            <Avatar className="h-16 w-16">
              {avatarSrc ? <AvatarImage src={avatarSrc} /> : null}
              <AvatarFallback className="text-lg">{initial}</AvatarFallback>
            </Avatar>
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
              <Camera className="h-5 w-5 text-white" />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              {t('settings.changeAvatar')}
            </Button>
            {user.image && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handlers.handleAvatarRemove}
              >
                <Trash2 className="h-3 w-3" />
                {t('settings.removeAvatar')}
              </Button>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handlers.handleAvatarChange(file);
              e.target.value = '';
            }}
          />
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-muted-foreground">{t('settings.firstName')}</label>
            <Input
              defaultValue={user.firstName || ''}
              onBlur={(e) => handlers.handleNameBlur('firstName', e.target.value)}
              placeholder={t('settings.firstName')}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-muted-foreground">{t('settings.lastName')}</label>
            <Input
              defaultValue={user.lastName || ''}
              onBlur={(e) => handlers.handleNameBlur('lastName', e.target.value)}
              placeholder={t('settings.lastName')}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-muted-foreground">{t('settings.email')}</label>
            <Input
              value={user.email || ''}
              readOnly
              className="text-muted-foreground"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

const VOLUME_KEY = 'metronome-volume';

function useSettingsPage() {
  const { user, setUser } = useAuthUser();
  const updatePreferences = useUpdatePreferences();
  const updateProfile = useUpdateProfile();
  const uploadAvatar = useUploadAvatar();
  const deleteAvatarMutation = useDeleteAvatar();
  const [audioDialogOpen, setAudioDialogOpen] = useState(false);
  const [volume, setVolumeState] = useState(() => {
    const stored = localStorage.getItem(VOLUME_KEY);
    return stored !== null ? Number(stored) : 0.8;
  });

  const setWeekStartDay = (day: number) => {
    setUser({ ...user, weekStartDay: day });
    updatePreferences.mutate({ weekStartDay: day });
  };

  const setMetronomeSound = (sound: MetronomeSound) => {
    setUser({ ...user, metronomeSound: sound });
    updatePreferences.mutate({ metronomeSound: sound });
    playPreviewClick(sound, volume);
  };

  const setVolume = (value: number) => {
    const clamped = Math.max(0, Math.min(1, value));
    setVolumeState(clamped);
    localStorage.setItem(VOLUME_KEY, String(clamped));
  };

  const handleNameBlur = (field: 'firstName' | 'lastName', value: string) => {
    const trimmed = value.trim();
    if (trimmed === (user[field] || '')) return;
    setUser({ ...user, [field]: trimmed || '' });
    updateProfile.mutate({ [field]: trimmed });
  };

  const handleAvatarChange = (file: File) => {
    uploadAvatar.mutate(file, {
      onSuccess: (data) => {
        setUser({ ...user, image: data.image });
      },
    });
  };

  const handleAvatarRemove = () => {
    deleteAvatarMutation.mutate(undefined, {
      onSuccess: () => {
        setUser({ ...user, image: null });
      },
    });
  };

  return {
    handlers: {
      setWeekStartDay,
      setMetronomeSound,
      volume,
      setVolume,
      handleNameBlur,
      handleAvatarChange,
      handleAvatarRemove,
    },
    audioDialogOpen,
    setAudioDialogOpen,
  };
}
