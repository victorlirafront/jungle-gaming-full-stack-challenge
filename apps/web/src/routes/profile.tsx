import { createFileRoute } from '@tanstack/react-router';
import { Profile } from '@/pages/Profile';
import { requireAuth } from '@/utils/route-guards';

export const Route = createFileRoute('/profile')({
  beforeLoad: requireAuth,
  component: Profile,
});

