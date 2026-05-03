import { Check } from 'lucide-react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { UserTier } from '../DashboardLayout';

interface PricingCardsProps {
  currentTier: UserTier;
  onUpgrade: (tier: UserTier) => void;
}

interface PlanFeature {
  text: string;
  included: boolean;
}

interface Plan {
  tier: UserTier;
  name: string;
  description: string;
  features: PlanFeature[];
  highlighted?: boolean;
}

const plans: Plan[] = [
  {
    tier: 'Free',
    name: 'Free',
    description: 'Essential nutrition guidance for everyday wellness',
    features: [
      { text: 'Chat-based food recommendations', included: true },
      { text: 'Personalized nutrition plans', included: true },
      { text: 'Healthy alternatives guidance', included: true },
      { text: 'Hydration tracking', included: true },
      { text: 'Daily wellness tips', included: true },
      { text: 'Food image upload', included: false },
      { text: 'Daily intake logging', included: false },
      { text: 'Weekly reports', included: false },
    ],
  },
  {
    tier: 'Pro',
    name: 'Pro',
    description: 'Advanced features for comprehensive nutrition support',
    highlighted: true,
    features: [
      { text: 'All Free features', included: true },
      { text: 'Food image upload & analysis', included: true },
      { text: 'InBody data integration', included: true },
      { text: 'Detailed nutrition breakdown', included: true },
      { text: 'Priority guidance', included: true },
      { text: 'Daily intake logging', included: false },
      { text: 'Weekly reports', included: false },
      { text: 'Progress tracking', included: false },
    ],
  },
  {
    tier: 'Ultra',
    name: 'Ultra',
    description: 'Complete tracking and reporting for dedicated users',
    features: [
      { text: 'All Pro features', included: true },
      { text: 'Daily food intake logging', included: true },
      { text: 'Weekly nutrition reports', included: true },
      { text: 'Progress tracking & trends', included: true },
      { text: 'Unlimited history', included: true },
      { text: 'Advanced analytics', included: true },
      { text: 'Premium support', included: true },
      { text: 'Early access to new features', included: true },
    ],
  },
];

export function PricingCards({ currentTier, onUpgrade }: PricingCardsProps) {
  const getTierLevel = (tier: UserTier): number => {
    const levels = { Free: 0, Pro: 1, Ultra: 2 };
    return levels[tier];
  };

  const canUpgrade = (planTier: UserTier): boolean => {
    return getTierLevel(planTier) > getTierLevel(currentTier);
  };

  const isCurrent = (planTier: UserTier): boolean => {
    return planTier === currentTier;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {plans.map((plan) => {
        const isCurrentPlan = isCurrent(plan.tier);
        const canUpgradeToPlan = canUpgrade(plan.tier);

        return (
          <Card
            key={plan.tier}
            className={`p-6 flex flex-col ${
              plan.highlighted
                ? 'border-2 border-primary shadow-lg ring-2 ring-primary/10'
                : ''
            } ${isCurrentPlan ? 'border-2 border-primary/30 bg-primary/5' : ''}`}
          >
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <h3>{plan.name}</h3>
                {plan.highlighted && (
                  <Badge variant="default" className="bg-primary text-primary-foreground">
                    Popular
                  </Badge>
                )}
                {isCurrentPlan && (
                  <Badge variant="secondary">Current</Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{plan.description}</p>
            </div>

            {/* Features */}
            <ul className="space-y-3 mb-6 flex-1">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-start gap-2">
                  <Check
                    className={`h-4 w-4 mt-0.5 flex-shrink-0 ${
                      feature.included
                        ? 'text-primary'
                        : 'text-muted-foreground opacity-30'
                    }`}
                  />
                  <span
                    className={`text-sm ${
                      feature.included
                        ? 'text-foreground'
                        : 'text-muted-foreground line-through opacity-50'
                    }`}
                  >
                    {feature.text}
                  </span>
                </li>
              ))}
            </ul>

            {/* CTA */}
            <div>
              {isCurrentPlan ? (
                <Button variant="outline" className="w-full" disabled>
                  Current Plan
                </Button>
              ) : canUpgradeToPlan ? (
                <Button
                  className="w-full"
                  variant={plan.highlighted ? 'default' : 'outline'}
                  onClick={() => onUpgrade(plan.tier)}
                >
                  Upgrade to {plan.name}
                </Button>
              ) : (
                <Button variant="ghost" className="w-full" disabled>
                  Full Access Enabled
                </Button>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
