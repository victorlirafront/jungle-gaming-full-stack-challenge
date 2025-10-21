import { QueryClient } from '@tanstack/react-query';
import { APP_CONSTANTS } from '@/constants/app.constants';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: APP_CONSTANTS.CACHE.QUERY_STALE_TIME_MS,
      gcTime: APP_CONSTANTS.CACHE.QUERY_GC_TIME_MS,
      refetchOnWindowFocus: false,
      retry: APP_CONSTANTS.CACHE.QUERY_RETRY_COUNT,
    },
    mutations: {
      retry: false,
    },
  },
});

