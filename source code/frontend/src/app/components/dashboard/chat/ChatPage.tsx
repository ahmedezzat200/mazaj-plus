import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router';
import { UserData } from '../DashboardLayout';
import { ChatEmpty } from './ChatEmpty';
import { ChatMessages } from './ChatMessages';
import { ChatInput } from './ChatInput';
import { ChatAdvisoryBanner } from './ChatAdvisoryBanner';
import { RightSupportPanel } from './RightSupportPanel';
import { chatApi, BackendFoodItem, BackendWarning, BackendRecommendation } from '../../../../lib/api';

export type ChatMessageType =
  | 'user'
  | 'assistant'
  | 'clarification'
  | 'recommendation'
  | 'limit-reached'
  | 'no-safe-recommendation'
  | 'ambiguous-fallback';

export interface ChatMessage {
  id: string;
  type: ChatMessageType;
  content: string;
  timestamp: Date;
  foods?: BackendFoodItem[];
  warnings?: BackendWarning[];
  quickReplies?: string[];
  suggestions?: string[];
}

// Keep FoodRecommendation exported so existing non-chat imports don't break,
// but ChatPage itself no longer uses it.
export interface FoodRecommendation {
  name: string;
  explanation: string;
  safetyValidated: boolean;
}

const STORAGE_KEY = 'mazaj_current_chat_session_id';

export function ChatPage() {
  const { userData } = useOutletContext<{ userData: UserData }>();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [currentSessionId, setCurrentSessionId] = useState<number | null>(null);
  const [chatError, setChatError] = useState<string | null>(null);

  // Restore session on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;
    const savedId = parseInt(saved, 10);
    if (!Number.isFinite(savedId) || savedId <= 0) {
      localStorage.removeItem(STORAGE_KEY);
      return;
    }

    chatApi.getSession(savedId).then((result) => {
      if (result.ok && result.session) {
        setCurrentSessionId(result.session.id);

        const { messages: backendMessages, recommendations } = result.session;
        // Walk recommendations in order alongside ASSISTANT messages.
        // The backend creates one ChatRecommendation per MOOD_RECOMMENDATION turn,
        // in the same atomic block as the ASSISTANT ChatMessage, so they are in sync.
        let recIndex = 0;
        const restored: ChatMessage[] = backendMessages.map((m) => {
          if (m.sender !== 'ASSISTANT') {
            return {
              id: `restored-${m.id}`,
              type: 'user' as const,
              content: m.message,
              timestamp: new Date(m.created_at),
            };
          }
          // ASSISTANT message — check if there is a matching recommendation
          const rec: BackendRecommendation | undefined = recommendations[recIndex];
          if (rec) {
            recIndex += 1;
            if (rec.recommended_foods.length > 0) {
              // Full recommendation card with foods and warnings
              return {
                id: `restored-${m.id}`,
                type: 'recommendation' as const,
                content: m.message,
                timestamp: new Date(m.created_at),
                foods: rec.recommended_foods,
                warnings: rec.warnings,
                suggestions: ['Ask another question'],
              };
            } else {
              // Recommendation existed but backend found no safe foods
              return {
                id: `restored-${m.id}`,
                type: 'no-safe-recommendation' as const,
                content: m.message,
                timestamp: new Date(m.created_at),
              };
            }
          }
          // No recommendation for this ASSISTANT message (CLARIFICATION / NUTRITION_PLAN_REQUEST)
          return {
            id: `restored-${m.id}`,
            type: 'assistant' as const,
            content: m.message,
            timestamp: new Date(m.created_at),
          };
        });
        setMessages(restored);
      } else {
        // Session invalid, expired auth, or not found — clear stored key
        localStorage.removeItem(STORAGE_KEY);
      }
    }).catch(() => {
      localStorage.removeItem(STORAGE_KEY);
    });
  }, []);

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const trimmed = content.trim();

    // Add user message immediately
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: trimmed,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setChatError(null);

    try {
      const result = await chatApi.sendMessage(trimmed, currentSessionId);

      if (result.ok && result.data) {
        const { session_id, mode, reply, foods, warnings } = result.data;

        // Persist session so follow-up messages belong to the same session
        if (session_id) {
          setCurrentSessionId(session_id);
          localStorage.setItem(STORAGE_KEY, String(session_id));
        }

        let assistantMessage: ChatMessage;

        if (mode === 'MOOD_RECOMMENDATION') {
          if (foods && foods.length > 0) {
            assistantMessage = {
              id: `asst-${Date.now()}`,
              type: 'recommendation',
              content: reply,
              timestamp: new Date(),
              foods,
              warnings: warnings ?? [],
              suggestions: ['Ask another question'],
            };
          } else {
            // Backend returned mood mode but no foods (no safe match in DB)
            assistantMessage = {
              id: `asst-${Date.now()}`,
              type: 'no-safe-recommendation',
              content: reply,
              timestamp: new Date(),
            };
          }
        } else if (mode === 'CLARIFICATION') {
          assistantMessage = {
            id: `asst-${Date.now()}`,
            type: 'clarification',
            content: reply,
            timestamp: new Date(),
            quickReplies: [
              'I feel stressed',
              'I feel tired',
              'I feel emotionally low',
              'Something else',
            ],
          };
        } else {
          // NUTRITION_PLAN_REQUEST or any other mode — treat as plain assistant
          assistantMessage = {
            id: `asst-${Date.now()}`,
            type: 'assistant',
            content: reply,
            timestamp: new Date(),
          };
        }

        setMessages((prev) => [...prev, assistantMessage]);

      } else {
        // Handle typed backend errors
        const errorCode = result.error?.code ?? 'UNKNOWN';
        const errorMessage = result.error?.message ?? 'An unexpected error occurred.';

        if (result.status === 401) {
          setChatError('Your session has expired. Please log in again.');
        } else if (result.status === 403 && errorCode === 'USAGE_LIMIT_EXCEEDED') {
          const limitMessage: ChatMessage = {
            id: `asst-${Date.now()}`,
            type: 'limit-reached',
            content: errorMessage,
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, limitMessage]);
        } else if (result.status === 403) {
          // Onboarding not complete or other 403
          setChatError(errorMessage);
        } else if (result.status === 409) {
          setChatError('A duplicate request was detected. Please try again.');
        } else {
          setChatError(errorMessage);
        }
      }
    } catch {
      setChatError('Unable to reach the server. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickReply = (reply: string) => {
    handleSendMessage(reply);
  };

  const handleNewChat = () => {
    setMessages([]);
    setInputValue('');
    setCurrentSessionId(null);
    setChatError(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <div className="h-[calc(100vh-73px)] flex flex-col lg:flex-row">
      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0 bg-background">
        {/* Advisory banner */}
        <ChatAdvisoryBanner />

        {/* Inline error notice */}
        {chatError && (
          <div className="mx-4 mt-3 px-4 py-3 rounded-xl bg-destructive/10 border border-destructive/20 text-sm text-destructive">
            {chatError}
          </div>
        )}

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            <ChatEmpty onQuickEmotion={handleQuickReply} />
          ) : (
            <ChatMessages
              messages={messages}
              isLoading={isLoading}
              onQuickReply={handleQuickReply}
              onNewChat={handleNewChat}
            />
          )}
        </div>

        {/* Input area */}
        <ChatInput
          value={inputValue}
          onChange={setInputValue}
          onSend={handleSendMessage}
          isLoading={isLoading}
        />
      </div>

      {/* Right support panel */}
      <RightSupportPanel userData={userData} />
    </div>
  );
}

