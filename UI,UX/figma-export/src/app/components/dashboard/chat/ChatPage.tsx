import { useState } from 'react';
import { useOutletContext } from 'react-router';
import { UserData } from '../DashboardLayout';
import { ChatEmpty } from './ChatEmpty';
import { ChatMessages } from './ChatMessages';
import { ChatInput } from './ChatInput';
import { ChatAdvisoryBanner } from './ChatAdvisoryBanner';
import { RightSupportPanel } from './RightSupportPanel';

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
  foods?: FoodRecommendation[];
  quickReplies?: string[];
  suggestions?: string[];
}

export interface FoodRecommendation {
  name: string;
  explanation: string;
  safetyValidated: boolean;
}

export function ChatPage() {
  const { userData } = useOutletContext<{ userData: UserData }>();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const response = generateMockResponse(content, messages.length, userData.tier);
      setMessages((prev) => [...prev, response]);
      setIsLoading(false);
    }, 1500);
  };

  const handleQuickReply = (reply: string) => {
    handleSendMessage(reply);
  };

  const handleNewChat = () => {
    setMessages([]);
    setInputValue('');
  };

  return (
    <div className="h-[calc(100vh-73px)] flex flex-col lg:flex-row">
      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0 bg-background">
        {/* Advisory banner */}
        <ChatAdvisoryBanner />

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

// Mock response generator
function generateMockResponse(
  userInput: string, 
  messageCount: number,
  tier: string
): ChatMessage {
  const input = userInput.toLowerCase();

  // Check for tier limit (Free tier, 5 messages)
  if (tier === 'Free' && messageCount >= 4) {
    return {
      id: Date.now().toString(),
      type: 'limit-reached',
      content: 'You have reached your daily guidance limit for the Free tier.',
      timestamp: new Date(),
    };
  }

  // Check for unclear input
  if (input.length < 5 || (!input.includes('feel') && !input.includes('stress') && !input.includes('sad') && !input.includes('tired') && !input.includes('fatigue') && !input.includes('emotional'))) {
    return {
      id: Date.now().toString(),
      type: 'clarification',
      content: 'I want to provide the best guidance. Could you tell me more about how you\'re feeling emotionally?',
      timestamp: new Date(),
      quickReplies: [
        'I feel stressed',
        'I feel tired',
        'I feel emotionally low',
        'Something else',
      ],
    };
  }

  // Simulate no safe recommendation (rarely)
  if (messageCount === 6) {
    return {
      id: Date.now().toString(),
      type: 'no-safe-recommendation',
      content: 'Based on your current health profile, I cannot provide safe food recommendations for this emotional state.',
      timestamp: new Date(),
    };
  }

  // Generate recommendation
  const foods: FoodRecommendation[] = [
    {
      name: 'Dark Leafy Greens Salad',
      explanation: 'Rich in folate and magnesium, which support mood regulation and reduce stress.',
      safetyValidated: true,
    },
    {
      name: 'Omega-3 Rich Salmon',
      explanation: 'Contains EPA and DHA that help reduce anxiety and support emotional balance.',
      safetyValidated: true,
    },
    {
      name: 'Chamomile Tea with Honey',
      explanation: 'Natural calming properties help soothe the nervous system and promote relaxation.',
      safetyValidated: true,
    },
  ];

  return {
    id: Date.now().toString(),
    type: 'recommendation',
    content: 'Based on your emotional state and health profile, here are some supportive food recommendations:',
    timestamp: new Date(),
    foods,
    suggestions: [
      'Show healthier alternatives',
      'Create a nutrition plan',
      'Ask another question',
    ],
  };
}
