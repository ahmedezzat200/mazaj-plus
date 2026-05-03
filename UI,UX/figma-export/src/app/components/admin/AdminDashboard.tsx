import { AdminBoundaryBanner } from './AdminBoundaryBanner';
import { AdminKPICards } from './AdminKPICards';
import { AdminOverview } from './AdminOverview';
import { SystemActivityFeed } from './SystemActivityFeed';
import { QuickActionCards } from './QuickActionCards';
import { UserDistribution } from './UserDistribution';
import { SubscriptionOverview } from './SubscriptionOverview';
import { UploadReviewSummary } from './UploadReviewSummary';

export function AdminDashboard() {
  return (
    <div className="min-h-full">
      {/* Admin Boundary Banner */}
      <div className="max-w-7xl mx-auto px-6 pt-6">
        <AdminBoundaryBanner />
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-6 space-y-8">
        {/* Overview Section */}
        <AdminOverview />

        {/* KPI Cards */}
        <AdminKPICards />

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* System Activity - Takes 2 columns */}
          <div className="lg:col-span-2">
            <SystemActivityFeed />
          </div>

          {/* User Distribution - Takes 1 column */}
          <div className="lg:col-span-1">
            <UserDistribution />
          </div>
        </div>

        {/* Quick Action Cards */}
        <QuickActionCards />

        {/* Bottom Row: Subscription & Upload Review */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SubscriptionOverview />
          <UploadReviewSummary />
        </div>
      </div>
    </div>
  );
}
