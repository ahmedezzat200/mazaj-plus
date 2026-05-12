# Mazaj+ Frontend V2 Integration Audit

## 1. Executive Summary
The new frontend located in `source code/frontend-v2-integration` is a high-fidelity visual template built with modern web technologies. While it provides a significantly improved UI/UX and a comprehensive set of components (including a full Admin portal), it is currently a "visual shell" heavily dependent on mock data and external API calls. Integrating it into the current Mazaj+ project requires a staged approach to preserve established backend logic while adopting the new design.

## 2. New Frontend Structure Summary
- **Root**: Standard Vite project structure with `package.json`, `vite.config.ts`, and `tailwind.config`.
- **Source (`src/app`)**:
    - `components/`: Organized by feature area (admin, dashboard, onboarding, ui).
    - `context/`: Contains a mocked `AuthContext`.
    - `routes.tsx`: Defines a comprehensive route map similar to the current production frontend.
- **UI System**: Uses a full set of `shadcn/ui` components located in `src/app/components/ui`.

## 3. New Frontend Stack
- **Framework**: React 18
- **Build Tool**: Vite 6
- **Routing**: React Router 7
- **Styling**: Tailwind CSS v4 (using the Vite plugin)
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **Charts**: Recharts
- **Components**: Radix UI + shadcn/ui

## 4. Build Status
- **Installation**: `npm install` completed successfully.
- **Production Build**: `npm run build` completed successfully.
- **Bundle Size**: ~1.2MB JS (uncompressed), ~123KB CSS.

## 5. Pages and Routes Found
- `/`: Landing Page
- `/login`: Login
- `/register`: Registration
- `/onboarding`: Multi-step Onboarding
- `/dashboard`: Main User Dashboard
    - `/dashboard/chat`: AI Chat Guidance
    - `/dashboard/nutrition-plans`: Plan Management
    - `/dashboard/plan-chat`: Plan Generation Workflow
    - `/dashboard/alternatives`: Healthy Alternatives & Hydration
    - `/dashboard/upload`: Food Image & InBody Analysis
    - `/dashboard/tracking`: Daily Logs & Reports
    - `/dashboard/profile`: User Profile
    - `/dashboard/subscription`: Tier Management
- `/admin`: Admin Portal
    - `/admin/users`: User Management
    - `/admin/food-data`: Food Database Management
    - `/admin/daily-tips`: Content Management
    - `/admin/subscriptions`: Subscription Analytics

## 6. Mock/Fake Data Findings
> [!WARNING]
> The new UI contains several "fake" behaviors that must be replaced to comply with Mazaj+ safety rules.

| Finding | File | Impact | Risk |
| :--- | :--- | :--- | :--- |
| **Direct External AI Call** | `ChatPage.tsx` | Calls Anthropic API directly from frontend. | **HIGH** |
| **Fake Auth** | `AuthContext.tsx` | Uses `DEMO_USERS` and `registeredUsers` local variable. | **HIGH** |
| **Fake Nutrition** | `FoodImageAnalysisPage.tsx` | Uses `generateMockAnalysis` and `Math.random`. | **HIGH** |
| **Mock Stats** | `SummaryWidgets.tsx` | Hardcoded hydration and BMI values. | Medium |
| **Mock Admin Data** | `UserManagement.tsx` | Hardcoded `mockUsers` list. | Medium |
| **Simulated Logic** | `OnboardingFlow.tsx` | Local state only, no backend persistence. | Medium |

## 7. Privacy and Security Findings
- **Data Leakage Risk**: `ChatPage.tsx` sends the full user profile (Age, Gender, Goal, Allergies, Conditions) to an external AI service. This violates the project's "Privacy by Design" principle.
- **Sensitive Data in Code**: Demo users and passwords are hardcoded in `AuthContext.tsx`.
- **Console Usage**: Several components use `console.log` for debugging state changes, which should be removed for production.

## 8. API Mapping Table

| Page | Backend API | Current UI Status | Action |
| :--- | :--- | :--- | :--- |
| Login / Register | `auth/login/`, `auth/register/` | Mock | Replace with `api.ts` calls |
| Onboarding | `onboarding/` | Mock | Connect to existing POST |
| Dashboard | `auth/me/`, `tips/daily/` | Mock | Connect to real context |
| Chat | `chat/message/`, `chat/sessions/` | **External Call** | **REPLACE with `chatApi`** |
| Profile | `profile/me/` | Mock | Use `profileApi` |
| Subscription | `subscription/me/` | Mock | Use `subscriptionApi` |
| Admin Stats | `admin/dashboard/` | Missing | Use placeholder till Phase 5 |

## 9. Current Frontend Logic to Preserve
- `src/lib/api.ts`: All backend communication functions.
- `src/app/context/AuthContext.tsx`: The real Django session-based auth logic.
- `ProtectedRoute.tsx`: Stability-tested route guards.
- Error handling patterns and API response types.

## 10. Current Frontend Parts to Replace
- All visual components in `src/app/components/*`.
- Old `index.css` and styling tokens (replaced by Tailwind 4).
- Mock dashboard widgets.

## 11. Recommended Integration Strategy
**Strategy C — Hybrid Migration**
The safest path is to preserve the existing, stable backend integration layer (AuthContext, api.ts, guards) and migrate the new UI visuals page-by-page. This ensures that the functional stability of Mazaj+ (Login, Subscriptions, Safety) is never compromised by the new visual layer.

## 12. First Implementation Phase Plan (Phase UI-1)
1. **Foundation**: Create a new integration branch. Copy the new `shadcn/ui` folder and Tailwind 4 configuration into the main frontend.
2. **Core Context**: Port the existing real `AuthContext.tsx` and `api.ts` into the new structure, overwriting the mocks.
3. **Authentication**: Migrate `LandingPage`, `Login`, and `Registration` visuals first.
4. **Verification**: Run `npm run build` and verify that a user can still login/register using real Django credentials through the new UI.

## 13. What Not to Migrate Yet
- **AI Chat Logic**: The `ChatPage.tsx` in V2 is unsafe. It must be refactored to use the Mazaj+ backend chat agent before deployment.
- **Upload Features**: V2 still contains fake analysis. The placeholder logic from Phase 4C must be applied to the new UI.
- **Admin Portal**: Keep as a visual-only placeholder until the real Admin APIs are ready in Phase 5.
- **Tracking Charts**: Recharts components are included but should not be connected to real data until the database tracking layer is implemented.

## 14. Risks and Blockers
- **Tailwind Version Conflict**: Current frontend uses Tailwind 3, new UI uses Tailwind 4. This requires a full replacement of the CSS layer.
- **External AI dependency**: The V2 chat implementation is a blocker for security reasons and must be stripped out immediately.

## 15. Final Recommendation
Proceed with **Phase UI-1** immediately. The new UI is superior in terms of professionalism and academic presentation, but it must be "domesticated" by replacing its unsafe external calls and mocks with our established backend authority logic.
