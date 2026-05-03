import { Leaf, Lock, ArrowRight } from 'lucide-react';
import { Button } from '../../ui/button';
import { Link } from 'react-router';

export function PlanLimitReachedCard() {
  return (
    <div className="flex justify-start">
      <div className="max-w-2xl w-full">
        <div className="flex gap-3">
          <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0">
            <Leaf className="h-4 w-4 text-secondary" />
          </div>
          <div className="flex-1">
            <div className="bg-accent/10 border border-accent/20 rounded-2xl rounded-tl-sm px-5 py-5 shadow-sm">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                  <Lock className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">Weekly Plan Limit Reached</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    You've reached your weekly nutrition plan limit for the Free tier. 
                    Upgrade to Pro or Ultra for unlimited plan generation and advanced features.
                  </p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-3">
                <Button asChild size="sm">
                  <Link to="/dashboard/subscription">
                    See Upgrade Options
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link to="/dashboard">
                    Return to Dashboard
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
