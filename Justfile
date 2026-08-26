set windows-shell := ["powershell.exe", "-NoLogo", "-Command"]

# List available recipes
default:
    @just --list

# Start Metro bundler (scan QR for Expo Go)
dev:
    npx expo start

# Start web version → http://localhost:8081
web:
    npx expo start --web

# Run on Android emulator / device
android:
    npx expo run:android

# Run on iOS simulator (macOS only)
ios:
    npx expo run:ios

# TypeScript type-check — no emit, reports all type errors
lint:
    npx tsc --noEmit

# Install dependencies from lockfile
install:
    npm install

# Add a package: just add axios
add pkg:
    npm install {{ pkg }}

# Add a dev-only package: just add-dev @types/foo
add-dev pkg:
    npm install --save-dev {{ pkg }}

# Remove a package: just remove axios
remove pkg:
    npm uninstall {{ pkg }}

# Local static web export for Vercel (dist/) — no EAS, no cloud
build-web:
    npx expo export -p web

# EAS cloud build for Android
build-android:
    eas build --platform android

# EAS cloud build for iOS
build-ios:
    eas build --platform ios

# EAS cloud build for both platforms
build-all:
    eas build --platform all
