import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router';
import { UserData } from './DashboardLayout';
import { DashboardAdvisoryBanner } from './DashboardAdvisoryBanner';
import { DashboardIntro } from './DashboardIntro';
import { SummaryWidgets } from './SummaryWidgets';
import { QuickAccessCards } from './QuickAccessCards';
import { UpgradePanel } from './UpgradePanel';
import { tipsApi } from '../../../lib/api';

export function Dashboard() {
  const { userData } = useOutletContext<{ userData: UserData }>();
  const [tip, setTip] = useState<{ title: string; content: string } | null>(null);
  const [tipLoading, setTipLoading] = useState(true);

  useEffect(() => {
    tipsApi.getDaily()
      .then((res) => {
        if (res.ok && res.tip) setTip(res.tip);
      })
      .catch(() => { /* silently ignore */ })
      .finally(() => setTipLoading(false));
  }, []);

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Advisory Banner */}
      <DashboardAdvisoryBanner />

      {/* Animated intro with greeting + daily tip */}
      <DashboardIntro
        userName={userData.name.split(' ')[0]}
        tip={tip}
        tipLoading={tipLoading}
      />

      {/* Summary Widgets */}
      <SummaryWidgets userTier={userData.tier} />

      {/* Quick Access Cards */}
      <QuickAccessCards userTier={userData.tier} />

      {/* Upgrade Panel (only for Free and Pro users) */}
      {userData.tier !== 'Ultra' && <UpgradePanel currentTier={userData.tier} />}
    </div>
  );
}
