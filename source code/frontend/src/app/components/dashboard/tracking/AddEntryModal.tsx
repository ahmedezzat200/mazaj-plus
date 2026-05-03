import { useState } from 'react';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../ui/select';
import { MealType } from './DailyIntakeLog';
import { toast } from 'sonner';

interface AddEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date;
}

export function AddEntryModal({ isOpen, onClose, selectedDate }: AddEntryModalProps) {
  const [foodItem, setFoodItem] = useState('');
  const [quantity, setQuantity] = useState('');
  const [mealType, setMealType] = useState<MealType>('Breakfast');
  const [calories, setCalories] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!foodItem || !quantity || !calories) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    toast.success('Entry saved successfully');
    setIsSubmitting(false);
    handleClose();
  };

  const handleClose = () => {
    setFoodItem('');
    setQuantity('');
    setMealType('Breakfast');
    setCalories('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Food Entry</DialogTitle>
          <p className="text-sm text-muted-foreground">
            {format(selectedDate, 'EEEE, MMMM d, yyyy')}
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="foodItem">Food Item</Label>
            <Input
              id="foodItem"
              placeholder="e.g., Grilled Chicken"
              value={foodItem}
              onChange={(e) => setFoodItem(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              placeholder="e.g., 150g or 1 cup"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="mealType">Meal Type</Label>
            <Select value={mealType} onValueChange={(value) => setMealType(value as MealType)}>
              <SelectTrigger id="mealType">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Breakfast">Breakfast</SelectItem>
                <SelectItem value="Lunch">Lunch</SelectItem>
                <SelectItem value="Dinner">Dinner</SelectItem>
                <SelectItem value="Snack">Snack</SelectItem>
                <SelectItem value="Beverage">Beverage</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="calories">Calories (kcal)</Label>
            <Input
              id="calories"
              type="number"
              placeholder="e.g., 250"
              value={calories}
              onChange={(e) => setCalories(e.target.value)}
              required
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Entry'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
