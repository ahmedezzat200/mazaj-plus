import { useState } from 'react';
import { format, addDays, subDays } from 'date-fns';
import { ChevronLeft, ChevronRight, Plus, Trash2, Coffee, Sun, Sunset, Moon, Apple } from 'lucide-react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';

export type MealType = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack' | 'Beverage';

interface FoodEntry {
  id: string;
  foodItem: string;
  quantity: string;
  mealType: MealType;
  calories: number;
}

interface DailyIntakeLogProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  onAddEntry: () => void;
}

// Mock data
const mockEntries: FoodEntry[] = [
  { id: '1', foodItem: 'Scrambled Eggs', quantity: '2 eggs', mealType: 'Breakfast', calories: 180 },
  { id: '2', foodItem: 'Whole Wheat Toast', quantity: '2 slices', mealType: 'Breakfast', calories: 160 },
  { id: '3', foodItem: 'Green Tea', quantity: '1 cup', mealType: 'Beverage', calories: 2 },
  { id: '4', foodItem: 'Grilled Chicken Salad', quantity: '1 bowl', mealType: 'Lunch', calories: 350 },
  { id: '5', foodItem: 'Mixed Nuts', quantity: '30g', mealType: 'Snack', calories: 170 },
  { id: '6', foodItem: 'Baked Salmon', quantity: '150g', mealType: 'Dinner', calories: 280 },
  { id: '7', foodItem: 'Steamed Broccoli', quantity: '1 cup', mealType: 'Dinner', calories: 55 },
];

const mealIcons = {
  Breakfast: Coffee,
  Lunch: Sun,
  Dinner: Sunset,
  Snack: Apple,
  Beverage: Moon,
};

const mealOrder: MealType[] = ['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Beverage'];

export function DailyIntakeLog({ selectedDate, onDateChange, onAddEntry }: DailyIntakeLogProps) {
  const [entries] = useState<FoodEntry[]>(mockEntries);

  const totalCalories = entries.reduce((sum, entry) => sum + entry.calories, 0);
  const targetCalories = 2000;
  const progress = Math.min((totalCalories / targetCalories) * 100, 100);

  const groupedEntries = entries.reduce((acc, entry) => {
    if (!acc[entry.mealType]) {
      acc[entry.mealType] = [];
    }
    acc[entry.mealType].push(entry);
    return acc;
  }, {} as Record<MealType, FoodEntry[]>);

  const handlePreviousDay = () => onDateChange(subDays(selectedDate, 1));
  const handleNextDay = () => onDateChange(addDays(selectedDate, 1));

  const isToday = format(selectedDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');

  return (
    <Card className="p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2>Daily Intake Log</h2>
          <Button size="sm" variant="outline" onClick={onAddEntry}>
            <Plus className="h-4 w-4 mr-2" />
            Add Entry
          </Button>
        </div>

        {/* Date Selector */}
        <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
          <Button variant="ghost" size="icon" onClick={handlePreviousDay}>
            <ChevronLeft className="h-5 w-5" />
          </Button>

          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              {isToday ? 'Today' : format(selectedDate, 'EEEE')}
            </p>
            <p className="font-medium">{format(selectedDate, 'MMMM d, yyyy')}</p>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleNextDay}
            disabled={isToday}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>

        {/* Daily Progress Summary */}
        <div className="p-4 bg-muted/50 rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Daily Calories</span>
            <span className="font-medium">
              {totalCalories} / {targetCalories} kcal
            </span>
          </div>

          <div className="w-full bg-background rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="text-center p-2 bg-background rounded-lg">
              <p className="text-xs text-muted-foreground">Hydration</p>
              <p className="font-medium">6 / 8 cups</p>
            </div>
            <div className="text-center p-2 bg-background rounded-lg">
              <p className="text-xs text-muted-foreground">Days Logged</p>
              <p className="font-medium">12 days</p>
            </div>
          </div>
        </div>

        {/* Meal Log */}
        <div className="space-y-4">
          {entries.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-border rounded-lg">
              <Coffee className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
              <h3 className="mb-2">No Entries Logged Yet</h3>
              <p className="text-muted-foreground mb-4">
                Start tracking your meals to monitor your nutrition
              </p>
              <Button onClick={onAddEntry}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Entry
              </Button>
            </div>
          ) : (
            mealOrder.map((mealType) => {
              const mealEntries = groupedEntries[mealType];
              if (!mealEntries || mealEntries.length === 0) return null;

              const Icon = mealIcons[mealType];
              const mealTotal = mealEntries.reduce((sum, entry) => sum + entry.calories, 0);

              return (
                <div key={mealType} className="space-y-2">
                  <div className="flex items-center gap-2 pb-2 border-b border-border">
                    <Icon className="h-4 w-4 text-primary" />
                    <h4 className="flex-1">{mealType}</h4>
                    <Badge variant="secondary">{mealTotal} kcal</Badge>
                  </div>

                  <div className="space-y-2">
                    {mealEntries.map((entry) => (
                      <div
                        key={entry.id}
                        className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors group"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-sm">{entry.foodItem}</p>
                          <p className="text-xs text-muted-foreground">{entry.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{entry.calories}</p>
                          <p className="text-xs text-muted-foreground">kcal</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </Card>
  );
}
