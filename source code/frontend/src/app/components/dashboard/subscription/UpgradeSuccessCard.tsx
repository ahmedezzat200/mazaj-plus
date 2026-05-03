import { CheckCircle2, Sparkles, ArrowRight } from 'lucide-react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { UserTier } from '../DashboardLayout';

interface UpgradeSuccessCardProps {
  newTier: UserTier;
  onReturnToDashboard: () => void;
}

export function UpgradeSuccessCard({ newTier, onReturnToDashboard }: UpgradeSuccessCardProps) {
  return (
    <Card className="p-8 text-center border-2 border-primary/20">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
        <CheckCircle2 className="h-8 w-8 text-primary" />
      </div>

      <h2 className="mb-2">Subscription Updated Successfully</h2>
      <p className="text-muted-foreground mb-6">
        Welcome to Mazaj+ {newTier}! Your plan has been activated and you now have access to all {newTier} features.
      </p>

      <div className="inline-flex items-center justify-center gap-3 mb-8">
        <Badge variant="default" className="text-base px-4 py-1.5 bg-primary">
          <Sparkles className="h-4 w-4 mr-1.5" />
          {newTier} Plan Active
        </Badge>
      </div>

      <div className="bg-muted/50 rounded-lg p-6 mb-6">
        <p className="font-medium mb-3">Start exploring your new features:</p>
        <ul className="space-y-2 text-left max-w-md mx-auto">
          {newTier === 'Pro' && (
            <>
              <li className="flex items-center gap-2">
                <ArrowRight className="h-4 w-4 text-primary" />
                <span className="text-sm">Upload food images for analysis</span>
              </li>
              <li className="flex items-center gap-2">
                <ArrowRight className="h-4 w-4 text-primary" />
                <span className="text-sm">Integrate InBody measurements</span>
              </li>
              <li className="flex items-center gap-2">
                <ArrowRight className="h-4 w-4 text-primary" />
                <span className="text-sm">Get detailed nutrition breakdowns</span>
              </li>
            </>
          )}
          {newTier === 'Ultra' && (
            <>
              <li className="flex items-center gap-2">
                <ArrowRight className="h-4 w-4 text-primary" />
                <span className="text-sm">Log daily food intake</span>
              </li>
              <li className="flex items-center gap-2">
                <ArrowRight className="h-4 w-4 text-primary" />
                <span className="text-sm">Review weekly nutrition reports</span>
              </li>
              <li className="flex items-center gap-2">
                <ArrowRight className="h-4 w-4 text-primary" />
                <span className="text-sm">Track progress over time</span>
              </li>
              <li className="flex items-center gap-2">
                <ArrowRight className="h-4 w-4 text-primary" />
                <span className="text-sm">Access unlimited history</span>
              </li>
            </>
          )}
        </ul>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button size="lg" onClick={onReturnToDashboard}>
          Return to Dashboard
        </Button>
        <Button size="lg" variant="outline" asChild>
          <a href="/dashboard">Continue Using Mazaj+</a>
        </Button>
      </div>
    </Card>
  );
}
