import { useState } from 'react';
import { Outlet, useLocation } from 'react-router';
import { useAuth } from '../../../contexts/AuthContext';
import { DashboardSidebar } from './DashboardSidebar';
import { DashboardTopBar } from './DashboardTopBar';
import { DashboardTopBarCustom } from './DashboardTopBarCustom';
import { X, RotateCcw, Droplet } from 'lucide-react';
import { Button } from '../ui/button';

export type UserTier = 'Free' | 'Pro' | 'Ultra';

export interface UserData {
  name: string;
  email: string;
  tier: UserTier;
  avatar?: string;
}

export function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  
  const { user } = useAuth();
  
  let mappedTier: UserTier = 'Free';
  if (user?.tier === 'PRO') mappedTier = 'Pro';
  if (user?.tier === 'ULTRA') mappedTier = 'Ultra';

  const userData: UserData = {
    name: user?.full_name || 'User',
    email: user?.email || '',
    tier: mappedTier,
  };

  // Determine if we need custom top bar
  const isChatPage = location.pathname === '/dashboard/chat';
  const isPlanPage = location.pathname === '/dashboard/plan-chat';
  const isNutritionPlansPage = location.pathname === '/dashboard/nutrition-plans' || location.pathname === '/dashboard/plans';
  const isAlternativesPage = location.pathname === '/dashboard/alternatives';
  const isUploadPage = location.pathname === '/dashboard/upload';
  const isTrackingPage = location.pathname === '/dashboard/tracking';

  const handleNewChat = () => {
    window.location.reload();
  };

  const handleLogWater = () => {
    const hydrationSection = document.getElementById('hydration-tracker');
    if (hydrationSection) {
      hydrationSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleUploadAnother = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 h-screen z-50 lg:z-auto
          transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <X className="h-5 w-5" />
        </Button>
        
        <DashboardSidebar userTier={userData.tier} onNavigate={() => setSidebarOpen(false)} />
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        {isChatPage ? (
          <DashboardTopBarCustom 
            userData={userData} 
            onMenuClick={() => setSidebarOpen(true)}
            title="Mazaj+ Chat"
            subtitle="Ask for mood-based food guidance, alternatives, hydration, or nutrition plans."
            action={
              <Button variant="outline" size="sm" onClick={handleNewChat}>
                <RotateCcw className="h-4 w-4 mr-2" />
                New Chat
              </Button>
            }
          />
        ) : isPlanPage ? (
          <DashboardTopBarCustom 
            userData={userData} 
            onMenuClick={() => setSidebarOpen(true)}
            title="Chat Guidance"
            subtitle="Personalized Nutrition Plan Generation"
            action={
              <Button variant="outline" size="sm" onClick={handleNewChat}>
                <RotateCcw className="h-4 w-4 mr-2" />
                New Plan Request
              </Button>
            }
          />
        ) : isNutritionPlansPage ? (
          <DashboardTopBarCustom 
            userData={userData} 
            onMenuClick={() => setSidebarOpen(true)}
            title="Nutrition Plans"
            subtitle="Review your personalized nutrition guidance"
            action={
              <Button size="sm" asChild>
                <a href="/dashboard/plans">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Generate New Plan
                </a>
              </Button>
            }
          />
        ) : isAlternativesPage ? (
          <DashboardTopBarCustom 
            userData={userData} 
            onMenuClick={() => setSidebarOpen(true)}
            title="Healthy Alternatives & Hydration"
            subtitle="Everyday support for better food and water choices"
            action={
              <Button variant="outline" size="sm" onClick={handleLogWater}>
                <Droplet className="h-4 w-4 mr-2" />
                Log Water
              </Button>
            }
          />
        ) : isUploadPage ? (
          <DashboardTopBarCustom
            userData={userData}
            onMenuClick={() => setSidebarOpen(true)}
            title="Food Image Analysis"
            subtitle="Upload a food image for nutrition estimation"
            action={
              <Button variant="outline" size="sm" onClick={handleUploadAnother}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Upload Another Image
              </Button>
            }
          />
        ) : isTrackingPage ? (
          <DashboardTopBarCustom
            userData={userData}
            onMenuClick={() => setSidebarOpen(true)}
            title="Tracking & Reports"
            subtitle="Tracking and reports are tier-gated and under development"
          />
        ) : (
          <DashboardTopBar userData={userData} onMenuClick={() => setSidebarOpen(true)} />
        )}

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <Outlet context={{ userData }} />
        </main>
      </div>
    </div>
  );
}
