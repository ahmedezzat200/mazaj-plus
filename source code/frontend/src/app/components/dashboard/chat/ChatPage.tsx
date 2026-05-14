import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router';
import { UserData } from '../DashboardLayout';
import { ChatEmpty } from './ChatEmpty';
import { ChatMessages } from './ChatMessages';
import { ChatInput } from './ChatInput';
import { ChatAdvisoryBanner } from './ChatAdvisoryBanner';
import { RightSupportPanel } from './RightSupportPanel';
import {
  chatApi,
  subscriptionApi,
  BackendFoodItem,
  BackendWarning,
  BackendRecommendation,
} from '../../../../lib/api';

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

// Kept for compatibility with any non-chat imports that reference this type.
export interface FoodRecommendation {
  name: string;
  explanation: string;
  safetyValidated: boolean;
}

interface FeatureFlags {
  food_image_upload: boolean;
  inbody_upload: boolean;
  daily_tracking: boolean;
  weekly_reports: boolean;
}

const STORAGE_KEY = 'mazaj_current_chat_session_id';

const DEFAULT_FLAGS: FeatureFlags = {
  food_image_upload: false,
  inbody_upload: false,
  daily_tracking: false,
  weekly_reports: false,
};

export function ChatPage() {
  const { userData } = useOutletContext<{ userData: UserData }>();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [currentSessionId, setCurrentSessionId] = useState<number | null>(null);
  const [chatError, setChatError] = useState<string | null>(null);

  // Feature flags from backend subscription endpoint — never derived from stale userData.tier
  const [featureFlags, setFeatureFlags] = useState<FeatureFlags>(DEFAULT_FLAGS);
  const [flagsLoading, setFlagsLoading] = useState(true);

  // Load subscription feature flags on mount
  useEffect(() => {
    subscriptionApi
      .getMe()
      .then((res) => {
        if (res.ok && res.data) {
          setFeatureFlags({
            food_image_upload: !!res.data.features.food_image_upload,
            inbody_upload: !!res.data.features.inbody_upload,
            daily_tracking: !!res.data.features.daily_tracking,
            weekly_reports: !!res.data.features.weekly_reports,
          });
        }
        // On API error keep defaults (all locked) — safe fallback
      })
      .catch(() => {
        // Network error: keep locked defaults
      })
      .finally(() => {
        setFlagsLoading(false);
      });
  }, []);

  // Restore previous session on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;
    const savedId = parseInt(saved, 10);
    if (!Number.isFinite(savedId) || savedId <= 0) {
      localStorage.removeItem(STORAGE_KEY);
      return;
    }

    chatApi
      .getSession(savedId)
      .then((result) => {
        if (result.ok && result.session) {
          setCurrentSessionId(result.session.id);
          const { messages: backendMessages, recommendations } = result.session;
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
            const rec: BackendRecommendation | undefined = recommendations[recIndex];
            if (rec) {
              recIndex += 1;
              if (rec.recommended_foods.length > 0) {
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
                return {
                  id: `restored-${m.id}`,
                  type: 'no-safe-recommendation' as const,
                  content: m.message,
                  timestamp: new Date(m.created_at),
                };
              }
            }
            return {
              id: `restored-${m.id}`,
              type: 'assistant' as const,
              content: m.message,
              timestamp: new Date(m.created_at),
            };
          });
          setMessages(restored);
        } else {
          localStorage.removeItem(STORAGE_KEY);
        }
      })
      .catch(() => {
        localStorage.removeItem(STORAGE_KEY);
      });
  }, []);

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const trimmed = content.trim();

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
          // NUTRITION_PLAN_REQUEST, GENERAL, or any other mode
          assistantMessage = {
            id: `asst-${Date.now()}`,
            type: 'assistant',
            content: reply,
            timestamp: new Date(),
          };
        }

        setMessages((prev) => [...prev, assistantMessage]);
      } else {
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
          setChatError(errorMessage);
        } else if (result.status === 409) {
          setChatError('A duplicate request was detected. Please try again.');
        } else {
          setChatError('Something went wrong while processing your message. Please try again.');
        }
      }
    } catch {
      setChatError('Unable to reach the server. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (actionId: string, prompt: string) => {
    const chatActions = ['mood', 'alternatives', 'hydration', 'plan'];
    if (chatActions.includes(actionId)) {
      handleSendMessage(prompt);
      return;
    }

    // upload/inbody — direct user to sidebar panels, no frontend AI or fake analysis
    if (actionId === 'upload' || actionId === 'inbody') {
      const userMsg: ChatMessage = {
        id: `user-action-${Date.now()}`,
        type: 'user',
        content: prompt,
        timestamp: new Date(),
      };
      const assistantMsg: ChatMessage = {
        id: `asst-action-${Date.now()}`,
        type: 'assistant',
        content:
          actionId === 'upload'
            ? 'Use the Food Image Analysis panel in the right sidebar to select a food photo.'
            : 'Use the InBody Upload panel in the right sidebar to select your report.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMsg, assistantMsg]);
      return;
    }

    if (actionId === 'tracking') {
      const userMsg: ChatMessage = {
        id: `user-action-${Date.now()}`,
        type: 'user',
        content: prompt,
        timestamp: new Date(),
      };
      const assistantMsg: ChatMessage = {
        id: `asst-action-${Date.now()}`,
        type: 'assistant',
        content:
          featureFlags.daily_tracking && featureFlags.weekly_reports
            ? 'Tracking and reports are available for Ultra, but backend reporting is still under development. No fake charts or food logs are generated.'
            : 'This feature requires Ultra.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMsg, assistantMsg]);
    }
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
      {/* ── Main chat area ── */}
      <div className="flex-1 flex flex-col min-w-0 bg-background">
        <ChatAdvisoryBanner />

        {chatError && (
          <div className="mx-4 mt-3 px-4 py-3 rounded-xl bg-destructive/10 border border-destructive/20 text-sm text-destructive">
            {chatError}
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            <ChatEmpty onQuickAction={handleQuickAction} />
          ) : (
            <ChatMessages
              messages={messages}
              isLoading={isLoading}
              onQuickReply={handleSendMessage}
              onNewChat={handleNewChat}
            />
          )}
        </div>

        <ChatInput
          value={inputValue}
          onChange={setInputValue}
          onSend={handleSendMessage}
          isLoading={isLoading}
        />
      </div>

      {/* ── Right sidebar (Chat Hub panels) ── */}
      {flagsLoading ? (
        <aside className="hidden lg:flex w-80 border-l border-border bg-card items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
        </aside>
      ) : (
        <RightSupportPanel
          userData={userData}
          featureFlags={featureFlags}
          onRequestPlan={handleSendMessage}
          isChatLoading={isLoading}
        />
      )}
    </div>
  );
}
