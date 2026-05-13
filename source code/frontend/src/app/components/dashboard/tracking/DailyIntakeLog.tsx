import { format } from 'date-fns';
import { Coffee } from 'lucide-react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';

export type MealType = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack' | 'Beverage';

interface DailyIntakeLogProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  onAddEntry: () => void;
}

export function DailyIntakeLog({ selectedDate }: DailyIntakeLogProps) {
  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2>Daily Intake Log</h2>
          <Button size="sm" variant="outline" disabled>
            Add Entry
          </Button>
        </div>

        <div className="p-4 bg-muted rounded-lg text-center">
          <p className="text-sm text-muted-foreground">
            {format(selectedDate, 'EEEE, MMMM d, yyyy')}
          </p>
        </div>

        <div className="text-center py-12 border border-dashed border-border rounded-lg">
          <Coffee className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
          <h3 className="mb-2">Tracking Under Development</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Food logs will appear here only after they are saved by the backend tracking workflow.
          </p>
        </div>
      </div>
    </Card>
  );
}
