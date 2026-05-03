import { Users, UtensilsCrossed, CreditCard, Activity } from 'lucide-react';
import { Card } from '../ui/card';

const stats = [
  {
    label: 'Total Users',
    value: '1,247',
    icon: Users,
    color: 'text-primary',
  },
  {
    label: 'Total Food Items',
    value: '3,842',
    icon: UtensilsCrossed,
    color: 'text-muted-foreground',
  },
  {
    label: 'Active Subscriptions',
    value: '355',
    icon: CreditCard,
    color: 'text-primary',
  },
  {
    label: 'Recent Activity',
    value: '128',
    icon: Activity,
    color: 'text-muted-foreground',
  },
];

export function ManagementStats() {
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
