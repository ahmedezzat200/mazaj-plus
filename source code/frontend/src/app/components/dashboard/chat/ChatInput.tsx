import { useState, useEffect, useRef, useCallback } from 'react';
import { Send, Plus, Camera, FileText, ClipboardList } from 'lucide-react';
import { Button } from '../../ui/button';

const PLACEHOLDERS = [
  'How are you feeling today?',
  'What did you eat today?',
  'Tell me your nutrition goal…',
  'I need energy today…',
  'What should I eat for breakfast?',
  'I feel stressed and need comfort food ideas…',
];

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: (message: string) => void;
  isLoading: boolean;
  onGeneratePlan: () => void;
  onUploadFoodImage: (file: File) => void;
  onUploadInBody: (file: File) => void;
}

export function ChatInput({
  value,
  onChange,
  onSend,
  isLoading,
  onGeneratePlan,
  onUploadFoodImage,
  onUploadInBody,
}: ChatInputProps) {
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [placeholderVisible, setPlaceholderVisible] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const foodImageInputRef = useRef<HTMLInputElement>(null);
  const inBodyInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleFoodImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (file) {
      onUploadFoodImage(file);
    }
  };

  const handleInBodyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (file) {
      onUploadInBody(file);
    }
  };

  // Cycle placeholder every 3 seconds when input is empty
  useEffect(() => {
    if (value) return;
    const interval = setInterval(() => {
      setPlaceholderVisible(false);
      setTimeout(() => {
        setPlaceholderIndex((i) => (i + 1) % PLACEHOLDERS.length);
        setPlaceholderVisible(true);
      }, 300);
    }, 3000);
    return () => clearInterval(interval);
  }, [value]);

  // Auto-grow textarea
  const adjustHeight = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }, []);

  useEffect(() => {
    adjustHeight();
  }, [value, adjustHeight]);

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

  return (
    <div className="border-t border-border bg-card/95 backdrop-blur-sm">
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-4">
        <div className="flex gap-3 items-end">
          <div className="relative" ref={dropdownRef}>
            <Button
              type="button"
              variant="outline"
              size="icon"
              disabled={isLoading}
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="h-[48px] w-[48px] rounded-xl flex-shrink-0 border-border bg-background hover:bg-muted transition-all duration-200"
              aria-label="Add attachment or action"
            >
              <Plus className={`h-5 w-5 transition-transform duration-200 ${isDropdownOpen ? 'rotate-45' : ''}`} />
            </Button>
            
            {isDropdownOpen && (
              <div className="absolute bottom-full left-0 mb-2 w-64 bg-popover border border-border rounded-xl shadow-xl p-1.5 z-50 animate-in slide-in-from-bottom-2 fade-in duration-200">
                <button
                  type="button"
                  onClick={() => { setIsDropdownOpen(false); onGeneratePlan(); }}
                  className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-foreground hover:bg-muted rounded-lg transition-colors text-left font-medium"
                >
                  <ClipboardList className="h-4 w-4 text-purple-500 flex-shrink-0" />
                  <span>Generate Nutrition Plan</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setIsDropdownOpen(false); foodImageInputRef.current?.click(); }}
                  className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-foreground hover:bg-muted rounded-lg transition-colors text-left font-medium"
                >
                  <Camera className="h-4 w-4 text-orange-500 flex-shrink-0" />
                  <span>Upload Food Image</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setIsDropdownOpen(false); inBodyInputRef.current?.click(); }}
                  className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-foreground hover:bg-muted rounded-lg transition-colors text-left font-medium"
                >
                  <FileText className="h-4 w-4 text-indigo-500 flex-shrink-0" />
                  <span>Upload InBody Report</span>
                </button>
              </div>
            )}

            <input
              ref={foodImageInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleFoodImageChange}
              className="hidden"
            />

            <input
              ref={inBodyInputRef}
              type="file"
              accept="application/pdf,image/jpeg,image/jpg,image/png"
              onChange={handleInBodyChange}
              className="hidden"
            />
          </div>

          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => { onChange(e.target.value); adjustHeight(); }}
              onKeyDown={handleKeyDown}
              placeholder={PLACEHOLDERS[placeholderIndex]}
              rows={1}
              disabled={isLoading}
              className={`
                w-full resize-none rounded-xl border border-border bg-background
                px-4 py-3 text-sm leading-relaxed
                focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50
                disabled:opacity-60 disabled:cursor-not-allowed
                transition-all duration-200
                min-h-[48px] max-h-[200px] overflow-y-auto
                placeholder:transition-opacity placeholder:duration-300
                ${!value && !placeholderVisible ? 'placeholder:opacity-0' : 'placeholder:opacity-60'}
              `}
            />
          </div>
          <Button
            onClick={handleSubmit}
            disabled={!value.trim() || isLoading}
            size="icon"
            className="h-[48px] w-[48px] flex-shrink-0 rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-primary-foreground/40 border-t-primary-foreground rounded-full animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Press Enter to send · Shift + Enter for new line
        </p>
      </div>
    </div>
  );
}
