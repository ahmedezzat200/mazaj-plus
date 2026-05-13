import { Shield } from 'lucide-react';
import { Card } from '../ui/card';

export function UploadReviewSummary() {
  return (
    <Card className="p-6">
      <div className="mb-4">
        <h3>Upload Review Summary</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Upload contents and InBody details are restricted for privacy.
        </p>
      </div>

      <div className="text-center py-10 border border-dashed border-border rounded-lg">
        <Shield className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
        <p className="text-sm font-medium mb-1">No Private Upload Data Shown</p>
        <p className="text-xs text-muted-foreground max-w-sm mx-auto">
          Admin users can manage public platform data only. Private uploads are not displayed in this interface.
        </p>
      </div>
    </Card>
  );
}
