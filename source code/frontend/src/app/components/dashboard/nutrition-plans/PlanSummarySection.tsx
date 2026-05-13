import { NutritionPlanData } from './NutritionPlansPage';
import { Flame, ShieldCheck, Target } from 'lucide-react';
import { Badge } from '../../ui/badge';

interface PlanSummarySectionProps {
  plan: NutritionPlanData;
}

export function PlanSummarySection({ plan }: PlanSummarySectionProps) {
  return (
    <div className="px-6 py-5 bg-card/50 border-b border-border">
      <h3 className="text-sm font-medium text-muted-foreground mb-4">Plan Summary</h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Flame className="h-4 w-4" />
            <span className="text-xs">Daily Calorie Target</span>
          </div>
          <p className="text-2xl font-semibold text-foreground">{plan.dailyCalories ?? '-'}</p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Target className="h-4 w-4" />
            <span className="text-xs">Goal</span>
          </div>
          <Badge variant="secondary" className="bg-secondary/10 text-secondary-foreground mt-1">
            {plan.goal}
          </Badge>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-muted-foreground">
            <ShieldCheck className="h-4 w-4" />
            <span className="text-xs">Safety Check</span>
          </div>
          <Badge variant="outline" className="border-primary text-primary">
            Backend validated
          </Badge>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-border">
        <p className="text-xs text-muted-foreground leading-relaxed">
          {plan.advisory_note
            ? plan.advisory_note
            : 'This plan was validated by backend safety rules before display.'}
        </p>
      </div>
    </div>
  );
}
