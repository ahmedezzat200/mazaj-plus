import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { useAuth } from '../../../contexts/AuthContext';

interface FormData {
  email: string;
  password: string;
}

interface FormErrors {
  email?: string;
  password?: string;
  credentials?: string;
}

interface TouchedFields {
  email: boolean;
  password: boolean;
}

type UserRole = 'user' | 'admin';
type OnboardingStatus = 'incomplete' | 'complete';

export function LoginForm() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: ''
  });

  const [touched, setTouched] = useState<TouchedFields>({
    email: false,
    password: false
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [credentialsError, setCredentialsError] = useState<string | null>(null);
  const [redirecting, setRedirecting] = useState(false);
  const [redirectMessage, setRedirectMessage] = useState<string | null>(null);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = (): FormErrors => {
    const errors: FormErrors = {};

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    }

    return errors;
  };

  const errors = validateForm();
  const isFormValid = Object.keys(errors).length === 0;

  const handleBlur = (field: keyof TouchedFields) => {
    setTouched({ ...touched, [field]: true });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setTouched({
      email: true,
      password: true
    });

    if (!isFormValid) {
      return;
    }

    setIsSubmitting(true);
    setCredentialsError(null);

    try {
      const result = await login({ email: formData.email, password: formData.password });
      
      if (result.success) {
        setRedirecting(true);
        const user = result.data.user;
        
        // Admin user -> /admin
        // Normal user with onboarding_complete = false -> /onboarding
        // Normal user with onboarding_complete = true -> /dashboard
        let targetPath = '/dashboard';
        if (user.role === 'ADMIN') {
          targetPath = '/admin';
        } else if (!user.onboarding_complete) {
          targetPath = '/onboarding';
        }
        
        setRedirectMessage(user.role === 'ADMIN' 
          ? 'Login successful, redirecting to admin panel...'
          : user.onboarding_complete 
            ? 'Login successful, redirecting to dashboard...' 
            : 'Login successful, please complete your profile...');
          
        setTimeout(() => {
          navigate(targetPath);
        }, 1500);
      } else {
        setCredentialsError(result.error?.message || 'Invalid email or password. Please try again.');
        setIsSubmitting(false);
      }
    } catch (err: any) {
      setCredentialsError('Unable to reach the server. Please check your connection.');
      setIsSubmitting(false);
    }
  };

  const getInputClassName = (field: keyof TouchedFields, hasError: boolean) => {
    const baseClasses = "w-full px-4 py-3 bg-input-background border rounded-lg transition-all outline-none";

    if ((touched[field] && hasError) || credentialsError) {
      return `${baseClasses} border-destructive focus:border-destructive focus:ring-2 focus:ring-destructive/20`;
    }

    if (touched[field] && !hasError && formData[field]) {
      return `${baseClasses} border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20`;
    }

    return `${baseClasses} border-border focus:border-primary focus:ring-2 focus:ring-primary/20`;
  };

  if (redirecting) {
    return (
      <div className="bg-card rounded-2xl p-8 lg:p-12 border border-border shadow-sm">
        <div className="text-center max-w-md mx-auto">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-primary animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-foreground mb-3">
            Login successful
          </h2>
          <p className="text-muted-foreground">
            {redirectMessage}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl p-8 lg:p-12 border border-border shadow-sm">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-foreground mb-2">
          Login to Mazaj+
        </h2>
        <p className="text-sm text-muted-foreground">
          Access your profile, guidance, and plan history.
        </p>
      </div>

      {credentialsError && (
        <div className="mb-6 p-4 bg-destructive/10 border border-destructive/30 rounded-lg flex items-start gap-3">
          <svg className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-destructive">{credentialsError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => {
              setFormData({ ...formData, email: e.target.value });
              setCredentialsError(null);
            }}
            onBlur={() => handleBlur('email')}
            className={getInputClassName('email', !!errors.email)}
            placeholder="your@email.com"
          />
          {touched.email && errors.email && !credentialsError && (
            <p className="mt-2 text-sm text-destructive flex items-center gap-1">
              {errors.email}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => {
                setFormData({ ...formData, password: e.target.value });
                setCredentialsError(null);
              }}
              onBlur={() => handleBlur('password')}
              className={getInputClassName('password', !!errors.password)}
              placeholder="Enter your password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
          {touched.password && errors.password && !credentialsError && (
            <p className="mt-2 text-sm text-destructive flex items-center gap-1">
              {errors.password}
            </p>
          )}
        </div>

        <div className="flex items-center justify-end">
          <a href="#forgot-password" className="text-sm text-primary hover:underline font-medium">
            Forgot password?
          </a>
        </div>

        <button
          type="submit"
          disabled={!isFormValid || isSubmitting}
          className="w-full px-8 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Logging in...
            </span>
          ) : (
            'Login'
          )}
        </button>

        <p className="text-center text-sm text-muted-foreground">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary hover:underline font-medium">
            Create account
          </Link>
        </p>
      </form>

      <div className="mt-6 p-4 bg-muted/30 rounded-lg border border-border">
        <p className="text-xs text-muted-foreground mb-2 font-medium">Demo accounts:</p>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>• user@example.com / password123 (Free)</li>
          <li>• pro@example.com / password123 (Pro)</li>
          <li>• ultra@example.com / password123 (Ultra)</li>
          <li>• admin@mazaj.com / admin123 (Admin)</li>
        </ul>
      </div>

      <div className="mt-8 pt-6 border-t border-border">
        <p className="text-xs text-muted-foreground text-center leading-relaxed">
          Mazaj+ provides nutrition decision support only. This platform does not diagnose medical conditions or replace healthcare professionals.
        </p>
      </div>
    </div>
  );
}