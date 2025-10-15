import { createFileRoute, redirect } from '@tanstack/react-router';
import { TaskList } from '@/pages/TaskList';

export const Route = createFileRoute('/')({
  beforeLoad: () => {
    const isAuthenticated = localStorage.getItem('accessToken');
    if (!isAuthenticated) {
      throw redirect({ to: '/login' });
    }
  },
  component: TaskList,
});

