import { useState, useEffect } from 'react';
import { useOutletContext, Link } from 'react-router';
import { UserData } from '../DashboardLayout';
import { NutritionPlansEmpty } from './NutritionPlansEmpty';
import { PlanCard } from './PlanCard';
import { PlanHistoryPanel } from './PlanHistoryPanel';
import { PlanSupportCards } from './PlanSupportCards';
import { DashboardAdvisoryBanner } from '../DashboardAdvisoryBanner';
import { Button } from '../../ui/button';
import { Plus, Loader2 } from 'lucide-react';
import { plansApi, BackendNutritionPlan } from '../../../../lib/api';

export interface NutritionPlanData {
  id: string;
  title: string;
  generatedDate: Date;
  status: 'current' | 'saved';
  bmi: number | null;
  dailyCalories: number | null;
  goal: string;
  inBodyApplied: boolean;
  safetyValidated: boolean;
  advisory_note: string;
  meals: {
    name: string;
    foods: string[];
    note: string;
  }[];
}

/** Map a backend NutritionPlan into the UI NutritionPlanData shape. */
function mapPlan(p: BackendNutritionPlan, index: number): NutritionPlanData {
  const pd = p.plan_data ?? { breakfast: [], lunch: [], dinner: [], snacks: [] };
  return {
    id: String(p.id),
    title: p.title,
    generatedDate: new Date(p.created_at),
    status: index === 0 ? 'current' : 'saved',
    bmi: p.bmi != null ? parseFloat(p.bmi) : null,
    dailyCalories: p.estimated_daily_calories != null ? parseFloat(p.estimated_daily_calories) : null,
    goal: p.goal,
    inBodyApplied: false,
    safetyValidated: true,
    advisory_note: p.advisory_note,
    meals: [
      { name: 'Breakfast', foods: pd.breakfast, note: '' },
      { name: 'Lunch',     foods: pd.lunch,      note: '' },
      { name: 'Dinner',    foods: pd.dinner,      note: '' },
      { name: 'Snacks',    foods: pd.snacks,      note: '' },
    ],
  };
}

export function NutritionPlansPage() {
  const { userData } = useOutletContext<{ userData: UserData }>();

  const [plans, setPlans] = useState<NutritionPlanData[]>([]);
  const [currentPlan, setCurrentPlan] = useState<NutritionPlanData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [pageError, setPageError] = useState<string | null>(null);

  // Load plan list on mount
  useEffect(() => {
    plansApi.list().then((result) => {
      if (result.ok && result.plans) {
        const mapped = result.plans.map(mapPlan);
        setPlans(mapped);
        setCurrentPlan(mapped[0] ?? null);
      } else if (result.status === 401) {
        setPageError('Your session has expired. Please log in again.');
      } else if (result.status === 403) {
        setPageError(result.error?.message ?? 'Access denied.');
      } else if (!result.ok) {
        setPageError(result.error?.message ?? 'Failed to load plans.');
      }
    }).catch(() => {
      setPageError('Unable to reach the server. Please check your connection.');
    }).finally(() => {
      setIsLoading(false);
    });
  }, []);

  const handleGenerate = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    setPageError(null);

    const result = await plansApi.generate('My basic nutrition plan').catch(() => null);

    if (!result) {
      setPageError('Unable to reach the server. Please check your connection.');
      setIsGenerating(false);
      return;
    }

    if (result.ok && result.plan) {
      const newPlan = mapPlan(result.plan, 0);
      // Prepend; mark older plans as saved
      setPlans((prev) => [newPlan, ...prev.map((p) => ({ ...p, status: 'saved' as const }))]);
      setCurrentPlan(newPlan);
    } else {
      const code = result.error?.code ?? 'UNKNOWN';
      const msg = result.error?.message ?? 'An unexpected error occurred.';
      if (result.status === 401) {
        setPageError('Your session has expired. Please log in again.');
      } else if (result.status === 403 && code === 'USAGE_LIMIT_EXCEEDED') {
        setPageError('You have reached your weekly nutrition plan limit for the Free tier. Upgrade to generate more plans.');
      } else if (result.status === 403) {
        setPageError(msg);
      } else if (result.status === 409) {
        setPageError('A duplicate request was detected. Please try again.');
      } else {
        setPageError(msg);
      }
    }

    setIsGenerating(false);
  };

  const hasPlan = currentPlan !== null;

  return (
    <div className="min-h-full bg-background">
      {/* Advisory banner */}
      <div className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-4">
          <DashboardAdvisoryBanner />
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8">

        {/* Inline error notice */}
        {pageError && (
          <div className="mb-6 px-4 py-3 rounded-xl bg-destructive/10 border border-destructive/20 text-sm text-destructive">
            {pageError}
          </div>
        )}

        {/* Loading state */}
        {isLoading ? (
          <div className="flex items-center justify-center min-h-[40vh] gap-3 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading your nutrition plans…</span>
          </div>
        ) : !hasPlan ? (
          <NutritionPlansEmpty onGenerate={handleGenerate} isGenerating={isGenerating} />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main plan area */}
            <div className="lg:col-span-2 space-y-6">
              {/* Generate new plan button when plans exist */}
              <div className="flex justify-end">
                <Button
                  size="sm"
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  variant="outline"
                >
                  {isGenerating ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Generating…</>
                  ) : (
                    <><Plus className="h-4 w-4 mr-2" />Generate New Plan</>
                  )}
                </Button>
              </div>

              <PlanCard plan={currentPlan} />
            </div>

            {/* Right sidebar */}
            <div className="space-y-6">
              <PlanSupportCards userData={userData} plan={currentPlan} />

              {/* Plan History (Ultra only) or Upgrade teaser */}
              {userData.tier === 'Ultra' ? (
                <PlanHistoryPanel
                  history={plans}
                  currentPlanId={currentPlan.id}
                  onSelectPlan={(planId) => {
                    const selected = plans.find((p) => p.id === planId);
                    if (selected) setCurrentPlan(selected);
                  }}
                />
              ) : (
                <div className="bg-accent/10 border border-accent/20 rounded-xl p-5">
                  <h4 className="font-semibold text-foreground mb-2">Full Plan History</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Access unlimited plan history and compare previous plans with Ultra tier.
                  </p>
                  <Button asChild size="sm" variant="outline" className="w-full">
                    <Link to="/dashboard/subscription">
                      See Upgrade Options
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

