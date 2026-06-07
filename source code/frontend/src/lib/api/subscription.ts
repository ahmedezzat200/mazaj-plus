import { api } from './client';

export interface SubscriptionData {
  tier: string;
  is_active: boolean;
  features: Record<string, boolean>;
  limits: Record<string, number | null>;
}

export interface CheckoutData {
  checkout_id: string;
  target_tier: string;
  status: string;
}

export const subscriptionApi = {
  async getMe() {
    const res = await api.get('/subscription/me/');
    const json = await res.json();
    if (json.success) return { ok: true, status: res.status, data: json.data as SubscriptionData };
    return { ok: false, status: res.status, error: json.error ?? { code: 'UNKNOWN', message: 'An unexpected error occurred.' } };
  },

  async upgrade(targetTier: string) {
    const res = await api.post('/subscription/upgrade/', { target_tier: targetTier, payment_confirmed: true });
    const json = await res.json();
    if (json.success) return { ok: true, status: res.status, data: json.data as SubscriptionData };
    return { ok: false, status: res.status, error: json.error ?? { code: 'UNKNOWN', message: 'An unexpected error occurred.' } };
  },

  async checkout(targetTier: string) {
    const res = await api.post('/subscription/checkout/', { target_tier: targetTier });
    const json = await res.json();
    if (json.success) return { ok: true, status: res.status, data: json.data as CheckoutData };
    return { ok: false, status: res.status, error: json.error ?? { code: 'UNKNOWN', message: 'An unexpected error occurred.' } };
  },

  async mockPaymentSuccess(checkoutId: string) {
    const res = await api.post('/subscription/mock-payment-success/', { checkout_id: checkoutId });
    const json = await res.json();
    if (json.success) return { ok: true, status: res.status, data: json.data as SubscriptionData };
    return { ok: false, status: res.status, error: json.error ?? { code: 'UNKNOWN', message: 'An unexpected error occurred.' } };
  },
};
