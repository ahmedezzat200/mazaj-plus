import { useState } from 'react';
import { useOutletContext } from 'react-router';
import { UserData } from '../DashboardLayout';
import { DashboardAdvisoryBanner } from '../DashboardAdvisoryBanner';
import { HealthyAlternativesSection } from './HealthyAlternativesSection';
import { HydrationTrackerSection } from './HydrationTrackerSection';
import { HydrationRemindersCard } from './HydrationRemindersCard';
import { DailyTipCard } from './DailyTipCard';
import { AlternativesSupportCards } from './AlternativesSupportCards';

export interface AlternativeResult {
  originalFood: string;
  alternativeFood: string;
  reason: string;
  safetyValidated: boolean;
}

export interface HydrationData {
  currentIntake: number; // ml
  dailyTarget: number; // ml
}

export function AlternativesPage() {
  const { userData } = useOutletContext<{ userData: UserData }>();
  
  // Alternatives state
  const [alternativeSearchCount, setAlternativeSearchCount] = useState(0);
  const [currentAlternative, setCurrentAlternative] = useState<AlternativeResult | null>(null);
  const [noResultFound, setNoResultFound] = useState(false);
  
  // Hydration state
  const [hydrationData, setHydrationData] = useState<HydrationData>({
    currentIntake: 1600,
    dailyTarget: 2500,
  });
  
  // Reminders state
  const [remindersEnabled, setRemindersEnabled] = useState(true);

  const handleSearchAlternative = (food: string) => {
    // Check tier limit for Free users (5 searches per day)
    if (userData.tier === 'Free' && alternativeSearchCount >= 5) {
      return;
    }

    setAlternativeSearchCount(prev => prev + 1);
    
    // Mock search - simulate finding or not finding alternatives
    if (food.toLowerCase().includes('water')) {
      setNoResultFound(true);
      setCurrentAlternative(null);
    } else {
      setNoResultFound(false);
      setCurrentAlternative(generateMockAlternative(food));
    }
  };

  const handleAddWater = (amount: number) => {
    setHydrationData(prev => ({
      ...prev,
      currentIntake: prev.currentIntake + amount,
    }));
  };

  const isLimitReached = userData.tier === 'Free' && alternativeSearchCount >= 5;

  return (
    <div className="min-h-full bg-background">
      {/* Advisory banner */}
      <div className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-3">
          <DashboardAdvisoryBanner />
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Healthy Alternatives Section */}
            <HealthyAlternativesSection
              onSearch={handleSearchAlternative}
              currentAlternative={currentAlternative}
              noResultFound={noResultFound}
              isLimitReached={isLimitReached}
              onClearResult={() => {
                setCurrentAlternative(null);
                setNoResultFound(false);
              }}
            />

            {/* Hydration Tracker Section */}
            <HydrationTrackerSection
              hydrationData={hydrationData}
              onAddWater={handleAddWater}
            />

            {/* Hydration Reminders */}
            <HydrationRemindersCard
              enabled={remindersEnabled}
              onToggle={setRemindersEnabled}
            />
          </div>

          {/* Right sidebar */}
          <div className="space-y-6">
            {/* Daily Tip */}
            <DailyTipCard />

            {/* Support Cards */}
            <AlternativesSupportCards userData={userData} />
          </div>
        </div>
      </div>
    </div>
  );
}

// Mock alternative generator
function generateMockAlternative(food: string): AlternativeResult {
  const alternatives: Record<string, AlternativeResult> = {
    'fries': {
      originalFood: 'French Fries',
      alternativeFood: 'Baked Sweet Potato Wedges',
      reason: 'Lower in saturated fat and higher in fiber and vitamin A',
      safetyValidated: true,
    },
    'sugary snack': {
      originalFood: 'Sugary Snack',
      alternativeFood: 'Fresh Fruit with Nuts',
      reason: 'Natural sugars with added protein and healthy fats for sustained energy',
      safetyValidated: true,
    },
    'soft drink': {
      originalFood: 'Soft Drink',
      alternativeFood: 'Sparkling Water with Lemon',
      reason: 'Zero added sugars while staying hydrated and refreshed',
      safetyValidated: true,
    },
    'fast food meal': {
      originalFood: 'Fast Food Meal',
      alternativeFood: 'Grilled Chicken Bowl with Vegetables',
      reason: 'Balanced meal with lean protein and nutrient-dense vegetables',
      safetyValidated: true,
    },
  };

  const key = food.toLowerCase();
  return alternatives[key] || {
    originalFood: food,
    alternativeFood: 'Whole Food Option',
    reason: 'Choose whole, minimally processed foods for better nutrition',
    safetyValidated: true,
  };
}
