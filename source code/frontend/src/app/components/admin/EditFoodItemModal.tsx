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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { toast } from 'sonner';
import { adminApi } from '../../../lib/api';

interface FoodItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  category: string;
  moodTag: string;
  dataSource: string;
  status: 'Active' | 'Inactive';
}

interface EditFoodItemModalProps {
  item: FoodItem | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdated?: () => void;
}

export function EditFoodItemModal({ item, isOpen, onClose, onUpdated }: EditFoodItemModalProps) {
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

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name,
        calories: item.calories.toString(),
        protein: item.protein.toString(),
        fat: item.fat.toString(),
        carbs: item.carbs.toString(),
        category: item.category,
        moodTag: item.moodTag,
        dataSource: item.dataSource,
      });
    }
  }, [item]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.calories) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    const result = await adminApi.editFood(Number(item!.id), {
      name: formData.name,
      calories: parseFloat(formData.calories),
      protein_g: parseFloat(formData.protein) || 0,
      fat_g: parseFloat(formData.fat) || 0,
      carbs_g: parseFloat(formData.carbs) || 0,
      category: formData.category,
    });

    if (result.ok) {
      toast.success('Food item updated successfully');
      onUpdated?.();
      onClose();
    } else {
      toast.error(result.error?.message || 'Failed to update food item');
    }

    setIsSubmitting(false);
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (!item) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Food Item</DialogTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Update food item information
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Food Name *</Label>
            <Input
              id="name"
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
                value={formData.fat}
                onChange={(e) => handleChange('fat', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="carbs">Carbohydrates (g)</Label>
              <Input
                id="carbs"
                type="number"
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
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
