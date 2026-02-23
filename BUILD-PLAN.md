# pocketMeadery — Build Plan

**Target:** Ship by Wed Feb 25, 2026  
**Stack:** Expo (React Native) + TypeScript, SQLite, Expo Notifications

---

## Phase 1: Foundation (Day 1)

**Goal:** App runs, DB exists, theme wired.

| Order | What to build | TDD approach |
|-------|---------------|--------------|
| 1.1 | Expo project scaffold | Verify `expo start` runs |
| 1.2 | Theme tokens (light/dark) | Test theme values resolve; implement `theme.ts` |
| 1.3 | SQLite setup + migrations | Test: open DB, run migrations, assert `user_version` and tables exist |
| 1.4 | Migration v1 (all tables + indexes) | Test: run migration, verify schema |

**Deliverable:** App launches, DB initializes, migrations run.

---

## Phase 2: Data Layer (Day 1–2)

**Goal:** Repositories for all entities, ABV logic in place.

| Order | What to build | TDD approach |
|-------|---------------|--------------|
| 2.1 | `calculateABV(gravities[])` | Unit tests for OG/FG from earliest+latest, edge cases |
| 2.2 | Batch repository (CRUD) | Tests: create, getById, listActive, listCompleted, update |
| 2.3 | Ingredient repository | Tests: create, listByBatch, update, delete |
| 2.4 | Step repository | Tests: create, listByBatch (newest-first), update, delete |
| 2.5 | Step edit history | Tests: save previous state on edit, restore on undo |
| 2.6 | Reminder repository | Tests: create, listUpcoming, update, markCompleted |
| 2.7 | App settings repository | Tests: get/set units, theme |

**Deliverable:** All data access and ABV logic covered by tests.

---

## Phase 3: Notifications (Day 2)

**Goal:** Reminders schedule local notifications and deep-link to batch.

| Order | What to build | TDD approach |
|-------|---------------|--------------|
| 3.1 | Notification service (schedule, cancel) | Tests: mock Expo Notifications, assert correct payloads |
| 3.2 | Reminder templates (RACK_IN_DAYS, etc.) | Tests: template → title/body, relative vs absolute scheduling |
| 3.3 | Permission handling | Tests: denied → save reminder, mark unscheduled, show warning |
| 3.4 | Deep-link routing | Tests: notification payload → batch ID → navigate to batch detail |

**Deliverable:** Reminders fire, tap opens app and navigates to batch detail.

---

## Phase 4: Core UI (Day 2–3)

**Goal:** Navigation and main flows work end-to-end.

| Order | What to build | TDD approach |
|-------|---------------|--------------|
| 4.1 | Tab navigation (Dashboard, Completed, Settings) | Component test: tabs render, switching works |
| 4.2 | Settings screen | Test: units toggle persists |
| 4.3 | Batch creation flow | Test: form submit → batch created → appears in list |
| 4.4 | Dashboard screen | Test: active batches, next 3 reminders, New Batch CTA |
| 4.5 | Batch detail screen | Test: header, timeline, Add Step/Ingredient/Reminder |
| 4.6 | Step add/edit + undo | Test: add step, edit, undo restores previous |
| 4.7 | Ingredient add/edit | Test: add ingredient, edit, persists |
| 4.8 | Reminder creation UI | Test: pick template, set X days/hours or date → reminder created |
| 4.9 | Completed tab | Test: BOTTLED/ARCHIVED batches listed |

**Deliverable:** Full MVP flow in UI.

---

## Phase 5: Polish & Device (Day 3)

**Goal:** Runs on device, UX consistent.

| Order | What to build | TDD approach |
|-------|---------------|--------------|
| 5.1 | Date formatting (MM/DD/YYYY) | Unit test for formatter |
| 5.2 | Units display (US/Metric conversion) | Unit tests for conversion helpers |
| 5.3 | EAS dev build + install on iPhone | Manual: run on device, verify SQLite + notifications |
| 5.4 | Deep-link from cold start | Manual: kill app, tap notification, opens batch detail |

**Deliverable:** App installable and usable on real iPhone.

---

## Dependency Graph

```
scaffold → theme → SQLite/migrations
                        ↓
              ABV calc ← step/ingredient repos
                        ↓
              batch repo → reminder repo → settings repo
                        ↓
              notification service
                        ↓
              tab nav → Settings → Batch create → Dashboard → Batch detail → Completed
```

---

## Risk Notes

- **Notifications on iOS:** Test on device early; simulator behavior can differ.
- **SQLite on Expo:** Use `expo-sqlite`; confirm compatibility with Expo SDK.
- **TDD vs speed:** For simple screens, consider one integration test per flow if time is tight.
