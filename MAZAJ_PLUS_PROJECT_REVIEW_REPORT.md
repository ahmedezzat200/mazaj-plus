# Mazaj+ Project Review Report

Project local root:

`C:\Users\Lenovo\Downloads\mazajp+`

Source code root:

`C:\Users\Lenovo\Downloads\mazajp+\source code`

Git remote configured locally:

`https://github.com/ahmedezzat200/mazaj-plus.git`

Review scope:

- Reviewed the local workspace copy under `C:\Users\Lenovo\Downloads\mazajp+`.
- Reviewed backend and frontend source code structure, API contracts, authentication flow, hydration, alternatives, nutrition plans, chat, upload, tracking, and admin areas.
- Did not modify application code while preparing this report.
- Did not run remote GitHub fetch/pull.

Existing local git state before creating this report:

- One pre-existing modified file was present:
  - `source code/frontend/src/app/components/dashboard/upload/FoodImageAnalysisPage.tsx`

Validation attempted:

- Frontend production build was run from:
  - `C:\Users\Lenovo\Downloads\mazajp+\source code\frontend`
- Command:
  - `npm run build`
- Result:
  - Passed.
  - Vite produced only a chunk-size warning.
- Backend Django check was attempted from:
  - `C:\Users\Lenovo\Downloads\mazajp+\source code\backend`
- Command:
  - `python manage.py check`
- Result:
  - Failed because Django is not installed in the active Python environment.
  - Error: `ModuleNotFoundError: No module named 'django'`
  - This indicates local backend environment setup is incomplete or no virtualenv is activated.

---

## Executive Summary

The project is not fully finished yet.

The backend foundation exists and covers important prototype features:

- Django project structure.
- Session-based auth.
- Registration/login/logout/current-user endpoints.
- Onboarding/profile endpoints.
- Nutrition plan endpoints.
- Healthy alternatives endpoint.
- Hydration target and hydration log endpoints.
- Daily tip endpoint.
- Chat endpoint and chat session history.
- Idempotency records for several POST endpoints.
- Basic usage limit handling for free tier.
- Safety filtering against stored allergies and health conditions.

However, there are still important gaps before this can be considered complete:

1. Some backend/frontend API contracts do not match.
2. Several frontend pages are still mock-only or locked.
3. Some sensitive/private profile information is shown in mock support panels.
4. Onboarding UI collects health conditions and allergies but sends empty arrays to backend.
5. Admin frontend screens are mostly static/mock and do not have real admin API integration.
6. Upload/image analysis is not implemented as a real backend flow.
7. Tracking/reporting is mock-only.
8. Backend production readiness is not complete.
9. No automated tests were found in the project.
10. Backend could not be checked locally because dependencies are not installed in the active environment.

Overall conclusion:

- Backend is partially done, not complete.
- Frontend is partially integrated, with several screens still mock/demo.
- Most urgent work is integration correctness, not redesign.
- The project should be treated as an academic/prototype app unless the missing production and integration work is completed.

---

## Project Structure Observed

Top-level:

- `.git`
- `.gitignore`
- `doc`
- `source code`
- `UI,UX`

Source code:

- `source code/backend`
- `source code/frontend`
- `source code/start_all.bat`
- `source code/start_backend.bat`
- `source code/start_frontend.bat`
- `source code/backend.zip`

Backend:

- Django app.
- Main config:
  - `source code/backend/config/settings.py`
  - `source code/backend/config/urls.py`
- Apps:
  - `apps/common`
  - `apps/users`
  - `apps/profiles`
  - `apps/subscriptions`
  - `apps/nutrition`
  - `apps/chat`

Frontend:

- Vite React app.
- API wrapper:
  - `source code/frontend/src/lib/api.ts`
- Auth context:
  - `source code/frontend/src/contexts/AuthContext.tsx`
- Routes:
  - `source code/frontend/src/app/routes.tsx`
- Dashboard sections:
  - chat
  - plan chat
  - nutrition plans
  - alternatives
  - upload
  - tracking
  - subscription
  - admin

---

## Backend Endpoint Inventory

Configured root URL file:

`source code/backend/config/urls.py`

Backend routes:

- `django-admin/`
- `api/v1/auth/`
- `api/v1/`
- `api/v1/chat/`

Auth endpoints:

File:

`source code/backend/apps/users/urls.py`

Endpoints:

- `POST /api/v1/auth/register/`
- `POST /api/v1/auth/login/`
- `POST /api/v1/auth/logout/`
- `GET /api/v1/auth/me/`

Profile/onboarding endpoints:

File:

`source code/backend/apps/profiles/urls.py`

Endpoints:

- `POST /api/v1/onboarding/`
- `GET /api/v1/profile/me/`
- `PATCH /api/v1/profile/me/`

Nutrition endpoints:

File:

`source code/backend/apps/nutrition/urls.py`

Endpoints:

- `POST /api/v1/plans/generate/`
- `GET /api/v1/plans/`
- `GET /api/v1/plans/<id>/`
- `POST /api/v1/alternatives/search/`
- `GET /api/v1/hydration/target/`
- `POST /api/v1/hydration/log/`
- `GET /api/v1/tips/daily/`

Chat endpoints:

File:

`source code/backend/apps/chat/urls.py`

Endpoints:

- `POST /api/v1/chat/message/`
- `GET /api/v1/chat/sessions/`
- `GET /api/v1/chat/sessions/<id>/`

Common endpoints:

File:

`source code/backend/apps/common/urls.py`

Endpoints:

- `GET /api/v1/health/`
- `GET /api/v1/csrf/`

---

## Backend Strengths

1. Clear Django modular structure

The project is split into domain apps:

- users
- profiles
- subscriptions
- nutrition
- chat
- common

This is a good base for maintainability.

2. Session auth is implemented

Frontend uses cookies and CSRF.
Backend uses Django login/logout and DRF permission classes.

3. Idempotency exists on important POST endpoints

The backend uses `IdempotencyKey` records for:

- onboarding
- chat message
- nutrition plan generation
- healthy alternatives search
- hydration log

This is good for retry safety and avoiding duplicate operations.

4. Hydration backend behavior is mostly correct

Hydration target:

- Reads backend profile weight.
- Computes target from backend only.
- Returns `target_ml`.
- Returns `today_total_ml`.

Hydration log:

- Requires auth.
- Requires onboarding.
- Requires `Idempotency-Key`.
- Validates `amount_ml`.
- Creates a real `WaterIntakeLog`.
- Recalculates `today_total_ml` from database after create.
- Returns totals from backend response.

5. Safety filtering exists

Nutrition service filters foods against:

- user allergies
- blocked health condition rules

It does not return raw health condition names in recommendations.

6. Free tier usage limits exist

The `check_and_increment_usage` service handles limits for:

- chat guidance
- healthy alternatives
- nutrition plan generation

Pro/Ultra active subscriptions bypass limits.

---

## Major Backend/Frontend Contract Problems

### 1. Healthy alternatives response shape mismatch

Backend file:

`source code/backend/apps/nutrition/views.py`

Relevant backend behavior:

The backend returns:

```json
{
  "alternative_food": "Food Name",
  "calories": "...",
  "protein_g": "...",
  "carbs_g": "...",
  "fat_g": "...",
  "reason": "..."
}
```

Frontend file:

`source code/frontend/src/lib/api.ts`

Frontend type expects:

```ts
alternative_food: {
  name: string;
  calories: string;
  protein_g: string;
  carbs_g: string;
  fat_g: string;
}
```

Frontend mapping file:

`source code/frontend/src/app/components/dashboard/alternatives/AlternativesPage.tsx`

Frontend maps:

```ts
alternativeFood: a.alternative_food?.name ?? 'Whole Food Option'
```

Impact:

- If backend returns a string, `a.alternative_food?.name` is undefined.
- UI may show fallback text `Whole Food Option` instead of the real alternative food.
- Nutrition values may also be ignored depending on UI expectations.

Recommended fix:

Choose one consistent contract.

Option A - backend returns nested object:

```json
{
  "alternative_food": {
    "name": "Food Name",
    "calories": "...",
    "protein_g": "...",
    "carbs_g": "...",
    "fat_g": "..."
  },
  "reason": "..."
}
```

Option B - frontend changes type/mapping to accept string fields:

```ts
alternativeFood: typeof a.alternative_food === 'string'
  ? a.alternative_food
  : a.alternative_food?.name ?? 'Whole Food Option'
```

Best recommendation:

- Fix backend response shape to match the existing frontend type if the frontend UI wants grouped food metadata.

Priority:

- High.

---

### 2. Nutrition plan generate response mismatch

Backend file:

`source code/backend/apps/nutrition/views.py`

Backend returns:

```py
response_data = NutritionPlanSerializer(plan).data
return success_response(response_data)
```

That means API response shape is:

```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "...",
    "goal": "...",
    "bmi": "...",
    "estimated_daily_calories": "...",
    "plan_data": {},
    "advisory_note": "...",
    "created_at": "..."
  }
}
```

Frontend file:

`source code/frontend/src/lib/api.ts`

Frontend expects:

```ts
plan: json.data?.plan as BackendNutritionPlan
```

Impact:

- `json.data?.plan` will be undefined.
- Frontend can receive a successful backend response but treat it as missing plan data.
- In `NutritionPlansPage.tsx`, `result.ok` may be true but `result.plan` undefined, causing fallback error behavior.

Recommended fix:

Choose one consistent contract.

Option A - backend wraps plan:

```py
return success_response({"plan": response_data})
```

Option B - frontend reads direct data:

```ts
plan: json.data as BackendNutritionPlan
```

Best recommendation:

- Backend should wrap generate response as `{"plan": ...}` to match detail endpoint and frontend expectations.

Priority:

- High.

---

### 3. Onboarding collects health conditions/allergies but sends empty arrays

Frontend file:

`source code/frontend/src/app/components/onboarding/OnboardingFlow.tsx`

The UI has steps for:

- Health Conditions
- Food Allergies

But submit payload currently sends:

```ts
health_conditions: [],
allergies: []
```

Impact:

- User-selected conditions/allergies are not saved.
- Backend safety filtering cannot protect the user based on selected conditions/allergies.
- Recommendations, alternatives, and plans may appear "safety validated" but are missing the user's actual allergy/condition mappings.

Backend expects numeric IDs:

`source code/backend/apps/profiles/serializers.py`

```py
health_conditions = serializers.ListField(child=serializers.IntegerField(), required=False, default=list)
allergies = serializers.ListField(child=serializers.IntegerField(), required=False, default=list)
```

But frontend UI appears to store selected strings, not backend IDs.

Recommended fix:

- Add backend lookup endpoints for active health conditions and allergies, or seed and hardcode ID mapping carefully for prototype only.
- Update onboarding UI to submit selected backend IDs.
- Do not submit empty arrays if user selected values.

Priority:

- Critical if safety/personalization is a required feature.

---

## Frontend Areas Still Mock or Demo-Only

### 1. Plan Chat is mock-only

Frontend file:

`source code/frontend/src/app/components/dashboard/plan/PlanChatPage.tsx`

Current behavior:

- User message is added locally.
- Uses `setTimeout`.
- Calls `generateMockPlanResponse`.
- Calls `generateMockPlan`.
- Does not call `plansApi.generate`.
- Does not persist plan from this chat flow.

Impact:

- The visible "plan chat" experience is not connected to backend.
- Any generated plan in this UI is fake/demo data.
- User may think a real backend plan was generated, but it was not.

Recommended fix:

- Decide whether plan generation should happen via:
  - existing `POST /api/v1/plans/generate/`, or
  - a new conversational plan endpoint.
- Replace mock response with backend integration.
- Show backend success only after confirmed success.
- Persist resulting plan and link to nutrition plans page.

Priority:

- High.

---

### 2. Upload/Image Analysis is locked and mock-only

Frontend file:

`source code/frontend/src/app/components/dashboard/upload/FoodImageAnalysisPage.tsx`

Current behavior:

```ts
const hasAccess = false;
```

The analysis flow:

- validates local file type/size
- creates preview
- simulates processing with `setTimeout`
- uses `Math.random`
- returns mock nutrition analysis

No backend upload endpoint was found.

Impact:

- Food image analysis feature is not implemented as a real backend feature.
- Upload page is locked in current code.
- No image recognition, nutrition lookup, or database matching backend exists.

Recommended fix:

- If upload is in scope, add backend API endpoint for image upload.
- Add server-side file validation.
- Add storage strategy.
- Add analysis pipeline.
- Add frontend integration.
- Remove fake/random result behavior.

Priority:

- Medium or high depending on product requirements.

---

### 3. Tracking is mock-only

Frontend files:

- `source code/frontend/src/app/components/dashboard/tracking/DailyIntakeLog.tsx`
- `source code/frontend/src/app/components/dashboard/tracking/WeeklyReport.tsx`

Current behavior:

- Uses `mockEntries`.
- Uses `mockWeeklyData`.
- Add/delete actions are not persisted.
- Weekly report is calculated from static data.

No backend daily food intake tracking endpoints were found.

Impact:

- Tracking page is not a real feature yet.
- Reports are not based on user data.
- Hydration shown in tracking is static and not tied to real hydration logs.

Recommended fix:

- Add backend models and endpoints for daily food intake logs.
- Add list/create/delete/update endpoints.
- Add weekly report endpoint.
- Connect frontend.
- Use hydration backend totals where appropriate.

Priority:

- Medium or high depending on whether tracking is required for submission.

---

### 4. Admin pages are mostly mock/static

Examples:

- `source code/frontend/src/app/components/admin/UserManagement.tsx`
- `source code/frontend/src/app/components/admin/DailyTipsManagement.tsx`
- `source code/frontend/src/app/components/admin/FoodDataManagement.tsx`
- `source code/frontend/src/app/components/admin/SubscriptionControl.tsx`

Observed behavior:

- Uses `mockUsers`.
- Uses `mockTips`.
- Uses `mockFoodItems`.
- Uses `mockSubscriptions`.

No dedicated backend admin API endpoints were found beyond Django admin.

Impact:

- Admin dashboard may look functional but is not managing real backend data.
- Tier edits, food data edits, daily tips, and subscription controls may be UI-only.

Recommended fix:

- Either clearly label admin frontend as demo-only, or add admin APIs.
- Admin APIs should enforce strict admin permissions.
- Avoid exposing private user profile data in admin responses.
- Keep audit logging for admin actions.

Priority:

- Medium.

---

### 5. Mock private profile data is shown in support panels

Frontend files:

- `source code/frontend/src/app/components/dashboard/chat/RightSupportPanel.tsx`
- `source code/frontend/src/app/components/dashboard/plan/PlanSupportPanel.tsx`
- `source code/frontend/src/app/components/dashboard/alternatives/AlternativesSupportCards.tsx`

Observed examples:

- Age
- Gender
- Height
- Weight
- BMI
- Allergies
- Health conditions
- Goal

Impact:

- Even if mock, this conflicts with strict privacy/business rules if these are displayed in user-facing dashboards.
- It may mislead users because the values are hardcoded and not their real profile.

Recommended fix:

- Remove private profile detail display from user dashboard support panels.
- Replace with privacy-safe explanatory copy.
- If any profile details must be shown, only show safe non-sensitive fields after explicit product approval.

Priority:

- High if privacy rules are strict.

---

## Backend Production Readiness Issues

File:

`source code/backend/config/settings.py`

Observed:

```py
SECRET_KEY = os.environ.get('SECRET_KEY', 'django-insecure-dev-key')
DEBUG = os.environ.get('DEBUG', 'True') == 'True'
ALLOWED_HOSTS = os.environ.get('ALLOWED_HOSTS', '*').split(',')
```

Issues:

- Development fallback secret key exists.
- `DEBUG` defaults to true.
- `ALLOWED_HOSTS` defaults to wildcard.
- SQLite is default database.
- Security cookie settings are basic.
- No explicit production deployment settings were observed.

Recommended production hardening:

- Require `SECRET_KEY` in environment.
- Default `DEBUG` to false.
- Do not default `ALLOWED_HOSTS` to `*`.
- Use Postgres for production.
- Add secure cookie settings for HTTPS deployment:
  - `SESSION_COOKIE_SECURE = True`
  - `CSRF_COOKIE_SECURE = True`
  - `SECURE_SSL_REDIRECT = True` if behind direct HTTPS or configured proxy.
- Configure trusted origins for production frontend domain.
- Add logging configuration.
- Add environment-specific settings or documented deployment config.

Priority:

- High before deployment.

---

## Backend Error Handling Observations

Many backend views catch broad exceptions:

```py
except Exception as e:
    return error_response("...", "An error occurred.", details={}, stat=500)
```

Positive:

- This avoids leaking private internals to frontend.

Concern:

- It makes debugging harder if there is no server-side logging.
- Some known application errors are represented as raw `Exception("USAGE_LIMIT_EXCEEDED")`.

Recommended fix:

- Add structured server-side logging.
- Use custom exception classes for usage limit, validation, conflict, and business-rule failures.
- Keep frontend error messages safe.

Priority:

- Medium.

---

## Idempotency Review

Positive:

- Idempotency exists and is enforced for important POST endpoints.
- Reused same key with same body returns stored response.
- Reused same key with different body returns conflict.
- In-progress request returns conflict.

Potential improvements:

- Idempotency code is duplicated across multiple views.
- Failed idempotency records are retried by resetting status to `IN_PROGRESS`.
- There is no visible expiry/cleanup strategy for old idempotency keys.

Recommended fix:

- Extract helper/service for idempotency handling.
- Add retention/cleanup strategy.
- Add tests for:
  - missing key
  - same key same body
  - same key different body
  - in-progress duplicate
  - failed retry

Priority:

- Medium.

---

## Hydration Status

Backend hydration is mostly aligned with required safe behavior:

- `GET /api/v1/hydration/target/` returns backend `target_ml` and `today_total_ml`.
- `POST /api/v1/hydration/log/` creates DB log and recalculates `today_total_ml`.
- Idempotency key is required.
- Validation rejects invalid amount via serializer.

Frontend hydration after hotfix:

- Success feedback is backend-confirmed.
- Failure should show safe error only.
- Totals are updated from backend response only.
- No fake local hydration logs were introduced.
- Idempotency key behavior in `api.ts` is unchanged.

Potential limitation:

- Backend check could not be run due missing Django in active environment.
- No automated hydration tests were found.

Priority:

- Low for functionality, medium for test coverage.

---

## Chat Status

Backend chat exists:

- `POST /api/v1/chat/message/`
- `GET /api/v1/chat/sessions/`
- `GET /api/v1/chat/sessions/<id>/`

Implementation:

- Uses simple rule-based intent detection.
- No Gemini or external AI integration observed.
- Mood recommendations are based on database mood mappings.
- Safety filters are applied before recommending foods.
- Usage limits are incremented for mood recommendation and nutrition plan request modes.

Frontend chat:

- `chatApi` exists in `src/lib/api.ts`.
- Chat page uses `localStorage` to store active chat session ID.
- This may be acceptable for session UI state, but should not store private message content.

Recommended checks:

- Confirm chat UI does not store private messages in localStorage.
- Add tests for safety filtering.
- Add tests for usage limits.

Priority:

- Medium.

---

## Nutrition Plans Status

Backend:

- Can generate a simple demo plan from safe database foods.
- Computes BMI and estimated calories from stored profile height/weight.
- Applies safety filtering.
- Stores plan in `NutritionPlan`.
- Lists plans.
- Retrieves plan detail.

Important:

- The generated plan is basic demo logic, not advanced nutrition planning.
- No Gemini integration observed.
- No advanced dietician logic observed.

Frontend:

- `NutritionPlansPage.tsx` integrates with backend list and generate endpoints.
- Generate response has a contract mismatch as described above.
- `PlanChatPage.tsx` is separate and mock-only.

Privacy concern:

- `NutritionPlanSerializer` returns BMI and estimated calories.
- If frontend privacy rules say not to display weight/height but allow BMI/calories, this may be okay.
- If BMI is considered sensitive in product rules, remove it from user-facing UI.

Priority:

- High for API contract fix.
- Medium for deeper planning quality.

---

## Healthy Alternatives Status

Backend:

- Requires auth.
- Requires completed onboarding.
- Blocks admin users.
- Requires idempotency key.
- Checks usage limit.
- Uses database `HealthyAlternative`.
- Filters alternatives based on user allergies and blocked health condition rules.

Frontend:

- Calls `/alternatives/search/`.
- Handles usage limit.
- Handles auth/session error.
- Has response shape mismatch as described above.

Priority:

- High for contract fix.

---

## Daily Tip Status

Backend:

- `GET /api/v1/tips/daily/`
- `AllowAny`
- Returns first active daily tip.

Frontend:

- `tipsApi.getDaily()` handles both:
  - `{ tip: {...} }`
  - direct `{ title, content }`

Status:

- Appears acceptable for prototype.

Priority:

- Low.

---

## Auth and Profile Status

Auth:

- Register endpoint creates:
  - Django user
  - profile
  - free active subscription
  - audit log
- Login uses Django `authenticate` and `login`.
- Logout uses Django `logout`.
- Current user serializer intentionally returns limited public account fields.

Profile:

- Profile serializer returns:
  - age
  - gender
  - height_cm
  - weight_kg
  - nutrition_goal
  - onboarding_complete
  - health_conditions
  - allergies

Concern:

- This profile endpoint returns private data.
- It is okay if used only in secure user profile settings, but should not feed dashboard support panels that display private details unless product rules allow it.

Recommended:

- Keep `/profile/me/` authenticated.
- Avoid displaying private fields across dashboard panels.
- Add explicit privacy-safe DTOs for areas that only need safe profile status.

Priority:

- Medium to high depending on privacy requirements.

---

## Subscription / Usage Limits Status

Backend:

- Free tier is created on registration.
- `check_and_increment_usage` handles daily or weekly periods.
- Pro/Ultra active subscriptions bypass limits.

Potential missing pieces:

- No real payment/subscription provider integration observed.
- Admin subscription control frontend appears mock.
- User tier updates may not be fully implemented outside Django admin or mock UI.

Priority:

- Medium.

---

## Testing Status

Automated tests:

- No test files were found by searching for test-related filenames.

Checks run:

- Frontend build passed.
- Backend check could not run due missing Django in active environment.

Recommended test coverage:

Backend:

- Auth register/login/logout/current user.
- Onboarding idempotency.
- Profile update validation.
- Allergy and health condition mapping persistence.
- Safety filtering for alternatives.
- Nutrition plan generation response shape.
- Hydration target and hydration log.
- Hydration idempotency.
- Usage limits for free tier.
- Admin restriction on user-facing endpoints.

Frontend:

- API helpers parse backend shapes correctly.
- Alternatives result rendering.
- Hydration success appears only after backend success.
- Nutrition plan generate handles backend success.
- Onboarding sends selected allergy/condition IDs.
- Protected routes behavior.

Priority:

- High before submission/deployment.

---

## Build and Runtime Status

Frontend:

- `npm run build` passed.
- Warning:
  - Some chunks are larger than 500 kB after minification.
- This is not a build failure.
- Later optimization could use dynamic imports or manual chunks.

Backend:

- Could not run `python manage.py check`.
- Active Python:
  - `Python 3.14.0`
- Error:
  - Django not installed.

Recommended backend setup:

```powershell
cd "C:\Users\Lenovo\Downloads\mazajp+\source code\backend"
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
python manage.py check
python manage.py migrate
python manage.py runserver
```

Note:

- If Python 3.14 causes dependency compatibility issues, use a supported stable Python version for the Django version in `requirements.txt`.

---

## Priority Fix Plan

### Priority 0 - Must fix before claiming core integration is done

1. Fix healthy alternatives response mismatch.
2. Fix nutrition plan generate response mismatch.
3. Fix onboarding to submit selected health condition/allergy IDs instead of empty arrays.
4. Remove or hide mock private profile data from dashboard support panels.
5. Set up backend environment and run `python manage.py check`.

### Priority 1 - Important for real product behavior

1. Replace Plan Chat mock with backend integration or mark it clearly as demo.
2. Decide whether Upload/Image Analysis is in scope. If yes, implement backend endpoint and real frontend integration.
3. Replace Tracking mock data with real backend APIs if tracking is in scope.
4. Add backend tests for idempotency, usage limits, safety filtering, and hydration.
5. Add server-side logging for broad exception handlers.

### Priority 2 - Production readiness

1. Harden Django settings:
   - no dev secret fallback
   - `DEBUG=False` default
   - strict `ALLOWED_HOSTS`
   - secure cookies for HTTPS
   - production DB config
2. Add deployment documentation.
3. Add idempotency cleanup.
4. Add frontend code splitting if bundle size matters.

### Priority 3 - Cleanup and maintainability

1. Extract duplicated idempotency code into a helper.
2. Add shared TypeScript types generated from backend contract or documented API schema.
3. Add OpenAPI schema for backend endpoints.
4. Standardize all backend success response shapes.

---

## Recommended Minimal Backend Fixes

If the next developer only has time for backend fixes, do these first:

1. In `apps/nutrition/views.py`, update `NutritionPlanGenerateView` to return:

```py
return success_response({"plan": response_data})
```

instead of:

```py
return success_response(response_data)
```

2. In `AlternativeSearchView`, update each alternative item to return nested `alternative_food` object:

```py
alt_list.append({
    "original_food_name": alt.original_food_name,
    "alternative_food": {
        "name": alt.alternative_food.name,
        "calories": str(alt.alternative_food.calories),
        "protein_g": str(alt.alternative_food.protein_g),
        "carbs_g": str(alt.alternative_food.carbs_g),
        "fat_g": str(alt.alternative_food.fat_g),
    },
    "reason": alt.reason
})
```

3. Add active condition/allergy list endpoints or another safe way for frontend onboarding to map selected options to backend IDs.

4. Add backend tests for the above.

---

## Recommended Minimal Frontend Fixes

If the next developer only has time for frontend fixes, do these first:

1. Make frontend alternatives parsing tolerant of both current backend string response and desired object response.

2. Make `plansApi.generate` tolerant of both:

```ts
json.data?.plan
```

and:

```ts
json.data
```

3. Update onboarding to submit selected allergy/condition IDs once backend lookup endpoints exist.

4. Remove private mock profile details from dashboard support panels.

5. Clearly label or disable mock-only pages if not ready:

- Plan Chat
- Upload
- Tracking
- Admin controls

---

## Privacy and Safety Notes

Business/privacy rule:

Frontend should not display:

- weight
- height
- allergies
- health condition names
- nutrition_goal
- private profile data

Potential violations or risky mock displays:

- `PlanSupportPanel.tsx` displays height, weight, BMI, allergies, health conditions.
- `RightSupportPanel.tsx` displays age, gender, goal, allergies.
- `AlternativesSupportCards.tsx` has mock profile data.
- `PlanSummarySection.tsx` displays goal and BMI from generated plan.
- Onboarding confirmation displays entered profile details, which may be acceptable during onboarding but should be reviewed against privacy rules.

Recommended approach:

- For normal dashboard pages, display only safe generic statements:
  - "Recommendations are checked against your saved safety profile."
  - "Your private profile details are not displayed here."
- Keep private values only in explicit profile settings pages, if allowed.
- Admin screens must not expose private health/profile details.

---

## Suggested Message to Send to Another ChatGPT

You can copy/paste this:

```text
I have a local project at:
C:\Users\Lenovo\Downloads\mazajp+

It is a Django backend + Vite React frontend project for Mazaj+.

Please review/fix it based on this report:

Core status:
- Frontend build passes with npm run build.
- Backend check could not run because Django is not installed in the active Python environment.
- Backend exists and has auth, onboarding, profile, chat, nutrition plans, healthy alternatives, hydration, daily tips, idempotency, subscriptions/usage limits.
- Project is not complete yet.

Highest priority issues:
1. Backend/frontend contract mismatch in healthy alternatives:
   Backend returns alternative_food as a string, frontend expects alternative_food.name and nested nutrition fields.
2. Backend/frontend contract mismatch in nutrition plan generation:
   Backend returns plan directly in data, frontend expects data.plan.
3. Onboarding UI collects health conditions/allergies but submits empty arrays, so backend safety filtering misses user selections.
4. Plan Chat page is mock-only and does not call backend.
5. Upload/image analysis is locked and mock-only.
6. Tracking/reporting uses mock data.
7. Admin frontend screens use mock data and have no real admin API integration.
8. Several dashboard support panels display mock private profile details like height, weight, allergies, health conditions, and goal.
9. Backend production settings are still development-oriented: DEBUG defaults true, ALLOWED_HOSTS defaults *, dev secret fallback, SQLite default.
10. No automated tests were found.

Please make changes conservatively, avoid redesign, preserve existing UI unless necessary, and prioritize safe backend/frontend integration.
```

---

## Final Assessment

Backend status:

- Not finished.
- Good prototype foundation.
- Needs integration fixes, tests, environment setup, and production hardening.

Frontend status:

- Builds successfully.
- Several important pages are still mock/demo.
- Some API integrations are present but have contract mismatches.

Overall project status:

- Good academic prototype base.
- Not ready to claim fully complete.
- Next best step is to fix contract mismatches and onboarding safety data first, then replace mock-only flows according to project scope.

