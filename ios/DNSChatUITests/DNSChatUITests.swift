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

        // Setup Fastlane snapshot before launching (this also sets language args)
        setupSnapshot(app)

        app.launch()

        // Wait for React Native to initialize - either tab bar or onboarding will appear
        let tabBar = app.tabBars.firstMatch
        let skipButton = app.buttons["skip-onboarding"]

        // Wait for either tab bar (onboarding bypassed) or skip button (onboarding showing)
        let tabBarExists = tabBar.waitForExistence(timeout: 5)

        if !tabBarExists {
            // Onboarding is showing - need to skip it
            // First, wait a bit for React Native to fully initialize
            sleep(2)

            // Try to find and tap the skip button
            if skipButton.waitForExistence(timeout: 10) {
                skipButton.tap()
                sleep(2)
            } else {
                // Alternative: Try to complete onboarding by tapping "Continue" button
                let continueButton = app.buttons["onboarding-continue"]
                let completeButton = app.buttons["onboarding-complete"]

                // Complete each onboarding step (max 6 steps)
                for _ in 0..<6 {
                    // First check if we've reached the tab bar
                    if tabBar.exists {
                        break
                    }

                    // Try continue button (regular steps)
                    if continueButton.waitForExistence(timeout: 3) {
                        continueButton.tap()
                        sleep(1)
                        continue
                    }

                    // Try complete button (last step)
                    if completeButton.waitForExistence(timeout: 2) {
                        completeButton.tap()
                        sleep(2)
                        break
                    }

                    // Try skip button as fallback
                    if skipButton.waitForExistence(timeout: 2) {
                        skipButton.tap()
                        sleep(2)
                        break
                    }
                }
            }

            // After completing onboarding, verify tab bar now exists
            XCTAssertTrue(tabBar.waitForExistence(timeout: 10), "Tab bar not found after completing onboarding")
        }

        // Additional wait for animations and rendering
        sleep(2)
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
        // Navigate to Chat List tab using localized title
        let chatTab = app.tabBars.buttons[tabTitleChat]
        if chatTab.waitForExistence(timeout: 5) {
            chatTab.tap()
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

        // Wait for React Native
        let tabBar = app.tabBars.firstMatch
        XCTAssertTrue(tabBar.waitForExistence(timeout: 15))
        sleep(2)

        // Navigate to Chat List using localized title
        let chatTab = app.tabBars.buttons[tabTitleChat]
        if chatTab.waitForExistence(timeout: 5) {
            chatTab.tap()
            sleep(2)

            let chatList = app.otherElements["chat-list"]
            if chatList.waitForExistence(timeout: 3) {
                snapshot("05-Chat-List-Dark")
            }
        }
    }

    func testDNSLogs() throws {
        // Navigate to Logs tab using localized title
        let logsTab = app.tabBars.buttons[tabTitleLogs]
        if logsTab.waitForExistence(timeout: 5) {
            logsTab.tap()
            sleep(2)

            // Wait for logs screen to load
            let logsScreen = app.otherElements["logs-screen"]
            if logsScreen.waitForExistence(timeout: 20) {
                snapshot("06-DNS-Logs")
            }
        }
    }

    func testAbout() throws {
        // Navigate to About tab using localized title
        let aboutTab = app.tabBars.buttons[tabTitleAbout]
        if aboutTab.waitForExistence(timeout: 5) {
            aboutTab.tap()

            // Wait for about screen to load
            let aboutScreen = app.otherElements["about-screen"]
            XCTAssertTrue(aboutScreen.waitForExistence(timeout: 5))

            sleep(2)
            snapshot("07-About")
        }
    }
}
