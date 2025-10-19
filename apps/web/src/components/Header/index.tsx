import { Link, useNavigate } from '@tanstack/react-router';
import { useAuthStore } from '@/store/auth.store';
import { NotificationBell } from '../Notifications';

export function Header() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    logout();
    navigate({ to: '/login' });
  };

  return (
    <header className="border-b bg-white">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link to="/" className="text-xl font-bold">Task Management</Link>
        </div>

        <nav className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <Link to="/" className="text-sm hover:text-primary">
                Tasks
              </Link>
              <NotificationBell />
              <span className="text-sm text-muted-foreground">
                {user?.username}
              </span>
              <button
                onClick={handleLogout}
                className="text-sm text-destructive hover:text-destructive/90"
              >
                Sair
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm hover:text-primary">
                Login
              </Link>
              <Link to="/register" className="text-sm hover:text-primary">
                Cadastrar
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

