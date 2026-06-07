import { useState } from 'react';
import { AlertCircle, X } from 'lucide-react';

const DISMISSED_KEY = 'advisory_dismissed';

export function DashboardAdvisoryBanner() {
  const [dismissed, setDismissed] = useState(
    () => localStorage.getItem(DISMISSED_KEY) === '1'
  );

  if (dismissed) return null;

  const handleDismiss = () => {
    localStorage.setItem(DISMISSED_KEY, '1');
    setDismissed(true);
  };

  return (
    <div className="bg-accent/10 border border-accent/20 rounded-lg px-4 py-3 flex items-start gap-3">
      <AlertCircle className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
      <p className="text-sm text-foreground flex-1">
        <span className="font-medium">Advisory Notice:</span> Mazaj+ provides advisory nutrition guidance only.
        This platform does not diagnose, prescribe treatment, or replace healthcare professionals.
        Always consult your doctor before making health decisions.
      </p>
      <button
        onClick={handleDismiss}
        aria-label="Dismiss advisory notice"
        className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
