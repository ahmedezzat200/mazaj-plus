import { ShieldCheck } from 'lucide-react';
import { BackendFoodItem } from '../../../../lib/api';
import { Badge } from '../../ui/badge';

interface FoodCardProps {
  food: BackendFoodItem;
}

export function FoodCard({ food }: FoodCardProps) {
  const mealLabel = food.meal
    ? `${food.meal.charAt(0).toUpperCase()}${food.meal.slice(1)} swap`
    : null;

  return (
    <div className="bg-card border border-border rounded-xl p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="min-w-0">
          <h4 className="font-semibold text-foreground">{food.name}</h4>
          {mealLabel && (
            <Badge variant="outline" className="mt-1 border-primary/20 text-primary text-[10px]">
              {mealLabel}
            </Badge>
          )}
        </div>
        <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex-shrink-0 gap-1 whitespace-nowrap">
          <ShieldCheck className="h-3 w-3" />
          <span className="text-xs">Looks suitable</span>
        </Badge>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed mb-3">{food.reason}</p>

      {/* Nutrition guide per 100g */}
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
        Nutrition guide per 100g
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        <div className="rounded-lg border border-border bg-background/50 px-3 py-2 text-center">
          <p className="text-muted-foreground">Calories</p>
          <p className="font-semibold text-foreground">{Math.round(parseFloat(String(food.calories)))} <span className="font-normal text-muted-foreground">kcal</span></p>
        </div>
        <div className="rounded-lg border border-border bg-background/50 px-3 py-2 text-center">
          <p className="text-muted-foreground">Protein</p>
          <p className="font-semibold text-foreground">{parseFloat(String(food.protein_g ?? 0)).toFixed(1)} <span className="font-normal text-muted-foreground">g</span></p>
        </div>
        <div className="rounded-lg border border-border bg-background/50 px-3 py-2 text-center">
          <p className="text-muted-foreground">Carbohydrates</p>
          <p className="font-semibold text-foreground">{parseFloat(String(food.carbs_g ?? 0)).toFixed(1)} <span className="font-normal text-muted-foreground">g</span></p>
        </div>
        <div className="rounded-lg border border-border bg-background/50 px-3 py-2 text-center">
          <p className="text-muted-foreground">Fat</p>
          <p className="font-semibold text-foreground">{parseFloat(String(food.fat_g ?? 0)).toFixed(1)} <span className="font-normal text-muted-foreground">g</span></p>
        </div>
      </div>
    </div>
  );
}
