import { Sparkles, Leaf } from 'lucide-react';
import { BackendFoodItem } from '../../../../lib/api';
import { FoodCard } from './FoodCard';
import { Badge } from '../../ui/badge';
import { format } from 'date-fns';

interface UploadResultCardProps {
  content: string;
  timestamp: Date;
  foods: BackendFoodItem[];
}

export function UploadResultCard({ content, timestamp, foods }: UploadResultCardProps) {
  return (
    <div className="flex justify-start">
      <div className="max-w-3xl w-full">
        <div className="flex gap-3">
          <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0">
            <Leaf className="h-4 w-4 text-secondary" />
          </div>
          <div className="flex-1 space-y-4">
            <div className="bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/10 rounded-2xl rounded-tl-sm px-5 py-4 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-5 w-5 text-primary" />
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  Food Image Analysis
                </Badge>
              </div>
              <p className="text-sm leading-relaxed text-foreground mb-4">{content}</p>

              {foods.length > 0 && (
                <div className="grid gap-3">
                  {foods.map((food, index) => (
                    <FoodCard key={index} food={food} />
                  ))}
                </div>
              )}
              
              <div className="mt-4 pt-3 border-t border-primary/10">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">
                  Data Source: Mazaj+ Verified Database
                </p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {format(timestamp, 'h:mm a')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
