import { useEffect, useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';
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

function normalizeTier(tier?: string): UserTier {
  const normalized = tier?.toUpperCase();
  if (normalized === 'PRO') return 'Pro';
  if (normalized === 'ULTRA') return 'Ultra';
  return 'Free';
}

function parseBackendError(error: any, defaultMsg: string): string {
  if (!error) return defaultMsg;
  const code = error.code;
  if (code === 'NETWORK_ERROR') return 'Unable to complete this action. Please try again.';
  if (code === 'INVALID_TIER') return 'Something went wrong. Please try again.';
  if (code === 'CHECKOUT_NOT_PENDING') return 'Your plan is being updated. Please wait a few seconds.';
  if (code === 'NOT_FOUND') return 'We could not complete your payment. Please try again.';
  return defaultMsg;
}

export function SubscriptionPage() {
  const { userData } = useOutletContext<{ userData: UserData }>();
  const { refreshUser } = useAuth();
  const navigate = useNavigate();

  const [upgradeState, setUpgradeState] = useState<UpgradeState>('idle');
  const [selectedPlan, setSelectedPlan] = useState<UserTier | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [backendSub, setBackendSub] = useState<SubscriptionData | null>(null);

  const currentTier = backendSub ? normalizeTier(backendSub.tier) : userData.tier;

  useEffect(() => {
    fetchSubscription();
  }, []);

  useEffect(() => {
    if (upgradeState !== 'success') return;
    const fire = () =>
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#22d3ee', '#a78bfa', '#34d399', '#f472b6'],
      });
    fire();
    const t1 = setTimeout(fire, 220);
    const t2 = setTimeout(fire, 480);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [upgradeState]);

  const fetchSubscription = async () => {
    try {
      const res = await subscriptionApi.getMe();

      if (res.ok && res.data) {
        setBackendSub(res.data);
      } else {
        setErrorMessage(parseBackendError(res.error, 'Unable to complete this action. Please try again.'));
      }
    } catch {
      setErrorMessage('Unable to complete this action. Please try again.');
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
      
      // Step 1: Create checkout session
      const checkRes = await subscriptionApi.checkout(targetTier);
      if (!checkRes.ok || !checkRes.data) {
        setErrorMessage(
          parseBackendError(checkRes.error, 'We could not complete your payment. Please try again.')
        );
        setUpgradeState('failure');
        return;
      }

      // Step 2: Confirm mock payment success
      const payRes = await subscriptionApi.mockPaymentSuccess(checkRes.data.checkout_id);
      if (payRes.ok) {
        setUpgradeState('success');
        await refreshUser();
        await fetchSubscription();
      } else {
        setErrorMessage(
          parseBackendError(payRes.error, 'We could not complete your payment. Please try again.')
        );
        setUpgradeState('failure');
      }
    } catch {
      setErrorMessage('Unable to complete this action. Please try again.');
      setUpgradeState('failure');
    }
  };

  const handleCancelUpgrade = () => {
    if (upgradeState === 'confirming' || upgradeState === 'processing') {
      toast.info('Checkout cancelled. Your subscription was not changed.');
    }
    setUpgradeState('idle');
    setSelectedPlan(null);
    setErrorMessage(null);
  };

  const handleRetry = () => {
    setUpgradeState('confirming');
  };

  const handleReturnToDashboard = () => {
    navigate('/dashboard');
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
