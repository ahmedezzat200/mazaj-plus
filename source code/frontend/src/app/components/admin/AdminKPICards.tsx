import { useEffect, useState } from 'react';
import { Users, UserCheck, Crown, Star, UtensilsCrossed, UserPlus } from 'lucide-react';
import { Card } from '../ui/card';
import { adminApi, AdminStats } from '../../../lib/api';

export function AdminKPICards() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getStats().then((result) => {
      if (result.ok && result.data) setStats(result.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const kpis = stats ? [
    { label: 'Total Registered Users', value: stats.total_users.toLocaleString(), icon: <Users className="h-5 w-5" />, color: 'text-primary' },
    { label: 'Free Users', value: stats.free_users.toLocaleString(), icon: <UserCheck className="h-5 w-5" />, color: 'text-muted-foreground' },
    { label: 'Pro Users', value: stats.pro_users.toLocaleString(), icon: <Crown className="h-5 w-5" />, color: 'text-secondary' },
    { label: 'Ultra Users', value: stats.ultra_users.toLocaleString(), icon: <Star className="h-5 w-5" />, color: 'text-primary' },
    { label: 'Active Food Items', value: stats.total_foods.toLocaleString(), icon: <UtensilsCrossed className="h-5 w-5" />, color: 'text-muted-foreground' },
    { label: 'Active Daily Tips', value: stats.total_tips.toLocaleString(), icon: <UserPlus className="h-5 w-5" />, color: 'text-primary' },
  ] : [];

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 7 }).map((_, i) => (
          <Card key={i} className="p-4 animate-pulse">
            <div className="h-10 w-10 rounded-lg bg-muted mb-3" />
            <div className="h-3 w-24 bg-muted rounded mb-2" />
            <div className="h-7 w-16 bg-muted rounded" />
          </Card>
        ))}
      </div>
    );
  }

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
          </div>
        </Card>
      ))}
    </div>
  );
}
