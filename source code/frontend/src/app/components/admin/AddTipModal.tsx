import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { toast } from 'sonner';
import { adminApi } from '../../../lib/api';

interface AddTipModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdded?: () => void;
}

export function AddTipModal({ isOpen, onClose, onAdded }: AddTipModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    displayOrder: '0',
    status: 'Active',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.content) {
      toast.error('Please enter tip title and content');
      return;
    }

    setIsSubmitting(true);

    const result = await adminApi.addTip({
      title: formData.title,
      content: formData.content,
      display_order: parseInt(formData.displayOrder) || 0,
      is_active: formData.status === 'Active',
    });

    if (result.ok) {
      toast.success('Daily tip added successfully');
      onAdded?.();
      setFormData({ title: '', content: '', displayOrder: '0', status: 'Active' });
      onClose();
    } else {
      toast.error(result.error?.message || 'Failed to add tip');
    }

    setIsSubmitting(false);
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Daily Tip</DialogTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Create a new daily wellness tip for platform users
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Tip Title *</Label>
            <Input
              id="title"
              placeholder="e.g., Hydration Reminder"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Tip Content *</Label>
            <Textarea
              id="content"
              placeholder="Enter helpful nutrition or wellness tip..."
              rows={4}
              value={formData.content}
              onChange={(e) => handleChange('content', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="displayOrder">Display Order</Label>
            <Input
              id="displayOrder"
              type="number"
              min="0"
              value={formData.displayOrder}
              onChange={(e) => handleChange('displayOrder', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(value) => handleChange('status', value)}>
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Adding...' : 'Add Tip'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
