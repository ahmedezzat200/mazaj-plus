import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Switch } from '../../ui/switch';
import { Label } from '../../ui/label';
import { Bell, BellOff } from 'lucide-react';

interface HydrationRemindersCardProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
}

export function HydrationRemindersCard({ enabled, onToggle }: HydrationRemindersCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {enabled ? (
            <Bell className="h-5 w-5 text-primary" />
          ) : (
            <BellOff className="h-5 w-5 text-muted-foreground" />
          )}
          Hydration Reminders
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Toggle control */}
        <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border">
          <div className="space-y-0.5">
            <Label htmlFor="reminders-toggle" className="text-sm font-medium">
              Enable Reminders
            </Label>
            <p className="text-xs text-muted-foreground">
              Get periodic notifications to drink water
            </p>
          </div>
          <Switch
            id="reminders-toggle"
            checked={enabled}
            onCheckedChange={onToggle}
          />
        </div>

        {/* Status */}
        <div className="bg-card rounded-lg p-4 border border-border">
          <div className="text-sm text-foreground mb-2">
            {enabled ? (
              <span className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                <span>Reminders are <span className="font-medium text-primary">active</span></span>
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-muted-foreground"></div>
                <span>Reminders are <span className="font-medium text-muted-foreground">paused</span></span>
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {enabled 
              ? 'You\'ll receive reminders every 2 hours during waking hours (8 AM - 10 PM)'
              : 'Turn on reminders to get notifications throughout the day'
            }
          </p>
        </div>

        {/* Info */}
        {enabled && (
          <div className="bg-secondary/5 border border-secondary/20 rounded-lg p-3">
            <p className="text-xs text-muted-foreground">
              Reminder schedule: 8:00 AM, 10:00 AM, 12:00 PM, 2:00 PM, 4:00 PM, 6:00 PM, 8:00 PM
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}