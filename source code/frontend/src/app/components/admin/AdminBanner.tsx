import { Shield } from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';

interface AdminBannerProps {
  message: string;
}

export function AdminBanner({ message }: AdminBannerProps) {
  return (
    <Alert className="bg-accent/10 border-accent/20">
      <Shield className="h-4 w-4 text-accent" />
      <AlertDescription className="text-accent-foreground">{message}</AlertDescription>
    </Alert>
  );
}
