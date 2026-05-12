import { Menu, LogOut, User as UserIcon } from 'lucide-react';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { UserData } from './DashboardLayout';
import { useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router';

interface DashboardTopBarProps {
  userData: UserData;
  onMenuClick: () => void;
}

export function DashboardTopBar({ userData, onMenuClick }: DashboardTopBarProps) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Free':
        return 'bg-muted text-muted-foreground';
      case 'Pro':
        return 'bg-secondary text-secondary-foreground';
      case 'Ultra':
        return 'bg-primary text-primary-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 bg-card border-b border-border">
      <div className="flex items-center justify-between px-4 lg:px-6 py-4">
        {/* Left: Mobile menu + Page title */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onMenuClick}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-semibold text-foreground">Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Welcome back, {userData.name.split(' ')[0]}
            </p>
          </div>
        </div>

        {/* Right: Tier badge + Avatar with Dropdown */}
        <div className="flex items-center gap-3 relative">
          <Badge className={getTierColor(userData.tier)} variant="secondary">
            {userData.tier}
          </Badge>
          <div className="relative">
            <Avatar 
              className="h-9 w-9 cursor-pointer hover:ring-2 ring-ring transition-all"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                {getInitials(userData.name)}
              </AvatarFallback>
            </Avatar>

            {menuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg z-20 py-1">
                  <div className="px-3 py-2 border-b border-border">
                    <p className="text-sm font-medium text-foreground truncate">{userData.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{userData.email}</p>
                  </div>
                  <Link
                    to="/dashboard/profile"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                  >
                    <UserIcon className="h-4 w-4" /> My Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-muted transition-colors"
                  >
                    <LogOut className="h-4 w-4" /> Logout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
