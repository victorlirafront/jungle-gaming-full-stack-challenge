import { createFileRoute, redirect } from '@tanstack/react-router';
import { Register } from '@/pages/Register';

export const Route = createFileRoute('/register')({
  beforeLoad: () => {
    const isAuthenticated = localStorage.getItem('accessToken');
    if (isAuthenticated) {
      throw redirect({ to: '/' });
    }
  },
  component: Register,
});

