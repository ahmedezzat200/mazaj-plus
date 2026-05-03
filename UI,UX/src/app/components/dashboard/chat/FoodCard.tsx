import { ShieldCheck } from 'lucide-react';
import { FoodRecommendation } from './ChatPage';
import { Badge } from '../../ui/badge';

interface FoodCardProps {
  food: FoodRecommendation;
}

export function FoodCard({ food }: FoodCardProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3 mb-2">
        <h4 className="font-semibold text-foreground">{food.name}</h4>
        {food.safetyValidated && (
          <Badge variant="secondary" className="bg-secondary/20 text-secondary flex-shrink-0 gap-1">
            <ShieldCheck className="h-3 w-3" />
            <span className="text-xs">Safety Validated</span>
          </Badge>
        )}
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">{food.explanation}</p>
    </div>
  );
}
