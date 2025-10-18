export function Footer() {
  return (
    <footer className="border-t bg-muted/50">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Task Management System</p>
          <div className="flex gap-4">
            <a href="/about" className="hover:text-foreground">
              Created by @VictorLira
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

