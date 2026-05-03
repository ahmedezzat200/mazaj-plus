import { PlanMessage } from './PlanChatPage';
import { UserMessage } from '../chat/UserMessage';
import { AssistantMessage } from '../chat/AssistantMessage';
import { IntentConfirmationCard } from './IntentConfirmationCard';
import { PlanningStatusCard } from './PlanningStatusCard';
import { PlanResponseCard } from './PlanResponseCard';
import { PlanClarificationCard } from './PlanClarificationCard';
import { PlanLimitReachedCard } from './PlanLimitReachedCard';
import { NoSafePlanCard } from './NoSafePlanCard';
import { LoadingIndicator } from '../chat/LoadingIndicator';

interface PlanChatMessagesProps {
  messages: PlanMessage[];
  isLoading: boolean;
  isProcessing: boolean;
  onQuickAction: (action: string) => void;
  onNewPlan: () => void;
}

export function PlanChatMessages({ 
  messages, 
  isLoading, 
  isProcessing,
  onQuickAction, 
  onNewPlan 
}: PlanChatMessagesProps) {
  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 py-6 space-y-6">
      {messages.map((message) => (
        <div key={message.id}>
          {message.type === 'user' && (
            <UserMessage content={message.content} timestamp={message.timestamp} />
          )}
          
          {message.type === 'assistant' && (
            <AssistantMessage content={message.content} timestamp={message.timestamp} />
          )}
          
          {message.type === 'intent-confirmation' && (
            <IntentConfirmationCard
              content={message.content}
              quickActions={message.quickActions || []}
              onQuickAction={onQuickAction}
            />
          )}
          
          {message.type === 'planning-status' && (
            <PlanningStatusCard
              processingSteps={message.processingSteps || []}
              isProcessing={isProcessing}
            />
          )}
          
          {message.type === 'plan-response' && message.plan && (
            <PlanResponseCard
              content={message.content}
              plan={message.plan}
              planActions={message.planActions || []}
              onPlanAction={onQuickAction}
              onNewPlan={onNewPlan}
            />
          )}
          
          {message.type === 'clarification' && (
            <PlanClarificationCard
              content={message.content}
              quickActions={message.quickActions || []}
              onQuickAction={onQuickAction}
            />
          )}
          
          {message.type === 'limit-reached' && (
            <PlanLimitReachedCard />
          )}
          
          {message.type === 'no-safe-plan' && (
            <NoSafePlanCard />
          )}
        </div>
      ))}
      
      {isLoading && <LoadingIndicator />}
    </div>
  );
}
