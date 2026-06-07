import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { motion } from 'motion/react';
import { Droplets, ScrollText, Lightbulb, Plus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { hydrationApi, plansApi, tipsApi } from '../../../lib/api';
import type { BackendNutritionPlan } from '../../../lib/api';

interface HydrationState {
  target_ml: number | null;
  today_total_ml: number;
  advisory_note?: string;
}

interface DailyTip {
  title?: string;
  content?: string;
}

const QUICK_LOG_AMOUNTS = [200, 250, 500];

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return iso;
  }
}

function goalLabel(goal: string) {
  return goal
    .toLowerCase()
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export function TrackingPage() {
  const [hydration, setHydration] = useState<HydrationState>({ target_ml: null, today_total_ml: 0 });
  const [hydrationLoading, setHydrationLoading] = useState(true);
  const [logging, setLogging] = useState(false);

  const [plans, setPlans] = useState<BackendNutritionPlan[]>([]);
  const [plansLoading, setPlansLoading] = useState(true);

  const [tip, setTip] = useState<DailyTip | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [hRes, pRes, tRes] = await Promise.all([
        hydrationApi.getTarget(),
        plansApi.list(),
        tipsApi.getDaily(),
      ]);
      if (cancelled) return;

      if (hRes.ok) {
        setHydration({
          target_ml: hRes.target_ml ?? null,
          today_total_ml: hRes.today_total_ml ?? 0,
          advisory_note: hRes.advisory_note,
        });
      }
      setHydrationLoading(false);

      if (pRes.ok) setPlans(pRes.plans.slice(0, 5));
      setPlansLoading(false);

      if (tRes.ok && tRes.tip && tRes.tip.title) setTip(tRes.tip);
    })();
    return () => { cancelled = true; };
  }, []);

  async function logWater(amount: number) {
    setLogging(true);
    const res = await hydrationApi.logWater(amount);
    setLogging(false);
    if (res.ok) {
      setHydration((prev) => ({
        ...prev,
        today_total_ml: res.today_total_ml ?? prev.today_total_ml + amount,
        target_ml: res.target_ml ?? prev.target_ml,
      }));
      toast.success(`Logged ${amount}ml`);
    } else {
      toast.error(res.error?.message ?? 'Could not log water.');
    }
  }

  const target = hydration.target_ml ?? 0;
  const total = hydration.today_total_ml ?? 0;
  const pct = target > 0 ? Math.min(100, Math.round((total / target) * 100)) : 0;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Daily Tracking</h1>
        <p className="text-muted-foreground mt-1">
          Stay on top of your hydration, recent plans, and today's nutrition tip — all in one place.
        </p>
      </div>

      <Card className="backdrop-blur-xl bg-white/60 dark:bg-white/5 border border-white/20 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Droplets className="h-5 w-5 text-cyan-500" />
            Hydration today
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {hydrationLoading ? (
            <div className="h-16 flex items-center text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin mr-2" /> Loading hydration…
            </div>
          ) : target === 0 ? (
            <p className="text-sm text-muted-foreground">
              Complete your profile so we can set a personalized hydration goal.
            </p>
          ) : (
            <>
              <div className="flex items-baseline justify-between">
                <p className="text-2xl font-semibold">{total}<span className="text-sm font-normal text-muted-foreground ml-1">ml</span></p>
                <p className="text-sm text-muted-foreground">Goal {target} ml · {pct}%</p>
              </div>
              <div className="h-3 rounded-full bg-muted overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ type: 'spring', stiffness: 80, damping: 20 }}
                />
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                {QUICK_LOG_AMOUNTS.map((amt) => (
                  <Button
                    key={amt}
                    variant="outline"
                    size="sm"
                    disabled={logging}
                    onClick={() => logWater(amt)}
                  >
                    <Plus className="h-3 w-3 mr-1" />{amt} ml
                  </Button>
                ))}
              </div>
              {hydration.advisory_note && (
                <p className="text-xs text-muted-foreground italic">{hydration.advisory_note}</p>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Card className="backdrop-blur-xl bg-white/60 dark:bg-white/5 border border-white/20 shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="flex items-center gap-2">
            <ScrollText className="h-5 w-5 text-primary" />
            Recent nutrition plans
          </CardTitle>
          <Button asChild size="sm" variant="outline">
            <Link to="/dashboard/plans">View all</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {plansLoading ? (
            <div className="h-16 flex items-center text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin mr-2" /> Loading plans…
            </div>
          ) : plans.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              No plans yet. <Link to="/dashboard/plans" className="text-primary underline-offset-2 hover:underline">Generate your first plan</Link>.
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {plans.map((p) => (
                <li key={p.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-medium truncate">{p.title}</p>
                    <p className="text-xs text-muted-foreground">{goalLabel(p.goal)} · {formatDate(p.created_at)}</p>
                  </div>
                  <Button asChild size="sm" variant="ghost">
                    <Link to="/dashboard/plans">Open</Link>
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {tip && tip.title && (
        <Card className="backdrop-blur-xl bg-gradient-to-br from-amber-500/10 via-card/60 to-card border border-amber-500/20 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-amber-500" />
              Today's tip
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium">{tip.title}</p>
            <p className="text-sm text-muted-foreground mt-1">{tip.content}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
