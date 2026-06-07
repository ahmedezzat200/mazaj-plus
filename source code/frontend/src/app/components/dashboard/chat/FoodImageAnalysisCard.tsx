import { Camera, Sparkles } from 'lucide-react';
import { BackendFoodItem } from '../../../../lib/api';
import { FoodCard } from './FoodCard';
import { Badge } from '../../ui/badge';

interface FoodImageAnalysisCardProps {
  content: string;
  foods: BackendFoodItem[];
}

export function FoodImageAnalysisCard({ content, foods }: FoodImageAnalysisCardProps) {
  return (
    <div className="flex justify-start animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="max-w-3xl w-full">
        <div className="flex gap-3">
          <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center flex-shrink-0">
            <Camera className="h-4 w-4 text-orange-500" />
          </div>
          <div className="flex-1 space-y-4">
            <div className="bg-gradient-to-br from-orange-500/5 to-amber-500/5 border border-orange-500/10 rounded-2xl rounded-tl-sm px-5 py-4 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-5 w-5 text-orange-500" />
                <Badge variant="secondary" className="bg-orange-500/10 text-orange-600 dark:text-orange-400">
                  Food Image Analysis
                </Badge>
              </div>
              <p className="text-sm leading-relaxed text-foreground mb-4">{content}</p>

              {foods.length > 0 ? (
                <div className="grid gap-3">
                  {foods.map((food, index) => (
                    <FoodCard key={index} food={food} />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  I could not find enough trusted nutrition details for this item yet.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
