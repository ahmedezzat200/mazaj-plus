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
} from '../../../../lib/api';

export type ChatMessageType =
  | 'user'
  | 'assistant'
  | 'clarification'
  | 'recommendation'
  | 'limit-reached'
  | 'no-safe-recommendation'
  | 'ambiguous-fallback'
  | 'nutrition-plan'
  | 'upload-food-image'
  | 'upload-inbody'
  | 'food-image-analysis'
  | 'inbody-advisory';

export interface ChatMessage {
  id: string;
  type: ChatMessageType;
  content: string;
  timestamp: Date;
  foods?: BackendFoodItem[];
  warnings?: BackendWarning[];
  quickReplies?: string[];
  suggestions?: string[];
  nutritionPlan?: any;
  moodName?: string;
}

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

function isInBodyAssistantMessage(message?: string) {
  if (!message) {
    return false;
  }
  return [
    'InBody report',
    'InBody values',
    'Understanding Your InBody Scan',
    'Your Mazaj+ Nutrition Plan',
    'Mood & Well-being',
    'What your numbers mean',
    'Basal Metabolic Rate',
    'Skeletal Muscle Mass',
  ].some((marker) => message.includes(marker));
}

const DEFAULT_FLAGS: FeatureFlags = {
  food_image_upload: false,
  inbody_upload: false,
  daily_tracking: false,
  weekly_reports: false,
};

interface ChatOutletContext {
  userData: UserData;
  currentSessionId: number | null;
  setCurrentSessionId: (id: number | null) => void;
  sessions: any[];
  fetchSessions: () => Promise<void>;
  onSelectSession: (id: number) => void;
  onNewChat: () => void;
}

export function ChatPage() {
  const {
    userData,
    currentSessionId,
    setCurrentSessionId,
    sessions,
    fetchSessions,
    onSelectSession,
    onNewChat
  } = useOutletContext<ChatOutletContext>();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [chatError, setChatError] = useState<string | null>(null);
  const [lastMessage, setLastMessage] = useState<string>('');

  // Feature flags from backend subscription endpoint
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
      })
      .catch(() => {
        // Safe fallback kept
      })
      .finally(() => {
        setFlagsLoading(false);
      });
  }, []);

  // Load session messages when active session ID changes
  useEffect(() => {
    if (currentSessionId === null) {
      setMessages([]);
      setInputValue('');
      setChatError(null);
      return;
    }

    const loadSessionDetails = async () => {
      setIsLoading(true);
      setChatError(null);
      try {
        const result = await chatApi.getSession(currentSessionId);
        if (result.ok && result.session) {
          const { messages: backendMessages } = result.session;
          
          const restored: ChatMessage[] = backendMessages.map((m: any) => {
            if (m.sender !== 'ASSISTANT') {
              return {
                id: `restored-${m.id}`,
                type: 'user' as const,
                content: m.message,
                timestamp: new Date(m.created_at),
              };
            }

            if (isInBodyAssistantMessage(m.message)) {
              return {
                id: `restored-${m.id}`,
                type: 'inbody-advisory' as const,
                content: m.message,
                timestamp: new Date(m.created_at),
              };
            }
            
            if (m.nutrition_plan) {
              return {
                id: `restored-${m.id}`,
                type: 'nutrition-plan' as const,
                content: m.message,
                timestamp: new Date(m.created_at),
                nutritionPlan: m.nutrition_plan,
              };
            }
            
            if (m.foods && m.foods.length > 0) {
              if (m.mood_name === 'food_image_analysis') {
                return {
                  id: `restored-${m.id}`,
                  type: 'food-image-analysis' as const,
                  content: m.message,
                  timestamp: new Date(m.created_at),
                  foods: m.foods,
                };
              }
              return {
                id: `restored-${m.id}`,
                type: 'recommendation' as const,
                content: m.message,
                timestamp: new Date(m.created_at),
                foods: m.foods,
                warnings: m.warnings || [],
                suggestions: ['Ask another question'],
              };
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
          setChatError('Failed to load session details.');
        }
      } catch {
        setChatError('Failed to load session details.');
      } finally {
        setIsLoading(false);
      }
    };

    loadSessionDetails();
  }, [currentSessionId]);

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const trimmed = content.trim();
    setLastMessage(trimmed);

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
        const { session_id, mode, reply_text, recommended_foods, warnings, nutrition_plan } = result.data as any;

        if (session_id) {
          const isNewSession = session_id !== currentSessionId;
          setCurrentSessionId(session_id);
          localStorage.setItem(STORAGE_KEY, String(session_id));
          if (isNewSession) {
            fetchSessions();
          }
        }

        let assistantMessage: ChatMessage;

        if (mode === 'NUTRITION_PLAN_REQUEST' && nutrition_plan) {
          assistantMessage = {
            id: `asst-${Date.now()}`,
            type: 'nutrition-plan',
            content: reply_text,
            timestamp: new Date(),
            nutritionPlan: nutrition_plan,
          };
        } else if (mode === 'MOOD_RECOMMENDATION' || mode === 'HEALTHY_ALTERNATIVE') {
          if (recommended_foods && recommended_foods.length > 0) {
            assistantMessage = {
              id: `asst-${Date.now()}`,
              type: 'recommendation',
              content: reply_text,
              timestamp: new Date(),
              foods: recommended_foods,
              warnings: warnings ?? [],
              suggestions: ['Ask another question'],
            };
          } else {
            assistantMessage = {
              id: `asst-${Date.now()}`,
              type: 'no-safe-recommendation',
              content: reply_text,
              timestamp: new Date(),
            };
          }
        } else if (mode === 'CLARIFICATION') {
          assistantMessage = {
            id: `asst-${Date.now()}`,
            type: 'clarification',
            content: reply_text,
            timestamp: new Date(),
            quickReplies: [
              'I feel stressed',
              'I feel tired',
              'I feel emotionally low',
              'Something else',
            ],
          };
        } else {
          assistantMessage = {
            id: `asst-${Date.now()}`,
            type: 'assistant',
            content: reply_text,
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

    if (actionId === 'upload' || actionId === 'inbody') {
      const userMsg: ChatMessage = {
        id: `user-action-${Date.now()}`,
        type: 'user',
        content: prompt,
        timestamp: new Date(),
      };
      const assistantMsg: ChatMessage = {
        id: `asst-action-${Date.now()}`,
        type: actionId === 'upload' ? 'upload-food-image' : 'upload-inbody',
        content:
          actionId === 'upload'
            ? 'Please choose a food image to analyze.'
            : 'Please choose an InBody report to sync.',
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

  const handleUploadSuccess = (newSessionId: number, userMsg: any, asstMsg: any) => {
    setCurrentSessionId(newSessionId);
    localStorage.setItem(STORAGE_KEY, String(newSessionId));
    fetchSessions();

    setMessages((prev) => {
      // Filter out the temp interactive cards and append the finalized messages
      const base = prev.filter(
        (m) =>
          !m.id.startsWith('user-action') &&
          !m.id.startsWith('asst-action') &&
          m.type !== 'upload-food-image' &&
          m.type !== 'upload-inbody'
      );

      const restoredUser: ChatMessage = {
        id: `restored-${userMsg.id}`,
        type: 'user',
        content: userMsg.message,
        timestamp: new Date(userMsg.created_at),
      };

      let restoredAsst: ChatMessage;

      if (asstMsg.foods && asstMsg.foods.length > 0) {
        restoredAsst = {
          id: `restored-${asstMsg.id}`,
          type: 'recommendation',
          content: asstMsg.message,
          timestamp: new Date(asstMsg.created_at),
          foods: asstMsg.foods,
          warnings: asstMsg.warnings || [],
          suggestions: ['Ask another question'],
        };
      } else if (isInBodyAssistantMessage(asstMsg.message)) {
        restoredAsst = {
          id: `restored-${asstMsg.id}`,
          type: 'inbody-advisory',
          content: asstMsg.message,
          timestamp: new Date(asstMsg.created_at),
        };
      } else {
        restoredAsst = {
          id: `restored-${asstMsg.id}`,
          type: 'assistant',
          content: asstMsg.message,
          timestamp: new Date(asstMsg.created_at),
        };
      }

      return [...base, restoredUser, restoredAsst];
    });
  };

  const handleNewChat = () => {
    setMessages([]);
    setInputValue('');
    setCurrentSessionId(null);
    setChatError(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const handleGeneratePlan = () => {
    handleSendMessage('Make a nutrition plan.');
  };

  const handleUploadFoodImage = async (file: File) => {
    if (isLoading) return;

    setIsLoading(true);
    setChatError(null);

    // Append temporary user message
    const tempUserMsgId = `temp-user-food-${Date.now()}`;
    const userMessage: ChatMessage = {
      id: tempUserMsgId,
      type: 'user',
      content: '[Uploaded Food Image]',
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);

    try {
      const result = await chatApi.uploadFoodImage(file, currentSessionId);
      if (result.ok && result.data) {
        const { session_id, user_message, assistant_message } = result.data as any;

        if (session_id) {
          const isNewSession = session_id !== currentSessionId;
          setCurrentSessionId(session_id);
          localStorage.setItem(STORAGE_KEY, String(session_id));
          if (isNewSession) {
            fetchSessions();
          }
        }

        // Replace temporary messages with finalized ones
        setMessages((prev) => {
          const base = prev.filter((m) => m.id !== tempUserMsgId);
          const restoredUser: ChatMessage = {
            id: `food-user-${user_message.id}`,
            type: 'user',
            content: user_message.message,
            timestamp: new Date(user_message.created_at),
          };
          const restoredAsst: ChatMessage = {
            id: `food-asst-${assistant_message.id}`,
            type: 'food-image-analysis',
            content: assistant_message.message,
            timestamp: new Date(assistant_message.created_at),
            foods: assistant_message.foods || [],
            warnings: assistant_message.warnings || [],
          };
          return [...base, restoredUser, restoredAsst];
        });
      } else {
        const errMsg =
          result.error?.message ??
          'I could not analyze this image right now. Type the food name and I will check it from Mazaj+ data.';
        setMessages((prev) => {
          const base = prev.filter((m) => m.id !== tempUserMsgId);
          return [
            ...base,
            {
              id: `food-user-fail-${Date.now()}`,
              type: 'user',
              content: '[Uploaded Food Image]',
              timestamp: new Date(),
            },
            {
              id: `food-asst-fail-${Date.now()}`,
              type: 'assistant',
              content: errMsg,
              timestamp: new Date(),
            }
          ];
        });
      }
    } catch {
      setMessages((prev) => {
        const base = prev.filter((m) => m.id !== tempUserMsgId);
        return [
          ...base,
          {
            id: `food-user-fail-${Date.now()}`,
            type: 'user',
            content: '[Uploaded Food Image]',
            timestamp: new Date(),
          },
          {
            id: `food-asst-fail-${Date.now()}`,
            type: 'assistant',
            content: 'I could not reach Mazaj+ right now. Try again in a moment, or type the food name and I will check it when the connection is back.',
            timestamp: new Date(),
          }
        ];
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadInBody = async (file: File) => {
    if (isLoading) return;

    setIsLoading(true);
    setChatError(null);

    // Append temporary user message
    const tempUserMsgId = `temp-user-inbody-${Date.now()}`;
    const userMessage: ChatMessage = {
      id: tempUserMsgId,
      type: 'user',
      content: `[Uploaded InBody Scan: ${file.name}]`,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);

    try {
      const result = await chatApi.uploadInBody(file, currentSessionId);
      if (result.ok && result.data) {
        const { session_id, user_message, assistant_message } = result.data as any;

        if (session_id) {
          const isNewSession = session_id !== currentSessionId;
          setCurrentSessionId(session_id);
          localStorage.setItem(STORAGE_KEY, String(session_id));
          if (isNewSession) {
            fetchSessions();
          }
        }

        // Replace temporary messages with finalized ones
        setMessages((prev) => {
          const base = prev.filter((m) => m.id !== tempUserMsgId);
          const restoredUser: ChatMessage = {
            id: `inbody-user-${user_message.id}`,
            type: 'user',
            content: user_message.message,
            timestamp: new Date(user_message.created_at),
          };
          const restoredAsst: ChatMessage = {
            id: `inbody-asst-${assistant_message.id}`,
            type: 'inbody-advisory',
            content: assistant_message.message,
            timestamp: new Date(assistant_message.created_at),
          };
          return [...base, restoredUser, restoredAsst];
        });
      } else {
        const errMsg =
          result.error?.message ??
          'I could not receive the InBody report right now. Please try again, or update your profile manually with the trusted values.';
        setMessages((prev) => {
          const base = prev.filter((m) => m.id !== tempUserMsgId);
          return [
            ...base,
            {
              id: `inbody-user-fail-${Date.now()}`,
              type: 'user',
              content: `[Uploaded InBody Scan: ${file.name}]`,
              timestamp: new Date(),
            },
            {
              id: `inbody-asst-fail-${Date.now()}`,
              type: 'assistant',
              content: errMsg,
              timestamp: new Date(),
            }
          ];
        });
      }
    } catch {
      setMessages((prev) => {
        const base = prev.filter((m) => m.id !== tempUserMsgId);
        return [
          ...base,
          {
            id: `inbody-user-fail-${Date.now()}`,
            type: 'user',
            content: `[Uploaded InBody Scan: ${file.name}]`,
            timestamp: new Date(),
          },
          {
            id: `inbody-asst-fail-${Date.now()}`,
            type: 'assistant',
            content: 'I could not reach Mazaj+ right now. Try the upload again in a moment, or update your profile manually if you already know the numbers.',
            timestamp: new Date(),
          }
        ];
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-73px)] flex flex-col min-w-0 bg-background">
      <ChatAdvisoryBanner />

      {chatError && (
        <div className="mx-4 mt-3 px-4 py-3 rounded-xl bg-destructive/10 border border-destructive/20 text-sm text-destructive flex items-center justify-between gap-3">
          <span>{chatError}</span>
          {lastMessage && (
            <button
              onClick={() => { setChatError(null); handleSendMessage(lastMessage); }}
              className="text-xs font-medium underline underline-offset-2 hover:no-underline flex-shrink-0"
            >
              Retry
            </button>
          )}
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
            featureFlags={featureFlags}
            sessionId={currentSessionId}
            onUploadSuccess={handleUploadSuccess}
          />
        )}
      </div>

      <ChatInput
        value={inputValue}
        onChange={setInputValue}
        onSend={handleSendMessage}
        isLoading={isLoading}
        onGeneratePlan={handleGeneratePlan}
        onUploadFoodImage={handleUploadFoodImage}
        onUploadInBody={handleUploadInBody}
      />
    </div>
  );
}
