import { format } from 'date-fns';

interface UserMessageProps {
  content: string;
  timestamp: Date;
}

export function UserMessage({ content, timestamp }: UserMessageProps) {
  return (
    <div className="flex justify-end">
      <div className="max-w-2xl">
        <div className="bg-primary text-primary-foreground rounded-2xl rounded-tr-sm px-5 py-4 shadow-sm">
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{content}</p>
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-right">
          {format(timestamp, 'h:mm a')}
        </p>
      </div>
    </div>
  );
}
