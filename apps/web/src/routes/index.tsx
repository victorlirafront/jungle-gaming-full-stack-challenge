import { createFileRoute } from '@tanstack/react-router';
import { TaskList } from '@/pages/TaskList';
import { requireAuth } from '@/utils/route-guards';

export const Route = createFileRoute('/')({
  beforeLoad: requireAuth,
  component: TaskList,
});

