import { api } from './client';

export interface UserProfileData {
  age: number | null;
  gender: string | null;
  height_cm: string | null;
  weight_kg: string | null;
  nutrition_goal: string | null;
  onboarding_complete: boolean;
  health_conditions: { health_condition_id: number; health_condition__name: string }[];
  allergies: { allergy_id: number; allergy__name: string }[];
}

export const profileApi = {
  async getMe() {
    const res = await api.get('/profile/me/');
    const json = await res.json();
    if (json.success) return { ok: true, status: res.status, profile: json.data as UserProfileData };
    return { ok: false, status: res.status, error: json.error ?? { code: 'UNKNOWN', message: 'An unexpected error occurred.' } };
  },

  async updateMe(data: Partial<UserProfileData> & { health_conditions?: number[]; allergies?: number[] }) {
    const res = await api.patch('/profile/me/', data);
    const json = await res.json();
    if (json.success) return { ok: true, status: res.status, profile: json.data as UserProfileData };
    return { ok: false, status: res.status, error: json.error ?? { code: 'UNKNOWN', message: 'An unexpected error occurred.' } };
  },
};

export const optionsApi = {
  async getHealthConditions() {
    const res = await api.get('/health-conditions/');
    const json = await res.json();
    if (json.success) return { ok: true, health_conditions: json.data?.health_conditions ?? [] as { id: number; name: string }[] };
    return { ok: false, error: json.error ?? { code: 'UNKNOWN', message: 'An unexpected error occurred.' } };
  },

  async getAllergies() {
    const res = await api.get('/allergies/');
    const json = await res.json();
    if (json.success) return { ok: true, allergies: json.data?.allergies ?? [] as { id: number; name: string }[] };
    return { ok: false, error: json.error ?? { code: 'UNKNOWN', message: 'An unexpected error occurred.' } };
  },
};
