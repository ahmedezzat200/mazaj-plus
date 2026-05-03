import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Lightbulb } from 'lucide-react';

export function DailyTipCard() {
  // Mock daily tip - in real app this would rotate daily
  const dailyTip = {
    title: "Today's Nutrition Tip",
    content: "Start your day with a glass of water before your morning coffee. This helps rehydrate your body after sleep and supports better digestion throughout the day.",
  };

  return (
    <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Lightbulb className="h-5 w-5 text-accent" />
          {dailyTip.title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-foreground leading-relaxed">
          {dailyTip.content}
        </p>
      </CardContent>
    </Card>
  );
}
