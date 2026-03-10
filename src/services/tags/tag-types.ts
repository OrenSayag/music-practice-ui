export type TagColor = 'green' | 'amber' | 'cyan' | 'red';

export interface UserTag {
  id: string;
  name: string;
  color: TagColor;
  createdAt: string;
}

export interface CreateTagInput {
  name: string;
  color: TagColor;
}

export interface UpdateTagInput {
  name?: string;
  color?: TagColor;
}
