import { Link, useLocation } from 'react-router';
import {
  LayoutDashboard,
  Users,
  UtensilsCrossed,
  Lightbulb,
  CreditCard,
  Activity,
  Upload,
  LogOut,
  Shield,
  Leaf
} from 'lucide-react';
import { cn } from '../ui/utils';

interface NavItem {
  label: string;
  icon: React.ReactNode;
  path: string;
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    icon: <LayoutDashboard className="h-5 w-5" />,
    path: '/admin',
  },
  {
    label: 'Users',
    icon: <Users className="h-5 w-5" />,
    path: '/admin/users',
  },
  {
    label: 'Food Data',
    icon: <UtensilsCrossed className="h-5 w-5" />,
    path: '/admin/food-data',
  },
  {
    label: 'Healthy Alternatives',
    icon: <Shield className="h-5 w-5" />,
    path: '/admin/alternatives',
  },
  {
    label: 'Daily Tips',
    icon: <Lightbulb className="h-5 w-5" />,
    path: '/admin/daily-tips',
  },
  {
    label: 'Subscriptions',
    icon: <CreditCard className="h-5 w-5" />,
    path: '/admin/subscriptions',
  },
  {
    label: 'Activity Monitoring',
    icon: <Activity className="h-5 w-5" />,
    path: '/admin/activity',
  },
  {
    label: 'Upload Review',
    icon: <Upload className="h-5 w-5" />,
    path: '/admin/uploads',
  },
];

interface AdminSidebarProps {
  onNavigate?: () => void;
}

export function AdminSidebar({ onNavigate }: AdminSidebarProps) {
  const location = useLocation();

  return (
    <div className="h-full w-64 bg-card border-r border-border flex flex-col">
      {/* Logo / Brand */}
      <div className="px-6 py-6 border-b border-border">
        <Link to="/admin" className="flex items-center gap-2" onClick={onNavigate}>
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Leaf className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <span className="text-xl font-semibold text-foreground">Mazaj+</span>
            <span className="block text-xs text-muted-foreground">Admin Portal</span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;

            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  onClick={onNavigate}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors relative',
                    'hover:bg-muted',
                    isActive && 'bg-primary/10 text-primary hover:bg-primary/15',
                    !isActive && 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {item.icon}
                  <span className="text-sm">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-border">
        <Link
          to="/login"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <LogOut className="h-5 w-5" />
          <span className="text-sm">Logout</span>
        </Link>
      </div>
    </div>
  );
}
