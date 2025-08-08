# Gemini Project Context: DNSChat

## Project Overview

This is a React Native mobile application named DNSChat. It provides a chat interface, similar to ChatGPT, but with an innovative communication mechanism: it uses DNS TXT queries to interact with a Large Language Model (LLM). The application is built with Expo and TypeScript, supporting iOS, Android, and web platforms.

Key features include:
-   **DNS-based LLM Communication**: Uses `dig @llm.pieter.com "<message>" TXT +short` for AI conversations.
-   **Local Storage**: Persists conversation history using AsyncStorage.
-   **Modern UI**: Features a dark/light theme, message bubbles, and typing indicators.
-   **Cross-Platform**: Built with React Native and Expo.
-   **Deep Linking**: Supports URLs like `chatdns://@username`.
-   **Native DNS Service**: Includes a custom UDP socket implementation for direct DNS queries on iOS.

The project uses React Navigation for navigation, and Expo Development Build for running on native platforms.

## Inspiration and Acknowledgements

- Tweet: [Arxiv Daily](https://x.com/Arxiv_Daily/status/1952452878716805172) on DNS-based `dig` queries for LLMs.
- OSS: [ch.at – Universal Basic Intelligence](https://github.com/Deep-ai-inc/ch.at), supporting `dig @ch.at "..." TXT`.

## Building and Running

### Prerequisites

-   Node.js 18+ and npm
-   Expo CLI (`npm install -g @expo/cli`)
-   iOS Simulator (macOS) or Android emulator

### Installation

1.  **Install dependencies:**
    ```bash
    npm install
    ```

2.  **Configure app identifiers in `app.json`:**
    -   Update `name`, `slug`, and `scheme`.
    -   Set `ios.bundleIdentifier` and `android.bundleIdentifier`.

### Running the App

-   **Start the development server:**
    ```bash
    npm start
    ```

-   **Run on specific platforms (requires Expo Development Build):**
    ```bash
    npm run ios      # iOS development build
    npm run android  # Android development build
    npm run web      # Web version
    ```

## Development Conventions

### Project Structure

The project follows a standard React Native structure:

```
src/
├── components/          # Reusable UI components
├── context/            # React Context providers
├── navigation/         # Navigation configuration
├── screens/           # Screen components
├── services/          # Business logic and API services
└── types/             # TypeScript type definitions
```

### Key Services

-   **`DNSService`**: Handles DNS TXT queries and response parsing.
-   **`StorageService`**: Manages local conversation persistence.
-   **`MockDNSService`**: A development fallback with simulated responses.

### Testing

The project includes a native CLI testing tool for DNS services. To use it, build and run the app on a simulator/emulator:

```bash
npm run ios  # or npm run android
```

### Code Style

-   The project uses TypeScript with strict mode enabled.
-   It follows standard React and React Native coding conventions.
-   The codebase is organized into feature-based directories (e.g., `components`, `services`, `navigation`).
