import { Card, CardContent } from '../../ui/card';
import { Button } from '../../ui/button';
import { Database, RefreshCw, LayoutDashboard } from 'lucide-react';
import { Link } from 'react-router';

interface NoDatabaseMatchCardProps {
  onAnalyzeAnother: () => void;
}

export function NoDatabaseMatchCard({ onAnalyzeAnother }: NoDatabaseMatchCardProps) {
  return (
    <Card className="bg-accent/10 border-accent/20">
      <CardContent className="p-8">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-accent/20 flex items-center justify-center">
            <Database className="h-8 w-8 text-accent" />
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-foreground">
              Nutrition Data Not Available
            </h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Nutritional data is not currently available for this food in the Mazaj+ database. 
              We're constantly expanding our food database.
            </p>
          </div>

          <div className="bg-card rounded-lg p-4 border border-border max-w-md mx-auto">
            <p className="text-xs text-muted-foreground leading-relaxed">
              You can try analyzing a different food, or use our chat guidance feature to get 
              personalized nutrition advice for this food item.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 justify-center">
            <Button onClick={onAnalyzeAnother} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Analyze Another Image
            </Button>
            <Button asChild variant="outline" className="gap-2">
              <Link to="/dashboard">
                <LayoutDashboard className="h-4 w-4" />
                Return to Dashboard
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
