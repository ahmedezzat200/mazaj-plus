import { Leaf, Sparkles, ShieldCheck } from 'lucide-react';
import { NutritionPlan } from './PlanChatPage';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { MealSectionCard } from './MealSectionCard';

interface PlanResponseCardProps {
  content: string;
  plan: NutritionPlan;
  planActions: string[];
  onPlanAction: (action: string) => void;
  onNewPlan: () => void;
}

export function PlanResponseCard({ content, plan, planActions, onPlanAction, onNewPlan }: PlanResponseCardProps) {
  return (
    <div className="flex justify-start">
      <div className="w-full">
        <div className="flex gap-3">
          <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0">
            <Leaf className="h-4 w-4 text-secondary" />
          </div>
          <div className="flex-1 space-y-4">
            {/* Main plan card */}
            <div className="bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/10 rounded-2xl rounded-tl-sm shadow-md overflow-hidden">
              {/* Header */}
              <div className="px-6 py-4 bg-card/50 border-b border-primary/10">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <Badge variant="secondary" className="bg-primary/10 text-primary">
                    Mazaj+ Nutrition Plan
                  </Badge>
                  {plan.safetyValidated && (
                    <Badge variant="secondary" className="bg-secondary/20 text-secondary gap-1 ml-auto">
                      <ShieldCheck className="h-3 w-3" />
                      Safety Validated
                    </Badge>
                  )}
                </div>
                <p className="text-sm leading-relaxed text-foreground">{content}</p>
              </div>

              {/* Plan summary */}
              <div className="px-6 py-5 bg-card/30">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Daily Calorie Target</p>
                    <p className="text-2xl font-semibold text-foreground">{plan.dailyCalories}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Goal</p>
                    <Badge variant="secondary" className="bg-secondary/10 text-secondary-foreground mt-1">
                      {plan.goal}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Meal sections */}
              <div className="px-6 py-5 space-y-4">
                <h4 className="font-semibold text-foreground">Daily Meal Plan</h4>
                <div className="grid gap-4">
                  {plan.meals.map((meal, index) => (
                    <MealSectionCard key={index} meal={meal} />
                  ))}
                </div>
              </div>
            </div>
            
            {/* Action buttons */}
            {planActions.length > 0 && (
              <div className="space-y-2 pl-11">
                <p className="text-xs text-muted-foreground">What would you like to do?</p>
                <div className="flex flex-wrap gap-2">
                  {planActions.map((action) => (
                    <Button
                      key={action}
                      variant={action.includes('Start New') ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => {
                        if (action.includes('Start New')) {
                          onNewPlan();
                        } else {
                          onPlanAction(action);
                        }
                      }}
                      className="rounded-full"
                    >
                      {action}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
