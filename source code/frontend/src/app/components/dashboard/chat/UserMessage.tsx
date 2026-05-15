import { format } from 'date-fns';
import { Image, FileText } from 'lucide-react';

interface UserMessageProps {
  content: string;
  timestamp: Date;
  attachment?: {
    name: string;
    type: 'food_image' | 'inbody';
  };
}

export function UserMessage({ content, timestamp, attachment }: UserMessageProps) {
  return (
    <div className="flex justify-end">
      <div className="max-w-2xl">
        <div className="bg-primary text-primary-foreground rounded-2xl rounded-tr-sm px-5 py-4 shadow-sm">
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{content}</p>
          
          {attachment && (
            <div className="flex items-center gap-2 mt-3 px-3 py-2 bg-black/10 rounded-lg border border-white/10">
              {attachment.type === 'food_image' ? (
                <Image className="h-4 w-4 text-primary-foreground" />
              ) : (
                <FileText className="h-4 w-4 text-primary-foreground" />
              )}
              <span className="text-xs font-medium truncate max-w-[200px]">
                {attachment.name}
              </span>
            </div>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-right">
          {format(timestamp, 'h:mm a')}
        </p>
      </div>
    </div>
  );
}
