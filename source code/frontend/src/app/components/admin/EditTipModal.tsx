import { useState, useEffect } from 'react';
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

interface DailyTip {
  id: string;
  title?: string;
  content: string;
  display_order?: number;
  is_active?: boolean;
  status?: 'Active' | 'Inactive';
}

interface EditTipModalProps {
  tip: DailyTip | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdated?: () => void;
}

export function EditTipModal({ tip, isOpen, onClose, onUpdated }: EditTipModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    displayOrder: '0',
    status: 'Active' as 'Active' | 'Inactive',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (tip) {
      setFormData({
        title: tip.title || '',
        content: tip.content,
        displayOrder: String(tip.display_order ?? 0),
        status: (tip.is_active !== undefined ? (tip.is_active ? 'Active' : 'Inactive') : tip.status) as 'Active' | 'Inactive' || 'Active',
      });
    }
  }, [tip]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.content) {
      toast.error('Please enter tip content');
      return;
    }

    setIsSubmitting(true);

    const result = await adminApi.editTip(Number(tip!.id), {
      title: formData.title || formData.content.slice(0, 50),
      content: formData.content,
      display_order: parseInt(formData.displayOrder) || 0,
      is_active: formData.status === 'Active',
    });

    if (result.ok) {
      toast.success('Daily tip updated successfully');
      onUpdated?.();
      onClose();
    } else {
      toast.error(result.error?.message || 'Failed to update tip');
    }

    setIsSubmitting(false);
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (!tip) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Daily Tip</DialogTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Update daily wellness tip content and settings
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Tip Title</Label>
            <input
              id="title"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Tip Content *</Label>
            <Textarea
              id="content"
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
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
