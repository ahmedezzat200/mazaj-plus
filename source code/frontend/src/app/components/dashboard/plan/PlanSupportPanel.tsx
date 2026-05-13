import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { UserData } from '../DashboardLayout';
import { Info, ShieldCheck } from 'lucide-react';

interface PlanSupportPanelProps {
  userData: UserData;
}

export function PlanSupportPanel({ userData }: PlanSupportPanelProps) {
  return (
    <aside className="hidden lg:block w-80 border-l border-border bg-card overflow-y-auto">
      <div className="p-6 space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <CardTitle className="text-sm">Privacy Protected</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Profile measurements, allergies, and health condition names stay hidden outside the Profile page.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-secondary/5 border-secondary/20">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-secondary" />
              <CardTitle className="text-sm">Plan Source</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {userData.tier} plan generation is handled by backend rules and safety validation only.
            </p>
          </CardContent>
        </Card>
      </div>
    </aside>
  );
}
