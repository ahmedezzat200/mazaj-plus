import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router';
import { UserData } from '../DashboardLayout';
import { TrackingAdvisoryBanner } from './TrackingAdvisoryBanner';
import { DailyIntakeLog } from './DailyIntakeLog';
import { WeeklyReport } from './WeeklyReport';
import { AddEntryModal } from './AddEntryModal';
import { LockedOverlay } from './LockedOverlay';

export function TrackingPage() {
  const { userData } = useOutletContext<{ userData: UserData }>();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Locked for demo as feature is not yet implemented
  const isUltraUser = false;

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
        {isUltraUser ? (
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
