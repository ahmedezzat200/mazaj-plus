import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { UserData } from '../DashboardLayout';
import { User, ShieldCheck, Crown } from 'lucide-react';

interface RightSupportPanelProps {
  userData: UserData;
}

export function RightSupportPanel({ userData }: RightSupportPanelProps) {
  return (
    <aside className="hidden lg:block w-80 border-l border-border bg-card overflow-y-auto">
      <div className="p-6 space-y-4">
        {/* Safety Profile Notice */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <CardTitle className="text-sm">Safety Profile</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted/30 rounded-lg p-3 border border-border/50">
              <p className="text-xs text-foreground leading-relaxed italic">
                "Your saved safety profile is used privately by the backend to filter recommendations. Private health details are not shown here."
              </p>
            </div>
            
            <div className="space-y-2.5">
              <div className="flex justify-between text-xs items-center">
                <span className="text-muted-foreground">Safety filtering</span>
                <Badge variant="secondary" className="bg-green-500/10 text-green-500 border-green-500/20 text-[10px]">
                  Active
                </Badge>
              </div>
              <div className="flex justify-between text-xs items-center">
                <span className="text-muted-foreground">Allergen rules</span>
                <span className="text-foreground font-medium text-[10px]">Applied server-side</span>
              </div>
              <div className="flex justify-between text-xs items-center">
                <span className="text-muted-foreground">Condition logic</span>
                <span className="text-foreground font-medium text-[10px]">Applied server-side</span>
              </div>
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
            
            <div className="space-y-1.5 text-xs text-muted-foreground">
              {userData.tier === 'Free' ? (
                <span>Basic safety access active</span>
              ) : (
                <span>Premium safety rules active</span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Advisory Card */}
        <Card className="bg-orange-500/5 border-orange-500/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] text-orange-600/80 uppercase font-bold tracking-wider">
              Medical Disclaimer
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[11px] text-foreground/70 leading-relaxed">
              Advisory only — not medical advice. Always consult a healthcare professional before making major dietary changes.
            </p>
          </CardContent>
        </Card>
      </div>
    </aside>
  );
}
