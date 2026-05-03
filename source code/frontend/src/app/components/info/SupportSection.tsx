import { HelpCircle, CreditCard, Lock, MessageCircle } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';

const supportCards = [
  {
    icon: HelpCircle,
    title: 'Quick Help',
    description: 'Browse our FAQ section for answers to common questions',
    action: 'View FAQ',
    href: '#faq',
  },
  {
    icon: CreditCard,
    title: 'Subscription Help',
    description: 'Manage your plan, billing, and subscription settings',
    action: 'Manage Subscription',
    href: '/dashboard/subscription',
  },
  {
    icon: Lock,
    title: 'Feature Access Help',
    description: 'Learn about tier features and how to unlock additional capabilities',
    action: 'View Pricing',
    href: '/dashboard/subscription',
  },
  {
    icon: MessageCircle,
    title: 'Contact Support',
    description: 'Send us a message and we will get back to you soon',
    action: 'Contact Us',
    href: '#contact',
  },
];

export function SupportSection() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="mb-3">Support & Help</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Find answers, manage your account, or get in touch with our team
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {supportCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Card key={index} className="p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h4 className="mb-2">{card.title}</h4>
                  <p className="text-sm text-muted-foreground">{card.description}</p>
                </div>
              </div>
              <Button variant="outline" className="w-full" asChild>
                <a href={card.href}>{card.action}</a>
              </Button>
            </Card>
          );
        })}
      </div>

      <div className="bg-muted/30 rounded-lg p-6 border border-border">
        <h3 className="mb-3">Getting Help with Features</h3>
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>
            <strong className="text-foreground">Feature Unavailable:</strong> If a feature shows
            as locked, it may be part of a higher tier. Check your subscription level and upgrade
            options in your account settings.
          </p>
          <p>
            <strong className="text-foreground">Account Questions:</strong> For issues with login,
            password reset, or account settings, use the contact form below or check your account
            dashboard.
          </p>
          <p>
            <strong className="text-foreground">Technical Issues:</strong> If you encounter bugs
            or technical problems, please contact us with details about what you were trying to do
            and any error messages you received.
          </p>
        </div>
      </div>
    </div>
  );
}
