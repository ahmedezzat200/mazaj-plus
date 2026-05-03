import { UtensilsCrossed } from 'lucide-react';

interface PlanMealSectionProps {
  meal: {
    name: string;
    foods: string[];
    note: string;
  };
}

export function PlanMealSection({ meal }: PlanMealSectionProps) {
  return (
    <div className="bg-muted/20 border border-border rounded-xl p-5 hover:shadow-sm transition-shadow">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
          <UtensilsCrossed className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-foreground mb-1">{meal.name}</h4>
          <p className="text-xs text-muted-foreground italic">{meal.note}</p>
        </div>
      </div>
      
      <div className="ml-13">
        <ul className="space-y-2">
          {meal.foods.map((food, index) => (
            <li key={index} className="flex items-start gap-2.5 text-sm text-foreground">
              <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0 mt-1.5"></div>
              <span className="leading-relaxed">{food}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
