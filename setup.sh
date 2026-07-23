#!/usr/bin/env bash
# BoothBoost - one-shot dependency install + GitHub push (run on Kali)
# Usage: bash setup.sh
set -euo pipefail

PROJECT_DIR="BoothBoost"
REMOTE_URL="https://github.com/rintuchowdory/BoothBoost.git"

echo "==> 1/5  Checking prerequisites (node, npm, git)"
command -v node >/dev/null || { echo "node not found. Install Node.js 20 LTS first."; exit 1; }
command -v git  >/dev/null || { echo "git not found: sudo apt install -y git"; exit 1; }

echo "==> 2/5  Entering project directory: $PROJECT_DIR"
cd "$PROJECT_DIR"

echo "==> 3/5  Installing core Expo deps (versions resolved to match your Expo SDK)"
if ! npm ls expo >/dev/null 2>&1; then
  echo "    expo package missing -- installing it first so 'expo install' has an SDK to resolve against"
  npm install expo@~56
fi
npx --yes expo install \
  expo-router expo-font expo-splash-screen expo-status-bar \
  expo-linear-gradient expo-haptics expo-clipboard expo-sharing \
  expo-file-system \
  @react-native-async-storage/async-storage \
  @shopify/react-native-skia \
  @expo/vector-icons \
  react-native-gesture-handler react-native-reanimated react-native-safe-area-context

echo "==> 3.5/5  npm install (fallback for anything expo install skipped, e.g. transitive/root deps)"
npm install

echo "==> 4/5  Git init + commit"
if [ ! -d .git ]; then
  git init
  git branch -M main
fi
git add .
git commit -m "BoothBoost lead capture app" || echo "Nothing new to commit"

echo "==> 5/5  Pushing to GitHub"
if ! git remote | grep -q origin; then
  git remote add origin "$REMOTE_URL"
fi
echo "You'll be prompted for GitHub credentials — use a FRESH personal access token, not your password."
git push -u origin main

echo "Done. Repo: $REMOTE_URL"
