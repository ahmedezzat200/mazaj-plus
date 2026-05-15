import { ChatMessage } from './ChatPage';
import { UserMessage } from './UserMessage';
import { AssistantMessage } from './AssistantMessage';
import { ClarificationCard } from './ClarificationCard';
import { RecommendationCard } from './RecommendationCard';
import { UploadResultCard } from './UploadResultCard';
import { LimitReachedCard } from './LimitReachedCard';
import { NoSafeRecommendationCard } from './NoSafeRecommendationCard';
import { AmbiguousFallbackCard } from './AmbiguousFallbackCard';
import { LoadingIndicator } from './LoadingIndicator';

interface ChatMessagesProps {
  messages: ChatMessage[];
  isLoading: boolean;
  onQuickReply: (reply: string) => void;
  onNewChat: () => void;
}

export function ChatMessages({ messages, isLoading, onQuickReply, onNewChat }: ChatMessagesProps) {
  return (
    <div className="max-w-3xl mx-auto px-4 md:px-6 py-8 space-y-8">
      {messages.map((message) => (
        <div key={message.id}>
          {message.type === 'user' && (
            <UserMessage
              content={message.content}
              timestamp={message.timestamp}
              attachment={message.attachment}
            />
          )}
          
          {message.type === 'assistant' && (
            <AssistantMessage content={message.content} timestamp={message.timestamp} />
          )}
          
          {message.type === 'clarification' && (
            <ClarificationCard
              content={message.content}
              quickReplies={message.quickReplies || []}
              onQuickReply={onQuickReply}
            />
          )}
          
          {message.type === 'recommendation' && (
            <RecommendationCard
              content={message.content}
              foods={message.foods || []}
              warnings={message.warnings || []}
              suggestions={message.suggestions || []}
              onSuggestion={onQuickReply}
            />
          )}

          {message.type === 'upload-result' && (
            <UploadResultCard
              content={message.content}
              timestamp={message.timestamp}
              foods={message.foods || []}
            />
          )}
          
          {message.type === 'limit-reached' && (
            <LimitReachedCard />
          )}
          
          {message.type === 'no-safe-recommendation' && (
            <NoSafeRecommendationCard />
          )}
          
          {message.type === 'ambiguous-fallback' && (
            <AmbiguousFallbackCard onNewChat={onNewChat} />
          )}
        </div>
      ))}
      
      {isLoading && <LoadingIndicator />}
    </div>
  );
}
