import XCTest

@MainActor
class DNSChatUITests: XCTestCase {
    var app: XCUIApplication!

    // Localized tab titles
    var tabTitleChat: String = "DNS Chat"
    var tabTitleLogs: String = "Logs"
    var tabTitleAbout: String = "About"

    // Current language
    var currentLanguage: String = "en-US"

    // Device type detection
    var isIPad: Bool {
        return UIDevice.current.userInterfaceIdiom == .pad
    }

    override func setUpWithError() throws {
        continueAfterFailure = false

        app = XCUIApplication(bundleIdentifier: "org.mvneves.dnschat")
        app.launchArguments = ["-SCREENSHOT_MODE", "1"]

        // Read language from fastlane cache file (same as SnapshotHelper)
        // Fastlane writes to ~/Library/Caches/tools.fastlane/language.txt
        if let simulatorHostHome = ProcessInfo.processInfo.environment["SIMULATOR_HOST_HOME"] {
            let cachePath = "\(simulatorHostHome)/Library/Caches/tools.fastlane/language.txt"
            if let language = try? String(contentsOfFile: cachePath, encoding: .utf8).trimmingCharacters(in: .whitespacesAndNewlines) {
                currentLanguage = language
                if language == "pt-BR" {
                    // pt-BR tab titles
                    tabTitleChat = "DNS Chat"
                    tabTitleLogs = "Logs"
                    tabTitleAbout = "Sobre"
                } else {
                    // en-US tab titles
                    tabTitleChat = "DNS Chat"
                    tabTitleLogs = "Logs"
                    tabTitleAbout = "About"
                }
                NSLog("Detected language from fastlane cache: \(language)")
            }
        }

        NSLog("Device type: \(isIPad ? "iPad" : "iPhone")")

        // Setup Fastlane snapshot before launching (this also sets language args)
        setupSnapshot(app)

        app.launch()

        XCTAssertTrue(ensureNavigationReady(timeout: 15), "Navigation not found after onboarding recovery (iPad: \(isIPad))")

        // Additional wait for animations and rendering
        sleep(2)
    }

    // Helper to wait for navigation elements (handles iPad vs iPhone)
    private func waitForNavigation(timeout: TimeInterval) -> Bool {
        let deadline = Date().addingTimeInterval(timeout)
        while Date() < deadline {
            if isIPad {
                // iPad: Check for sidebar elements or main content
                // Expo Router tabs show sidebar-style navigation on iPad
                if app.otherElements["chat-list"].exists ||
                   app.otherElements["about-screen"].exists ||
                   app.otherElements["logs-screen"].exists ||
                   app.buttons[tabTitleChat].exists ||
                   app.buttons[tabTitleLogs].exists ||
                   app.buttons[tabTitleAbout].exists {
                    return true
                }
            } else {
                // iPhone: Check for tab bar
                if app.tabBars.firstMatch.exists {
                    return true
                }
            }
            usleep(100_000) // 100ms
        }
        return false
    }

    // Helper to recover from a first-launch onboarding state before screenshots.
    private func ensureNavigationReady(timeout: TimeInterval) -> Bool {
        if waitForNavigation(timeout: 5) {
            return true
        }

        let tabBar = app.tabBars.firstMatch
        let skipButton = app.buttons["skip-onboarding"]
        sleep(2)

        if skipButton.waitForExistence(timeout: 10) {
            skipButton.tap()
            sleep(2)
        } else {
            let continueButton = app.buttons["onboarding-continue"]
            let completeButton = app.buttons["onboarding-complete"]

            for _ in 0..<6 {
                if isIPad {
                    if app.otherElements["chat-list"].exists || app.otherElements["about-screen"].exists {
                        break
                    }
                } else if tabBar.exists {
                    break
                }

                if continueButton.waitForExistence(timeout: 3) {
                    continueButton.tap()
                    sleep(1)
                    continue
                }

                if completeButton.waitForExistence(timeout: 2) {
                    completeButton.tap()
                    sleep(2)
                    break
                }

                if skipButton.waitForExistence(timeout: 2) {
                    skipButton.tap()
                    sleep(2)
                    break
                }
            }
        }

        return waitForNavigation(timeout: timeout)
    }

    // Helper to tap navigation item (handles iPad sidebar vs iPhone tab bar)
    private func tapNavigationItem(_ title: String) -> Bool {
        if isIPad {
            // iPad: Use firstMatch to handle multiple elements with same title
            // Expo Router tabs sidebar may have duplicate labels
            let sidebarButton = app.buttons[title].firstMatch
            if sidebarButton.waitForExistence(timeout: 5) {
                sidebarButton.tap()
                return true
            }
            // Fallback: Try static text in sidebar
            let sidebarText = app.staticTexts[title].firstMatch
            if sidebarText.waitForExistence(timeout: 3) {
                sidebarText.tap()
                return true
            }
        } else {
            // iPhone: Use tab bar
            let tabButton = app.tabBars.buttons[title]
            if tabButton.waitForExistence(timeout: 5) {
                tabButton.tap()
                return true
            }
        }
        return false
    }

    override func tearDownWithError() throws {
        app.terminate()
        app = nil
    }

    // MARK: - Screenshot Tests

    func testOnboardingWelcome() throws {
        // Wait for onboarding to appear if this is first launch
        let welcomeScreen = app.otherElements["onboarding-welcome"]
        if welcomeScreen.waitForExistence(timeout: 3) {
            snapshot("01-Onboarding-Welcome")
            sleep(1)
        }
    }

    // Removed - duplicate of testChatList

    func testChatList() throws {
        // Navigate to Chat List using localized title (handles iPad sidebar vs iPhone tab bar)
        if tapNavigationItem(tabTitleChat) {
            sleep(2)

            // Look for chat list elements
            let chatList = app.otherElements["chat-list"]
            if chatList.waitForExistence(timeout: 3) {
                snapshot("04-Chat-List")
            }
        }
    }

    func testChatListDark() throws {
        // Set dark mode
        app.terminate()
        app.launchArguments.append("-UIUserInterfaceStyle")
        app.launchArguments.append("dark")
        app.launch()

        XCTAssertTrue(ensureNavigationReady(timeout: 15), "Navigation not found in dark mode after onboarding recovery")
        sleep(2)

        // Navigate to Chat List using localized title
        if tapNavigationItem(tabTitleChat) {
            sleep(2)

            let chatList = app.otherElements["chat-list"]
            if chatList.waitForExistence(timeout: 3) {
                snapshot("05-Chat-List-Dark")
            }
        }
    }

    func testDNSLogs() throws {
        // Navigate to Logs using localized title
        if tapNavigationItem(tabTitleLogs) {
            sleep(2)

            // Wait for logs screen to load
            let logsScreen = app.otherElements["logs-screen"]
            if logsScreen.waitForExistence(timeout: 20) {
                snapshot("06-DNS-Logs")
            }
        }
    }

    func testAbout() throws {
        // Navigate to About using localized title
        if tapNavigationItem(tabTitleAbout) {
            // Wait for about screen to load
            let aboutScreen = app.otherElements["about-screen"]
            XCTAssertTrue(aboutScreen.waitForExistence(timeout: 5))

            sleep(2)
            snapshot("07-About")
        }
    }
}
