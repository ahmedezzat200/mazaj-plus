import { Card, CardContent } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { ShieldCheck, ArrowRight, MessageSquare, RefreshCw } from 'lucide-react';
import { AlternativeResult } from './AlternativesPage';
import { Link } from 'react-router';

interface AlternativeResultCardProps {
  result: AlternativeResult;
  onTryAnother: () => void;
}

export function AlternativeResultCard({ result, onTryAnother }: AlternativeResultCardProps) {
  return (
    <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              Suggested Alternative
            </Badge>
          </div>
          {result.safetyValidated && (
            <Badge variant="secondary" className="bg-secondary/20 text-secondary gap-1">
              <ShieldCheck className="h-3 w-3" />
              Safety Validated
            </Badge>
          )}
        </div>

        {/* Alternative comparison */}
        <div className="bg-card rounded-xl p-5 mb-4 border border-border">
          <div className="flex items-center gap-4">
            <div className="flex-1 space-y-1">
              <p className="text-xs text-muted-foreground">Original</p>
              <p className="font-semibold text-foreground">{result.originalFood}</p>
            </div>
            
            <ArrowRight className="h-5 w-5 text-primary flex-shrink-0" />
            
            <div className="flex-1 space-y-1">
              <p className="text-xs text-muted-foreground">Better Choice</p>
              <p className="font-semibold text-primary">{result.alternativeFood}</p>
            </div>
          </div>
        </div>

        {/* Reason */}
        <div className="bg-card rounded-xl p-4 mb-4 border border-border">
          <p className="text-xs text-muted-foreground mb-1">Why this alternative?</p>
          <p className="text-sm text-foreground leading-relaxed">{result.reason}</p>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm">
            <Link to="/dashboard/chat">
              <MessageSquare className="h-4 w-4 mr-2" />
              Ask in Chat
            </Link>
          </Button>
          <Button variant="outline" size="sm" onClick={onTryAnother}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Another Food
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
