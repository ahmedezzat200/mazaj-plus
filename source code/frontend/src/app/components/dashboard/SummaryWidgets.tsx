import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Lightbulb, Droplet, Target, Crown, MessageSquare, Loader2 } from 'lucide-react';
import { UserTier } from './DashboardLayout';
import { Progress } from '../ui/progress';
import { tipsApi, hydrationApi, profileApi } from '../../../lib/api';

interface SummaryWidgetsProps {
  userTier: UserTier;
}

export function SummaryWidgets({ userTier }: SummaryWidgetsProps) {
  const [loading, setLoading] = useState(true);
  const [tip, setTip] = useState<{ title: string; content: string } | null>(null);
  const [hydration, setHydration] = useState<{ current: number; target: number } | null>(null);
  const [goal, setGoal] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [tipRes, hydroRes, profileRes] = await Promise.all([
          tipsApi.getDaily(),
          hydrationApi.getTarget(),
          profileApi.getMe()
        ]);

        if (tipRes.ok && tipRes.tip) {
          setTip(tipRes.tip);
        }

        if (hydroRes.ok) {
          setHydration({
            current: hydroRes.today_total_ml || 0,
            target: hydroRes.target_ml || 2500
          });
        }

        if (profileRes.ok && profileRes.profile) {
          setGoal(profileRes.profile.nutrition_goal || 'Not set');
        }
      } catch (error) {
        console.error('Error fetching dashboard summary:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const hydrationPercent = hydration 
    ? Math.min(Math.round((hydration.current / hydration.target) * 100), 100) 
    : 0;

  return (
    <div>
      <h3 className="text-lg font-semibold text-foreground mb-4">Overview</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {/* Today's Nutrition Tip */}
        <Card className="hover:shadow-md transition-shadow min-h-[160px]">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                <Lightbulb className="h-4 w-4 text-accent" />
              </div>
              <CardTitle className="text-sm">Today's Tip</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" />
                <span className="text-xs">Loading...</span>
              </div>
            ) : tip ? (
              <p className="text-sm text-muted-foreground leading-relaxed italic">
                "{tip.content}"
              </p>
            ) : (
              <p className="text-sm text-muted-foreground leading-relaxed italic">
                "Stay mindful of your nutrition choices today."
              </p>
            )}
          </CardContent>
        </Card>

        {/* Hydration Progress */}
        <Card className="hover:shadow-md transition-shadow min-h-[160px]">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-secondary/20 flex items-center justify-center">
                <Droplet className="h-4 w-4 text-secondary" />
              </div>
              <CardTitle className="text-sm">Hydration</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {loading ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" />
                <span className="text-xs">Loading...</span>
              </div>
            ) : hydration ? (
              <>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-semibold text-foreground">{hydrationPercent}%</span>
                  <span className="text-xs text-muted-foreground">of daily goal</span>
                </div>
                <Progress value={hydrationPercent} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  {(hydration.current / 1000).toFixed(1)}L / {(hydration.target / 1000).toFixed(1)}L consumed
                </p>
              </>
            ) : (
              <p className="text-xs text-muted-foreground py-2">
                Log your water intake in the Alternatives section to see progress.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Wellness Goal */}
        <Card className="hover:shadow-md transition-shadow min-h-[160px]">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Target className="h-4 w-4 text-primary" />
              </div>
              <CardTitle className="text-sm">Wellness Goal</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {loading ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" />
                <span className="text-xs">Loading...</span>
              </div>
            ) : (
              <>
                <p className="text-xs text-muted-foreground mb-1">Your Focus</p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="bg-primary/10 text-primary-foreground border-primary/20">
                    {goal || 'Complete profile'}
                  </Badge>
                </div>
                <p className="text-[10px] text-muted-foreground leading-tight mt-2 italic">
                  Goals can be updated in your profile settings.
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Current Tier */}
        <Card className="hover:shadow-md transition-shadow min-h-[160px]">
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
        <Card className="hover:shadow-md transition-shadow min-h-[160px]">
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
