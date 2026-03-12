import { useState } from 'react';
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
import { useUpdatePreferences } from '@/services/user/user-queries';
import { playPreviewClick } from '@/hooks/use-metronome';
import type { MetronomeSound } from '@/services/auth/auth-types';
import { AudioInputDialog } from '@/components/settings/audio-input-dialog';

const METRONOME_SOUNDS: MetronomeSound[] = ['wood', 'glass', 'electromagnetic', 'arcane'];

export default function SettingsPage() {
  const { handlers, audioDialogOpen, setAudioDialogOpen } = useSettingsPage();
  const { t, i18n } = useTranslation();
  const { user } = useAuthUser();

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

const VOLUME_KEY = 'metronome-volume';

function useSettingsPage() {
  const { user, setUser } = useAuthUser();
  const updatePreferences = useUpdatePreferences();
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

  return {
    handlers: { setWeekStartDay, setMetronomeSound, volume, setVolume },
    audioDialogOpen,
    setAudioDialogOpen,
  };
}
