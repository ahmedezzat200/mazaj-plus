const API_BASE_URL = 'http://localhost:8000/api/v1';

function getCookie(name: string) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

async function ensureCsrfToken() {
  let csrftoken = getCookie('csrftoken');
  if (!csrftoken) {
    await fetch(`${API_BASE_URL}/csrf/`, { credentials: 'include' });
    csrftoken = getCookie('csrftoken');
  }
  return csrftoken;
}

export const api = {
  async get(endpoint: string, options: RequestInit = {}) {
    return fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Accept': 'application/json',
        ...options.headers,
      },
      credentials: 'include',
    });
  },

  async post(endpoint: string, data: any, options: RequestInit = {}) {
    const csrftoken = await ensureCsrfToken();
    return fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(csrftoken ? { 'X-CSRFToken': csrftoken } : {}),
        ...options.headers,
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });
  },

  async put(endpoint: string, data: any, options: RequestInit = {}) {
    const csrftoken = await ensureCsrfToken();
    return fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(csrftoken ? { 'X-CSRFToken': csrftoken } : {}),
        ...options.headers,
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });
  },

  async patch(endpoint: string, data: any, options: RequestInit = {}) {
    const csrftoken = await ensureCsrfToken();
    return fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(csrftoken ? { 'X-CSRFToken': csrftoken } : {}),
        ...options.headers,
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });
  },

  async delete(endpoint: string, options: RequestInit = {}) {
    const csrftoken = await ensureCsrfToken();
    return fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
        ...(csrftoken ? { 'X-CSRFToken': csrftoken } : {}),
        ...options.headers,
      },
      credentials: 'include',
    });
  }
};

// ─── Chat API helpers ────────────────────────────────────────────────────────

function generateIdempotencyKey(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // Fallback: timestamp + random string
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

export interface BackendFoodItem {
  name: string;
  calories: string;
  protein_g: string;
  carbs_g: string;
  fat_g: string;
  reason: string;
}

export interface BackendWarning {
  food: string;
  warnings: string[];
}

export interface ChatSendResponse {
  session_id: number;
  mode: string;
  reply: string;
  foods: BackendFoodItem[];
  warnings: BackendWarning[];
}

export interface BackendRecommendation {
  id: number;
  mood_name: string;
  recommended_foods: BackendFoodItem[];
  blocked_foods: BackendFoodItem[];
  warnings: BackendWarning[];
  created_at: string;
}

export const chatApi = {
  async sendMessage(message: string, sessionId: number | null): Promise<{
    ok: boolean;
    status: number;
    data?: ChatSendResponse;
    error?: { code: string; message: string };
  }> {
    const idempotencyKey = generateIdempotencyKey();
    const res = await api.post('/chat/message/', { message, session_id: sessionId }, {
      headers: { 'Idempotency-Key': idempotencyKey },
    });
    const json = await res.json();
    if (json.success) {
      return { ok: true, status: res.status, data: json.data as ChatSendResponse };
    }
    return {
      ok: false,
      status: res.status,
      error: json.error ?? { code: 'UNKNOWN', message: 'An unexpected error occurred.' },
    };
  },

  async listSessions(): Promise<{
    ok: boolean;
    sessions?: { id: number; title: string; mode: string; created_at: string; updated_at: string }[];
    error?: { code: string; message: string };
  }> {
    const res = await api.get('/chat/sessions/');
    const json = await res.json();
    if (json.success) {
      return { ok: true, sessions: json.data?.sessions ?? [] };
    }
    return { ok: false, error: json.error ?? { code: 'UNKNOWN', message: 'An unexpected error occurred.' } };
  },

  async getSession(id: number): Promise<{
    ok: boolean;
    status: number;
    session?: {
      id: number;
      title: string;
      mode: string;
      created_at: string;
      updated_at: string;
      messages: { id: number; sender: string; message: string; created_at: string }[];
      recommendations: BackendRecommendation[];
    };
    error?: { code: string; message: string };
  }> {
    const res = await api.get(`/chat/sessions/${id}/`);
    const json = await res.json();
    if (json.success) {
      return { ok: true, status: res.status, session: json.data?.session };
    }
    return {
      ok: false,
      status: res.status,
      error: json.error ?? { code: 'UNKNOWN', message: 'An unexpected error occurred.' },
    };
  },
};

// ─── Healthy Alternatives API helpers ────────────────────────────────────────

export interface BackendAlternative {
  id: number;
  original_food_name: string;
  alternative_food: {
    name: string;
    calories: string;
    protein_g: string;
    carbs_g: string;
    fat_g: string;
  };
  reason: string;
}

export const alternativesApi = {
  async search(foodName: string): Promise<{
    ok: boolean;
    status: number;
    alternatives?: BackendAlternative[];
    message?: string;
    error?: { code: string; message: string };
  }> {
    const idempotencyKey = generateIdempotencyKey();
    const res = await api.post('/alternatives/search/', { food_name: foodName }, {
      headers: { 'Idempotency-Key': idempotencyKey },
    });
    const json = await res.json();
    if (json.success) {
      return {
        ok: true,
        status: res.status,
        alternatives: json.data?.alternatives ?? [],
        message: json.data?.message,
      };
    }
    return {
      ok: false,
      status: res.status,
      error: json.error ?? { code: 'UNKNOWN', message: 'An unexpected error occurred.' },
    };
  },
};

// ─── Hydration API helpers ────────────────────────────────────────────────────

export const hydrationApi = {
  async getTarget(): Promise<{
    ok: boolean;
    status: number;
    target_ml?: number;
    today_total_ml?: number;
    advisory_note?: string;
    error?: { code: string; message: string };
  }> {
    const res = await api.get('/hydration/target/');
    const json = await res.json();
    if (json.success) {
      const d = json.data ?? {};
      return {
        ok: true,
        status: res.status,
        target_ml: d.target_ml,
        today_total_ml: d.today_total_ml ?? 0,
        advisory_note: d.advisory_note,
      };
    }
    return {
      ok: false,
      status: res.status,
      error: json.error ?? { code: 'UNKNOWN', message: 'An unexpected error occurred.' },
    };
  },

  async logWater(amountMl: number): Promise<{
    ok: boolean;
    status: number;
    amount_ml?: number;
    today_total_ml?: number;
    target_ml?: number;
    error?: { code: string; message: string };
  }> {
    const idempotencyKey = generateIdempotencyKey();
    const res = await api.post('/hydration/log/', { amount_ml: amountMl }, {
      headers: { 'Idempotency-Key': idempotencyKey },
    });
    const json = await res.json();
    if (json.success) {
      const d = json.data ?? {};
      return {
        ok: true,
        status: res.status,
        amount_ml: d.amount_ml,
        today_total_ml: d.today_total_ml,
        target_ml: d.target_ml,
      };
    }
    return {
      ok: false,
      status: res.status,
      error: json.error ?? { code: 'UNKNOWN', message: 'An unexpected error occurred.' },
    };
  },
};

// ─── Daily Tips API helpers ───────────────────────────────────────────────────

export const tipsApi = {
  async getDaily(): Promise<{
    ok: boolean;
    status: number;
    tip?: { title: string; content: string };
    error?: { code: string; message: string };
  }> {
    const res = await api.get('/tips/daily/');
    const json = await res.json();
    if (json.success) {
      // Backend may return { tip: { title, content } } or { title, content } directly
      const d = json.data ?? {};
      const tip = d.tip ?? (d.title ? d : null);
      return { ok: true, status: res.status, tip };
    }
    return {
      ok: false,
      status: res.status,
      error: json.error ?? { code: 'UNKNOWN', message: 'An unexpected error occurred.' },
    };
  },
};
// ─── Nutrition Plans API helpers ─────────────────────────────────────────────

export interface BackendNutritionPlan {
  id: number;
  title: string;
  goal: string;
  bmi: string | null;
  estimated_daily_calories: string | null;
  plan_data: {
    breakfast: string[];
    lunch: string[];
    dinner: string[];
    snacks: string[];
  };
  advisory_note: string;
  created_at: string;
}

export const plansApi = {
  async generate(title: string): Promise<{
    ok: boolean;
    status: number;
    plan?: BackendNutritionPlan;
    error?: { code: string; message: string };
  }> {
    const idempotencyKey = generateIdempotencyKey();
    const res = await api.post('/plans/generate/', { title }, {
      headers: { 'Idempotency-Key': idempotencyKey },
    });
    const json = await res.json();
    if (json.success) {
      return { ok: true, status: res.status, plan: json.data?.plan as BackendNutritionPlan };
    }
    return {
      ok: false,
      status: res.status,
      error: json.error ?? { code: 'UNKNOWN', message: 'An unexpected error occurred.' },
    };
  },

  async list(): Promise<{
    ok: boolean;
    status: number;
    plans?: BackendNutritionPlan[];
    error?: { code: string; message: string };
  }> {
    const res = await api.get('/plans/');
    const json = await res.json();
    if (json.success) {
      // Backend may return { plans: [...] } or [...] directly
      const raw = json.data;
      const plans: BackendNutritionPlan[] = Array.isArray(raw)
        ? raw
        : Array.isArray(raw?.plans)
        ? raw.plans
        : [];
      return { ok: true, status: res.status, plans };
    }
    return {
      ok: false,
      status: res.status,
      error: json.error ?? { code: 'UNKNOWN', message: 'An unexpected error occurred.' },
    };
  },

  async getById(id: number): Promise<{
    ok: boolean;
    status: number;
    plan?: BackendNutritionPlan;
    error?: { code: string; message: string };
  }> {
    const res = await api.get(`/plans/${id}/`);
    const json = await res.json();
    if (json.success) {
      return { ok: true, status: res.status, plan: json.data?.plan as BackendNutritionPlan };
    }
    return {
      ok: false,
      status: res.status,
      error: json.error ?? { code: 'UNKNOWN', message: 'An unexpected error occurred.' },
    };
  },
};

// ─── Profile API helpers ──────────────────────────────────────────────────────
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
  async getMe(): Promise<{
    ok: boolean;
    status: number;
    profile?: UserProfileData;
    error?: { code: string; message: string };
  }> {
    const res = await api.get('/profile/me/');
    const json = await res.json();
    if (json.success) {
      return { ok: true, status: res.status, profile: json.data as UserProfileData };
    }
    return {
      ok: false,
      status: res.status,
      error: json.error ?? { code: 'UNKNOWN', message: 'An unexpected error occurred.' },
    };
  },

  async updateMe(data: Partial<UserProfileData> & { health_conditions?: number[]; allergies?: number[] }): Promise<{
    ok: boolean;
    status: number;
    profile?: UserProfileData;
    error?: { code: string; message: string };
  }> {
    const res = await api.patch('/profile/me/', data);
    const json = await res.json();
    if (json.success) {
      return { ok: true, status: res.status, profile: json.data as UserProfileData };
    }
    return {
      ok: false,
      status: res.status,
      error: json.error ?? { code: 'UNKNOWN', message: 'An unexpected error occurred.' },
    };
  },
};

// ─── Option Lookups API helpers ──────────────────────────────────────────────

export const optionsApi = {
  async getHealthConditions(): Promise<{
    ok: boolean;
    health_conditions?: { id: number; name: string }[];
    error?: { code: string; message: string };
  }> {
    const res = await api.get('/health-conditions/');
    const json = await res.json();
    if (json.success) {
      return { ok: true, health_conditions: json.data?.health_conditions ?? [] };
    }
    return { ok: false, error: json.error ?? { code: 'UNKNOWN', message: 'An unexpected error occurred.' } };
  },

  async getAllergies(): Promise<{
    ok: boolean;
    allergies?: { id: number; name: string }[];
    error?: { code: string; message: string };
  }> {
    const res = await api.get('/allergies/');
    const json = await res.json();
    if (json.success) {
      return { ok: true, allergies: json.data?.allergies ?? [] };
    }
    return { ok: false, error: json.error ?? { code: 'UNKNOWN', message: 'An unexpected error occurred.' } };
  }
};
