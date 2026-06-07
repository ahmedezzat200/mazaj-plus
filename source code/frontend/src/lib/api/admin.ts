import { api } from './client';

export interface AdminUser {
  id: number; email: string; first_name: string; last_name: string;
  is_active: boolean; date_joined: string; tier: string;
  account_status: string; onboarding_status: string; role: string;
}

export interface AdminFoodItem {
  id: number; name: string; category: string; calories: number;
  protein_g: number; carbs_g: number; fat_g: number; description: string;
  data_source: string; is_active: boolean; created_at: string;
}

export interface AdminTip {
  id: number; title: string; content: string; is_active: boolean;
  display_order: number; created_at: string;
}

export interface AdminSubscription {
  id: number; user_email: string; user_name: string; tier: string;
  status: string; activation_date: string | null; expiry_date: string | null; created_at: string;
}

export interface AdminStats {
  total_users: number; free_users: number; pro_users: number;
  ultra_users: number; total_foods: number; total_tips: number;
}

export interface AdminActivityEntry {
  id: number; actor_email: string; action: string; resource_type: string;
  resource_id: string | null; created_at: string;
}

export interface AdminAlternativeFood {
  id: number; name: string; category: string;
  calories: number; protein_g: number; carbs_g: number; fat_g: number;
}

export interface AdminHealthyAlternative {
  id: number;
  original_food_name: string;
  alternative_food: AdminAlternativeFood | null;
  reason: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AdminHealthyAlternativeInput {
  original_food_name: string;
  alternative_food: number;
  reason: string;
  is_active?: boolean;
}

type AR<T> = { ok: boolean; status: number; data?: T; error?: { code: string; message: string } };

async function aGet<T>(ep: string): Promise<AR<T>> {
  const res = await api.get(ep);
  const json = await res.json();
  if (json.success) return { ok: true, status: res.status, data: json.data as T };
  return { ok: false, status: res.status, error: json.error ?? { code: 'UNKNOWN', message: 'Request failed.' } };
}

async function aPost<T>(ep: string, body: object): Promise<AR<T>> {
  const res = await api.post(ep, body);
  const json = await res.json();
  if (json.success) return { ok: true, status: res.status, data: json.data as T };
  return { ok: false, status: res.status, error: json.error ?? { code: 'UNKNOWN', message: 'Request failed.' } };
}

async function aPatch<T>(ep: string, body: object): Promise<AR<T>> {
  const res = await api.patch(ep, body);
  const json = await res.json();
  if (json.success) return { ok: true, status: res.status, data: json.data as T };
  return { ok: false, status: res.status, error: json.error ?? { code: 'UNKNOWN', message: 'Request failed.' } };
}

async function aDelete<T>(ep: string): Promise<AR<T>> {
  const res = await api.delete(ep);
  const json = await res.json();
  if (json.success) return { ok: true, status: res.status, data: json.data as T };
  return { ok: false, status: res.status, error: json.error ?? { code: 'UNKNOWN', message: 'Request failed.' } };
}

export const adminApi = {
  getUsers: () => aGet<{ users: AdminUser[]; count: number }>('/admin/users/'),
  updateUserTier: (userId: number, tier: string) => aPatch<{ message: string }>(`/admin/users/${userId}/tier/`, { tier }),
  toggleUserStatus: (userId: number) => aPatch<{ is_active: boolean }>(`/admin/users/${userId}/status/`, {}),

  getFoods: () => aGet<{ foods: AdminFoodItem[]; count: number }>('/admin/foods/'),
  addFood: (data: Omit<AdminFoodItem, 'id' | 'created_at'>) => aPost<{ food: AdminFoodItem }>('/admin/foods/', data),
  editFood: (foodId: number, data: Partial<AdminFoodItem>) => aPatch<{ food: AdminFoodItem }>(`/admin/foods/${foodId}/`, data),
  toggleFoodStatus: (foodId: number) => aDelete<{ is_active: boolean }>(`/admin/foods/${foodId}/`),

  getTips: () => aGet<{ tips: AdminTip[]; count: number }>('/admin/tips/'),
  addTip: (data: { title: string; content: string; is_active?: boolean; display_order?: number }) => aPost<{ tip: AdminTip }>('/admin/tips/', data),
  editTip: (tipId: number, data: Partial<Pick<AdminTip, 'title' | 'content' | 'is_active' | 'display_order'>>) => aPatch<{ tip: AdminTip }>(`/admin/tips/${tipId}/`, data),
  deleteTip: (tipId: number) => aDelete<{ message: string }>(`/admin/tips/${tipId}/`),

  getSubscriptions: () => aGet<{ subscriptions: AdminSubscription[]; count: number }>('/admin/subscriptions/'),
  toggleSubscriptionStatus: (subId: number) => aPatch<{ status: string }>(`/admin/subscriptions/${subId}/status/`, {}),

  getStats: () => aGet<AdminStats>('/admin/stats/'),
  getActivity: () => aGet<{ activity: AdminActivityEntry[] }>('/admin/activity/'),

  getAlternatives: () => aGet<{ alternatives: AdminHealthyAlternative[]; count: number }>('/admin/alternatives/'),
  addAlternative: (data: AdminHealthyAlternativeInput) =>
    aPost<{ alternative: AdminHealthyAlternative }>('/admin/alternatives/', data),
  editAlternative: (altId: number, data: Partial<AdminHealthyAlternativeInput>) =>
    aPatch<{ alternative: AdminHealthyAlternative }>(`/admin/alternatives/${altId}/`, data),
  toggleAlternativeStatus: (altId: number) =>
    aDelete<{ is_active: boolean }>(`/admin/alternatives/${altId}/`),
};
