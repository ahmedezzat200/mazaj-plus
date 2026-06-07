import { FileText, ShieldAlert } from 'lucide-react';
import { Badge } from '../../ui/badge';

interface InBodyAdvisoryCardProps {
  content: string;
}

function renderInlineMarkdown(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index} className="font-semibold text-foreground">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return <em key={index} className="text-muted-foreground not-italic">{part.slice(1, -1)}</em>;
    }
    return <span key={index}>{part}</span>;
  });
}

function cleanLine(line: string) {
  return line
    .replace(/^#{1,6}\s+/, '')
    .replace(/^\s*-\s+/, '')
    .trim();
}

export function InBodyMarkdown({ content, compact = false }: { content: string; compact?: boolean }) {
  const lines = content.split('\n');

  return (
    <div className={`text-sm leading-relaxed text-foreground ${compact ? 'space-y-2' : 'space-y-3'}`}>
      {lines.map((rawLine, index) => {
        const line = rawLine.trim();
        if (!line) {
          return <div key={index} className={compact ? 'h-0.5' : 'h-1'} />;
        }
        if (line.startsWith('## ')) {
          return (
            <div key={index} className={compact ? 'pt-1' : 'pt-3 first:pt-0'}>
              <h3 className="inline-flex items-center rounded-full bg-secondary/10 px-3 py-1.5 text-[13px] font-semibold text-secondary">
                {cleanLine(line)}
              </h3>
            </div>
          );
        }
        if (line.startsWith('### ')) {
          return (
            <h4 key={index} className="pt-2 text-sm font-semibold text-foreground">
              {cleanLine(line)}
            </h4>
          );
        }
        if (line.startsWith('- ')) {
          return (
            <div key={index} className="flex gap-3 rounded-md border border-border/70 bg-background/70 px-3 py-2">
              <span className="mt-2 h-1.5 w-1.5 rounded-full bg-secondary flex-shrink-0" />
              <p className="min-w-0">{renderInlineMarkdown(cleanLine(line))}</p>
            </div>
          );
        }
        return (
          <p key={index} className="text-foreground/90">
            {renderInlineMarkdown(line)}
          </p>
        );
      })}
    </div>
  );
}

export function InBodyAdvisoryCard({ content }: InBodyAdvisoryCardProps) {
  return (
    <div className="flex justify-start animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="max-w-3xl w-full">
        <div className="flex gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
            <FileText className="h-4 w-4 text-blue-500" />
          </div>
          <div className="flex-1 space-y-4">
            <div className="bg-gradient-to-br from-secondary/5 via-card to-blue-500/5 border border-secondary/15 rounded-2xl rounded-tl-sm shadow-sm overflow-hidden">
              {/* Header */}
              <div className="p-4 border-b border-border bg-card/50">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="h-5 w-5 text-secondary" />
                  <Badge variant="secondary" className="bg-secondary/10 text-secondary">
                    InBody Scan Advisory
                  </Badge>
                </div>
              </div>

              {/* Content */}
              <div className="p-5">
                <InBodyMarkdown content={content} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
