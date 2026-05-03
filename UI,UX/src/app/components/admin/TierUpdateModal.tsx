import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { toast } from 'sonner';

interface Subscription {
  id: string;
  userName: string;
  tier: 'Pro' | 'Ultra';
}

interface TierUpdateModalProps {
  subscription: Subscription | null;
  isOpen: boolean;
  onClose: () => void;
}

export function TierUpdateModal({ subscription, isOpen, onClose }: TierUpdateModalProps) {
  const [selectedTier, setSelectedTier] = useState<string>(subscription?.tier || 'Pro');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    toast.success(`Subscription tier updated to ${selectedTier}`);
    setIsSubmitting(false);
    onClose();
  };

  if (!subscription) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update Subscription Tier</DialogTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Change subscription tier for {subscription.userName}
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tier">New Subscription Tier</Label>
            <Select value={selectedTier} onValueChange={setSelectedTier}>
              <SelectTrigger id="tier">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Free">Free (Downgrade)</SelectItem>
                <SelectItem value="Pro">Pro</SelectItem>
                <SelectItem value="Ultra">Ultra</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="p-4 bg-muted/50 rounded-lg space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Current tier:</span>
              <strong className="text-foreground">{subscription.tier}</strong>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">New tier:</span>
              <strong className="text-foreground">{selectedTier}</strong>
            </div>
          </div>

          <div className="p-3 bg-accent/10 border border-accent/20 rounded-lg">
            <p className="text-xs text-accent-foreground">
              <strong>Note:</strong> Tier changes take effect immediately. Users will be notified
              of the change and their access will be updated accordingly.
            </p>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Updating...' : 'Update Tier'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
