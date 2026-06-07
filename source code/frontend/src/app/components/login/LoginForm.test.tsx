import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { LoginForm } from './LoginForm';

const mockNavigate = vi.fn();
vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router')>();
  return { ...actual, useNavigate: () => mockNavigate };
});

const mockLogin = vi.fn();
vi.mock('../../../contexts/AuthContext', () => ({
  useAuth: () => ({ login: mockLogin }),
}));

beforeEach(() => {
  mockNavigate.mockReset();
  mockLogin.mockReset();
});

function renderForm() {
  return render(
    <MemoryRouter>
      <LoginForm />
    </MemoryRouter>
  );
}

describe('LoginForm', () => {
  // Use placeholder to avoid matching the "Show password" aria-label button
  const passwordInput = () => screen.getByPlaceholderText('Enter your password');

  it('renders email and password fields', () => {
    renderForm();
    expect(screen.getByLabelText(/email address/i)).toBeTruthy();
    expect(passwordInput()).toBeTruthy();
  });

  it('shows credentials error on failed login', async () => {
    mockLogin.mockResolvedValue({
      success: false,
      error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password.' },
    });
    renderForm();
    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'bad@example.com' } });
    fireEvent.change(passwordInput(), { target: { value: 'wrong' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    await waitFor(() =>
      expect(screen.getByText(/invalid email or password/i)).toBeTruthy()
    );
  });

  it('navigates to /dashboard on successful regular user login', async () => {
    mockLogin.mockResolvedValue({
      success: true,
      data: { user: { role: 'USER', onboarding_complete: true } },
    });
    renderForm();
    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'user@example.com' } });
    fireEvent.change(passwordInput(), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/dashboard'));
  });

  it('navigates to /admin on admin login', async () => {
    mockLogin.mockResolvedValue({
      success: true,
      data: { user: { role: 'ADMIN', onboarding_complete: true } },
    });
    renderForm();
    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'admin@mazaj.com' } });
    fireEvent.change(passwordInput(), { target: { value: 'admin123' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/admin'));
  });

  it('navigates to /onboarding when onboarding not complete', async () => {
    mockLogin.mockResolvedValue({
      success: true,
      data: { user: { role: 'USER', onboarding_complete: false } },
    });
    renderForm();
    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'new@example.com' } });
    fireEvent.change(passwordInput(), { target: { value: 'pass123' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/onboarding'));
  });

  it('shows validation error when email is blurred empty', async () => {
    renderForm();
    fireEvent.blur(screen.getByLabelText(/email address/i));
    await waitFor(() =>
      expect(screen.getByText(/email is required/i)).toBeTruthy()
    );
  });
});
