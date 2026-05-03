import { Shield } from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';

export function AdminBoundaryBanner() {
  return (
    <Alert className="bg-accent/10 border-accent/20">
      <Shield className="h-4 w-4 text-accent" />
      <AlertDescription className="text-accent-foreground">
        <strong>Admin Notice:</strong> This portal is for operational management only. Sensitive user health data,
        private chat content, nutrition plans, and personal health information are not accessible from this interface.
      </AlertDescription>
    </Alert>
  );
}
