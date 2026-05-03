import { ShieldCheck } from 'lucide-react';
import { BackendFoodItem } from '../../../../lib/api';
import { Badge } from '../../ui/badge';

interface FoodCardProps {
  food: BackendFoodItem;
}

export function FoodCard({ food }: FoodCardProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3 mb-2">
        <h4 className="font-semibold text-foreground">{food.name}</h4>
        <Badge variant="secondary" className="bg-secondary/20 text-secondary flex-shrink-0 gap-1">
          <ShieldCheck className="h-3 w-3" />
          <span className="text-xs">Safety Validated</span>
        </Badge>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed mb-3">{food.reason}</p>
      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
        <span>Cal: <strong className="text-foreground">{food.calories}</strong></span>
        <span>Protein: <strong className="text-foreground">{food.protein_g}g</strong></span>
        <span>Carbs: <strong className="text-foreground">{food.carbs_g}g</strong></span>
        <span>Fat: <strong className="text-foreground">{food.fat_g}g</strong></span>
      </div>
    </div>
  );
}

