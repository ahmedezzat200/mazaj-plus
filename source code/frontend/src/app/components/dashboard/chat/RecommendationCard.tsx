import { Leaf, Sparkles } from 'lucide-react';
import { BackendFoodItem } from '../../../../lib/api';
import { FoodCard } from './FoodCard';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';

interface RecommendationCardProps {
  content: string;
  foods: BackendFoodItem[];
  warnings: never[]; // Kept for type compat — always empty now
  suggestions: string[];
  onSuggestion: (suggestion: string) => void;
}

export function RecommendationCard({ content, foods, suggestions, onSuggestion }: RecommendationCardProps) {
  return (
    <div className="flex justify-start">
      <div className="max-w-3xl w-full">
        <div className="flex gap-3">
          <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0">
            <Leaf className="h-4 w-4 text-secondary" />
          </div>
          <div className="flex-1 space-y-4">
            {/* Main recommendation card */}
            <div className="bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/10 rounded-2xl rounded-tl-sm px-5 py-4 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-5 w-5 text-primary" />
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  Mazaj+ Recommendation
                </Badge>
              </div>
              <p className="text-sm leading-relaxed text-foreground mb-4">{content}</p>

              {/* Food recommendation cards */}
              {foods.length > 0 ? (
                <div className="grid gap-3">
                  {foods.map((food, index) => (
                    <FoodCard key={index} food={food} />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  No food recommendations available for this request.
                </p>
              )}

              {/* No warnings section — unsafe foods are already excluded by backend */}
            </div>

            {/* Suggestion chips */}
            {(suggestions.length > 0 || foods.length > 0) && (
              <div className="space-y-2 pl-11">
                <p className="text-xs text-muted-foreground">What would you like to do next?</p>
                <div className="flex flex-wrap gap-2">
                  {foods.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onSuggestion('Give me another food')}
                      className="rounded-full hover:bg-primary/5 hover:border-primary/20"
                    >
                      More options
                    </Button>
                  )}
                  {suggestions.map((suggestion) => (
                    <Button
                      key={suggestion}
                      variant="outline"
                      size="sm"
                      onClick={() => onSuggestion(suggestion)}
                      className="rounded-full hover:bg-primary/5 hover:border-primary/20"
                    >
                      {suggestion}
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
