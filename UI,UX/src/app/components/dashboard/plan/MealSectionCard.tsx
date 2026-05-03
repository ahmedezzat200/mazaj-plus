import { MealSection } from './PlanChatPage';
import { UtensilsCrossed } from 'lucide-react';

interface MealSectionCardProps {
  meal: MealSection;
}

export function MealSectionCard({ meal }: MealSectionCardProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
          <UtensilsCrossed className="h-4 w-4 text-primary" />
        </div>
        <div className="flex-1">
          <h5 className="font-semibold text-foreground mb-1">{meal.name}</h5>
          <p className="text-xs text-muted-foreground italic">{meal.note}</p>
        </div>
      </div>
      
      <ul className="space-y-1.5 ml-11">
        {meal.foods.map((food, index) => (
          <li key={index} className="flex items-center gap-2 text-sm text-foreground">
            <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0"></div>
            <span>{food}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
