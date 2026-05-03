import { CheckCircle2, Sparkles } from 'lucide-react';
import { Card } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { UserTier } from '../DashboardLayout';

interface CurrentPlanCardProps {
  currentTier: UserTier;
}

const planDescriptions = {
  Free: 'Essential nutrition guidance with chat support, personalized plans, and daily wellness tips',
  Pro: 'Advanced features including food image analysis, InBody integration, and comprehensive healthy alternatives',
  Ultra: 'Complete nutrition tracking suite with daily logging, weekly reports, and unlimited access to all features',
};

export function CurrentPlanCard({ currentTier }: CurrentPlanCardProps) {
  return (
    <Card className="p-6 border-2 border-primary/20 bg-primary/5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3>Your Current Plan</h3>
                <Badge variant="default" className="bg-primary text-primary-foreground">
                  {currentTier}
                </Badge>
              </div>
              <div className="flex items-center gap-1.5 mt-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                <p className="text-sm text-muted-foreground">Active</p>
              </div>
            </div>
          </div>

          <p className="text-muted-foreground">
            {planDescriptions[currentTier]}
          </p>
        </div>
      </div>
    </Card>
  );
}
