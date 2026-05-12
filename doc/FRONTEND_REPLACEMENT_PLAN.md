# Mazaj+ Frontend Replacement Plan

This document outlines the strategy for replacing the current frontend UI with a new, stabilized version.

## Page implementation Status

| Page / Route | Status | Backend APIs | Action | Priority |
|---|---|---|---|---|
| Landing Page (`/`) | **REAL** | `tips/daily/` | Keep/Refine | Low |
| Login (`/login`) | **REAL** | `auth/login/` | Keep | High |
| Register (`/register`) | **REAL** | `auth/register/` | Keep | High |
| Onboarding (`/onboarding`) | **REAL** | `onboarding/` | Keep | High |
| Dashboard (`/dashboard`) | **PARTIAL** | `auth/me/`, `tips/daily/`, `hydration/target/` | Refine (Mocks) | High |
| Chat (`/dashboard/chat`) | **REAL** | `chat/message/`, `chat/sessions/` | Keep | High |
| User Profile (`/dashboard/profile`) | **REAL** | `profile/me/`, `health-conditions/`, `allergies/` | Keep | High |
| Nutrition Plans (`/dashboard/nutrition-plans`) | **PARTIAL** | `plans/generate/`, `plans/` | Refine | Medium |
| Healthy Alternatives (`/dashboard/alternatives`) | **REAL** | `alternatives/search/` | Keep | Medium |
| Hydration (`/dashboard/tracking`) | **REAL** | `hydration/target/`, `hydration/log/` | Keep | Medium |
| Subscription (`/dashboard/subscription`) | **MOCK** | None | Replace with API | Medium |
| Food Image Analysis (`/dashboard/upload`) | **PLACEHOLDER** | None | Rebuild with API | Low |
| InBody Upload | **MISSING** | None | Add if required | Low |
| Daily Tracking Log | **MOCK** | None | Replace with API | Medium |
| Weekly Reports | **MOCK** | None | Replace with API | Low |
| Admin Dashboard (`/admin`) | **MOCK** | None | Replace with API | Medium |
| Admin Users | **MOCK** | None | Replace with API | Medium |
| Admin Food Data | **MOCK** | None | Replace with API | Medium |
| Admin Subscriptions | **MOCK** | None | Replace with API | Medium |
| Admin Daily Tips | **MOCK** | None | Replace with API | Medium |

---

## Mock Data Audit

### Summary Widgets
- **File**: `src/app/components/dashboard/SummaryWidgets.tsx`
- **Mock Data**: `hydrationProgress`, `bmi`, `goal`, "Include a variety of colorful vegetables..." (static tip fallback).
- **Replacement**: Use `hydration/target/` and `tips/daily/` APIs.
- **Priority**: High

### Food Image Analysis
- **File**: `src/app/components/dashboard/upload/FoodImageAnalysisPage.tsx`
- **Mock Data**: `generateMockAnalysis` function and `hasAccess = false`.
- **Replacement**: Requires a new Vision-based analysis API.
- **Priority**: Low

### Daily Intake Log
- **File**: `src/app/components/dashboard/tracking/DailyIntakeLog.tsx`
- **Mock Data**: Hardcoded food logs for "Today".
- **Replacement**: Requires `GET /api/v1/tracking/daily/`.
- **Priority**: Medium

### Weekly Reports
- **File**: `src/app/components/dashboard/tracking/WeeklyReport.tsx`
- **Mock Data**: Simulated chart data and weight progress.
- **Replacement**: Requires `GET /api/v1/tracking/weekly/`.
- **Priority**: Low

### Admin Portal
- **Files**: `UserManagement.tsx`, `SubscriptionControl.tsx`, `FoodDataManagement.tsx`, `DailyTipsManagement.tsx`.
- **Mock Data**: `mockUsers`, `mockSubscriptions`, `mockFoodItems`, `mockTips`.
- **Replacement**: Requires a full suite of Admin APIs.
- **Priority**: Medium

---

## Recommended Frontend Rebuild Order

### Priority 1 — Core Prototype Stability
1. **Login/Register/Onboarding**: Already real, but ensure latest API contract is used.
2. **Dashboard Shell**: Connect summary widgets to real hydration/tip data.
3. **Chat**: Stabilized and ready.
4. **User Profile**: Stabilized and ready.
5. **Subscription Status**: Replace mock tier display with backend-driven data from `/auth/me/`.

### Priority 2 — Decision Support Features
1. **Nutrition Plans**: Ensure plan generation uses real user attributes (age, weight, goal).
2. **Alternatives/Hydration**: Already real.
3. **Daily Tracking**: Implement a simple backend-driven log for food/water history.

### Priority 3 — Admin & Value-Add
1. **Admin Dashboard**: Implement minimal real stats (total users, active sessions).
2. **Food Database**: Allow admins to view/edit food items via API.
3. **Uploads**: Placeholder for future Vision integration.

---

## Data Strategy Note

> [!IMPORTANT]
> Current nutrition data in the backend is **DEMO SEED DATA** for prototype testing only. It is not a clinical or final dataset. The final curated dataset will be provided by the project team.
> 
> Future data replacement should follow a controlled import flow (CSV/JSON) rather than hardcoding values into the code.

## Critical Issues Found

- **Subscription Management**: There is no dedicated `Subscription` model endpoint; tier status is currently an attribute of the `UserProfile`. This limits the ability to track expiry or history.
- **Admin Privacy**: Ensure Admin APIs strictly filter out private user health data (Conditions/Allergies) as per Mazaj+ privacy rules.
