# Warrior Diet Fasting Tracker — Simplified Implementation Plan

> **Scope:** Android-only, self-hosted, all data on-device. No cloud accounts, no external analytics, no scaling concerns (1 user).
>
> **Primary goal:** Track fasting windows with a circular progress ring, hourly body-state estimates, streak goals, home-screen widget, and exact local notifications.

---

## 1. Product Summary

A personal fasting companion built around the Warrior Diet and related protocols (16/8, 18/6, 20/4, OMAD, etc.). The app shows:

- **Remaining time** and **elapsed time**
- A **circular ring** (pie-style fill) representing progress
- **Hourly body-state milestones** (glycogen depletion, ketosis, etc.) driven by a simple JSON file
- **Android home widget** built purely in React Native (no Kotlin)
- **Local exact notifications** (“Start fast now”, “Almost done”)

---

## 2. Extremely Simplified Tech Stack

| Layer | Choice | Why |
|-------|--------|-----|
| **App framework** | React Native (Expo SDK 52+) | Fast UI iteration. Stay entirely in JavaScript/TypeScript. |
| **Android widget** | `react-native-android-widget` | Zero Kotlin required. Build the widget with React components; the library translates to native Android views. |
| **Local database** | `expo-sqlite` (or AsyncStorage) | Single source of truth. For one user, a simple SQLite table or even a JSON string in AsyncStorage is fine. |
| **State (in-app)** | React Context | No Zustand/Jotai. Read from DB on load, put in Context, update DB when things change. |
| **Notifications** | `expo-notifications` | Request `SCHEDULE_EXACT_ALARM` permission to bypass Android battery savers. |
| **Datetime picker** | `@react-native-community/datetimepicker` | Native picker for start/end time edits. |
| **Circular ring UI** | `react-native-svg` | Simple SVG circle with `strokeDasharray` for the progress fill. |

---

## 3. Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    React Native App (JS/TS)                 │
│  Screens: Home | History | Goals | Settings                 │
│  Context: FastContext (reads/writes to DB)                  │
└──────────────────────────┬──────────────────────────────────┘
                           │ 1. User updates fast
                           ▼
┌─────────────────────────────────────────────────────────────┐
│               Local Storage (SQLite / AsyncStorage)         │
│  Stores: target_end_timestamp, start_timestamp, preset      │
└──────────────────────────┬──────────────────────────────────┘
                           │ 2. Trigger updates
┌──────────────────────────▼──────────────────────────────────┐
│                 Background Task / Widget                    │
│  react-native-android-widget reads timestamps, calculates   │
│  remaining time, and redraws the UI purely in JS.           │
└─────────────────────────────────────────────────────────────┘
```

### The "Timestamp" Principle

The app never runs a live timer in memory. You calculate `targetEndAt` once. The app and widget simply compare `Date.now()` to `targetEndAt` every minute to update the UI.

---

## 4. Simplified Data Model

Keep the database flat.

### 4.1 Active Fast (single object/row)

```ts
interface ActiveFast {
  isActive: boolean;
  protocolId: string;   // e.g. '20_4'
  startedAt: number;    // Unix timestamp
  targetEndAt: number;  // Unix timestamp
}
```

**Derived on the fly:**

```ts
remainingMinutes = targetEndAt - Date.now()
```

### 4.2 Completed Sessions (history list)

```ts
interface FastSession {
  id: string;
  startedAt: number;
  endedAt: number;
  wasGoalMet: boolean;
}
```

### 4.3 Protocol presets

| ID | Name | Typical fast |
|----|------|--------------|
| `16_8` | 16/8 | 16 h |
| `18_6` | 18/6 | 18 h |
| `20_4` | 20/4 | 20 h (Warrior default) |
| `22_2` | 22/2 | 22 h |
| `omad` | OMAD | 23 h |
| `custom` | Custom | user-defined |

Selecting a preset sets `targetEndAt = startedAt + presetHours`.

---

## 5. Core Engines

### 5.1 The "Nuke and Pave" Notification Engine

Do not try to edit or pause individual notifications — it leads to bugs. One function handles everything:

1. User changes fast time.
2. Call `Notifications.cancelAllScheduledNotificationsAsync()`.
3. Read new `targetEndAt`.
4. Schedule exact notification: **"Fast ends in 30 mins"** (`targetEndAt - 30m`).
5. Schedule exact notification: **"Fast complete!"** (`targetEndAt`).

Optional third notification on eating-window end: **"Start fast now!"** — same nuke-and-pave flow whenever schedule changes.

```ts
async function rescheduleNotifications(targetEndAt: number) {
  await Notifications.cancelAllScheduledNotificationsAsync();

  await Notifications.scheduleNotificationAsync({
    content: { title: 'Almost done', body: 'Fast ends in 30 minutes.' },
    trigger: { date: new Date(targetEndAt - 30 * 60 * 1000) },
  });

  await Notifications.scheduleNotificationAsync({
    content: { title: 'Fast complete!', body: 'Time to eat.' },
    trigger: { date: new Date(targetEndAt) },
  });
}
```

Request `SCHEDULE_EXACT_ALARM` on Android so these fire on time despite battery optimization.

### 5.2 Widget Engine

Using `react-native-android-widget`, design a component like `<WidgetText text={remainingTime} />`.

- Set up a **background task** that runs every **15 minutes** to update widget text from `targetEndAt - Date.now()`.
- Add a **Refresh** button on the widget to force an update if Android puts the background task to sleep.
- On every fast save/edit in the app, trigger an immediate widget redraw.

Widget should also show **streak count** and **weekly stars** if space allows — read same flat DB fields or a small streak snapshot written alongside `ActiveFast`.

### 5.3 Streak Engine (minimal)

```ts
interface StreakSnapshot {
  currentStreak: number;
  last7DaysMet: boolean[];  // 7 booleans for star row
}
```

On fast complete: if `endedAt - startedAt >= goalHours`, mark today as met in a simple `streak_days` table or JSON array. Recompute streak on read — no fancy caching needed for 1 user.

---

## 6. Body-State Timeline (JSON Config)

Keep this out of the database. Hardcode as `milestones.json` in the project.

```json
[
  { "hourStart": 0,  "hourEnd": 4,  "phase": "Fed",            "desc": "Insulin elevated; glucose primary fuel." },
  { "hourStart": 4,  "hourEnd": 8,  "phase": "Early Fasting", "desc": "Insulin falling; liver glycogen mobilization." },
  { "hourStart": 8,  "hourEnd": 14, "phase": "Glycogen Tap",  "desc": "Hepatic glycogen depletion accelerating." },
  { "hourStart": 14, "hourEnd": 20, "phase": "Fat Transition",  "desc": "Rising fat oxidation; ketones may appear." },
  { "hourStart": 20, "hourEnd": 36, "phase": "Light Ketosis",   "desc": "Ketones often detectable; appetite may dip." },
  { "hourStart": 36, "hourEnd": 72, "phase": "Deeper Ketosis",  "desc": "Fat-derived ketones primary for brain." }
]
```

UI checks `currentElapsedHours` against this array and displays the matching `phase` + `desc` on Home.

Profile note (v1): tuned for a generic slightly muscular, obese male — ketosis phases skew ~2–4 h later than lean defaults. Label as *estimates, not medical advice*.

---

## 7. UI / Screen Plan

### 7.1 Home (primary)

Quick-adjust buttons so minor corrections don't require a modal.

```
┌──────────────────────────────────────┐
│  [Protocol: 20/4 ▼]      [⚙]         │
│                                      │
│         ╭──────────────╮             │
│        ╱   14:32:08     ╲            │  ← Simple SVG ring
│       │    remaining     │           │
│        ╲   of 20:00     ╱            │
│         ╰──────────────╯             │
│   ● Fat Transition (est.)            │
│                                      │
│   Started: Jul 30, 8:00 PM  [Edit]   │
│   Ends:    Jul 31, 4:00 PM  [Edit]   │
│                                      │
│   ── Quick Adjust ───────────────    │
│   [ -15 Min ] [ +15 Min ] [ +1 Hr ]  │
│                                      │
│   ── Hour 14 ────────────────────    │
│   Fat oxidation increasing...        │
│                                      │
│   ★★★★★☆☆  Streak: 12 days           │
│                                      │
│   [ End Fast Early ]                 │
└──────────────────────────────────────┘
```

**Quick adjust:** each button updates `targetEndAt` (or `startedAt` if you prefer shifting start) → save to DB → nuke-and-pave notifications → refresh widget.

**Ring:** SVG circle, `strokeDasharray` = `(progress * circumference) circumference`, update on 1 s interval in-app (still derived from timestamps, not a drifting timer).

### 7.2 Other screens (minimal)

| Screen | Purpose |
|--------|---------|
| **History** | List of `FastSession` rows |
| **Goals** | Set daily target hours; drives `wasGoalMet` + streak |
| **Settings** | Default protocol, notification toggles, disclaimer |

---

## 8. Project Structure

```
WarriorDiet/
├── app/
│   ├── (tabs)/
│   │   ├── index.tsx          # Home + ring
│   │   ├── history.tsx
│   │   └── goals.tsx
│   └── settings.tsx
├── src/
│   ├── context/
│   │   └── FastContext.tsx
│   ├── db/
│   │   └── storage.ts         # SQLite or AsyncStorage helpers
│   ├── engines/
│   │   ├── notifications.ts   # nuke-and-pave
│   │   └── widget.ts          # widget update + background task
│   ├── components/
│   │   ├── FastingRing.tsx
│   │   └── WeeklyStars.tsx
│   └── data/
│       └── milestones.json
├── widgets/
│   └── FastingWidget.tsx      # react-native-android-widget component
├── app.json
└── PLAN.md
```

---

## 9. Build Order

1. **Expo project + FastContext + flat DB** — start/edit fast, timestamp math
2. **SVG ring + milestones.json** — Home screen complete
3. **Quick adjust + datetime picker** — edit start/end
4. **Nuke-and-pave notifications** — exact alarm permission
5. **Streaks + Goals** — weekly stars on Home
6. **Widget** — `react-native-android-widget` + 15 min background refresh + manual Refresh button

---

## 10. Dependencies

```json
{
  "dependencies": {
    "expo": "~52.x",
    "expo-router": "~4.x",
    "expo-sqlite": "~15.x",
    "expo-notifications": "~0.29.x",
    "expo-task-manager": "~12.x",
    "@react-native-community/datetimepicker": "8.x",
    "react-native-svg": "15.x",
    "react-native-android-widget": "latest"
  }
}
```

---

## 11. Quick Start

```bash
npx create-expo-app@latest WarriorDiet --template tabs
cd WarriorDiet
npx expo install expo-sqlite expo-notifications expo-task-manager \
  @react-native-community/datetimepicker react-native-svg react-native-android-widget
npx expo prebuild --platform android
```

Implement `ActiveFast` storage + `FastContext` first, ring second, widget last.

---

## 12. Disclaimer (first launch)

> This app provides general educational estimates about fasting physiology. It is not medical advice. Consult a healthcare provider before extended fasting.

---

*Document version: 2.0 — simplified plan.*
