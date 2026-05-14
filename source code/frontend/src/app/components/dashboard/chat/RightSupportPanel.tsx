import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { UserData } from '../DashboardLayout';
import { ShieldCheck, Crown, Info } from 'lucide-react';
import { Link } from 'react-router';
import { FoodImageUploadPanel } from './FoodImageUploadPanel';
import { InBodyUploadPanel } from './InBodyUploadPanel';
import { NutritionPlanActionCard } from './NutritionPlanActionCard';

interface RightSupportPanelProps {
  userData: UserData;
  featureFlags: {
    food_image_upload: boolean;
    inbody_upload: boolean;
  };
  onRequestPlan: (message: string) => void;
  isChatLoading: boolean;
}

export function RightSupportPanel({
  userData,
  featureFlags,
  onRequestPlan,
  isChatLoading,
}: RightSupportPanelProps) {
  return (
  <aside className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-border bg-card overflow-y-auto">
      <div className="p-6 space-y-5">

        {/* ── Nutrition Plan Action ──────────────────────────── */}
        <NutritionPlanActionCard
          onRequestPlan={onRequestPlan}
          isLoading={isChatLoading}
        />

        {/* ── Food Image Upload Panel ────────────────────────── */}
        <div className="border-t border-border pt-5">
          <FoodImageUploadPanel hasAccess={featureFlags.food_image_upload} />
        </div>

        {/* ── InBody Upload Panel ────────────────────────────── */}
        <div className="border-t border-border pt-5">
          <InBodyUploadPanel hasAccess={featureFlags.inbody_upload} />
        </div>

        {/* ── How It Works ──────────────────────────────────── */}
        <div className="border-t border-border pt-5">
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
                  "Recommendations are generated using your stored profile and backend safety rules. All suggestions are validated privately on the server before reaching you."
                </p>
              </div>
              <div className="space-y-2.5">
                <div className="flex justify-between text-xs items-center">
                  <span className="text-muted-foreground">Safety Checks</span>
                  <Badge
                    variant="secondary"
                    className="bg-green-500/10 text-green-500 border-green-500/20 text-[10px]"
                  >
                    Active
                  </Badge>
                </div>
                <div className="flex justify-between text-xs items-center">
                  <span className="text-muted-foreground">Profile rules</span>
                  <span className="text-foreground font-medium text-[10px]">Handled securely</span>
                </div>
                <div className="flex justify-between text-xs items-center">
                  <span className="text-muted-foreground">Recommendations</span>
                  <span className="text-foreground font-medium text-[10px]">Backend-controlled</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── Tier Status ───────────────────────────────────── */}
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
                    <span>Safety-validated chat guidance</span>
                  </div>
                  <div className="flex items-start gap-2 text-muted-foreground">
                    <div className="w-1 h-1 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                    <span>Nutrition plan access via chat</span>
                  </div>
                  <Link
                    to="/dashboard/subscription"
                    className="block mt-2 text-primary hover:underline font-medium"
                  >
                    Upgrade for full access →
                  </Link>
                </>
              )}
              {userData.tier === 'Pro' && (
                <>
                  <div className="flex items-start gap-2 text-muted-foreground">
                    <div className="w-1 h-1 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                    <span>Food image upload available</span>
                  </div>
                  <div className="flex items-start gap-2 text-muted-foreground">
                    <div className="w-1 h-1 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                    <span>InBody upload available</span>
                  </div>
                </>
              )}
              {userData.tier === 'Ultra' && (
                <>
                  <div className="flex items-start gap-2 text-muted-foreground">
                    <div className="w-1 h-1 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                    <span>Full feature access</span>
                  </div>
                  <div className="flex items-start gap-2 text-muted-foreground">
                    <div className="w-1 h-1 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                    <span>Priority support</span>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* ── Advisory ──────────────────────────────────────── */}
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
              Advisory decision-support only — not a substitute for medical advice. Consult a qualified healthcare professional before making dietary changes.
            </p>
          </CardContent>
        </Card>

      </div>
    </aside>
  );
}
