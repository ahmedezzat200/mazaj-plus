# Mazaj+ API Contract

This document defines the backend API contract for the Mazaj+ nutrition decision-support system.

## Status Definitions
- **READY**: Fully implemented and tested.
- **PARTIAL**: Basic logic exists but missing features or edge cases.
- **PLACEHOLDER**: Endpoint exists but returns hardcoded/stubbed data.
- **MISSING**: Endpoint does not exist in backend code.
- **MOCK-DEPENDENT**: Backend depends on external mocks or simulated logic.

---

## 1. Auth Module

### Register User
- Module: `apps.users`
- Status: **READY**
- Method: `POST`
- URL: `/api/v1/auth/register/`
- Auth required: no
- Role required: public
- Tier required: none
- Request body: `{ "full_name": "string", "email": "string", "password": "string", "advisory_terms_accepted": boolean }`
- Success response shape: `{ "success": true, "data": { "user": { "id": 1, "email": "user@example.com", ... } } }`
- Error response shape: `{ "success": false, "error": { "code": "VALIDATION_ERROR", "message": "..." } }`
- Important business rules: Validates email uniqueness. Requires advisory terms acceptance.
- Privacy notes: Password is never returned.
- Frontend page: `/register`

### Login
- Module: `apps.users`
- Status: **READY**
- Method: `POST`
- URL: `/api/v1/auth/login/`
- Auth required: no
- Role required: public
- Tier required: none
- Request body: `{ "email": "string", "password": "string" }`
- Success response shape: `{ "success": true, "data": { "user": { ... } } }`
- Error response shape: `{ "success": false, "error": { "code": "AUTHENTICATION_FAILED", "message": "..." } }`
- Important business rules: Uses standard Django session authentication.
- Privacy notes: Returns basic user metadata.
- Frontend page: `/login`

### Logout
- Module: `apps.users`
- Status: **READY**
- Method: `POST`
- URL: `/api/v1/auth/logout/`
- Auth required: yes
- Role required: user/admin
- Tier required: none
- Success response shape: `{ "success": true, "data": {} }`
- Frontend page: Any (via Sidebar)

### Current User (Me)
- Module: `apps.users`
- Status: **READY**
- Method: `GET`
- URL: `/api/v1/auth/me/`
- Auth required: yes
- Success response shape: `{ "success": true, "data": { "user": { "id": 1, "email": "...", "role": "USER", "tier": "FREE", "onboarding_complete": true } } }`
- Frontend page: Used by `AuthContext`

---

## 2. Onboarding Module

### Submit Onboarding
- Module: `apps.profiles`
- Status: **READY**
- Method: `POST`
- URL: `/api/v1/onboarding/`
- Auth required: yes
- Role required: user
- Tier required: none
- Request body: `{ "age": int, "gender": "string", "height_cm": float, "weight_kg": float, "nutrition_goal": "string", "health_conditions": [id], "allergies": [id] }`
- Success response shape: `{ "success": true, "data": { "profile": { ... } } }`
- Important business rules: Requires Idempotency-Key. Sets `onboarding_complete` to true.
- Privacy notes: Sensitive body/health data stored securely.
- Frontend page: `/onboarding`

---

## 3. User Profile Module

### Get Profile
- Module: `apps.profiles`
- Status: **READY**
- Method: `GET`
- URL: `/api/v1/profile/me/`
- Auth required: yes
- Role required: user
- Success response shape: `{ "success": true, "data": { "age": ..., "gender": ..., "health_conditions": [...], "allergies": [...] } }`
- Privacy notes: Admins are blocked from this endpoint.
- Frontend page: `/dashboard/profile`

### Update Profile
- Module: `apps.profiles`
- Status: **READY**
- Method: `PATCH`
- URL: `/api/v1/profile/me/`
- Auth required: yes
- Role required: user
- Request body: Partial profile fields.
- Success response shape: Updated profile.
- Frontend page: `/dashboard/profile`

---

## 4. Chat Module

### Send Message
- Module: `apps.chat`
- Status: **READY**
- Method: `POST`
- URL: `/api/v1/chat/message/`
- Auth required: yes
- Role required: user
- Request body: `{ "message": "string", "session_id": int|null }`
- Success response shape: `{ "success": true, "data": { "reply": "string", "foods": [...], "warnings": [...], "session_id": int } }`
- Important business rules: Hybrid logic. Gemini plans/formats; Backend executes tools.
- Privacy notes: Private messages. No health/body data sent to Gemini.
- Frontend page: `/dashboard/chat`

### List Sessions
- Module: `apps.chat`
- Status: **READY**
- Method: `GET`
- URL: `/api/v1/chat/sessions/`
- Success response shape: `{ "success": true, "data": { "sessions": [...] } }`
- Frontend page: `/dashboard/chat` (Sidebar)

### Session Detail
- Module: `apps.chat`
- Status: **READY**
- Method: `GET`
- URL: `/api/v1/chat/sessions/<id>/`
- Success response shape: `{ "success": true, "data": { "session": { "messages": [...], "recommendations": [...] } } }`
- Frontend page: `/dashboard/chat`

---

## 5. Nutrition Module

### Generate Nutrition Plan
- Module: `apps.nutrition`
- Status: **PARTIAL**
- Method: `POST`
- URL: `/api/v1/plans/generate/`
- Auth required: yes
- Role required: user
- Tier required: Free (Limit 5/week), Pro/Ultra (Unlimited)
- Important business rules: Uses rule-based logic to pick foods based on profile and goal.
- Privacy notes: Plan data is sensitive.
- Frontend page: `/dashboard/nutrition-plans`

### Search Healthy Alternatives
- Module: `apps.nutrition`
- Status: **READY**
- Method: `POST`
- URL: `/api/v1/alternatives/search/`
- Auth required: yes
- Role required: user
- Tier required: Free (Limit 10/day)
- Important business rules: Checks allergies/conditions. Returns safe alternatives only.
- Frontend page: `/dashboard/alternatives`

### Hydration Target
- Module: `apps.nutrition`
- Status: **READY**
- Method: `GET`
- URL: `/api/v1/hydration/target/`
- Important business rules: Calculates target as Weight * 35ml.
- Frontend page: `/dashboard/tracking`

### Log Water
- Module: `apps.nutrition`
- Status: **READY**
- Method: `POST`
- URL: `/api/v1/hydration/log/`
- Request body: `{ "amount_ml": int }`
- Frontend page: `/dashboard/tracking`

### Daily Tip
- Module: `apps.nutrition`
- Status: **READY**
- Method: `GET`
- URL: `/api/v1/tips/daily/`
- Auth required: no (publicly viewable on landing/dashboard)
- Frontend page: `/`, `/dashboard`

### Health Condition Lookup
- Module: `apps.nutrition`
- Status: **READY**
- Method: `GET`
- URL: `/api/v1/health-conditions/`
- Auth required: no
- Success response shape: `{ "health_conditions": [{ "id": 1, "name": "Diabetes" }, ...] }`
- Frontend page: `/onboarding`, `/dashboard/profile`

### Allergy Lookup
- Module: `apps.nutrition`
- Status: **READY**
- Method: `GET`
- URL: `/api/v1/allergies/`
- Auth required: no
- Success response shape: `{ "allergies": [{ "id": 1, "name": "Peanuts" }, ...] }`
- Frontend page: `/onboarding`, `/dashboard/profile`

---

## 6. Subscription Module

### Get Current Subscription
- Module: `apps.subscriptions`
- Status: **MISSING**
- Suggested URL: `/api/v1/subscription/me/`
- Note: Currently frontend mocks the subscription status from the User/Profile object.

### Upgrade Subscription
- Module: `apps.subscriptions`
- Status: **MISSING**
- Suggested URL: `/api/v1/subscription/upgrade/`
- Note: High priority for monetization demo.

---

## 7. Admin Module

### Admin Dashboard Stats
- Module: `apps.common` or `apps.admin_meta`
- Status: **MISSING**
- Suggested URL: `/api/v1/admin/stats/`
- Note: Frontend currently uses mock data for user counts, active plans, etc.

### User Management
- Module: `apps.users`
- Status: **MISSING**
- Suggested URL: `/api/v1/admin/users/`
- Note: Frontend uses mock user lists.

---

## 8. Uploads & Tracking

### Food Image Analysis
- Status: **PLACEHOLDER**
- Note: Frontend has a UI but `hasAccess = false` and uses `generateMockAnalysis`.

### InBody Upload
- Status: **MISSING**
- Note: Targeted for Ultra tier.

### Daily Tracking / Weekly Reports
- Status: **MISSING**
- Note: Frontend has mock charts and logs.

---

## Missing or Incomplete APIs Needed for New UI

- **Endpoint**: `GET /api/v1/subscription/me/`
- **Why**: Display detailed tier benefits and expiry.
- **Priority**: High

- **Endpoint**: `POST /api/v1/subscription/upgrade/`
- **Why**: Allow users to simulated-upgrade to Pro/Ultra.
- **Priority**: High

- **Endpoint**: `GET /api/v1/admin/dashboard/`
- **Why**: Show real system usage to admins.
- **Priority**: Medium

- **Endpoint**: `GET /api/v1/tracking/daily/`
- **Why**: Replace mock intake charts with real history.
- **Priority**: Medium

- **Endpoint**: `POST /api/v1/upload/food-image/`
- **Why**: Real image analysis placeholder (integrating Vision).
- **Priority**: Low (Academic demo)
