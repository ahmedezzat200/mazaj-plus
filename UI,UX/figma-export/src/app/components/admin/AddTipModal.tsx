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

interface AddTipModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddTipModal({ isOpen, onClose }: AddTipModalProps) {
  const [formData, setFormData] = useState({
    content: '',
    displayDate: '',
    status: 'Active',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.content) {
      toast.error('Please enter tip content');
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    toast.success('Daily tip added successfully');
    setIsSubmitting(false);
    setFormData({ content: '', displayDate: '', status: 'Active' });
    onClose();
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
            <Label htmlFor="content">Tip Content *</Label>
            <Textarea
              id="content"
              placeholder="Enter helpful nutrition or wellness tip..."
              rows={4}
              value={formData.content}
              onChange={(e) => handleChange('content', e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">
              Keep it concise and actionable (max 200 characters recommended)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="displayDate">Display Date (Optional)</Label>
            <Input
              id="displayDate"
              type="date"
              value={formData.displayDate}
              onChange={(e) => handleChange('displayDate', e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Leave blank to publish immediately
            </p>
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
              {isSubmitting ? 'Adding...' : 'Add Tip'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
