import { createBrowserRouter } from "react-router";
import { LandingPage } from "./components/LandingPage";
import { Login } from "./components/Login";
import { Registration } from "./components/Registration";
import { OnboardingFlow } from "./components/onboarding/OnboardingFlow";
import { DashboardLayout } from "./components/dashboard/DashboardLayout";
import { Dashboard } from "./components/dashboard/Dashboard";
import { ChatPage } from "./components/dashboard/chat/ChatPage";
import { PlanChatPage } from "./components/dashboard/plan/PlanChatPage";
import { NutritionPlansPage } from "./components/dashboard/nutrition-plans/NutritionPlansPage";
import { AlternativesPage } from "./components/dashboard/alternatives/AlternativesPage";
import { FoodImageAnalysisPage } from "./components/dashboard/upload/FoodImageAnalysisPage";
import { TrackingPage } from "./components/dashboard/tracking/TrackingPage";
import { SubscriptionPage } from "./components/dashboard/subscription/SubscriptionPage";
import { InfoPage } from "./components/info/InfoPage";
import { AdminLayout } from "./components/admin/AdminLayout";
import { AdminDashboard } from "./components/admin/AdminDashboard";
import { ManagementPage } from "./components/admin/ManagementPage";
import { TipsSubscriptionPage } from "./components/admin/TipsSubscriptionPage";

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
    path: "/onboarding",
    element: <OnboardingFlow />,
  },
  {
    path: "/dashboard",
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
        path: "plan-chat",
        element: <PlanChatPage />,
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
        element: <div className="p-6">Profile (Coming Soon)</div>,
      },
      {
        path: "subscription",
        element: <SubscriptionPage />,
      },
    ],
  },
  {
    path: "/admin",
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
        element: <div className="p-6">Healthy Alternatives Management (Coming Soon)</div>,
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
        element: <div className="p-6">Activity Monitoring (Coming Soon)</div>,
      },
      {
        path: "uploads",
        element: <div className="p-6">Upload Review (Coming Soon)</div>,
      },
    ],
  },
]);