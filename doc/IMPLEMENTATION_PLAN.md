# Mazaj+ Implementation Plan

## 1. Workspace Paths
- **Workspace Root:** `C:\Users\Lenovo\Downloads\mazajp+`
- **Documentation Folder:** `C:\Users\Lenovo\Downloads\mazajp+\doc`
- **Source Code Folder:** `C:\Users\Lenovo\Downloads\mazajp+\source code`
- **Strict Rule:** Development must be restricted to the Source Code folder. Documentation must remain in the Documentation folder. Do not edit outside these mapped paths.

## 2. Current Confirmed State
- **Documentation:** Structured documentation and diagrams exist.
- **Source Code:** The source code folder is strictly confirmed to be empty.
- **Backend:** Not implemented yet.
- **Frontend:** Not implemented yet.
- **Strategy:** Implementation starts entirely from scratch.

## 3. Target Architecture
- **Backend:** Django/Python. The backend operates as the absolute authority enforcing all business, security, tier, and safety rules.
- **Frontend:** React/Vite. The frontend functions exclusively as a user UX visualization layer and respects backend directives.
- **Database:** SQLite for development scaled seamlessly to a PostgreSQL-ready deployment. Serves as the internal database and absolute rule-engine authority.
- **AI Integrations:** 
  - **Gemini (NLP):** Operates as an optional formatter only. Gemini may optionally format the final backend-approved text only. Streaming is not assumed.
  - **Gemini Vision:** Scoped strictly as a visual food-name recognizer only.

## 4. Execution SDLC Phases

| Phase | Phase Name | Target Folder | Objective | Deliverables | Business Rules Protected | Privacy Risks | Acceptance Criteria | Manual Tests | Review Gate |
|---|---|---|---|---|---|---|---|---|---|
| 0 | Discovery and study | `\doc` | Read project structure and establish constraints. | Phase 0 Report | Advisory-only adherence | N/A | Full mapping understood | N/A | Approved |
| 1 | Planning documents | `\doc` | Codify SDLC constraints and technical architectures. | 4 Markdown planning documents | AI Boundaries, M1-M11 constraints | N/A | Plans properly dictate structure | N/A | Created, pending project-owner review. |
| 2 | Backend foundation | `\source code\backend` | Scaffold Django, establish Postgres-ready config, baseline models. | Django Project, DB init | Internal logic precedence | DB Config integrity | Django runs locally | Check swagger/admin ping | Require PO Approval |
| 3 | Auth and onboarding | `\source code\backend` | Implement Django session authentication and biometric onboarding capture. | User, Profile, Auth APIs | Tier baseline set to Free | PII exposure during login | Auth intercepts properly | Login, reject un-onboarded | Require PO Approval |
| 4 | Nutrition DB and rule engine | `\source code\backend` | Seed foods, rules, conditions, and allergies. Expose safe filter logics. | Seeded DB, Rule Services | Safe exclusion of high-risk allergens | Exposing rule mechanisms | Algorithm safely excludes conflicting foods | Feed conflicting inputs | Require PO Approval |
| 5 | Core APIs | `\source code\backend` | Implement Op1 (emotion) and Op2 (plans) endpoints with Gemini text styling. | Core Chat / Plan APIs | Caps enforced, backend authority applied | Chat log interception | Caps properly decrement & reject | Hit endpoints sequentially | Require PO Approval |
| 6 | Premium APIs | `\source code\backend` | Securely build Upload handlers, metrics tracking, and history generation. | Tracking / Image APIs | Subscription validations | Exposure of images/logs | Upload rejects bad files | Test image parsing | Require PO Approval |
| 7 | Frontend foundation | `\source code\frontend` | Scaffold React/Vite, implement layout UI architectures and styling. | React App, UI Components | Rendering restrictions | N/A | Dev server runs locally | Check routing shells | Require PO Approval |
| 8 | Frontend API integration| `\source code\frontend` | Bind React views dynamically to Django endpoints and Auth contexts. | Integrated Frontend App | Prevent frontend authority assumptions | JWT/Cookie local leakage | Auth flow works strictly | End-to-end login-to-chat | Require PO Approval |
| 9 | Admin portal and admin hardening | Both folders | Build segregated Admin APIs and React portal tools. | Admin Tooling | Block health data from admin reads | Accidental PII serialization | Admins strictly cannot view chat/conditions | Try fetching health as admin | Require PO Approval |
| 10 | Testing and validation| Both folders | Assert edge cases, fail-safes, and tier protections. | Tested System | Validation of exact caps and boundaries | None | E2E coverage complete | Final E2E QA checklist | Require PO Approval |
| 11 | Stabilization and final docs | Both folders | Clean up, optimize, document. | Release Build | Advisory-only verified | None | Zero lint errors | Final deployment check | Require PO Approval |

## 5. Definition of Done
Every phase represents an explicit sprint. A phase is **Done** when:
1. Code achieves the stated objective.
2. The logic strictly upholds its matrix-mapped Tier constraints and Privacy Boundaries.
3. Relevant unit tests are implemented and pass safely.
4. The deliverables are demonstrably operative.

## 6. Rollback and Review Rules
- **Rollback:** Any phase demonstrating a security logic failure, or a shift in authority away from the robust backend to the frontend or AI models must be immediately rolled back to the previous stable state.
- **Approval Gate Rule:** No phase may begin until the previous phase output is reviewed and approved by the project owner.
