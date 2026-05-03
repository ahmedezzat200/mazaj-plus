import { Button } from '../ui/button';
import { Users, TrendingUp } from 'lucide-react';

export function AdminOverview() {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <h2 className="mb-2">Platform Overview</h2>
        <p className="text-muted-foreground flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" />
          System operational. All services running normally.
        </p>
      </div>
      <Button asChild>
        <a href="/admin/users">
          <Users className="h-4 w-4 mr-2" />
          View Users
        </a>
      </Button>
    </div>
  );
}
