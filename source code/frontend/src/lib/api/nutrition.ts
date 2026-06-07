import { api, generateIdempotencyKey } from './client';

export interface BackendAlternative {
  id: number;
  original_food_name: string;
  alternative_food: { name: string; calories: number; protein_g: number; carbs_g: number; fat_g: number };
  reason: string;
}

export interface BackendNutritionPlan {
  id: number;
  title: string;
  goal: string;
  bmi: string | null;
  estimated_daily_calories: string | null;
  plan_data: { breakfast: string[]; lunch: string[]; dinner: string[]; snacks: string[] };
  advisory_note: string;
  created_at: string;
}

export const alternativesApi = {
  async search(foodName: string) {
    const res = await api.post('/alternatives/search/', { food_name: foodName }, {
      headers: { 'Idempotency-Key': generateIdempotencyKey() },
    });
    const json = await res.json();
    if (json.success) return { ok: true, status: res.status, alternatives: json.data?.alternatives ?? [] as BackendAlternative[], message: json.data?.message };
    return { ok: false, status: res.status, error: json.error ?? { code: 'UNKNOWN', message: 'An unexpected error occurred.' } };
  },
};

export const hydrationApi = {
  async getTarget() {
    const res = await api.get('/hydration/target/');
    const json = await res.json();
    if (json.success) {
      const d = json.data ?? {};
      return { ok: true, status: res.status, target_ml: d.target_ml, today_total_ml: d.today_total_ml ?? 0, advisory_note: d.advisory_note };
    }
    return { ok: false, status: res.status, error: json.error ?? { code: 'UNKNOWN', message: 'An unexpected error occurred.' } };
  },

  async logWater(amountMl: number) {
    const res = await api.post('/hydration/log/', { amount_ml: amountMl }, {
      headers: { 'Idempotency-Key': generateIdempotencyKey() },
    });
    const json = await res.json();
    if (json.success) {
      const d = json.data ?? {};
      return { ok: true, status: res.status, amount_ml: d.amount_ml, today_total_ml: d.today_total_ml, target_ml: d.target_ml };
    }
    return { ok: false, status: res.status, error: json.error ?? { code: 'UNKNOWN', message: 'An unexpected error occurred.' } };
  },
};

export const tipsApi = {
  async getDaily() {
    const res = await api.get('/tips/daily/');
    const json = await res.json();
    if (json.success) {
      const d = json.data ?? {};
      const tip = d.tip ?? (d.title ? d : null);
      return { ok: true, status: res.status, tip };
    }
    return { ok: false, status: res.status, error: json.error ?? { code: 'UNKNOWN', message: 'An unexpected error occurred.' } };
  },
};

export const plansApi = {
  async generate(title: string) {
    const res = await api.post('/plans/generate/', { title }, {
      headers: { 'Idempotency-Key': generateIdempotencyKey() },
    });
    const json = await res.json();
    if (json.success) return { ok: true, status: res.status, plan: json.data?.plan as BackendNutritionPlan };
    return { ok: false, status: res.status, error: json.error ?? { code: 'UNKNOWN', message: 'An unexpected error occurred.' } };
  },

  async list() {
    const res = await api.get('/plans/');
    const json = await res.json();
    if (json.success) {
      const raw = json.data;
      const plans: BackendNutritionPlan[] = Array.isArray(raw) ? raw : Array.isArray(raw?.plans) ? raw.plans : [];
      return { ok: true, status: res.status, plans };
    }
    return { ok: false, status: res.status, error: json.error ?? { code: 'UNKNOWN', message: 'An unexpected error occurred.' } };
  },

  async getById(id: number) {
    const res = await api.get(`/plans/${id}/`);
    const json = await res.json();
    if (json.success) return { ok: true, status: res.status, plan: json.data?.plan as BackendNutritionPlan };
    return { ok: false, status: res.status, error: json.error ?? { code: 'UNKNOWN', message: 'An unexpected error occurred.' } };
  },
};
