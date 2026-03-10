import { useTranslation } from 'react-i18next';
import { Upload, Mic } from 'lucide-react';

export default function RecordingsPage() {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-0 flex-1 flex-col p-6 md:p-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-mono text-lg font-bold">
          {'>'} {t('recordings.title')}
        </h1>
        <button
          className="flex items-center gap-1.5 border border-border px-3 py-1.5 font-mono text-xs text-muted-foreground opacity-50"
          disabled
        >
          <Upload className="h-3.5 w-3.5" />
          {t('recordings.upload')}
        </button>
      </div>

      {/* Filter bar */}
      <div className="mb-8 flex items-center gap-2">
        <FilterTag label={t('recordings.all')} active />
        <FilterTag label="[scales]" />
        <FilterTag label="[repertoire]" />
        <FilterTag label="[technique]" />
        <input
          className="ml-auto border-none bg-transparent font-mono text-xs text-muted-foreground placeholder:text-muted-foreground/50 focus:outline-none"
          placeholder={t('recordings.search')}
          disabled
        />
      </div>

      {/* Empty state */}
      <div className="flex flex-1 flex-col items-center justify-center gap-3">
        <Mic className="h-10 w-10 text-muted-foreground/30" />
        <p className="font-mono text-sm text-muted-foreground">
          {t('recordings.noRecordings')}
        </p>
      </div>
    </div>
  );
}

function FilterTag({ label, active }: { label: string; active?: boolean }) {
  return (
    <button
      className={`px-2 py-1 font-mono text-xs transition-colors ${
        active
          ? 'bg-foreground text-background'
          : 'text-muted-foreground hover:text-foreground'
      }`}
      disabled={!active}
    >
      {label}
    </button>
  );
}
