import { apiClient } from '@/services/api/api-client';
import type { LoginResponse, MeResponse } from './auth-types';

export function login(email: string): Promise<LoginResponse> {
  return apiClient.post<LoginResponse>('/auth/login', { email }, { skipAuthRedirect: true });
}

export function getMe(): Promise<MeResponse> {
  return apiClient.get<MeResponse>('/user/me');
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
