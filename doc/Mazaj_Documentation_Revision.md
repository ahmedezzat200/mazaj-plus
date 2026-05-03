# Mazaj+ — Documentation Revision
**Revision Type:** IN-PLACE DOCUMENT IMPROVEMENT — CORRECTED, TIGHTENED, AND ANALYTICALLY EXPANDED
**Source Set:** Mazaj_Proposal_Tiered_Updated · Mazaj_System_Analysis_Tiered_Updated · Mazaj_UML_Diagrams · Mazaj_Consolidation_Analysis
**Date:** 2026-04-18 | **Version:** R1.2 (Correction Execution Pass)

---

> **Documentation Authority Note:**
> - **Primary Source Truth:** Mazaj_Proposal_Tiered_Updated and Mazaj_System_Analysis_Tiered_Updated. All other artifacts derive from these.
> - **Corrected Structured Revision:** This document (R1.2) — takes precedence over R1.0 and R1.1.
> - **Supporting Analytical Artifacts:** Mermaid UML Diagrams (Use Case, Activity, Sequence, Class, ERD, EER) — authoritative within their notation. Adobe Scan sitemap (Page 16) is supplementary IA reference. Adobe Scan sequences for Registration and Admin flows are supplementary coverage artifacts.
> - **Certainty Labels Used Throughout:** `Source-Confirmed` · `Structural Clarification` · `Recommended Prototype Assumption` · `Requires Team Confirmation`

---

# SECTION 1 — PROJECT IDENTITY AND SCOPE

## 1.1 System Overview

Mazaj+ is a **web-based, chat-driven, database-centered, rule-based nutrition decision-support system** designed as an academic graduation prototype. It provides personalized food recommendations and nutrition plans through a conversational chat interface, using the user's stored profile, emotional state, and nutrition goals as the basis for guidance.

The system is **advisory only**. It does not diagnose health conditions, prescribe treatment, or replace medical professionals at any stage or at any tier. This boundary is non-negotiable and applies across all product features and all tiers.

**Technology Stack** *(Source-Confirmed)*:
- Backend: Django / Python
- Database: SQLite (development) / PostgreSQL (deployment target)
- External AI — Gemini API: used for response formatting only — does not generate or modify nutritional decisions
- External AI — Gemini Vision: used for food image recognition only — does not generate or evaluate nutritional values
- Food Data Sources: USDA, OpenFoodFacts, Kaggle (pre-loaded, cleaned, and standardized — see Section 7)

**Project Type:** Academic graduation project prototype — BIDT Program, Year 2025, Group 12

---

## 1.2 Tiered Access Model *(Source-Confirmed)*

| Tier | Subscription Required | Core Access |
|---|---|---|
| **Free** | No | Chat guidance (Op1 + Op2), healthy alternatives, hydration, daily tips |
| **Pro** | Yes — nominal/symbolic fee | All Free features + food image upload + InBody report upload |
| **Ultra** | Yes — nominal/symbolic fee | All Pro features + daily consumption tracking + weekly reports + full history review |
| **Admin** | No (role-assigned) | Admin Portal only — no access to any user-facing feature |

---

## 1.3 Requirements Elicitation Methodology *(Source-Derived)*

Requirements for the Mazaj+ system were gathered through a structured elicitation process conducted during the project's analysis phase. The following methods were applied:

**Methods Used:**
- **Team design sessions:** Core project team reviewed the system concept collaboratively to identify primary use cases, user roles, and feature scope.
- **Analogous system analysis:** Existing nutrition advisory applications and chatbot-based guidance tools were reviewed to identify standard patterns and gaps.
- **Literature review:** Nutrition literature and recognized dietary guidelines (consistent with the USDA and OpenFoodFacts data sources selected) informed the data model and rule-logic design.
- **Academic supervisor consultation:** Project scope, ethical constraints, and system boundaries were reviewed and validated with the academic supervisor.

**Constraints on Elicitation:**
- The academic prototype context restricted user research to team-level simulation of user needs — no medical professionals or real patient populations were consulted.
- All features were bounded by the advisory-only constraint established before elicitation began.
- Requirements were prioritized through the tier framework: features essential to all users formed the Free tier; features requiring additional resources formed Pro and Ultra tiers.

**Validation:**
Requirements were documented in the Mazaj+ proposal and system analysis documents (primary source truth). They were subsequently structured, grouped by module, and cross-validated against the data model to ensure all requirements had corresponding entities. Unresolved items were flagged as `[Requires Team Confirmation]` and catalogued in Section 8 of this document.

---

# SECTION 2 — PRODUCT MODULE OVERVIEW

## 2.1 Module Map *(Structural Clarification — 11 modules)*

The Mazaj+ system is decomposed into **11 functional modules**. These modules serve different structural purposes:

- **M1** is a public-facing entry point (no authentication required)
- **M2 and M3** are pre-portal system functions (authentication and onboarding gates)
- **M4** is the authenticated portal shell — it is not a standalone feature but the navigational framework
- **M5 through M10** are the authenticated user-facing feature modules
- **M11** is a separately scoped administrative system

> **Module Count Note:** The portal navigation interface presents M5–M10 plus Dashboard, Profile, Subscription, and Logout as navigable items. This is a subset of the 11 modules — not a conflicting count. M1 (Landing Page) needs no portal navigation; M2–M3 are system behaviors, not navigation destinations; M4 is the shell itself; M11 is a separate portal. All 11 modules are valid analytical units.

| # | Module | Tier Access | Type |
|---|---|---|---|
| M1 | Public Landing Page | Visitor + all | Public entry point |
| M2 | Authentication and Access | All authenticated | System gate |
| M3 | Onboarding and Profile | All authenticated | System gate |
| M4 | User Portal (Shell and Navigation) | Free, Pro, Ultra | Authenticated shell |
| M5 | Chat-Based Guidance | Free, Pro, Ultra | Core feature |
| M6 | Nutrition Plans | Free, Pro, Ultra | Core feature |
| M7 | Healthy Alternatives and Hydration | Free, Pro, Ultra | Core feature |
| M8 | Tracking and Reports | Ultra only | Premium feature |
| M9 | Upload-Based Features | Pro and Ultra | Premium feature |
| M10 | Subscription and Tier Management | Free, Pro, Ultra | System management |
| M11 | Admin Portal | Admin role only | Separate system area |

---

## 2.2 Public Landing Page — Module M1 *(Promoted to Official Module)*

### 2.2.1 Purpose *(Source-Confirmed)*

The Public Landing Page is the entry point to the Mazaj+ system for all unauthenticated visitors. It communicates the core value proposition, exposes the tier-based feature structure, and routes visitors toward registration or login. The landing page requires no authentication to view. Any unauthenticated attempt to access a protected internal page must redirect to the login entry point.

> **Module Status:** This module is officially documented based on source-confirmed requirements for a public entry point and the supporting information architecture (sitemap) that confirms the Landing Page as a distinct system zone with About, Features, and Pricing sections. Exact visual design, layout, and copy are UI/UX design decisions to be resolved in the design phase.

### 2.2.2 Visitor Role

A Visitor is any individual who accesses the Mazaj+ URL without an authenticated session. Visitors have no access to chat guidance, profile data, recommendations, or any personalized feature. Visitor is a recognized actor in the system's use case model.

### 2.2.3 Landing Page Required Functional Content Areas

The landing page must support the following functional content areas. Exact visual design, copy, scroll order, and section names will be determined in the UI/UX design phase.

**F1 — System Introduction**
Communicates what Mazaj+ is: a chat-driven, rule-based nutrition decision-support system. Provides primary navigation action to registration and secondary action to login.

**F2 — How It Works Summary**
Simplified user journey overview: create account → set up profile once → chat → receive personalized guidance.

**F3 — Feature Summary**
Core features visible without registration. Clearly distinguishes Free-tier and paid-tier features.

**F4 — Tier Comparison** *(Source-Confirmed)*

| Feature | Free | Pro | Ultra |
|---|---|---|---|
| Chat-based emotion-based food recommendations | ✓ | ✓ | ✓ |
| Personalized nutrition plan generation | ✓ | ✓ | ✓ |
| Safety validation (health conditions + allergies) | ✓ | ✓ | ✓ |
| Healthy alternative suggestions | ✓ | ✓ | ✓ |
| Daily hydration calculation and reminder support | ✓ | ✓ | ✓ |
| Daily nutrition tips | ✓ | ✓ | ✓ |
| Food image upload and nutritional analysis | ✗ | ✓ | ✓ |
| InBody body composition report upload | ✗ | ✓ | ✓ |
| Daily consumption tracking | ✗ | ✗ | ✓ |
| Weekly nutrition reports | ✗ | ✗ | ✓ |
| Full saved interaction and plan history review | ✗ | ✗ | ✓ |
| Requires paid subscription activation | — | ✓ | ✓ |

**F5 — Advisory and Trust Framing** *(Source-Required)*
Explicit messaging that Mazaj+ is advisory only — it does not diagnose conditions or replace medical professionals. This is a non-negotiable ethical requirement.

**F6 — Registration and Login Actions**
At least one clear path to registration and one to login. Exact wording and placement are UI/UX decisions.

**F7 — Footer**
System name, navigation links to key entry points, brief ethical advisory disclaimer. Exact copy is a UI/UX decision.

### 2.2.4 Landing Page Routing Behavior

| User State | Required Behavior |
|---|---|
| Unauthenticated visitor | Full landing page displayed |
| Authenticated user accesses root URL | Redirect to User Portal |
| Visitor selects registration action | Route to registration entry point |
| Visitor selects login action | Route to login entry point |
| Visitor selects plan/tier information | Route to subscription information screen |

---

## 2.3 Authentication and Access — Module M2

### 2.3.1 Purpose *(Source-Confirmed)*

The Authentication module controls user account creation, credential-based authentication, session management, and tier-based access control enforcement across all modules.

### 2.3.2 Registration

Required registration data *(Source-Confirmed)*:
- User identity: name and email address
- Password
- Acceptance of advisory-only usage terms

On successful registration *(Source-Confirmed)*:
- New user account created with tier = Free
- Subscription record created for Free tier
- User routed to mandatory onboarding flow

Validation:
- Email must be unique in the system
- All required fields must be present before account creation proceeds

> **[Recommended Prototype Assumption]** Password strength requirements (minimum length, character rules) are not defined in the source documents. The implementation team must define and document the policy. See Section 8, Item 4.

### 2.3.3 Login

On successful authentication *(Source-Confirmed)*:
- Session established linked to the authenticated user
- If `onboarding_complete = False` → route to onboarding module
- If `onboarding_complete = True` → route to User Portal dashboard

On failed login:
- System must display an appropriate error message communicating invalid credentials
- User must be allowed to retry

> **[Recommended Prototype Policy]** Account lockout behavior after repeated failed attempts is not specified in the source documents. The prototype may omit lockout functionality. This is an implementation decision. See Section 8, Item 4.

### 2.3.4 Session Management *(Source-Confirmed)*

- Sessions maintained using Django's session framework
- Session persists until user explicitly logs out or session expires
- All protected routes check for an active session before rendering
- Unauthenticated access to any protected route redirects to login entry point
- On logout: session terminated, user returned to public-facing entry point

### 2.3.5 Tier-Based Access Control *(Source-Confirmed)*

| Access Level | Condition | Features Available |
|---|---|---|
| Visitor | No authenticated session | Landing page only |
| Free | Authenticated, tier = Free, onboarding complete | All core features: chat, recommendations, plans, hydration, alternatives, daily tips |
| Pro | Authenticated, tier = Pro, subscription.is_active = True | All Free features + food image upload + InBody upload |
| Ultra | Authenticated, tier = Ultra, subscription.is_active = True | All Pro features + daily tracking + weekly reports + full history review |
| Admin | Authenticated, is_admin = True | Admin Portal only — no access to any user-facing feature |

---

## 2.4 Onboarding and Profile Setup — Module M3

### 2.4.1 Purpose *(Source-Confirmed)*

Collects personal, body-related, and health-related data required for personalized guidance. Appears once — immediately after the first successful login. After completion, stored data is retrieved automatically during all interactions without re-entry.

### 2.4.2 Onboarding Gate *(Source-Confirmed)*

A system flag (`onboarding_complete`) is checked on every post-login redirect. If False, user is routed to the onboarding flow. Access to chat and all other portal modules is blocked until onboarding is complete.

### 2.4.3 Onboarding Data Collection *(Source-Confirmed Fields)*

**Step 1 — Personal Information:** Age · Gender

**Step 2 — Body Measurements:** Height · Weight

**Step 3 — Health Conditions:**
Self-declared health conditions relevant to nutrition safety. User must be able to indicate that no conditions apply. The interface must communicate why this information is being collected.

**Step 4 — Food Allergies:**
Self-declared food allergens. User must be able to indicate that no allergies apply.

**Step 5 — Nutrition Goal:**
One goal selected from: Weight Loss / Weight Maintenance / Weight Gain *(Source-Confirmed)*

**Step 6 — Confirmation:**
Summary of collected data displayed before saving. On confirmation: `onboarding_complete` set to True, all data stored, user routed to dashboard.

> Exact field labels, input types, validation messages, and hint text are UI/UX design decisions.

### 2.4.4 Profile Edit *(Source-Confirmed)*

Users may update their stored profile at any time through the portal. Changes apply to future interactions. Previously generated recommendations and plans are not retroactively modified.

---

## 2.5 User Portal Overview — Module M4

### 2.5.1 Purpose *(Source-Confirmed)*

The authenticated central area. After onboarding, all authenticated users land in the portal. The portal provides structured navigation to all user-facing modules.

### 2.5.2 Portal Navigation Requirements

> **Module Count vs. Navigation Clarity:** The portal navigation covers the authenticated user-facing modules (M5–M10) plus Dashboard, Profile Management, and Logout. Not all 11 system modules appear as navigation items — M1 (public), M2 (auth gates), M3 (onboarding), and M11 (separate Admin Portal) operate outside the user portal navigation. This is by design.

The portal navigation must support access to the following modules. Exact visual layout — sidebar, top bar, tab structure — is a UI/UX design decision.

| Module | Available To | Behavior if Tier Insufficient |
|---|---|---|
| User Dashboard | Free, Pro, Ultra | Always accessible |
| Chat-Based Guidance (M5) | Free, Pro, Ultra | Always accessible (upload within chat is tier-gated separately) |
| Nutrition Plans View (M6) | Free, Pro, Ultra | Always accessible |
| Healthy Alternatives and Hydration (M7) | Free, Pro, Ultra | Always accessible |
| Upload-Based Features (M9) | Pro and Ultra | Must communicate restriction and provide path to upgrade |
| Daily Consumption Log (M8) | Ultra only | Must communicate restriction and provide path to upgrade |
| Weekly Reports (M8) | Ultra only | Must communicate restriction and provide path to upgrade |
| Profile Management | Free, Pro, Ultra | Always accessible |
| Subscription and Tier Management (M10) | Free, Pro, Ultra | Always accessible |
| Logout | All authenticated users | Always accessible |

**Tier-gating requirement:** Restricted navigation items must not be hidden. When selected, they must direct the user to the subscription upgrade module with appropriate messaging. Exact visual treatment is a UI/UX design decision.

### 2.5.3 User Dashboard *(Source-Derived)*

First screen displayed after login and onboarding completion. Must provide summary-level access to the user's key activity context. Visual layout and component labeling are UI/UX design decisions.

Required informational areas:
- Current daily nutrition tip *(Source-Confirmed feature)*
- Access path to the most recent or current chat session
- Summary of hydration status relative to daily target
- BMI and nutrition goal summary drawn from stored profile
- Current tier status with indication of upgrade availability for Free users

---

## 2.6 Chat-Based Guidance — Module M5

### 2.6.1 Chat Interface Functional Requirements *(Source-Confirmed)*

The primary interaction surface of Mazaj+. All guidance interactions occur through this interface.

- Must display a continuous conversation thread between user and system
- User and system messages must be visually distinguishable
- Must provide a free-text input mechanism
- Must support asynchronous, multi-turn interaction
- For Pro and Ultra users: must support food image upload alongside text interaction

Exact visual layout, component positioning, and any additional tools are UI/UX design decisions.

### 2.6.2 Intent Identification *(Source-Confirmed Logic)*

Upon receiving a user message, the system identifies the operation type:
- Emotional context (stress, sadness, fatigue, discomfort) → route to Operation 1: Emotion-Based Recommendation
- Explicit nutrition plan request → route to Operation 2: Nutrition Plan Generation
- Ambiguous input → system asks one clarifying question before routing

Each session operates in one operation mode at a time. Starting a new session resets the mode.

### 2.6.3 Tier-Restricted Chat Capabilities *(Source-Confirmed)*

| Capability | Free | Pro | Ultra |
|---|---|---|---|
| Op1: Emotion-based food recommendations | ✓ | ✓ | ✓ |
| Op2: Personalized nutrition plan generation | ✓ | ✓ | ✓ |
| In-chat food image upload | ✗ | ✓ | ✓ |
| Full chat session history review | Limited* | Limited* | ✓ (all sessions) |

> *Exact history access depth for Free and Pro is `[Requires Team Confirmation]` — see Section 8, Item 8.

**Restriction messaging requirement:** When a Free-tier user's action requires a Pro or Ultra feature, the system must communicate the restriction clearly and provide a path to the subscription module. Exact wording is a UI/UX decision.

### 2.6.4 Exception Handling Requirements *(Structural Clarification)*

The chat module must handle the following exception states:

- **No safe food options:** If safety validation excludes all candidate food items for an Op1 request, the system must communicate clearly that a safe recommendation could not be formed. The system must not present an empty response. It must suggest that the user consult a healthcare professional. *(See Section 6, E1)*
- **Persistent input ambiguity:** If the user fails to clarify their intent after the clarification prompt, the system must exit the current intent gracefully and offer the user an alternative action rather than looping indefinitely. *(See Section 6, E2)*
- **Formatting service unavailable:** If the Gemini API call for response formatting fails, the system must return the unformatted recommendation rather than failing silently or returning an error to the user. *(See Section 6, E3)*

---

## 2.7 Nutrition Plans — Module M6

### 2.7.1 Purpose *(Source-Confirmed)*

Module M6 stores, displays, and provides access to nutrition plans generated through the chat interface (Operation 2). Plan generation occurs within the chat guidance flow; M6 handles the persistent view of generated plans.

### 2.7.2 Plan Content *(Source-Confirmed)*

A generated nutrition plan includes:
- Calculated BMI value *(internal use — not presented as medical classification)*
- Estimated daily calorie target *(based on stored profile data)*
- User's confirmed nutrition goal (weight loss / maintenance / gain)
- Selected food items with balanced meal distribution across the plan period
- Safety validation confirmation *(all plan items have passed health condition and allergy validation)*
- Mandatory advisory disclaimer that the plan is a nutritional guidance tool, not a medical prescription

> **[Recommended Prototype Assumption]** The exact plan period (day / week / other duration) is not specified in the source documents. This is an implementation decision.

### 2.7.3 Plan History Access *(Source-Confirmed Tier Logic)*

| Tier | Plan Access |
|---|---|
| Free | Access to most recent generated plan |
| Pro | Access to most recent generated plan |
| Ultra | Full history of all generated plans |

> *Exact access depth for Free/Pro is `[Requires Team Confirmation]` — see Section 8, Item 8.*

---

## 2.8 Healthy Alternatives and Hydration — Module M7

### 2.8.1 Healthy Alternative Suggestions *(Source-Confirmed)*

Delivered through the chat interface when the user requests a substitute for a specific food, or when the system identifies a boundary-appropriate alternative. The system retrieves alternatives from the `HEALTHY_ALTERNATIVE` database mapping. Safety validation (health conditions, allergies) is applied before presentation. Available to all tiers.

### 2.8.2 Hydration Tracking *(Source-Confirmed Feature)*

Required capabilities:
- Calculation and display of the user's daily water intake target based on stored body measurements
- Recording of water intake amounts logged for the current day
- Quick-log input shortcuts for common intake amounts (exact values to be determined during implementation)
- Custom amount input for user-specified quantities
- Display of hydration progress: current intake vs. daily target
- Reminder configuration: user can enable/disable and configure reminder timing

> **[Recommended Prototype Assumption]** The specific formula for daily water intake target calculation is not defined in the source documents. The implementation team must select, document, and apply a standard formula from nutrition literature. See Section 8, Item 2.

### 2.8.3 Hydration Reminder *(Source-Confirmed Concept)*

The source confirms that daily water intake calculation with reminder support is a system feature.
- Hydration reminders are linked to the daily water intake target
- Users are supported in maintaining daily hydration through reminder functionality

> **[Recommended Prototype Assumption]** The exact reminder frequency, timing, trigger conditions, and delivery mechanism (in-system notification, email, or other channel) are not specified. These are implementation decisions. See Section 8, Item 2.

### 2.8.4 Daily Nutrition Tip *(Source-Confirmed)*

- One tip displayed per day to all users (Free, Pro, Ultra)
- Tips stored in the `DAILY_TIP` database entity
- Tips rotate on a date-based schedule
- Tip content managed by the Administrator through the Admin Portal

---

## 2.9 Tracking and Reports — Module M8 (Ultra Only)

### 2.9.1 Access *(Source-Confirmed)*

All features in this module are available to Ultra users only. Lower-tier users who reach tracking or reporting entry points must receive restriction messaging and a path to the subscription module.

### 2.9.2 Daily Consumption Log *(Source-Confirmed)*

Required capabilities:
- Recording of food items consumed with associated quantity
- Meal-type categorization (exact categories and labels are an implementation decision)
- Automatic calculation of calories from recorded items using stored nutritional values from the internal database
- Comparison of total daily calories against the user's daily target
- Date-based navigation to add and view entries for past days

> **[Structural Clarification]** Optional mood annotation per log entry is a conceptually reasonable extension of the emotional state tracking approach in the proposal. It is not explicitly required in the source documents.

### 2.9.3 Weekly Nutrition Report *(Source-Confirmed)*

Reports must include:
- Date range of the report
- Average daily calorie intake vs. target
- Total hydration logged during the period
- Count of days with recorded log data within the period
- A behavioral trend summary for the period

> **[Recommended Prototype Assumption]** The minimum number of logged days required before a weekly report is generated is not specified. The implementation team must define and document this threshold. See Section 8, Item 5.

> **[Recommended Prototype Assumption]** Specific trend category label names (e.g., "On Track") are not defined in the source. These are implementation decisions.

### 2.9.4 History Access *(Source-Confirmed Tier Logic)*

| Content Type | Free | Pro | Ultra |
|---|---|---|---|
| Chat recommendations | Limited* | Limited* | All sessions |
| Generated nutrition plans | Limited* | Limited* | All plans |
| Daily logs | Not available | Not available | All logs |
| Weekly reports | Not available | Not available | All reports |

> *Exact history access depth for Free and Pro is `[Requires Team Confirmation]` — see Section 8, Item 8. This table represents the structural distinction (Ultra has full access; Free/Pro have limited access) but does not define the exact depth of that limit.

---

## 2.10 Upload-Based Features — Module M9 (Pro and Ultra)

### 2.10.1 Access *(Source-Confirmed)*

Upload-based features are available to Pro and Ultra users. Free users who access the upload entry point must receive restriction messaging and a path to the subscription module.

### 2.10.2 Food Image Upload and Analysis *(Source-Confirmed)*

Flow:
1. User navigates to food image upload interface
2. User uploads a food item image
3. System sends image to Gemini Vision for food identification *(Gemini Vision: image recognition only — does not generate nutritional values)*
4. Gemini Vision returns identified food item name
5. System queries internal food database for nutritional data matching identified food
6. **If match found:** System displays estimated nutritional information (calories, protein, fat) per standard serving, from the internal database. Result includes source attribution and advisory disclaimer.
7. **If no match found:** System displays appropriate messaging that the food was not recognized, with retry guidance. System does not query the database with a null or unrecognized identifier.
8. For Ultra users: option to log the recognized item to daily consumption

> **[Recommended Prototype Assumption]** Accepted file formats and maximum file size limits are not specified in the source documents. These are implementation decisions. See Section 8, Item 7 (file format).

### 2.10.3 InBody Report Upload *(Source-Confirmed Concept)*

1. User navigates to InBody upload interface
2. User uploads InBody body composition report file
3. File stored in the system associated with the user account
4. System confirms that InBody data will be considered in the next nutrition plan request
5. When the user next requests a nutrition plan (Op2), InBody body composition data supplements the stored profile

> **[Requires Team Confirmation]** Whether the system parses InBody report files automatically or requires the user to manually enter key values (body fat percentage, muscle mass) is not specified. This is a critical implementation decision. See Section 8, Item 1.

---

## 2.11 Subscription and Tier Management — Module M10

### 2.11.1 Purpose *(Source-Confirmed)*

Allows authenticated users to view current tier and subscription status, understand features per tier, and initiate an upgrade to Pro or Ultra.

### 2.11.2 Subscription Screen Requirements

Must display:
- The user's current tier
- The user's current subscription activation status

> **[Recommended Prototype Assumption]** Subscription state names (Active, Pending, etc.) are not defined in the source documents. The implementation team should define the subscription state model.

- Tier comparison table (same content as landing page F4)
- Upgrade action paths for non-maximum-tier users

**Subscription Lifecycle Note** *(Structural Clarification)*: In the prototype data model, each user holds exactly one subscription record. Subscription upgrades modify the existing record's tier and activated_at fields rather than creating a new record. Payment records provide the historical audit trail of all upgrade transactions. Subscription expiry is not enforced in the academic prototype scope — the system field is retained for future use. See Section 7.2 for the persisted vs. derived data policy.

### 2.11.3 Upgrade Flow *(Source-Confirmed Steps)*

1. User selects a target upgrade tier
2. System displays confirmation summary with selected tier and associated fee
3. User confirms the upgrade action
4. A payment record is created in the system

> **[Recommended Prototype Assumption]** The depth of payment gateway integration is not specified. The prototype may use nominal or admin-granted payment activation. See Section 8, Item 6.

5. Payment record updated to completion status
6. Subscription record updated: tier = selected, `is_active = True`, `activated_at = now()`
7. User account tier field updated
8. System communicates successful upgrade
9. New tier features immediately available without requiring logout

**Payment Failure Handling:** If payment does not complete successfully, neither the subscription record nor the user account tier field must be updated. The payment record must be set to failed status. See Section 6, E10.

### 2.11.4 Tier Restriction Messaging *(Functional Requirement)*

When a user encounters a restricted feature, the system must:
- Clearly communicate that the feature requires a higher tier
- Provide a direct path to the subscription module
- Not block the user from returning to currently accessible features

Exact wording, visual form, and presentation behavior are UI/UX design decisions.

---

## 2.12 Admin Portal — Module M11

### 2.12.1 Purpose *(Source-Confirmed)*

A separate, restricted interface accessible only to users with `is_admin = True`. The Admin Portal does not share navigation with the user-facing portal. Administrators have **no access** to the chat guidance module, nutrition planning, or any user-facing features. The Admin Portal is strictly an operational management interface.

> **Admin Access Boundary — Governing Rule** *(Recommended Prototype Policy)*: Administrators may access operational metadata, system activity logs, account and tier status, food database content, and subscription/payment records. Administrators must **not** have access to user chat message content, user-generated nutrition plan content, user-declared health conditions or allergy data, or any part of the guidance generation subsystem. This boundary is enforced at the access control layer. See Appendix A — Admin Data Access Matrix for the full per-entity breakdown.

### 2.12.2 Admin Dashboard *(Structural Clarification)*

Operational summary view. Recommended informational areas:
- Total registered users and count by tier (Free / Pro / Ultra)
- Recent registration activity
- Total food items in the database
- Active Pro and Ultra subscription count
- Upload activity overview (if applicable in implementation)

> Exact dashboard metrics and layout are implementation decisions.

### 2.12.3 User Management *(Source-Confirmed)*

**Admin capabilities:**
- View all registered users (name, email, tier, registration date)
- View onboarding completion status *(Structural Clarification)*
- Manually set a user's tier (for prototype access granting)
- Deactivate and reactivate user accounts
- View associated subscription records *(Structural Clarification)*

> **Admin cannot view:** user profile health conditions, food allergies, body measurements, chat content, or any generated guidance. See Appendix A.

### 2.12.4 Food Database Management *(Source-Confirmed)*

- View all food items in the internal database
- Add a new food item (name, calories, protein, fat, carbohydrates, category, mood tag, data source — fields confirmed by ERD)
- Edit an existing food item
- Deactivate a food item (soft-delete — flagged inactive, not permanently removed)
- Search and filter by name, category, mood tag, or data source

### 2.12.5 Healthy Alternatives Management *(Source-Confirmed)*

- View all healthy alternative mappings
- Add a mapping: original food → alternative food + reason
- Edit the reason for an existing mapping
- Delete a mapping

### 2.12.6 Daily Tips Management *(Source-Confirmed)*

- View all daily nutrition tips
- Add a new tip with content text
- Optionally assign a specific display date
- Edit or delete existing tips
- Tips without an assigned date rotate on a date-based schedule

### 2.12.7 Subscription and Payment Management *(Source-Confirmed)*

- View all subscription records (user, tier, activation status)
- View payment records (user, amount, date, status) — **read-only**
- Manually activate or deactivate a subscription (prototype academic access management)
- Adjust a subscription tier (testing and evaluation purposes)

> **Admin cannot modify payment record content** — payment records are read-only for audit purposes.

### 2.12.8 Activity Monitoring *(Structural Clarification)*

- View a log of system events: registrations, login events, plan generation events, upload events, subscription changes
- Filter by date range, event type, or user
- **Event log contains operational metadata only: event type and timestamp.** No message content, no plan content, no health data is ever written to the activity log.

### 2.12.9 Upload Review *(Structural Clarification)*

In the academic prototype, uploaded food images and InBody reports are stored and accessible to administrators for data accuracy review.
- View list of food image uploads: user identifier, timestamp, recognized food label (not image content)
- View list of InBody report uploads: user identifier, timestamp **only — not the report content itself**
- Mark uploads as reviewed
- Admin cannot read InBody file content or food image content

### 2.12.10 Admin Access Boundaries *(Recommended Prototype Policy)*

The following operational boundaries are recommended as good prototype design practice, consistent with the advisory-only scope and standard data minimization principles. These boundaries must be explicitly enforced in the access control layer:

| Admin Action | Permitted? | Notes |
|---|---|---|
| Read user chat message content | **No** | Enforced at access control layer |
| Read user-generated nutrition plan content | **No** | Enforced at access control layer |
| Read user health conditions or allergy data | **No** | Enforced at access control layer |
| Generate or modify nutrition guidance on behalf of users | **No** | Admin has no access to guidance subsystem |
| Read user body measurements (height, weight) | **No** | Part of protected health profile |
| Manage users (tier, account status) | **Yes** | Source-confirmed admin capability |
| Manage food database | **Yes** | Source-confirmed admin capability |
| Manage healthy alternatives | **Yes** | Source-confirmed admin capability |
| Manage daily tips | **Yes** | Source-confirmed admin capability |
| View subscription and payment records | **Yes (read-only for payments)** | Source-confirmed admin capability |
| View operational activity log metadata | **Yes** | Structural Clarification — metadata only |
| View upload metadata (not content) | **Yes** | Structural Clarification |

See Appendix A for the complete per-entity data access matrix.

---

# SECTION 3 — REQUIREMENTS

## 3.1 Document Structure Note

The Mazaj+ requirements were originally documented as a flat list in the system analysis document. This section reorganizes the same requirements by module to enable traceability to implementation, data model, and test cases. No new requirements have been added. The source document text is preserved; the structure is an added analytical layer.

---

## 3.2 Functional Requirements by Module

### Module 1 — Authentication and Access *(Source-Confirmed)*

The system shall:
- Require users to register before accessing any personalized function
- Collect email, name, and password during registration
- Validate email uniqueness at registration time
- Authenticate users via email and password at login
- Maintain an authenticated session throughout the user's active browser session
- Redirect unauthenticated requests to the login entry point
- Redirect authenticated users with incomplete onboarding to the onboarding module
- Enforce tier-based route access control for all Pro and Ultra restricted routes
- Support session termination upon user logout
- Associate all user data with the authenticated user account

### Module 2 — Onboarding and Profile *(Source-Confirmed)*

The system shall:
- Present the onboarding flow to users who have not yet completed it after first login
- Block access to chat and other modules until onboarding is complete
- Collect: age, gender, height, weight, health conditions, food allergies, and nutrition goal
- Store all onboarding data in the user profile database table
- Allow users to edit their profile data after onboarding is complete
- Retrieve the stored profile automatically during all subsequent interactions

### Module 3 — Chat Guidance (Op1: Emotion-Based Recommendation) *(Source-Confirmed)*

The system shall:
- Accept free-text messages from authenticated users in the chat interface
- Identify whether the user's message corresponds to an emotion-based request (Operation 1)
- Request clarification when the user's emotional state is unclear
- Retrieve the user's stored profile from the internal database before generating guidance
- Retrieve relevant food data and recommendation rules from the internal database
- Validate all candidate food items against stored health conditions and exclude conflicting items
- Validate all candidate food items against stored food allergies and exclude allergen-containing items
- Match safe food options to the identified emotional state
- Generate food recommendations with a brief explanation for each
- Format the final response using Gemini API for presentation only — without modifying the recommendation logic
- Store the generated recommendation linked to the authenticated user session
- Handle the case where all candidates are excluded (communicate inability to form safe recommendation)

### Module 4 — Chat Guidance (Op2: Nutrition Plan Generation) *(Source-Confirmed)*

The system shall:
- Identify whether the user's message corresponds to an explicit nutrition plan request (Operation 2)
- Confirm the user's intent before proceeding with plan generation
- Retrieve body data from the stored profile (age, weight, height, gender)
- Retrieve health conditions and nutrition goal from the stored profile
- Optionally incorporate InBody body composition data when available through upload
- Calculate BMI using stored height and weight data
- Estimate daily calorie needs using stored body data and nutrition goal
- Classify body condition internally for planning purposes only — not as a medical diagnosis
- Apply safety validation against health conditions and food allergies before plan generation
- Retrieve plan food items from the internal database based on goal, calorie target, and body condition
- Generate a personalized nutrition plan with balanced meal distribution
- Format the plan using Gemini API for presentation only
- Store the generated nutrition plan linked to the authenticated user account
- Handle the case where safety validation excludes all plan items

### Module 5 — Healthy Alternatives and Hydration *(Source-Confirmed)*

The system shall:
- Provide healthy alternative suggestions when a user requests a substitute for a specific food
- Apply safety validation to alternative suggestions before presenting them
- Calculate the user's daily water intake target using stored body measurements

> **[Recommended Prototype Assumption]** Specific hydration formula is an implementation decision. See Section 8, Item 2.

- Display the daily water target and current logged intake
- Allow users to log water intake amounts
- Support hydration reminders linked to the daily water intake target
- Display a daily nutrition tip on the portal, rotating based on the current date

### Module 6 — Tracking and Reports (Ultra only) *(Source-Confirmed)*

The system shall:
- Restrict daily consumption logging to Ultra users
- Allow Ultra users to log meals, snacks, and beverages with food item, quantity, and meal type
- Calculate total daily calories from logged entries using stored food nutritional values
- Allow Ultra users to annotate log entries with an optional emotional state *(Structural Clarification)*
- Generate a weekly nutrition report when sufficient log data exists for the report period
- Include in weekly reports: average daily calories, total hydration, meal frequency, and a trend summary
- Store weekly reports linked to the authenticated user account
- Allow Ultra users to review the full history of all past chat sessions, nutrition plans, and reports

### Module 7 — Upload-Based Features (Pro and Ultra only) *(Source-Confirmed)*

The system shall:
- Restrict food image upload and InBody report upload to Pro and Ultra users
- Accept food image uploads
- Send uploaded food images to Gemini Vision for food item identification
- Retrieve nutritional data (calories, protein, fat) for the identified food from the internal database
- Display the nutritional estimate with a source label and advisory disclaimer
- Accept InBody report file uploads and store them linked to the user account
- Incorporate InBody data into nutrition plan generation when available

### Module 8 — Subscription and Tier Management *(Source-Confirmed)*

The system shall:
- Display the user's current tier and subscription status
- Present a tier comparison showing Free, Pro, and Ultra features side by side
- Allow Free and Pro users to upgrade their tier through the subscription screen
- Create a payment record on upgrade action
- Update the subscription tier and account tier immediately upon successful payment activation
- Not update tier or subscription records if payment fails
- Display tier-restriction messaging contextually when a lower-tier user encounters a restricted feature
- Allow administrators to manually adjust subscription tier and status

### Module 9 — Admin Portal *(Source-Confirmed)*

The system shall:
- Restrict admin portal access to users with administrator role (`is_admin = True`)
- Display a system summary dashboard including user counts by tier and recent activity
- Allow administrators to view, search, and filter all registered users
- Allow administrators to manually set a user's tier for prototype access management
- Allow administrators to add, edit, and deactivate food items in the internal database
- Allow administrators to add, edit, and delete healthy alternative mappings
- Allow administrators to add, edit, and delete daily nutrition tips
- Allow administrators to view, activate, and deactivate subscription records
- Allow administrators to view a system activity log filtered by event type and date
- **Prevent administrators from accessing user chat history, nutrition plan content, health condition data, allergy data, or body measurement data**

---

## 3.3 Non-Functional Requirements

### NFR1 — Usability *(Source-Confirmed)*

The system shall present all user-facing interactions in a simple, familiar chat-based interface requiring no specialized technical knowledge. All navigation items shall be clearly labeled. Error messages shall be written in plain, non-technical language.

> **[Recommended Prototype Assumption]** A target completion time for the onboarding flow is not specified in the source documents. A short, well-structured onboarding experience is a design quality goal; exact timing targets should be validated through user testing.

### NFR2 — Responsiveness *(Source-Confirmed)*

The system shall respond to user chat messages within an acceptable time window that maintains natural conversational flow. Database queries for profile retrieval and food matching shall not introduce noticeable lag. The web interface shall render correctly on both desktop and mobile browser viewports.

### NFR3 — Security *(Source-Confirmed)*

User passwords shall be stored using a secure hashing method. All authenticated routes shall be protected by session verification. User health data, allergy data, and nutrition data shall be stored in the internal database and not transmitted to external services. Gemini API and Gemini Vision receive only the minimum necessary input (message text and food images respectively) and do not receive personally identifiable user profile data.

### NFR4 — Data Privacy *(Source-Confirmed)*

All user data shall be used exclusively for system functionality within the Mazaj+ prototype. No data shall be shared with third parties. Data collected during onboarding and interaction is used solely for generating personalized nutrition guidance and supporting system evaluation.

### NFR5 — Reliability *(Source-Confirmed)*

The system shall operate consistently during academic testing and demonstration without data loss or session corruption. Database operations shall be transactional where data integrity requires it. When an exception occurs (no safe options, Gemini API unavailable), the system shall return a safe default response rather than an error or unsafe recommendation.

### NFR6 — Consistency *(Source-Confirmed)*

The system shall produce consistent guidance for the same user profile and input across separate sessions. Rule-based decision logic shall not produce conflicting recommendations for identical inputs.

### NFR7 — Ethical Compliance *(Source-Confirmed)*

The system shall never present nutrition guidance as a medical diagnosis. All generated content shall include implicit or explicit advisory framing. The system shall redirect any request for medical diagnosis or treatment to appropriate advisory language within system scope.

### NFR8 — Scalability *(Source-Confirmed)*

The system shall support concurrent use by multiple users during academic testing and evaluation. The database structure and Django backend shall support scalability appropriate for a graduation project demonstration.

---

# SECTION 4 — BUSINESS RULES AND TIER LOGIC

## 4.1 Feature Entitlement Matrix *(Source-Confirmed)*

| Feature | Free | Pro | Ultra |
|---|---|---|---|
| Register and log in | ✓ | ✓ | ✓ |
| Complete onboarding | ✓ | ✓ | ✓ |
| Manage personal profile | ✓ | ✓ | ✓ |
| Emotion-based food recommendation (Op1) | ✓ | ✓ | ✓ |
| Personalized nutrition plan generation (Op2) | ✓ | ✓ | ✓ |
| Health and allergy safety validation | ✓ | ✓ | ✓ |
| Healthy alternative suggestions | ✓ | ✓ | ✓ |
| Daily water intake calculation | ✓ | ✓ | ✓ |
| Water intake reminders | ✓ | ✓ | ✓ |
| Daily nutrition tip | ✓ | ✓ | ✓ |
| Chat session history (limited access) | ✓ | ✓ | ✓ |
| Nutrition plan access (limited access) | ✓ | ✓ | ✓ |
| Food image upload and nutritional analysis | ✗ | ✓ | ✓ |
| InBody body composition report upload | ✗ | ✓ | ✓ |
| Daily consumption tracking | ✗ | ✗ | ✓ |
| Weekly nutrition report generation | ✗ | ✗ | ✓ |
| Full chat history review (all sessions) | ✗ | ✗ | ✓ |
| Full nutrition plan history (all plans) | ✗ | ✗ | ✓ |
| Full daily log history | ✗ | ✗ | ✓ |
| Admin portal access | ✗ | ✗ | ✗ (Admin role only) |

---

## 4.2 Access Enforcement Rules *(Source-Confirmed)*

1. All protected routes require an authenticated session. Unauthenticated requests are redirected to the login entry point.
2. All routes except the public landing page, login, and registration require `onboarding_complete = True`. Incomplete profiles are redirected to the onboarding module.
3. Pro-restricted routes check: `user.tier IN ('Pro', 'Ultra') AND subscription.is_active = True`.
4. Ultra-restricted routes check: `user.tier = 'Ultra' AND subscription.is_active = True`.
5. Admin routes check: `user.is_admin = True`. Non-admin authenticated users are redirected to the user portal.
6. The rule engine validates safety constraints on every recommendation and plan generation request, regardless of tier.

> Rules reference routing behavior intent. Exact route names and redirect paths are implementation decisions.

---

## 4.3 Tier Restriction Behavior *(Functional — UI/UX detail deferred)*

| Context | Required Behavior |
|---|---|
| In the chat interface | System communicates the restriction within chat and provides a path to upgrade |
| In portal navigation | Restricted items must not be hidden — they must communicate tier restriction and route toward upgrade |
| On a restricted page or section | System communicates restriction and provides path to upgrade |
| Via direct URL access to restricted route | System redirects to subscription module with appropriate messaging |

> Exact visual treatment (overlay, muted appearance, icon type, message wording) in all contexts above are UI/UX design decisions.

---

## 4.4 Subscription Activation Logic *(Source-Confirmed + Assumption)*

1. User navigates to Subscription screen
2. User selects target tier (Pro or Ultra)
3. System displays plan summary with selected tier and associated fee
4. User confirms the upgrade action
5. A payment record is created in the system with initial status

> **[Recommended Prototype Assumption]** Whether the academic prototype uses a real payment gateway, a symbolic nominal amount, or admin-granted access activation is not specified. See Section 8, Item 6.

6. Payment record updated to completion status
7. Subscription record updated: tier = selected, `is_active = True`, `activated_at = now()`
8. User account tier field updated
9. New features become available immediately without requiring logout
10. On payment failure: no tier or subscription update occurs. See Section 6, E10.

---

## 4.5 Upgrade and Downgrade Rules *(Source-Confirmed + Structural Clarification)*

**Upgrade:** Handled through the Subscription screen. Activates immediately on payment confirmation.

**Downgrade:** In the academic prototype, downgrades are not self-service. Managed by the administrator as needed for prototype testing. *(Structural Clarification — reasonable academic scope.)*

**Tier Expiry:** Not enforced in the academic prototype scope. Subscriptions do not expire automatically. `expires_at` field is retained in the data model for future production use. Administrator can manually deactivate when needed.

---

## 4.6 Rule Engine Decision Tables *(Source-Derived — New Section)*

The Mazaj+ system is explicitly rule-based. The following decision tables formalize the logic applied by the rule engine during operation. These are the decision rules implemented in code — they must not be changed without team review.

### Table A — Op1 Intent Routing

| Input Signal Detected | Emotional State Clear? | Routing Output |
|---|---|---|
| Emotional keyword or context present | Yes | Route to Op1: retrieve foods by mood tag |
| Emotional keyword or context present | No | Send clarification request to user |
| Clarification provided | Yes | Route to Op1: retrieve foods by mood tag |
| Clarification provided | No (still ambiguous) | If threshold exceeded: graceful exit. Otherwise: request clarification again. |
| Op2 keyword detected (plan/nutrition plan) | N/A | Route to Op2: request intent confirmation |
| Neither emotional nor plan signal | N/A | Send clarification request to user |

### Table B — Op1 Safety Validation

The rule engine applies the following validation logic to every candidate food item before it is included in a recommendation.

| Candidate Food | Conflicts with a Stored Health Condition? | Contains a Stored Allergen? | Result |
|---|---|---|---|
| Any food item | No | No | **Include** in recommendation set |
| Any food item | Yes | No | **Exclude** — health condition conflict |
| Any food item | No | Yes | **Exclude** — allergen conflict |
| Any food item | Yes | Yes | **Exclude** — both conflicts |
| All candidates | (any) | (any) | All excluded → **Trigger E1 exception: No safe options response** |

> Gemini API is used after this table is applied — it formats the approved recommendation set. It does not modify or override these rules.

### Table C — Op2 Body Condition Classification (Internal Planning Use Only)

This classification is computed internally to guide food item selection for the nutrition plan. It is **never presented to the user as a medical assessment or diagnosis**.

| BMI Value | Internal Body Condition Label | Planning Application |
|---|---|---|
| < 18.5 | Below healthy range | Plan prioritizes caloric increase; weight gain foods selected |
| 18.5 – 24.9 | Within healthy range | Plan aligned to stated goal (loss / maintenance / gain) |
| 25.0 – 29.9 | Above healthy range | Plan prioritizes moderate caloric reduction if goal is loss |
| ≥ 30.0 | Significantly above range | Plan applies conservative caloric reduction; professional consultation disclaimer included |

> **[Recommended Prototype Assumption]** BMI range boundaries and classification labels are derived from standard nutrition literature. The implementation team must confirm the exact ranges and labels applied. These boundaries must not be communicated to the user as diagnostic categories.

### Table D — Safety Validation for Op2 Plan Items

Same logic as Table B applies to plan food items, not individual recommendations.

| Plan Item | Conflicts with Stored Condition? | Is Stored Allergen? | Result |
|---|---|---|---|
| Any plan item | No | No | **Include** in plan |
| Any plan item | Yes | No | **Exclude** |
| Any plan item | No | Yes | **Exclude** |
| All plan items | (any) | (any) | All excluded → **Trigger E6 exception: Cannot generate safe plan** |

---

# SECTION 5 — USER JOURNEYS AND OPERATIONAL FLOWS

> **Framing Note:** The user journeys below are operational flows derived from the documented system concept. They represent intended behavioral sequences at a functional level — not finalized UX scripts. Exact interface wording, visual behavior, navigation labels, and interaction design will be determined in the UI/UX design phase.

## 5.1 Visitor Journey *(Source-Confirmed Flow)*

**Trigger:** A person accesses the Mazaj+ URL without an account.

1. Visitor arrives at the landing page (public — no authentication required)
2. Visitor views system information: description, features, tier comparison, advisory framing
3. Visitor selects the registration action
4. Registration entry point displayed
5. Visitor completes registration → account created with Free tier
6. User is routed to the mandatory onboarding flow

---

## 5.2 Registration and Onboarding Journey *(Source-Confirmed)*

**Trigger:** New user has just registered.

1. Onboarding module displayed automatically after registration
2. User completes Step 1: Personal Information (age, gender)
3. User completes Step 2: Body Measurements (height, weight)
4. User completes Step 3: Health Conditions (multi-entry or "None")
5. User completes Step 4: Food Allergies (multi-entry or "None")
6. User completes Step 5: Nutrition Goal (loss / maintenance / gain)
7. User confirms summary on Step 6
8. `onboarding_complete` set to True, profile saved
9. User lands on User Portal dashboard for the first time

---

## 5.3 Free User Chat Flow — Op1: Emotion-Based *(Source-Confirmed)*

**Trigger:** Free user expresses an emotional state through chat.

1. User opens Chat interface
2. Types a message expressing an emotional state (e.g., feeling stressed, sad, tired)
3. System identifies intent as EMOTION_BASED (see Table A — Intent Routing)
4. If emotional state unclear → system asks one clarifying question
5. Emotional state confirmed
6. System retrieves user profile (conditions, allergies, goals) from internal database
7. System retrieves food items tagged for the confirmed emotional state from internal database
8. Rule engine validates against health conditions → excludes conflicting items (Table B)
9. Rule engine validates against allergies → excludes allergen items (Table B)
10. If no safe items remain → Exception E1 triggered
11. System generates food recommendations with brief explanations for each

> **[Recommended Prototype Assumption]** The number of recommendations per response is not specified in the source. See Section 8, Item 3.

12. Gemini API formats response into natural conversational language (formatting only)
13. Response displayed in chat thread
14. Recommendation stored in database linked to this session
15. User reads recommendations, may ask follow-up within same session
16. Session stored on close

---

## 5.4 Free User Chat Flow — Op2: Nutrition Plan *(Source-Confirmed)*

**Trigger:** Free user requests a nutrition plan.

1. User opens Chat
2. Types a message requesting a nutrition plan
3. System identifies intent as NUTRITION_PLAN (see Table A — Intent Routing)
4. System asks user to confirm intent before proceeding
5. User confirms
6. System retrieves profile: age, weight, height, gender, conditions, allergies, goal
7. If InBody body composition data exists from a prior upload → incorporated into planning
8. BMI calculated internally (see Table C — Body Condition Classification)
9. Daily calorie target estimated
10. Body condition classified internally (planning use only — not communicated as diagnosis)
11. Safety validation applied to plan food items (Table D)
12. If all plan items excluded → Exception E6 triggered
13. Plan food items retrieved from database
14. Personalized nutrition plan built
15. Gemini API formats plan text (formatting only)
16. Plan displayed in chat
17. Plan stored in database
18. User can navigate to Nutrition Plans view to see the plan again

---

## 5.5 Upgrade to Pro Flow *(Source-Confirmed)*

**Trigger:** Free user attempts to use a Pro/Ultra restricted feature.

1. User attempts an action requiring Pro/Ultra tier
2. System communicates restriction clearly and provides path to subscription screen
3. User navigates to Subscription and Tier Management screen
4. Screen shows current tier, tier comparison, and upgrade options
5. User selects Pro upgrade
6. System presents confirmation: selected tier and associated fee
7. User confirms
8. Payment initiated

> **[Recommended Prototype Assumption]** Payment processing method is not specified. See Section 8, Item 6.

9. On success: subscription record updated, account tier updated to Pro
10. System communicates successful upgrade
11. New Pro features immediately available
12. On failure: no record updated. Exception E10 applies.

---

## 5.6 Pro Upload Feature Flow *(Source-Confirmed)*

**Trigger:** Pro user uploads a food photo.

1. User navigates to upload entry point
2. User selects a food image file
3. File validated against format and size constraints

> **[Recommended Prototype Assumption]** Accepted file format and size limits are implementation decisions. See Section 8, Item 7.

4. Image uploaded to system
5. System sends image to Gemini Vision for food identification (recognition only)
6. Gemini Vision returns identified food item label
7. System queries internal food database for nutritional data matching identified food
8. If match found: nutritional summary displayed (calories, protein, fat from internal database) with source label and advisory disclaimer
9. If no match found: Exception E5 triggered — system communicates food not in database
10. Result stored as upload record linked to user account
11. Ultra users offered option to log identified item to daily consumption

---

## 5.7 Ultra Tracking and Reporting Flow *(Source-Confirmed)*

**Trigger:** Ultra user tracks daily intake over a period and receives a weekly report.

1. User opens Daily Log entry point
2. User selects the current date
3. User adds a meal entry: selects a food item, specifies quantity, selects meal type
4. System calculates calories for the entry from stored nutritional data
5. Running daily calorie total updated
6. User adds additional entries throughout the day
7. User logs water intake for the day using the hydration tracking feature
8. Process repeats across multiple days
9. At end of the tracking period, system evaluates whether sufficient log data exists to generate a report

> **[Recommended Prototype Assumption]** Minimum logging threshold for report generation is an implementation decision. See Section 8, Item 5.

10. If threshold met: weekly report generated and stored
11. If threshold not met: Exception E8 triggered — user informed insufficient data exists
12. User opens Weekly Reports section
13. Weekly report displays: date range, average daily calories vs. target, total hydration, days logged, trend summary
14. User may initiate new chat for follow-up nutrition guidance

---

## 5.8 Admin Operational Flows *(Source-Derived)*

### Admin Flow 1 — Granting Upgrade Access

1. Admin logs into admin portal
2. Navigates to User Management
3. Searches for user by email
4. Opens user detail (name, email, tier, registration date, subscription status — no health data)
5. Changes tier from Free to Pro
6. Confirms change
7. System updates subscription and tier records
8. User receives new features on next action

### Admin Flow 2 — Adding a Food Item

1. Admin navigates to Food Database Management
2. Selects add food item
3. Enters: name, calories per 100g, protein, fat, carbohydrates, category, mood tag, data source
4. Confirms save
5. Food item immediately available for recommendation and plan generation

### Admin Flow 3 — Managing Daily Tips

1. Admin navigates to Daily Tips
2. Adds a new tip with content text
3. Optionally assigns a specific display date
4. Saves the tip
5. Tip appears in rotation or on assigned date on user dashboards

### Admin Flow 4 — Reviewing Upload Activity

1. Admin navigates to Upload Review
2. Views list of recent food image uploads: user identifier, upload date, recognized food label
3. Marks uploads as reviewed
4. **Admin does not view image content or detailed nutritional analysis content** — operational metadata only

### 5.9 Exception Journey — No Safe Recommendation *(Structural Clarification)*

**Trigger:** Rule engine excludes all candidate food items during an Op1 request.

1. User sends a message expressing an emotional state
2. System retrieves profile and candidate food items
3. Rule engine applies validation — all candidates excluded (health condition conflicts and/or allergen conflicts)
4. **System does not present an empty response or a generic error**
5. System communicates to the user: a safe food recommendation could not be formed based on the current profile
6. System recommends the user consult a healthcare professional for personalized guidance
7. System offers the user the option to update their profile or ask a different question
8. Session remains active — user is not disconnected

---

# SECTION 6 — EXCEPTION AND FALLBACK CATALOG *(New Section — Structural Clarification)*

This section catalogs the exception states that the Mazaj+ system must handle. All exceptions have defined system responses. The system must never fail silently, present an empty response, or return a generic error when a known exception state is encountered.

| ID | Exception Scenario | Trigger Condition | Required System Behavior |
|---|---|---|---|
| **E1** | No safe food options — Op1 | Rule engine excludes all candidate foods after health condition and allergy validation | Communicate clearly that a safe recommendation could not be formed. Do not present empty response. Suggest consulting a healthcare professional. Offer to update profile or ask a different question. |
| **E2** | Persistent input ambiguity | User fails to clarify emotional state or intent after the clarification prompt, and the system's clarification threshold is reached | Gracefully exit the current intent. Offer the user the option to start a new question or select a different action. Do not loop indefinitely. |
| **E3** | Formatting service unavailable | Gemini API call for response formatting fails or times out | Return the unformatted recommendation or plan text to the user rather than failing silently. Do not display an error that reveals internal system details. |
| **E4** | Food not recognized by vision | Gemini Vision returns null, low-confidence, or no-match result for an uploaded food image | Display appropriate messaging that the food item could not be identified. Provide retry guidance. Do not query the database with a null or unrecognized food identifier. |
| **E5** | No database match after recognition | Gemini Vision identifies a food label, but no matching entry exists in the internal nutrition database | Communicate that nutritional data is not currently available for this food. Do not display partial data or a zero-value result. |
| **E6** | No safe plan items — Op2 | Safety validation excludes all potential plan food items during Op2 generation | Communicate that a safe personalized nutrition plan could not be generated based on the current profile. Strongly recommend professional consultation. Do not display an empty plan. |
| **E7** | Incomplete onboarding submission | User attempts to proceed in the onboarding flow with required fields missing | System must prevent progression. All five onboarding data collection steps are mandatory. Display a clear indication of which information is missing. |
| **E8** | Insufficient weekly tracking data | At the end of a tracking period, fewer than the team-defined minimum log days exist for report generation | Notify the Ultra user that insufficient log data exists for a report. Specify how many days were logged and what the minimum threshold is. Do not generate a partial report. |
| **E9** | InBody upload parsing failure | Uploaded InBody report file cannot be parsed, is unrecognized, or is incomplete | Communicate the error clearly. Do not use partial data in nutrition plan generation. Allow the user to retry with a different file. |
| **E10** | Payment failure during upgrade | Payment step does not complete successfully during a tier upgrade attempt | Subscription tier and account tier must not be updated. Payment record must be set to failed status. Communicate clearly to the user that the upgrade did not complete. Provide retry guidance. |

---

# SECTION 7 — DATA GOVERNANCE AND SYSTEM DATA POLICY *(New Section)*

## 7.1 Food Data Sources and Preparation *(Source-Confirmed + Structural Clarification)*

The Mazaj+ internal nutrition database is pre-populated from three external data sources selected for their reliability, breadth, and academic accessibility.

### 7.1.1 Data Sources *(Source-Confirmed)*

| Source | Type | Primary Use |
|---|---|---|
| **USDA FoodData Central** | Government nutrition database | Baseline nutritional values (calories, protein, fat, carbohydrates per standard serving) |
| **OpenFoodFacts** | Community-maintained open database | Supplementary food items not covered by USDA; processed and packaged food data |
| **Kaggle Nutrition Datasets** | Curated academic/research datasets | Regional food items; mood-food correlation datasets used to assign emotional mood tags |

> All three sources are used under their respective academic and open-data licensing terms. No commercial use is made of this data in the prototype context.

### 7.1.2 Data Standardization Process *(Structural Clarification)*

Before loading into the internal `FOOD_ITEM` table, all source data undergoes the following preparation:

**Field Mapping:**
Each source schema is mapped to the internal `FOOD_ITEM` fields:
- `name` — standardized to English (region-agnostic)
- `calories` — normalized to kcal per 100g unit
- `protein_g`, `fat_g`, `carbohydrates_g` — normalized to grams per 100g
- `category` — mapped to an internal category taxonomy (e.g., Grain, Protein, Vegetable, Fruit, Dairy, Beverage)
- `data_source` — attributed to the source dataset (USDA / OpenFoodFacts / Kaggle)

**Source Priority for Conflicts:**
When the same food item exists in multiple sources with different nutritional values, the following priority order is applied:
1. USDA FoodData Central (highest authority — government-validated)
2. Kaggle curated datasets (academic, well-structured)
3. OpenFoodFacts (community-maintained — used to fill gaps)

**Data Cleaning:**
- Missing required fields (calories, protein, fat): item excluded from load
- Duplicate food names: deduplicated; highest-priority source value retained
- Inconsistent units: converted to the standardized unit before storage
- Implausible nutrient values (e.g., caloric values outside expected range): flagged and reviewed before inclusion

### 7.1.3 Mood Tag Assignment *(Structural Clarification)*

Each food item in the `FOOD_ITEM` table carries a `mood_tag` field that links it to one or more emotional states (e.g., stress, sadness, fatigue). This is the basis for Op1 (emotion-based food recommendation).

Mood tag assignment process:
- Tags are derived from reviewed nutrition literature connecting dietary patterns to emotional states and mood regulation
- The Kaggle datasets provided an initial mapping framework
- The project team reviewed and curated the final tag assignments
- Tags are stored as a string field; the rule engine matches emotional state input to tagged food items

> **[Requires Team Confirmation]** The exact set of emotional state categories supported and the complete mood-tag assignment for each food item must be confirmed and documented before system completion. See Section 8, Item 9.

### 7.1.4 Dataset Refresh Strategy *(Structural Clarification)*

The food database is treated as a **static, pre-loaded dataset** in the academic prototype. The database is populated once before system launch and is not automatically synchronized with external sources during operation. Administrators can manually add, edit, or deactivate individual food items through the Admin Portal during the prototype's operational period.

---

## 7.2 Persisted vs. Derived Data Policy *(New Subsection — Structural Clarification)*

Mazaj+ stores several fields whose values are calculable from other stored data. The following policy governs these fields consistently across the system.

**Policy Statement:** Fields marked as "stored snapshot" are computed at the time of record creation and stored permanently. They are not recomputed from base data after the fact. Changes to underlying data (e.g., updated food calorie values, updated user weight) do not retroactively modify stored log entries, plan records, or report values. This preserves historical accuracy — the record reflects the values at the time the activity occurred.

| Field | Entity | Classification | Storage Decision | Derivation Rule |
|---|---|---|---|---|
| `bmi` (in USER_PROFILE context) | USER_PROFILE | **Derived — computed at use time** | Not stored in USER_PROFILE | `weight_kg ÷ (height_cm ÷ 100)²` |
| `bmi` | NUTRITION_PLAN | **Stored historical snapshot** | Stored at plan creation time | Same formula — represents BMI at plan generation |
| `daily_calories` | NUTRITION_PLAN | **Stored historical snapshot** | Stored at plan creation time | Estimated from profile data at plan generation |
| `daily_target_liters` | WATER_INTAKE | **Stored snapshot at log creation** | Stored per daily record | Computed from profile at insert; hydration formula is `[Recommended Prototype Assumption]` |
| `total_calories` | DAILY_CONSUMPTION_LOG | **Stored snapshot at insert** | Stored at log entry creation | `quantity × FOOD_ITEM.calories` at insert time |
| `avg_daily_calories` | WEEKLY_REPORT | **Stored at report generation** | Stored when report is generated | Sum of daily log calories ÷ logged days in period |
| `total_hydration_liters` | WEEKLY_REPORT | **Stored at report generation** | Stored when report is generated | Sum of WATER_INTAKE.logged_liters for the report week |

> **`FOOD_RECOMMENDATION.user_id` Note:** The `user_id` field in `FOOD_RECOMMENDATION` is a stored direct foreign key to USER, in addition to the `session_id` link. This is a **deliberate performance-oriented denormalization** — it provides direct user-level recommendation queries without requiring a JOIN through CHAT_SESSION. It is not a modeling error.

> **`DAILY_TIP` Note:** `DAILY_TIP` is a standalone content entity. Its relationship to users is implicit — the system queries for the current day's tip through date-based logic. No user-level foreign key is required. This is by design.

---

# SECTION 8 — ITEMS REQUIRING TEAM CONFIRMATION

The following items cannot be finalized from the available source documents. They must be resolved by the team before the corresponding implementation phase begins. Safe defaults are noted where applicable.

| # | Item | Reason | Safe Default if Not Confirmed |
|---|---|---|---|
| 1 | InBody report parsing scope | Not specified whether system parses files automatically or requires manual entry of key values | Document as: "stores file; requires manual entry of body fat percentage and muscle mass in prototype" |
| 2 | Water reminder delivery mechanism and frequency | Email, browser notification, or in-system message — not confirmed | Document as: "in-system message shown on next login or portal visit" |
| 3 | Number of food recommendations per Op1 response | Source documents do not specify count | Default: 3 to 5 recommendations per response |
| 4 | Password strength requirements | Not detailed in source documents | Default: minimum 8 characters |
| 5 | Weekly report generation threshold (minimum log days) | Not specified in source documents | Default: report generated if 3 or more days of log data exist in the 7-day period |
| 6 | Pro/Ultra subscription fee amount and payment gateway depth | Source says "symbolic or minimal fee" — amount and mechanism not stated | Default: admin-granted access in prototype; fee documented as TBD |
| 7 | Accepted file formats for food image upload | Not specified in source documents | Default: JPEG and PNG |
| 8 | History access depth for Free and Pro users | Source confirms Ultra has full access; depth for Free/Pro is not specified | Default: most recent session and most recent plan only |
| 9 | Emotional state categories and mood tag set | Tag taxonomy not fully documented in source | Team must define and document the complete set |
| 10 | Admin portal URL structure | Implementation: separate app, URL prefix, etc. | Default: separate URL prefix distinct from Django default admin |

---

# SECTION 9 — APPENDICES

---

## Appendix A — Admin Data Access Matrix *(New — Structural Clarification)*

> This matrix defines the permitted and prohibited data access for the Administrator role. It is the authoritative reference for implementing admin-level access control.

| Data Entity | Admin: Read | Admin: Write | Admin: Delete | Notes |
|---|---|---|---|---|
| USER (name, email, tier, account status) | ✓ | Tier + status only | Deactivate only (soft) | Source-confirmed admin capability |
| USER_PROFILE (age, gender, height, weight, nutrition goal) | **✗** | **✗** | **✗** | Recommended Prototype Policy — sensitive body data |
| HEALTH_CONDITION | **✗** | **✗** | **✗** | Recommended Prototype Policy — sensitive health data |
| ALLERGY | **✗** | **✗** | **✗** | Recommended Prototype Policy — sensitive health data |
| CHAT_SESSION (metadata: type, timestamp only) | ✓ (count/type for monitoring) | **✗** | **✗** | Structural Clarification — no content access |
| CHAT_MESSAGE (message content) | **✗** | **✗** | **✗** | Recommended Prototype Policy |
| FOOD_RECOMMENDATION (recommendation content) | **✗** | **✗** | **✗** | Recommended Prototype Policy |
| RECOMMENDATION_ITEM (food + explanation content) | **✗** | **✗** | **✗** | Recommended Prototype Policy |
| NUTRITION_PLAN (plan content) | **✗** | **✗** | **✗** | Recommended Prototype Policy |
| FOOD_ITEM | ✓ | ✓ (add/edit) | Soft-delete only | Source-confirmed admin capability |
| HEALTHY_ALTERNATIVE | ✓ | ✓ | ✓ | Source-confirmed admin capability |
| DAILY_TIP | ✓ | ✓ | ✓ | Source-confirmed admin capability |
| WATER_INTAKE | **✗** | **✗** | **✗** | Structural Clarification — user-only data |
| DAILY_CONSUMPTION_LOG | **✗** | **✗** | **✗** | Structural Clarification — user-only data |
| WEEKLY_REPORT | **✗** | **✗** | **✗** | Structural Clarification — user-only data |
| FOOD_IMAGE_UPLOAD (metadata: timestamp + recognized label only) | ✓ (metadata only) | **✗** | **✗** | Structural Clarification — no image content |
| INBODY_REPORT (timestamp only) | ✓ (timestamp only) | **✗** | **✗** | Structural Clarification — no file content |
| SUBSCRIPTION | ✓ | Tier + is_active | **✗** | Source-confirmed admin capability |
| PAYMENT_RECORD | ✓ (read-only) | **✗** | **✗** | Structural Clarification — audit trail only |

---

## Appendix B — Module-to-Diagram Traceability *(New — Structural Clarification)*

> This matrix identifies which diagram family covers each system module. Use this to verify diagram completeness and identify coverage gaps.

| Module | Use Case Diagram | Activity Diagrams | Sequence Diagrams | Class Diagram | ERD / EER | Supplementary (Adobe Scan) |
|---|---|---|---|---|---|---|
| M1 — Landing Page | Visitor actor *(to be added)* | — | — | — | — | Sitemap (Page 16) |
| M2 — Authentication | UC1 | — | Registration (Pages 1, 3) | User | USER, SUBSCRIPTION | Pages 1, 3 |
| M3 — Onboarding | UC2, UC3 | — | Registration continuation | UserProfile, HealthCondition, Allergy | USER_PROFILE, HEALTH_CONDITION, ALLERGY | Page 1 |
| M4 — Portal Shell | UC3 | — | — | — | — | Sitemap (Page 16) |
| M5 — Chat Guidance | UC4, UC5, UC6 | Op1 (D2), Op2 (D3) | Op1 (D4), Op2 (D5) | ChatSession, ChatMessage, FoodRecommendation, NutritionPlan, RuleEngine | CHAT_SESSION, CHAT_MESSAGE, FOOD_RECOMMENDATION, NUTRITION_PLAN | Pages 2, 4 |
| M6 — Nutrition Plans | UC6 | Op2 (D3) | Op2 (D5) | NutritionPlan | NUTRITION_PLAN | Page 4 |
| M7 — Alternatives + Hydration | UC7, UC8, UC9 | — | — | HealthyAlternative, WaterIntake, DailyTip | HEALTHY_ALTERNATIVE, WATER_INTAKE, DAILY_TIP | — |
| M8 — Tracking + Reports | UC13, UC14, UC15 | *(gap — no dedicated activity diagram)* | *(gap — no dedicated sequence)* | DailyConsumptionLog, WeeklyReport | DAILY_CONSUMPTION_LOG, WEEKLY_REPORT | — |
| M9 — Upload Features | UC10, UC11 | *(gap — no dedicated activity diagram)* | Upload Sequence (Page 5) | FoodImageUpload, InBodyReport | FOOD_IMAGE_UPLOAD, INBODY_REPORT | Page 5 |
| M10 — Subscription | UC12, UC16 | *(gap — subscription activity)* | Subscription Sequence (Page 3) | Subscription, PaymentRecord | SUBSCRIPTION, PAYMENT_RECORD | Page 3 |
| M11 — Admin Portal | UC17–UC20 | *(gap — no dedicated admin activity)* | Admin Sequences (Pages 6, 7) | *(gap — no AdminPortal class)* | All admin-writeable entities | Pages 6, 7, 15 |

**Diagram Coverage Gaps Identified:**
- M8 (Tracking + Reports): No dedicated activity diagram or sequence diagram exists in the Mermaid set
- M9 (Uploads): No activity diagram in Mermaid set
- M10 (Subscription): No Mermaid sequence diagram for subscription activation flow
- M11 (Admin): No Mermaid activity diagram; no AdminPortal class in class diagram
- M1 (Landing Page): No Visitor actor in use case diagram *(correction pending)*

---

## Appendix C — Feature-Tier-Requirement Traceability *(New — Structural Clarification)*

> This matrix connects key functional requirements to their tier enforcement rule and the primary data entity they operate on.

| Requirement | Module | Tier | Enforcement Rule | Primary ERD Entity |
|---|---|---|---|---|
| User registration and account creation | M2 Auth | All (pre-auth) | Public route — tier assigned at creation | USER |
| Mandatory onboarding completion before portal access | M3 Onboarding | All authenticated | `onboarding_complete = True` | USER_PROFILE |
| Emotion-based food recommendation (Op1) | M5 Chat | Free → Ultra | Authenticated + onboarding complete | FOOD_RECOMMENDATION, RECOMMENDATION_ITEM |
| Health condition safety validation | M5 Chat | All | Applied on every recommendation — no tier gate | HEALTH_CONDITION |
| Allergy safety validation | M5 Chat | All | Applied on every recommendation — no tier gate | ALLERGY |
| Personalized nutrition plan generation (Op2) | M5/M6 Chat | Free → Ultra | Authenticated + onboarding complete | NUTRITION_PLAN |
| Healthy alternative suggestions | M7 | Free → Ultra | Authenticated + onboarding complete | HEALTHY_ALTERNATIVE |
| Daily water intake calculation and reminders | M7 | Free → Ultra | Authenticated + onboarding complete | WATER_INTAKE |
| Daily nutrition tip display | M7 | Free → Ultra | Authenticated | DAILY_TIP |
| Food image upload and analysis | M9 Upload | Pro + Ultra | `subscription.tier IN ('Pro','Ultra') AND is_active = True` | FOOD_IMAGE_UPLOAD |
| InBody body composition report upload | M9 Upload | Pro + Ultra | `subscription.tier IN ('Pro','Ultra') AND is_active = True` | INBODY_REPORT |
| Daily consumption log | M8 Tracking | Ultra only | `subscription.tier = 'Ultra' AND is_active = True` | DAILY_CONSUMPTION_LOG |
| Weekly nutrition report generation | M8 Tracking | Ultra only | `subscription.tier = 'Ultra' AND is_active = True` | WEEKLY_REPORT |
| Full interaction and plan history review | M8 Tracking | Ultra only | `subscription.tier = 'Ultra' AND is_active = True` | CHAT_SESSION, FOOD_RECOMMENDATION, NUTRITION_PLAN |
| Tier upgrade activation | M10 Subscription | All authenticated | Any tier may upgrade | SUBSCRIPTION, PAYMENT_RECORD |
| Admin: manage users | M11 Admin | Admin role | `user.is_admin = True` | USER |
| Admin: manage food database | M11 Admin | Admin role | `user.is_admin = True` | FOOD_ITEM |
| Admin: manage subscription status | M11 Admin | Admin role | `user.is_admin = True` | SUBSCRIPTION |
| Admin: view activity log | M11 Admin | Admin role | `user.is_admin = True` | System log (operational metadata) |

---

## Appendix D — Diagram Correction Instructions *(Reference)*

The following corrections to the Mermaid UML diagram set are required before final academic submission. These are diagram-level corrections only — they do not change any requirement documented in this text.

| Diagram | Required Correction |
|---|---|
| **Use Case Diagram** | Add `Visitor` actor with use cases: `View Landing Page`, `Browse Feature Comparison`, `Navigate to Registration`, `Navigate to Login` |
| **Use Case Diagram** | Split UC15 into UC15a (`View Current Session — Free/Pro`) and UC15b (`View Full History — Ultra`) |
| **Activity — Op1** | Add exception branch: "After rule engine: all foods excluded → communicate no safe options, suggest professional consultation" |
| **Activity — Op1** | Add exception branch: "User cannot clarify intent after threshold → graceful exit to waiting state" |
| **Activity — Op2** | Add exception branch: "Safety validation excludes all plan items → communicate inability to generate safe plan" |
| **Sequence — Op1** | Add `alt` block: "Rule engine returns empty safeFoodList → safe-options exception response" |
| **Sequence — Op1** | Add `alt` block: "Gemini API unavailable → return unformatted recommendation" |
| **Sequence — Op2** | Restructure `opt InBody` block: InBody was uploaded in a prior session; plan request retrieves stored InBody data — it is not uploaded during the same interaction |
| **Sequence — Op2** | Add `alt` block: "getPlanFoodItems returns empty set after safety filtering → safe plan exception response" |
| **Class Diagram** | Remove `validateSafety()` from `FoodRecommendation` class — safety validation is a `RuleEngine` responsibility |
| **Class Diagram** | Add documentation note: "`UserProfile.calculateBMI()`, `.estimateDailyCalories()`, `.getWaterIntakeTarget()` are model methods — pragmatic Django implementation choice; computation behavior logically belongs to a service layer." |
| **Class Diagram** | Add `AdminPortal` boundary class referencing the data entities it manages |
| **ERD** | Add documentation note to `DAILY_TIP`: "Standalone content entity — display relationship is implicit through date-based system query, no FK required." |
| **ERD** | Add documentation note to `FOOD_RECOMMENDATION.user_id`: "Deliberate performance denormalization — enables direct user-level queries without JOIN through CHAT_SESSION." |
| **ERD** | Add documentation note to `NUTRITION_PLAN.bmi` and `.daily_calories`: "Stored as historical snapshot at plan generation time — see Section 7.2 Persisted vs. Derived Data Policy." |
| **EER** | Add label to specialization hierarchy: "Conceptual model only — physical implementation uses single USER table with tier and is_admin fields (see ERD)." |
| **EER** | Correct ADMIN subclass label: "Admin role is a direct USER specialization — mutually exclusive with all tier roles. Admin users do not inherit tier-based features." |
| **EER** | Change `daily_water_target_derived` to: `daily_water_target_snapshot [Recommended Prototype Assumption — formula TBD by team]` |
| **EER** | Change `total_calories_derived` in DAILY_CONSUMPTION_LOG to: `total_calories_snapshot_at_insert (quantity × FOOD_ITEM.calories at record creation)` |

---

> **Revision Integrity Note (R1.2):** This version applies all correction decisions from the Mazaj_Consolidation_Analysis. The Mazaj+ project identity is unchanged: web-based, chat-driven, database-centered, rule-based nutrition decision-support prototype, Free/Pro/Ultra tiers, Gemini API for formatting only, Gemini Vision for image recognition only, advisory only, academic prototype. All R1.1 structural improvements are preserved and extended. No new product features have been invented. Corrections applied: authority hierarchy declared, module count resolved, Landing Page promoted to official module, admin access boundaries enforced throughout, history depth moved to Team Confirmation, decision tables added (Section 4.6), exception catalog added (Section 6), data governance section added (Section 7), persisted-vs-derived policy added (Section 7.2), subscription lifecycle clarified (Section 2.11.2), elicitation methodology added (Section 1.3), and four new appendices added (A: Admin Data Access Matrix, B: Module-to-Diagram Traceability, C: Feature-Tier-Requirement Traceability, D: Diagram Correction Instructions).
