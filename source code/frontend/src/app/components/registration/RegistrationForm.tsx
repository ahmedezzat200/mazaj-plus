import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { useAuth } from '../../../contexts/AuthContext';
import { TierPreview } from './TierPreview';

interface FormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  advisoryAccepted: boolean;
}

interface FormErrors {
  fullName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  advisoryAccepted?: string;
}

interface TouchedFields {
  fullName: boolean;
  email: boolean;
  password: boolean;
  confirmPassword: boolean;
}

export function RegistrationForm() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    advisoryAccepted: false
  });

  const [touched, setTouched] = useState<TouchedFields>({
    fullName: false,
    email: false,
    password: false,
    confirmPassword: false
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = (): FormErrors => {
    const errors: FormErrors = {};

    if (!formData.fullName.trim()) {
      errors.fullName = 'Full name is required';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.advisoryAccepted) {
      errors.advisoryAccepted = 'You must accept the advisory notice to continue';
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
      fullName: true,
      email: true,
      password: true,
      confirmPassword: true
    });

    if (!isFormValid) {
      return;
    }

    setIsSubmitting(true);
    setServerError(null);

    try {
      const result = await register({
        full_name: formData.fullName,
        email: formData.email,
        password: formData.password,
        advisory_terms_accepted: formData.advisoryAccepted
      });

      if (result.success) {
        setIsSuccess(true);
      } else {
        setServerError(result.error?.message || 'Registration failed. Please try again.');
      }
    } catch (err: any) {
      setServerError('Unable to reach the server. Please check your connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInputClassName = (field: keyof TouchedFields, hasError: boolean) => {
    const baseClasses = "w-full px-4 py-3 bg-input-background border rounded-lg transition-all outline-none";

    if (touched[field] && hasError) {
      return `${baseClasses} border-destructive focus:border-destructive focus:ring-2 focus:ring-destructive/20`;
    }

    if (touched[field] && !hasError && formData[field]) {
      return `${baseClasses} border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20`;
    }

    return `${baseClasses} border-border focus:border-primary focus:ring-2 focus:ring-primary/20`;
  };

  if (isSuccess) {
    return (
      <div className="bg-card rounded-2xl p-8 lg:p-12 border border-border shadow-sm">
        <div className="text-center max-w-md mx-auto">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-foreground mb-3">
            Account created successfully
          </h2>
          <p className="text-muted-foreground mb-8">
            Your account is ready. Please log in to complete your profile and start using Mazaj+
          </p>
          <button 
            onClick={() => navigate('/login')}
            className="w-full px-8 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all shadow-sm hover:shadow-md"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl p-8 lg:p-12 border border-border shadow-sm">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-foreground mb-2">
          Create your account
        </h2>
        <p className="text-sm text-muted-foreground">
          Start on Free. Upgrade later if you need more.
        </p>
      </div>

      {serverError && (
        <div className="mb-6 p-4 bg-destructive/10 border border-destructive/30 rounded-lg flex items-start gap-3">
          <svg className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-destructive">{serverError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-foreground mb-2">
            Full Name
          </label>
          <input
            id="fullName"
            type="text"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            onBlur={() => handleBlur('fullName')}
            className={getInputClassName('fullName', !!errors.fullName)}
            placeholder="Enter your full name"
          />
          {touched.fullName && errors.fullName && (
            <p className="mt-2 text-sm text-destructive flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {errors.fullName}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            onBlur={() => handleBlur('email')}
            className={getInputClassName('email', !!errors.email)}
            placeholder="your@email.com"
          />
          {touched.email && errors.email && (
            <p className="mt-2 text-sm text-destructive flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {errors.email}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            onBlur={() => handleBlur('password')}
            className={getInputClassName('password', !!errors.password)}
            placeholder="At least 8 characters"
          />
          {touched.password && errors.password && (
            <p className="mt-2 text-sm text-destructive flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {errors.password}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground mb-2">
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            onBlur={() => handleBlur('confirmPassword')}
            className={getInputClassName('confirmPassword', !!errors.confirmPassword)}
            placeholder="Re-enter your password"
          />
          {touched.confirmPassword && errors.confirmPassword && (
            <p className="mt-2 text-sm text-destructive flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {errors.confirmPassword}
            </p>
          )}
        </div>

        <div className="pt-4">
          <div className="bg-accent/10 border border-accent/30 rounded-lg p-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.advisoryAccepted}
                onChange={(e) => setFormData({ ...formData, advisoryAccepted: e.target.checked })}
                className="mt-1 w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-primary/20"
              />
              <span className="text-sm text-foreground leading-relaxed">
                I understand that Mazaj+ provides <strong>advisory nutrition guidance only</strong>. This platform does not diagnose medical conditions, prescribe treatment, or replace the advice of qualified healthcare professionals.
              </span>
            </label>
            {errors.advisoryAccepted && !formData.advisoryAccepted && (
              <p className="mt-2 ml-7 text-sm text-destructive flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {errors.advisoryAccepted}
              </p>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={!isFormValid || isSubmitting}
          className="w-full px-8 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary disabled:hover:shadow-sm"
        >
          {isSubmitting ? 'Creating account...' : 'Create Free Account'}
        </button>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link to="/login" className="text-primary hover:underline font-medium">
            Login
          </Link>
        </p>
      </form>

      <TierPreview />
    </div>
  );
}