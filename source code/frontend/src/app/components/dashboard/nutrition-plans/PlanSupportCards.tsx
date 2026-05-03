import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { ShieldCheck, Crown, Lock } from 'lucide-react';
import { UserData } from '../DashboardLayout';
import { NutritionPlanData } from './NutritionPlansPage';

interface PlanSupportCardsProps {
  userData: UserData;
  plan: NutritionPlanData;
}

export function PlanSupportCards({ userData }: PlanSupportCardsProps) {
  return (
    <div className="space-y-4">
      {/* Privacy Notice — replaces Profile Context */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm">Profile Privacy</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Personal health details — including age, weight, height, allergies, and health
            conditions — are kept private and are not shown here.
          </p>
        </CardContent>
      </Card>

      {/* Safety Summary */}
      <Card className="bg-secondary/5 border-secondary/20">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-secondary" />
            <CardTitle className="text-sm">Safety Summary</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Backend safety validation was completed before this plan was returned.
          </p>
          <p className="text-xs text-muted-foreground">
            Plan generation is advisory only and does not constitute medical advice.
          </p>
        </CardContent>
      </Card>

      {/* Tier Access */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Crown className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm">Tier Access</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Badge
            variant="secondary"
            className={
              userData.tier === 'Ultra'
                ? 'bg-primary text-primary-foreground'
                : userData.tier === 'Pro'
                ? 'bg-secondary text-secondary-foreground'
                : 'bg-muted text-muted-foreground'
            }
          >
            {userData.tier}
          </Badge>

          <div className="space-y-1.5 text-xs">
            {userData.tier === 'Free' && (
              <p className="text-muted-foreground">
                View your most recent nutrition plan. Upgrade for unlimited history and advanced features.
              </p>
            )}

            {userData.tier === 'Pro' && (
              <p className="text-muted-foreground">
                View your most recent plan. Upgrade to Ultra for full plan history access.
              </p>
            )}

            {userData.tier === 'Ultra' && (
              <p className="text-muted-foreground">
                Full access to plan history, comparisons, and advanced tracking features.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
