import { useQuery } from '@tanstack/react-query';
import { authService } from '@/services';
import { useAuthStore } from '@/store/auth.store';

export const USERS_QUERY_KEY = 'users';

export function useUsers() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: [USERS_QUERY_KEY],
    queryFn: () => authService.getAllUsers(),
    staleTime: 5 * 60 * 1000,
    enabled: isAuthenticated,
  });
}

export function useUsersByIds(userIds: string[]) {
  const { data: allUsers = [] } = useUsers();

  return allUsers.filter(user => userIds.includes(user.id));
}

