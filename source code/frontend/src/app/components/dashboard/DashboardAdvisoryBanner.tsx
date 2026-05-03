import { AlertCircle } from 'lucide-react';

export function DashboardAdvisoryBanner() {
  return (
    <div className="bg-accent/10 border border-accent/20 rounded-lg px-4 py-3 flex items-start gap-3">
      <AlertCircle className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
      <p className="text-sm text-foreground">
        <span className="font-medium">Advisory Notice:</span> Mazaj+ provides advisory nutrition guidance only. 
        This platform does not diagnose, prescribe treatment, or replace healthcare professionals. 
        Always consult your doctor before making health decisions.
      </p>
    </div>
  );
}
