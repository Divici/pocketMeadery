# On-Device MVP Readiness (iPhone)

## 1) Build setup (one-time)

- Ensure Apple Developer account access is configured for EAS.
- Authenticate:
  - `npx eas login`
- If this project is not yet linked in EAS:
  - `npx eas init`

## 2) Create iOS development build

- Build:
  - `npm run eas:build:ios:dev`
- Install the generated build on your iPhone from the EAS build page/QR.

## 3) Run app with local dev server

- Start dev server:
  - `npm start`
- Open the installed dev client on iPhone and connect to the project.

## 4) MVP functional checks on device

### Core data + SQLite

- Create a new batch with optional volume and goal ABV.
- Add ingredients and edit an ingredient.
- Add steps with and without gravity.
- Edit a step and use "Undo last edit".
- Close/reopen app; verify data persisted.

### ABV behavior

- With fewer than 2 gravity readings, expected/current ABV should show placeholder.
- With 2+ gravity readings, expected/current ABV should auto-update from earliest/latest.
- Edit a gravity step and confirm ABV updates.

### Reminders + notifications

- Create reminder from template using relative schedule.
- Create reminder with specific future date.
- Confirm reminder appears in Dashboard next 3 list.
- Allow notifications and confirm alert fires on device.
- Tap notification and confirm app opens directly to linked batch detail.
- Deny notification permission and confirm reminder still saves with warning behavior.

### Status + completed flow

- Change batch status to `BOTTLED` or `ARCHIVED`.
- Confirm batch appears in Completed tab and is removed from active list.

### Units + dates

- Toggle settings between `US` and `metric`.
- Confirm ingredient amounts and batch volume display converted values.
- Confirm date displays are in `MM/DD/YYYY`.

## 5) Pre-MVP ship sanity checks

- Run tests: `npm test`
- Verify no local runtime errors in dev client.
- Confirm at least one full end-to-end batch lifecycle works:
  - create -> add ingredients -> add steps -> add reminder -> complete batch.
