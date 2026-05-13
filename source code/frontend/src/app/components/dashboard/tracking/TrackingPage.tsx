import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router';
import { UserData } from '../DashboardLayout';
import { TrackingAdvisoryBanner } from './TrackingAdvisoryBanner';
import { LockedOverlay } from './LockedOverlay';
import { subscriptionApi } from '../../../../lib/api';

export function TrackingPage() {
  const { userData } = useOutletContext<{ userData: UserData }>();
  const [isLoading, setIsLoading] = useState(true);
  const [isUltraUser, setIsUltraUser] = useState(false);
  const [fetchError, setFetchError] = useState(false);

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const res = await subscriptionApi.getMe();
        if (res.ok && res.data) {
          setIsUltraUser(!!res.data.features.daily_tracking);
        } else {
          setFetchError(true);
        }
      } catch (err) {
        setFetchError(true);
      } finally {
        setIsLoading(false);
      }
    };
    checkAccess();
  }, []);

  return (
    <div className="relative min-h-full">
      {/* Advisory Banner */}
      <div className="max-w-7xl mx-auto px-6 pt-6">
        <TrackingAdvisoryBanner />
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Checking your subscription access...</p>
          </div>
        ) : fetchError ? (
          <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-8 text-center max-w-2xl mx-auto">
            <p className="text-destructive font-medium mb-4">Unable to load subscription access. Please try again.</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all"
            >
              Retry
            </button>
          </div>
        ) : isUltraUser ? (
          <>
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 mb-6">
              <p className="text-sm text-foreground flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                <strong>Ultra Benefit:</strong> Daily tracking and weekly reports are available for your tier, but the data logging workflow is still under development for this academic prototype.
              </p>
            </div>
            <div className="bg-card border border-border rounded-xl p-8 text-center">
              <div className="max-w-2xl mx-auto space-y-3">
                <h2 className="text-xl font-semibold text-foreground">Tracking Workflow Under Development</h2>
                <p className="text-sm text-muted-foreground">
                  No food logs, calorie totals, hydration trends, or weekly reports are generated yet. This section will show backend-saved tracking data only after the tracking workflow is implemented.
                </p>
                <p className="text-xs text-muted-foreground">
                  Mazaj+ will not create local or demo tracking records in the active frontend.
                </p>
              </div>
            </div>
          </>
        ) : (
          <LockedOverlay userTier={userData.tier} />
        )}
      </div>

    </div>
  );
}
