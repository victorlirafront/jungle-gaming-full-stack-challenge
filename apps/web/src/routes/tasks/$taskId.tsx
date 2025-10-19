import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { TaskDetail } from '@/pages/TaskDetail';
import { requireAuth } from '@/utils/route-guards';

export const Route = createFileRoute('/tasks/$taskId')({
  beforeLoad: requireAuth,
  component: TaskDetailPage,
});

function TaskDetailPage() {
  const { taskId } = Route.useParams();
  const navigate = useNavigate();

  return <TaskDetail taskId={taskId} onBack={() => navigate({ to: '/' })} />;
}

