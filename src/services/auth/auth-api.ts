import { apiClient } from '@/services/api/api-client';
import type { MeResponse, GuestLoginResponse } from './auth-types';

export function getMe(): Promise<MeResponse> {
  return apiClient.get<MeResponse>('/user/me');
}

export function guestLogin(guestId: string): Promise<GuestLoginResponse> {
  return apiClient.post<GuestLoginResponse>('/guest/login', { guestId }, { skipAuthRedirect: true });
}

export async function logout(): Promise<void> {
  const res = await fetch('/api/auth/csrf', { credentials: 'include' });
  const { csrfToken } = await res.json();
  await fetch('/api/auth/signout', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ csrfToken }),
  });
}
