import { Menu } from 'lucide-react';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { UserData } from './DashboardLayout';

interface DashboardTopBarCustomProps {
  userData: UserData;
  onMenuClick: () => void;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export function DashboardTopBarCustom({ 
  userData, 
  onMenuClick, 
  title, 
  subtitle,
  action 
}: DashboardTopBarCustomProps) {
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
            <h1 className="text-xl font-semibold text-foreground">{title}</h1>
            {subtitle && (
              <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>
            )}
          </div>
        </div>

        {/* Right: Action + Tier badge + Avatar */}
        <div className="flex items-center gap-3">
          {action}
          <Badge className={getTierColor(userData.tier)} variant="secondary">
            {userData.tier}
          </Badge>
          <Avatar className="h-9 w-9 cursor-pointer hover:ring-2 ring-ring transition-all">
            <AvatarFallback className="bg-primary text-primary-foreground text-sm">
              {getInitials(userData.name)}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
