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
| `app/(auth)/login.tsx` | Live | Email + password login via `/auth/login` (multipart/form-data) |
| `app/(auth)/register.tsx` | Live | Registration via `/auth/register` (JSON); role selector: `employee` / `manager` |
| `app/(tabs)/attendance.tsx` | Live | Time-entry creation; offline-aware via `OfflineManager.apiPost` |
| `app/(tabs)/dashboard.tsx` | Live | Monthly hours + gross salary summary + pie chart; offline-aware via `OfflineManager.apiGet` |
| `app/(tabs)/history.tsx` | Live — has debt | Time-entry list; delete is online-only (`api.delete`); fetches via `OfflineManager.apiGet` |
| `app/(tabs)/profile.tsx` | Live — has debt | Hourly rates CRUD; edit (`api.patch`) and delete (`api.delete`) are online-only; null-guard missing on `user` |
| `src/services/OfflineManager.ts` | Live — incomplete | GET (cache) + POST (queue + sync) implemented; PATCH, DELETE, PUT not yet implemented (TODO) |
| `src/context/UserContext.tsx` | Live | Auth state, login/register/logout, profile fetch; `user` is null before hydration |
| `src/hooks/useUser.tsx` | Live | Thin wrapper over `UserContext`; throws if used outside `UserProvider` |
| `src/components/*Themed.tsx` | Live | Shared design-system components (Button, TextInput, Dropdown, Popup, Header, Footer…) |
| `src/components/attendance/` | Live | CalendarThemed, TimeSelectorThemed, ActivitySelectorThemed, CalculatorThemed |
| `src/components/dashboard/` | Live | InfoCard, PieChartData |
| `src/components/history/` | Live | HistoryTable |
| `src/components/profile/` | Live | ProfileInfo, HourlyRateCard, PopupEdit, PopupAddRate, TipCard |
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
- **Data access**: All data fetching goes through `OfflineManager.apiGet` / `OfflineManager.apiPost`. Only use `api.*` directly when the operation is inherently online-only (login, profile bootstrap) or when the `OfflineManager` does not yet support the HTTP verb needed.
- **Auth token**: Stored under key `stafy_token` in `SecureStore` (native) or `localStorage` (web). Read/written only through `src/services/storage.ts` helpers — never call `SecureStore` or `localStorage` directly.
- **User data cache**: Stored under key `stafy_userData` (JSON string) in `SecureStore`/`localStorage`. Populated after login via `getProfile()`; used to hydrate `UserContext` on cold start.
- **Offline queue key**: `@global_offline_queue` in `AsyncStorage`. Written by `OfflineManager.apiPost` when offline; drained by `OfflineManager.apiSync()` on reconnect. Reconnect sync is debounced 2 s in `_layout.tsx` to wait for connection stability.
- **Login form encoding**: `/auth/login` requires `multipart/form-data` (`username` + `password` fields) — the backend uses FastAPI's OAuth2PasswordRequestForm. All other endpoints use JSON.
- **Token expiry**: Checked on cold start in `_layout.tsx` via `jwtDecode`. Expired token → `deleteItem('stafy_token')` → redirect to `/login`. No background refresh — user must re-login.
- **Routing**: Expo Router file-based. Auth screens live in `app/(auth)/`; tab screens in `app/(tabs)/`. Cold start → `app/index.tsx` → immediately replaced by `_layout.tsx`'s `checkAuth` effect.
- **Icons**: `lucide-react-native` exclusively. Do not mix icon libraries.

## Storage Keys

| Key | Storage | Contents |
|---|---|---|
| `stafy_token` | SecureStore / localStorage | Firebase JWT (access token) |
| `stafy_userData` | SecureStore / localStorage | Serialized `User` JSON |
| `@cache_{endpoint}` | AsyncStorage | `OfflineManager` GET cache, keyed by endpoint path |
| `@global_offline_queue` | AsyncStorage | Array of `{ endpoint, method, data, saveHour }` pending POST items |

## API Endpoints Consumed

| Screen / Service | Method | Path | Offline |
|---|---|---|---|
| `UserContext` login | POST | `/auth/login` | No — auth only |
| `UserContext` register | POST | `/auth/register` | No — auth only |
| `UserContext` getProfile | GET | `/api/users/me/settings/profile` | No — bootstrap only |
| `ActivitySelectorThemed` | GET | `/api/users/me/settings/hourly-rates` | No ⚠ debt |
| `dashboard.tsx` | GET | `/dashboard/employee` | Yes (cache) |
| `history.tsx` | GET | `/dashboard/employee` | Yes (cache) |
| `history.tsx` delete | DELETE | `/dashboard/employee/time-entry/{id}` | No ⚠ debt |
| `attendance.tsx` submit | POST | `/dashboard/employee/time-entry` | Yes (queue) |
| `profile.tsx` rates | GET | `/api/users/me/settings/hourly-rates` | Yes (cache) |
| `profile.tsx` edit rate | PATCH | `/api/users/me/settings/hourly-rates` | No ⚠ debt |
| `profile.tsx` add activity | POST | `/api/users/me/settings/activities` | Yes (queue) |
| `profile.tsx` delete activity | DELETE | `/api/users/me/settings/activities/{id}` | No ⚠ debt |

## Traps

❌ **`OfflineManager.apiPost` is POST-only.** Items queued offline are always replayed with `api.post(item.endpoint, item.data)` in `apiSync`. Passing a PATCH or DELETE through the queue will fail silently or corrupt data.

❌ **`Platform.OS === 'web'` swaps the base URL.** Native points to `https://stafy-backend.onrender.com/`; web points to `http://127.0.0.1:8000/`. There is no `.env` file — the switch is hardcoded in `src/services/api.ts:7`. If you need a different backend URL, change it there.

❌ **`user` is `null` before `UserContext` finishes hydration.** `isLoading` is `true` during hydration. Any screen that reads `user.*` must guard against `null`. The existing `// @ts-ignore` at `profile.tsx:146` is debt — do not copy it for new fields.

❌ **`ActivitySelectorThemed` fetches activities with bare `api.get`**, not `OfflineManager.apiGet`. It will fail if the device is offline; the component shows nothing and logs silently. Known debt — do not model new components after it.

❌ **`isSyncing` in `OfflineManager.ts` is a module-level variable.** If the process is killed mid-sync, the flag resets to `false` on next launch, which is correct. But two JS threads calling `apiSync()` concurrently would race — safe for now because React Native is single-threaded, but do not call `apiSync()` from a worker.

❌ **No TypeScript `strict` null-checking on context.** `useUser()` throws if called outside `UserProvider`, but components inside the provider still see `user: User | null`. TypeScript will not catch `user.first_name` accesses — you must add the null guard manually.

## Where to Look

| Task | Start here |
|---|---|
| Auth flow, token storage, login/register | `src/context/UserContext.tsx` |
| Token attach to requests | `src/services/api.ts` — request interceptor |
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
