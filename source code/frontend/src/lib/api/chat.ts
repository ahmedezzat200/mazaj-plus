import { api, generateIdempotencyKey } from './client';

export interface BackendFoodItem {
  name: string;
  meal?: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  reason: string;
}

export interface BackendWarning {
  food: string;
  warnings: string[];
}

export interface ChatSendResponse {
  session_id: number;
  mode: string;
  reply_text: string;
  recommended_foods: BackendFoodItem[];
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
  async sendMessage(message: string, sessionId: number | null) {
    const res = await api.post('/chat/message/', { message, session_id: sessionId }, {
      headers: { 'Idempotency-Key': generateIdempotencyKey() },
    });
    const json = await res.json();
    if (json.success) return { ok: true, status: res.status, data: json.data as ChatSendResponse };
    return { ok: false, status: res.status, error: json.error ?? { code: 'UNKNOWN', message: 'An unexpected error occurred.' } };
  },

  async listSessions() {
    const res = await api.get('/chat/sessions/');
    const json = await res.json();
    if (json.success) return { ok: true, sessions: json.data?.sessions ?? [] as { id: number; title: string; mode: string; created_at: string; updated_at: string }[] };
    return { ok: false, error: json.error ?? { code: 'UNKNOWN', message: 'An unexpected error occurred.' } };
  },

  async getSession(id: number) {
    const res = await api.get(`/chat/sessions/${id}/`);
    const json = await res.json();
    if (json.success) return { ok: true, status: res.status, session: json.data?.session };
    return { ok: false, status: res.status, error: json.error ?? { code: 'UNKNOWN', message: 'An unexpected error occurred.' } };
  },

  async uploadFoodImage(file: File, sessionId: number | null) {
    const form = new FormData();
    form.append('image', file);
    if (sessionId) {
      form.append('session_id', String(sessionId));
    }
    const res = await api.postForm('/chat/upload-food-image/', form);
    const json = await res.json();
    if (json.success) return { ok: true, data: json.data };
    return { ok: false, error: json.error ?? { code: 'UNKNOWN', message: 'An unexpected error occurred.' } };
  },

  async uploadInBody(file: File, sessionId: number | null) {
    const form = new FormData();
    form.append('file', file);
    if (sessionId) {
      form.append('session_id', String(sessionId));
    }
    const res = await api.postForm('/chat/upload-inbody/', form);
    const json = await res.json();
    if (json.success) return { ok: true, data: json.data };
    return { ok: false, error: json.error ?? { code: 'UNKNOWN', message: 'An unexpected error occurred.' } };
  },
};
