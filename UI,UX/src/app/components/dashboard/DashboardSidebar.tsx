import { Link, useLocation } from 'react-router';
import { 
  LayoutDashboard, 
  MessageSquare, 
  UtensilsCrossed, 
  Droplet,
  Upload,
  BookOpen,
  FileText,
  User,
  CreditCard,
  LogOut,
  Lock,
  Leaf
} from 'lucide-react';
import { UserTier } from './DashboardLayout';
import { cn } from '../ui/utils';

interface NavItem {
  label: string;
  icon: React.ReactNode;
  path: string;
  locked?: {
    Free: boolean;
    Pro: boolean;
    Ultra: boolean;
  };
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    icon: <LayoutDashboard className="h-5 w-5" />,
    path: '/dashboard',
  },
  {
    label: 'Chat Guidance',
    icon: <MessageSquare className="h-5 w-5" />,
    path: '/dashboard/chat',
  },
  {
    label: 'Nutrition Plans',
    icon: <UtensilsCrossed className="h-5 w-5" />,
    path: '/dashboard/nutrition-plans',
  },
  {
    label: 'Healthy Alternatives & Hydration',
    icon: <Droplet className="h-5 w-5" />,
    path: '/dashboard/alternatives',
  },
  {
    label: 'Upload Features',
    icon: <Upload className="h-5 w-5" />,
    path: '/dashboard/upload',
    locked: { Free: true, Pro: false, Ultra: false },
  },
  {
    label: 'Tracking & Reports',
    icon: <BookOpen className="h-5 w-5" />,
    path: '/dashboard/tracking',
    locked: { Free: true, Pro: true, Ultra: false },
  },
  {
    label: 'Profile',
    icon: <User className="h-5 w-5" />,
    path: '/dashboard/profile',
  },
  {
    label: 'Subscription',
    icon: <CreditCard className="h-5 w-5" />,
    path: '/dashboard/subscription',
  },
];

interface DashboardSidebarProps {
  userTier: UserTier;
  onNavigate?: () => void;
}

export function DashboardSidebar({ userTier, onNavigate }: DashboardSidebarProps) {
  const location = useLocation();

  const isLocked = (item: NavItem) => {
    return item.locked ? item.locked[userTier] : false;
  };

  return (
    <div className="h-full w-64 bg-card border-r border-border flex flex-col">
      {/* Logo / Brand */}
      <div className="px-6 py-6 border-b border-border">
        <Link to="/dashboard" className="flex items-center gap-2" onClick={onNavigate}>
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Leaf className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-semibold text-foreground">Mazaj+</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const locked = isLocked(item);
            const isActive = location.pathname === item.path;

            return (
              <li key={item.path}>
                <Link
                  to={locked ? '#' : item.path}
                  onClick={(e) => {
                    if (locked) {
                      e.preventDefault();
                    } else {
                      onNavigate?.();
                    }
                  }}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors relative',
                    'hover:bg-muted',
                    isActive && 'bg-primary/10 text-primary hover:bg-primary/15',
                    !isActive && 'text-muted-foreground hover:text-foreground',
                    locked && 'opacity-60 cursor-not-allowed'
                  )}
                >
                  {item.icon}
                  <span className="flex-1 text-sm">{item.label}</span>
                  {locked && <Lock className="h-4 w-4 text-muted-foreground" />}
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
