import { useRef, useState } from 'react';
import { Camera, Loader2, Upload, X } from 'lucide-react';
import { Button } from '../../ui/button';
import { FeatureAccessNotice } from './FeatureAccessNotice';
import { FoodImageUploadSuccess, uploadsApi } from '../../../../lib/api';

interface FoodImageUploadPanelProps {
  hasAccess: boolean;
}

type PanelState = 'idle' | 'selected' | 'uploading' | 'result' | 'error';

export function FoodImageUploadPanel({ hasAccess }: FoodImageUploadPanelProps) {
  const [panelState, setPanelState] = useState<PanelState>('idle');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [result, setResult] = useState<FoodImageUploadSuccess | null>(null);
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

  const resetPreview = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setSelectedFile(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setMessage('Unsupported format. Use JPG, PNG, or WebP.');
      setPanelState('error');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setMessage('File too large. Maximum size is 10MB.');
      setPanelState('error');
      return;
    }

    resetPreview();
    setResult(null);
    setMessage(null);
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setPanelState('selected');
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setPanelState('uploading');
    setMessage(null);
    setResult(null);

    try {
      const response = await uploadsApi.uploadFoodImage(selectedFile);
      if (response.ok && response.data) {
        setResult(response.data);
        setPanelState('result');
        return;
      }
      setMessage(response.error?.message || 'Something went wrong. Please try again.');
      setPanelState('error');
    } catch {
      setMessage('Unable to reach the server. Please check your connection.');
      setPanelState('error');
    }
  };

  const handleReset = () => {
    resetPreview();
    setResult(null);
    setMessage(null);
    setPanelState('idle');
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
            Upload a clear food photo, and Mazaj+ will identify it and show simple nutrition guidance.
          </p>
          <Button variant="outline" size="sm" className="gap-2 w-full" onClick={() => inputRef.current?.click()}>
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

      {(panelState === 'selected' || panelState === 'uploading') && previewUrl && (
        <div className="space-y-3">
          <div className="relative rounded-lg overflow-hidden border border-border">
            <img src={previewUrl} alt="Selected food image preview" className="w-full h-28 object-cover" />
            <button
              onClick={handleReset}
              className="absolute top-1.5 right-1.5 rounded-full bg-black/60 p-0.5 hover:bg-black/80 transition-colors"
              aria-label="Remove selected image"
              disabled={panelState === 'uploading'}
            >
              <X className="h-3 w-3 text-white" />
            </button>
          </div>
          <Button size="sm" className="gap-2 w-full" onClick={handleUpload} disabled={panelState === 'uploading'}>
            {panelState === 'uploading' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
            {panelState === 'uploading' ? 'Analyzing...' : 'Analyze with Backend'}
          </Button>
        </div>
      )}

      {panelState === 'result' && result && (
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 space-y-2">
          <p className="text-xs font-semibold text-foreground">{result.matched_food.name}</p>
          <p className="text-[11px] text-muted-foreground">Recognized: {result.recognized_food}</p>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <span>Calories: {result.matched_food.calories}</span>
            <span>Protein: {result.matched_food.protein}g</span>
            <span>Carbs: {result.matched_food.carbs}g</span>
            <span>Fat: {result.matched_food.fat}g</span>
          </div>
          <p className="text-[11px] text-muted-foreground">{result.message}</p>
          <Button variant="outline" size="sm" className="w-full" onClick={handleReset}>
            Analyze Another Image
          </Button>
        </div>
      )}

      {panelState === 'error' && message && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3 space-y-3">
          <p className="text-xs text-destructive leading-relaxed">{message}</p>
          <Button variant="outline" size="sm" className="w-full" onClick={handleReset}>
            Try Again
          </Button>
        </div>
      )}
    </div>
  );
}
