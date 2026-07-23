# BoothBoost

Expo Router lead-capture app (frontend), reconstructed from the file dump you uploaded.

## What's in this zip

All 15 frontend files, in their correct paths:

```
app/
  _layout.tsx
  success.tsx
  lead/[id].tsx
  (tabs)/_layout.tsx
  (tabs)/index.tsx
  (tabs)/capture.tsx
  (tabs)/leads.tsx
src/
  api.ts
  theme.ts
  constants/tags.ts
  utils/storage/index.ts
  components/Orb3D.tsx
  components/Orb3D.web.tsx
  components/TagChip.tsx
  components/LeadCard.tsx
package.json, app.json, babel.config.js, tsconfig.json, .gitignore, setup.sh
```

## What's NOT in this zip (you need to add these yourself)

1. **Backend** — `backend/server.py`, `backend/requirements.txt`, `backend/.env`. The dump you
   gave me only contained the frontend files, so I couldn't reconstruct these. Copy them in from
   wherever Emergent generated them before you push.
2. **Fonts** — `assets/fonts/Rajdhani-Bold.ttf`, `Rajdhani-SemiBold.ttf`, `Rajdhani-Medium.ttf`,
   `DMSans-Regular.ttf`, `DMSans-Medium.ttf`, `DMSans-Bold.ttf`. Grab them from Google Fonts and
   drop them in `assets/fonts/`.
3. **`.env`** — needs `EXPO_PUBLIC_BACKEND_URL` pointing at your backend (this is read in `src/api.ts`).
   Never commit this file — `.gitignore` already excludes it.

## Dependencies detected from your code's imports

Extracted directly from every `import ... from` line in the dump:

- expo-router, expo-font, expo-splash-screen, expo-status-bar
- expo-linear-gradient, expo-haptics, expo-clipboard, expo-sharing, expo-file-system
- @react-native-async-storage/async-storage
- @shopify/react-native-skia (used by `Orb3D.tsx`, with a `.web.tsx` fallback for browser)
- @expo/vector-icons
- react-native-gesture-handler, react-native-reanimated, react-native-safe-area-context

`setup.sh` installs these with `npx expo install` rather than pinned versions in package.json,
because that command resolves the exact versions compatible with whatever Expo SDK you're on
(SDK 56 is current as of mid-2026) — hand-pinning them risks a version mismatch that `expo-doctor`
will flag.

## Running it (on Kali)

```bash
unzip BoothBoost.zip
bash BoothBoost/setup.sh
```

This installs all dependencies, then commits and pushes to
`https://github.com/rintuchowdory/BoothBoost.git`. Edit `REMOTE_URL` at the top of `setup.sh` first
if that's not the right repo.

⚠️ **Security**: rotate/revoke any GitHub token, Groq key, or Supabase secret you've pasted into a
chat before — treat anything shared in a conversation as compromised, generate a fresh token for
this push, and let git prompt you for it rather than hardcoding it in a script.
