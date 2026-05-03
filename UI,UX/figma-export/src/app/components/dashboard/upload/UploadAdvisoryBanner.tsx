import { AlertCircle } from 'lucide-react';

export function UploadAdvisoryBanner() {
  return (
    <div className="bg-accent/10 border border-accent/20 rounded-lg px-4 py-3 flex items-start gap-3">
      <AlertCircle className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
      <div className="text-sm text-foreground">
        <p>
          <span className="font-medium">How This Works:</span> Mazaj+ uses image recognition to identify the food in your photo. 
          Nutrition values are retrieved from our internal database and are estimates only. 
          Results are advisory and do not replace professional nutritional guidance.
        </p>
      </div>
    </div>
  );
}
