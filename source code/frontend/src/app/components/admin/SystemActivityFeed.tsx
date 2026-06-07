import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { adminApi, AdminActivityEntry } from '../../../lib/api';

export function SystemActivityFeed() {
  const [activities, setActivities] = useState<AdminActivityEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getActivity().then((result) => {
      if (result.ok && result.data) setActivities(result.data.activity ?? []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const formatTime = (ts: string) => {    const diff = Date.now() - new Date(ts).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins} minute${mins !== 1 ? 's' : ''} ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} hour${hrs !== 1 ? 's' : ''} ago`;
    return new Date(ts).toLocaleDateString();
  };

  return (
    <Card className="p-6">
      <div className="mb-4">
        <h3>Recent Activity</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Recent audit log entries
        </p>
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg animate-pulse">
                <div className="w-8 h-8 rounded-lg bg-muted flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-48 bg-muted rounded" />
                  <div className="h-2 w-24 bg-muted rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-border rounded-lg">
            <Clock className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
            <h4 className="mb-2">No Recent Activity</h4>
            <p className="text-sm text-muted-foreground">
              System activity will appear here as events occur
            </p>
          </div>
        ) : (
          activities.map((activity, index) => (
            <div
              key={index}
              className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0 text-xs font-bold">
                {activity.actor_email?.slice(0, 1).toUpperCase() ?? '?'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-medium truncate">{activity.action.replace(/_/g, ' ')}</p>
                  {activity.resource_type && (
                    <Badge variant="secondary" className="text-xs flex-shrink-0">
                      {activity.resource_type}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {activity.actor_email} · {formatTime(activity.created_at)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
