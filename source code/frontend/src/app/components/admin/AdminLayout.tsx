import { useState } from 'react';
import { Outlet, useLocation, Link } from 'react-router';
import { AdminSidebar } from './AdminSidebar';
import { AdminTopBar } from './AdminTopBar';
import { X, ChevronRight } from 'lucide-react';
import { Button } from '../ui/button';

const PATH_LABELS: Record<string, string> = {
  '': 'Dashboard',
  'users': 'Users',
  'food-data': 'Food Data',
  'alternatives': 'Healthy Alternatives',
  'daily-tips': 'Daily Tips',
  'subscriptions': 'Subscriptions',
  'activity': 'Activity Monitoring',
  'uploads': 'Uploads',
};

function AdminBreadcrumbs() {
  const location = useLocation();
  const segments = location.pathname.replace(/^\/admin\/?/, '').split('/').filter(Boolean);

  if (segments.length === 0) return null;

  return (
    <nav className="flex items-center gap-1 px-6 py-2 text-sm text-muted-foreground border-b border-border">
      <Link to="/admin" className="hover:text-foreground transition-colors">Admin</Link>
      {segments.map((seg, i) => {
        const path = '/admin/' + segments.slice(0, i + 1).join('/');
        const label = PATH_LABELS[seg] ?? seg;
        const isLast = i === segments.length - 1;
        return (
          <span key={path} className="flex items-center gap-1">
            <ChevronRight className="h-3 w-3" />
            {isLast ? (
              <span className="text-foreground font-medium">{label}</span>
            ) : (
              <Link to={path} className="hover:text-foreground transition-colors">{label}</Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}

export function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 h-screen z-50 lg:z-auto
          transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <X className="h-5 w-5" />
        </Button>

        <AdminSidebar onNavigate={() => setSidebarOpen(false)} />
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <AdminTopBar onMenuClick={() => setSidebarOpen(true)} />

        {/* Breadcrumbs */}
        <AdminBreadcrumbs />

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
