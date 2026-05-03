import { Lightbulb, Crown, Star, CheckCircle } from 'lucide-react';
import { Card } from '../ui/card';

const stats = [
  {
    label: 'Total Active Tips',
    value: '47',
    icon: Lightbulb,
    color: 'text-primary',
  },
  {
    label: 'Active Pro Subscriptions',
    value: '243',
    icon: Crown,
    color: 'text-secondary',
  },
  {
    label: 'Active Ultra Subscriptions',
    value: '112',
    icon: Star,
    color: 'text-primary',
  },
  {
    label: 'Total Active Subscriptions',
    value: '355',
    icon: CheckCircle,
    color: 'text-primary',
  },
];

export function TipsSubscriptionStats() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="p-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg bg-muted flex items-center justify-center ${stat.color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-semibold">{stat.value}</p>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
