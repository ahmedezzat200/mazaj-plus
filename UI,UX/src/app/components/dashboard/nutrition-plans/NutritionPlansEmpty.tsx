import { UtensilsCrossed, Plus } from 'lucide-react';
import { Button } from '../../ui/button';
import { Link } from 'react-router';

export function NutritionPlansEmpty() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Icon */}
        <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
          <UtensilsCrossed className="h-10 w-10 text-primary/40" />
        </div>

        {/* Heading */}
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-foreground">No Nutrition Plan Yet</h2>
          <p className="text-muted-foreground">
            Generate your first personalized nutrition plan based on your health profile, 
            goals, and dietary preferences.
          </p>
        </div>

        {/* CTA */}
        <Button asChild size="lg">
          <Link to="/dashboard/nutrition-plans">
            <Plus className="h-5 w-5 mr-2" />
            Generate New Plan
          </Link>
        </Button>
      </div>
    </div>
  );
}
