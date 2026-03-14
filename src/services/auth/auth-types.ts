export type MetronomeSound = 'wood' | 'glass' | 'electromagnetic' | 'arcane';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  image: string | null;
  isGuest: boolean;
  weekStartDay: number;
  metronomeSound: MetronomeSound;
}

export interface GuestLoginResponse {
  user: {
    id: string;
    isGuest: boolean;
  };
}

export interface MeResponse {
  user: User;
}

