import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authService } from '@/services';
import { useAuthStore } from '@/store/auth.store';

export function useProfile() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const userId = useAuthStore((state) => state.user?.id);

  return useQuery({
    queryKey: ['profile', userId],
    queryFn: () => authService.getProfile(),
    enabled: isAuthenticated && !!userId,
    retry: 1,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const userId = useAuthStore((state) => state.user?.id);

  return useMutation({
    mutationFn: (data: { username?: string; fullName?: string }) =>
      authService.updateProfile(data),
    onSuccess: (data) => {
      queryClient.setQueryData(['profile', userId], data);
      queryClient.invalidateQueries({ queryKey: ['profile', userId] });
    },
  });
}

