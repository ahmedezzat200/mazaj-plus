import { useEffect, useRef } from 'react';
import { ChatMessage } from './ChatPage';
import { UserMessage } from './UserMessage';
import { AssistantMessage } from './AssistantMessage';
import { ClarificationCard } from './ClarificationCard';
import { RecommendationCard } from './RecommendationCard';
import { LimitReachedCard } from './LimitReachedCard';
import { NoSafeRecommendationCard } from './NoSafeRecommendationCard';
import { AmbiguousFallbackCard } from './AmbiguousFallbackCard';
import { LoadingIndicator } from './LoadingIndicator';
import { ChatFoodImageUpload } from './ChatFoodImageUpload';
import { ChatInBodyUpload } from './ChatInBodyUpload';
import { ChatNutritionPlanCard } from './ChatNutritionPlanCard';
import { FoodImageAnalysisCard } from './FoodImageAnalysisCard';
import { InBodyAdvisoryCard } from './InBodyAdvisoryCard';

interface ChatMessagesProps {
  messages: ChatMessage[];
  isLoading: boolean;
  onQuickReply: (reply: string) => void;
  onNewChat: () => void;
  featureFlags: {
    food_image_upload: boolean;
    inbody_upload: boolean;
  };
  sessionId: number | null;
  onUploadSuccess: (newSessionId: number, userMsg: any, asstMsg: any) => void;
}

export function ChatMessages({
  messages,
  isLoading,
  onQuickReply,
  onNewChat,
  featureFlags,
  sessionId,
  onUploadSuccess,
}: ChatMessagesProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Smooth scroll to latest message whenever messages or loading state changes
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, isLoading]);

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-6 py-8 space-y-8">
      {messages.map((message, index) => (
        <div
          key={message.id}
          className="animate-in fade-in slide-in-from-bottom-2 duration-300"
          style={{ animationDelay: `${Math.min(index * 30, 150)}ms` }}
        >
          {message.type === 'user' && (
            <UserMessage content={message.content} timestamp={message.timestamp} />
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

          {message.type === 'limit-reached' && (
            <LimitReachedCard />
          )}

          {message.type === 'no-safe-recommendation' && (
            <NoSafeRecommendationCard content={message.content} />
          )}

          {message.type === 'ambiguous-fallback' && (
            <AmbiguousFallbackCard onNewChat={onNewChat} />
          )}

          {message.type === 'nutrition-plan' && message.nutritionPlan && (
            <ChatNutritionPlanCard plan={message.nutritionPlan} />
          )}

          {message.type === 'food-image-analysis' && (
            <FoodImageAnalysisCard
              content={message.content}
              foods={message.foods || []}
            />
          )}

          {message.type === 'inbody-advisory' && (
            <InBodyAdvisoryCard
              content={message.content}
            />
          )}

          {message.type === 'upload-food-image' && (
            <ChatFoodImageUpload
              hasAccess={featureFlags.food_image_upload}
              sessionId={sessionId}
              onUploadSuccess={onUploadSuccess}
            />
          )}

          {message.type === 'upload-inbody' && (
            <ChatInBodyUpload
              hasAccess={featureFlags.inbody_upload}
              sessionId={sessionId}
              onUploadSuccess={onUploadSuccess}
            />
          )}
        </div>
      ))}

      {isLoading && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          <LoadingIndicator />
        </div>
      )}

      {/* Sentinel element for scroll-to-bottom */}
      <div ref={bottomRef} className="h-1" />
    </div>
  );
}
