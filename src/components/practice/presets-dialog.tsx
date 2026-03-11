import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { usePresets, useSavePreset, useDeletePreset, useLoadPreset } from '@/services/presets';
import type { Preset } from '@/services/presets';

interface PresetsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activePlanId: string | undefined;
}

export function PresetsDialog({ open, onOpenChange, activePlanId }: PresetsDialogProps) {
  const { presetsList, save, remove, load } = usePresetsDialog(activePlanId, onOpenChange);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[80vh] flex-col gap-0 p-0">
        <DialogHeader className="border-b border-border px-4 py-3">
          <div className="flex items-center justify-between">
            <DialogTitle className="font-mono text-sm">
              {save.t('practice.presets')}
            </DialogTitle>
            {activePlanId && (
              <SavePresetControl
                isSaving={save.isSaving}
                onSave={save.handleSave}
                saveName={save.name}
                setSaveName={save.setName}
                showInput={save.showInput}
                setShowInput={save.setShowInput}
                t={save.t}
              />
            )}
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          {presetsList.length === 0 ? (
            <p className="p-4 font-mono text-xs text-muted-foreground">
              {save.t('practice.noPresets')}
            </p>
          ) : (
            <div className="flex flex-col">
              {presetsList.map((preset) => (
                <PresetRow
                  key={preset.id}
                  preset={preset}
                  onLoad={() => load.handleLoad(preset.id)}
                  onDelete={() => remove.handleDelete(preset.id)}
                  isLoading={load.loadingId === preset.id}
                />
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function SavePresetControl({
  isSaving,
  onSave,
  saveName,
  setSaveName,
  showInput,
  setShowInput,
  t,
}: {
  isSaving: boolean;
  onSave: () => void;
  saveName: string;
  setSaveName: (v: string) => void;
  showInput: boolean;
  setShowInput: (v: boolean) => void;
  t: (key: string) => string;
}) {
  if (!showInput) {
    return (
      <Button
        variant="outline"
        size="xs"
        className="font-mono"
        onClick={() => setShowInput(true)}
      >
        {t('practice.saveCurrent')}
      </Button>
    );
  }

  return (
    <form
      className="flex items-center gap-1.5"
      onSubmit={(e) => {
        e.preventDefault();
        onSave();
      }}
    >
      <Input
        className="h-6 w-32 font-mono text-xs"
        placeholder={t('practice.presetName')}
        value={saveName}
        onChange={(e) => setSaveName(e.target.value)}
        autoFocus
      />
      <Button
        variant="outline"
        size="xs"
        className="font-mono"
        type="submit"
        disabled={isSaving}
      >
        {isSaving ? <Loader2 className="h-3 w-3 animate-spin" /> : t('practice.save')}
      </Button>
    </form>
  );
}

function PresetRow({
  preset,
  onLoad,
  onDelete,
  isLoading,
}: {
  preset: Preset;
  onLoad: () => void;
  onDelete: () => void;
  isLoading: boolean;
}) {
  const itemCount = preset.sections.reduce((sum, s) => sum + s.items.length, 0);
  const totalMinutes = preset.sections.reduce(
    (sum, s) => sum + s.items.reduce((iSum, i) => iSum + (i.targetDurationMinutes ?? 0), 0),
    0
  );

  return (
    <button
      className="group flex items-center justify-between border-b border-border px-4 py-3 text-left transition-colors hover:bg-muted/50"
      onClick={onLoad}
      disabled={isLoading}
    >
      <div className="flex flex-col gap-0.5">
        <span className="font-mono text-xs text-foreground">{preset.name}</span>
        <span className="font-mono text-[0.5rem] text-muted-foreground">
          {preset.sections.length}s / {itemCount}i
          {totalMinutes > 0 && ` / ${totalMinutes}m`}
        </span>
      </div>
      <div className="flex items-center gap-2">
        {isLoading && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
        <button
          className="opacity-0 transition-opacity group-hover:opacity-100"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
        </button>
      </div>
    </button>
  );
}

function usePresetsDialog(activePlanId: string | undefined, onOpenChange: (open: boolean) => void) {
  const { t } = useTranslation();
  const { data: presetsList = [] } = usePresets();
  const saveMutation = useSavePreset();
  const deleteMutation = useDeletePreset();
  const loadMutation = useLoadPreset();

  const [saveName, setSaveName] = useState('');
  const [showSaveInput, setShowSaveInput] = useState(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleSave = () => {
    if (!activePlanId) return;
    saveMutation.mutate(
      { planId: activePlanId, name: saveName || undefined },
      {
        onSuccess: () => {
          toast.success(t('practice.presetSaved'));
          setSaveName('');
          setShowSaveInput(false);
        },
        onError: () => {
          toast.error('Failed to save preset');
        },
      }
    );
  };

  const handleDelete = (presetId: string) => {
    deleteMutation.mutate(presetId);
  };

  const handleLoad = (presetId: string) => {
    setLoadingId(presetId);
    loadMutation.mutate(presetId, {
      onSuccess: () => {
        onOpenChange(false);
        setLoadingId(null);
      },
      onError: () => {
        toast.error('Failed to load preset');
        setLoadingId(null);
      },
    });
  };

  return {
    presetsList,
    save: {
      t,
      isSaving: saveMutation.isPending,
      handleSave,
      name: saveName,
      setName: setSaveName,
      showInput: showSaveInput,
      setShowInput: setShowSaveInput,
    },
    remove: { handleDelete },
    load: { handleLoad, loadingId },
  };
}
