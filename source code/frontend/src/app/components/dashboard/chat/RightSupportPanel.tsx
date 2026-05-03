import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { UserData } from '../DashboardLayout';
import { User, ShieldCheck, Crown } from 'lucide-react';

interface RightSupportPanelProps {
  userData: UserData;
}

export function RightSupportPanel({ userData }: RightSupportPanelProps) {
  // Mock profile data
  const profileData = {
    age: 28,
    gender: 'Female',
    goal: 'Balanced nutrition',
    allergies: ['Shellfish'],
    conditions: ['None'],
  };

  return (
    <aside className="hidden lg:block w-80 border-l border-border bg-card overflow-y-auto">
      <div className="p-6 space-y-4">
        {/* Profile Summary */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              <CardTitle className="text-sm">Profile Summary</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
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
            </div>
            
            <div className="pt-2 border-t border-border">
              <p className="text-xs text-muted-foreground mb-2">Allergies</p>
              <div className="flex flex-wrap gap-1">
                {profileData.allergies.map((allergy) => (
                  <Badge key={allergy} variant="outline" className="text-xs">
                    {allergy}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transparency Card */}
        <Card className="bg-secondary/5 border-secondary/20">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-secondary" />
              <CardTitle className="text-sm">How It Works</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Recommendations are generated using your stored health profile, dietary preferences, 
              and safety rules. All suggestions are validated against your allergies and health conditions.
            </p>
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
                    <span>5 chat messages per day</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40"></div>
                    <span>Basic recommendations</span>
                  </div>
                </>
              )}
              
              {userData.tier === 'Pro' && (
                <>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                    <span>Unlimited chat messages</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                    <span>Upload features enabled</span>
                  </div>
                </>
              )}
              
              {userData.tier === 'Ultra' && (
                <>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                    <span>Full feature access</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                    <span>Weekly reports & daily logs</span>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </aside>
  );
}
