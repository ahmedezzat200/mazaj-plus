import { Lock } from 'lucide-react';

interface FeatureAccessNoticeProps {
  title?: string;
  message?: string;
}

export function FeatureAccessNotice({
  title = 'Feature locked',
  message = 'This feature requires Pro or Ultra.',
}: FeatureAccessNoticeProps) {
  return (
    <div className="rounded-xl border border-border bg-muted/40 p-4">
      <div className="flex items-start gap-3">
        <div className="rounded-lg bg-background p-2">
          <Lock className="h-4 w-4 text-muted-foreground" />
        </div>

        <div>
          <h4 className="text-sm font-medium">{title}</h4>
          <p className="mt-1 text-sm text-muted-foreground">{message}</p>
        </div>
      </div>
    </div>
  );
}