import { Leaf } from 'lucide-react';
import { InfoSection } from './InfoPage';

interface InfoFooterProps {
  onNavigate: (section: InfoSection) => void;
}

export function InfoFooter({ onNavigate }: InfoFooterProps) {
  return (
    <footer className="bg-card border-t border-border mt-16">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Leaf className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-semibold">Mazaj+</span>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              A web-based, chat-driven nutrition decision-support platform providing personalized
              guidance for everyday wellness.
            </p>
            <div className="bg-accent/10 border border-accent/20 rounded-lg p-3">
              <p className="text-xs text-accent-foreground">
                <strong>Advisory Notice:</strong> Mazaj+ provides nutrition guidance only and does
                not replace professional healthcare advice.
              </p>
            </div>
          </div>

          {/* Information Links */}
          <div>
            <h4 className="mb-4">Information</h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => onNavigate('about')}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  About
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('faq')}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  FAQ
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('support')}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Support
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('contact')}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Contact
                </button>
              </li>
            </ul>
          </div>

          {/* Account Links */}
          <div>
            <h4 className="mb-4">Account</h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="/dashboard/subscription"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Pricing
                </a>
              </li>
              <li>
                <a
                  href="/login"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Login
                </a>
              </li>
              <li>
                <a
                  href="/register"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Register
                </a>
              </li>
              <li>
                <a
                  href="/dashboard"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Dashboard
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t border-border text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Mazaj+. An academic prototype nutrition decision-support platform.
          </p>
        </div>
      </div>
    </footer>
  );
}
