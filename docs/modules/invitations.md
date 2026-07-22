# Invitations

Employee-facing surface for invitations a manager has sent to the signed-in user's email. Lives on
the dashboard tab (`app/(tabs)/dashboard.tsx`), not a standalone screen. Backend design:
`stafy-backend/docs/modules/invitations.md`.

## Scope

**In scope:** fetching invitations addressed to the signed-in user's email; a card per pending
invitation shown above the rest of the dashboard content; accept and reject actions; refreshing
the cached profile and this month's dashboard data after acceptance so the new company's data
shows immediately.

**Out of scope (this release):** a standalone invitations screen/tab (this app only ever shows
invitations addressed to the current user, never a sent-invitations list — that's the manager-only
web client's page); push notifications for new invitations; offline queuing of accept/reject (see
Special Aspects); registration-time auto-join (handled entirely server-side, no client involvement
at all — see the backend doc).

---

## Actors

| Actor | Interface | Role |
|---|---|---|
| Employee | `stafy-mobile` dashboard tab | Sees invitations addressed to their own email, accepts or rejects each one |

---

## Data Objects

### Referenced (not owned)

- `IncomingInvitation` (`src/types/api.ts`) — mirrors the backend's `InvitationIncomingOut`: `id`,
  `invited_email`, `status`, `created_at`, `expires_at`, `responded_at`, `manager_name`,
  `company_name`. No client-owned entity — this screen only ever displays and responds to
  server-owned invitation state.

### Owned

None.

---

## Lifecycle

N/A from this client's point of view — it only ever sees invitations already in the `pending`
state (the backend's `GET /invitations/me` only returns live `pending` rows, post-sweep). Accept
and reject both remove the card from local state immediately; there is no client-visible
`accepted`/`rejected` display state to render.

---

## Derived / Aggregated Data

None. The dashboard renders exactly what `GET /invitations/me` returns, unfiltered.

---

## User Flows

1. Employee opens the dashboard tab → alongside the existing monthly summary fetch, the screen
   also fetches `GET /invitations/me`; any pending invitations render as cards above the rest of
   the dashboard content.
2. Employee taps Accept on a card → `POST /invitations/{id}/accept`; on success, the card is
   removed from local state, the cached profile is re-fetched (`company_id`/`manager_id` now point
   at the inviting manager's company), and the monthly dashboard data is re-fetched for the new
   company — all without waiting for the next cold start.
3. Employee taps Reject on a card → `POST /invitations/{id}/reject`; on success, the card is
   removed from local state. No profile/dashboard refresh needed — rejecting changes nothing about
   the employee's own account.
4. Both actions re-run on the next tab focus regardless (`useFocusEffect`), so a stale invitation
   list self-corrects even if a request silently failed.

---

## Information Architecture

No new route. Rendered inline at the top of `app/(tabs)/dashboard.tsx`, above the existing
hours/salary/pie-chart sections, conditionally (nothing renders if there are no pending
invitations). No modal — accept/reject are direct actions on the card itself, consistent with this
app's `DeletePopupThemed` being reserved for destructive, hard-to-reverse actions (time-entry
deletion); rejecting an invitation the user didn't ask for isn't in that category.

---

## UI / Layout

`IncomingInvitationCard` (`src/components/dashboard/IncomingInvitationCard.tsx`): white rounded
card, a leading building icon, a title naming the inviting manager and a subtitle naming the
company being joined, then a two-button row (reject, secondary style; accept, primary style) —
hand-rolled `TouchableOpacity` pair with `flex-1` each, matching `DeletePopupThemed`'s existing
two-button-row pattern rather than `ButtonThemed` (which is always full-width, no side-by-side
variant exists). Each button shows its own `ActivityIndicator` while its specific action is in
flight; the other button on the same card is disabled meanwhile, but other cards (a second
invitation from a different manager) stay fully interactive.

---

## Data Access

- `GET /api/v1/invitations/me` → `{data: IncomingInvitation[]}`. Called via bare `api.get`, not
  `OfflineManager.apiGet` — matches this screen's existing (documented-debt) pattern for its other
  dashboard fetch; see Special Aspects for why this one is a deliberate choice, not just inherited
  debt.
- `POST /api/v1/invitations/{id}/accept` → returns the caller's updated `User`, but the response
  body isn't consumed directly — `UserContext.refreshProfile()` re-fetches `/api/v1/profile`
  separately instead (see Special Aspects).
- `POST /api/v1/invitations/{id}/reject` → returns the updated invitation; response body not
  consumed, only success/failure matters.

---

## Special Aspects

**Accept/reject use bare `api.post`, not `OfflineManager.apiPost`, even though both are POST
verbs the queue could technically accept.** Queuing an accept while offline would report success
immediately with no actual server confirmation and no updated `company_id` — the UI would have
nothing correct to refresh to until the next sync, making "Accepted" a lie for however long the
device stays offline. Both actions need a real round trip to be meaningful, so they stay
online-only by design, not by omission.

**`UserContext.refreshProfile()` is new and deliberately bypasses `getProfile()`'s `isLoading`
toggle.** `getProfile()` sets the context's `isLoading` around itself, and `UserOnly`
(`src/components/ui/UserOnly.tsx`, wrapping every tab screen) unmounts its children entirely
whenever `isLoading` is true. Reusing `getProfile()` from `refreshProfile()` would blank the
dashboard mid-accept. `refreshProfile()` fetches `/api/v1/profile` and updates context state plus
the `stafy_userData` cache directly, without touching `isLoading`.

**Fetching invitations with bare `api.get` matches this screen's existing debt, deliberately, not
by accident.** `dashboard.tsx`'s own monthly-summary fetch is already bare `api.get` (documented
debt in `CLAUDE.md`). Making the new invitations fetch offline-aware while its sibling fetch on the
same screen stays online-only would split one screen across two data-access conventions for no
real gain — a user who can't act on an invitation offline anyway (see the point above) gets no
benefit from a cached list. Not a precedent for new screens elsewhere.

---

## Deferred

| Item | Trigger |
|---|---|
| Dedicated invitations screen | The dashboard becomes too crowded, or invitations need their own notification/badge outside the dashboard |
| Push notification on new invitation | Push infrastructure exists in this app (none today) |
