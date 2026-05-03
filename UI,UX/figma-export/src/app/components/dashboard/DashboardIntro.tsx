import { MessageSquare } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Link } from 'react-router';

interface DashboardIntroProps {
  userName: string;
}

export function DashboardIntro({ userName }: DashboardIntroProps) {
  return (
    <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/10">
      <CardContent className="p-6 md:p-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-foreground mb-2">
              Your Nutrition Support Dashboard
            </h2>
            <p className="text-muted-foreground max-w-2xl">
              Get personalized nutrition guidance, track your progress, and discover healthier choices. 
              Start a conversation with our advisory chatbot to receive tailored support.
            </p>
          </div>
          <Button asChild size="lg" className="flex-shrink-0">
            <Link to="/dashboard/chat">
              <MessageSquare className="h-5 w-5 mr-2" />
              Start Chat
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
