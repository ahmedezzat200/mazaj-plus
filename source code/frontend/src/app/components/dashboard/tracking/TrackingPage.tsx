import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router';
import { UserData } from '../DashboardLayout';
import { TrackingAdvisoryBanner } from './TrackingAdvisoryBanner';
import { DailyIntakeLog } from './DailyIntakeLog';
import { WeeklyReport } from './WeeklyReport';
import { AddEntryModal } from './AddEntryModal';
import { LockedOverlay } from './LockedOverlay';
import { subscriptionApi, SubscriptionData } from '../../../../lib/api';

export function TrackingPage() {
  const { userData } = useOutletContext<{ userData: UserData }>();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
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

  // Listen for add entry event from top bar
  useEffect(() => {
    const handleOpenAddEntry = () => setIsAddModalOpen(true);
    window.addEventListener('openAddEntry', handleOpenAddEntry);
    return () => window.removeEventListener('openAddEntry', handleOpenAddEntry);
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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Daily Intake Log - Takes up 2 columns */}
              <div className="lg:col-span-2">
                <DailyIntakeLog
                  selectedDate={selectedDate}
                  onDateChange={setSelectedDate}
                  onAddEntry={() => setIsAddModalOpen(true)}
                />
              </div>

              {/* Weekly Report - Takes up 1 column */}
              <div className="lg:col-span-1">
                <WeeklyReport />
              </div>
            </div>
          </>
        ) : (
          <LockedOverlay userTier={userData.tier} />
        )}
      </div>

      {/* Add Entry Modal */}
      {isUltraUser && (
        <AddEntryModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          selectedDate={selectedDate}
        />
      )}
    </div>
  );
}
