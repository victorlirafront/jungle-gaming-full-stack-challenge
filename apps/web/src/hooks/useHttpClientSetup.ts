import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { httpClient } from '@/http';
import { useAuthStore } from '@/store/auth.store';

export function useHttpClientSetup() {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);

  useEffect(() => {
    httpClient.setOnTokenExpired(() => {
      logout();
      navigate({ to: '/login' });
    });
  }, [logout, navigate]);
}

