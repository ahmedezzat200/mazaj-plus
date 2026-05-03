import { useOutletContext } from 'react-router';
import { UserData } from './DashboardLayout';
import { DashboardAdvisoryBanner } from './DashboardAdvisoryBanner';
import { DashboardIntro } from './DashboardIntro';
import { SummaryWidgets } from './SummaryWidgets';
import { QuickAccessCards } from './QuickAccessCards';
import { UpgradePanel } from './UpgradePanel';

export function Dashboard() {
  const { userData } = useOutletContext<{ userData: UserData }>();

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Advisory Banner */}
      <DashboardAdvisoryBanner />

      {/* Intro Section */}
      <DashboardIntro userName={userData.name.split(' ')[0]} />

      {/* Summary Widgets */}
      <SummaryWidgets userTier={userData.tier} />

      {/* Quick Access Cards */}
      <QuickAccessCards userTier={userData.tier} />

      {/* Upgrade Panel (only for Free and Pro users) */}
      {userData.tier !== 'Ultra' && <UpgradePanel currentTier={userData.tier} />}
    </div>
  );
}
