import { useState, useRef } from 'react';
import { Send, Plus, Image, FileText } from 'lucide-react';
import { Button } from '../../ui/button';
import { Textarea } from '../../ui/textarea';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../ui/dropdown-menu';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: (message: string) => void;
  onUpload: (file: File, type: 'food_image' | 'inbody') => void;
  isLoading: boolean;
}

export function ChatInput({ value, onChange, onSend, onUpload, isLoading }: ChatInputProps) {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const inbodyInputRef = useRef<HTMLInputElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    if (value.trim() && !isLoading) {
      onSend(value);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'food_image' | 'inbody') => {
    const file = e.target.files?.[0];
    if (file) {
      onUpload(file, type);
      // Reset input so the same file can be uploaded again if needed
      e.target.value = '';
    }
  };

  return (
    <div className="border-t border-border bg-card">
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-4">
        <div className="flex gap-3">
          {/* Hidden File Inputs */}
          <input
            type="file"
            ref={imageInputRef}
            onChange={(e) => handleFileChange(e, 'food_image')}
            accept="image/jpeg,image/jpg,image/png,image/webp"
            className="hidden"
          />
          <input
            type="file"
            ref={inbodyInputRef}
            onChange={(e) => handleFileChange(e, 'inbody')}
            accept="application/pdf,image/jpeg,image/jpg,image/png"
            className="hidden"
          />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                disabled={isLoading}
                className="h-[60px] w-[60px] flex-shrink-0"
              >
                <Plus className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" side="top" className="w-48">
              <DropdownMenuItem onClick={() => imageInputRef.current?.click()} className="gap-2 cursor-pointer">
                <Image className="h-4 w-4" />
                <span>Upload Food Image</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => inbodyInputRef.current?.click()} className="gap-2 cursor-pointer">
                <FileText className="h-4 w-4" />
                <span>Upload InBody Report</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Tell Mazaj+ how you feel…"
            className="min-h-[60px] max-h-[200px] resize-none"
            disabled={isLoading}
          />
          <Button
            onClick={handleSubmit}
            disabled={!value.trim() || isLoading}
            size="icon"
            className="h-[60px] w-[60px] flex-shrink-0"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Press Enter to send, Shift + Enter for new line
        </p>
      </div>
    </div>
  );
}
