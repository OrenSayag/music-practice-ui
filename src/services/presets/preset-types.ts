export interface PresetItem {
  id: string;
  sectionId: string;
  name: string;
  targetDurationMinutes: number | null;
  bpm: number | null;
  sortOrder: number;
}

export interface PresetSection {
  id: string;
  presetId: string;
  name: string;
  sortOrder: number;
  items: PresetItem[];
}

export interface Preset {
  id: string;
  userId: string;
  name: string;
  createdAt: string;
  sections: PresetSection[];
}

export interface SavePresetInput {
  planId: string;
  name?: string;
}
