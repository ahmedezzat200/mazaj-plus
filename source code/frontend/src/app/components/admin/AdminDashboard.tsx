import { AdminBanner } from './AdminBanner';
import { AdminKPICards } from './AdminKPICards';
import { AdminOverview } from './AdminOverview';
import { SystemActivityFeed } from './SystemActivityFeed';
import { QuickActionCards } from './QuickActionCards';
import { UserDistribution } from './UserDistribution';
import { SubscriptionOverview } from './SubscriptionOverview';
import { Shield } from 'lucide-react';
import { Card } from '../ui/card';

export function AdminDashboard() {
  return (
    <div className="min-h-full">
      <div className="max-w-7xl mx-auto px-6 pt-6">
        <AdminBanner message="Admin Notice: This portal is for operational management only. Sensitive user health data, private chat content, nutrition plans, and personal health information are not accessible from this interface." />
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-8">
        <AdminOverview />
        <AdminKPICards />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2"><SystemActivityFeed /></div>
          <div className="lg:col-span-1"><UserDistribution /></div>
        </div>

        <QuickActionCards />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SubscriptionOverview />
          <Card className="p-6">
            <div className="mb-4">
              <h3>Upload Review Summary</h3>
              <p className="text-sm text-muted-foreground mt-1">Upload contents and InBody details are restricted for privacy.</p>
            </div>
            <div className="text-center py-10 border border-dashed border-border rounded-lg">
              <Shield className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
              <p className="text-sm font-medium mb-1">No Private Upload Data Shown</p>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">Admin users can manage public platform data only.</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
