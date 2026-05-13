import { Users, UtensilsCrossed, Lightbulb, CreditCard, ArrowRight } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';

interface QuickAction {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
}

const quickActions: QuickAction[] = [
  {
    title: 'Manage Users',
    description: 'View and manage user accounts, roles, and access levels',
    icon: <Users className="h-6 w-6" />,
    href: '/admin/users',
  },
  {
    title: 'Manage Food Data',
    description: 'Add, edit, and organize nutrition database entries',
    icon: <UtensilsCrossed className="h-6 w-6" />,
    href: '/admin/food-data',
  },
  {
    title: 'Manage Daily Tips',
    description: 'Create and schedule wellness tips for platform users',
    icon: <Lightbulb className="h-6 w-6" />,
    href: '/admin/daily-tips',
  },
  {
    title: 'Review Subscriptions',
    description: 'Monitor subscription status and tier management',
    icon: <CreditCard className="h-6 w-6" />,
    href: '/admin/subscriptions',
  },
];

export function QuickActionCards() {
  return (
    <div>
      <h3 className="mb-4">Quick Actions</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {quickActions.map((action, index) => (
          <Card key={index} className="p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                {action.icon}
              </div>
              <div className="flex-1">
                <h4 className="mb-1">{action.title}</h4>
                <p className="text-sm text-muted-foreground">{action.description}</p>
              </div>
            </div>
            <Button variant="outline" className="w-full" asChild>
              <a href={action.href}>
                Open
                <ArrowRight className="h-4 w-4 ml-2" />
              </a>
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
