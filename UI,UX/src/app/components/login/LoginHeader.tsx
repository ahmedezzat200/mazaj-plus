import { Link } from 'react-router';

export function LoginHeader() {
  return (
    <header className="border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-semibold">M+</span>
          </div>
          <span className="text-xl font-semibold text-foreground">Mazaj+</span>
        </Link>

        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground hidden sm:inline">New to Mazaj+?</span>
          <Link to="/register" className="px-5 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
            Create account
          </Link>
        </div>
      </div>
    </header>
  );
}