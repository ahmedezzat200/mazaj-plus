import { Calendar } from 'lucide-react';
import { Card } from '../../ui/card';

export function WeeklyReport() {
  return (
    <Card className="p-6">
      <div className="space-y-4 text-center">
        <div>
          <h2>Weekly Report</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Backend-saved tracking data is required before a weekly report can be shown.
          </p>
        </div>

        <div className="py-12 border border-dashed border-border rounded-lg">
          <Calendar className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
          <h3 className="mb-2">No Report Data Yet</h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            Weekly calories, hydration totals, and trends will remain hidden until real tracking data exists.
          </p>
        </div>
      </div>
    </Card>
  );
}
