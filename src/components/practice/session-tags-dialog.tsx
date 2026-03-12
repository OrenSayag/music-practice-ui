import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Pencil, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  useUserTags,
  useSessionTags,
  useCreateTag,
  useUpdateTag,
  useDeleteTag,
  useLinkSessionTag,
  useUnlinkSessionTag,
} from '@/services/tags';
import type { TagColor, UserTag } from '@/services/tags';

const TAG_COLORS: TagColor[] = ['green', 'amber', 'cyan', 'red'];

const colorMap: Record<TagColor, { text: string; border: string; bg: string }> = {
  green: { text: 'text-accent-green', border: 'border-accent-green/30', bg: 'bg-accent-green/10' },
  amber: { text: 'text-accent-amber', border: 'border-accent-amber/30', bg: 'bg-accent-amber/10' },
  cyan: { text: 'text-accent-cyan', border: 'border-accent-cyan/30', bg: 'bg-accent-cyan/10' },
  red: { text: 'text-accent-red', border: 'border-accent-red/30', bg: 'bg-accent-red/10' },
};

interface SessionTagsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sessionId: string;
}

export function SessionTagsDialog({
  open,
  onOpenChange,
  sessionId,
}: SessionTagsDialogProps) {
  const { t } = useTranslation();
  const { data: allTags = [] } = useUserTags();
  const { data: sessionTagsList = [] } = useSessionTags(sessionId);
  const createTag = useCreateTag();
  const updateTag = useUpdateTag();
  const deleteTag = useDeleteTag();
  const linkTag = useLinkSessionTag();
  const unlinkTag = useUnlinkSessionTag();

  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState<TagColor>('green');
  const [editingTag, setEditingTag] = useState<UserTag | null>(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState<TagColor>('green');

  const linkedIds = new Set(sessionTagsList.map((t) => t.id));

  const handleCreate = async () => {
    const trimmed = newTagName.trim();
    if (!trimmed) return;
    try {
      const tag = await createTag.mutateAsync({ name: trimmed, color: newTagColor });
      await linkTag.mutateAsync({ sessionId, tagId: tag.id });
      setNewTagName('');
      setNewTagColor('green');
    } catch {
      // Global onError handles toast
    }
  };

  const handleToggleLink = async (tag: UserTag) => {
    try {
      if (linkedIds.has(tag.id)) {
        await unlinkTag.mutateAsync({ sessionId, tagId: tag.id });
      } else {
        await linkTag.mutateAsync({ sessionId, tagId: tag.id });
      }
    } catch {
      // Global onError handles toast
    }
  };

  const handleStartEdit = (tag: UserTag) => {
    setEditingTag(tag);
    setEditName(tag.name);
    setEditColor(tag.color);
  };

  const handleSaveEdit = async () => {
    if (!editingTag) return;
    try {
      await updateTag.mutateAsync({
        tagId: editingTag.id,
        name: editName.trim() || editingTag.name,
        color: editColor,
      });
      setEditingTag(null);
    } catch {
      // Global onError handles toast
    }
  };

  const handleDelete = async (tagId: string) => {
    try {
      await deleteTag.mutateAsync(tagId);
    } catch {
      // Global onError handles toast
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-mono text-sm">
            // {t('session.tags')}
          </DialogTitle>
        </DialogHeader>

        {/* Existing tags */}
        <div className="flex flex-col gap-2">
          {allTags.map((tag) => {
            const isLinked = linkedIds.has(tag.id);
            const colors = colorMap[tag.color];

            if (editingTag?.id === tag.id) {
              return (
                <div key={tag.id} className="flex items-center gap-2">
                  <input
                    className="flex-1 border border-border bg-transparent px-2 py-1 font-mono text-xs focus:outline-none"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit()}
                    autoFocus
                  />
                  <div className="flex gap-1">
                    {TAG_COLORS.map((c) => (
                      <ColorDot
                        key={c}
                        color={c}
                        selected={editColor === c}
                        onClick={() => setEditColor(c)}
                      />
                    ))}
                  </div>
                  <button
                    className="font-mono text-xs text-accent-green"
                    onClick={handleSaveEdit}
                  >
                    {t('practice.save')}
                  </button>
                </div>
              );
            }

            return (
              <div key={tag.id} className="group flex items-center gap-2">
                <button
                  className={`border px-2 py-1 font-mono text-xs transition-colors ${
                    isLinked
                      ? `${colors.text} ${colors.border} ${colors.bg}`
                      : 'border-border text-muted-foreground'
                  }`}
                  onClick={() => handleToggleLink(tag)}
                >
                  [{tag.name}]
                </button>
                <button
                  className="opacity-0 transition-opacity group-hover:opacity-100"
                  onClick={() => handleStartEdit(tag)}
                >
                  <Pencil className="h-3 w-3 text-muted-foreground" />
                </button>
                <button
                  className="opacity-0 transition-opacity group-hover:opacity-100"
                  onClick={() => handleDelete(tag.id)}
                >
                  <Trash2 className="h-3 w-3 text-muted-foreground" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Create new tag */}
        <div className="flex items-center gap-2 border-t border-border pt-3">
          <input
            className="flex-1 border border-border bg-transparent px-2 py-1 font-mono text-xs placeholder:text-muted-foreground focus:outline-none"
            placeholder={t('session.newTagPlaceholder')}
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
          />
          <div className="flex gap-1">
            {TAG_COLORS.map((c) => (
              <ColorDot
                key={c}
                color={c}
                selected={newTagColor === c}
                onClick={() => setNewTagColor(c)}
              />
            ))}
          </div>
          <button
            className="font-mono text-xs text-accent-green transition-colors hover:text-accent-green/80"
            onClick={handleCreate}
          >
            + {t('session.addTag')}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ColorDot({
  color,
  selected,
  onClick,
}: {
  color: TagColor;
  selected: boolean;
  onClick: () => void;
}) {
  const bgColors: Record<TagColor, string> = {
    green: 'bg-accent-green',
    amber: 'bg-accent-amber',
    cyan: 'bg-accent-cyan',
    red: 'bg-accent-red',
  };

  return (
    <button
      className={`h-4 w-4 rounded-full ${bgColors[color]} ${
        selected ? 'ring-2 ring-foreground ring-offset-1 ring-offset-background' : ''
      }`}
      onClick={onClick}
    />
  );
}

// -- Inline tag chip for session summary --

export function SessionTagChip({ tag }: { tag: UserTag }) {
  const colors = colorMap[tag.color];
  return (
    <span
      className={`border px-2 py-0.5 font-mono text-xs ${colors.text} ${colors.border}`}
    >
      [{tag.name}]
    </span>
  );
}
