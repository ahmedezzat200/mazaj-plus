import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { AdminBanner } from './AdminBanner';
import { DailyTipsManagement } from './DailyTipsManagement';
import { SubscriptionControl } from './SubscriptionControl';
import { AddTipModal } from './AddTipModal';

export function TipsSubscriptionPage() {
  const [isAddTipModalOpen, setIsAddTipModalOpen] = useState(false);
  const [tipsRefreshKey, setTipsRefreshKey] = useState(0);

  return (
    <div className="min-h-full">
      <div className="bg-background border-b border-border sticky top-[73px] z-20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h2>Tips & Subscription Control</h2>
            <p className="text-sm text-muted-foreground mt-1">Manage daily tip content and subscription access</p>
          </div>
          <Button onClick={() => setIsAddTipModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />Add Tip
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-6">
        <AdminBanner message="Operational Management Area: This interface is for managing daily tips and subscription access only. Do not access private chat content, nutrition plans, or health information." />
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 pb-6">
        <Tabs defaultValue="tips" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="tips">Daily Tips Management</TabsTrigger>
            <TabsTrigger value="subscriptions">Subscription Control</TabsTrigger>
          </TabsList>
          <TabsContent value="tips" className="space-y-4">
            <DailyTipsManagement onAddTip={() => setIsAddTipModalOpen(true)} refreshKey={tipsRefreshKey} />
          </TabsContent>
          <TabsContent value="subscriptions" className="space-y-4">
            <SubscriptionControl />
          </TabsContent>
        </Tabs>
      </div>

      <AddTipModal
        isOpen={isAddTipModalOpen}
        onClose={() => setIsAddTipModalOpen(false)}
        onAdded={() => setTipsRefreshKey(k => k + 1)}
      />
    </div>
  );
}
