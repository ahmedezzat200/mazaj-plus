import { Card, CardContent } from '../../ui/card';
import { Button } from '../../ui/button';
import { Lock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router';

export function AlternativeLimitCard() {
  return (
    <Card className="bg-accent/10 border-accent/20">
      <CardContent className="p-6">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
            <Lock className="h-5 w-5 text-accent" />
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-1">Daily Alternative Limit Reached</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              You've reached your daily limit for healthy alternative searches on the Free tier. 
              Upgrade to Pro or Ultra for unlimited searches and more features.
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
      </CardContent>
    </Card>
  );
}
