import { useState } from 'react';
import { useOutletContext } from 'react-router';
import { UserData, UserTier } from '../DashboardLayout';
import { SubscriptionAdvisoryBanner } from './SubscriptionAdvisoryBanner';
import { CurrentPlanCard } from './CurrentPlanCard';
import { PricingCards } from './PricingCards';
import { FeatureComparison } from './FeatureComparison';
import { UpgradeModal } from './UpgradeModal';
import { UpgradeSuccessCard } from './UpgradeSuccessCard';
import { UpgradeFailureCard } from './UpgradeFailureCard';

type UpgradeState = 'idle' | 'confirming' | 'processing' | 'success' | 'failure';

export function SubscriptionPage() {
  const { userData } = useOutletContext<{ userData: UserData }>();
  const [upgradeState, setUpgradeState] = useState<UpgradeState>('idle');
  const [selectedPlan, setSelectedPlan] = useState<UserTier | null>(null);

  const handleUpgradeClick = (tier: UserTier) => {
    setSelectedPlan(tier);
    setUpgradeState('confirming');
  };

  const handleConfirmUpgrade = async () => {
    setUpgradeState('processing');

    // Simulate payment/activation
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Simulate random success/failure for demo
    const success = Math.random() > 0.2; // 80% success rate

    setUpgradeState(success ? 'success' : 'failure');
  };

  const handleCancelUpgrade = () => {
    setUpgradeState('idle');
    setSelectedPlan(null);
  };

  const handleRetry = () => {
    setUpgradeState('confirming');
  };

  const handleReturnToDashboard = () => {
    window.location.href = '/dashboard';
  };

  if (upgradeState === 'success') {
    return (
      <div className="min-h-full">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <UpgradeSuccessCard
            newTier={selectedPlan!}
            onReturnToDashboard={handleReturnToDashboard}
          />
        </div>
      </div>
    );
  }

  if (upgradeState === 'failure') {
    return (
      <div className="min-h-full">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <UpgradeFailureCard
            onTryAgain={handleRetry}
            onReturnToDashboard={handleReturnToDashboard}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full">
      {/* Advisory Banner */}
      <div className="max-w-7xl mx-auto px-6 pt-6">
        <SubscriptionAdvisoryBanner />
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-6 space-y-8">
        {/* Current Plan */}
        <CurrentPlanCard currentTier={userData.tier} />

        {/* Pricing Cards */}
        <div>
          <div className="text-center mb-8">
            <h2>Choose Your Plan</h2>
            <p className="text-muted-foreground mt-2">
              Select the plan that best supports your nutrition guidance needs
            </p>
          </div>
          <PricingCards
            currentTier={userData.tier}
            onUpgrade={handleUpgradeClick}
          />
        </div>

        {/* Feature Comparison */}
        <FeatureComparison />
      </div>

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={upgradeState === 'confirming' || upgradeState === 'processing'}
        isProcessing={upgradeState === 'processing'}
        selectedPlan={selectedPlan}
        currentTier={userData.tier}
        onConfirm={handleConfirmUpgrade}
        onCancel={handleCancelUpgrade}
      />
    </div>
  );
}
