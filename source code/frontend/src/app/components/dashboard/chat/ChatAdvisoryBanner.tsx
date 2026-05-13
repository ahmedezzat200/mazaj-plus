import { AlertCircle } from 'lucide-react';

export function ChatAdvisoryBanner() {
  return (
    <div className="border-b border-border bg-accent/5">
      <div className="max-w-3xl mx-auto px-4 md:px-6 py-3">
        <div className="flex items-start gap-2">
          <AlertCircle className="h-4 w-4 text-accent flex-shrink-0 mt-0.5" />
          <p className="text-xs text-foreground">
            <span className="font-medium">Advisory Only:</span> Mazaj+ provides nutrition guidance and does not diagnose, prescribe treatment, or replace healthcare professionals.
          </p>
        </div>
      </div>
    </div>
  );
}
