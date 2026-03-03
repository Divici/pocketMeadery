# Pocket Meadery

A local-first mead brewing log app for tracking batches, steps, gravity readings, and reminders—built for iOS with React Native (Expo).

## What it is

Pocket Meadery is a **React Native (Expo SDK 54)** app written in **TypeScript**, with a **normalized SQLite schema** (6 core tables, indexed query paths, manual SQL migrations via `PRAGMA user_version`). It’s designed as a local-first relational system with clear repository boundaries and stable IDs so it can support future cloud diff-sync, while keeping the MVP free of Firebase and other cloud complexity.

**Features:**

- **Batch lifecycle tracking** — Create and manage mead batches with status, ingredients, and timeline.
- **Structured step logging** — Timeline steps with optional gravity, notes, and **one-level undo** per step.
- **ABV from gravity** — Goal, expected, and current ABV derived from gravity readings.
- **Reminders** — Preset templates, persisted and scheduled via **expo-notifications**, with indexed queries for the dashboard.
- **Units** — Toggle between US and metric.
- **Dashboard** — Aggregation of active batches and upcoming reminders.

## Tech

- **Expo SDK 54** · **TypeScript** · **SQLite** (manual migrations)
- **expo-notifications** for local reminders
- Themed UI (light/dark) with a wine/honey palette

## Run

```bash
npm install
npx expo start
```

Then open in the Expo Go app on your device or use an iOS simulator.
