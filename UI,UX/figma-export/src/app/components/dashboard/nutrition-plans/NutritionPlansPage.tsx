import { useState } from 'react';
import { useOutletContext, Link } from 'react-router';
import { UserData } from '../DashboardLayout';
import { NutritionPlansEmpty } from './NutritionPlansEmpty';
import { PlanCard } from './PlanCard';
import { PlanHistoryPanel } from './PlanHistoryPanel';
import { PlanSupportCards } from './PlanSupportCards';
import { DashboardAdvisoryBanner } from '../DashboardAdvisoryBanner';
import { Button } from '../../ui/button';
import { Plus } from 'lucide-react';

export interface NutritionPlanData {
  id: string;
  title: string;
  generatedDate: Date;
  status: 'current' | 'saved';
  bmi: number;
  dailyCalories: number;
  goal: string;
  inBodyApplied: boolean;
  safetyValidated: boolean;
  meals: {
    name: string;
    foods: string[];
    note: string;
  }[];
}

export function NutritionPlansPage() {
  const { userData } = useOutletContext<{ userData: UserData }>();
  
  // Mock data - in real app this would come from API
  const [currentPlan, setCurrentPlan] = useState<NutritionPlanData | null>(mockCurrentPlan);
  const [planHistory] = useState<NutritionPlanData[]>(mockPlanHistory);

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
        {!hasPlan ? (
          <NutritionPlansEmpty />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main plan area */}
            <div className="lg:col-span-2 space-y-6">
              <PlanCard plan={currentPlan} />
            </div>

            {/* Right sidebar */}
            <div className="space-y-6">
              <PlanSupportCards userData={userData} plan={currentPlan} />
              
              {/* Plan History (Ultra only) or Upgrade teaser */}
              {userData.tier === 'Ultra' ? (
                <PlanHistoryPanel 
                  history={planHistory} 
                  currentPlanId={currentPlan.id}
                  onSelectPlan={(planId) => {
                    const selectedPlan = planHistory.find(p => p.id === planId);
                    if (selectedPlan) setCurrentPlan(selectedPlan);
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

// Mock data
const mockCurrentPlan: NutritionPlanData = {
  id: '1',
  title: 'Balanced Nutrition & Maintenance Plan',
  generatedDate: new Date('2026-04-18'),
  status: 'current',
  bmi: 24.2,
  dailyCalories: 1800,
  goal: 'Balanced nutrition and maintenance',
  inBodyApplied: false,
  safetyValidated: true,
  meals: [
    {
      name: 'Breakfast',
      foods: ['Greek yogurt with berries', 'Whole grain toast with avocado', 'Green tea'],
      note: 'High protein start with healthy fats and fiber',
    },
    {
      name: 'Lunch',
      foods: ['Grilled salmon salad', 'Quinoa bowl', 'Olive oil dressing', 'Fresh fruit'],
      note: 'Omega-3 rich with complex carbohydrates',
    },
    {
      name: 'Dinner',
      foods: ['Lean chicken breast', 'Roasted vegetables', 'Brown rice', 'Herbal tea'],
      note: 'Lean protein with nutrient-dense vegetables',
    },
    {
      name: 'Snacks',
      foods: ['Handful of almonds', 'Apple slices', 'Carrot sticks with hummus'],
      note: 'Balanced snacks to maintain energy levels',
    },
  ],
};

const mockPlanHistory: NutritionPlanData[] = [
  mockCurrentPlan,
  {
    id: '2',
    title: 'Weight Loss Focused Plan',
    generatedDate: new Date('2026-04-10'),
    status: 'saved',
    bmi: 24.8,
    dailyCalories: 1600,
    goal: 'Weight loss',
    inBodyApplied: false,
    safetyValidated: true,
    meals: [
      {
        name: 'Breakfast',
        foods: ['Oatmeal with berries', 'Boiled egg', 'Black coffee'],
        note: 'Low calorie, high satiety breakfast',
      },
      {
        name: 'Lunch',
        foods: ['Grilled chicken salad', 'Lemon dressing', 'Steamed broccoli'],
        note: 'Lean protein with high-fiber vegetables',
      },
      {
        name: 'Dinner',
        foods: ['Baked fish', 'Cauliflower rice', 'Green salad'],
        note: 'Light dinner with quality protein',
      },
      {
        name: 'Snacks',
        foods: ['Celery sticks', 'Herbal tea'],
        note: 'Minimal calorie snacks',
      },
    ],
  },
];
