import { Heart, Cloud, Battery, Frown } from 'lucide-react';
import { Button } from '../../ui/button';

interface ChatEmptyProps {
  onQuickEmotion: (emotion: string) => void;
}

const emotionChips = [
  { label: 'Stress', icon: Cloud, prompt: 'I feel stressed and overwhelmed' },
  { label: 'Sadness', icon: Frown, prompt: 'I feel sad and down' },
  { label: 'Fatigue', icon: Battery, prompt: 'I feel tired and fatigued' },
  { label: 'Emotional Discomfort', icon: Heart, prompt: 'I feel emotionally uncomfortable' },
];

export function ChatEmpty({ onQuickEmotion }: ChatEmptyProps) {
  return (
    <div className="flex items-center justify-center min-h-full p-6 md:p-8">
      <div className="max-w-2xl w-full text-center space-y-8">
        {/* Heading */}
        <div className="space-y-3">
          <h2 className="text-3xl md:text-4xl font-semibold text-foreground">
            How are you feeling today?
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Describe your emotional state, and I'll suggest supportive foods based on your health profile and preferences.
          </p>
        </div>

        {/* Quick emotion chips */}
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">Quick options:</p>
          <div className="flex flex-wrap justify-center gap-3">
            {emotionChips.map((chip) => (
              <Button
                key={chip.label}
                variant="outline"
                size="lg"
                onClick={() => onQuickEmotion(chip.prompt)}
                className="h-auto py-3 px-5 gap-2 hover:bg-primary/5 hover:border-primary/20"
              >
                <chip.icon className="h-5 w-5 text-primary" />
                <span>{chip.label}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Visual illustration placeholder */}
        <div className="pt-4">
          <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
            <Heart className="h-12 w-12 text-primary/40" />
          </div>
        </div>
      </div>
    </div>
  );
}
