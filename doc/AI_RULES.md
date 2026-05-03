# Mazaj+ AI & Business Logic Rules

## 1. Backend Authority Constitution
The Django backend architecture serves as the sole arbiter of logic, data integrity, user capabilities, and safety. The frontend interface visually requests and reflects outcomes governed totally by the backend.

## 2. Gemini Formatting Boundary
The Gemini API acts exclusively as a textual styler. Gemini may optionally format the final backend-approved text only. Streaming is not assumed.

## 3. Gemini Vision Boundary
The Gemini Vision API is rigorously confined to image recognition, deriving only name string labels from uploaded food imagery.

## 4. Explicit Prohibited AI Behaviors
The AI must never be granted algorithmic decision power. Specifically restricted behaviors encompass:
- No calories calculation or generation.
- No macros calculation.
- No food decision processing.
- No safety decision processing.
- No allergy decision processing.
- No health condition decision processing.
- No BMI generation.
- No hydration target derivations.
- No tier, subscription, or usage limit enforcement.
- No administrative decision handling.

## 5. Safety Validation Before AI
A backend rule engine processes all foods against the user's declared profile. The algorithm must exclude safely any items signaling contradictions, proceeding only when a clean list remains.

## 6. Data Minimization Before AI
- Under no circumstance do full health profiles (height, weight, conditions) transmit to the Gemini APIs.
- The system must prefer sending a finalized, backend-approved semantic response array merely for natural language formatting.

## 7. Prompt Injection Protection
- Unsterilized user text cannot override embedded system contexts.
- AI structural outputs must match expected application shapes precisely.
- Unsupported formatting or erroneous data fields produced by AI hallucination must be systematically rejected.

## 8. Free Usage Caps
Usage counter bounds dictate absolute server-side denial parameters:
- **3 core chat-guidance sessions** per day.
- **1 basic nutrition plan** per week.
- **2 healthy alternative requests** per day.

## 9. Admin Privacy Rules
Administrative roles command operational system access, yet are emphatically walled off from interacting with sensitive profile data, medical parameters, raw biometric uploads, daily calorie histories, or personal chat dialogues.

## 10. Sensitive Logging Restrictions
Diagnostic or event logging platforms capture only transactional context states (e.g., "Subscription active check processed"). User messages, metrics, and dietary data inputs are scrubbed.

## 11. Idempotency Rules
Repetitive state alterations require backend keys or UUID tracking preventing duplicated payload executions (e.g., repeatedly firing tier upgrade processes).

## 12. Transaction Rules
Simultaneous sequential data edits spanning multiple tables adhere firmly to `transaction.atomic()` wrappers to stop partial database corruption upon abrupt failures.

## 13. Safe Fallback
If Gemini fails, return a safe internally generated fallback response in readable format without AI formatting.

## 14. Allowed vs Forbidden Examples
- **Allowed:** A server-constructed array `[{food: "Egg", reason: "Protein source"}]` is wrapped by Gemini textually into *"I recommend including an egg locally since it provides protein."*
- **Forbidden:** A user states "I'm diabetic" inside chat, and Gemini directly queries foods it believes safe, bypassing the Django backend engine matching High-Risk Sugar markers against the food list.

## 15. Test Requirements for AI Boundaries
Unit and Integration logic suites must mock AI proxy responses with destructive behavior loops, actively validating that the Django service catches and neutralizes prohibited data formats without disrupting the system state.
