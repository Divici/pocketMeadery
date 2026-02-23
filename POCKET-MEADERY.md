# pocketMeadery (iOS) — Project Spec

## TL;DR
PocketMeadery is an iOS-first mead brewing log app with an offline-first local database, timeline-based batch tracking, structured + freeform logging, and reminder templates for next actions. MVP is deployable to a real iPhone via Expo and supports creating/updating batches, adding steps with timestamps, tracking gravity readings per step, and scheduling reminders.

---

## 1) Goals

### MVP Goals (Ship by Wed Feb 25, 2026)
- Deployable iOS app usable on a real iPhone (internal/dev build acceptable; App Store submission can be post-MVP).
- Track mead “batches” (recipes) with:
  - ingredients (structured core + optional notes)
  - steps/log entries (timeline)
  - timestamps for creation + updates
  - gravity per step (optional)
  - expected ABV vs calculated/actual ABV that updates as gravity readings are added
- Update recipes by adding/editing steps and ingredients.
- Preset reminder templates (rack in X days, nutrient in X hours, etc.) that fire local notifications and open the app.
- Dashboard home screen:
  - cards for each active batch
  - next 3 reminders
  - “New Batch” button
  - completed batches accessible at bottom or separate tab

### Post-MVP Goals
- Accounts + cloud backend (Firebase Auth) + diff-based sync (only changes).
- Photo attachments.
- Optional automatic iCloud backup.

---

## 2) Non-Goals (MVP)
- No cloud sync in MVP (design for it, don’t implement).
- No photo storage in MVP.
- No iCloud backup automation in MVP.
- No complex nutrient protocol engine beyond preset reminder templates.
- No collaboration/multi-user boards; single-user experience is fine for MVP even if auth is future.

---

## 3) Target Users
- Home meadmakers who want to track batches over months with structured readings and freeform notes.
- Primary user = the developer (personal utility), but quality should be App Store ready post-MVP.

---

## 4) Tech Stack (MVP)
- Expo (React Native) + TypeScript
- SQLite local storage (manual SQL migrations)
- Expo Notifications (local notifications)
- Styling: theme tokens (light + dark); use burgundy/wine + honey palette

### Why this stack
- Works on Windows dev machine.
- Best chance to ship an iPhone-deployable MVP quickly using Cursor agents.
- SQLite supports offline-first and later diff-sync with cloud.

---

## 5) Product Decisions (Locked)

- Future public app with accounts + cloud backend **after MVP**
- Step editing keeps **one-level history** (one edit back per step)
- Ingredients are **hybrid** (structured core + optional notes)
- Gravity is an **optional structured field per step**
- Units system: **US + metric selectable**
- Reminders: **preset templates**
- Batches have a **status**
- Photos: **post-MVP**
- ABV: track **goal vs expected vs actual/current**; expected/current are gravity-derived from earliest+latest readings
- Storage: local-first; **manual “push to cloud”** post-MVP
- DB: SQLite with manual migrations

---

## 6) Core UX

### Primary navigation (MVP)
- Tabs (recommended):
  1) Dashboard
  2) Completed
  3) Settings

### Dashboard (MVP)
- Section: Active batch cards
  - active means statuses: ACTIVE_PRIMARY | SECONDARY | AGING
  - batch name
  - status badge
  - last updated
  - current best-known ABV (estimated)
  - quick actions: Add Step, Add Reminder
- Section: Next 3 reminders
  - reminder label
  - scheduled time
  - linked batch
- Primary CTA: “New Batch”

### Batch detail (timeline-first)
- Header: name, status, created date, goal ABV, expected ABV, current estimated ABV
- Timeline feed:
  - Each entry shows date + optional gravity + pencil edit icon on the same line
  - Notes underneath
  - Add Step button
  - Add Ingredient Addition button (optional in MVP)
  - Add Reminder button

---

## 7) Data Model

### Entities
- Batch (a “recipe / batch”)
- Ingredient (structured rows, tied to batch)
- Step (timeline entry, tied to batch; optional gravity)
- StepEditHistory (one-level undo per step)
- Reminder (local notification metadata; linked to batch; template-based)
- Settings (units preference, theme preference)

---

## 8) SQLite Schema (MVP)

### Table: batches
- id TEXT PRIMARY KEY (uuid)
- name TEXT NOT NULL
- created_at INTEGER NOT NULL (unix ms)
- updated_at INTEGER NOT NULL (unix ms)
- status TEXT NOT NULL  -- enum: ACTIVE_PRIMARY | SECONDARY | AGING | BOTTLED | ARCHIVED
- batch_volume_value REAL NULL
- batch_volume_unit TEXT NULL  -- e.g., "gal" | "L"
- notes TEXT NULL  -- optional batch-level notes
- goal_abv REAL NULL      -- user-entered target ABV
- expected_abv REAL NULL  -- gravity-derived expected ABV estimate
- current_abv REAL NULL   -- computed best-known estimate

### Table: ingredients
- id TEXT PRIMARY KEY (uuid)
- batch_id TEXT NOT NULL REFERENCES batches(id) ON DELETE CASCADE
- name TEXT NOT NULL
- amount_value REAL NULL
- amount_unit TEXT NULL    -- "lb", "kg", "oz", "g", etc.
- ingredient_type TEXT NULL -- "HONEY" | "YEAST" | "NUTRIENT" | "FRUIT" | "ADDITION" | "OTHER"
- notes TEXT NULL
- created_at INTEGER NOT NULL
- updated_at INTEGER NOT NULL

### Table: steps
- id TEXT PRIMARY KEY (uuid)
- batch_id TEXT NOT NULL REFERENCES batches(id) ON DELETE CASCADE
- occurred_at INTEGER NOT NULL  -- when the step happened (unix ms)
- created_at INTEGER NOT NULL
- updated_at INTEGER NOT NULL
- title TEXT NULL               -- optional short label (e.g. "Racked to secondary")
- notes TEXT NOT NULL
- gravity REAL NULL             -- optional, per your decision
- temperature_value REAL NULL   -- optional (post-MVP okay but leave column optional if desired)
- temperature_unit TEXT NULL    -- "F" | "C"
- is_deleted INTEGER NOT NULL DEFAULT 0

### Table: step_edit_history (one-level undo)
- step_id TEXT PRIMARY KEY REFERENCES steps(id) ON DELETE CASCADE
- previous_notes TEXT NOT NULL
- previous_gravity REAL NULL
- previous_title TEXT NULL
- previous_occurred_at INTEGER NOT NULL
- saved_at INTEGER NOT NULL

### Table: reminders
- id TEXT PRIMARY KEY (uuid)
- batch_id TEXT NOT NULL REFERENCES batches(id) ON DELETE CASCADE
- template_key TEXT NOT NULL -- e.g., "RACK_IN_DAYS", "NUTRIENT_IN_HOURS", "CUSTOM"
- title TEXT NOT NULL
- body TEXT NULL
- scheduled_for INTEGER NOT NULL -- unix ms
- notification_id TEXT NULL      -- platform notification id
- created_at INTEGER NOT NULL
- updated_at INTEGER NOT NULL
- is_completed INTEGER NOT NULL DEFAULT 0
- completed_at INTEGER NULL

### Table: app_settings
- key TEXT PRIMARY KEY
- value TEXT NOT NULL

---

## 9) Manual SQL Migrations (MVP)
- Use a `PRAGMA user_version` strategy.
- On app launch:
  1) open DB
  2) read user_version
  3) run incremental migrations to latest
  4) set new user_version

Migrations to include from day 1:
- v1: create all MVP tables + indexes
- indexes:
  - steps(batch_id, occurred_at desc)
  - ingredients(batch_id)
  - reminders(scheduled_for asc)
  - batches(status, updated_at desc)

---

## 10) Business Logic

### ABV
- Compute ABV estimate using standard approximation:
  - ABV ≈ (OG - FG) * 131.25
- “Goal ABV”:
  - user-entered target ABV at batch creation (optional) and editable later.
- “Expected ABV” (gravity-derived):
  - derived from earliest gravity reading (OG-ish) + latest gravity reading (FG-ish), using occurred_at ordering.
  - recalculates as gravity readings are added/edited.
- “Current ABV”:
  - use earliest recorded gravity as OG candidate
  - use latest recorded gravity as FG candidate
  - if only one reading exists, ABV is unknown/placeholder
- Display rules:
  - show “—” if insufficient data
  - always show goal, expected, and current

### One-level undo for step edits
- When editing a step:
  - before save, write previous fields (title, notes, gravity, occurred_at) to `step_edit_history` (overwrite any existing row for that step)
  - update step updated_at
- Provide an “Undo last edit” action in the edit UI for that step.

### Units
- Settings: user selects “US” or “Metric”
- Store amounts as entered (value + unit), but display with user preference.
- MVP conversion scope:
  - convert common units: lb↔kg, oz↔g, gal↔L
  - if unit not recognized, display as-is

---

## 11) Notifications (MVP)
- Expo local notifications.
- Behavior:
  - reminder fires
  - tap opens app
  - tap deep-links directly to the linked batch detail
- Preset templates (MVP):
  - Rack in X days
  - Nutrient addition in X hours
  - Degas in X hours
  - Stabilize in X days
  - Bottle in X days
- Scheduling:
  - allow both relative scheduling ("in X hours/days" from now) and specific future date/time scheduling
  - store reminder row in SQLite
  - store returned `notification_id` for cancellation/reschedule later
  - if notification permission is denied, still save reminder row and mark/show it as unscheduled with a warning state

---

## 12) UI Requirements

### Date display
- Display dates as `MM/DD/YYYY` for headings.
- Steps show:
  - first line: formatted date + gravity (if present) + edit pencil icon
  - second line: notes

### Theme tokens
Light:
- background: #F6F0E3
- surface: #FFFFFF
- primary (wine): #6B1F1A
- accent (honey): #E4B95E
- border: #E2D7C3
- text: #2F211B
- muted: #6E5A4F

Dark:
- background: #1C1412
- surface: #2A201C
- primary (wine): #9E3B34
- accent (honey): #D4A843
- border: #3A2B26
- text: #F1E8E2
- muted: #BCAEA6

---

## 13) MVP Feature Checklist (Acceptance Criteria)

### Dashboard
- [ ] Shows a card for each active batch (ACTIVE_PRIMARY | SECONDARY | AGING)
- [ ] Shows next 3 upcoming reminders (not completed)
- [ ] New Batch button creates a new batch flow

### Batch creation
- [ ] Can create batch with name, status, (optional) volume + unit, (optional) goal ABV
- [ ] Created batch appears on dashboard

### Ingredients
- [ ] Add structured ingredient lines (name, optional amount/unit/type, optional notes)
- [ ] Edit ingredient
- [ ] Ingredients persist in SQLite

### Steps / Timeline
- [ ] Add step with occurred date + notes + optional gravity
- [ ] Edit step shows pencil icon
- [ ] One-level undo works for the step
- [ ] Steps ordered by occurred_at descending (newest-first)

### ABV
- [ ] Goal ABV displayed
- [ ] Expected ABV displayed (gravity-derived)
- [ ] Current ABV auto-calculates from earliest + latest gravities when available
- [ ] Updates when new gravity steps are added/edited

### Reminders
- [ ] Create reminder from template with “in X hours/days” and/or specific future date/time
- [ ] Reminder fires local notification
- [ ] Tap notification opens app directly to linked batch detail
- [ ] If notification permissions are denied, reminder still persists with unscheduled warning state

### Completed batches access
- [ ] Completed list (BOTTLED/ARCHIVED) accessible in a dedicated Completed tab

---

## 14) Post-MVP Roadmap

### Phase 2 (Public App Foundations)
- Firebase Auth (email/password + Google/Apple)
- Cloud Firestore (or equivalent) storage model
- Diff-based sync design:
  - `updated_at` timestamps + per-table change tracking
  - “Push changes” button uploads only changed rows
  - conflict strategy: last-write-wins for MVP sync

### Phase 3 (Delighters)
- Photo attachments to steps/readings
- Batch export (PDF / shareable “brew log”)
- Smart nutrient plan generator
- Inventory + cost tracking

---

## 15) Risks & Mitigations

- Risk: Expo notification edge cases on iOS
  - Mitigation: keep MVP as “fire + open app”, store scheduled metadata in DB, test on device early
- Risk: Schema changes mid-build
  - Mitigation: migrations from day 1 (user_version), keep tables minimal but extensible
- Risk: Scope creep within 48–72 hours
  - Mitigation: strict MVP checklist above; photos/cloud are explicitly post-MVP

---

## 16) Build/Deploy Plan (MVP)
- Use Expo dev build or Expo Go for fastest iteration.
- For a “deployed app on phone” MVP:
  - create an Expo development build (EAS) and install on iPhone
  - confirm notifications + SQLite persistence on device

---

## 17) Definition of Done (MVP)
- App runs on iPhone
- You can create a batch, add ingredients, add step logs with dates and optional gravity
- ABV updates as gravities are logged
- Reminders can be created from templates and fire a local notification
- Dashboard shows active batches and next 3 reminders
- Completed batches are accessible in a separate view or bottom section