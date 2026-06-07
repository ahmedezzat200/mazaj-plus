import { useMemo, type ReactNode } from 'react';
import { MessageSquare, Sun, Sunset, Moon } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Link } from 'react-router';

interface DashboardIntroProps {
  userName: string;
  tip?: { title: string; content: string } | null;
  tipLoading?: boolean;
}

function getGreeting(): { text: string; icon: ReactNode } {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) {
    return { text: 'Good morning', icon: <Sun className="h-5 w-5 text-yellow-500" /> };
  } else if (hour >= 12 && hour < 18) {
    return { text: 'Good afternoon', icon: <Sunset className="h-5 w-5 text-orange-400" /> };
  } else {
    return { text: 'Good evening', icon: <Moon className="h-5 w-5 text-indigo-400" /> };
  }
}

export function DashboardIntro({ userName, tip, tipLoading }: DashboardIntroProps) {
  const greeting = useMemo(() => getGreeting(), []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Greeting card */}
      <Card className="lg:col-span-2 bg-gradient-to-br from-primary/10 via-primary/5 to-secondary/10 border-primary/15 hover:shadow-md transition-shadow duration-200">
        <CardContent className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                {greeting.icon}
                <span className="text-sm font-medium text-muted-foreground">{greeting.text}</span>
              </div>
              <h2 className="text-2xl font-semibold text-foreground mb-2">
                {userName}!
              </h2>
              <p className="text-muted-foreground max-w-xl text-sm leading-relaxed">
                Get personalized nutrition guidance, track your progress, and discover healthier choices.
              </p>
            </div>
            <Button asChild size="lg" className="flex-shrink-0 shadow-sm hover:shadow-md transition-shadow">
              <Link to="/dashboard/chat">
                <MessageSquare className="h-5 w-5 mr-2" />
                Start Chat
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Daily tip card */}
      <Card className="bg-gradient-to-br from-accent/10 to-secondary/10 border-accent/20 hover:shadow-md transition-shadow duration-200">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-full bg-accent/20 flex items-center justify-center">
              <Sun className="h-4 w-4 text-accent" />
            </div>
            <span className="text-xs font-semibold text-accent uppercase tracking-wide">Daily Tip</span>
          </div>
          {tipLoading ? (
            <div className="space-y-2">
              <div className="h-3 bg-muted rounded animate-pulse w-3/4" />
              <div className="h-3 bg-muted rounded animate-pulse w-full" />
              <div className="h-3 bg-muted rounded animate-pulse w-2/3" />
            </div>
          ) : tip ? (
            <p className="text-sm text-foreground/80 leading-relaxed italic">
              "{tip.content}"
            </p>
          ) : (
            <p className="text-sm text-foreground/80 leading-relaxed italic">
              "Small, consistent steps lead to lasting wellness. Stay hydrated and listen to your body today."
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
