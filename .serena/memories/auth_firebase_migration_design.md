# Auth Firebase Migration — IMPLEMENTED (login/register/logout only)

Full design + implementation notes: `stafy-mobile/docs/modules/auth.md` (renamed/restructured
2026-07-02 from `docs/auth-firebase-migration.md` to a module-doc template: Scope, Actors, Data
Objects, Lifecycle, User Flows, Information Architecture, REST API, Module Boundary, Special
Aspects, Deferred).

## What changed (done)
- New `src/services/firebase.ts`: `initializeApp` + `initializeAuth(app, {persistence: getReactNativePersistence(AsyncStorage)})` on native, `getAuth(app)` on web. `firebaseConfig` reuses the Android `apiKey`/`authDomain`/`projectId`/`storageBucket`/`messagingSenderId` from `google-services.json`; no `appId` set (optional for Auth-only use) and no dedicated Web app registered in Firebase console yet (follow-up).
- `getReactNativePersistence` needs a scoped `@ts-expect-error` on its import — it exists at runtime in `@firebase/auth`'s RN build but isn't declared in the aggregated public `.d.ts` that `firebase/auth` re-exports (upstream typing gap, verified via `npx tsc --noEmit`).
- `UserContext.login`/`register`/`logout` rewritten to call Firebase SDK first (`signInWithEmailAndPassword`/`createUserWithEmailAndPassword`/`signOut`), then hit the backend with `Authorization: Bearer <idToken>`. Register body is `{first_name, last_name, role}` only.
- `api.ts` interceptor now calls `auth.currentUser?.getIdToken()` per request instead of reading a stored `stafy_token` (key removed entirely — Firebase persists its own refresh token).
- `_layout.tsx` cold start now uses `onAuthStateChanged(auth, ...)` instead of `jwtDecode` on a stored token.
- All old implementations (login/register/logout/authCheck/interceptor/cold-start-check) are commented out and marked `// Deprecated —` rather than deleted, per explicit user instruction — do not delete them, and do not resurrect them either.
- Fixed a pre-existing bug while touching this code: error handling read `error.response.data.message`, which never matches FastAPI's `{"detail": ...}` shape. New `mapAuthError()` helper in `UserContext.tsx` checks `error.code` (Firebase) → `error.response.data.detail` (backend) → `error.message`.

## Major bug found + fixed same day (2026-07-02): missing `/api/v1` prefix EVERYWHERE
Discovered via a live registration attempt failing with "Error: Not Found". Root cause: **every**
API call in the entire mobile app (not just auth) was missing the `/api/v1` prefix that
`stafy-backend/app/main.py` mounts every router under (`app.include_router(..., prefix="/api/v1")`),
including `auth_router`. The workspace root `CLAUDE.md` had a stale claim that auth had no `/api/v1`
prefix — that claim was wrong and is now corrected. Fixed call sites: `UserContext.tsx` (login,
register, getProfile), `dashboard.tsx`, `attendance.tsx`, `history.tsx`, `profile.tsx` (x4),
`ActivitySelectorThemed.tsx`. Lesson: never trust an existing path elsewhere in this codebase as a
template — verify against `main.py`'s `include_router` calls directly.

## Also found + fixed same day: onAuthStateChanged race condition
Firebase fires `onAuthStateChanged` as soon as `createUserWithEmailAndPassword`/
`signInWithEmailAndPassword` resolve internally — before `login()`/`register()`'s own explicit
backend call completes. Without a guard, the hydration listener in `UserContext.tsx` raced ahead,
called `getProfile()` against a backend row that didn't exist yet, and clobbered state. Fixed with
an `isAuthenticating` ref: set to `true` for the duration of `login()`/`register()`; the listener
returns early while it's `true`, and only handles cold-start hydration + out-of-band sign-outs.

## Also found (documentation-only fix): OfflineManager claims were aspirational, not real
`stafy-mobile/CLAUDE.md` and the root workspace `CLAUDE.md` claimed `attendance.tsx`, `dashboard.tsx`,
and `history.tsx` were offline-aware via `OfflineManager`. Checked the actual code: all three call
bare `api.*` directly, no `OfflineManager` involved. Docs corrected to state this as known debt
rather than describe a behavior that doesn't exist. Did NOT change the actual behavior (out of scope) — only the docs.

## Known gaps / follow-ups (not implemented, intentionally out of scope this round)
- **Orphan registration**: if Firebase account creation succeeds but the backend `/api/v1/auth/register` call fails, there is NO recovery path — user sees a distinct error but can't re-register (`auth/email-already-in-use`) and login 404s forever. No auto-retry or "complete profile" screen built. Documented in `docs/modules/auth.md` under Special Aspects and Deferred.
- Login's 404 handling (backend row missing) does NOT auto-retry registration — the login screen never collects first_name/last_name/role, so there's nothing to retry with. Just shows a clearer error than before.
- `src/types/api.ts`'s `User` type not extended to match backend's `UserOut` (company_id, auth_provider, email_verified, firebase_uid) — still just id/email/first_name/last_name/role.
- No Web app registered in Firebase console — currently works by reusing the Android app's `apiKey` (Firebase web API keys aren't provider-restricted by default in this project).
- Password reset and email-verification UX: not implemented, not requested.
- The broader `OfflineManager` non-adoption in `attendance.tsx`/`dashboard.tsx`/`history.tsx` (see above) is unrelated pre-existing debt, only the docs were corrected, not the code.

## User decisions
- 2026-07-02: explicitly told not to care about migrating/backfilling any pre-Firebase DB accounts, and to comment out old code (mark deprecated) rather than delete it — applied throughout.
- 2026-07-02: explicitly asked to move/rename the design doc into `docs/modules/auth.md`, restructured to follow a specific module-doc template (Scope/Actors/Data Objects/Lifecycle/Flows/Information Architecture/REST API/Module Boundary/Special Aspects/Deferred) — done, old `docs/auth-firebase-migration.md` deleted, all cross-references updated (`stafy-mobile/CLAUDE.md`, root `CLAUDE.md`, code comments in `UserContext.tsx`).

Related: [[stafy-mobile CLAUDE.md]] already updated (Module Status, Storage Keys, Cross-Cutting Conventions, Traps, Where to Look, API Endpoints Consumed table).
