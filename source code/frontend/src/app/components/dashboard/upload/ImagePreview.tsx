import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Image as ImageIcon, X, RefreshCw, Sparkles } from 'lucide-react';
import { UploadedImage } from './FoodImageAnalysisPage';

interface ImagePreviewProps {
  image: UploadedImage;
  onAnalyze: () => void;
  onRemove: () => void;
  onReplace: () => void;
}

export function ImagePreview({ image, onAnalyze, onRemove, onReplace }: ImagePreviewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5 text-primary" />
          Image Preview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Image preview */}
        <div className="relative rounded-xl overflow-hidden bg-muted border border-border">
          <img
            src={image.preview}
            alt="Food preview"
            className="w-full h-auto max-h-96 object-contain"
          />
        </div>

        {/* File info */}
        <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border">
          <div className="flex items-center gap-2 min-w-0">
            <ImageIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="text-sm text-foreground truncate">{image.file.name}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className="flex-shrink-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3">
          <Button onClick={onAnalyze} size="lg" className="flex-1">
            <Sparkles className="h-5 w-5 mr-2" />
            Analyze Food Image
          </Button>
          <Button variant="outline" onClick={onReplace}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Replace
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
