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

interface DailyTip {
  id: string;
  content: string;
  displayDate: string;
  status: 'Active' | 'Scheduled' | 'Inactive';
}

interface EditTipModalProps {
  tip: DailyTip | null;
  isOpen: boolean;
  onClose: () => void;
}

export function EditTipModal({ tip, isOpen, onClose }: EditTipModalProps) {
  const [formData, setFormData] = useState({
    content: '',
    displayDate: '',
    status: 'Active' as 'Active' | 'Scheduled' | 'Inactive',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (tip) {
      setFormData({
        content: tip.content,
        displayDate: tip.displayDate,
        status: tip.status,
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

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    toast.success('Daily tip updated successfully');
    setIsSubmitting(false);
    onClose();
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
            <Label htmlFor="displayDate">Display Date</Label>
            <Input
              id="displayDate"
              type="date"
              value={formData.displayDate}
              onChange={(e) => handleChange('displayDate', e.target.value)}
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
                <SelectItem value="Scheduled">Scheduled</SelectItem>
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
