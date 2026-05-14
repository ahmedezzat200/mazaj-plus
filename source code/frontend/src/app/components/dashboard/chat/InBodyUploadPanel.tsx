import { useState, useRef } from 'react';
import { FileText, Upload, X } from 'lucide-react';
import { Button } from '../../ui/button';
import { FeatureAccessNotice } from './FeatureAccessNotice';

interface InBodyUploadPanelProps {
  hasAccess: boolean;
}

// Only two states: idle (no file chosen yet) or selected (file chosen locally)
type PanelState = 'idle' | 'selected';

export function InBodyUploadPanel({ hasAccess }: InBodyUploadPanelProps) {
  const [panelState, setPanelState] = useState<PanelState>('idle');
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  if (!hasAccess) {
    return (
      <div>
        <div className="flex items-center gap-2 mb-3">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-semibold text-foreground">InBody Upload</span>
        </div>
        <FeatureAccessNotice featureLabel="InBody Upload" />
      </div>
    );
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png',
    ];
    if (!validTypes.includes(file.type)) {
      setFileError('Unsupported format. Use PDF, JPG, or PNG.');
      return;
    }
    const maxSize = 20 * 1024 * 1024;
    if (file.size > maxSize) {
      setFileError('File too large. Maximum size is 20MB.');
      return;
    }

    setFileError(null);
    setFileName(file.name);
    setPanelState('selected');
    e.target.value = '';
  };

  const handleReset = () => {
    setFileName(null);
    setPanelState('idle');
    setFileError(null);
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <FileText className="h-4 w-4 text-primary" />
        <span className="text-sm font-semibold text-foreground">InBody Upload</span>
      </div>

      {panelState === 'idle' && (
        <div className="rounded-lg border border-dashed border-border bg-muted/20 p-4 text-center space-y-3">
          <p className="text-xs text-muted-foreground leading-relaxed">
            Select your InBody report (PDF or image) to preview it. Upload storage and automated parsing are under development — no file is stored and no body composition values are generated yet.
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
            Choose File
          </Button>
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf,image/jpeg,image/jpg,image/png"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      )}

      {panelState === 'selected' && fileName && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/20 px-3 py-2">
            <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="text-xs text-foreground truncate flex-1">{fileName}</span>
            <button
              onClick={handleReset}
              className="hover:text-destructive transition-colors"
              aria-label="Remove selected file"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Safe placeholder — no backend call, no fake body composition */}
          <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 space-y-1">
            <p className="text-xs text-foreground leading-relaxed">
              <strong>Report selected.</strong> InBody upload storage and automated parsing are under development. No file is stored and no body composition analysis is generated yet.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="gap-2 w-full"
            onClick={handleReset}
          >
            <Upload className="h-3.5 w-3.5" />
            Choose Another File
          </Button>
        </div>
      )}
    </div>
  );
}
