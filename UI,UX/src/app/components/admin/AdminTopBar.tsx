import { Menu } from 'lucide-react';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Badge } from '../ui/badge';

interface AdminTopBarProps {
  onMenuClick: () => void;
}

export function AdminTopBar({ onMenuClick }: AdminTopBarProps) {
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
            <h1 className="text-xl font-semibold text-foreground">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Platform monitoring and operational management
            </p>
          </div>
        </div>

        {/* Right: Admin badge + Avatar */}
        <div className="flex items-center gap-3">
          <Badge className="bg-primary text-primary-foreground">
            Admin
          </Badge>
          <Avatar className="h-9 w-9 cursor-pointer hover:ring-2 ring-ring transition-all">
            <AvatarFallback className="bg-primary text-primary-foreground text-sm">
              AD
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
