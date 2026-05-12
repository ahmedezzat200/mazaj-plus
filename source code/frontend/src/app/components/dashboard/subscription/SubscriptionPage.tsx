import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router';
import { UserData, UserTier } from '../DashboardLayout';
import { SubscriptionAdvisoryBanner } from './SubscriptionAdvisoryBanner';
import { CurrentPlanCard } from './CurrentPlanCard';
import { PricingCards } from './PricingCards';
import { FeatureComparison } from './FeatureComparison';
import { UpgradeModal } from './UpgradeModal';
import { UpgradeSuccessCard } from './UpgradeSuccessCard';
import { UpgradeFailureCard } from './UpgradeFailureCard';
import { subscriptionApi, SubscriptionData } from '../../../../lib/api';
import { useAuth } from '../../../../contexts/AuthContext';

type UpgradeState = 'idle' | 'confirming' | 'processing' | 'success' | 'failure';

export function SubscriptionPage() {
  const { userData } = useOutletContext<{ userData: UserData }>();
  const { refreshUser } = useAuth();

  const [upgradeState, setUpgradeState] = useState<UpgradeState>('idle');
  const [selectedPlan, setSelectedPlan] = useState<UserTier | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [backendSub, setBackendSub] = useState<SubscriptionData | null>(null);

  const currentTier =
    (backendSub?.tier?.toLowerCase() as UserTier | undefined) || userData.tier;

  useEffect(() => {
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    try {
      const res = await subscriptionApi.getMe();

      if (res.ok && res.data) {
        setBackendSub(res.data);
      } else {
        setErrorMessage(res.error?.message || 'Unable to load subscription details.');
      }
    } catch {
      setErrorMessage('Unable to reach the server. Please check your connection.');
    }
  };

  const handleUpgradeClick = (tier: UserTier) => {
    setSelectedPlan(tier);
    setUpgradeState('confirming');
    setErrorMessage(null);
  };

  const handleConfirmUpgrade = async () => {
    if (!selectedPlan) return;

    setUpgradeState('processing');
    setErrorMessage(null);

    try {
      const targetTier = selectedPlan.toUpperCase();
      const res = await subscriptionApi.upgrade(targetTier);

      if (res.ok) {
        setUpgradeState('success');
        await refreshUser();
        await fetchSubscription();
      } else {
        setErrorMessage(
          res.error?.message || 'Something went wrong while updating your subscription.'
        );
        setUpgradeState('failure');
      }
    } catch {
      setErrorMessage('Unable to reach the server. Please check your connection.');
      setUpgradeState('failure');
    }
  };

  const handleCancelUpgrade = () => {
    setUpgradeState('idle');
    setSelectedPlan(null);
    setErrorMessage(null);
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
            errorMessage={errorMessage}
            onTryAgain={handleRetry}
            onReturnToDashboard={handleReturnToDashboard}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full">
      <div className="max-w-7xl mx-auto px-6 pt-6">
        <SubscriptionAdvisoryBanner />
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-8">
        <CurrentPlanCard currentTier={currentTier} />

        <div>
          <div className="text-center mb-8">
            <h2>Choose Your Plan</h2>
            <p className="text-muted-foreground mt-2">
              Select the plan that best supports your nutrition guidance needs
            </p>
          </div>

          <PricingCards
            currentTier={currentTier}
            onUpgrade={handleUpgradeClick}
          />
        </div>

        <FeatureComparison />
      </div>

      <UpgradeModal
        isOpen={upgradeState === 'confirming' || upgradeState === 'processing'}
        isProcessing={upgradeState === 'processing'}
        selectedPlan={selectedPlan}
        currentTier={currentTier}
        onConfirm={handleConfirmUpgrade}
        onCancel={handleCancelUpgrade}
      />
    </div>
  );
}