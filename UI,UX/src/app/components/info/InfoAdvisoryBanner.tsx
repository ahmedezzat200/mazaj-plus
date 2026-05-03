import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';

export function InfoAdvisoryBanner() {
  return (
    <Alert className="bg-accent/10 border-accent/20">
      <AlertCircle className="h-4 w-4 text-accent" />
      <AlertDescription className="text-accent-foreground">
        <strong>Important Notice:</strong> Mazaj+ provides advisory nutrition guidance and information only.
        This platform does not diagnose medical conditions, prescribe treatment, or replace the advice of
        qualified healthcare professionals such as doctors, registered dietitians, or nutritionists.
      </AlertDescription>
    </Alert>
  );
}
