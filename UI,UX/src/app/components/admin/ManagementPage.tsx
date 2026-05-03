import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { AdminManagementBanner } from './AdminManagementBanner';
import { ManagementStats } from './ManagementStats';
import { UserManagement } from './UserManagement';
import { FoodDataManagement } from './FoodDataManagement';
import { AddFoodItemModal } from './AddFoodItemModal';

export function ManagementPage() {
  const [isAddFoodModalOpen, setIsAddFoodModalOpen] = useState(false);

  return (
    <div className="min-h-full">
      {/* Top Action Bar */}
      <div className="bg-background border-b border-border sticky top-[73px] z-20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h2>User & Food Data Management</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Operational data management interface
            </p>
          </div>
          <Button onClick={() => setIsAddFoodModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Food Item
          </Button>
        </div>
      </div>

      {/* Admin Boundary Banner */}
      <div className="max-w-7xl mx-auto px-6 pt-6">
        <AdminManagementBanner />
      </div>

      {/* Management Stats */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <ManagementStats />
      </div>

      {/* Main Management Sections */}
      <div className="max-w-7xl mx-auto px-6 pb-6">
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="food">Food Data Management</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-4">
            <UserManagement />
          </TabsContent>

          <TabsContent value="food" className="space-y-4">
            <FoodDataManagement />
          </TabsContent>
        </Tabs>
      </div>

      {/* Add Food Item Modal */}
      <AddFoodItemModal
        isOpen={isAddFoodModalOpen}
        onClose={() => setIsAddFoodModalOpen(false)}
      />
    </div>
  );
}
