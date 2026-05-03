import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { User, ShieldCheck, Crown } from 'lucide-react';
import { UserData } from '../DashboardLayout';
import { NutritionPlanData } from './NutritionPlansPage';

interface PlanSupportCardsProps {
  userData: UserData;
  plan: NutritionPlanData;
}

export function PlanSupportCards({ userData, plan }: PlanSupportCardsProps) {
  // Mock profile data
  const profileData = {
    age: 28,
    gender: 'Female',
    allergies: ['Shellfish'],
    conditions: ['None'],
  };

  return (
    <div className="space-y-4">
      {/* Profile Context */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm">Profile Context</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Age</span>
            <span className="text-foreground font-medium">{profileData.age}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Gender</span>
            <span className="text-foreground font-medium">{profileData.gender}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">BMI</span>
            <span className="text-foreground font-medium">{plan.bmi}</span>
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
          <div>
            <p className="text-xs text-muted-foreground mb-2">Allergies Checked</p>
            <div className="flex flex-wrap gap-1">
              {profileData.allergies.map((allergy) => (
                <Badge key={allergy} variant="outline" className="text-xs border-secondary/30">
                  {allergy}
                </Badge>
              ))}
            </div>
          </div>
          
          <div>
            <p className="text-xs text-muted-foreground mb-2">Health Conditions</p>
            <div className="flex flex-wrap gap-1">
              {profileData.conditions.map((condition) => (
                <Badge key={condition} variant="outline" className="text-xs border-secondary/30">
                  {condition}
                </Badge>
              ))}
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
