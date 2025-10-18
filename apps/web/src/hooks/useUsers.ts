import { useQuery } from '@tanstack/react-query';
import { authService } from '@/services';

export const USERS_QUERY_KEY = 'users';

export function useUsers() {
  return useQuery({
    queryKey: [USERS_QUERY_KEY],
    queryFn: () => authService.getAllUsers(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useUsersByIds(userIds: string[]) {
  const { data: allUsers = [] } = useUsers();

  return allUsers.filter(user => userIds.includes(user.id));
}

