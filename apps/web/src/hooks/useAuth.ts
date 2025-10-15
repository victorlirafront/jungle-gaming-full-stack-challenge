import { useMutation } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { authService } from '@/services';
import { useAuthStore } from '@/store/auth.store';
import type { RegisterRequest, LoginRequest } from '@/types/auth.types';

export const useLogin = () => {
  const navigate = useNavigate();
  const setTokens = useAuthStore((state) => state.setTokens);

  return useMutation({
    mutationFn: (data: LoginRequest) => authService.login(data),
    onSuccess: (response) => {
      authService.saveTokens(response.accessToken, response.refreshToken);
      setTokens(response);
      navigate({ to: '/' });
    },
  });
};

export const useRegister = () => {
  const navigate = useNavigate();
  const setTokens = useAuthStore((state) => state.setTokens);

  return useMutation({
    mutationFn: (data: RegisterRequest) => authService.register(data),
    onSuccess: (response) => {
      authService.saveTokens(response.accessToken, response.refreshToken);
      setTokens(response);
      navigate({ to: '/' });
    },
  });
};

export const useLogout = () => {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);

  return () => {
    authService.clearTokens();
    logout();
    navigate({ to: '/login' });
  };
};

