# DNSChat Development Environment Setup

**Last updated:** 2025-10-03
**Target:** Expo SDK 54.0.12 | React Native 0.81.4 | React 19.1.0

This guide walks you through setting up a complete DNSChat development environment from scratch. Follow the steps in order for your platform.

---

## Prerequisites

### All Platforms

- **Git:** Version control (https://git-scm.com/)
- **Node.js:** 20.19.1 LTS (enforced via `.nvmrc`)
- **npm:** ≥10.8.2 (ships with Node 20.19.x)
- **Watchman:** File watcher for Metro bundler (macOS/Linux)

### Node.js Installation

We use [nvm (Node Version Manager)](https://github.com/nvm-sh/nvm) to lock the Node.js version:

```bash
# Install nvm (if not already installed)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash

# Restart your shell, then in the project directory:
nvm install  # reads .nvmrc (20.19.1)
nvm use      # activates it for this shell

# Verify
node --version  # should output v20.19.1
npm --version   # should be ≥10.8.2
```

**Windows users:** Use [nvm-windows](https://github.com/coreybutler/nvm-windows) or install Node 20.19.1 directly from nodejs.org.

---

## macOS Setup

### 1. Xcode (iOS Development)

- **Xcode 16.x** required (App Store or https://developer.apple.com/xcode/)
- **Command Line Tools:**
  ```bash
  xcode-select --install
  ```
- **Rosetta 2** (Apple Silicon only, for Intel simulator support):
  ```bash
  softwareupdate --install-rosetta --agree-to-license
  ```
- **Accept Xcode license:**
  ```bash
  sudo xcodebuild -license accept
  ```

### 2. CocoaPods (iOS dependency manager)

```bash
# Install (requires Ruby, pre-installed on macOS)
sudo gem install cocoapods

# Verify
pod --version  # should be ≥1.15.0
```

### 3. Watchman (Metro bundler performance)

```bash
brew install watchman
```

### 4. Java 17 (Android Development)

DNSChat's Android build requires **Java 17** (not Java 24 or higher).

#### Option A: Homebrew (Recommended)

```bash
# Install OpenJDK 17
brew install openjdk@17

# Verify installation
/opt/homebrew/opt/openjdk@17/bin/java -version
# Expected: openjdk version "17.0.x"

# Set JAVA_HOME for your shell (add to ~/.zshrc or ~/.bash_profile)
echo 'export JAVA_HOME=/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home' >> ~/.zshrc
echo 'export PATH=/opt/homebrew/opt/openjdk@17/bin:$PATH' >> ~/.zshrc
source ~/.zshrc

# Verify JAVA_HOME
echo $JAVA_HOME
# Expected: /opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home
```

**Intel Mac:** Replace `/opt/homebrew` with `/usr/local` in paths above.

#### Option B: Manual Install

Download **Eclipse Temurin 17** from https://adoptium.net/temurin/releases/?version=17 and set `JAVA_HOME` manually.

#### Helper Script (Temporary Override)

The repo includes `android-java17.sh` for temporary Java 17 environment:

```bash
source android-java17.sh  # sets JAVA_HOME for current shell only
```

This is useful if you have multiple Java versions and don't want to change your default.

### 5. Android Studio (Android Development)

- **Download:** https://developer.android.com/studio
- **Install these SDK components via SDK Manager:**
  - Android SDK Platform 35 (matches `targetSdkVersion`)
  - Android SDK Build-Tools 35.0.0
  - Android Emulator
  - Android SDK Platform-Tools
  - Intel x86 Emulator Accelerator (HAXM) for Intel Macs

- **Set ANDROID_HOME** (add to `~/.zshrc` or `~/.bash_profile`):
  ```bash
  export ANDROID_HOME=$HOME/Library/Android/sdk
  export PATH=$PATH:$ANDROID_HOME/emulator:$ANDROID_HOME/platform-tools
  ```

- **Verify:**
  ```bash
  adb --version      # should show Android Debug Bridge
  emulator -version  # should show emulator version
  ```

---

## Windows Setup

### 1. Node.js

- Install Node 20.19.1 from [nodejs.org](https://nodejs.org/) or use [nvm-windows](https://github.com/coreybutler/nvm-windows)

### 2. Java 17 (Android Development)

- Download **Eclipse Temurin 17** from https://adoptium.net/temurin/releases/?version=17
- Set `JAVA_HOME` environment variable:
  - System Properties → Environment Variables → New System Variable
  - Variable name: `JAVA_HOME`
  - Variable value: `C:\Program Files\Eclipse Adoptium\jdk-17.0.x-hotspot` (adjust for your install path)
  - Add `%JAVA_HOME%\bin` to `Path`

### 3. Android Studio

- Download from https://developer.android.com/studio
- Install SDK components (same as macOS: Platform 35, Build-Tools 35.0.0, etc.)
- Set `ANDROID_HOME`:
  - Default: `C:\Users\<YourUsername>\AppData\Local\Android\Sdk`
  - Add to `Path`: `%ANDROID_HOME%\platform-tools`, `%ANDROID_HOME%\emulator`

---

## Linux Setup

### 1. Node.js

```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
# Restart shell, then:
nvm install 20.19.1
nvm use 20.19.1
```

### 2. Watchman

```bash
# Ubuntu/Debian
sudo apt-get install watchman

# Fedora
sudo dnf install watchman

# Build from source if not in repos: https://facebook.github.io/watchman/docs/install.html
```

### 3. Java 17

```bash
# Ubuntu/Debian
sudo apt install openjdk-17-jdk

# Fedora
sudo dnf install java-17-openjdk-devel

# Verify
java -version  # should show 17.0.x
```

### 4. Android Studio

- Download from https://developer.android.com/studio
- Extract and run `studio.sh`
- Install SDK components as described above
- Set `ANDROID_HOME` in `~/.bashrc` or `~/.zshrc`:
  ```bash
  export ANDROID_HOME=$HOME/Android/Sdk
  export PATH=$PATH:$ANDROID_HOME/emulator:$ANDROID_HOME/platform-tools
  ```

---

## Project Setup (All Platforms)

Once your toolchain is ready:

```bash
# 1. Clone the repository
git clone https://github.com/mneves75/dnschat.git
cd dnschat

# 2. Install Node dependencies
npm install  # uses package-lock.json for deterministic installs

# 3. (Optional) Verify environment
npx expo-doctor  # checks Expo config and toolchain

# 4. (Optional) Dry-run version sync
npm run sync-versions:dry  # ensures marketing/build numbers aligned
```

---

## Running the App

### iOS (macOS only)

```bash
# Starts Metro and builds for simulator
npm run ios

# The first run regenerates ios/ folder and runs `pod install`
# If you encounter CocoaPods issues, run:
npm run fix-pods  # or manually: cd ios && rm -rf Pods/ && pod install
```

### Android

```bash
# Ensure Java 17 is active (check with `java -version`)
# If using multiple Java versions, source the helper:
source android-java17.sh

# Start Metro and build
npm run android

# For Gradle-only builds (no Expo layer):
cd android && ./gradlew assembleDebug
```

### Web (Experimental)

```bash
npm run web
```

### Expo Dev Client

```bash
npm start  # opens Expo Dev Client menu
# Scan QR code with Expo Go (iOS/Android) or press 'i'/'a' for simulators
```

---

## Troubleshooting

### "Wrong Java version" (Android)

**Symptom:** Gradle fails with "Java 24 found, 17 required"

**Fix:**
```bash
# macOS/Linux
export JAVA_HOME=/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home  # adjust path
java -version  # verify shows 17.x

# Windows
# Set JAVA_HOME in System Environment Variables (see Windows Setup above)
```

### "Pod install failed" (iOS)

**Symptom:** CocoaPods errors during `npm run ios`

**Fix:**
```bash
npm run fix-pods  # removes Pods/, Podfile.lock, reinstalls

# If still failing, ensure CocoaPods ≥1.15.0:
pod --version
sudo gem update cocoapods
```

### "Metro bundler slow" (macOS/Linux)

**Fix:** Install Watchman if not already present
```bash
brew install watchman  # macOS
# or see Linux Setup above
```

### "Expo Doctor warnings"

Run `npx expo-doctor` and follow its suggestions. Common issues:
- Missing SDK components in Android Studio
- Wrong Node/npm version (use `nvm use`)
- Mismatched Fabric config (see OPEN_QUESTIONS.md Q2.1)

### "Version drift detected"

**Symptom:** `npm run sync-versions:dry` reports deltas

**Fix:**
```bash
npm run sync-versions  # propagates version from package.json to native projects
```

---

## Verification Checklist

Before starting development, verify:

- [ ] `node --version` → `v20.19.1`
- [ ] `npm --version` → `≥10.8.2`
- [ ] `java -version` → `17.0.x` (for Android)
- [ ] `pod --version` → `≥1.15.0` (macOS only)
- [ ] `npx expo-doctor` → No critical errors
- [ ] `npm run sync-versions:dry` → No deltas
- [ ] `npm start` → Metro starts without errors
- [ ] `npm run ios` OR `npm run android` → App launches in simulator/emulator

---

## Next Steps

- Read [CLAUDE.md](./CLAUDE.md) for architecture overview and development workflows
- Review [PLAN_MODERNIZATION.md](./PLAN_MODERNIZATION.md) for ongoing modernization phases
- Check [OPEN_QUESTIONS.md](./OPEN_QUESTIONS.md) for decision points requiring input
- Explore [TECH_REVIEW.md](./TECH_REVIEW.md) for technical deep-dives

---

## Getting Help

- **Expo Issues:** https://expo.dev/support
- **React Native Issues:** https://reactnative.dev/help
- **Project Issues:** https://github.com/mneves75/dnschat/issues
