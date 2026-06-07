import { Clock } from 'lucide-react';

interface ComingSoonCardProps {
  title: string;
  description?: string;
}

export function ComingSoonCard({ title, description }: ComingSoonCardProps) {
  return (
    <div className="p-6 flex items-start gap-4 bg-card border border-border rounded-xl max-w-lg">
      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
        <Clock className="w-5 h-5 text-muted-foreground" />
      </div>
      <div>
        <h3 className="font-semibold text-foreground mb-1">{title}</h3>
        <p className="text-sm text-muted-foreground">
          {description ?? 'This section is under development and will be available in a future update.'}
        </p>
      </div>
    </div>
  );
}
