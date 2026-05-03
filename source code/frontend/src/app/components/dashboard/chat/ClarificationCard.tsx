import { Leaf, HelpCircle } from 'lucide-react';
import { Button } from '../../ui/button';

interface ClarificationCardProps {
  content: string;
  quickReplies: string[];
  onQuickReply: (reply: string) => void;
}

export function ClarificationCard({ content, quickReplies, onQuickReply }: ClarificationCardProps) {
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
                <p className="text-sm font-medium text-accent">Clarification Needed</p>
              </div>
              <p className="text-sm leading-relaxed text-foreground">{content}</p>
            </div>
            
            {/* Quick reply chips */}
            <div className="flex flex-wrap gap-2 pl-11">
              {quickReplies.map((reply) => (
                <Button
                  key={reply}
                  variant="outline"
                  size="sm"
                  onClick={() => onQuickReply(reply)}
                  className="rounded-full hover:bg-primary/5 hover:border-primary/20"
                >
                  {reply}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
