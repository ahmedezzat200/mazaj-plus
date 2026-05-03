import { Lock, Star } from 'lucide-react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { UserTier } from '../DashboardLayout';

interface LockedOverlayProps {
  userTier: UserTier;
}

export function LockedOverlay({ userTier }: LockedOverlayProps) {
  return (
    <div className="relative min-h-[600px]">
      {/* Blurred Preview Content */}
      <div className="filter blur-sm opacity-40 pointer-events-none select-none">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="p-6 space-y-6">
              <div className="h-8 bg-muted rounded w-1/3" />
              <div className="h-48 bg-muted rounded" />
              <div className="space-y-3">
                <div className="h-24 bg-muted rounded" />
                <div className="h-24 bg-muted rounded" />
                <div className="h-24 bg-muted rounded" />
              </div>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="p-6 space-y-6">
              <div className="h-8 bg-muted rounded w-2/3" />
              <div className="h-32 bg-muted rounded" />
              <div className="h-48 bg-muted rounded" />
            </Card>
          </div>
        </div>
      </div>

      {/* Lock Overlay */}
      <div className="absolute inset-0 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4 p-8 shadow-xl border-2 border-primary/20">
          <div className="text-center space-y-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-2">
              <Lock className="h-8 w-8 text-primary" />
            </div>

            <div className="space-y-2">
              <h2>Available on Ultra</h2>
              <p className="text-muted-foreground">
                Tracking & Reports is an Ultra-exclusive feature. Log daily meals, track calories,
                monitor hydration, and review weekly nutrition trends.
              </p>
            </div>

            <div className="p-4 bg-muted/50 rounded-lg space-y-3">
              <div className="flex items-start gap-3">
                <Star className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-sm text-left">Daily food intake logging with calorie tracking</p>
              </div>
              <div className="flex items-start gap-3">
                <Star className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-sm text-left">Weekly nutrition reports with visual charts</p>
              </div>
              <div className="flex items-start gap-3">
                <Star className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-sm text-left">Progress tracking and trend analysis</p>
              </div>
              <div className="flex items-start gap-3">
                <Star className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-sm text-left">Hydration monitoring and goal setting</p>
              </div>
            </div>

            <div className="pt-4 space-y-3">
              <Button className="w-full" size="lg" asChild>
                <a href="/dashboard/subscription">
                  See Upgrade Options
                </a>
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <a href="/dashboard">
                  Return to Dashboard
                </a>
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
