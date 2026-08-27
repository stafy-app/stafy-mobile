# Changelog

All notable changes to **Stafy Mobile** are documented here, newest first.
Format loosely follows [Keep a Changelog](https://keepachangelog.com); this
project uses `Added` / `Changed` / `Fixed` / `Removed` from v0.2.0 onward.

## [0.1.0] - 2026-08-27

First release. Employee time-tracking client for the Stafy platform — iOS,
Android, and Web from a single Expo codebase. Invite-only, employees only;
managers use the web dashboard.

### Added

- **Authentication** — Firebase email/password login and registration.
  Registration is a 4-step wizard (welcome → role → personal details → account).
  Password reset by email. Sessions persist across restarts; the ID token
  refreshes silently.
- **Manager block** — the `manager` role cannot use the mobile app; a dedicated
  screen points managers to the web dashboard.
- **Orphan-account recovery** — if a Firebase account exists without a matching
  backend record, `complete-registration` re-provisions it using the existing
  Firebase session, with no email/password re-entry.
- **Attendance** — create a time entry with date, time range, and activity type;
  duration is computed automatically. Night shifts (end time earlier than start
  on the same day) are corrected by +24h before submission. Known backend
  conflicts (duplicate entry, unknown activity) surface as Romanian messages.
  The activity selector resets on every visit so a stale selection can't be
  submitted.
- **Dashboard** — monthly summary of total hours and estimated gross pay, an
  activity-breakdown pie chart, and incoming team invitations with
  accept / reject actions. Accepting an invitation updates the user's company
  and manager immediately.
- **History** — chronological list of time entries, with delete.
- **Profile** — per-activity hourly rates (view, add, edit, delete). The rates
  section is read-only when the employee has joined another manager's company
  rather than their own. Shows name, role, and company.
- **Invitations** — accept or reject invitations addressed to the account's
  email. Register-time auto-join: registering with an email that has exactly one
  active invitation places the account directly into the inviting manager's
  company.
- **Offline support (partial)** — `OfflineManager` caches reads (GET) and queues
  writes (POST) with sync on reconnect (debounced 2s after connectivity
  returns).
- **Error tracking** — Sentry, active only when a DSN is configured (no dev
  noise). `send_default_pii` is off — the app handles salary data. Dev-only test
  screen for verifying Sentry capture.
- **Platforms** — iOS / Android / Web from one codebase. The web build is
  transitional until the native apps ship to the stores.
- **Localization** — Romanian throughout.

### Known limitations

- Offline queue replays POST only; `attendance`, `dashboard`, and `history` run
  online-only. Invitation actions are deliberately online-only.
- No push notifications.
- Native apps not yet published — web build in the interim.
- Requires the Stafy backend; `EXPO_PUBLIC_API_URL` must be configured (LAN IP on
  a physical device, `127.0.0.1` on an emulator or the web build).
- No automatic recovery if a Firebase account is created but backend
  provisioning fails — resolved via `complete-registration` on the next login.
