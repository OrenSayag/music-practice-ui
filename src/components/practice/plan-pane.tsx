import { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { SectionTitle } from '@/components/section-title';
import { Skeleton } from '@/components/ui/skeleton';
import { useIsMobile } from '@/hooks/use-mobile';
import { Music, Trash2, Square, CheckSquare, GripVertical, Play, Pause } from 'lucide-react';
import { usePracticeSessionContext } from './practice-session-provider';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  useActivePlan,
  useCreatePlan,
  useCreateSection,
  useUpdateSection,
  useDeleteSection,
  useCreateItem,
  useUpdateItem,
  useDeleteItem,
  useReorderPlan,
} from '@/services/plans';
import type { Plan, PlanSection, PlanItem, ReorderInput } from '@/services/plans';

export default function PlanPane() {
  const { plan, isLoading, handlers } = usePlanPane();
  const { t } = useTranslation();

  if (isLoading) {
    return <PracticeSkeleton />;
  }

  if (!plan) {
    return <EmptyPlanState onCreatePlan={handlers.createPlan} />;
  }

  const completedCount = plan.sections.reduce(
    (sum, s) => sum + s.items.filter((i) => i.status === 'completed').length,
    0
  );
  const totalCount = plan.sections.reduce(
    (sum, s) => sum + s.items.length,
    0
  );

  return (
    <div className="flex flex-1 flex-col gap-6">
      <PlanHeader completedCount={completedCount} totalCount={totalCount} />
      <SortableSectionList plan={plan} handlers={handlers} />
      <AddButton
        label={t('practice.addSection')}
        onClick={() => handlers.addSection(plan.id)}
      />
    </div>
  );
}

function PlanHeader({
  completedCount,
  totalCount,
}: {
  completedCount: number;
  totalCount: number;
}) {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-between">
      <SectionTitle>{t('practice.todaysPlan')}</SectionTitle>
      {totalCount > 0 ? (
        <span className="font-mono text-xs text-muted-foreground">
          [{t('practice.progress', { completed: completedCount, total: totalCount })}]
        </span>
      ) : null}
    </div>
  );
}

function SortableSectionList({
  plan,
  handlers,
}: {
  plan: Plan;
  handlers: PracticeHandlers;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const sectionIds = useMemo(
    () => plan.sections.map((s) => s.id),
    [plan.sections]
  );

  const allItems = useMemo(
    () => plan.sections.flatMap((s) => s.items),
    [plan.sections]
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeSectionIdx = plan.sections.findIndex((s) => s.id === activeId);
    const overSectionIdx = plan.sections.findIndex((s) => s.id === overId);

    if (activeSectionIdx !== -1 && overSectionIdx !== -1) {
      const newSections = [...plan.sections];
      const [moved] = newSections.splice(activeSectionIdx, 1);
      newSections.splice(overSectionIdx, 0, moved);

      const reorderInput: ReorderInput = {
        sections: newSections.map((s, i) => ({
          id: s.id,
          sortOrder: i,
        })),
      };

      handlers.reorderPlan(plan.id, reorderInput);
      return;
    }

    for (const section of plan.sections) {
      const activeItemIdx = section.items.findIndex((i) => i.id === activeId);
      const overItemIdx = section.items.findIndex((i) => i.id === overId);

      if (activeItemIdx !== -1 && overItemIdx !== -1) {
        const newItems = [...section.items];
        const [moved] = newItems.splice(activeItemIdx, 1);
        newItems.splice(overItemIdx, 0, moved);

        const reorderInput: ReorderInput = {
          sections: plan.sections.map((s) => ({
            id: s.id,
            sortOrder: s.sortOrder,
            items:
              s.id === section.id
                ? newItems.map((item, i) => ({
                    id: item.id,
                    sortOrder: i,
                    sectionId: section.id,
                  }))
                : undefined,
          })),
        };

        handlers.reorderPlan(plan.id, reorderInput);
        return;
      }
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={sectionIds} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-5">
          {plan.sections.map((section) => (
            <SortableSectionComponent
              key={section.id}
              section={section}
              handlers={handlers}
              allItems={allItems}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

function SortableSectionComponent({
  section,
  handlers,
  allItems,
}: {
  section: PlanSection;
  handlers: PracticeHandlers;
  allItems: PlanItem[];
}) {
  const { t } = useTranslation();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const itemIds = useMemo(
    () => section.items.map((i) => i.id),
    [section.items]
  );

  return (
    <div ref={setNodeRef} style={style} className="flex flex-col gap-2">
      <SectionHeader
        section={section}
        onUpdate={(name) => handlers.updateSection(section.id, { name })}
        onDelete={() => handlers.deleteSection(section.id)}
        dragAttributes={attributes}
        dragListeners={listeners}
      />
      <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col">
          {section.items.map((item, index) => (
            <SortableItemComponent
              key={item.id}
              item={item}
              index={index + 1}
              handlers={handlers}
              allItems={allItems}
            />
          ))}
        </div>
      </SortableContext>
      <AddButton
        label={t('practice.addItem')}
        onClick={() => handlers.addItem(section.id)}
      />
    </div>
  );
}

function SectionHeader({
  section,
  onUpdate,
  onDelete,
  dragAttributes,
  dragListeners,
}: {
  section: PlanSection;
  onUpdate: (name: string) => void;
  onDelete: () => void;
  dragAttributes?: Record<string, unknown>;
  dragListeners?: Record<string, unknown>;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(section.name);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    setIsEditing(false);
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== section.name) {
      onUpdate(trimmed);
    } else {
      setEditValue(section.name);
    }
  };

  const handleStartEdit = () => {
    setEditValue(section.name);
    setIsEditing(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  return (
    <div className="group flex items-center gap-2">
      <button
        className="shrink-0 cursor-grab opacity-0 transition-opacity group-hover:opacity-100"
        {...dragAttributes}
        {...dragListeners}
      >
        <GripVertical className="h-3.5 w-3.5 text-muted-foreground" />
      </button>
      <span className="font-mono text-sm text-accent-green">&gt;</span>
      {isEditing ? (
        <input
          ref={inputRef}
          className="flex-1 border-b border-accent-green bg-transparent font-mono text-sm text-accent-green outline-none"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSave();
            if (e.key === 'Escape') {
              setEditValue(section.name);
              setIsEditing(false);
            }
          }}
        />
      ) : (
        <span
          className="flex-1 cursor-pointer font-mono text-sm text-accent-green underline"
          onDoubleClick={handleStartEdit}
        >
          {section.name}
        </span>
      )}
      <button
        className="opacity-0 transition-opacity group-hover:opacity-100"
        onClick={onDelete}
      >
        <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
      </button>
    </div>
  );
}

function SortableItemComponent({
  item,
  index,
  handlers,
  allItems,
}: {
  item: PlanItem;
  index: number;
  handlers: PracticeHandlers;
  allItems: PlanItem[];
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <PlanItemComponent
        item={item}
        index={index}
        handlers={handlers}
        allItems={allItems}
        dragAttributes={attributes}
        dragListeners={listeners}
      />
    </div>
  );
}

function PlanItemComponent({
  item,
  index,
  handlers,
  allItems,
  dragAttributes,
  dragListeners,
}: {
  item: PlanItem;
  index: number;
  handlers: PracticeHandlers;
  allItems: PlanItem[];
  dragAttributes?: Record<string, unknown>;
  dragListeners?: Record<string, unknown>;
}) {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const { activeItem, isTimerRunning, selectedTimerId, startItem, toggleTimer } = usePracticeSessionContext();
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(item.name);
  const inputRef = useRef<HTMLInputElement>(null);
  const isCompleted = item.status === 'completed';
  const isActive = activeItem?.id === item.id;

  const handleToggle = () => {
    handlers.toggleItem(item.id, isCompleted ? 'pending' : 'completed');
  };

  const handleSave = () => {
    setIsEditing(false);
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== item.name) {
      handlers.updateItem(item.id, { name: trimmed });
    } else {
      setEditValue(item.name);
    }
  };

  const handleStartEdit = () => {
    setEditValue(item.name);
    setIsEditing(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const durationLabel = item.targetDurationMinutes
    ? isMobile
      ? t('practice.durationShort', { min: item.targetDurationMinutes })
      : t('practice.duration', { min: item.targetDurationMinutes })
    : null;

  return (
    <div className={`group flex items-center gap-3 py-1.5 ${isActive ? 'text-accent-green' : ''}`}>
      <button
        className="shrink-0 cursor-grab opacity-0 transition-opacity group-hover:opacity-100"
        {...dragAttributes}
        {...dragListeners}
      >
        <GripVertical className="h-3 w-3 text-muted-foreground" />
      </button>

      <button
        className="shrink-0"
        onClick={() => {
          if (isActive && selectedTimerId === null) {
            toggleTimer();
          } else {
            startItem(item, allItems, undefined, { announce: true });
          }
        }}
      >
        {isActive && isTimerRunning && selectedTimerId === null ? (
          <Pause className="h-3.5 w-3.5 text-accent-green" />
        ) : (
          <Play className={`h-3.5 w-3.5 ${isActive ? 'text-accent-green' : 'text-muted-foreground hover:text-foreground'}`} />
        )}
      </button>

      <button onClick={handleToggle} className="shrink-0">
        {isCompleted ? (
          <CheckSquare className="h-4 w-4 text-accent-green" />
        ) : (
          <Square className="h-4 w-4 text-muted-foreground" />
        )}
      </button>

      <span
        className={`font-mono text-xs text-muted-foreground ${isCompleted ? 'line-through opacity-50' : ''}`}
      >
        {index}
      </span>

      <span className="font-mono text-xs text-muted-foreground">&mdash;</span>

      {isEditing ? (
        <input
          ref={inputRef}
          className="flex-1 border-b border-border bg-transparent font-mono text-sm outline-none"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSave();
            if (e.key === 'Escape') {
              setEditValue(item.name);
              setIsEditing(false);
            }
          }}
        />
      ) : (
        <span
          className={`flex-1 cursor-pointer font-mono text-sm ${isCompleted ? 'line-through opacity-50' : ''}`}
          onDoubleClick={handleStartEdit}
        >
          {item.name}
        </span>
      )}

      {durationLabel ? (
        <span
          className={`shrink-0 font-mono text-xs text-muted-foreground ${isCompleted ? 'line-through opacity-50' : ''}`}
        >
          {durationLabel}
        </span>
      ) : null}

      <button
        className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
        onClick={() => handlers.deleteItem(item.id)}
      >
        <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
      </button>
    </div>
  );
}

function AddButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      className="self-start font-mono text-xs text-muted-foreground transition-colors hover:text-foreground"
      onClick={onClick}
    >
      {label}
    </button>
  );
}

function EmptyPlanState({ onCreatePlan }: { onCreatePlan: () => void }) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4">
      <Music className="h-12 w-12 text-muted-foreground/50" />
      <span className="font-mono text-sm text-muted-foreground">
        {t('practice.emptyPlan')}
      </span>
      <button
        className="rounded-sm border border-accent-green px-4 py-2 font-mono text-sm text-accent-green transition-colors hover:bg-accent-green/10"
        onClick={onCreatePlan}
      >
        {t('practice.createPlan')}
      </button>
    </div>
  );
}

function PracticeSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton className="h-6 w-48" />
      <div className="flex flex-col gap-4">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-8" />
        <Skeleton className="h-8" />
      </div>
      <div className="flex flex-col gap-4">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-8" />
      </div>
    </div>
  );
}

// -- Types --

interface PracticeHandlers {
  createPlan: () => void;
  addSection: (planId: string) => void;
  updateSection: (sectionId: string, input: { name: string }) => void;
  deleteSection: (sectionId: string) => void;
  addItem: (sectionId: string) => void;
  updateItem: (itemId: string, input: { name?: string }) => void;
  toggleItem: (itemId: string, status: 'pending' | 'completed') => void;
  deleteItem: (itemId: string) => void;
  reorderPlan: (planId: string, input: ReorderInput) => void;
}

// -- Hook --

function usePlanPane() {
  const { t } = useTranslation();
  const { setOnItemComplete, setSections } = usePracticeSessionContext();
  const { data: plan, isLoading, error } = useActivePlan();
  const createPlanMutation = useCreatePlan();
  const createSectionMutation = useCreateSection();
  const updateSectionMutation = useUpdateSection();
  const deleteSectionMutation = useDeleteSection();
  const createItemMutation = useCreateItem();
  const updateItemMutation = useUpdateItem();
  const deleteItemMutation = useDeleteItem();
  const reorderPlanMutation = useReorderPlan();

  // Register callback so the timer can mark items complete
  const completeItem = useCallback(
    (itemId: string) => {
      updateItemMutation.mutate({ itemId, status: 'completed' as const });
    },
    [updateItemMutation]
  );

  useEffect(() => {
    setOnItemComplete(completeItem);
    return () => setOnItemComplete(null);
  }, [setOnItemComplete, completeItem]);

  // Keep sections ref in sync for timer announcements
  useEffect(() => {
    if (plan) setSections(plan.sections);
  }, [plan, setSections]);

  const handlers: PracticeHandlers = {
    createPlan: () => {
      createPlanMutation.mutate({});
    },

    addSection: (planId: string) => {
      createSectionMutation.mutate({
        planId,
        name: t('practice.newSection'),
      });
    },

    updateSection: (sectionId: string, input: { name: string }) => {
      updateSectionMutation.mutate({ sectionId, ...input });
    },

    deleteSection: (sectionId: string) => {
      deleteSectionMutation.mutate(sectionId);
    },

    addItem: (sectionId: string) => {
      createItemMutation.mutate({
        sectionId,
        name: t('practice.newItem'),
      });
    },

    updateItem: (itemId: string, input: { name?: string }) => {
      updateItemMutation.mutate({ itemId, ...input });
    },

    toggleItem: (itemId: string, status: 'pending' | 'completed') => {
      updateItemMutation.mutate({ itemId, status });
    },

    deleteItem: (itemId: string) => {
      deleteItemMutation.mutate(itemId);
    },

    reorderPlan: (planId: string, input: ReorderInput) => {
      reorderPlanMutation.mutate({ planId, ...input });
    },
  };

  const hasNoPlan =
    error && 'status' in error && (error as { status: number }).status === 404;

  return {
    plan: hasNoPlan ? null : plan ?? null,
    isLoading: isLoading && !hasNoPlan,
    handlers,
  };
}
