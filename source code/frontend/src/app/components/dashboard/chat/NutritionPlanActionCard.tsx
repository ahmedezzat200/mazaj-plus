import { ClipboardList, Loader2 } from 'lucide-react';
import { Button } from '../../ui/button';

interface NutritionPlanActionCardProps {
  onRequestPlan: (message: string) => void;
  isLoading: boolean;
}

export function NutritionPlanActionCard({
  onRequestPlan,
  isLoading,
}: NutritionPlanActionCardProps) {
  const handleClick = () => {
    onRequestPlan('Make a nutrition plan.');
  };

  return (
    <div className="rounded-lg border border-border bg-muted/20 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <ClipboardList className="h-4 w-4 text-purple-500" />
        <span className="text-sm font-semibold text-foreground">Nutrition Plan</span>
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed">
        Request a personalized plan through the chat. Mazaj+ generates plans through backend-controlled rules. AI does not create your plan.
      </p>
      {/* Button is disabled only while a chat request is in flight */}
      <Button
        size="sm"
        variant="outline"
        className="gap-2 w-full"
        disabled={isLoading}
        onClick={handleClick}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Processing…
          </>
        ) : (
          <>
            <ClipboardList className="h-3.5 w-3.5" />
            Generate Nutrition Plan
          </>
        )}
      </Button>
      <p className="text-[10px] text-muted-foreground leading-relaxed">
        Make sure your profile is complete before generating a plan.
      </p>
    </div>
  );
}
