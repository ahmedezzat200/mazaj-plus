import { Leaf } from 'lucide-react';

export function LoadingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="flex gap-3">
        <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0">
          <Leaf className="h-4 w-4 text-secondary" />
        </div>
        <div className="bg-card border border-border rounded-2xl rounded-tl-sm px-5 py-4 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              <div className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
            <span className="text-xs text-muted-foreground">Analyzing your request...</span>
          </div>
        </div>
      </div>
    </div>
  );
}
