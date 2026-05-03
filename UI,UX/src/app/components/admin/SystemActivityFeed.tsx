import { UserPlus, TrendingUp, Upload, CreditCard, Clock } from 'lucide-react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';

interface Activity {
  type: 'registration' | 'tier-change' | 'upload' | 'subscription';
  description: string;
  time: string;
  icon: React.ReactNode;
  badge?: string;
}

const activities: Activity[] = [
  {
    type: 'registration',
    description: 'New user registration',
    time: '2 minutes ago',
    icon: <UserPlus className="h-4 w-4" />,
    badge: 'New',
  },
  {
    type: 'tier-change',
    description: 'User upgraded to Ultra',
    time: '15 minutes ago',
    icon: <TrendingUp className="h-4 w-4" />,
    badge: 'Ultra',
  },
  {
    type: 'upload',
    description: 'Food image uploaded for analysis',
    time: '23 minutes ago',
    icon: <Upload className="h-4 w-4" />,
  },
  {
    type: 'subscription',
    description: 'Pro subscription renewed',
    time: '1 hour ago',
    icon: <CreditCard className="h-4 w-4" />,
    badge: 'Pro',
  },
  {
    type: 'registration',
    description: 'New user registration',
    time: '2 hours ago',
    icon: <UserPlus className="h-4 w-4" />,
    badge: 'New',
  },
  {
    type: 'tier-change',
    description: 'User upgraded to Pro',
    time: '3 hours ago',
    icon: <TrendingUp className="h-4 w-4" />,
    badge: 'Pro',
  },
  {
    type: 'upload',
    description: 'InBody data uploaded',
    time: '4 hours ago',
    icon: <Upload className="h-4 w-4" />,
  },
];

export function SystemActivityFeed() {
  return (
    <Card className="p-6">
      <div className="mb-4">
        <h3>Recent Activity</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Real-time operational events and system updates
        </p>
      </div>

      <div className="space-y-3">
        {activities.length === 0 ? (
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
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                {activity.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-medium">{activity.description}</p>
                  {activity.badge && (
                    <Badge variant="secondary" className="text-xs">
                      {activity.badge}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{activity.time}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
