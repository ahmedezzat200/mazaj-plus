import { useState } from 'react';
import { format, startOfWeek, endOfWeek, subWeeks } from 'date-fns';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Droplet, Calendar } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const mockWeeklyData = [
  { day: 'Mon', calories: 1950, hydration: 7 },
  { day: 'Tue', calories: 2100, hydration: 8 },
  { day: 'Wed', calories: 1890, hydration: 6 },
  { day: 'Thu', calories: 2050, hydration: 8 },
  { day: 'Fri', calories: 1980, hydration: 7 },
  { day: 'Sat', calories: 2150, hydration: 6 },
  { day: 'Sun', calories: 1920, hydration: 8 },
];

export function WeeklyReport() {
  const [currentWeek, setCurrentWeek] = useState(new Date());

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 });

  const averageCalories = Math.round(
    mockWeeklyData.reduce((sum, day) => sum + day.calories, 0) / mockWeeklyData.length
  );

  const totalHydration = mockWeeklyData.reduce((sum, day) => sum + day.hydration, 0);
  const daysLogged = mockWeeklyData.length;

  const handlePreviousWeek = () => setCurrentWeek(subWeeks(currentWeek, 1));
  const handleNextWeek = () => setCurrentWeek(subWeeks(currentWeek, -1));

  const isCurrentWeek = format(weekStart, 'yyyy-MM-dd') === format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');

  return (
    <Card className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h2>Weekly Report</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Nutrition summary and trends
        </p>
      </div>

      {/* Week Selector */}
      <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
        <Button variant="ghost" size="icon" onClick={handlePreviousWeek}>
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            {isCurrentWeek ? 'This Week' : 'Week of'}
          </p>
          <p className="text-sm font-medium">
            {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d')}
          </p>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={handleNextWeek}
          disabled={isCurrentWeek}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            <p className="text-xs text-muted-foreground">Avg Calories</p>
          </div>
          <p className="text-2xl font-semibold">{averageCalories}</p>
          <p className="text-xs text-muted-foreground mt-1">per day</p>
        </div>

        <div className="p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Droplet className="h-4 w-4 text-primary" />
            <p className="text-xs text-muted-foreground">Hydration</p>
          </div>
          <p className="text-2xl font-semibold">{totalHydration}</p>
          <p className="text-xs text-muted-foreground mt-1">cups total</p>
        </div>

        <div className="p-4 bg-muted/50 rounded-lg col-span-2">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-4 w-4 text-primary" />
            <p className="text-xs text-muted-foreground">Days Logged</p>
          </div>
          <p className="text-2xl font-semibold">{daysLogged} / 7</p>
          <div className="w-full bg-background rounded-full h-1.5 mt-2">
            <div
              className="h-full bg-primary rounded-full transition-all"
              style={{ width: `${(daysLogged / 7) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Calorie Trend Chart */}
      <div className="space-y-3">
        <h4>Daily Calories</h4>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={mockWeeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis
                dataKey="day"
                stroke="var(--color-muted-foreground)"
                fontSize={12}
              />
              <YAxis
                stroke="var(--color-muted-foreground)"
                fontSize={12}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--color-card)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '0.5rem',
                  fontSize: '12px',
                }}
              />
              <Line
                type="monotone"
                dataKey="calories"
                stroke="var(--color-primary)"
                strokeWidth={2}
                dot={{ fill: 'var(--color-primary)', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Hydration Chart */}
      <div className="space-y-3">
        <h4>Daily Hydration</h4>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={mockWeeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis
                dataKey="day"
                stroke="var(--color-muted-foreground)"
                fontSize={12}
              />
              <YAxis
                stroke="var(--color-muted-foreground)"
                fontSize={12}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--color-card)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '0.5rem',
                  fontSize: '12px',
                }}
              />
              <Bar
                dataKey="hydration"
                fill="var(--color-secondary)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Trend Summary */}
      <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
        <div className="flex items-start gap-3">
          <TrendingUp className="h-5 w-5 text-primary mt-0.5" />
          <div>
            <p className="font-medium text-sm mb-1">Weekly Trend</p>
            <p className="text-sm text-muted-foreground">
              Maintaining consistent calorie intake. Great hydration this week—keep it up!
            </p>
          </div>
        </div>
      </div>

      {/* Insufficient Data State (commented out - shown when needed) */}
      {/* <div className="text-center py-8">
        <Calendar className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
        <h3 className="mb-2">Not Enough Data Yet</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Log at least 3 days of meals to generate a weekly report
        </p>
        <Button variant="outline" size="sm">
          Start Logging Meals
        </Button>
      </div> */}
    </Card>
  );
}
