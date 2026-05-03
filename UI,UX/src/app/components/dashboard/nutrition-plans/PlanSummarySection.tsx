import { NutritionPlanData } from './NutritionPlansPage';
import { Target, Flame, Activity, CheckCircle } from 'lucide-react';
import { Badge } from '../../ui/badge';

interface PlanSummarySectionProps {
  plan: NutritionPlanData;
}

export function PlanSummarySection({ plan }: PlanSummarySectionProps) {
  return (
    <div className="px-6 py-5 bg-card/50 border-b border-border">
      <h3 className="text-sm font-medium text-muted-foreground mb-4">Plan Summary</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* BMI */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Activity className="h-4 w-4" />
            <span className="text-xs">BMI (Informational)</span>
          </div>
          <p className="text-2xl font-semibold text-foreground">{plan.bmi}</p>
        </div>

        {/* Daily Calories */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Flame className="h-4 w-4" />
            <span className="text-xs">Daily Calorie Target</span>
          </div>
          <p className="text-2xl font-semibold text-foreground">{plan.dailyCalories}</p>
        </div>

        {/* Goal */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Target className="h-4 w-4" />
            <span className="text-xs">Goal</span>
          </div>
          <Badge variant="secondary" className="bg-secondary/10 text-secondary-foreground mt-1">
            {plan.goal}
          </Badge>
        </div>

        {/* InBody Status */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-muted-foreground">
            <CheckCircle className="h-4 w-4" />
            <span className="text-xs">InBody Applied</span>
          </div>
          <Badge 
            variant="outline" 
            className={plan.inBodyApplied ? 'border-primary text-primary' : 'text-muted-foreground'}
          >
            {plan.inBodyApplied ? 'Yes' : 'No'}
          </Badge>
        </div>
      </div>

      {/* Safety info */}
      <div className="mt-4 pt-4 border-t border-border">
        <p className="text-xs text-muted-foreground leading-relaxed">
          This plan was validated against your stored health conditions, allergies, 
          and dietary restrictions to ensure safety and personalization.
        </p>
      </div>
    </div>
  );
}
