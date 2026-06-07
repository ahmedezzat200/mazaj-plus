import { createBrowserRouter, Navigate } from "react-router";
import { LandingPage } from "./components/LandingPage";
import { Login } from "./components/Login";
import { Registration } from "./components/Registration";
import { OnboardingFlow } from "./components/onboarding/OnboardingFlow";
import { DashboardLayout } from "./components/dashboard/DashboardLayout";
import { Dashboard } from "./components/dashboard/Dashboard";
import { ChatPage } from "./components/dashboard/chat/ChatPage";
import { NutritionPlansPage } from "./components/dashboard/nutrition-plans/NutritionPlansPage";
import { AlternativesPage } from "./components/dashboard/alternatives/AlternativesPage";
import { FoodImageAnalysisPage } from "./components/dashboard/FoodImageAnalysisPage";
import { TrackingPage } from "./components/dashboard/TrackingPage";
import { SubscriptionPage } from "./components/dashboard/subscription/SubscriptionPage";
import { InfoPage } from "./components/info/InfoPage";
import { AdminLayout } from "./components/admin/AdminLayout";
import { AdminDashboard } from "./components/admin/AdminDashboard";
import { ManagementPage } from "./components/admin/ManagementPage";
import { TipsSubscriptionPage } from "./components/admin/TipsSubscriptionPage";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { ProfilePage } from "./components/dashboard/profile/ProfilePage";
import { NotFoundPage } from "./components/NotFoundPage";
import { ComingSoonCard } from "./components/admin/ComingSoonCard";
import { AlternativesManagement } from "./components/admin/AlternativesManagement";
import { SystemActivityFeed } from "./components/admin/SystemActivityFeed";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />,
  },
  {
    path: "/info",
    element: <InfoPage />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Registration />,
  },
  {
    element: <ProtectedRoute blockOnboarded={true} />,
    children: [
      {
        path: "/onboarding",
        element: <OnboardingFlow />,
      },
    ]
  },
  {
    path: "/dashboard",
    element: <ProtectedRoute requireOnboarded={true} />,
    children: [
      {
        path: "",
        element: <DashboardLayout />,
        children: [
          {
            index: true,
            element: <Dashboard />,
          },
          {
            path: "chat",
            element: <ChatPage />,
          },
          {
            path: "nutrition-plans",
            element: <NutritionPlansPage />,
          },
          {
            path: "plans",
            element: <NutritionPlansPage />,
          },
          {
            path: "plan-chat",
            element: <Navigate to="/dashboard/plans" replace />,
          },
          {
            path: "alternatives",
            element: <AlternativesPage />,
          },
          {
            path: "upload",
            element: <FoodImageAnalysisPage />,
          },
          {
            path: "tracking",
            element: <TrackingPage />,
          },
          {
            path: "profile",
            element: <ProfilePage />,
          },
          {
            path: "subscription",
            element: <SubscriptionPage />,
          },
        ]
      }
    ],
  },
  {
    path: "/admin",
    element: <ProtectedRoute requireAdmin={true} />,
    children: [
      {
        path: "",
        element: <AdminLayout />,
        children: [
          {
            index: true,
            element: <AdminDashboard />,
          },
          {
            path: "users",
            element: <ManagementPage />,
          },
          {
            path: "food-data",
            element: <ManagementPage />,
          },
          {
            path: "alternatives",
            element: <AlternativesManagement />,
          },
          {
            path: "daily-tips",
            element: <TipsSubscriptionPage />,
          },
          {
            path: "subscriptions",
            element: <TipsSubscriptionPage />,
          },
          {
            path: "activity",
            element: <div className="p-6"><SystemActivityFeed /></div>,
          },
          {
            path: "uploads",
            element: <ComingSoonCard title="Private Uploads" description="Per Mazaj+ privacy policy, user-uploaded files (food images, InBody reports) are never shown in the admin interface. This restriction is enforced server-side." />,
          },
        ]
      }
    ],
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);