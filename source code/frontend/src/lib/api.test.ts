import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { api, setUnauthorizedHandler } from './api';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

function mockResponse(status: number, body: unknown = {}) {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  } as Response);
}

beforeEach(() => {
  mockFetch.mockReset();
  Object.defineProperty(document, 'cookie', { value: '', writable: true });
});

afterEach(() => {
  setUnauthorizedHandler(() => {});
});

describe('api.get', () => {
  it('sends Accept header and credentials', async () => {
    mockFetch.mockReturnValue(mockResponse(200));
    await api.get('/test/');
    const [, opts] = mockFetch.mock.calls[0];
    expect((opts as RequestInit).headers).toMatchObject({ Accept: 'application/json' });
    expect((opts as RequestInit).credentials).toBe('include');
  });

  it('calls onUnauthorized handler on 401', async () => {
    mockFetch.mockReturnValue(mockResponse(401));
    const handler = vi.fn();
    setUnauthorizedHandler(handler);
    await api.get('/test/');
    expect(handler).toHaveBeenCalledOnce();
  });

  it('does not call onUnauthorized on 200', async () => {
    mockFetch.mockReturnValue(mockResponse(200));
    const handler = vi.fn();
    setUnauthorizedHandler(handler);
    await api.get('/test/');
    expect(handler).not.toHaveBeenCalled();
  });
});

describe('api.post', () => {
  it('includes Content-Type application/json', async () => {
    // First call: ensureCsrfToken hits /csrf/, second call: the actual POST
    mockFetch
      .mockReturnValueOnce(mockResponse(200)) // csrf fetch
      .mockReturnValueOnce(mockResponse(200));
    Object.defineProperty(document, 'cookie', { value: 'csrftoken=testtoken', writable: true });
    await api.post('/test/', { foo: 'bar' });
    const postCall = mockFetch.mock.calls[0];
    const opts = postCall[1] as RequestInit;
    expect((opts.headers as Record<string, string>)['Content-Type']).toBe('application/json');
  });

  it('sends X-CSRFToken from cookie', async () => {
    Object.defineProperty(document, 'cookie', { value: 'csrftoken=abc123', writable: true });
    mockFetch.mockReturnValue(mockResponse(200));
    await api.post('/test/', {});
    const opts = mockFetch.mock.calls[0][1] as RequestInit;
    expect((opts.headers as Record<string, string>)['X-CSRFToken']).toBe('abc123');
  });

  it('fetches CSRF endpoint when cookie is absent', async () => {
    Object.defineProperty(document, 'cookie', { value: '', writable: true });
    mockFetch.mockReturnValue(mockResponse(200));
    await api.post('/test/', {});
    expect(mockFetch.mock.calls[0][0]).toContain('/csrf/');
  });

  it('serialises body as JSON', async () => {
    Object.defineProperty(document, 'cookie', { value: 'csrftoken=tok', writable: true });
    mockFetch.mockReturnValue(mockResponse(200));
    await api.post('/test/', { name: 'Mazaj' });
    const opts = mockFetch.mock.calls[0][1] as RequestInit;
    expect(opts.body).toBe(JSON.stringify({ name: 'Mazaj' }));
  });

  it('calls onUnauthorized handler on 401', async () => {
    Object.defineProperty(document, 'cookie', { value: 'csrftoken=tok', writable: true });
    mockFetch.mockReturnValue(mockResponse(401));
    const handler = vi.fn();
    setUnauthorizedHandler(handler);
    await api.post('/test/', {});
    expect(handler).toHaveBeenCalledOnce();
  });
});
