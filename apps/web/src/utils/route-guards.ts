import { redirect } from '@tanstack/react-router';

export function requireAuth() {
  const accessToken = localStorage.getItem('accessToken');

  if (!accessToken) {
    localStorage.removeItem('auth-storage');
    throw redirect({ to: '/login' });
  }
}

export function redirectIfAuthenticated() {
  const accessToken = localStorage.getItem('accessToken');
  if (accessToken) {
    throw redirect({ to: '/' });
  }
}

