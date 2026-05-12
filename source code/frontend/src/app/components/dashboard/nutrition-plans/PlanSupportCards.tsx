import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { User, ShieldCheck, Crown, Info } from 'lucide-react';
import { UserData } from '../DashboardLayout';
import { NutritionPlanData } from './NutritionPlansPage';
import { Link } from 'react-router';

interface PlanSupportCardsProps {
  userData: UserData;
  plan: NutritionPlanData;
}

export function PlanSupportCards({ userData }: PlanSupportCardsProps) {
  return (
    <div className="space-y-4">
      {/* Profile Context / Privacy Notice */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              <CardTitle className="text-sm">Plan Personalization</CardTitle>
            </div>
            <Link to="/dashboard/profile" className="text-xs text-primary hover:underline">Update Profile →</Link>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-3 bg-muted/30 rounded-lg border border-border/50">
            <p className="text-xs text-muted-foreground leading-relaxed">
              This plan is personalized based on your age, gender, and physical metrics, but these details are kept private and are not displayed here for your security.
            </p>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground italic">
            <Info className="h-3 w-3" />
            <span>Manage visibility in Profile Settings</span>
          </div>
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
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground leading-relaxed">
              Backend safety validation was completed automatically. This plan strictly excludes items mapped to your allergies and respects health condition restrictions.
            </p>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[10px] border-secondary/30 text-secondary">Allergies Filtered</Badge>
              <Badge variant="outline" className="text-[10px] border-secondary/30 text-secondary">Conditions Validated</Badge>
            </div>
          </div>
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
            {userData.tier} Plan
          </Badge>

          <div className="space-y-1.5 text-xs">
            {userData.tier === 'Free' && (
              <p className="text-muted-foreground">
                Viewing your most recent nutrition plan. Upgrade to Ultra for full plan history and comparisons.
              </p>
            )}

            {userData.tier === 'Pro' && (
              <p className="text-muted-foreground">
                Viewing your most recent plan. Upgrade to Ultra for unlimited history and tracking features.
              </p>
            )}

            {userData.tier === 'Ultra' && (
              <p className="text-muted-foreground">
                You have full access to your entire plan history and all premium tracking tools.
              </p>
            )}
          </div>
          
          {userData.tier !== 'Ultra' && (
            <Button asChild variant="outline" size="sm" className="w-full mt-2 h-8 text-xs">
              <Link to="/dashboard/subscription">View Upgrades</Link>
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
