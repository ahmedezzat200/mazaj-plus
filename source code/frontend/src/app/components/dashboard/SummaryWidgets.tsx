import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Droplet, Target, Crown, MessageSquare, Loader2 } from 'lucide-react';
import { UserTier } from './DashboardLayout';
import { Progress } from '../ui/progress';
import { hydrationApi, profileApi } from '../../../lib/api';

interface SummaryWidgetsProps {
  userTier: UserTier;
}

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
};

export function SummaryWidgets({ userTier }: SummaryWidgetsProps) {
  const [loading, setLoading] = useState(true);
  const [hydration, setHydration] = useState<{ current: number; target: number } | null>(null);
  const [goal, setGoal] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [hydroRes, profileRes] = await Promise.all([
          hydrationApi.getTarget(),
          profileApi.getMe()
        ]);

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

  const tierConfig = {
    Free: { bg: 'from-muted/50 to-muted/30', badge: 'bg-muted text-muted-foreground', label: 'Core features available' },
    Pro: { bg: 'from-secondary/20 to-secondary/10', badge: 'bg-secondary text-secondary-foreground', label: 'Enhanced features unlocked' },
    Ultra: { bg: 'from-primary/20 to-primary/10', badge: 'bg-primary text-primary-foreground', label: 'Full access enabled' },
  };

  const tc = tierConfig[userTier];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <h3 className="text-lg font-semibold text-foreground mb-4">Overview</h3>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >

        {/* Hydration Progress */}
        <motion.div variants={itemVariants}>
        <Card className="group bg-gradient-to-br from-blue-500/10 to-cyan-500/5 border-blue-200/30 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 min-h-[160px]">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-500/15 flex items-center justify-center group-hover:bg-blue-500/25 transition-colors">
                <Droplet className="h-4 w-4 text-blue-500" />
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
                Log water intake in the Alternatives section to see progress.
              </p>
            )}
          </CardContent>
        </Card>
        </motion.div>

        {/* Wellness Goal */}
        <motion.div variants={itemVariants}>
        <Card className="group bg-gradient-to-br from-primary/10 to-primary/5 border-primary/15 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 min-h-[160px]">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center group-hover:bg-primary/25 transition-colors">
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
                  <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
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
        </motion.div>

        {/* Current Tier */}
        <motion.div variants={itemVariants}>
        <Card className={`group bg-gradient-to-br ${tc.bg} hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 min-h-[160px]`}>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center group-hover:bg-primary/25 transition-colors">
                <Crown className="h-4 w-4 text-primary" />
              </div>
              <CardTitle className="text-sm">Current Tier</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <Badge variant="secondary" className={tc.badge}>
              {userTier}
            </Badge>
            <p className="text-xs text-muted-foreground">{tc.label}</p>
          </CardContent>
        </Card>
        </motion.div>

        {/* Recent Guidance */}
        <motion.div variants={itemVariants}>
        <Card className="group bg-gradient-to-br from-secondary/10 to-secondary/5 border-secondary/15 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 min-h-[160px]">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-secondary/20 flex items-center justify-center group-hover:bg-secondary/30 transition-colors">
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
        </motion.div>
      </motion.div>
    </div>
  );
}
