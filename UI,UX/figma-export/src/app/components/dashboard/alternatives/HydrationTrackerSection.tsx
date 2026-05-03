import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Droplet, Plus, CheckCircle } from 'lucide-react';
import { HydrationData } from './AlternativesPage';
import { Progress } from '../../ui/progress';

interface HydrationTrackerSectionProps {
  hydrationData: HydrationData;
  onAddWater: (amount: number) => void;
}

const quickAmounts = [250, 500, 750];

export function HydrationTrackerSection({ hydrationData, onAddWater }: HydrationTrackerSectionProps) {
  const [customAmount, setCustomAmount] = useState('');
  const [justAdded, setJustAdded] = useState(false);

  const progress = Math.min((hydrationData.currentIntake / hydrationData.dailyTarget) * 100, 100);
  const isGoalReached = hydrationData.currentIntake >= hydrationData.dailyTarget;
  const isOverTarget = hydrationData.currentIntake > hydrationData.dailyTarget;

  const handleAddWater = (amount: number) => {
    onAddWater(amount);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  };

  const handleAddCustom = () => {
    const amount = parseInt(customAmount);
    if (amount && amount > 0) {
      handleAddWater(amount);
      setCustomAmount('');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Droplet className="h-5 w-5 text-secondary" />
          Hydration Tracker
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-2">
          Track your daily water intake to stay hydrated and support your nutrition goals.
        </p>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Progress display */}
        <div className="bg-gradient-to-br from-secondary/10 to-secondary/5 rounded-xl p-5 border border-secondary/20">
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Current</p>
              <p className="text-xl font-semibold text-foreground">
                {hydrationData.currentIntake} ml
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Target</p>
              <p className="text-xl font-semibold text-foreground">
                {hydrationData.dailyTarget} ml
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Progress</p>
              <p className="text-xl font-semibold text-secondary">
                {Math.round(progress)}%
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="space-y-2">
            <Progress value={progress} className="h-3" />
            
            {/* Status message */}
            {hydrationData.currentIntake === 0 && (
              <p className="text-xs text-muted-foreground">No water logged today</p>
            )}
            {hydrationData.currentIntake > 0 && !isGoalReached && (
              <p className="text-xs text-muted-foreground">
                {hydrationData.dailyTarget - hydrationData.currentIntake} ml to go
              </p>
            )}
            {isGoalReached && !isOverTarget && (
              <div className="flex items-center gap-1.5 text-xs text-secondary">
                <CheckCircle className="h-3 w-3" />
                <span>Daily goal reached!</span>
              </div>
            )}
            {isOverTarget && (
              <p className="text-xs text-secondary">
                Exceeded target by {hydrationData.currentIntake - hydrationData.dailyTarget} ml
              </p>
            )}
          </div>
        </div>

        {/* Quick log buttons */}
        <div className="space-y-3">
          <p className="text-sm font-medium text-foreground">Quick Log</p>
          <div className="grid grid-cols-3 gap-2">
            {quickAmounts.map((amount) => (
              <Button
                key={amount}
                variant="outline"
                onClick={() => handleAddWater(amount)}
                className="h-auto py-3 flex-col gap-1"
              >
                <Plus className="h-4 w-4 text-primary" />
                <span className="font-semibold">{amount} ml</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Custom amount */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">Custom Amount</p>
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="Enter ml"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddCustom()}
              className="flex-1"
            />
            <Button onClick={handleAddCustom} disabled={!customAmount}>
              <Plus className="h-4 w-4 mr-2" />
              Add Water
            </Button>
          </div>
        </div>

        {/* Success feedback */}
        {justAdded && (
          <div className="bg-secondary/10 border border-secondary/20 rounded-lg px-4 py-2 flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-secondary" />
            <p className="text-sm text-foreground">Water intake added successfully!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
