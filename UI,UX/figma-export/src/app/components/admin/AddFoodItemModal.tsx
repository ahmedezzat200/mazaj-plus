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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { toast } from 'sonner';

interface AddFoodItemModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddFoodItemModal({ isOpen, onClose }: AddFoodItemModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    calories: '',
    protein: '',
    fat: '',
    carbs: '',
    category: 'Protein',
    moodTag: 'Energizing',
    dataSource: 'Manual',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.calories) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    toast.success('Food item added successfully');
    setIsSubmitting(false);
    setFormData({
      name: '',
      calories: '',
      protein: '',
      fat: '',
      carbs: '',
      category: 'Protein',
      moodTag: 'Energizing',
      dataSource: 'Manual',
    });
    onClose();
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Food Item</DialogTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Add a new food item to the nutrition database
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Food Name *</Label>
            <Input
              id="name"
              placeholder="e.g., Grilled Chicken Breast"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="calories">Calories *</Label>
              <Input
                id="calories"
                type="number"
                placeholder="165"
                value={formData.calories}
                onChange={(e) => handleChange('calories', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="protein">Protein (g)</Label>
              <Input
                id="protein"
                type="number"
                placeholder="31"
                value={formData.protein}
                onChange={(e) => handleChange('protein', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fat">Fat (g)</Label>
              <Input
                id="fat"
                type="number"
                placeholder="3.6"
                value={formData.fat}
                onChange={(e) => handleChange('fat', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="carbs">Carbohydrates (g)</Label>
              <Input
                id="carbs"
                type="number"
                placeholder="0"
                value={formData.carbs}
                onChange={(e) => handleChange('carbs', e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={formData.category} onValueChange={(value) => handleChange('category', value)}>
              <SelectTrigger id="category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Protein">Protein</SelectItem>
                <SelectItem value="Vegetables">Vegetables</SelectItem>
                <SelectItem value="Fruits">Fruits</SelectItem>
                <SelectItem value="Grains">Grains</SelectItem>
                <SelectItem value="Dairy">Dairy</SelectItem>
                <SelectItem value="Fats">Fats</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="moodTag">Mood Tag</Label>
            <Select value={formData.moodTag} onValueChange={(value) => handleChange('moodTag', value)}>
              <SelectTrigger id="moodTag">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Energizing">Energizing</SelectItem>
                <SelectItem value="Comforting">Comforting</SelectItem>
                <SelectItem value="Refreshing">Refreshing</SelectItem>
                <SelectItem value="Satisfying">Satisfying</SelectItem>
                <SelectItem value="Calming">Calming</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dataSource">Data Source</Label>
            <Select value={formData.dataSource} onValueChange={(value) => handleChange('dataSource', value)}>
              <SelectTrigger id="dataSource">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USDA">USDA</SelectItem>
                <SelectItem value="Manual">Manual</SelectItem>
                <SelectItem value="Import">Import</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Adding...' : 'Add Food Item'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
