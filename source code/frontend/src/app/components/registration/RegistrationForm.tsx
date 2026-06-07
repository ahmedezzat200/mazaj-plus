import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { useAuth } from '../../../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

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

function getPasswordStrength(password: string): { score: number; label: string; color: string } {
  if (!password) return { score: 0, label: '', color: '' };
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { score, label: 'Weak', color: 'bg-red-500' };
  if (score <= 2) return { score, label: 'Fair', color: 'bg-yellow-500' };
  if (score <= 3) return { score, label: 'Good', color: 'bg-yellow-400' };
  return { score, label: 'Strong', color: 'bg-green-500' };
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

    if (!isFormValid) return;

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
    } catch (err: unknown) {
      setServerError('Unable to reach the server. Please check your connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInputClassName = (field: keyof TouchedFields, hasError: boolean) => {
    const baseClasses = "w-full px-4 py-3 bg-input-background border rounded-lg transition-all duration-200 outline-none text-sm";

    if (touched[field] && hasError) {
      return `${baseClasses} border-destructive focus:border-destructive focus:ring-2 focus:ring-destructive/20`;
    }

    if (touched[field] && !hasError && formData[field]) {
      return `${baseClasses} border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20`;
    }

    return `${baseClasses} border-border focus:border-primary focus:ring-2 focus:ring-primary/20`;
  };

  const passwordStrength = getPasswordStrength(formData.password);

  if (isSuccess) {
    return (
      <div className="bg-card rounded-2xl p-8 lg:p-12 border border-border shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="text-center max-w-md mx-auto">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6 animate-in zoom-in duration-500">
            <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-foreground mb-3">Account created successfully!</h2>
          <p className="text-muted-foreground mb-8">
            Complete your profile to get personalized nutrition plans.
          </p>
          <button
            onClick={() => navigate('/onboarding')}
            className="w-full px-8 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 active:scale-[0.98] transition-all duration-200 shadow-sm hover:shadow-md font-medium"
          >
            Continue to Setup
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl p-8 lg:p-12 border border-border shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-foreground mb-2">Create your account</h2>
        <p className="text-sm text-muted-foreground">Start on Free. Upgrade anytime.</p>
      </div>

      {serverError && (
        <div className="mb-6 p-4 bg-destructive/10 border border-destructive/30 rounded-lg flex items-start gap-3 animate-in fade-in duration-300">
          <svg className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-destructive">{serverError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
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
            <p className="mt-2 text-sm text-destructive">{errors.fullName}</p>
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
            <p className="mt-2 text-sm text-destructive">{errors.email}</p>
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
          {/* Password strength indicator */}
          {formData.password && (
            <div className="mt-2 space-y-1">
              <div className="flex gap-1 h-1">
                {[1, 2, 3, 4, 5].map((level) => (
                  <div
                    key={level}
                    className={`flex-1 rounded-full transition-all duration-300 ${
                      passwordStrength.score >= level
                        ? passwordStrength.color
                        : 'bg-muted'
                    }`}
                  />
                ))}
              </div>
              <p className={`text-xs font-medium transition-colors duration-200 ${
                passwordStrength.score <= 1 ? 'text-red-500' :
                passwordStrength.score <= 3 ? 'text-yellow-500' :
                'text-green-500'
              }`}>
                {passwordStrength.label}
              </p>
            </div>
          )}
          {touched.password && errors.password && (
            <p className="mt-2 text-sm text-destructive">{errors.password}</p>
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
            <p className="mt-2 text-sm text-destructive">{errors.confirmPassword}</p>
          )}
        </div>

        <div className="pt-1">
          <div className="bg-accent/10 border border-accent/30 rounded-lg p-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.advisoryAccepted}
                onChange={(e) => setFormData({ ...formData, advisoryAccepted: e.target.checked })}
                className="mt-1 w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-primary/20 accent-primary"
              />
              <span className="text-sm text-foreground leading-relaxed">
                I understand that Mazaj+ provides <strong>advisory nutrition guidance only</strong> and does not replace qualified healthcare professionals.
              </span>
            </label>
            {errors.advisoryAccepted && !formData.advisoryAccepted && (
              <p className="mt-2 ml-7 text-sm text-destructive">{errors.advisoryAccepted}</p>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={!isFormValid || isSubmitting}
          className="w-full px-8 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 active:scale-[0.98] transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Creating account…
            </span>
          ) : (
            'Create Free Account'
          )}
        </button>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link to="/login" className="text-primary hover:underline font-medium transition-colors">
            Sign in
          </Link>
        </p>
      </form>

      <div className="mt-8 pt-8 border-t border-border">
        <h3 className="text-sm font-medium text-foreground mb-4">Your plan options</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { name: 'Free', tag: 'You start here', features: ['Chat guidance', 'Plans', 'Hydration', 'Daily tips'], highlight: true },
            { name: 'Pro', tag: 'Upgrade anytime', features: ['All Free', 'Image analysis', 'InBody upload'], highlight: false },
            { name: 'Ultra', tag: 'Full access', features: ['All Pro', 'Tracking', 'Reports', 'Full history'], highlight: false },
          ].map((tier) => (
            <div key={tier.name} className={`rounded-lg p-4 border ${tier.highlight ? 'bg-primary/5 border-primary/30' : 'bg-muted/30 border-border'}`}>
              <div className="flex items-center justify-between mb-3">
                <span className="font-medium text-foreground">{tier.name}</span>
                <span className={`text-xs px-2 py-0.5 rounded ${tier.highlight ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>{tier.tag}</span>
              </div>
              <ul className="space-y-1.5">
                {tier.features.map((f) => (
                  <li key={f} className="text-xs text-muted-foreground flex items-center gap-2">
                    <svg className="w-3 h-3 text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
