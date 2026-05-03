import { Card, CardContent } from '../../ui/card';
import { Button } from '../../ui/button';
import { AlertCircle, RefreshCw, MessageSquare } from 'lucide-react';
import { Link } from 'react-router';

interface NoAlternativeCardProps {
  onTryDifferent: () => void;
}

export function NoAlternativeCard({ onTryDifferent }: NoAlternativeCardProps) {
  return (
    <Card className="bg-accent/10 border-accent/20">
      <CardContent className="p-6">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-accent" />
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-1">No Suitable Alternative Found</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We couldn't find a safe alternative for this food based on your current profile. 
              Try searching for a different food, or ask in chat for personalized guidance.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={onTryDifferent}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Try a Different Food
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link to="/dashboard/chat">
              <MessageSquare className="h-4 w-4 mr-2" />
              Ask in Chat
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
