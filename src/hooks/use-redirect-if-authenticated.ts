import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { apiClient } from '@/services/api/api-client';
import type { MeResponse } from '@/services/auth/auth-types';

export function useRedirectIfAuthenticated() {
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    apiClient
      .get<MeResponse>('/user/me', { skipAuthRedirect: true })
      .then((res) => {
        if (res.user) navigate('/home', { replace: true });
        else setIsChecking(false);
      })
      .catch(() => {
        setIsChecking(false);
      });
  }, [navigate]);

  return { isChecking };
}
