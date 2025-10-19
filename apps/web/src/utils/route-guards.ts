import { redirect } from '@tanstack/react-router';

export function requireAuth() {
  const isAuthenticated = localStorage.getItem('accessToken');
  if (!isAuthenticated) {
    throw redirect({ to: '/login' });
  }
}

export function redirectIfAuthenticated() {
  const isAuthenticated = localStorage.getItem('accessToken');
  if (isAuthenticated) {
    throw redirect({ to: '/' });
  }
}

