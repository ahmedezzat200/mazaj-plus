import { Leaf, HelpCircle, RotateCcw, UtensilsCrossed } from 'lucide-react';
import { Button } from '../../ui/button';
import { Link } from 'react-router';

interface AmbiguousFallbackCardProps {
  onNewChat: () => void;
}

export function AmbiguousFallbackCard({ onNewChat }: AmbiguousFallbackCardProps) {
  return (
    <div className="flex justify-start">
      <div className="max-w-2xl w-full">
        <div className="flex gap-3">
          <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0">
            <Leaf className="h-4 w-4 text-secondary" />
          </div>
          <div className="flex-1">
            <div className="bg-card border border-border rounded-2xl rounded-tl-sm px-5 py-5 shadow-sm">
              <div className="flex items-start gap-3 mb-4">
                <HelpCircle className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-foreground mb-1">Let's Try a Different Approach</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    I'm having trouble understanding your request clearly. 
                    Let's start fresh, or you can explore our other nutrition tools.
                  </p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-3">
                <Button onClick={onNewChat} size="sm">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Start a New Question
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link to="/dashboard/nutrition-plans">
                    <UtensilsCrossed className="h-4 w-4 mr-2" />
                    Create a Nutrition Plan Instead
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
