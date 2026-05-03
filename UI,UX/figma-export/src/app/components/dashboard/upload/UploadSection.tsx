import { useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Upload, Image as ImageIcon } from 'lucide-react';

interface UploadSectionProps {
  onUpload: (file: File) => void;
}

export function UploadSection({ onUpload }: UploadSectionProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      onUpload(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpload(file);
    }
  };

  const handleChooseFile = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5 text-primary" />
          Upload a Food Image
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-2">
          Upload a clear photo of your food to identify it and get estimated nutrition values from our database.
        </p>
      </CardHeader>
      <CardContent>
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            border-2 border-dashed rounded-xl p-12 text-center transition-colors
            ${isDragging 
              ? 'border-primary bg-primary/5' 
              : 'border-border bg-muted/20 hover:border-primary/50'
            }
          `}
        >
          <div className="space-y-4">
            {/* Upload icon */}
            <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
              <Upload className="h-8 w-8 text-primary" />
            </div>

            {/* Instructions */}
            <div className="space-y-2">
              <p className="text-foreground font-medium">
                Drag and drop your image here
              </p>
              <p className="text-sm text-muted-foreground">
                or click the button below to browse
              </p>
            </div>

            {/* Upload button */}
            <Button onClick={handleChooseFile} size="lg">
              Choose Image
            </Button>

            {/* File support note */}
            <p className="text-xs text-muted-foreground">
              Supports JPG and PNG (max 10MB)
            </p>
          </div>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      </CardContent>
    </Card>
  );
}
