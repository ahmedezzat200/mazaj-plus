import { UtensilsCrossed, TrendingDown, Minus, TrendingUp, Target } from 'lucide-react';
import { Button } from '../../ui/button';

interface PlanChatEmptyProps {
  onQuickStarter: (starter: string) => void;
}

const starterChips = [
  { 
    label: 'Create a weight loss plan', 
    icon: TrendingDown, 
    prompt: 'I want to create a weight loss nutrition plan' 
  },
  { 
    label: 'Create a maintenance plan', 
    icon: Minus, 
    prompt: 'I want to create a maintenance nutrition plan' 
  },
  { 
    label: 'Create a weight gain plan', 
    icon: TrendingUp, 
    prompt: 'I want to create a weight gain nutrition plan' 
  },
  { 
    label: 'Use my saved goal', 
    icon: Target, 
    prompt: 'Create a nutrition plan using my saved goal' 
  },
];

export function PlanChatEmpty({ onQuickStarter }: PlanChatEmptyProps) {
  return (
    <div className="flex items-center justify-center min-h-full p-6 md:p-8">
      <div className="max-w-2xl w-full text-center space-y-8">
        {/* Heading */}
        <div className="space-y-3">
          <h2 className="text-3xl md:text-4xl font-semibold text-foreground">
            Request a Personalized Nutrition Plan
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Mazaj+ uses your stored health profile, dietary preferences, safety rules, and goals 
            to create a tailored nutrition plan designed for your wellbeing.
          </p>
        </div>

        {/* Quick starter chips */}
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">Quick options:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg mx-auto">
            {starterChips.map((chip) => (
              <Button
                key={chip.label}
                variant="outline"
                size="lg"
                onClick={() => onQuickStarter(chip.prompt)}
                className="h-auto py-4 px-5 gap-3 hover:bg-primary/5 hover:border-primary/20 justify-start"
              >
                <chip.icon className="h-5 w-5 text-primary flex-shrink-0" />
                <span className="text-sm">{chip.label}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Visual illustration placeholder */}
        <div className="pt-4">
          <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
            <UtensilsCrossed className="h-12 w-12 text-primary/40" />
          </div>
        </div>
      </div>
    </div>
  );
}
