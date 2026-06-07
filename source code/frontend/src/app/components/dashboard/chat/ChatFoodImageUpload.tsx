import { useRef, useState } from 'react';
import { Camera, Loader2, Upload, X } from 'lucide-react';
import { Button } from '../../ui/button';
import { FeatureAccessNotice } from './FeatureAccessNotice';
import { chatApi } from '../../../../lib/api';

interface ChatFoodImageUploadProps {
  hasAccess: boolean;
  sessionId: number | null;
  onUploadSuccess: (newSessionId: number, userMsg: any, asstMsg: any) => void;
}

type PanelState = 'idle' | 'selected' | 'uploading' | 'error';

export function ChatFoodImageUpload({
  hasAccess,
  sessionId,
  onUploadSuccess,
}: ChatFoodImageUploadProps) {
  const [panelState, setPanelState] = useState<PanelState>('idle');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  if (!hasAccess) {
    return (
      <div className="flex gap-3">
        <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0">
          <Camera className="h-4 w-4 text-secondary" />
        </div>
        <div className="flex-1 max-w-xl">
          <FeatureAccessNotice message="Food Image upload requires a Pro or Ultra subscription." />
        </div>
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
    setMessage(null);
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setPanelState('selected');
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setPanelState('uploading');
    setMessage(null);

    try {
      const response = await chatApi.uploadFoodImage(selectedFile, sessionId);
      if (response.ok && response.data) {
        const { session_id, user_message, assistant_message } = response.data;
        onUploadSuccess(session_id, user_message, assistant_message);
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
    setMessage(null);
    setPanelState('idle');
  };

  return (
    <div className="flex gap-3">
      <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0">
        <Camera className="h-4 w-4 text-secondary" />
      </div>
      <div className="flex-1 max-w-xl space-y-3 bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/10 rounded-2xl rounded-tl-sm p-4 shadow-sm animate-in fade-in slide-in-from-bottom-3 duration-300">
        <div className="flex items-center gap-2">
          <Camera className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">Food Image Upload</span>
        </div>

        {panelState === 'idle' && (
          <div className="rounded-lg border border-dashed border-border bg-background p-4 text-center space-y-3">
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
            <div className="relative rounded-lg overflow-hidden border border-border bg-background">
              <img src={previewUrl} alt="Selected food image preview" className="w-full h-32 object-contain mx-auto" />
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
              {panelState === 'uploading' ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Analyzing image...
                </>
              ) : (
                <>
                  <Upload className="h-3.5 w-3.5" />
                  Analyze Food
                </>
              )}
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
    </div>
  );
}
