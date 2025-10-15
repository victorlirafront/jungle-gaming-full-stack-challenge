import { createFileRoute, redirect } from '@tanstack/react-router';
import { Login } from '@/pages/Login';

export const Route = createFileRoute('/login')({
  beforeLoad: () => {
    const isAuthenticated = localStorage.getItem('accessToken');
    if (isAuthenticated) {
      throw redirect({ to: '/' });
    }
  },
  component: Login,
});

