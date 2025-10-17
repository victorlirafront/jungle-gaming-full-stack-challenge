import { RouterProvider, createRouter } from '@tanstack/react-router';
import { routeTree } from './routeTree.gen';
import { useHttpClientSetup } from './hooks/useHttpClientSetup';

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

function AppContent() {
  useHttpClientSetup();
  return <RouterProvider router={router} />;
}

export function App() {
  return <AppContent />;
}

