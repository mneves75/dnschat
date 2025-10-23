# Gemini Project: DNSChat v2.1.1

## Project Overview

DNSChat is a React Native mobile application that uses DNS TXT queries for AI communication. This allows users to chat with AI models through DNS infrastructure, which can provide enhanced privacy and network resilience. The application is built with React Native 0.81.5, Expo SDK 54.0.19, and TypeScript, and it supports iOS, Android, and web platforms.

The project uses a native module for DNS queries, with platform-optimized implementations for iOS (Swift and Apple Network Framework) and Android (Java and DnsResolver API). It also includes a multi-layer fallback strategy that uses UDP, TCP, and DNS-over-HTTPS to ensure reliable communication.

## Building and Running

### Prerequisites

*   Node.js 18+
*   iOS: Xcode 15+ and an iOS 16+ device or simulator
*   Android: Java 17 and the Android SDK

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/mneves75/dnschat.git
    ```
2.  Navigate to the project directory:
    ```bash
    cd dnschat
    ```
3.  Install the dependencies:
    ```bash
    npm install
    ```

### Running the Application

*   **Start the development server:**
    ```bash
    npm start
    ```
*   **Run on iOS:**
    ```bash
    npm run ios
    ```
*   **Run on Android:**
    ```bash
    npm run android
    ```
*   **Run on the web:**
    ```bash
    npm run web
    ```

### Testing DNS Functionality

*   **Quick smoke test:**
    ```bash
    node test-dns-simple.js "test message"
    ```
*   **Comprehensive DNS harness:**
    ```bash
    npm run dns:harness -- --message "verification test"
    ```
*   **With debugging output:**
    ```bash
    npm run dns:harness -- --message "test" --json-out output.json --raw-out raw.bin
    ```

### Testing

*   Run the test suite:
    ```bash
    npm test
    ```

## Development Conventions

*   The project uses TypeScript with strict mode enabled.
*   Code is formatted according to the Prettier configuration (inferred).
*   Contributions are managed through pull requests (as per `CONTRIBUTING.md`).
*   The project uses Jest for testing.
