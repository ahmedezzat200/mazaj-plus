// Re-exports — all existing imports from '../lib/api' continue to work
export { api, setUnauthorizedHandler, generateIdempotencyKey } from './client';
export type { } from './client';

export { chatApi } from './chat';
export type { BackendFoodItem, BackendWarning, ChatSendResponse, BackendRecommendation } from './chat';

export { alternativesApi, hydrationApi, tipsApi, plansApi } from './nutrition';
export type { BackendAlternative, BackendNutritionPlan } from './nutrition';

export { profileApi, optionsApi } from './profile';
export type { UserProfileData } from './profile';

export { subscriptionApi } from './subscription';
export type { SubscriptionData } from './subscription';

export { adminApi } from './admin';
export type {
  AdminUser, AdminFoodItem, AdminTip, AdminSubscription,
  AdminStats, AdminActivityEntry,
  AdminHealthyAlternative, AdminAlternativeFood, AdminHealthyAlternativeInput,
} from './admin';

export { uploadsApi } from './uploads';
export type { FoodImageUploadSuccess, InBodyUploadSuccess } from './uploads';
