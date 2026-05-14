import { useRef, useState } from 'react';
import { FileText, Loader2, Upload, X } from 'lucide-react';
import { Button } from '../../ui/button';
import { FeatureAccessNotice } from './FeatureAccessNotice';
import { uploadsApi } from '../../../../lib/api';

interface InBodyUploadPanelProps {
  hasAccess: boolean;
}

type PanelState = 'idle' | 'selected' | 'uploading' | 'success' | 'error';

export function InBodyUploadPanel({ hasAccess }: InBodyUploadPanelProps) {
  const [panelState, setPanelState] = useState<PanelState>('idle');
  const [fileName, setFileName] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string | null>(null);
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
    e.target.value = '';
    if (!file) return;

    const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      setMessage('Unsupported format. Use PDF, JPG, or PNG.');
      setPanelState('error');
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setMessage('File too large. Maximum size is 20MB.');
      setPanelState('error');
      return;
    }

    setSelectedFile(file);
    setFileName(file.name);
    setMessage(null);
    setPanelState('selected');
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setPanelState('uploading');
    setMessage(null);

    try {
      const response = await uploadsApi.uploadInBody(selectedFile);
      if (response.ok && response.data) {
        setMessage(response.data.message);
        setPanelState('success');
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
    setFileName(null);
    setSelectedFile(null);
    setMessage(null);
    setPanelState('idle');
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
            Upload a PDF or image report. The backend validates access and file type; no body composition analysis is generated.
          </p>
          <Button variant="outline" size="sm" className="gap-2 w-full" onClick={() => inputRef.current?.click()}>
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

      {(panelState === 'selected' || panelState === 'uploading') && fileName && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/20 px-3 py-2">
            <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="text-xs text-foreground truncate flex-1">{fileName}</span>
            <button onClick={handleReset} className="hover:text-destructive transition-colors" aria-label="Remove selected file" disabled={panelState === 'uploading'}>
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          <Button size="sm" className="gap-2 w-full" onClick={handleUpload} disabled={panelState === 'uploading'}>
            {panelState === 'uploading' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
            {panelState === 'uploading' ? 'Uploading...' : 'Upload to Backend'}
          </Button>
        </div>
      )}

      {panelState === 'success' && message && (
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 space-y-3">
          <p className="text-xs text-foreground leading-relaxed">{message}</p>
          <Button variant="outline" size="sm" className="w-full" onClick={handleReset}>
            Upload Another Report
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
