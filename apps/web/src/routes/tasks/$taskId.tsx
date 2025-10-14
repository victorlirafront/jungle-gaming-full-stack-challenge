import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { TaskDetail } from '@/pages/TaskDetail';

export const Route = createFileRoute('/tasks/$taskId')({
  component: TaskDetailPage,
});

function TaskDetailPage() {
  const { taskId } = Route.useParams();
  const navigate = useNavigate();

  return <TaskDetail taskId={taskId} onBack={() => navigate({ to: '/' })} />;
}

