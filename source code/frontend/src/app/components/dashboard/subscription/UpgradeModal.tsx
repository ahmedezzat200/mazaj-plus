import { useEffect, useState } from 'react';
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
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { UserTier } from '../DashboardLayout';
import { Loader2, CreditCard, ShieldCheck, ArrowRight } from 'lucide-react';

interface UpgradeModalProps {
  isOpen: boolean;
  isProcessing: boolean;
  selectedPlan: UserTier | null;
  currentTier: UserTier;
  onConfirm: () => void;
  onCancel: () => void;
}

const planPrices = {
  Pro: '300 EGP / month',
  Ultra: '500 EGP / month',
  Free: '0 EGP / month',
};

export function UpgradeModal({
  isOpen,
  isProcessing,
  selectedPlan,
  currentTier,
  onConfirm,
  onCancel,
}: UpgradeModalProps) {
  const [step, setStep] = useState<'payment' | 'review' | 'bank_confirmation'>('payment');
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [confirmationCode, setConfirmationCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Clear card and code state on modal open/close
  useEffect(() => {
    if (!isOpen) {
      setCardName('');
      setCardNumber('');
      setCardExpiry('');
      setCardCvc('');
      setConfirmationCode('');
      setStep('payment');
      setError(null);
    }
  }, [isOpen]);

  if (!selectedPlan) return null;

  const price = planPrices[selectedPlan as 'Pro' | 'Ultra'] || '';

  // Formatter for Card Number: XXXX XXXX XXXX XXXX
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/\D/g, '').substring(0, 16);
    const formatted = rawVal.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardNumber(formatted);
  };

  // Formatter for Expiry Date: MM/YY
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let rawVal = e.target.value.replace(/\D/g, '').substring(0, 4);
    if (rawVal.length > 2) {
      rawVal = `${rawVal.substring(0, 2)}/${rawVal.substring(2)}`;
    }
    setCardExpiry(rawVal);
  };

  // Formatter for CVC: 3 digits
  const handleCvcChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/\D/g, '').substring(0, 3);
    setCardCvc(rawVal);
  };

  // Formatter for Confirmation Code: 6 digits
  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').substring(0, 6);
    setConfirmationCode(val);
  };

  // Validation before going to Review
  const handleContinue = () => {
    setError(null);
    const digitsOnly = cardNumber.replace(/\s/g, '');
    if (!cardName.trim() || digitsOnly.length !== 16 || !cardExpiry.trim() || cardCvc.length !== 3) {
      setError('Please check your payment details and try again.');
      return;
    }
    setStep('review');
  };

  // Validation for Bank Confirmation
  const handleVerifyPayment = () => {
    setError(null);
    if (confirmationCode.length !== 6 || confirmationCode !== '123456') {
      setError('Invalid confirmation code. Please try again.');
      return;
    }
    onConfirm();
  };

  const cardEnding = cardNumber.replace(/\s/g, '').slice(-4);

  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-lg">
        {isProcessing ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm font-medium text-muted-foreground">Processing payment...</p>
          </div>
        ) : step === 'payment' ? (
          <>
            <DialogHeader>
              <div className="flex items-center gap-3 mb-1">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <DialogTitle>Secure Checkout</DialogTitle>
                  <DialogDescription>
                    Enter your card details to continue.
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-4 py-2">
              {/* Selected Plan Banner */}
              <div className="flex justify-between items-center bg-muted/40 rounded-lg p-3 border border-border/50">
                <div>
                  <p className="text-xs text-muted-foreground">Selected Plan</p>
                  <p className="font-semibold text-sm">{selectedPlan} Plan</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Billing Cycle</p>
                  <p className="font-bold text-sm text-primary">{price}</p>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-xs font-medium">
                  {error}
                </div>
              )}

              {/* Form Fields */}
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="cardName" className="text-xs">Name on card</Label>
                  <Input
                    id="cardName"
                    type="text"
                    placeholder="Jane Doe"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    className="h-9 text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="cardNumber" className="text-xs">Card number</Label>
                  <div className="relative">
                    <Input
                      id="cardNumber"
                      type="text"
                      placeholder="0000 0000 0000 0000"
                      value={cardNumber}
                      onChange={handleCardNumberChange}
                      className="h-9 text-sm pl-9"
                    />
                    <CreditCard className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="cardExpiry" className="text-xs">Expiry date</Label>
                    <Input
                      id="cardExpiry"
                      type="text"
                      placeholder="MM/YY"
                      value={cardExpiry}
                      onChange={handleExpiryChange}
                      className="h-9 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="cardCvc" className="text-xs">CVC</Label>
                    <Input
                      id="cardCvc"
                      type="password"
                      placeholder="***"
                      value={cardCvc}
                      onChange={handleCvcChange}
                      className="h-9 text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0 border-t pt-4">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onCancel}
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleContinue}
              >
                Continue
              </Button>
            </DialogFooter>
          </>
        ) : step === 'review' ? (
          <>
            <DialogHeader>
              <div className="flex items-center gap-3 mb-1">
                <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
                  <CreditCard className="h-5 w-5 text-secondary" />
                </div>
                <div>
                  <DialogTitle>Review Your Plan</DialogTitle>
                  <DialogDescription>
                    Review and confirm your subscription details.
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="bg-secondary/5 border border-secondary/20 rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-secondary/10">
                  <span className="font-medium text-xs text-muted-foreground">Plan Selected</span>
                  <Badge variant="secondary" className="bg-secondary/10 text-secondary-foreground text-xs">
                    {selectedPlan} Plan
                  </Badge>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-secondary/10">
                  <span className="font-medium text-xs text-muted-foreground">Price</span>
                  <span className="font-bold text-sm text-foreground">{price}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-secondary/10">
                  <span className="font-medium text-xs text-muted-foreground">Payment Method</span>
                  <span className="text-xs font-medium text-foreground">Card ending in {cardEnding}</span>
                </div>
                <div className="flex justify-between items-center text-[10px] text-muted-foreground pt-1">
                  <span>Billing Period</span>
                  <span>Monthly billing</span>
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0 border-t pt-4">
              <div className="flex justify-between w-full">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setStep('payment')}
                >
                  Back
                </Button>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={onCancel}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => setStep('bank_confirmation')}
                    className="bg-secondary hover:bg-secondary/90 text-secondary-foreground"
                  >
                    Confirm Payment
                  </Button>
                </div>
              </div>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <div className="flex items-center gap-3 mb-1">
                <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
                  <ShieldCheck className="h-5 w-5 text-secondary" />
                </div>
                <div>
                  <DialogTitle>Bank Confirmation</DialogTitle>
                  <DialogDescription>
                    Enter the confirmation code sent to your phone.
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="bg-secondary/5 border border-secondary/20 rounded-lg p-4 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Plan</span>
                  <span className="font-medium">{selectedPlan} Plan</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="font-bold">{price}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment Method</span>
                  <span>Card ending in {cardEnding}</span>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-xs font-medium">
                  {error}
                </div>
              )}

              <div className="space-y-1">
                <Label htmlFor="confirmationCode" className="text-xs">Confirmation code</Label>
                <Input
                  id="confirmationCode"
                  type="text"
                  placeholder="6-digit code"
                  value={confirmationCode}
                  onChange={handleCodeChange}
                  className="h-9 text-sm text-center tracking-widest font-bold"
                />
                <p className="text-[10px] text-muted-foreground mt-1">
                  For this checkout, you can use 123456.
                </p>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0 border-t pt-4">
              <div className="flex justify-between w-full">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setStep('review')}
                >
                  Back
                </Button>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={onCancel}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleVerifyPayment}
                    className="bg-secondary hover:bg-secondary/90 text-secondary-foreground"
                  >
                    Verify Payment
                  </Button>
                </div>
              </div>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
