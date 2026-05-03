import { AlertCircle, RotateCcw, Home } from 'lucide-react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';

interface UpgradeFailureCardProps {
  onTryAgain: () => void;
  onReturnToDashboard: () => void;
}

export function UpgradeFailureCard({ onTryAgain, onReturnToDashboard }: UpgradeFailureCardProps) {
  return (
    <Card className="p-8 text-center border-2 border-destructive/20">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10 mb-4">
        <AlertCircle className="h-8 w-8 text-destructive" />
      </div>

      <h2 className="mb-2">Upgrade Could Not Be Completed</h2>
      <p className="text-muted-foreground mb-6">
        We encountered an issue while processing your subscription upgrade.
        Please try again or contact support if the problem persists.
      </p>

      <div className="bg-muted/50 rounded-lg p-4 mb-6 text-left max-w-md mx-auto">
        <p className="font-medium mb-2 text-sm">Common issues:</p>
        <ul className="space-y-1 text-sm text-muted-foreground">
          <li>• Payment verification failed</li>
          <li>• Connection timeout</li>
          <li>• Account settings need verification</li>
        </ul>
      </div>

      <div className="p-3 bg-accent/10 border border-accent/20 rounded-lg mb-6">
        <p className="text-sm text-accent-foreground">
          <strong>Note:</strong> This is a simulated error for demonstration purposes.
          In a production environment, specific error details would be provided.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button size="lg" onClick={onTryAgain}>
          <RotateCcw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
        <Button size="lg" variant="outline" onClick={onReturnToDashboard}>
          <Home className="h-4 w-4 mr-2" />
          Return to Dashboard
        </Button>
      </div>
    </Card>
  );
}
