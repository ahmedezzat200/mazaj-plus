import { Shield } from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';

export function AdminManagementBanner() {
  return (
    <Alert className="bg-accent/10 border-accent/20">
      <Shield className="h-4 w-4 text-accent" />
      <AlertDescription className="text-accent-foreground">
        <strong>Operational Management Area:</strong> This interface is for account and food data management only.
        Administrators must not access private chat messages, nutrition plans, health conditions, allergies, or body measurements.
        Only safe operational metadata is displayed.
      </AlertDescription>
    </Alert>
  );
}
