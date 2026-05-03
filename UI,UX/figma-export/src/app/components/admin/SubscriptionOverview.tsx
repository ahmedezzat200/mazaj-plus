import { CreditCard, TrendingUp, Users } from 'lucide-react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';

export function SubscriptionOverview() {
  return (
    <Card className="p-6">
      <div className="mb-4">
        <h3>Subscription Overview</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Active paid subscription summary
        </p>
      </div>

      <div className="space-y-4">
        {/* Total Active */}
        <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
          <div className="flex items-center gap-3 mb-2">
            <CreditCard className="h-5 w-5 text-primary" />
            <h4>Total Active Subscriptions</h4>
          </div>
          <p className="text-3xl font-semibold">355</p>
          <div className="flex items-center gap-2 mt-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            <span className="text-sm text-muted-foreground">+8 this week</span>
          </div>
        </div>

        {/* Pro Subscriptions */}
        <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center">
              <Users className="h-5 w-5 text-secondary" />
            </div>
            <div>
              <p className="font-medium">Pro Subscriptions</p>
              <p className="text-sm text-muted-foreground">Active paid tier</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-semibold">243</p>
            <Badge variant="secondary" className="mt-1">
              68.5%
            </Badge>
          </div>
        </div>

        {/* Ultra Subscriptions */}
        <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium">Ultra Subscriptions</p>
              <p className="text-sm text-muted-foreground">Premium tier</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-semibold">112</p>
            <Badge variant="default" className="mt-1 bg-primary">
              31.5%
            </Badge>
          </div>
        </div>
      </div>
    </Card>
  );
}
