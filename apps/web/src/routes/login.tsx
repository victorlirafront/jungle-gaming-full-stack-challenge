import { createFileRoute } from '@tanstack/react-router';
import { Login } from '@/pages/Login';
import { redirectIfAuthenticated } from '@/utils/route-guards';

export const Route = createFileRoute('/login')({
  beforeLoad: redirectIfAuthenticated,
  component: Login,
});

