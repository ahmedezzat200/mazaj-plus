# Mazaj+ Backend Foundation

## Phase 2: Backend Foundation

This implementation contains the foundational backend structure for the Mazaj+ academic prototype.

**What was implemented:**
- Clean Django project scaffold.
- Domain enums, core generic models, and safety models (Audit Logs, Idempotency tracking).
- Core profiles, subscriptions, and nutrition safety models.
- Standardized error-shape response architectures.
- Policy placeholders.
- A basic database-free health endpoint.

**Notes:**
- No Gemini integration yet.
- No recommendation logic yet.
- No frontend yet.
- Backend foundation only.

## Local Run Instructions

1. **Create virtual environment:**
   ```bash
   python -m venv venv
   ```
2. **Activate virtual environment:**
   ```bash
   # Windows
   .\venv\Scripts\activate
   # macOS/Linux
   source venv/bin/activate
   ```
3. **Install requirements:**
   ```bash
   pip install -r requirements.txt
   ```
4. **Make and run migrations:**
   ```bash
   python manage.py makemigrations common users profiles subscriptions nutrition
   python manage.py migrate
   ```
5. **Run the server:**
   ```bash
   python manage.py runserver
   ```

## Health Endpoint URL
Once the server is running, verify via:
`http://127.0.0.1:8000/api/v1/health/`

## Phase 3: Auth & Onboarding APIs

This phase introduces Django Session Authentication, User Registration, Idempotent Onboarding, and Safe Profile Management.
*Note: No Gemini/chat/recommendation API exists yet.*

### Idempotency
The `POST /api/v1/onboarding/` endpoint requires an `Idempotency-Key` header. This prevents duplicate mappings from being created if a network error occurs. 
If the exact same payload is sent with the same key, it returns the stored successful response. If a different payload is sent with the same key, it throws a 409 Conflict error.

### Sample Payloads

**1. Register (POST `/api/v1/auth/register/`)**
```json
{
  "full_name": "Test User",
  "email": "test@example.com",
  "password": "securepassword123",
  "advisory_terms_accepted": true
}
```

**2. Login (POST `/api/v1/auth/login/`)**
```json
{
  "email": "test@example.com",
  "password": "securepassword123"
}
```

**3. Current User (GET `/api/v1/auth/me/`)**
Requires active session cookies. Returns basic user info, safely hiding medical data.

**4. Onboarding (POST `/api/v1/onboarding/`)**
Headers: `Idempotency-Key: your-unique-uuid`
```json
{
  "age": 25,
  "gender": "MALE",
  "height_cm": 180.5,
  "weight_kg": 75.0,
  "nutrition_goal": "MAINTENANCE",
  "health_conditions": [1, 2],
  "allergies": [3]
}
```
