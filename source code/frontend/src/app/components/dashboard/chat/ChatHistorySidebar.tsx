import { formatDistanceToNow } from 'date-fns';
import { MessageSquare, Plus, Loader2, AlertCircle, Trash2 } from 'lucide-react';
import { Button } from '../../ui/button';

interface ChatSessionInfo {
  id: number;
  title: string;
  created_at: string;
  updated_at: string;
}

interface ChatHistorySidebarProps {
  sessions: ChatSessionInfo[];
  activeSessionId: number | null;
  isLoading: boolean;
  isError: boolean;
  onSelectSession: (id: number) => void;
  onNewChat: () => void;
  onRefresh: () => void;
}

export function ChatHistorySidebar({
  sessions,
  activeSessionId,
  isLoading,
  isError,
  onSelectSession,
  onNewChat,
  onRefresh,
}: ChatHistorySidebarProps) {
  return (
    <aside className="w-full lg:w-64 border-r border-border bg-card flex flex-col flex-shrink-0 h-auto lg:h-full">
      {/* Header and New Chat Action */}
      <div className="p-4 border-b border-border flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-foreground text-sm flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-primary" />
            Chat History
          </h3>
        </div>
        <Button
          onClick={onNewChat}
          size="sm"
          className="w-full gap-2 justify-center shadow-sm"
        >
          <Plus className="h-4 w-4" />
          New Chat
        </Button>
      </div>

      {/* Sessions List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground gap-2">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <span className="text-xs">Loading history...</span>
          </div>
        )}

        {isError && (
          <div className="flex flex-col items-center justify-center py-8 px-4 text-center text-muted-foreground gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <span className="text-xs font-medium">Failed to load history</span>
            <button
              onClick={onRefresh}
              className="text-xs text-primary underline hover:no-underline mt-1"
            >
              Retry
            </button>
          </div>
        )}

        {!isLoading && !isError && sessions.length === 0 && (
          <div className="text-center py-12 px-4 text-muted-foreground">
            <MessageSquare className="h-8 w-8 mx-auto text-muted-foreground/30 mb-2" />
            <p className="text-xs font-medium">No previous chats</p>
            <p className="text-[10px] text-muted-foreground/70 mt-1">
              Start a new session to begin.
            </p>
          </div>
        )}

        {!isLoading &&
          !isError &&
          sessions.map((session) => {
            const isActive = session.id === activeSessionId;
            let timeAgo = '';
            try {
              timeAgo = formatDistanceToNow(new Date(session.updated_at), { addSuffix: true });
            } catch {
              timeAgo = 'recently';
            }

            return (
              <button
                key={session.id}
                onClick={() => onSelectSession(session.id)}
                className={`w-full text-left p-3 rounded-lg flex flex-col gap-1 transition-all group ${
                  isActive
                    ? 'bg-primary/10 text-primary border border-primary/20'
                    : 'hover:bg-muted/50 text-foreground border border-transparent'
                }`}
              >
                <div className="flex items-start justify-between gap-2 w-full">
                  <span className="text-xs font-semibold truncate flex-1 leading-snug">
                    {session.title || 'Untitled Chat'}
                  </span>
                </div>
                <span className="text-[10px] text-muted-foreground">
                  {timeAgo}
                </span>
              </button>
            );
          })}
      </div>
    </aside>
  );
}
