import { Leaf } from 'lucide-react';
import { Button } from '../ui/button';
import { InfoSection } from './InfoPage';

interface InfoNavigationProps {
  activeSection: InfoSection;
  onNavigate: (section: InfoSection) => void;
}

const navItems = [
  { id: 'about' as InfoSection, label: 'About' },
  { id: 'faq' as InfoSection, label: 'FAQ' },
  { id: 'support' as InfoSection, label: 'Support' },
  { id: 'contact' as InfoSection, label: 'Contact' },
];

export function InfoNavigation({ activeSection, onNavigate }: InfoNavigationProps) {
  return (
    <nav className="sticky top-0 z-40 bg-card border-b border-border backdrop-blur-sm bg-card/95">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Leaf className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold">Mazaj+</span>
          </a>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Button
                key={item.id}
                variant={activeSection === item.id ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onNavigate(item.id)}
              >
                {item.label}
              </Button>
            ))}
          </div>

          {/* Auth Links */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <a href="/login">Login</a>
            </Button>
            <Button size="sm" asChild>
              <a href="/register">Get Started</a>
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden flex gap-1 pb-3 overflow-x-auto">
          {navItems.map((item) => (
            <Button
              key={item.id}
              variant={activeSection === item.id ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onNavigate(item.id)}
              className="whitespace-nowrap"
            >
              {item.label}
            </Button>
          ))}
        </div>
      </div>
    </nav>
  );
}
