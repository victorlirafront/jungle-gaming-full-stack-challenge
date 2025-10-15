import { createFileRoute, useNavigate, redirect } from '@tanstack/react-router';
import { TaskDetail } from '@/pages/TaskDetail';

export const Route = createFileRoute('/tasks/$taskId')({
  beforeLoad: () => {
    const isAuthenticated = localStorage.getItem('accessToken');
    if (!isAuthenticated) {
      throw redirect({ to: '/login' });
    }
  },
  component: TaskDetailPage,
});

function TaskDetailPage() {
  const { taskId } = Route.useParams();
  const navigate = useNavigate();

  return <TaskDetail taskId={taskId} onBack={() => navigate({ to: '/' })} />;
}

