import { ClipboardList, Flame, ShieldCheck, Target, UtensilsCrossed } from 'lucide-react';
import { Badge } from '../../ui/badge';

interface NutritionPlanPayload {
  id: number;
  title: string;
  goal: string;
  bmi: string | null;
  estimated_daily_calories: string | null;
  plan_data: {
    breakfast: string[];
    lunch: string[];
    dinner: string[];
    snacks: string[];
  };
  advisory_note: string;
}

interface ChatNutritionPlanCardProps {
  plan: NutritionPlanPayload;
}

export function ChatNutritionPlanCard({ plan }: ChatNutritionPlanCardProps) {
  const meals = [
    { name: 'Breakfast', key: 'breakfast' as const, note: 'Energizing start to your day' },
    { name: 'Lunch', key: 'lunch' as const, note: 'Balanced midday nutrition' },
    { name: 'Dinner', key: 'dinner' as const, note: 'Nourishing evening meal' },
    { name: 'Snacks', key: 'snacks' as const, note: 'Healthy support between meals' },
  ];

  return (
    <div className="flex justify-start">
      <div className="max-w-3xl w-full">
        <div className="flex gap-3">
          <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0">
            <ClipboardList className="h-4 w-4 text-secondary" />
          </div>
          <div className="flex-1 space-y-4">
            <div className="bg-gradient-to-br from-purple-500/5 to-primary/5 border border-purple-500/10 rounded-2xl rounded-tl-sm shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-3 duration-300">
              {/* Header */}
              <div className="p-5 border-b border-border bg-card/50">
                <div className="flex items-center gap-2 mb-2">
                  <ClipboardList className="h-5 w-5 text-purple-500" />
                  <Badge variant="secondary" className="bg-purple-500/10 text-purple-600 dark:text-purple-400">
                    Mazaj+ Nutrition Plan
                  </Badge>
                </div>
                <h3 className="font-bold text-foreground text-lg leading-tight">{plan.title}</h3>
              </div>

              {/* Summary Metrics */}
              <div className="px-5 py-4 border-b border-border grid grid-cols-3 gap-3 bg-muted/10">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Flame className="h-3.5 w-3.5" />
                    <span className="text-[10px] font-medium uppercase tracking-wider">Calories</span>
                  </div>
                  <p className="text-sm font-bold text-foreground">
                    {plan.estimated_daily_calories ? `${Math.round(parseFloat(plan.estimated_daily_calories))} kcal` : '-'}
                  </p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Target className="h-3.5 w-3.5" />
                    <span className="text-[10px] font-medium uppercase tracking-wider">Goal</span>
                  </div>
                  <Badge variant="secondary" className="bg-secondary/15 text-secondary-foreground text-[10px] py-0 px-2">
                    {plan.goal}
                  </Badge>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span className="text-[10px] font-medium uppercase tracking-wider">Safety Status</span>
                  </div>
                  <Badge variant="outline" className="border-primary/30 text-primary text-[10px] py-0.5 px-2">
                    Safety checked based on your profile
                  </Badge>
                </div>
              </div>

              {/* Meals Grid */}
              <div className="p-5 space-y-4">
                {meals.map((meal) => {
                  const foods = plan.plan_data[meal.key] || [];
                  return (
                    <div key={meal.key} className="bg-card border border-border/60 rounded-xl p-4 hover:shadow-sm transition-shadow">
                      <div className="flex items-start gap-3 mb-2.5">
                        <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center flex-shrink-0">
                          <UtensilsCrossed className="h-4 w-4 text-primary/80" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground text-sm">{meal.name}</h4>
                          <p className="text-[10px] text-muted-foreground italic">{meal.note}</p>
                        </div>
                      </div>
                      <div className="pl-11">
                        {foods.length > 0 ? (
                          <ul className="space-y-1.5">
                            {foods.map((food, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-xs text-foreground/90">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary/70 flex-shrink-0 mt-1.5" />
                                <span>{food}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-xs text-muted-foreground italic">No options included</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Advisory disclaimer */}
              <div className="px-5 py-3.5 bg-orange-500/5 border-t border-orange-500/10 text-[10px] text-foreground/70 leading-relaxed">
                {plan.advisory_note}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
