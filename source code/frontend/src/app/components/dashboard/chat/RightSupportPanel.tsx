import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { UserData } from '../DashboardLayout';
import { ShieldCheck, Crown, Info } from 'lucide-react';
import { Link } from 'react-router';

interface RightSupportPanelProps {
  userData: UserData;
}

export function RightSupportPanel({ userData }: RightSupportPanelProps) {
  return (
    <aside className="hidden lg:block w-80 border-l border-border bg-card overflow-y-auto">
      <div className="p-6 space-y-4">
        {/* How It Works / Safety Notice */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <CardTitle className="text-sm">How It Works</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted/30 rounded-lg p-3 border border-border/50">
              <p className="text-xs text-foreground leading-relaxed italic">
                "Recommendations are generated using your stored health profile and safety rules. All suggestions are validated against your allergies and conditions privately on the server."
              </p>
            </div>
            
            <div className="space-y-2.5">
              <div className="flex justify-between text-xs items-center">
                <span className="text-muted-foreground">Safety Filtering</span>
                <Badge variant="secondary" className="bg-green-500/10 text-green-500 border-green-500/20 text-[10px]">
                  Active
                </Badge>
              </div>
              <div className="flex justify-between text-xs items-center">
                <span className="text-muted-foreground">Allergen Rules</span>
                <span className="text-foreground font-medium text-[10px]">Applied</span>
              </div>
              <div className="flex justify-between text-xs items-center">
                <span className="text-muted-foreground">Condition Logic</span>
                <span className="text-foreground font-medium text-[10px]">Applied</span>
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
              {userData.tier} Plan
            </Badge>
            
            <div className="space-y-2 text-xs">
              {userData.tier === 'Free' && (
                <>
                  <div className="flex items-start gap-2 text-muted-foreground">
                    <div className="w-1 h-1 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                    <span>Basic safety-validated chat guidance</span>
                  </div>
                  <div className="flex items-start gap-2 text-muted-foreground">
                    <div className="w-1 h-1 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                    <span>View most recent nutrition plan</span>
                  </div>
                  <Link to="/dashboard/subscription" className="block mt-2 text-primary hover:underline font-medium">
                    Upgrade for unlimited history →
                  </Link>
                </>
              )}

              {userData.tier === 'Pro' && (
                <>
                  <div className="flex items-start gap-2 text-muted-foreground">
                    <div className="w-1 h-1 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                    <span>Unlimited chat messages enabled</span>
                  </div>
                  <div className="flex items-start gap-2 text-muted-foreground">
                    <div className="w-1 h-1 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                    <span>Full food image analysis access</span>
                  </div>
                </>
              )}

              {userData.tier === 'Ultra' && (
                <>
                  <div className="flex items-start gap-2 text-muted-foreground">
                    <div className="w-1 h-1 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                    <span>Full unlimited feature access</span>
                  </div>
                  <div className="flex items-start gap-2 text-muted-foreground">
                    <div className="w-1 h-1 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                    <span>Weekly progress reports enabled</span>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Advisory Card */}
        <Card className="bg-orange-500/5 border-orange-500/10">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Info className="h-3 w-3 text-orange-600/80" />
              <CardTitle className="text-[10px] text-orange-600/80 uppercase font-bold tracking-wider">
                Medical Disclaimer
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-[11px] text-foreground/70 leading-relaxed">
              Advisory only — not medical advice. Always consult a healthcare professional before making major dietary changes or interpreting nutrition data.
            </p>
          </CardContent>
        </Card>
      </div>
    </aside>
  );
}
