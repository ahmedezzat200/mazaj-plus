# Mazaj+ Web Mapping Documentation

## 0. Plain Text Website Map / Sitemap

```text
Home
├── About Mazaj+
├── How It Works
├── Features
│   ├── Chat-Based Food Guidance
│   ├── Mood-Based Food Recommendations
│   ├── Nutrition Plans
│   ├── Healthy Alternatives
│   ├── Hydration Support
│   ├── Food Image Upload
│   ├── InBody Upload
│   ├── Daily Tracking
│   └── Weekly Reports
├── Pricing / Subscription Plans
│   ├── Free Plan
│   ├── Pro Plan
│   └── Ultra Plan
├── User Account
│   ├── Register
│   ├── Login
│   ├── Logout
│   ├── Current User Session
│   ├── Onboarding
│   │   ├── Personal Information
│   │   ├── Body Measurements
│   │   ├── Health Conditions
│   │   ├── Food Allergies
│   │   ├── Nutrition Goal
│   │   └── Confirmation
│   └── Profile
│       ├── View Profile
│       └── Edit Profile
├── User Dashboard
│   ├── Dashboard Home
│   ├── Chat Guidance
│   │   ├── Emotion-Based Recommendation
│   │   ├── Nutrition Plan Request
│   │   └── Clarification Question
│   ├── Nutrition Plans
│   │   ├── Generate Plan
│   │   └── View Saved Plans
│   ├── Healthy Alternatives
│   │   ├── Search Alternative
│   │   └── View Suggested Alternative
│   ├── Hydration
│   │   ├── Daily Water Target
│   │   ├── Water Intake Log
│   │   └── Reminder Support
│   ├── Upload Features
│   │   ├── Food Image Upload
│   │   └── InBody Report Upload
│   ├── Tracking
│   │   └── Daily Consumption Log
│   ├── Reports
│   │   └── Weekly Nutrition Report
│   ├── Subscription
│   │   ├── Current Plan
│   │   ├── Upgrade to Pro
│   │   └── Upgrade to Ultra
│   └── Daily Tips
├── Admin Portal
│   ├── Admin Dashboard
│   ├── Manage Users
│   │   └── Safe User Metadata Only
│   ├── Manage Food Data
│   │   ├── Food Items
│   │   ├── Mood Tags
│   │   └── Healthy Alternatives
│   ├── Manage Daily Tips
│   ├── Manage Subscriptions
│   ├── Upload Activity Metadata
│   └── Activity Logs
└── Contact / Help
```

### Sitemap Notes

1. Visitor pages are public only.
2. User Dashboard pages require authentication and completed onboarding.
3. Pro features require active Pro or Ultra subscription.
4. Ultra features require active Ultra subscription.
5. Admin Portal is separate from the user portal.
6. Admin must not access sensitive user health/private data.
7. Gemini is not a page and must not be represented as a decision-maker.
8. Backend APIs enforce all access rules; frontend navigation is only visual.

## 1. Route Naming Decision
- Public frontend: `/`
- User app: `/app/*`
- React admin portal: `/admin-portal/*`
- Admin APIs: `/api/v1/admin/*`
- Django admin (if enabled): `/django-admin/`

## 2. Route Table

| Route | Page | Module | Access Requirement | Expected Backend APIs | Required States | Notes |
|---|---|---|---|---|---|---|
| `/` | LandingPage | Public | Visitor Only | `/api/v1/auth/*` | Normal | Show tier comparisons |
| `/login` | LoginPage | Auth | Visitor Only | `/api/v1/auth/login/` | Error, Loading, Success | |
| `/register` | RegistrationPage | Auth | Visitor Only | `/api/v1/auth/register/` | Error, Loading, Success | |
| `/onboarding` | OnboardingFlowPage | Onboarding | Auth + Incomplete Onboard | `/api/v1/profile/create/` | Loading, Error, Success | Enforces completion |
| `/app` | DashboardPage | User App | Auth + Onboarded | `/api/v1/users/me/`, `/api/v1/tips/daily/` | Loading, Error | Entry point widget view |
| `/app/chat` | ChatGuidancePage | Guidance | Auth + Onboarded | `/api/v1/chat/message/`, `/api/v1/chat/sessions/` | Loading, Limit Exceeded, No Safe Result, AI Fallback | Usage caps (Free) |
| `/app/plans` | NutritionPlansPage| Plans | Auth + Onboarded | `/api/v1/plans/`, `/api/v1/plans/{id}/` | Loading, Empty, Limit Exceeded | History restricted |
| `/app/alternatives` | AlternativesPage | Mod | Auth + Onboarded | `/api/v1/alternatives/search/` | Empty, Loading, Limit Exceeded | Cap enforced |
| `/app/hydration` | HydrationTrackingPage | Mod | Auth + Onboarded | `/api/v1/hydration/target`, `/api/v1/hydration/log` | Loading, Empty | Hydration support (Calculations/Reminders) |
| `/app/upload` | UploadFeaturesPage| Premium | Auth + Pro Active | `/api/v1/uploads/image/`, `/api/v1/uploads/inbody/` | Loading, Error, Sub Inactive, Upgrade Req | Access gate |
| `/app/tracking` | TrackingPage | Premium | Auth + Ultra Active | `/api/v1/tracking/daily/` | Loading, Empty, Sub Inactive, Upgrade Req | Daily calorie tracker |
| `/app/reports` | ReportsPage | Premium | Auth + Ultra Active | `/api/v1/reports/weekly/` | Loading, Empty, Sub Inactive, Upgrade Req | Aggregated metrics |
| `/app/subscription` | SubscriptionPage | Profile | Auth + Onboarded | `/api/v1/subscriptions/me/`, `/api/v1/subscriptions/activate/` | Loading, Success, Error | Symbolic payment activation |
| `/app/profile` | ProfilePage | Profile | Auth + Onboarded | `/api/v1/profile/me/` | Loading, Success, Error | Editing bio parameters |
| `/admin-portal` | AdminDashboardPage | Admin | Admin Only | `/api/v1/admin/stats/` | Loading, Unauthorized | System data counts |
| `/admin-portal/users` | AdminUsersPage | Admin | Admin Only | `/api/v1/admin/users/` | Loading, Empty, Error | No biometrics/health strings |
| `/admin-portal/food-data`| AdminFoodPage | Admin | Admin Only | `/api/v1/admin/foods/` | Loading, Success | Full dictionary manipulation |
| `/admin-portal/daily-tips`| AdminTipsPage | Admin | Admin Only | `/api/v1/admin/tips/` | Loading, Empty | Tip assignment |
| `/admin-portal/subscriptions`| AdminSubsPage | Admin | Admin Only | `/api/v1/admin/subscriptions/` | Loading, Empty | Upgrades/Tiers checks |
| `/admin-portal/uploads` | AdminUploadsPage | Admin | Admin Only | `/api/v1/admin/uploads/` | Empty | Audit trails |
| `/admin-portal/activity` | AdminActivityPage | Admin | Admin Only | `/api/v1/admin/activity/` | Loading, Empty | Filter operational actions |

## 3. Route Guard Matrix
- **Visitor only:** Render public, bounce app paths to `/login`.
- **Authenticated only:** Validate session.
- **Authenticated + onboarding incomplete:** Bounce `/app/*` requests seamlessly to `/onboarding`.
- **Authenticated + onboarding complete:** Normal portal routing.
- **Free:** Default standard tier state.
- **Pro active:** Unblocks Premium endpoints via API `403` handlers wrapped in UI states.
- **Ultra active:** Unblocks maximum historical/logging routes.
- **Admin only:** Restricts routes behind systemic Boolean flags (`is_admin`).

## 4. Tier Access Matrix
- **Free:** Core chat, alternatives, hydration, tip routing. Usage caps limit endpoint volumes heavily.
- **Pro:** Adds upload arrays and parsing routines.
- **Ultra:** Unlocks rigorous report, tracking tables, and enables broader/full saved history review within the academic prototype scope.
- **Admin:** Separate schema, exclusively administrative endpoint maps.

## 5. Admin Access Matrix
- **Allowed:** System traffic counts, User operational strings, full Food Dataset modification access, tip rotation schedules, upload metadata without image blobs.
- **Forbidden:** Precise user Chat histories, Nutrition Plans, User Heights/Weights, User Health Conditions, and User Allergy lists.

## 6. Required Functional Component Map Requirements
Pages build upon standardized sub-components. Specific UI components required per view includes: Drawer Sidebars, Subscription Prompts (modals), Data Grids (Admin/Reports), and distinct Empty States. Every route is responsible for intercepting the standard network state spectrum (loading, empty, error, success, upgrade required, unauthorized, onboarding required, limit exceeded, subscription inactive, no safe result, AI fallback) before rendering.

## 7. Mock Policy
The `\source code` codebase is completely empty at the start of Phase 2. Subsequent mocking executed in frontend workflows (Phase 7 scaffolding) must strictly follow:
1. Marked clearly as temporary `// TODO: MOCK`.
2. Mock inputs are never treated as business authority or deployed representations of backend power.
3. Completely expunged and substituted during explicit Phase 8 Backend API integration.
4. Mocks must not execute tier boundary checks, security validation, or dietary algorithmic tests natively.
