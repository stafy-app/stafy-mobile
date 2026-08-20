# Stafy Mobile

Employee time-tracking mobile client; React Native + Expo (expo-router); TypeScript; Tailwind via Uniwind; targets iOS, Android, and Web from a single codebase; deployed via EAS Build / Vercel (web).

## Code Navigation — Serena MCP (MANDATORY)

Call `mcp__serena__initial_instructions` at session start before any coding task.

**NEVER** use `Read`, `Grep`, or directory listing to "explore" structure. Use Serena:
- `find_symbol` / `find_declaration` → jump to definitions
- `find_referencing_symbols` → find callers/usages
- `get_symbols_overview` → module structure
- `search_for_pattern` → pattern search across codebase

Read a file only when you must view the full implementation of a specific, already-located symbol.

## Output Rules (Zero Fluff)

- No preamble, pleasantries, or closing remarks.
- Output only the requested change or direct answer.
- Never rewrite an entire file for a partial change — use Serena editing tools (`replace_symbol_body`, `replace_content`, `insert_after_symbol`) for precise targeted edits.

## Continuous Memory & Index Updates (Mandatory)

- After every code change or resolved task, silently update the relevant Serena memory and/or auto-memory to reflect new architecture, new symbols, or changed invariants.
- Do not wait to be asked. Never skip this step.

## Engineering Posture

You are a senior engineer on this stack, not a stenographer. When a request conflicts with the conventions or traps below, say so plainly, name the trade-off, and propose the smaller correct change before doing the work.

**Disagree when you see:**

- **Direct `api.*` calls for data that should be offline-aware.** `OfflineManager.apiGet` / `apiPost` must be used for reads and writes that the user may trigger while offline. Only use bare `api.*` when the operation is inherently online-only (e.g. an unauthenticated login handshake). Current violations: `ActivitySelectorThemed.tsx` (direct `api.get`), `history.tsx` delete, `profile.tsx` PATCH and DELETE — do not add new violations.
- **`OfflineManager.apiPost` for PATCH or DELETE.** The offline queue only replays POSTs. Mutations sent through `apiPost` with a non-POST HTTP verb will be stored in the queue but replayed as POST, corrupting the backend. Add a dedicated method before using the queue for PATCH/DELETE.
- **Unsafely dereferencing `user` from context.** `user` is `User | null`. Accessing `user.first_name` without a null guard crashes when the context hasn't hydrated. See the `// @ts-ignore` at `profile.tsx:146` — this is a known debt, do not copy the pattern.
- **Hardcoding strings in UI.** The app is in Romanian; all user-visible text is inline. Do not introduce a second language or a translation layer without discussing it first.
- **Importing from `@/src/services/api` in a screen that also uses `OfflineManager`.** A screen should pick one data-access path. Mixing direct `api.*` and `OfflineManager.*` in the same screen for the same resource creates cache-consistency bugs.

**How to push back.** Name the principle, point at the file or convention being violated, propose the smaller correct change in one or two sentences, then wait.

## Model Selection

Default: `claude-sonnet-4-6`. Delegate to `claude-haiku-4-5` only for:
- Mechanical symbol renames across files (no judgment required)
- Writing new themed UI components that mirror an existing `*Themed.tsx` pattern exactly
- Generating TypeScript interface boilerplate for a new stub module

Do NOT delegate: auth flow changes, `OfflineManager` logic, new API endpoints consumption, anything touching storage keys or token handling.

## Before Finishing Work

```bash
npx expo start          # confirm the dev server starts clean and no import errors surface
npx expo start --web    # confirm web build works (Platform.OS branching can break silently)
```

No automated test suite exists. Manual smoke-test the changed screen on both native and web if the change touches `Platform.OS` branching, storage, or the `OfflineManager`.

## Module Status

| Module | Status | Description |
|---|---|---|
| `app/(auth)/login.tsx` | Live | Email + password login via Firebase (`signInWithEmailAndPassword`), then `POST /api/v1/auth/login` with the ID token |
| `app/(auth)/register.tsx` | Live | Registration via Firebase (`createUserWithEmailAndPassword`), then `POST /api/v1/auth/register` with the ID token; role selector: `employee` / `manager` |
| `app/(auth)/forgot-password.tsx` | Live | Email-only password reset via Firebase (`sendPasswordResetEmail`), no backend call — linked from `login.tsx`. See `docs/modules/auth.md` Flow 5 |
| `src/services/firebase.ts` | Live | Firebase app + `auth` singleton init; native uses `getReactNativePersistence(AsyncStorage)`, web uses default `getAuth` |
| `app/(tabs)/attendance.tsx` | Live — has debt | Time-entry creation; **not** offline-aware — uses bare `api.post`, not `OfflineManager.apiPost`. `getSubmissionTimeEnd()` normalizes a night shift (ORA STOP picked earlier than ORA START on the same calendar day) by adding 24h before submitting, mirroring `calculateWorkedTime`'s display logic — the backend rejects `time_end <= time_start`. Save failures (validation, duplicate-entry conflict) surface via `Alert.alert`, with known backend error `code`s (`not_found`, `entry_already_exists`) mapped to Romanian via `ERROR_MESSAGES_RO`, not a raw English backend string. `activityId`/`rate` reset on every focus (`useFocusEffect`), and `ActivitySelectorThemed` remounts via a bumped `selectorKey`, so a stale activity selected before navigating away (e.g. before accepting an invitation that changes the user's company) can never be submitted — the user must always re-pick after returning to the tab |
| `app/(tabs)/dashboard.tsx` | Live — has debt | Monthly hours + gross salary summary + pie chart, plus incoming-invitation cards (accept/reject); **not** offline-aware — uses bare `api.get`/`api.post`, not `OfflineManager` (deliberate for invitations — see `docs/modules/invitations.md` Special Aspects) |
| `app/(tabs)/history.tsx` | Live — has debt | Time-entry list; both fetch and delete are online-only (bare `api.get` / `api.delete`), not `OfflineManager` |
| `app/(tabs)/profile.tsx` | Live — has debt | Hourly rates CRUD, gated read-only when `user.is_own_company === false` (see `docs/modules/auth.md`); edit (`api.patch`) and delete (`api.delete`) are online-only; null-guard missing on `user` |
| `src/services/OfflineManager.ts` | Live — incomplete | GET (cache) + POST (queue + sync) implemented; PATCH, DELETE, PUT not yet implemented (TODO) |
| `src/context/UserContext.tsx` | Live | Auth state, login/register/logout, profile fetch, `refreshProfile()` (re-fetches `/api/v1/profile` without toggling `isLoading`, so `UserOnly` doesn't unmount the calling screen — first caller: dashboard's invitation-accept flow); `user` is null before hydration |
| `src/hooks/useUser.tsx` | Live | Thin wrapper over `UserContext`; throws if used outside `UserProvider` |
| `src/components/*Themed.tsx` | Live | Shared design-system components (Button, TextInput, Dropdown, Popup, Header, Footer…) |
| `src/components/attendance/` | Live | CalendarThemed, TimeSelectorThemed, ActivitySelectorThemed, CalculatorThemed |
| `src/components/dashboard/` | Live | InfoCard, PieChartData, IncomingInvitationCard (accept/reject actions, see `docs/modules/invitations.md`) |
| `src/components/history/` | Live | HistoryTable |
| `src/components/profile/` | Live | ProfileInfo (name/role, plus company name + "joined another manager's company" caption when `is_own_company` is `false` — see `docs/modules/auth.md` Special Aspects), HourlyRateCard, PopupEdit, PopupAddRate, TipCard |
| `src/utils/` | Live | `networkHelper.ts`, `pieChartHelper.ts`, `routeHelper.ts`, `calculateWorkedTime.ts` |

## CLI Quick Reference

```bash
just dev                          # start Metro bundler (scan QR for Expo Go)
just web                          # start web version → http://localhost:8081
just android                      # run on Android emulator / device
just ios                          # run on iOS simulator (macOS only)
just lint                         # TypeScript type-check (npx tsc --noEmit)
just install                      # npm install from lockfile
just add <pkg>                    # npm install <pkg>
just add-dev <pkg>                # npm install --save-dev <pkg>
just remove <pkg>                 # npm uninstall <pkg>
just build-android                # EAS cloud build for Android
just build-ios                    # EAS cloud build for iOS
just build-all                    # EAS cloud build for both platforms
```

Path alias `@/` resolves to repo root — configured in `tsconfig.json` and `metro.config.js`.

## Cross-Cutting Conventions

- **Styling**: Tailwind utility classes via `Uniwind` (not Nativewind). Theme is set once at `app/_layout.tsx:19`: `Uniwind.setTheme('light')`. Custom tokens: `primary-*` (brand blue), `secondary-*` (grays). Do not use raw hex colors in `className` — use the token names.
- **Screen wrapper**: Every tab screen uses `<SafeScreenWrapper>` + `<ScrollView>`. Do not add raw `<View>` roots on new screens.
- **Focus refresh**: Screens that show live data use `useFocusEffect` + `useCallback` to re-fetch when the tab is navigated to. Always use this pattern — not `useEffect` with no deps — so stale data doesn't linger.
- **Data access convention**: data fetching should go through `OfflineManager.apiGet` / `OfflineManager.apiPost`, falling back to `api.*` only when the operation is inherently online-only (e.g. login) or the verb isn't supported by `OfflineManager` (PATCH/DELETE — see Traps). `attendance.tsx`, `dashboard.tsx`, and `history.tsx` call `api.*` directly — see Module Status. Do not copy this pattern into new screens.
- **All backend routes live under `/api/v1`, including `/auth/*`.** Every path used in the app must start with `/api/v1/...` — this includes login/register, not just the `/api/v1`-prefixed data routes. See `docs/modules/auth.md`.
- **Auth token**: Not stored locally at all — `auth.currentUser.getIdToken()` (Firebase SDK) is called per-request in `api.ts`'s interceptor. Firebase persists its own refresh token via `getReactNativePersistence(AsyncStorage)` (native) / browser storage (web); there is no separate `stafy_token` key anymore.
- **User data cache**: Stored under key `stafy_userData` (JSON string) in `SecureStore`/`localStorage`. Populated after login via `getProfile()`; used to hydrate `UserContext` on cold start alongside Firebase's own `onAuthStateChanged`.
- **Offline queue key**: `@global_offline_queue` in `AsyncStorage`. Written by `OfflineManager.apiPost` when offline; drained by `OfflineManager.apiSync()` on reconnect. Reconnect sync is debounced 2 s in `_layout.tsx` to wait for connection stability.
- **Login/register are Firebase-first**: `login`/`register` in `UserContext.tsx` call the Firebase SDK directly (`signInWithEmailAndPassword` / `createUserWithEmailAndPassword`), then send the resulting ID token to the backend. `/api/v1/auth/register`'s JSON body is `{first_name, last_name, role}` only — email/password never reach the backend. See `stafy-mobile/docs/modules/auth.md`.
- **`onAuthStateChanged` is guarded by `isAuthenticating` (a ref) in `UserContext.tsx`.** Firebase fires this listener as soon as `createUserWithEmailAndPassword`/`signInWithEmailAndPassword` resolve internally — before `login()`/`register()` finish talking to the backend. Without the guard, the listener races ahead and calls `getProfile()` against a backend row that doesn't exist yet. `login()`/`register()` set the ref for their duration; the listener only handles cold-start hydration and out-of-band sign-outs.
- **Token expiry**: No longer tracked manually. `onAuthStateChanged` (Firebase SDK) drives both the cold-start redirect in `_layout.tsx` and `UserContext`'s hydration; the SDK silently refreshes the ID token before expiry.
- **Routing**: Expo Router file-based. Auth screens live in `app/(auth)/`; tab screens in `app/(tabs)/`. Cold start → `app/index.tsx` → immediately replaced by `_layout.tsx`'s `checkAuth` effect.
- **Icons**: `lucide-react-native` exclusively. Do not mix icon libraries.

## Storage Keys

| Key | Storage | Contents |
|---|---|---|
| `stafy_userData` | SecureStore / localStorage | Serialized `User` JSON |
| `@cache_{endpoint}` | AsyncStorage | `OfflineManager` GET cache, keyed by endpoint path |
| `@global_offline_queue` | AsyncStorage | Array of `{ endpoint, method, data, saveHour }` pending POST items |

## API Endpoints Consumed

| Screen / Service | Method | Path | Offline |
|---|---|---|---|
| `UserContext` login | POST | `/api/v1/auth/login` | No — auth only |
| `UserContext` register | POST | `/api/v1/auth/register` | No — auth only |
| `UserContext` getProfile | GET | `/api/v1/profile` | No — bootstrap only |
| `ActivitySelectorThemed` | GET | `/api/v1/users/me/settings/hourly-rates` | No ⚠ debt |
| `dashboard.tsx` | GET | `/api/v1/dashboard/me` | No ⚠ debt |
| `history.tsx` | GET | `/api/v1/dashboard/me` | No ⚠ debt |
| `history.tsx` delete | DELETE | `/api/v1/time-entries/{id}` | No ⚠ debt |
| `attendance.tsx` submit | POST | `/api/v1/time-entries/` | No ⚠ debt |
| `profile.tsx` rates | GET | `/api/v1/users/me/settings/hourly-rates` | No ⚠ debt |
| `profile.tsx` edit rate | PATCH | `/api/v1/users/me/settings/hourly-rates` | No ⚠ debt |
| `profile.tsx` add activity | POST | `/api/v1/users/me/settings/activities` | No ⚠ debt |
| `profile.tsx` delete activity | DELETE | `/api/v1/users/me/settings/activities/{id}` | No ⚠ debt |
| `dashboard.tsx` invitations | GET | `/api/v1/invitations/me` | No — deliberate, see `docs/modules/invitations.md` |
| `dashboard.tsx` accept invitation | POST | `/api/v1/invitations/{id}/accept` | No — deliberate |
| `dashboard.tsx` reject invitation | POST | `/api/v1/invitations/{id}/reject` | No — deliberate |

`time_entries` lives under top-level `/api/v1/time-entries`. The profile endpoint (`/api/v1/profile`) is flat, with no `{current_user: ...}` envelope. List responses use a `{data: [...]}` envelope. `hourly_rate_gross`, `rate_hour`, and `total_gross_salary` are JSON strings (`Decimal`, not `number`) — see `src/types/api.ts`.

## Traps

❌ **`OfflineManager.apiPost` is POST-only.** Items queued offline are always replayed with `api.post(item.endpoint, item.data)` in `apiSync`. Passing a PATCH or DELETE through the queue will fail silently or corrupt data.

❌ **The web build is a temporary stopgap, not a permanent platform.** In production this app is meant to be native-only (iOS/Android install); the web build exists only until the native apps are published to both stores (mainly blocked on the Apple Developer Program cost, not yet paid — see the phased rollout in `../LAUNCH-READINESS.md`). Its domain is `employee.stafy.ro` (Vercel) — don't add a second domain/subdomain for it. Don't design a feature that assumes the web build is a permanent, separate product — it's transitional and employee-only in practice, same as native.

❌ **Both platforms currently point at the local backend, Render is commented out.** `src/services/api.ts` sets `API_URL` to `process.env.EXPO_PUBLIC_API_URL ?? 'http://127.0.0.1:8000'` for every platform — the `Platform.OS === 'web'` branch that pointed native at `https://stafy-s5oi.onrender.com/` is commented out (kept for when Render is used again), not deleted. `EXPO_PUBLIC_API_URL` comes from `.env.local` (gitignored). **On a physical device, `127.0.0.1` resolves to the phone itself, not the dev machine** — set `EXPO_PUBLIC_API_URL` in `.env.local` to the dev machine's LAN IP (the same IP Metro prints on `just dev`, e.g. `http://192.168.0.172:8000`) to reach a local backend from a real phone; an emulator/simulator or the web build can keep `127.0.0.1`.

❌ **`user` is `null` before `UserContext` finishes hydration.** `isLoading` is `true` during hydration. Any screen that reads `user.*` must guard against `null`. The existing `// @ts-ignore` at `profile.tsx:146` is debt — do not copy it for new fields.

❌ **`ActivitySelectorThemed` fetches activities with bare `api.get`**, not `OfflineManager.apiGet`. It will fail if the device is offline; the component shows nothing and logs silently. Known debt — do not model new components after it.

❌ **`isSyncing` in `OfflineManager.ts` is a module-level variable.** If the process is killed mid-sync, the flag resets to `false` on next launch, which is correct. But two JS threads calling `apiSync()` concurrently would race — safe for now because React Native is single-threaded, but do not call `apiSync()` from a worker.

❌ **No TypeScript `strict` null-checking on context.** `useUser()` throws if called outside `UserProvider`, but components inside the provider still see `user: User | null`. TypeScript will not catch `user.first_name` accesses — you must add the null guard manually.

❌ **`stafy_token` no longer exists.** Auth moved to the Firebase SDK (`src/services/firebase.ts`) — the ID token is fetched per-request via `auth.currentUser.getIdToken()` in `api.ts`'s interceptor, never cached in storage. See `docs/modules/auth.md`.

❌ **`getReactNativePersistence` is missing from `firebase/auth`'s public TypeScript types** (known firebase-js-sdk gap — the runtime export exists, the aggregated `.d.ts` doesn't declare it). `src/services/firebase.ts` imports it behind a documented `@ts-expect-error`; do not "fix" this by removing the suppression.

❌ **Registration is two sequential calls** (`createUserWithEmailAndPassword` then `POST /api/v1/auth/register`). If the backend call fails after the Firebase account was created, the Firebase user is deliberately left in place (no rollback) — see `docs/modules/auth.md` "Special Aspects → Orphan registration" for the known case and its limits (no auto-recovery UI yet; login will surface a distinct "registration not finished" error instead of a wrong-password error).

❌ **`attendance.tsx`'s ORA START / ORA STOP pickers always share the same calendar day** (both are seeded from the single date `CalendarThemed` selects; only hour:minute changes independently). A night shift where ORA STOP's clock time is earlier than ORA START's is therefore chronologically *before* it as raw `Date` values — `calculateWorkedTime` already compensates for *display* by adding 24h when the diff is negative. `handleSaveToDb` must apply the same 24h correction to the `time_end` it actually submits (`getSubmissionTimeEnd`) — the backend rejects `time_end <= time_start` (`stafy-backend/stafy/time_entries/schemas.py:TimeEntryIn`), so skipping this breaks every night-shift submission with no visible cause.

❌ **Every endpoint path must start with `/api/v1/`, including `/auth/*`.** All routers, including `auth_router`, are mounted with `app.include_router(..., prefix="/api/v1")` in `stafy-backend/app/main.py`. Before adding a new endpoint call, verify the full path against `stafy-backend/app/main.py`'s `include_router` calls.

❌ **`onAuthStateChanged` in `UserContext.tsx` is guarded by an `isAuthenticating` ref.** Firebase notifies auth-state listeners as soon as `createUserWithEmailAndPassword`/`signInWithEmailAndPassword` resolve internally, which races ahead of `login()`/`register()`'s own backend calls. Without the guard, the listener calls `getProfile()` against a backend row that doesn't exist yet (or isn't synced yet) and clobbers `user` state with `null`. If you add new sign-in paths, set/clear this ref around them.

## Where to Look

| Task | Start here |
|---|---|
| Auth flow, login/register | `src/context/UserContext.tsx`; module doc: [`docs/modules/auth.md`](docs/modules/auth.md) |
| Firebase app/auth init | `src/services/firebase.ts` |
| Token attach to requests | `src/services/api.ts` — request interceptor, calls `auth.currentUser.getIdToken()` |
| Offline read (GET + cache) | `src/services/OfflineManager.ts` → `apiGet` |
| Offline write (POST + queue + sync) | `src/services/OfflineManager.ts` → `apiPost` / `apiSync` |
| Storage helpers (SecureStore / localStorage) | `src/services/storage.ts` |
| Cold-start auth check + reconnect sync | `app/_layout.tsx` |
| Tab navigation layout | `app/(tabs)/_layout.tsx` |
| Shared design-system components | `src/components/*Themed.tsx` |
| Theme tokens, Tailwind config | `global.css`, `metro.config.js` |
| Path alias `@/` resolution | `tsconfig.json` + `metro.config.js` |
| EAS build config, project ID | `eas.json`, `app.json` |
| Backend contract (routes, shapes, auth) | [`../stafy-backend/CLAUDE.md`](../stafy-backend/CLAUDE.md) |
| Manager-facing web client (this app blocks the `manager` role) | [`../stafy-web-app/CLAUDE.md`](../stafy-web-app/CLAUDE.md) |
