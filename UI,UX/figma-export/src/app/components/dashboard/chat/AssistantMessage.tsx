import { format } from 'date-fns';
import { Leaf } from 'lucide-react';

interface AssistantMessageProps {
  content: string;
  timestamp: Date;
}

export function AssistantMessage({ content, timestamp }: AssistantMessageProps) {
  return (
    <div className="flex justify-start">
      <div className="max-w-2xl">
        <div className="flex gap-3">
          <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0">
            <Leaf className="h-4 w-4 text-secondary" />
          </div>
          <div className="flex-1">
            <div className="bg-card border border-border rounded-2xl rounded-tl-sm px-5 py-4 shadow-sm">
              <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">{content}</p>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {format(timestamp, 'h:mm a')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
