export interface PlanItem {
  id: string;
  sectionId: string;
  name: string;
  targetDurationMinutes: number | null;
  bpm: number | null;
  status: 'pending' | 'completed';
  sortOrder: number;
  createdAt: string;
}

export interface PlanSection {
  id: string;
  planId: string;
  name: string;
  sortOrder: number;
  createdAt: string;
  items: PlanItem[];
}

export interface Plan {
  id: string;
  userId: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  sections: PlanSection[];
}

export interface CreateSectionInput {
  name: string;
}

export interface CreateItemInput {
  name: string;
  targetDurationMinutes?: number | null;
  bpm?: number | null;
}

export interface UpdateItemInput {
  name?: string;
  targetDurationMinutes?: number | null;
  bpm?: number | null;
  status?: 'pending' | 'completed';
  sortOrder?: number;
}

export interface UpdateSectionInput {
  name?: string;
  sortOrder?: number;
}

export interface ReorderItemInput {
  id: string;
  sortOrder: number;
  sectionId?: string;
}

export interface ReorderSectionInput {
  id: string;
  sortOrder: number;
  items?: ReorderItemInput[];
}

export interface ReorderInput {
  sections: ReorderSectionInput[];
}
