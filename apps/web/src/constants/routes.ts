export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  PROFILE: '/profile',
  TASK_DETAIL: (id: string) => `/tasks/${id}`,
} as const;

