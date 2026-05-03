import { Upload, Image, FileText, Clock } from 'lucide-react';
import { Card } from '../ui/card';

export function UploadReviewSummary() {
  return (
    <Card className="p-6">
      <div className="mb-4">
        <h3>Upload Review Summary</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Recent upload activity metadata overview
        </p>
      </div>

      <div className="space-y-4">
        {/* This Week Overview */}
        <div className="p-4 bg-muted/30 border border-border rounded-lg">
          <div className="flex items-center gap-3 mb-3">
            <Upload className="h-5 w-5 text-primary" />
            <h4>This Week</h4>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Food Images</p>
              <p className="text-2xl font-semibold">94</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">InBody Uploads</p>
              <p className="text-2xl font-semibold">34</p>
            </div>
          </div>
        </div>

        {/* Recent Upload Events */}
        <div className="space-y-2">
          <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Image className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">Food image uploaded</p>
              <p className="text-xs text-muted-foreground">23 minutes ago</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <FileText className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">InBody data uploaded</p>
              <p className="text-xs text-muted-foreground">4 hours ago</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Image className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">Food image uploaded</p>
              <p className="text-xs text-muted-foreground">6 hours ago</p>
            </div>
          </div>
        </div>

        {/* Empty State (commented out) */}
        {/* <div className="text-center py-8 border border-dashed border-border rounded-lg">
          <Clock className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm font-medium mb-1">No Recent Uploads</p>
          <p className="text-xs text-muted-foreground">
            Upload activity will appear here
          </p>
        </div> */}
      </div>
    </Card>
  );
}
