import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { History, Calendar, Target } from 'lucide-react';
import { NutritionPlanData } from './NutritionPlansPage';
import { format } from 'date-fns';
import { Button } from '../../ui/button';

interface PlanHistoryPanelProps {
  history: NutritionPlanData[];
  currentPlanId: string;
  onSelectPlan: (planId: string) => void;
}

export function PlanHistoryPanel({ history, currentPlanId, onSelectPlan }: PlanHistoryPanelProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <History className="h-4 w-4 text-primary" />
          <CardTitle className="text-sm">Plan History</CardTitle>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          View and compare previous plans
        </p>
      </CardHeader>
      <CardContent className="space-y-2">
        {history.map((plan) => {
          const isCurrent = plan.id === currentPlanId;
          
          return (
            <button
              key={plan.id}
              onClick={() => onSelectPlan(plan.id)}
              className={`
                w-full text-left p-3 rounded-lg border transition-all
                ${isCurrent 
                  ? 'bg-primary/5 border-primary/20' 
                  : 'bg-card border-border hover:bg-muted/50'
                }
              `}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>{format(plan.generatedDate, 'MMM d, yyyy')}</span>
                </div>
                {isCurrent && (
                  <Badge variant="secondary" className="bg-primary/10 text-primary text-xs">
                    Viewing
                  </Badge>
                )}
              </div>
              
              <div className="space-y-1.5">
                <p className="text-sm font-medium text-foreground line-clamp-1">
                  {plan.title}
                </p>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Target className="h-3 w-3" />
                  <span>{plan.goal}</span>
                </div>
              </div>
            </button>
          );
        })}
      </CardContent>
    </Card>
  );
}
