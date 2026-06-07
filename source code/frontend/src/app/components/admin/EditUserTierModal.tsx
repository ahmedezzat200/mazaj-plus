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
import { adminApi } from '../../../lib/api';

interface User {
  id: string;
  name: string;
  tier: 'Free' | 'Pro' | 'Ultra';
}

interface EditUserTierModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdated?: () => void;
}

export function EditUserTierModal({ user, isOpen, onClose, onUpdated }: EditUserTierModalProps) {
  const [selectedTier, setSelectedTier] = useState<string>(user?.tier || 'Free');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const result = await adminApi.updateUserTier(Number(user.id), selectedTier.toUpperCase());
    if (result.ok) {
      toast.success(`User tier updated to ${selectedTier}`);
      onUpdated?.();
      onClose();
    } else {
      toast.error(result.error?.message || 'Failed to update tier');
    }

    setIsSubmitting(false);
  };

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit User Tier</DialogTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Update subscription tier for {user.name}
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tier">Subscription Tier</Label>
            <Select value={selectedTier} onValueChange={setSelectedTier}>
              <SelectTrigger id="tier">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Free">Free</SelectItem>
                <SelectItem value="Pro">Pro</SelectItem>
                <SelectItem value="Ultra">Ultra</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="p-3 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">
              Current tier: <strong className="text-foreground">{user.tier}</strong>
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              New tier: <strong className="text-foreground">{selectedTier}</strong>
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
