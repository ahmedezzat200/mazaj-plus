import { Sparkles, Leaf, Droplet, ClipboardList, Camera, FileText, BarChart3, Info } from 'lucide-react';
import { Button } from '../../ui/button';
import { Card, CardContent } from '../../ui/card';

interface ChatEmptyProps {
  onQuickAction: (actionId: string, prompt: string) => void;
}

const featureHubItems = [
  {
    id: 'mood',
    label: 'Mood Guidance',
    description: 'Get supportive food ideas for your current mood.',
    icon: Sparkles,
    prompt: 'I feel stressed and need a food recommendation.',
    color: 'text-primary',
    bg: 'bg-primary/10',
  },
  {
    id: 'alternatives',
    label: 'Healthy Alternative',
    description: 'Find better swaps for your favorite snacks.',
    icon: Leaf,
    prompt: 'Suggest a healthy alternative to cola.',
    color: 'text-green-500',
    bg: 'bg-green-500/10',
  },
  {
    id: 'hydration',
    label: 'Hydration Check',
    description: 'Check your daily water target and progress.',
    icon: Droplet,
    prompt: 'How much water should I drink today?',
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
  },
  {
    id: 'plan',
    label: 'Nutrition Plan',
    description: 'Request a personalized daily meal guide.',
    icon: ClipboardList,
    prompt: 'Make a nutrition plan.',
    color: 'text-purple-500',
    bg: 'bg-purple-500/10',
  },
  {
    id: 'upload',
    label: 'Food Image',
    description: 'Estimate nutrition from a food photo.',
    icon: Camera,
    prompt: 'Analyze my food image.',
    color: 'text-orange-500',
    bg: 'bg-orange-500/10',
    tier: 'Pro+',
  },
  {
    id: 'inbody',
    label: 'InBody Scan',
    description: 'Sync and analyze your body metrics.',
    icon: FileText,
    prompt: 'Process my InBody report.',
    color: 'text-indigo-500',
    bg: 'bg-indigo-500/10',
    tier: 'Pro+',
  },
  {
    id: 'tracking',
    label: 'Weekly Report',
    description: 'Review your nutrition progress trends.',
    icon: BarChart3,
    prompt: 'Show my weekly nutrition report.',
    color: 'text-pink-500',
    bg: 'bg-pink-500/10',
    tier: 'Ultra',
  },
];

export function ChatEmpty({ onQuickAction }: ChatEmptyProps) {
  return (
    <div className="flex items-center justify-center min-h-full p-4 md:p-8">
      <div className="max-w-4xl w-full space-y-10">
        {/* Heading */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium mb-2">
            <Sparkles className="h-3 w-3" />
            <span>Unified Feature Hub</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
            Welcome to Mazaj+ Chat
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Your central hub for personalized food guidance. Select a quick action below or type your request to get started.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {featureHubItems.map((item) => (
            <Card 
              key={item.id}
              className="group cursor-pointer hover:border-primary/50 hover:shadow-md transition-all duration-300 overflow-hidden"
              onClick={() => onQuickAction(item.id, item.prompt)}
            >
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                    <item.icon className={`h-5 w-5 ${item.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h3 className="font-semibold text-foreground text-sm truncate">{item.label}</h3>
                      {item.tier && (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 bg-muted px-1.5 py-0.5 rounded">
                          {item.tier}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Advisory Footer */}
        <div className="pt-6 flex flex-col items-center gap-4 border-t border-border/50">
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/30 px-4 py-2 rounded-full border border-border/50">
            <Info className="h-3 w-3" />
            <span>Advisory decision-support only. Not a medical substitute.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
