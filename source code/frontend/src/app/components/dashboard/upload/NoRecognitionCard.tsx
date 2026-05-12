import { Card, CardContent } from '../../ui/card';
import { Button } from '../../ui/button';
import { AlertCircle, RefreshCw, Image as ImageIcon } from 'lucide-react';

interface NoRecognitionCardProps {
  onTryAgain: () => void;
}

export function NoRecognitionCard({ onTryAgain }: NoRecognitionCardProps) {
  return (
    <Card className="bg-accent/10 border-accent/20">
      <CardContent className="p-8">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-accent/20 flex items-center justify-center">
            <AlertCircle className="h-8 w-8 text-accent" />
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-foreground">
              Could Not Identify Food
            </h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              We could not identify a food item in this image. 
              Please upload a clear food image with the food clearly visible.
            </p>
          </div>

          <div className="bg-card rounded-lg p-4 border border-border max-w-md mx-auto">
            <p className="text-xs text-muted-foreground mb-2 font-medium">Tips for better results:</p>
            <ul className="space-y-1.5 text-xs text-muted-foreground text-left">
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0"></div>
                <span>Ensure good lighting</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0"></div>
                <span>Center the food in the frame</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0"></div>
                <span>Avoid blurry images</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0"></div>
                <span>Use images with one main food item</span>
              </li>
            </ul>
          </div>

          <div className="flex flex-wrap gap-3 justify-center">
            <Button onClick={onTryAgain} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>
            <Button variant="outline" onClick={onTryAgain} className="gap-2">
              <ImageIcon className="h-4 w-4" />
              Choose Another Image
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
