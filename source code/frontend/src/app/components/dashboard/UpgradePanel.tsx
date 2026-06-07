import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Sparkles, ArrowRight } from 'lucide-react';
import { UserTier } from './DashboardLayout';
import { Link } from 'react-router';

interface UpgradePanelProps {
  currentTier: UserTier;
}

export function UpgradePanel({ currentTier }: UpgradePanelProps) {
  const getUpgradeMessage = () => {
    if (currentTier === 'Free') {
      return {
        title: 'Unlock More Features with Pro or Ultra',
        description: 'Get access to upload features, daily logging, weekly reports, and more personalized insights.',
        cta: 'Compare Plans',
      };
    }
    return {
      title: 'Upgrade to Ultra for Complete Access',
      description: 'Unlock daily logging, comprehensive weekly reports, and advanced tracking features.',
      cta: 'See Ultra Benefits',
    };
  };

  const message = getUpgradeMessage();

  return (
    <Card className="bg-gradient-to-br from-accent/10 via-secondary/5 to-primary/5 border-accent/20 hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-6 md:p-8">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
            <Sparkles className="h-6 w-6 text-accent" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-foreground mb-1">
              {message.title}
            </h3>
            <p className="text-sm text-muted-foreground">
              {message.description}
            </p>
          </div>
          <Button asChild size="lg" className="flex-shrink-0">
            <Link to="/dashboard/subscription">
              {message.cta}
              <ArrowRight className="h-5 w-5 ml-2" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
