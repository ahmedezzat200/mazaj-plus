import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Lock, MessageSquare, UtensilsCrossed, Droplet, Upload, BookOpen, FileText } from 'lucide-react';
import { type ReactNode } from 'react';
import { UserTier } from './DashboardLayout';
import { Link } from 'react-router';

interface QuickAccessCard {
  title: string;
  description: string;
  icon: ReactNode;
  path: string;
  locked?: {
    Free: boolean;
    Pro: boolean;
    Ultra: boolean;
  };
  buttonText: string;
  iconBg: string;
  iconColor: string;
}

const quickAccessCards: QuickAccessCard[] = [
  {
    title: 'Chat Guidance',
    description: 'Get personalized nutrition advice through our conversational AI assistant.',
    icon: <MessageSquare className="h-6 w-6" />,
    path: '/dashboard/chat',
    buttonText: 'Start Chat',
    iconBg: 'bg-primary/10',
    iconColor: 'text-primary',
  },
  {
    title: 'Nutrition Plans',
    description: 'View and manage your customized meal plans and dietary recommendations.',
    icon: <UtensilsCrossed className="h-6 w-6" />,
    path: '/dashboard/nutrition-plans',
    buttonText: 'View Plans',
    iconBg: 'bg-green-500/10',
    iconColor: 'text-green-600',
  },
  {
    title: 'Healthy Alternatives & Hydration',
    description: 'Discover healthier food swaps and track your daily water intake.',
    icon: <Droplet className="h-6 w-6" />,
    path: '/dashboard/alternatives',
    buttonText: 'Explore',
    iconBg: 'bg-blue-500/10',
    iconColor: 'text-blue-500',
  },
  {
    title: 'Upload Food Image / InBody',
    description: 'Upload food photos or InBody scans for detailed nutritional analysis.',
    icon: <Upload className="h-6 w-6" />,
    path: '/dashboard/upload',
    locked: { Free: true, Pro: false, Ultra: false },
    buttonText: 'Upload',
    iconBg: 'bg-purple-500/10',
    iconColor: 'text-purple-500',
  },
  {
    title: 'Track Daily Intake',
    description: 'Log your meals and beverages to monitor nutritional patterns.',
    icon: <BookOpen className="h-6 w-6" />,
    path: '/dashboard/tracking',
    locked: { Free: true, Pro: true, Ultra: false },
    buttonText: 'Log Entry',
    iconBg: 'bg-orange-500/10',
    iconColor: 'text-orange-500',
  },
  {
    title: 'View Weekly Reports',
    description: 'Access reports analyzing your weekly nutrition trends.',
    icon: <FileText className="h-6 w-6" />,
    path: '/dashboard/tracking',
    locked: { Free: true, Pro: true, Ultra: false },
    buttonText: 'View Reports',
    iconBg: 'bg-rose-500/10',
    iconColor: 'text-rose-500',
  },
];

interface QuickAccessCardsProps {
  userTier: UserTier;
}

export function QuickAccessCards({ userTier }: QuickAccessCardsProps) {
  const isLocked = (card: QuickAccessCard) => {
    return card.locked ? card.locked[userTier] : false;
  };

  const getRequiredTier = (card: QuickAccessCard) => {
    if (!card.locked) return null;
    if (!card.locked.Pro) return 'Pro';
    if (!card.locked.Ultra) return 'Ultra';
    return null;
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
      <h3 className="text-lg font-semibold text-foreground mb-4">Quick Access</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quickAccessCards.map((card) => {
          const locked = isLocked(card);
          const requiredTier = getRequiredTier(card);

          return (
            <Card
              key={`${card.path}-${card.title}`}
              className={`
                group hover:shadow-md hover:-translate-y-1 transition-all duration-200
                ${locked ? 'relative overflow-hidden opacity-80' : ''}
              `}
            >
              {locked && (
                <div className="absolute inset-0 bg-gradient-to-b from-background/60 to-background/85 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center p-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                    <Lock className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium text-foreground mb-1">
                    {requiredTier} Plan Required
                  </p>
                  <p className="text-xs text-muted-foreground mb-4">
                    Upgrade to access this feature
                  </p>
                  <Button asChild size="sm" variant="outline">
                    <Link to="/dashboard/subscription">
                      Upgrade to {requiredTier}
                    </Link>
                  </Button>
                </div>
              )}

              <CardHeader>
                <div className={`w-12 h-12 rounded-xl ${card.iconBg} ${card.iconColor} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-200`}>
                  {card.icon}
                </div>
                <CardTitle className="text-base">{card.title}</CardTitle>
                <CardDescription>{card.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  asChild={!locked}
                  disabled={locked}
                  className="w-full transition-all duration-200"
                  variant={locked ? 'outline' : 'default'}
                >
                  {locked ? (
                    <span>{card.buttonText}</span>
                  ) : (
                    <Link to={card.path}>{card.buttonText}</Link>
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
