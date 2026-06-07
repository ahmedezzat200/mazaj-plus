import { Check, X } from 'lucide-react';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { UserTier } from '../DashboardLayout';
import { cn } from '../../ui/utils';

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
          <div
            key={plan.tier}
            className={cn(
              'relative rounded-2xl transition-all duration-300',
              // Pro: gradient border via padding trick
              plan.tier === 'Pro' && !isCurrentPlan && 'p-[2px] bg-gradient-to-b from-primary via-primary/70 to-primary/30 hover:from-primary hover:to-primary/50 shadow-lg hover:shadow-xl',
              // Ultra: glowing shadow effect
              plan.tier === 'Ultra' && !isCurrentPlan && 'p-[2px] bg-gradient-to-b from-violet-500 via-purple-500 to-fuchsia-500 shadow-[0_0_24px_4px_rgba(139,92,246,0.25)] hover:shadow-[0_0_32px_8px_rgba(139,92,246,0.4)] hover:scale-[1.01]',
              // Current plan
              isCurrentPlan && 'ring-2 ring-primary/30',
              // Default free card
              plan.tier === 'Free' && 'hover:shadow-md hover:-translate-y-0.5',
            )}
          >
            <div
              className={cn(
                'rounded-2xl bg-card p-6 flex flex-col h-full',
                plan.tier === 'Pro' && !isCurrentPlan && 'rounded-[14px]',
                plan.tier === 'Ultra' && !isCurrentPlan && 'rounded-[14px]',
                isCurrentPlan && 'bg-primary/5',
              )}
            >
              {/* Header */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className={cn(
                    'font-bold text-lg',
                    plan.tier === 'Ultra' && 'bg-gradient-to-r from-violet-600 to-fuchsia-500 bg-clip-text text-transparent',
                    plan.tier === 'Pro' && 'text-primary',
                  )}>
                    {plan.name}
                  </h3>
                  <div className="flex gap-2">
                    {plan.highlighted && (
                      <Badge variant="default" className="bg-primary text-primary-foreground text-xs">
                        Popular
                      </Badge>
                    )}
                    {plan.tier === 'Ultra' && (
                      <Badge className="bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white border-0 text-xs">
                        Best Value
                      </Badge>
                    )}
                    {isCurrentPlan && (
                      <Badge variant="secondary" className="text-xs">Current</Badge>
                    )}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
              </div>

              {/* Price */}
              <div className="mb-6">
                {plan.tier === 'Free' ? (
                  <span className="text-2xl font-bold">Free</span>
                ) : (
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold">
                      {plan.tier === 'Pro' ? '300' : '500'}
                    </span>
                    <span className="text-sm text-muted-foreground">EGP / month</span>
                  </div>
                )}
              </div>

              {/* Features */}
              <ul className="space-y-2.5 mb-6 flex-1">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2.5">
                    {feature.included ? (
                      <Check className={cn(
                        'h-4 w-4 mt-0.5 flex-shrink-0',
                        plan.tier === 'Ultra' ? 'text-violet-500' : 'text-primary'
                      )} />
                    ) : (
                      <X className="h-4 w-4 mt-0.5 flex-shrink-0 text-muted-foreground/30" />
                    )}
                    <span
                      className={cn(
                        'text-sm',
                        feature.included ? 'text-foreground' : 'text-muted-foreground/50 line-through'
                      )}
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
                    className={cn(
                      'w-full transition-all duration-200',
                      plan.tier === 'Ultra' && 'bg-gradient-to-r from-violet-600 to-fuchsia-500 hover:from-violet-700 hover:to-fuchsia-600 text-white border-0 shadow-md hover:shadow-lg',
                      plan.tier === 'Pro' && 'shadow-sm hover:shadow-md',
                    )}
                    variant={plan.highlighted ? 'default' : 'outline'}
                    onClick={() => onUpgrade(plan.tier)}
                  >
                    Choose {plan.name}
                  </Button>
                ) : (
                  <Button variant="ghost" className="w-full" disabled>
                    Full Access Enabled
                  </Button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
