import { Leaf, HelpCircle } from 'lucide-react';
import { Button } from '../../ui/button';

interface PlanClarificationCardProps {
  content: string;
  quickActions: string[];
  onQuickAction: (action: string) => void;
}

export function PlanClarificationCard({ content, quickActions, onQuickAction }: PlanClarificationCardProps) {
  return (
    <div className="flex justify-start">
      <div className="max-w-2xl w-full">
        <div className="flex gap-3">
          <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0">
            <Leaf className="h-4 w-4 text-secondary" />
          </div>
          <div className="flex-1 space-y-4">
            <div className="bg-card border border-border rounded-2xl rounded-tl-sm px-5 py-4 shadow-sm">
              <div className="flex items-start gap-2 mb-3">
                <HelpCircle className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                <p className="text-sm font-medium text-accent">Additional Information Needed</p>
              </div>
              <p className="text-sm leading-relaxed text-foreground">{content}</p>
            </div>
            
            {/* Quick action chips */}
            <div className="flex flex-wrap gap-2 pl-11">
              {quickActions.map((action) => (
                <Button
                  key={action}
                  variant="outline"
                  size="sm"
                  onClick={() => onQuickAction(action)}
                  className="rounded-full hover:bg-primary/5 hover:border-primary/20"
                >
                  {action}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
