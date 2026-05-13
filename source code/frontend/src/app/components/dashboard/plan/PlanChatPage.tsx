import { Navigate } from 'react-router';

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
  return <Navigate to="/dashboard/plans" replace />;
}
