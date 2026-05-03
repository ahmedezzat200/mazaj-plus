import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Lightbulb, Loader2 } from 'lucide-react';

interface DailyTipCardProps {
  tip?: { title: string; content: string } | null;
  isLoading?: boolean;
}

export function DailyTipCard({ tip, isLoading }: DailyTipCardProps) {
  return (
    <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Lightbulb className="h-5 w-5 text-accent" />
          {tip?.title ?? "Today's Nutrition Tip"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading tip…</span>
          </div>
        ) : tip ? (
          <p className="text-sm text-foreground leading-relaxed">{tip.content}</p>
        ) : (
          <p className="text-sm text-muted-foreground">No tip available today. Check back later.</p>
        )}
      </CardContent>
    </Card>
  );
}

