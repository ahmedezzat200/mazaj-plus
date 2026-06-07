import { Link, useLocation, useNavigate } from 'react-router';
import { type ReactNode } from 'react';
import {
  LayoutDashboard,
  MessageSquare,
  UtensilsCrossed,
  Droplet,
  Upload,
  BookOpen,
  User,
  CreditCard,
  LogOut,
  Lock,
  Leaf,
  Plus,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { UserTier } from './DashboardLayout';
import { cn } from '../ui/utils';
import { useAuth } from '../../../contexts/AuthContext';
import { Tooltip, TooltipTrigger, TooltipContent } from '../ui/tooltip';

interface NavItem {
  label: string;
  icon: ReactNode;
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
    label: 'Chat',
    icon: <MessageSquare className="h-5 w-5" />,
    path: '/dashboard/chat',
  },
  {
    label: 'Healthy Alternatives & Hydration',
    icon: <Droplet className="h-5 w-5" />,
    path: '/dashboard/alternatives',
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

interface ChatSessionInfo {
  id: number;
  title: string;
  created_at: string;
  updated_at: string;
}

interface DashboardSidebarProps {
  userTier: UserTier;
  onNavigate?: () => void;
  sessions?: ChatSessionInfo[];
  activeSessionId?: number | null;
  isSessionsLoading?: boolean;
  isSessionsError?: boolean;
  onSelectSession?: (id: number) => void;
  onNewChat?: () => void;
  onRefreshSessions?: () => void;
}

export function DashboardSidebar({
  userTier,
  onNavigate,
  sessions,
  activeSessionId,
  isSessionsLoading,
  isSessionsError,
  onSelectSession,
  onNewChat,
  onRefreshSessions,
}: DashboardSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    await logout();
    navigate('/login');
  };

  const isLocked = (item: NavItem) => {
    return item.locked ? item.locked[userTier] : false;
  };

  return (
    <div className="h-full w-64 bg-card border-r border-border flex flex-col animate-in slide-in-from-left duration-300 lg:animate-none">
      {/* Logo / Brand */}
      <div className="px-6 py-6 border-b border-border">
        <Link
          to="/dashboard"
          className="flex items-center gap-2 group"
          onClick={onNavigate}
        >
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
            <Leaf className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-semibold text-foreground">Mazaj+</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto flex flex-col gap-6">
        <ul className="space-y-0.5">
          {navItems.map((item) => {
            const locked = isLocked(item);
            const isActive = location.pathname === item.path;

            return (
              <li key={item.path}>
                {locked ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span
                        className={cn(
                          'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 relative',
                          'opacity-50 cursor-not-allowed text-muted-foreground'
                        )}
                      >
                        {item.icon}
                        <span className="flex-1 text-sm">{item.label}</span>
                        <Lock className="h-3.5 w-3.5 text-muted-foreground/60" />
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      {item.locked?.Free && !item.locked?.Pro
                        ? 'Upgrade to Pro or Ultra to unlock'
                        : 'Upgrade to Ultra to unlock'}
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  <Link
                    to={item.path}
                    onClick={onNavigate}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 relative group',
                      isActive
                        ? 'bg-primary/10 text-primary font-medium border-l-[3px] border-primary pl-[9px]'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted border-l-[3px] border-transparent pl-[9px]'
                    )}
                  >
                    <span className={cn(
                      'transition-transform duration-200',
                      !isActive && 'group-hover:translate-x-0.5'
                    )}>
                      {item.icon}
                    </span>
                    <span className="flex-1 text-sm">{item.label}</span>
                    {isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-primary ml-auto" />
                    )}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>

        {/* Chat History Section */}
        {sessions && (
          <div className="border-t border-border pt-4 flex-1 flex flex-col min-h-[250px]">
            <div className="flex items-center justify-between px-3 mb-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <MessageSquare className="h-3.5 w-3.5" />
                Chat History
              </span>
              {onRefreshSessions && (
                <button
                  onClick={onRefreshSessions}
                  className="text-[10px] text-primary hover:underline"
                >
                  Refresh
                </button>
              )}
            </div>

            {onNewChat && (
              <div className="px-3 mb-3">
                <button
                  onClick={onNewChat}
                  className="flex items-center justify-center gap-1.5 w-full py-1.5 px-3 text-xs bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/95 transition-all shadow-sm"
                >
                  <Plus className="h-3.5 w-3.5" />
                  New Chat
                </button>
              </div>
            )}

            <div className="flex-1 overflow-y-auto max-h-[300px] space-y-1 px-1">
              {isSessionsLoading && (
                <div className="flex flex-col items-center justify-center py-6 text-muted-foreground gap-1.5">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <span className="text-[10px]">Loading history...</span>
                </div>
              )}

              {isSessionsError && (
                <div className="flex flex-col items-center justify-center py-6 px-3 text-center text-muted-foreground gap-1.5">
                  <AlertCircle className="h-4 w-4 text-destructive" />
                  <span className="text-[10px] font-medium">Failed to load history</span>
                </div>
              )}

              {!isSessionsLoading && !isSessionsError && sessions.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-[10px] font-medium">No previous chats</p>
                </div>
              )}

              {!isSessionsLoading &&
                !isSessionsError &&
                sessions.map((session) => {
                  const isActive = session.id === activeSessionId;
                  let timeAgo = '';
                  try {
                    timeAgo = formatDistanceToNow(new Date(session.updated_at), { addSuffix: true });
                  } catch {
                    timeAgo = 'recently';
                  }

                  return (
                    <button
                      key={session.id}
                      onClick={() => onSelectSession?.(session.id)}
                      className={`w-full text-left p-2.5 rounded-lg flex flex-col gap-0.5 transition-all ${
                        isActive
                          ? 'bg-primary/10 text-primary border border-primary/20 font-medium'
                          : 'hover:bg-muted text-muted-foreground hover:text-foreground border border-transparent'
                      }`}
                    >
                      <span className="text-xs font-semibold truncate leading-tight">
                        {session.title || 'Untitled Chat'}
                      </span>
                      <span className="text-[9px] opacity-75">
                        {timeAgo}
                      </span>
                    </button>
                  );
                })}
            </div>
          </div>
        )}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-border">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200 group"
        >
          <LogOut className="h-5 w-5 group-hover:translate-x-0.5 transition-transform duration-200" />
          <span className="text-sm">Logout</span>
        </button>
      </div>
    </div>
  );
}
