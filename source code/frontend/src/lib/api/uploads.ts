import { api } from './client';

export interface FoodImageUploadSuccess {
  recognized_food: string;
  matched_food: {
    id: number;
    name: string;
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
  };
  source: string;
  message: string;
}

export interface InBodyUploadSuccess {
  status: string;
  filename: string;
  size_bytes: number;
  content_type: string;
  message: string;
}

type AR<T> = { ok: boolean; status: number; data?: T; error?: { code: string; message: string; recognized_food?: string } };

// The upload endpoints return a flat payload (no `data` envelope).
// On non-success, error fields live at the top level too.
async function readUploadResponse<T>(res: Response): Promise<AR<T>> {
  let json: any = {};
  try { json = await res.json(); } catch { /* non-JSON */ }

  if (json && json.success) {
    const { success, ...rest } = json;
    return { ok: true, status: res.status, data: rest as T };
  }

  const code = json?.code ?? json?.error?.code ?? 'UNKNOWN';
  const message = json?.message ?? json?.error?.message ?? 'Upload failed.';
  const recognized_food = json?.recognized_food;
  return { ok: false, status: res.status, error: { code, message, recognized_food } };
}

export const uploadsApi = {
  async uploadFoodImage(file: File): Promise<AR<FoodImageUploadSuccess>> {
    const form = new FormData();
    form.append('image', file);
    const res = await api.postForm('/uploads/food-image/', form);
    return readUploadResponse<FoodImageUploadSuccess>(res);
  },

  async uploadInBody(file: File): Promise<AR<InBodyUploadSuccess>> {
    const form = new FormData();
    form.append('file', file);
    const res = await api.postForm('/uploads/inbody/', form);
    return readUploadResponse<InBodyUploadSuccess>(res);
  },
};
