import { NutritionPlanData } from './NutritionPlansPage';
import { PlanSummarySection } from './PlanSummarySection';
import { PlanMealSection } from './PlanMealSection';
import { PlanActions } from './PlanActions';
import { Badge } from '../../ui/badge';
import { ShieldCheck, Sparkles } from 'lucide-react';
import { format } from 'date-fns';

interface PlanCardProps {
  plan: NutritionPlanData;
}

export function PlanCard({ plan }: PlanCardProps) {
  return (
    <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 bg-gradient-to-br from-primary/5 to-secondary/5 border-b border-primary/10">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary flex-shrink-0" />
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              Mazaj+ Nutrition Plan
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge 
              variant="secondary" 
              className={
                plan.status === 'current' 
                  ? 'bg-secondary/20 text-secondary' 
                  : 'bg-muted text-muted-foreground'
              }
            >
              {plan.status === 'current' ? 'Current Plan' : 'Saved Plan'}
            </Badge>
            {plan.safetyValidated && (
              <Badge variant="secondary" className="bg-secondary/20 text-secondary gap-1">
                <ShieldCheck className="h-3 w-3" />
                Safety Validated
              </Badge>
            )}
          </div>
        </div>

        <h2 className="text-xl font-semibold text-foreground mb-1">
          {plan.title}
        </h2>
        <p className="text-sm text-muted-foreground">
          Generated on {format(plan.generatedDate, 'MMMM d, yyyy')}
        </p>
      </div>

      {/* Plan Summary */}
      <PlanSummarySection plan={plan} />

      {/* Meal Plan */}
      <div className="px-6 py-6 border-t border-border">
        <h3 className="font-semibold text-foreground mb-4">Daily Meal Plan</h3>
        <div className="space-y-4">
          {plan.meals.map((meal, index) => (
            <PlanMealSection key={index} meal={meal} />
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="px-6 py-5 bg-muted/30 border-t border-border">
        <PlanActions />
      </div>
    </div>
  );
}
