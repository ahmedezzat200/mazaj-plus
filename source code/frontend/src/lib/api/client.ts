const API_BASE_URL = 'http://localhost:8000/api/v1';

type UnauthorizedCallback = () => void;
let _onUnauthorized: UnauthorizedCallback | null = null;

export function setUnauthorizedHandler(cb: UnauthorizedCallback) {
  _onUnauthorized = cb;
}

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

export function generateIdempotencyKey(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    const values = crypto.getRandomValues(new Uint32Array(2));
    return `${Date.now()}-${values[0].toString(36)}-${values[1].toString(36)}`;
  }
  return `${Date.now()}-${performance.now().toString(36).replace('.', '')}`;
}

export const api = {
  async get(endpoint: string, options: RequestInit = {}) {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: { 'Accept': 'application/json', ...options.headers },
      credentials: 'include',
    });
    if (res.status === 401 && _onUnauthorized) _onUnauthorized();
    return res;
  },

  async post(endpoint: string, data: any, options: RequestInit = {}) {
    const csrftoken = await ensureCsrfToken();
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
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
    if (res.status === 401 && _onUnauthorized) _onUnauthorized();
    return res;
  },

  async postForm(endpoint: string, data: FormData, options: RequestInit = {}) {
    const csrftoken = await ensureCsrfToken();
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        ...(csrftoken ? { 'X-CSRFToken': csrftoken } : {}),
        ...options.headers,
      },
      credentials: 'include',
      body: data,
    });
    if (res.status === 401 && _onUnauthorized) _onUnauthorized();
    return res;
  },

  async put(endpoint: string, data: any, options: RequestInit = {}) {
    const csrftoken = await ensureCsrfToken();
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
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
    if (res.status === 401 && _onUnauthorized) _onUnauthorized();
    return res;
  },

  async patch(endpoint: string, data: any, options: RequestInit = {}) {
    const csrftoken = await ensureCsrfToken();
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
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
    if (res.status === 401 && _onUnauthorized) _onUnauthorized();
    return res;
  },

  async delete(endpoint: string, options: RequestInit = {}) {
    const csrftoken = await ensureCsrfToken();
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
        ...(csrftoken ? { 'X-CSRFToken': csrftoken } : {}),
        ...options.headers,
      },
      credentials: 'include',
    });
    if (res.status === 401 && _onUnauthorized) _onUnauthorized();
    return res;
  },
};
