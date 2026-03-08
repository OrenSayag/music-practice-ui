const GUEST_ID_KEY = 'music-practice-guest-id';

export function getOrCreateGuestId(): string {
  const existing = localStorage.getItem(GUEST_ID_KEY);
  if (existing) return existing;
  const id = crypto.randomUUID();
  localStorage.setItem(GUEST_ID_KEY, id);
  return id;
}

export function getGuestId(): string | null {
  return localStorage.getItem(GUEST_ID_KEY);
}
