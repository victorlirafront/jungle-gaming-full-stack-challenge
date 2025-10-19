import { createFileRoute } from '@tanstack/react-router';
import { Register } from '@/pages/Register';
import { redirectIfAuthenticated } from '@/utils/route-guards';

export const Route = createFileRoute('/register')({
  beforeLoad: redirectIfAuthenticated,
  component: Register,
});

