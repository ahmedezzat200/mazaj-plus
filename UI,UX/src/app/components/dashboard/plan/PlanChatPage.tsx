import { useState } from 'react';
import { useOutletContext } from 'react-router';
import { UserData } from '../DashboardLayout';
import { PlanChatEmpty } from './PlanChatEmpty';
import { PlanChatMessages } from './PlanChatMessages';
import { PlanChatInput } from './PlanChatInput';
import { ChatAdvisoryBanner } from '../chat/ChatAdvisoryBanner';
import { PlanSupportPanel } from './PlanSupportPanel';

export type PlanMessageType = 
  | 'user' 
  | 'assistant'
  | 'intent-confirmation'
  | 'planning-status'
  | 'plan-response'
  | 'clarification'
  | 'limit-reached'
  | 'no-safe-plan';

export interface MealSection {
  name: string;
  foods: string[];
  note: string;
}

export interface NutritionPlan {
  bmi: number;
  dailyCalories: number;
  goal: string;
  meals: MealSection[];
  safetyValidated: boolean;
}

export interface PlanMessage {
  id: string;
  type: PlanMessageType;
  content: string;
  timestamp: Date;
  plan?: NutritionPlan;
  quickActions?: string[];
  planActions?: string[];
  processingSteps?: string[];
}

export function PlanChatPage() {
  const { userData } = useOutletContext<{ userData: UserData }>();
  const [messages, setMessages] = useState<PlanMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    // Add user message
    const userMessage: PlanMessage = {
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
      const response = generateMockPlanResponse(content, messages.length, userData.tier);
      setMessages((prev) => [...prev, response]);
      setIsLoading(false);
      
      // If it's a planning status, trigger plan generation
      if (response.type === 'planning-status') {
        setIsProcessing(true);
        setTimeout(() => {
          const planResponse = generateMockPlan();
          setMessages((prev) => [...prev, planResponse]);
          setIsProcessing(false);
        }, 4000);
      }
    }, 1500);
  };

  const handleQuickAction = (action: string) => {
    handleSendMessage(action);
  };

  const handleNewPlan = () => {
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
            <PlanChatEmpty onQuickStarter={handleQuickAction} />
          ) : (
            <PlanChatMessages 
              messages={messages} 
              isLoading={isLoading}
              isProcessing={isProcessing}
              onQuickAction={handleQuickAction}
              onNewPlan={handleNewPlan}
            />
          )}
        </div>

        {/* Input area */}
        <PlanChatInput
          value={inputValue}
          onChange={setInputValue}
          onSend={handleSendMessage}
          isLoading={isLoading || isProcessing}
        />
      </div>

      {/* Right support panel */}
      <PlanSupportPanel userData={userData} />
    </div>
  );
}

// Mock response generator
function generateMockPlanResponse(
  userInput: string, 
  messageCount: number,
  tier: string
): PlanMessage {
  const input = userInput.toLowerCase();

  // Check for tier limit (Free tier, 2 plans per week)
  if (tier === 'Free' && messageCount >= 4) {
    return {
      id: Date.now().toString(),
      type: 'limit-reached',
      content: 'You have reached your weekly nutrition plan limit for the Free tier.',
      timestamp: new Date(),
    };
  }

  // Check for incomplete request
  if (input.length < 10 || (!input.includes('plan') && !input.includes('weight') && !input.includes('maintenance') && !input.includes('goal'))) {
    return {
      id: Date.now().toString(),
      type: 'clarification',
      content: 'I need a bit more information to create your nutrition plan. What is your primary goal?',
      timestamp: new Date(),
      quickActions: [
        'Use saved goal',
        'Edit profile',
        'Cancel',
      ],
    };
  }

  // Intent confirmation
  if (!input.includes('yes') && !input.includes('continue') && messageCount < 2) {
    return {
      id: Date.now().toString(),
      type: 'intent-confirmation',
      content: 'I understand you want to create a personalized nutrition plan. I\'ll use your stored health profile, dietary preferences, and safety rules to generate a safe and effective plan.',
      timestamp: new Date(),
      quickActions: [
        'Yes, continue',
        'Review profile first',
        'Cancel',
      ],
    };
  }

  // Planning status
  return {
    id: Date.now().toString(),
    type: 'planning-status',
    content: 'Creating your personalized nutrition plan...',
    timestamp: new Date(),
    processingSteps: [
      'Retrieving stored profile',
      'Applying safety checks',
      'Calculating nutritional values',
      'Preparing your nutrition plan',
    ],
  };
}

function generateMockPlan(): PlanMessage {
  const plan: NutritionPlan = {
    bmi: 24.2,
    dailyCalories: 1800,
    goal: 'Balanced nutrition and maintenance',
    safetyValidated: true,
    meals: [
      {
        name: 'Breakfast',
        foods: ['Greek yogurt with berries', 'Whole grain toast with avocado', 'Green tea'],
        note: 'High protein start with healthy fats and fiber',
      },
      {
        name: 'Lunch',
        foods: ['Grilled salmon salad', 'Quinoa bowl', 'Olive oil dressing', 'Fresh fruit'],
        note: 'Omega-3 rich with complex carbohydrates',
      },
      {
        name: 'Dinner',
        foods: ['Lean chicken breast', 'Roasted vegetables', 'Brown rice', 'Herbal tea'],
        note: 'Lean protein with nutrient-dense vegetables',
      },
      {
        name: 'Snacks',
        foods: ['Handful of almonds', 'Apple slices', 'Carrot sticks with hummus'],
        note: 'Balanced snacks to maintain energy levels',
      },
    ],
  };

  return {
    id: Date.now().toString(),
    type: 'plan-response',
    content: 'Based on your health profile and goals, here is your personalized nutrition plan:',
    timestamp: new Date(),
    plan,
    planActions: [
      'View Full Plan',
      'Save to Plans',
      'Ask for Adjustments',
      'Start New Request',
    ],
  };
}
