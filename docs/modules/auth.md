# Auth Module

Stafy — employee time-tracking and salary-management platform. Firebase-based authentication
between `stafy-mobile` (client) and `stafy-backend` (FastAPI).

## Scope

**In scope:** Firebase email/password registration and sign-in from `stafy-mobile`, ID-token
verification via Firebase Admin SDK on `stafy-backend`, DB user provisioning keyed by Firebase UID,
per-request token attachment, session persistence, cold-start hydration, and self-service password
reset via Firebase.

**Out of scope (this release):** email-verification UX, social/OAuth providers, backfill of any
pre-Firebase DB accounts.

---

## Actors

| Actor | Interface | Role |
|---|---|---|
| Employee / Manager | Mobile app (`stafy-mobile`) | Registers/logs in with email + password |
| Backend | FastAPI (`stafy-backend`) | Verifies Firebase ID tokens, provisions/syncs `users` rows |
| Firebase Auth | Google-managed service | Owns credential storage, issues and verifies ID tokens |

---

## Data Objects

### Referenced (not owned)

**Firebase User** — `uid`, `email`, `email_verified`, password credential.
Role here: sole source of identity and credentials. The backend never stores or sees a password;
it only ever sees a verified ID token and the claims inside it.

### Owned

#### User (existing table — fields relevant to auth)

| Field | Type | Notes |
|---|---|---|
| `firebase_uid` | string UNIQUE | Sole join key back to the Firebase account |
| `email` | string | Copied from the decoded token at register time, not client input |
| `email_verified` | bool | Re-synced from the token on every authenticated request |
| `auth_provider` | string | Hardcoded `"email_password"` at creation time |
| `role` | enum | `employee` \| `manager` \| `admin` |
| `is_active` | bool | Soft-disable; `false` → 403 on every request |
| `company_id` / `personal_company_id` | int FK | A personal `Company` row is auto-created at registration |

Role here: the backend's local mirror of a Firebase identity, extended with app-specific fields
(role, company, active flag) that Firebase has no concept of.

---

## Lifecycle

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

## Derived / Aggregated Data

None. Nothing on this module is computed at read time — `UserOut` fields are stored as-is or
copied from the decoded Firebase token.

---

## User Flows

### Flow 1: Register

1. Mobile → Register screen: a 4-step wizard (welcome → role → identity → account), not a single form. Data accumulates in local component state across steps; nothing is sent over the network until the last step.
   - **Welcome**: branding only, no input.
   - **Role**: `employee` / `manager`. Selecting `manager` redirects straight to `/manager-mobile-blocked` — the wizard never asks a manager for identity/account details on mobile.
   - **Identity**: name, surname.
   - **Account**: email, password, confirm-password (client-side match check; no confirm-password field existed before this wizard).
2. On the last step: `createUserWithEmailAndPassword(auth, email, password)` — Firebase creates the account, returns a `User` + ID token
3. `POST /api/v1/auth/register` with `Authorization: Bearer <idToken>`, body `{first_name, last_name, role}` — email/password never leave the Firebase SDK call
4. Backend decodes the token, creates the `users` row + a personal `Company`, returns `UserOut`
5. On backend failure after step 2 succeeded: Firebase account is left in place (no rollback — see Special Aspects); the wizard shows a distinct error, not the generic one; the account is now orphaned and recovers via Flow 6, not by retrying Flow 1 (`createUserWithEmailAndPassword` now fails `auth/email-already-in-use`)

### Flow 2: Login

1. Mobile → Login screen: email, password
2. `signInWithEmailAndPassword(auth, email, password)`
3. `POST /api/v1/auth/login` with `Authorization: Bearer <idToken>`, no body
4. Backend verifies the token, looks up by `firebase_uid`, syncs `email_verified` + `last_login_at`, returns `UserOut`
5. Mobile calls `getProfile()`, caches the result, hydrates `UserContext`
6. On 404 (orphaned account, see Lifecycle): `login()` throws `OrphanRegistrationError` instead of the generic auth error; `login.tsx` catches it and routes to `/complete-registration` (Flow 6) instead of showing an Alert

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

### Flow 5: Password reset

1. Mobile → `app/(auth)/forgot-password.tsx`, linked from the login screen: email only
2. `sendPasswordResetEmail(auth, email)` — Firebase-only call, no backend involved
3. Same success message shown regardless of whether the email matches an account (Firebase's own
   enumeration-safe behavior) — user is routed back to `/login`
4. Actual password change happens outside the app, via the link Firebase emails to the address

### Flow 6: Orphan-registration recovery

1. Reached only via Flow 2 step 6 (`OrphanRegistrationError`) — the user is already Firebase-authenticated at this point, `auth.currentUser` is guaranteed set
2. Mobile → `app/(auth)/complete-registration.tsx`: name, surname, then role (same fields Flow 1's wizard collects, minus email/password — those already exist in Firebase)
3. `completeRegistration()` reads `auth.currentUser.getIdToken()` directly — no `signInWithEmailAndPassword` call, the session already exists
4. `POST /api/v1/auth/register` with that token, same body shape as Flow 1 step 3 — finishes provisioning the `users` row that was missing
5. On success: `getProfile()`, cache, `setUser()`, then route to `/manager-mobile-blocked` or `/attendance` same as Flow 2's post-login redirect
6. On repeated backend failure: same generic distinct-error message as Flow 1 step 5, retryable from the same screen — no dead end
7. A "Deconectează-te" action is available on this screen for a user who wants to abandon instead of finishing

---

## Information Architecture (Mobile)

```
Auth (stafy-mobile)
├── src/services/firebase.ts    ← Firebase app + auth singleton (native persistence via AsyncStorage)
├── src/context/UserContext.tsx ← login / register / completeRegistration / logout / cold-start hydration
├── src/services/api.ts         ← axios interceptor: attaches a fresh ID token per request
├── app/(auth)/login.tsx        ← email + password
├── app/(auth)/register.tsx     ← 4-step onboarding wizard: welcome → role → identity → account (see Flow 1)
├── app/(auth)/complete-registration.tsx ← orphan-registration recovery: name, surname, then role (see Flow 6)
├── app/(auth)/forgot-password.tsx ← email only, Firebase-only (see Flow 5)
├── app/manager-mobile-blocked.tsx ← role gate landing screen, not under (auth)/ — reached from the register wizard's role step, Flow 6, and cold-start hydration alike, whenever `isManagerMobileBlocked(role)` is true
└── app/_layout.tsx             ← onAuthStateChanged-driven cold-start redirect
```

---

## UI / Layout

N/A — no design spec was authored for this module. `app/(auth)/login.tsx`, `register.tsx`, and
`complete-registration.tsx` use the shared `src/components/*Themed.tsx` design-system components
(`ButtonThemed`, `TextInputThemed`, etc.), same as every other screen — see `stafy-mobile/CLAUDE.md`
Module Status.

`register.tsx` additionally uses React Native's built-in `Animated` API (no new dependency —
`reanimated`/`moti` aren't installed): a fade + slide-up on every step change, and two looping,
low-opacity decorative circles drifting slowly behind the content for the whole wizard. Purely
cosmetic — `pointerEvents="none"` on both, no interaction depends on them.

---

## Data Access

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

Password reset has no backend endpoint at all — `sendPasswordResetEmail` is a direct Firebase SDK
call from the mobile client (see Flow 5); the backend is never involved.

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
  company_name: string | null      // only populated by GET /profile, see Special Aspects below
  is_own_company: boolean | null   // only populated by GET /profile
  created_at: string | null   // ISO datetime
  is_active: boolean | null
}
```

---

## Special Aspects

### Backend never issues its own tokens

`app/auth/jwt_handler.py` (project-issued JWT creation/verification) is legacy dead code, kept but
unused — see `stafy-backend/app/auth/CLAUDE.md`. The backend only ever verifies Firebase-issued ID
tokens via the Firebase Admin SDK.

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

### Orphan registration

If `createUserWithEmailAndPassword` succeeds but the subsequent `POST /api/v1/auth/register` fails
(network blip, backend down, rejected role), the Firebase account is deliberately left in place —
deleting it can itself fail offline, and a half-rolled-back state is worse than a recoverable one.
The user can't re-register (`auth/email-already-in-use`) and a normal login 404s — self-service
recovery is Flow 6 (`app/(auth)/complete-registration.tsx`), reached automatically when `login()`
throws `OrphanRegistrationError`. Cold-start hydration (Flow 3) does **not** route here directly on
a 404 — it still falls back to `/login`, so a relaunch while orphaned requires one extra login
attempt before landing on Flow 6; only `login()` classifies the 404 as recoverable.

### `/api/v1` prefix — no exceptions

Every backend router, including `auth_router`, is mounted with `app.include_router(..., prefix="/api/v1")`
in `stafy-backend/app/main.py`. A mobile API call missing this prefix 404s silently against the live
backend — this applies to auth and every other endpoint in the app, not auth alone. Before adding a
new call, verify the full path against `main.py`'s `include_router` calls.

### Company assignment display (`company_name`/`is_own_company`)

`GET /api/v1/profile` is the only endpoint that populates `UserOut.company_name`/`is_own_company`
(every other `UserOut` response — dashboard embeds, team roster — leaves both `null`). The profile
screen (`app/(tabs)/profile.tsx`, via `ProfileInfo`) shows the current company name and whether the
user is still on their own personal company or was assigned to another one via an accepted
invitation. `src/types/api.ts`'s `User` type only carries these two extra fields from `UserOut`,
not the full backend shape — see Deferred.

`profile.tsx` also reads `is_own_company` to gate the Hourly Rates section: the add/edit/delete
affordances (`+` button, tap-to-edit, long-press-to-delete on each `HourlyRateCard`) only render
when `is_own_company !== false` — an employee who joined another manager's company via invitation
sees their rates read-only, since those are backend-enforced as manager-set only past that point
(`stafy-backend`'s `not_own_company` 403 on `PATCH /users/me/settings/hourly-rates` and
`POST`/`DELETE /users/me/settings/activities`). The UI gate mirrors that backend rule rather than
relying on the 403 alone.

### `manager-mobile-blocked.tsx`'s logout always navigates explicitly

Its "Deconectare" button calls `logout()` then `router.replace("/login")` itself, rather than relying
on `logout()`'s own side effect (`onAuthStateChanged` firing `null` → `_layout.tsx`/`UserContext.tsx`
redirecting, see Flow 4). That side effect only fires on an actual Firebase state *transition*.
Reached from the register wizard's role step, `auth.currentUser` is often already `null` (no account
was ever created — picking `manager` redirects before any Firebase call), so `signOut(auth)` is a
no-op and no state transition occurs, and the automatic redirect never fires. The explicit
`router.replace` makes the button work from every entry point (register wizard, Flow 6, cold-start
hydration of an existing manager), not just the ones where a real session existed.

### Firebase project configuration gap

`google-services.json` only registers an **Android** app; `src/services/firebase.ts` currently reuses
its `apiKey`/`authDomain`/`projectId` for all platforms (including web) with no `appId` set (optional
for Auth-only usage). A dedicated Web app should be registered in the Firebase console before this is
hardened for release — see Deferred.

---

## Deferred

| Item | Trigger |
|---|---|
| Email-verification UX | Product decision to gate features behind a verified email |
| Cold-start hydration (Flow 3) routing straight to `/complete-registration` on a 404, instead of `/login` first (see Special Aspects → Orphan registration) | If the extra login attempt on relaunch turns out to be a real friction point in practice |
| Backfill / migration of pre-Firebase DB accounts | Only if such accounts are later found to exist — explicitly out of scope for now |
| Firebase Web app registration (proper `apiKey`/`appId` pair) | Before hardening for public web release |
| `src/types/api.ts` `User` extended with the rest of `UserOut` (`company_id`/`auth_provider`/`email_verified`/`firebase_uid`) | When those fields are needed client-side — `company_name`/`is_own_company` are already present (see Special Aspects), the remaining fields are not |
