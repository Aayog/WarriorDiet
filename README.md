# Warrior Diet — MVP

Minimal Android fasting tracker. All data stays on-device (AsyncStorage). No cloud, no accounts.

## What's included

- **Fast tab** — circular progress ring, live countdown, body-phase estimates, quick adjust (±15m, +1h), edit start/end times
- **History** — completed fasts with goal-met badge
- **Goals** — daily target hours, default protocol, notification toggle, streak stars on Home
- **Notifications** — nuke-and-pave: 30 min warning + fast complete (needs a dev build on Android, not Expo Go)

## What's deferred (post-MVP)

- Home-screen widget (`react-native-android-widget` needs prebuild + extra native setup)
- Extended 7-day water fast UI (milestones JSON already goes to 168h)

## Run locally (free — no EAS required)

```bash
npm install
npm start          # Expo dev server — scan QR with Expo Go for UI testing
npm run web        # Browser preview (notifications disabled on web)
```

### Android with notifications

Notifications and exact alarms require a **development build**, not Expo Go:

```bash
npx expo prebuild --platform android
npx expo run:android
```

Or build APK on your machine without EAS cloud:

```bash
cd android && ./gradlew assembleDebug
# APK: android/app/build/outputs/apk/debug/app-debug.apk
```

## Stack (minimal)

| Package | Purpose |
|---------|---------|
| Expo SDK 57 | App shell |
| AsyncStorage | Local persistence |
| react-native-svg | Progress ring |
| expo-notifications | Local alerts |
| datetimepicker | Edit start/end |

## Data model

Single active fast: `{ startedAt, targetEndAt, protocolId }`. Everything else is derived from timestamps.

See [PLAN.md](./PLAN.md) for full design notes.
