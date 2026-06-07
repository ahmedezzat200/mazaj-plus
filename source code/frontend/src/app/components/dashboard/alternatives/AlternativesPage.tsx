import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Switch } from '../../ui/switch';
import { Label } from '../../ui/label';
import { Bell, BellOff, Crown, Info, Lightbulb, Loader2 } from 'lucide-react';
import { UserData } from '../DashboardLayout';
import { DashboardAdvisoryBanner } from '../DashboardAdvisoryBanner';
import { HealthyAlternativesSection } from './HealthyAlternativesSection';
import { HydrationTrackerSection } from './HydrationTrackerSection';
import { alternativesApi, hydrationApi, tipsApi, BackendAlternative } from '../../../../lib/api';

export interface AlternativeResult {
  originalFood: string;
  alternativeFood: string;
  reason: string;
  safetyValidated: boolean;
  calories?: string;
  protein?: string;
  carbs?: string;
  fat?: string;
}

export interface HydrationData {
  currentIntake: number;
  dailyTarget: number;
}

function mapAlternative(a: BackendAlternative): AlternativeResult {
  return {
    originalFood: a.original_food_name,
    alternativeFood: a.alternative_food?.name ?? 'Whole Food Option',
    reason: a.reason,
    safetyValidated: true,
    calories: a.alternative_food?.calories,
    protein: a.alternative_food?.protein_g,
    carbs: a.alternative_food?.carbs_g,
    fat: a.alternative_food?.fat_g,
  };
}

export function AlternativesPage() {
  const { userData } = useOutletContext<{ userData: UserData }>();

  const [currentAlternative, setCurrentAlternative] = useState<AlternativeResult | null>(null);
  const [noResultFound, setNoResultFound] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isLimitReached, setIsLimitReached] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const [hydrationData, setHydrationData] = useState<HydrationData>({ currentIntake: 0, dailyTarget: 2000 });
  const [isLoggingWater, setIsLoggingWater] = useState(false);
  const [logError, setLogError] = useState<string | null>(null);
  const [hydrationError, setHydrationError] = useState<string | null>(null);

  const [dailyTip, setDailyTip] = useState<{ title: string; content: string } | null>(null);
  const [isTipLoading, setIsTipLoading] = useState(true);
  const [remindersEnabled, setRemindersEnabled] = useState(true);

  useEffect(() => {
    hydrationApi.getTarget().then((result) => {
      if (result.ok) {
        setHydrationData({ currentIntake: result.today_total_ml ?? 0, dailyTarget: result.target_ml ?? 2000 });
      } else {
        setHydrationError(result.error?.message ?? 'Could not load hydration target.');
      }
    }).catch(() => setHydrationError('Unable to reach the server for hydration data.'));

    tipsApi.getDaily().then((result) => {
      if (result.ok) setDailyTip(result.tip ?? null);
    }).catch(() => {}).finally(() => setIsTipLoading(false));
  }, []);

  const handleSearchAlternative = async (food: string) => {
    if (!food.trim() || isSearching || isLimitReached) return;
    setIsSearching(true);
    setSearchError(null);
    setCurrentAlternative(null);
    setNoResultFound(false);

    const result = await alternativesApi.search(food.trim()).catch(() => null);
    if (!result) { setSearchError('Unable to reach the server.'); setIsSearching(false); return; }

    if (result.ok) {
      const list = result.alternatives ?? [];
      if (list.length > 0) { setCurrentAlternative(mapAlternative(list[0])); }
      else { setNoResultFound(true); }
    } else {
      const code = result.error?.code ?? '';
      if (result.status === 403 && code === 'USAGE_LIMIT_EXCEEDED') { setIsLimitReached(true); }
      else { setSearchError(result.error?.message ?? 'An unexpected error occurred.'); }
    }
    setIsSearching(false);
  };

  const handleAddWater = async (amount: number): Promise<boolean> => {
    if (amount <= 0 || isLoggingWater) return false;
    setIsLoggingWater(true);
    setLogError(null);
    const result = await hydrationApi.logWater(amount).catch(() => null);
    if (!result) { setLogError('Unable to reach the server.'); setIsLoggingWater(false); return false; }
    if (result.ok) {
      setHydrationData({ currentIntake: result.today_total_ml ?? hydrationData.currentIntake, dailyTarget: result.target_ml ?? hydrationData.dailyTarget });
      setIsLoggingWater(false);
      return true;
    }
    setLogError(result.error?.message ?? 'Failed to log water intake.');
    setIsLoggingWater(false);
    return false;
  };

  return (
    <div className="min-h-full bg-background">
      <div className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-3">
          <DashboardAdvisoryBanner />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {searchError && !isLimitReached && (
              <div className="px-4 py-3 rounded-xl bg-destructive/10 border border-destructive/20 text-sm text-destructive">{searchError}</div>
            )}
            <HealthyAlternativesSection
              onSearch={handleSearchAlternative}
              currentAlternative={currentAlternative}
              noResultFound={noResultFound}
              isLimitReached={isLimitReached}
              isSearching={isSearching}
              onClearResult={() => { setCurrentAlternative(null); setNoResultFound(false); setSearchError(null); }}
            />
            {hydrationError && (
              <div className="px-4 py-3 rounded-xl bg-destructive/10 border border-destructive/20 text-sm text-destructive">{hydrationError}</div>
            )}
            <HydrationTrackerSection hydrationData={hydrationData} onAddWater={handleAddWater} isLogging={isLoggingWater} logError={logError} />

            {/* Hydration reminders toggle (UI-only) */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {remindersEnabled ? <Bell className="h-5 w-5 text-primary" /> : <BellOff className="h-5 w-5 text-muted-foreground" />}
                  Hydration Reminders
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border">
                  <div>
                    <Label htmlFor="reminders-toggle" className="text-sm font-medium">Enable Reminders</Label>
                    <p className="text-xs text-muted-foreground">Get periodic notifications to drink water</p>
                  </div>
                  <Switch id="reminders-toggle" checked={remindersEnabled} onCheckedChange={setRemindersEnabled} />
                </div>
                <p className="text-xs text-muted-foreground">
                  {remindersEnabled
                    ? 'Reminders active — every 2 hours from 8 AM to 10 PM'
                    : 'Turn on reminders to get notifications throughout the day'}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Right sidebar */}
          <div className="space-y-6">
            {/* Daily tip */}
            <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Lightbulb className="h-5 w-5 text-accent" />
                  {dailyTip?.title ?? "Today's Nutrition Tip"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isTipLoading ? (
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <Loader2 className="h-4 w-4 animate-spin" /><span>Loading tip…</span>
                  </div>
                ) : dailyTip ? (
                  <p className="text-sm text-foreground leading-relaxed">{dailyTip.content}</p>
                ) : (
                  <p className="text-sm text-muted-foreground">No tip available today.</p>
                )}
              </CardContent>
            </Card>

            {/* Personalized context */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Info className="h-4 w-4 text-primary" />
                  <CardTitle className="text-sm">Personalized Guidance</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground leading-relaxed">
                Suggestions are tailored to your profile, goals, and safety requirements.
              </CardContent>
            </Card>

            {/* Tier status */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Crown className="h-4 w-4 text-primary" />
                  <CardTitle className="text-sm">Tier Status</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <Badge variant="secondary" className={
                  userData.tier === 'Ultra' ? 'bg-primary text-primary-foreground'
                  : userData.tier === 'Pro' ? 'bg-secondary text-secondary-foreground'
                  : 'bg-muted text-muted-foreground'
                }>
                  {userData.tier}
                </Badge>
                <p className="text-xs text-muted-foreground">
                  {userData.tier === 'Free' ? '10 alternative searches per day' : 'Unlimited alternative searches'}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
