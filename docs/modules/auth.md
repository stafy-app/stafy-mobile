# Auth Module

Stafy — employee time-tracking and salary-management platform. Firebase-based authentication
between `stafy-mobile` (client) and `stafy-backend` (FastAPI).

## Scope

**In scope:** Firebase email/password registration and sign-in from `stafy-mobile`, ID-token
verification via Firebase Admin SDK on `stafy-backend`, DB user provisioning keyed by Firebase UID,
per-request token attachment, session persistence, and cold-start hydration.

**Out of scope (this release):** password reset / forgot-password, email-verification UX, social/OAuth
providers, backfill of any pre-Firebase DB accounts, an automated orphan-registration recovery flow.

---

## Actors

| Actor | Interface | Role |
|---|---|---|
| Employee / Manager | Mobile app (`stafy-mobile`) | Registers/logs in with email + password |
| Backend | FastAPI (`stafy-backend`) | Verifies Firebase ID tokens, provisions/syncs `users` rows |
| Firebase Auth | Google-managed service | Owns credential storage, issues and verifies ID tokens |

---

## Data Objects

### From Firebase (referenced, not owned by the backend)

**Firebase User** — `uid`, `email`, `email_verified`, password credential.
Role here: sole source of identity and credentials. The backend never stores or sees a password;
it only ever sees a verified ID token and the claims inside it.

### Backend objects

#### User (existing table — fields relevant to auth)

| Field | Type | Notes |
|---|---|---|
| `firebase_uid` | string UNIQUE | Sole join key back to the Firebase account |
| `email` | string | Copied from the decoded token at register time, not client input |
| `email_verified` | bool | Re-synced from the token on every authenticated request |
| `auth_provider` | string | Hardcoded `"email_password"` at creation time |
| `role` | enum | `employee` \| `manager` \| `admin` |
| `is_active` | bool | Soft-disable; `false` → 403 on every request |
| `company_id` / `personal_company_id` | UUID FK | A personal `Company` row is auto-created at registration |

Role here: the backend's local mirror of a Firebase identity, extended with app-specific fields
(role, company, active flag) that Firebase has no concept of.

---

## Auth Lifecycle

```
                    createUserWithEmailAndPassword         POST /api/v1/auth/register
  (no account) ──────────────────────────────────► (Firebase only) ──────────────────► provisioned
                                                          │
                                                          │ backend call fails
                                                          ▼
                                                   orphaned (Firebase account,
                                                   no DB row — see Special Aspects)

                    signInWithEmailAndPassword              POST /api/v1/auth/login
  provisioned ──────────────────────────────────► (Firebase session) ──────────────► synced, active

  synced, active ──── signOut() ────► (no account)
```

There is no state machine on the backend side — `users.is_active` and `deleted_at` are the only
gates (see Error responses below); everything else is Firebase's session state, mirrored into the
app via `onAuthStateChanged`.

**Error responses (backend, on every Bearer-authenticated request):**

| Condition | HTTP |
|---|---|
| Invalid or expired Firebase ID token | 401 |
| Firebase certificate fetch failure | 503 |
| `firebase_uid` not found in DB (orphaned Firebase account) | 404 |
| User inactive or soft-deleted | 403 |
| Email already registered (register only) | 409 |

---

## User Flows

### Flow 1: Register

1. Mobile → Register screen: name, surname, email, role, password
2. `createUserWithEmailAndPassword(auth, email, password)` — Firebase creates the account, returns a `User` + ID token
3. `POST /api/v1/auth/register` with `Authorization: Bearer <idToken>`, body `{first_name, last_name, role}` — email/password never leave the Firebase SDK call
4. Backend decodes the token, creates the `users` row + a personal `Company`, returns `UserOut`
5. On backend failure after step 2 succeeded: Firebase account is left in place (no rollback — see Special Aspects); user sees a distinct error, not the generic one

### Flow 2: Login

1. Mobile → Login screen: email, password
2. `signInWithEmailAndPassword(auth, email, password)`
3. `POST /api/v1/auth/login` with `Authorization: Bearer <idToken>`, no body
4. Backend verifies the token, looks up by `firebase_uid`, syncs `email_verified` + `last_login_at`, returns `UserOut`
5. Mobile calls `getProfile()`, caches the result, hydrates `UserContext`
6. On 404 (orphaned account, see Auth Lifecycle): mobile shows "registration not finished" instead of a wrong-credentials message — it cannot auto-retry registration, since the login screen never collects `first_name`/`last_name`/`role`

### Flow 3: Session hydration (cold start)

1. App launch → Firebase restores its persisted session (`getReactNativePersistence(AsyncStorage)` native / browser storage web)
2. `onAuthStateChanged` fires once with the restored user (or `null`)
3. `app/_layout.tsx`: redirects to `/dashboard` or `/login` accordingly
4. `UserContext.tsx`: hydrates `user` from cached `stafy_userData` if present, else calls `getProfile()`
5. This listener is suppressed while `login()`/`register()` are actively running — see Special Aspects (race condition)

### Flow 4: Logout

1. `signOut(auth)` — clears the Firebase session
2. `deleteItem('stafy_userData')`, `setUser(null)`
3. `onAuthStateChanged` fires with `null` → `_layout.tsx` redirects to `/login`

---

## Information Architecture (Mobile)

```
Auth (stafy-mobile)
├── src/services/firebase.ts    ← Firebase app + auth singleton (native persistence via AsyncStorage)
├── src/context/UserContext.tsx ← login / register / logout / cold-start hydration
├── src/services/api.ts         ← axios interceptor: attaches a fresh ID token per request
├── app/(auth)/login.tsx        ← email + password
├── app/(auth)/register.tsx     ← name, surname, email, role, password
└── app/_layout.tsx             ← onAuthStateChanged-driven cold-start redirect
```

---

## REST API

```
POST   /api/v1/auth/register
       header: Authorization: Bearer <Firebase ID token>
       body:   { first_name, last_name, role }
       → 201 UserOut   (409 if email already registered)

POST   /api/v1/auth/login
       header: Authorization: Bearer <Firebase ID token>
       → 200 UserOut   (404 if no matching firebase_uid — orphaned account)
```

Every other endpoint in the backend requires the same `Authorization: Bearer <Firebase ID token>`
header via the `get_current_active_user` dependency — auth is not a separate prefix exempt from
`/api/v1`; **all** routes, including these two, are mounted under `/api/v1`.

### Key response schema

```typescript
UserOut {
  id: number
  firebase_uid: string
  first_name: string | null
  last_name: string | null
  email: string | null
  company_id: number
  auth_provider: string
  email_verified: boolean | null
  role: string | null
  created_at: string | null   // ISO datetime
  is_active: boolean | null
}
```

---

## Module Boundary

| Owns | References |
|---|---|
| `src/services/firebase.ts`, `UserContext.tsx` (mobile) | Firebase Auth (credentials, sessions) |
| `app/auth/router.py`, `users.User.firebase_uid` (backend) | Firebase Admin SDK (token verification only — never issues tokens itself) |

**Backend never issues its own tokens.** `app/auth/jwt_handler.py` (project-issued JWT creation/verification)
is legacy dead code, kept but unused — see `stafy-backend/app/auth/CLAUDE.md`.

---

## Special Aspects

### Token attachment (no local caching)

The axios interceptor in `api.ts` calls `auth.currentUser.getIdToken()` on every request rather than
reading a cached string. Firebase returns the cached token unless it's near its 1-hour expiry, in
which case it silently refreshes using its own persisted refresh token. There is no `stafy_token`
storage key — a second, parallel token cache would only be able to go stale.

### Race condition: `onAuthStateChanged` vs. explicit `login()`/`register()`

Firebase notifies auth-state listeners as soon as `createUserWithEmailAndPassword`/
`signInWithEmailAndPassword` resolve internally — before `login()`/`register()` in `UserContext.tsx`
get a chance to call the backend themselves. Left unguarded, the listener's own hydration logic
races ahead and calls `getProfile()` against a backend row that doesn't exist yet (registration) or
isn't confirmed synced yet (login), clobbering state. Guarded with an `isAuthenticating` ref: set for
the duration of `login()`/`register()`; the listener no-ops while it's `true` and only handles
cold-start hydration and out-of-band sign-outs.

### Orphan registration (no recovery path yet)

If `createUserWithEmailAndPassword` succeeds but the subsequent `POST /api/v1/auth/register` fails
(network blip, backend down, rejected role), the Firebase account is deliberately left in place —
deleting it can itself fail offline, and a half-rolled-back state is worse than a recoverable one.
There is currently **no self-service recovery**: the user can't re-register (`auth/email-already-in-use`)
and login will 404 indefinitely. See Deferred.

### `/api/v1` prefix — no exceptions

Every backend router, including `auth_router`, is mounted with `app.include_router(..., prefix="/api/v1")`
in `stafy-backend/app/main.py`. Every mobile API call was missing this prefix until 2026-07-02 and
404'd silently against the live backend — this affected auth and every other endpoint in the app, not
auth alone. Before adding a new call, verify the full path against `main.py`'s `include_router` calls.

### Firebase project configuration gap

`google-services.json` only registers an **Android** app; `src/services/firebase.ts` currently reuses
its `apiKey`/`authDomain`/`projectId` for all platforms (including web) with no `appId` set (optional
for Auth-only usage). A dedicated Web app should be registered in the Firebase console before this is
hardened for release — see Deferred.

---

## Deferred

| Item | Trigger |
|---|---|
| Password reset / forgot-password | User-facing request for self-service recovery |
| Email-verification UX | Product decision to gate features behind a verified email |
| Orphan-registration recovery ("complete your profile" screen — user is already Firebase-authenticated on 404, so collect `first_name`/`last_name`/`role` and call `POST /api/v1/auth/register` with the current token; not auto-rollback, see Special Aspects) | **Trigger met 2026-07-10**: web deploy on Vercel means real users can now hit this — needed before wider rollout, not deferred further |
| Backfill / migration of pre-Firebase DB accounts | Only if such accounts are later found to exist — explicitly out of scope per 2026-07-02 decision |
| Firebase Web app registration (proper `apiKey`/`appId` pair) | Before hardening for public web release |
| `src/types/api.ts` `User` extended to match `UserOut` | When `company_id`/`auth_provider`/`email_verified`/`firebase_uid` are needed client-side |
