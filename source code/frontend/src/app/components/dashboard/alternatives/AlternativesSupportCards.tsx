import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Crown, Info } from 'lucide-react';
import { UserData } from '../DashboardLayout';

interface AlternativesSupportCardsProps {
  userData: UserData;
}

export function AlternativesSupportCards({ userData }: AlternativesSupportCardsProps) {
  return (
    <div className="space-y-4">
      {/* Personalized Context Info */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm">Personalized Guidance</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 text-xs text-muted-foreground leading-relaxed">
          <p>
            Suggestions are tailored to your unique profile, goals, and safety requirements stored in the Mazaj+ backend.
          </p>
          <div className="flex items-center gap-1.5 text-primary font-medium">
            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
            <span>Profile-aware searching</span>
          </div>
        </CardContent>
      </Card>

      {/* Tier Status */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Crown className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm">Tier Status</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Badge 
            variant="secondary" 
            className={
              userData.tier === 'Ultra' 
                ? 'bg-primary text-primary-foreground'
                : userData.tier === 'Pro'
                ? 'bg-secondary text-secondary-foreground'
                : 'bg-muted text-muted-foreground'
            }
          >
            {userData.tier}
          </Badge>
          
          <div className="space-y-1.5 text-xs">
            {userData.tier === 'Free' && (
              <>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <span>10 alternative searches per day</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <span>Unlimited hydration tracking</span>
                </div>
              </>
            )}
            
            {(userData.tier === 'Pro' || userData.tier === 'Ultra') && (
              <>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <span>Unlimited alternative searches</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <span>Unlimited hydration tracking</span>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
