import XCTest

@MainActor
class DNSChatUITests: XCTestCase {
    var app: XCUIApplication!

    override func setUpWithError() throws {
        continueAfterFailure = false

        app = XCUIApplication(bundleIdentifier: "org.mvneves.dnschat")
        app.launchArguments = ["-SCREENSHOT_MODE", "1"]

        // Set language based on test configuration
        if let language = ProcessInfo.processInfo.environment["SNAPSHOT_LANGUAGE"] {
            if language == "pt-BR" {
                app.launchArguments.append(contentsOf: ["-AppleLanguages", "(pt-BR)"])
                app.launchArguments.append(contentsOf: ["-AppleLocale", "pt_BR"])
            } else {
                app.launchArguments.append(contentsOf: ["-AppleLanguages", "(en-US)"])
                app.launchArguments.append(contentsOf: ["-AppleLocale", "en_US"])
            }
        }

        // Setup Fastlane snapshot before launching
        setupSnapshot(app)

        app.launch()

        // Wait for React Native to initialize (tab bar indicates RN loaded)
        let tabBar = app.tabBars.firstMatch
        XCTAssertTrue(tabBar.waitForExistence(timeout: 15), "React Native failed to initialize")

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
        // Navigate to Chat List (if exists as separate screen)
        // For now, capture the main chat screen which may show list
        let chatTab = app.tabBars.buttons["tab-chat"]
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

        // Navigate to Chat List
        let chatTab = app.tabBars.buttons["tab-chat"]
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
        // Navigate to Logs tab
        let logsTab = app.tabBars.buttons["tab-logs"]
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

    func testSettings() throws {
        // Navigate to Settings tab
        let settingsTab = app.tabBars.buttons["tab-settings"]
        if settingsTab.waitForExistence(timeout: 5) {
            settingsTab.tap()

            // Wait for settings screen to load
            let settingsScreen = app.otherElements["settings-screen"]
            XCTAssertTrue(settingsScreen.waitForExistence(timeout: 5))

            sleep(2)
            snapshot("07-Settings")
        }
    }

    func testAbout() throws {
        // Navigate to About tab
        let aboutTab = app.tabBars.buttons["tab-about"]
        if aboutTab.waitForExistence(timeout: 5) {
            aboutTab.tap()

            // Wait for about screen to load
            let aboutScreen = app.otherElements["about-screen"]
            XCTAssertTrue(aboutScreen.waitForExistence(timeout: 5))

            sleep(2)
            snapshot("08-About")
        }
    }
}
