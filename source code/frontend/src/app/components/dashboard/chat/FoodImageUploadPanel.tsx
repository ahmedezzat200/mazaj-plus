import { useState, useRef } from 'react';
import { Camera, Upload, X } from 'lucide-react';
import { Button } from '../../ui/button';
import { FeatureAccessNotice } from './FeatureAccessNotice';

interface FoodImageUploadPanelProps {
  hasAccess: boolean;
}

// Only two states: idle (no file chosen yet) or selected (file chosen locally)
type PanelState = 'idle' | 'selected';

export function FoodImageUploadPanel({ hasAccess }: FoodImageUploadPanelProps) {
  const [panelState, setPanelState] = useState<PanelState>('idle');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  if (!hasAccess) {
    return (
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Camera className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-semibold text-foreground">Food Image Analysis</span>
        </div>
        <FeatureAccessNotice featureLabel="Food Image Upload" />
      </div>
    );
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setFileError('Unsupported format. Use JPG, PNG, or WebP.');
      return;
    }
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      setFileError('File too large. Maximum size is 10MB.');
      return;
    }

    setFileError(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setPanelState('selected');
    e.target.value = '';
  };

  const handleReset = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setPanelState('idle');
    setFileError(null);
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Camera className="h-4 w-4 text-primary" />
        <span className="text-sm font-semibold text-foreground">Food Image Analysis</span>
      </div>

      {panelState === 'idle' && (
        <div className="rounded-lg border border-dashed border-border bg-muted/20 p-4 text-center space-y-3">
          <p className="text-xs text-muted-foreground leading-relaxed">
            Select a food photo to preview it. Recognition workflow is under development — no file is uploaded and no nutrition estimates are generated yet.
          </p>
          {fileError && (
            <p className="text-xs text-destructive">{fileError}</p>
          )}
          <Button
            variant="outline"
            size="sm"
            className="gap-2 w-full"
            onClick={() => inputRef.current?.click()}
          >
            <Upload className="h-3.5 w-3.5" />
            Choose Image
          </Button>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      )}

      {panelState === 'selected' && previewUrl && (
        <div className="space-y-3">
          <div className="relative rounded-lg overflow-hidden border border-border">
            <img
              src={previewUrl}
              alt="Selected food image preview"
              className="w-full h-28 object-cover"
            />
            <button
              onClick={handleReset}
              className="absolute top-1.5 right-1.5 rounded-full bg-black/60 p-0.5 hover:bg-black/80 transition-colors"
              aria-label="Remove selected image"
            >
              <X className="h-3 w-3 text-white" />
            </button>
          </div>

          {/* Safe placeholder — no backend call, no fake analysis */}
          <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 space-y-1">
            <p className="text-xs text-foreground leading-relaxed">
              <strong>Image selected.</strong> Food image recognition workflow is under development. No file is uploaded and no nutrition estimate is generated yet.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="gap-2 w-full"
            onClick={handleReset}
          >
            <Upload className="h-3.5 w-3.5" />
            Choose Another Image
          </Button>
        </div>
      )}
    </div>
  );
}
