import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { UserTier } from '../DashboardLayout';
import { Sparkles, ArrowRight, Loader2 } from 'lucide-react';

interface UpgradeModalProps {
  isOpen: boolean;
  isProcessing: boolean;
  selectedPlan: UserTier | null;
  currentTier: UserTier;
  onConfirm: () => void;
  onCancel: () => void;
}

const planBenefits = {
  Pro: [
    'Food image upload & analysis',
    'InBody data integration',
    'Detailed nutrition breakdown',
    'Priority guidance',
  ],
  Ultra: [
    'Daily food intake logging',
    'Weekly nutrition reports',
    'Progress tracking & trends',
    'Unlimited history',
    'Advanced analytics',
    'Premium support',
  ],
};

export function UpgradeModal({
  isOpen,
  isProcessing,
  selectedPlan,
  currentTier,
  onConfirm,
  onCancel,
}: UpgradeModalProps) {
  if (!selectedPlan) return null;

  const benefits = planBenefits[selectedPlan as 'Pro' | 'Ultra'] || [];

  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <div>
              <DialogTitle>Upgrade Your Plan</DialogTitle>
              <DialogDescription>
                Unlock additional features with {selectedPlan}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Plan Transition */}
          <div className="flex items-center justify-center gap-3 py-4">
            <Badge variant="secondary" className="text-base px-4 py-1">
              {currentTier}
            </Badge>
            <ArrowRight className="h-5 w-5 text-muted-foreground" />
            <Badge variant="default" className="text-base px-4 py-1 bg-primary">
              {selectedPlan}
            </Badge>
          </div>

          {/* Benefits */}
          <div className="bg-muted/50 rounded-lg p-4">
            <p className="font-medium mb-3">What you'll unlock:</p>
            <ul className="space-y-2">
              {benefits.map((benefit, index) => (
                <li key={index} className="flex items-start gap-2">
                  <Sparkles className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Academic Note */}
          <div className="p-3 bg-accent/10 border border-accent/20 rounded-lg">
            <p className="text-sm text-accent-foreground">
              <strong>Note:</strong> This is an academic prototype. In a production environment,
              this would connect to a payment processor for subscription management.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isProcessing}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Activating...
              </>
            ) : (
              `Confirm Upgrade to ${selectedPlan}`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
