import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Lightbulb, Droplet, Target, Crown, MessageSquare } from 'lucide-react';
import { UserTier } from './DashboardLayout';
import { Progress } from '../ui/progress';

interface SummaryWidgetsProps {
  userTier: UserTier;
}

export function SummaryWidgets({ userTier }: SummaryWidgetsProps) {
  // Mock data - in real app this would come from API/state
  const hydrationProgress = 65; // percentage
  const bmi = 24.2;
  const goal = 'Balanced nutrition';

  return (
    <div>
      <h3 className="text-lg font-semibold text-foreground mb-4">Overview</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {/* Today's Nutrition Tip */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                <Lightbulb className="h-4 w-4 text-accent" />
              </div>
              <CardTitle className="text-sm">Today's Tip</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Include a variety of colorful vegetables in your meals for optimal nutrient intake.
            </p>
          </CardContent>
        </Card>

        {/* Hydration Progress */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-secondary/20 flex items-center justify-center">
                <Droplet className="h-4 w-4 text-secondary" />
              </div>
              <CardTitle className="text-sm">Hydration</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-semibold text-foreground">{hydrationProgress}%</span>
              <span className="text-xs text-muted-foreground">of daily goal</span>
            </div>
            <Progress value={hydrationProgress} className="h-2" />
            <p className="text-xs text-muted-foreground">1.6L / 2.5L consumed</p>
          </CardContent>
        </Card>

        {/* BMI & Goal */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Target className="h-4 w-4 text-primary" />
              </div>
              <CardTitle className="text-sm">BMI & Goal</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Current BMI</p>
              <p className="text-2xl font-semibold text-foreground">{bmi}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Goal</p>
              <Badge variant="secondary" className="bg-secondary/10 text-secondary-foreground">
                {goal}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Current Tier */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Crown className="h-4 w-4 text-primary" />
              </div>
              <CardTitle className="text-sm">Current Tier</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <Badge 
              variant="secondary" 
              className={
                userTier === 'Ultra' 
                  ? 'bg-primary text-primary-foreground'
                  : userTier === 'Pro'
                  ? 'bg-secondary text-secondary-foreground'
                  : 'bg-muted text-muted-foreground'
              }
            >
              {userTier}
            </Badge>
            <p className="text-xs text-muted-foreground">
              {userTier === 'Free' && 'Core features available'}
              {userTier === 'Pro' && 'Enhanced features unlocked'}
              {userTier === 'Ultra' && 'Full access enabled'}
            </p>
          </CardContent>
        </Card>

        {/* Recent Guidance */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-secondary/20 flex items-center justify-center">
                <MessageSquare className="h-4 w-4 text-secondary" />
              </div>
              <CardTitle className="text-sm">Last Chat</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              No recent guidance yet. Start a chat to receive personalized support.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
