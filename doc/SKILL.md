# Mazaj+ Skill and Engineering Guide

## 1. Backend Folder Structure Recommendation
```text
config/
apps/users/
apps/profiles/
apps/subscriptions/
apps/nutrition/
apps/chat/
apps/uploads/
apps/tracking/
apps/reports/
apps/admin_portal/
apps/common/
```

## 2. Backend Patterns
- **Views/Controllers:** Keep slim. Direct incoming payloads sequentially to validators and services.
- **Services:** Centralize business logic (e.g., executing plan generations).
- **Policies:** Explicitly enforce role, tier, subscription, and onboarding status checks prior to routing logic.
- **Validators:** Govern safety executions (cross-referencing inputs against profiles).
- **Adapters:** Restrict AI surface areas (e.g., encapsulating Gemini requests to sanitize inputs and outputs).
- **Repositories/Query Helpers:** Utilize where complex data retrieval logic benefits from isolation.
- **Serializers:** Explicitly list allowed fields. Avoid `__all__` systematically on sensitive serializers.
- **Transactions:** Use `transaction.atomic` natively for multi-step writes (e.g. logging while capturing logs).
- **Idempotency:** Force idempotency services for critical database writes.
- **Audit Logging:** Maintain rigid trails without logging sensitive profile data inside payloads.

## 3. Frontend Folder Structure Recommendation
```text
src/app/
src/pages/
src/features/
src/components/
src/components/ui/
src/lib/api/
src/context/
src/hooks/
src/types/
src/routes/
```

## 4. Frontend Rules
- **No Business Logic Authority:** React components evaluate conditionals for presentation only. Authority exists in Django.
- **API Client Structure:** Construct robust interceptors for Django session authentication (or the selected backend auth method. JWT must not be assumed unless explicitly selected later).
- **Auth Context:** Maintain rigorous state representation (Loading, Unauthenticated, Authenticated, Onboarded).
- **Route Guards:** Deploy Higher-Order Components restricting path rendering based strictly on validated Auth/Tier parameters.
- **Tier-aware UI:** Transparently show Pro/Ultra features to Free users indicating locked status and upgrade pathways.
- **Loading Skeletons:** Preserve UI boundaries smoothly during network calls.
- **Empty States:** Provide meaningful instructional empty datasets.
- **Error States:** Gracefully catch failed responses without breaking user flow.
- **Success States:** Signal mutation approvals systematically.
- **Upgrade-required States:** Triggered explicitly when reaching server-side caps.
- **Onboarding-required States:** Automatic intercept for `/app/*` routes directing to `/onboarding`.

## 5. Design System
The visual style must be **clean, trustworthy, nutrition-oriented, calm, warm, and non-medical.** Colors should later be implemented as CSS variables or design tokens.

### Color Guidance
- **Primary:** Nutrition green.
- **Secondary:** Deep teal or blue-slate.
- **Accent:** Warm orange/yellow for tips and highlights.
- **Background:** Off-white or soft green-tinted neutral.
- **Success:** Green (used sparingly, not overused).
- **Warning:** Amber.
- **Danger:** Red (used only for errors and blocked unsafe actions).
- **Muted:** Soft gray/slate.

## 6. UI Components Guidance
- **Landing Sections:** Approachable, tier-promoting, feature-defining.
- **Auth Forms:** Clear validations, obvious password visibility toggles.
- **Onboarding Steps:** Paginating wizards, explicit progress tracking.
- **Dashboard Cards:** High-level metrics, cleanly bounded, avoiding clutter.
- **Chat Bubbles:** Soft border radius, distinctly differentiated spacing.
- **Plan Cards:** Tidy tabular breakdowns, clearly marked caloric estimations.
- **Hydration Cards:** Visual volume trackers (e.g., filled glass/bottle illustrations).
- **Alternative Result Cards:** Clean "Food A -> Food B" indicators with text rationales.
- **Upload Dropzones:** Obvious drag targets, dashed borders, loading states matching vision.
- **Tracking Charts:** Uncomplicated bar/line graphics focusing on intake against goals.
- **Weekly Report Cards:** Summarized metrics, clearly highlighting trends over periods.
- **Subscription Cards:** Tier matrix comparisons, clear invocation buttons.
- **Admin Tables:** Dense, sortable, paginated data structures.
- **Drawers / Modals:** Smooth overlays mapping tight mobile interfaces.
- **Breadcrumbs:** Precise trail mapping within dashboard depths.
- **Sidebars:** Clear active-state tinting.
- **Skeletons:** Animated gray shimmers mimicking loaded data forms.

## 7. Content Restrictions
- **No diagnosis wording.** (e.g., Never use "You have condition X".)
- **No treatment wording.** (e.g., Never use "Use this to cure Y".)
- **No unsafe claims.** (e.g., Never use "This will definitely help.")
- **No overconfident AI language.**
- **All nutrition output is advisory.** Language must frame output strictly as assistive estimations.
