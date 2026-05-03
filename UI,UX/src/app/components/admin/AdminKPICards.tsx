import { Users, UserCheck, Crown, Star, CreditCard, UtensilsCrossed, UserPlus, Upload } from 'lucide-react';
import { Card } from '../ui/card';

interface KPI {
  label: string;
  value: string;
  icon: React.ReactNode;
  trend?: string;
  color?: string;
}

const kpis: KPI[] = [
  {
    label: 'Total Registered Users',
    value: '1,247',
    icon: <Users className="h-5 w-5" />,
    trend: '+12% this month',
    color: 'text-primary',
  },
  {
    label: 'Free Users',
    value: '892',
    icon: <UserCheck className="h-5 w-5" />,
    color: 'text-muted-foreground',
  },
  {
    label: 'Pro Users',
    value: '243',
    icon: <Crown className="h-5 w-5" />,
    color: 'text-secondary',
  },
  {
    label: 'Ultra Users',
    value: '112',
    icon: <Star className="h-5 w-5" />,
    color: 'text-primary',
  },
  {
    label: 'Active Subscriptions',
    value: '355',
    icon: <CreditCard className="h-5 w-5" />,
    trend: '+8 this week',
    color: 'text-primary',
  },
  {
    label: 'Total Food Items',
    value: '3,842',
    icon: <UtensilsCrossed className="h-5 w-5" />,
    color: 'text-muted-foreground',
  },
  {
    label: 'Recent Registrations',
    value: '47',
    icon: <UserPlus className="h-5 w-5" />,
    trend: 'Last 7 days',
    color: 'text-primary',
  },
  {
    label: 'Upload Activity',
    value: '128',
    icon: <Upload className="h-5 w-5" />,
    trend: 'This week',
    color: 'text-muted-foreground',
  },
];

export function AdminKPICards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi, index) => (
        <Card key={index} className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className={`w-10 h-10 rounded-lg bg-muted flex items-center justify-center ${kpi.color}`}>
              {kpi.icon}
            </div>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">{kpi.label}</p>
            <p className="text-2xl font-semibold">{kpi.value}</p>
            {kpi.trend && (
              <p className="text-xs text-muted-foreground mt-1">{kpi.trend}</p>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}
