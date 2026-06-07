import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

function mockResponse(status: number, body: unknown) {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  } as Response);
}

function TestConsumer() {
  const { user, loading } = useAuth();
  if (loading) return <div>loading</div>;
  return <div>{user ? `user:${user.email}` : 'no-user'}</div>;
}

beforeEach(() => {
  mockFetch.mockReset();
  Object.defineProperty(document, 'cookie', { value: '', writable: true });
});

describe('AuthContext', () => {
  it('renders loading state initially', async () => {
    mockFetch.mockReturnValue(new Promise(() => {})); // never resolves
    render(<AuthProvider><TestConsumer /></AuthProvider>);
    expect(screen.getByText('loading')).toBeTruthy();
  });

  it('sets user to null when /auth/me/ fails', async () => {
    mockFetch.mockReturnValue(mockResponse(403, { success: false }));
    render(<AuthProvider><TestConsumer /></AuthProvider>);
    await waitFor(() => expect(screen.getByText('no-user')).toBeTruthy());
  });

  it('sets user when /auth/me/ succeeds', async () => {
    mockFetch.mockReturnValue(
      mockResponse(200, {
        success: true,
        data: {
          user: {
            id: 1,
            email: 'user@example.com',
            full_name: 'Test User',
            role: 'USER',
            tier: 'FREE',
            subscription_status: 'active',
            onboarding_complete: true,
          },
        },
      })
    );
    render(<AuthProvider><TestConsumer /></AuthProvider>);
    await waitFor(() => expect(screen.getByText('user:user@example.com')).toBeTruthy());
  });

  it('clears user after logout', async () => {
    // Initial me call succeeds
    mockFetch
      .mockReturnValueOnce(
        mockResponse(200, {
          success: true,
          data: {
            user: {
              id: 1, email: 'user@example.com', full_name: 'Test',
              role: 'USER', tier: 'FREE', subscription_status: 'active',
              onboarding_complete: true,
            },
          },
        })
      )
      // ensureCsrfToken GET + logout POST both return 200
      .mockReturnValue(mockResponse(200, { success: true }));

    function LogoutConsumer() {
      const { user, loading, logout } = useAuth();
      if (loading) return <div>loading</div>;
      return (
        <div>
          <span>{user ? `user:${user.email}` : 'no-user'}</span>
          <button onClick={() => logout()}>logout</button>
        </div>
      );
    }

    const { getByText } = render(<AuthProvider><LogoutConsumer /></AuthProvider>);
    await waitFor(() => getByText('user:user@example.com'));
    getByText('logout').click();
    await waitFor(() => expect(getByText('no-user')).toBeTruthy());
  });
});
