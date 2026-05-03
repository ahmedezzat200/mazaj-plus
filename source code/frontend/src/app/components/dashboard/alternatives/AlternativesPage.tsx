import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router';
import { UserData } from '../DashboardLayout';
import { DashboardAdvisoryBanner } from '../DashboardAdvisoryBanner';
import { HealthyAlternativesSection } from './HealthyAlternativesSection';
import { HydrationTrackerSection } from './HydrationTrackerSection';
import { HydrationRemindersCard } from './HydrationRemindersCard';
import { DailyTipCard } from './DailyTipCard';
import { AlternativesSupportCards } from './AlternativesSupportCards';
import { alternativesApi, hydrationApi, tipsApi, BackendAlternative } from '../../../../lib/api';

/** UI-facing alternative result — mapped from BackendAlternative */
export interface AlternativeResult {
  originalFood: string;
  alternativeFood: string;
  reason: string;
  safetyValidated: boolean;
}

export interface HydrationData {
  currentIntake: number; // today_total_ml from backend
  dailyTarget: number;   // target_ml from backend
}

function mapAlternative(a: BackendAlternative): AlternativeResult {
  return {
    originalFood: a.original_food_name,
    alternativeFood: a.alternative_food?.name ?? 'Whole Food Option',
    reason: a.reason,
    safetyValidated: true, // backend validates safety before returning
  };
}

export function AlternativesPage() {
  const { userData } = useOutletContext<{ userData: UserData }>();

  // Alternatives state
  const [currentAlternative, setCurrentAlternative] = useState<AlternativeResult | null>(null);
  const [noResultFound, setNoResultFound] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isLimitReached, setIsLimitReached] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Hydration state
  const [hydrationData, setHydrationData] = useState<HydrationData>({
    currentIntake: 0,
    dailyTarget: 2000,
  });
  const [isLoggingWater, setIsLoggingWater] = useState(false);
  const [logError, setLogError] = useState<string | null>(null);
  const [hydrationError, setHydrationError] = useState<string | null>(null);

  // Daily tip state
  const [dailyTip, setDailyTip] = useState<{ title: string; content: string } | null>(null);
  const [isTipLoading, setIsTipLoading] = useState(true);

  // Reminders state (UI-only toggle, no backend)
  const [remindersEnabled, setRemindersEnabled] = useState(true);

  // On mount: load hydration target + daily tip in parallel
  useEffect(() => {
    // Hydration target
    hydrationApi.getTarget().then((result) => {
      if (result.ok) {
        setHydrationData({
          currentIntake: result.today_total_ml ?? 0,
          dailyTarget: result.target_ml ?? 2000,
        });
      } else {
        setHydrationError(result.error?.message ?? 'Could not load hydration target.');
      }
    }).catch(() => {
      setHydrationError('Unable to reach the server for hydration data.');
    });

    // Daily tip
    tipsApi.getDaily().then((result) => {
      if (result.ok) {
        setDailyTip(result.tip ?? null);
      }
      // silent failure — tip is non-critical
    }).catch(() => {
      // silent failure
    }).finally(() => {
      setIsTipLoading(false);
    });
  }, []);

  const handleSearchAlternative = async (food: string) => {
    if (!food.trim() || isSearching || isLimitReached) return;
    setIsSearching(true);
    setSearchError(null);
    setCurrentAlternative(null);
    setNoResultFound(false);

    const result = await alternativesApi.search(food.trim()).catch(() => null);

    if (!result) {
      setSearchError('Unable to reach the server. Please check your connection.');
      setIsSearching(false);
      return;
    }

    if (result.ok) {
      const list = result.alternatives ?? [];
      if (list.length > 0) {
        // Show first alternative; backend returns the best match
        setCurrentAlternative(mapAlternative(list[0]));
        setNoResultFound(false);
      } else {
        setNoResultFound(true);
        setCurrentAlternative(null);
      }
    } else {
      const code = result.error?.code ?? 'UNKNOWN';
      const msg = result.error?.message ?? 'An unexpected error occurred.';
      if (result.status === 401) {
        setSearchError('Your session has expired. Please log in again.');
      } else if (result.status === 403 && code === 'USAGE_LIMIT_EXCEEDED') {
        setIsLimitReached(true);
        setSearchError('You have reached your daily healthy alternative limit for the Free tier. Upgrade to search more.');
      } else if (result.status === 403) {
        setSearchError(msg);
      } else if (result.status === 409) {
        setSearchError('A duplicate request was detected. Please try again.');
      } else {
        setSearchError(msg);
      }
    }

    setIsSearching(false);
  };

  const handleAddWater = async (amount: number): Promise<boolean> => {
    if (amount <= 0 || isLoggingWater) return false;
    setIsLoggingWater(true);
    setLogError(null);

    const result = await hydrationApi.logWater(amount).catch(() => null);

    if (!result) {
      setLogError('Unable to reach the server. Please check your connection.');
      setIsLoggingWater(false);
      return false;
    }

    if (result.ok) {
      // Update state only from backend response — no optimistic update
      setHydrationData({
        currentIntake: result.today_total_ml ?? hydrationData.currentIntake,
        dailyTarget: result.target_ml ?? hydrationData.dailyTarget,
      });
      setIsLoggingWater(false);
      return true;
    } else {
      const msg = result.error?.message ?? 'Failed to log water intake.';
      if (result.status === 401) {
        setLogError('Your session has expired. Please log in again.');
      } else if (result.status === 409) {
        setLogError('Duplicate request detected. Please try again.');
      } else {
        setLogError(msg);
      }
      setIsLoggingWater(false);
      return false;
    }
  };

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

            {/* Inline search error */}
            {searchError && !isLimitReached && (
              <div className="px-4 py-3 rounded-xl bg-destructive/10 border border-destructive/20 text-sm text-destructive">
                {searchError}
              </div>
            )}

            {/* Healthy Alternatives Section */}
            <HealthyAlternativesSection
              onSearch={handleSearchAlternative}
              currentAlternative={currentAlternative}
              noResultFound={noResultFound}
              isLimitReached={isLimitReached}
              isSearching={isSearching}
              onClearResult={() => {
                setCurrentAlternative(null);
                setNoResultFound(false);
                setSearchError(null);
              }}
            />

            {/* Hydration error */}
            {hydrationError && (
              <div className="px-4 py-3 rounded-xl bg-destructive/10 border border-destructive/20 text-sm text-destructive">
                {hydrationError}
              </div>
            )}

            {/* Hydration Tracker Section */}
            <HydrationTrackerSection
              hydrationData={hydrationData}
              onAddWater={handleAddWater}
              isLogging={isLoggingWater}
              logError={logError}
            />

            {/* Hydration Reminders (UI-only toggle) */}
            <HydrationRemindersCard
              enabled={remindersEnabled}
              onToggle={setRemindersEnabled}
            />
          </div>

          {/* Right sidebar */}
          <div className="space-y-6">
            {/* Daily Tip — backend-driven */}
            <DailyTipCard tip={dailyTip} isLoading={isTipLoading} />

            {/* Support Cards */}
            <AlternativesSupportCards userData={userData} />
          </div>
        </div>
      </div>
    </div>
  );
}
