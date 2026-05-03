import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { User, Crown } from 'lucide-react';
import { UserData } from '../DashboardLayout';

interface AlternativesSupportCardsProps {
  userData: UserData;
}

export function AlternativesSupportCards({ userData }: AlternativesSupportCardsProps) {
  // Mock profile data
  const profileData = {
    age: 28,
    gender: 'Female',
    goal: 'Balanced nutrition',
  };

  return (
    <div className="space-y-4">
      {/* Profile Context */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm">Profile Context</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Age</span>
            <span className="text-foreground font-medium">{profileData.age}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Gender</span>
            <span className="text-foreground font-medium">{profileData.gender}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Goal</span>
            <Badge variant="secondary" className="text-xs">
              {profileData.goal}
            </Badge>
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
                  <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                  <span>5 alternative searches per day</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                  <span>Unlimited hydration tracking</span>
                </div>
              </>
            )}
            
            {(userData.tier === 'Pro' || userData.tier === 'Ultra') && (
              <>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                  <span>Unlimited alternative searches</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
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
