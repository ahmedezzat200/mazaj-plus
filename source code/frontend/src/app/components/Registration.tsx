import { Link } from 'react-router';
import { RegistrationForm } from './registration/RegistrationForm';

export function Registration() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-semibold">M+</span>
            </div>
            <span className="text-xl font-semibold text-foreground">Mazaj+</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground hidden sm:inline">Already have an account?</span>
            <Link to="/login" className="px-5 py-2 border border-border rounded-lg text-sm font-medium hover:bg-muted/50 transition-colors">
              Login
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center py-12 md:py-20">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 w-full">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
            <div className="order-2 lg:order-1 bg-gradient-to-br from-primary/5 to-secondary/10 rounded-2xl p-8 lg:p-12 h-full flex flex-col justify-center">
              <h1 className="text-3xl lg:text-4xl font-semibold text-foreground mb-6 leading-tight">
                Create your Mazaj+ account
              </h1>
              <p className="text-muted-foreground mb-10 leading-relaxed">
                Join our platform for personalized, rule-based nutrition guidance that understands your unique profile and needs.
              </p>
              <div className="space-y-6">
                {[
                  { title: 'Profile-based continuity', desc: 'Your preferences stay with you' },
                  { title: 'Safer nutrition guidance', desc: 'Checks for allergies and conditions' },
                  { title: 'Tier-based access', desc: 'Unlock advanced features as you grow' },
                ].map((point) => (
                  <div key={point.title} className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground mb-1">{point.title}</h3>
                      <p className="text-sm text-muted-foreground">{point.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <RegistrationForm />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
