export function Header() {
  return (
    <header className="border-b bg-white">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold">Task Management</h1>
        </div>

        <nav className="flex items-center gap-4">
          <a href="/" className="text-sm hover:text-primary">
            Tasks
          </a>
          <a href="/profile" className="text-sm hover:text-primary">
            Profile
          </a>
          <button className="text-sm text-destructive hover:text-destructive/90">
            Logout
          </button>
        </nav>
      </div>
    </header>
  );
}

