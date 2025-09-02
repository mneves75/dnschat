# App extensions | Apple Developer Documentation

> Source: https://developer.apple.com/documentation/technologyoverviews/app-extensions
> Fetched: 2025-08-31T18:32:50.698Z

Apps let people experience your content within the interface you create, but sometimes people want that same content outside of your app. For example, someone using a weather app might want to see the forecast on their iPhone Lock Screen or on the face of their Apple Watch. If your server generates notifications with images, you might want people to see those images in the system’s notification interface. You deliver these types of features using app extensions.

An _app extension_ is a separate bundle that ships as part of your app and vends your app’s services to other parts of the system. Because app extensions are separate from your app, the system can launch and run them separately from your app. Some app extensions have an interface that the system displays, but many app extensions simply provide information for the system to use. For example, a Spotlight Import app extension indexes the content in one of your app’s custom file types.

## [Choose an app extension](https://developer.apple.com/documentation/technologyoverviews/app-extensions#Choose-an-app-extension)

iOS, iPadOS, macOS, tvOS, visionOS, and watchOS support app extensions for specific features like sharing, Notification Center, or Safari. When you [add an app extension](https://developer.apple.com/documentation/Xcode/configuring-a-new-target-in-your-project) to your existing app project, Xcode creates the initial code and resources and updates your project’s build settings. When you build your app, Xcode builds the app extension automatically and copies it to your [app bundle](https://developer.apple.com/documentation/technologyoverviews/files-and-directories#Bundles).

Extension point

Description

iOS/iPadOS

macOS

tvOS

visionOS

watchOS

[Action](https://developer.apple.com/library/archive/documentation/General/Conceptual/ExtensibilityPG/Action.html#//apple_ref/doc/uid/TP40014214-CH13-SW1)

Add custom actions to the share sheet to invoke your app’s functionality from any app.

•

•

•

[Audio Unit](https://developer.apple.com/library/archive/documentation/General/Conceptual/ExtensibilityPG/AudioUnit.html#//apple_ref/doc/uid/TP40014214-CH22-SW1)

Create and modify audio in any app that uses sound, including music production apps such as GarageBand or Logic Pro X.

•

•

•

[Authentication Services](https://developer.apple.com/videos/play/tech-talks/301/)

Streamline authentication for users by enabling single sign-on.

•

•

•

[Account Authentication Modification](https://developer.apple.com/documentation/AuthenticationServices/upgrading-account-security-with-an-account-authentication-modification-extension)

Automatically upgrade user passwords to strong passwords, or convert accounts to use Sign in with Apple.

•

[AutoFill Credential Provider](https://developer.apple.com/documentation/AuthenticationServices/ASCredentialProviderViewController)

Surface credentials from your app in Password Autofill and pull your app’s password data into the Password AutoFill workflow.

•

•

•

[Background Assets Downloader](https://developer.apple.com/documentation/BackgroundAssets)

Download important assets shortly after app installation.

•

•

•

•

[Call Directory](https://developer.apple.com/documentation/CallKit)

Display caller identification from your appʼs custom contact list so users know who’s calling.

•

•

[ClassKit Content Provider](https://developer.apple.com/documentation/ClassKit/CLSContextProvider)

Update the status of your appʼs activities so that status is visible in the Schoolwork app.

•

•

•

[Contact Provider](https://developer.apple.com/documentation/ContactProvider/ContactProviderExtension)

Provide contact items to the system-wide Contacts ecosystem.

•

[Content Blocker](https://developer.apple.com/documentation/SafariServices/creating-a-content-blocker)

Provide rules for hiding elements, blocking loads, and stripping cookies from Safari requests.

•

•

•

[Custom Keyboard](https://developer.apple.com/documentation/UIKit/creating-a-custom-keyboard)

Provide systemwide customized text input for unique input methods or specific languages.

•

[File Provider](https://developer.apple.com/documentation/FileProvider)

Let other apps access the documents and directories stored and managed by your app.

•

•

•

[File Provider UI](https://developer.apple.com/documentation/FileProviderUI)

Add custom actions to the document browserʼs context menu for documents that your app manages.

•

[Finder Sync](https://developer.apple.com/library/archive/documentation/General/Conceptual/ExtensibilityPG/Finder.html#//apple_ref/doc/uid/TP40014214-CH15-SW1)

Keep files in sync with a back-end storage service.

•

[iMessage](https://developer.apple.com/documentation/Messages)

Allow users to send text, stickers, media files, and interactive messages.

•

[Intents](https://developer.apple.com/documentation/SiriKit/creating-an-intents-app-extension)

Let users interact with your app using Siri.

•

•

•

•

•

[Intents UI](https://developer.apple.com/documentation/SiriKit/creating-an-intents-ui-extension)

Customize the interface for interactions with your app in Siri conversations or Maps.

•

•

[Live Caller ID Lookup](https://developer.apple.com/documentation/IdentityLookup/getting-up-to-date-calling-and-blocking-information-for-your-app)

Provide caller ID and call-blocking services from a server you maintain. Available in iOS only.

•

[Location Push Service](https://developer.apple.com/documentation/CoreLocation/creating-a-location-push-service-extension)

Enable a location sharing app – with a user’s authorization – to query a user’s location in response to a push from Apple Push Notification service (APNs).

•

[Locked Camera Capture](https://developer.apple.com/documentation/LockedCameraCapture)

Lets people launch your app’s camera experience from the Lock Screen, Control Center, or the Action button.

•

[Mail](https://developer.apple.com/documentation/MailKit/MEExtension)

Enhance Mail by adding custom actions, blocking content, signing and encoding messages, and more.

•

•

[Media Extension](https://developer.apple.com/documentation/MediaExtension)

Support media assets that the system doesn’t support natively.

•

[Message Filter](https://developer.apple.com/documentation/IdentityLookup)

Identify and filter unwanted SMS and MMS messages.

•

•

[Network](https://developer.apple.com/documentation/NetworkExtension)

Provide system-level networking services such as VPN, proxies, or content filtering.

•

•

•

[Notification Center](https://developer.apple.com/documentation/UserNotificationsUI/customizing-the-appearance-of-notifications)

Customize the appearance of your app’s notification alerts.

•

•

•

[Notification Service](https://developer.apple.com/documentation/UserNotifications/modifying-content-in-newly-delivered-notifications)

Modify the payload of a remote notification before it’s displayed on the user’s device.

•

•

•

•

[Persistent Token](https://developer.apple.com/documentation/CryptoTokenKit/authenticating-users-with-a-cryptographic-token)

Grant access to user accounts and the keychain using a token.

•

•

•

[Photo Editing](https://developer.apple.com/documentation/PhotoKit/creating-photo-editing-extensions)

Allow your app to edit assets directly within the Photos app.

•

•

[Photo Project](https://developer.apple.com/documentation/PhotoKit/creating-a-slideshow-project-extension-for-photos)

Augment the macOS Photos app with extensions that support project creation.

•

[Quick Look Preview](https://developer.apple.com/documentation/QuickLook)

Provide previews of documents your app owns so they can be viewed in any app.

•

•

[Safari Services](https://developer.apple.com/documentation/SafariServices)

Extend the web-browsing experience in Safari by leveraging web technologies and native code.

•

•

[Share](https://developer.apple.com/library/archive/documentation/General/Conceptual/ExtensibilityPG/Share.html#//apple_ref/doc/uid/TP40014214-CH12-SW1)

Let users post to your social-network service from any app.

•

•

•

[Smart Card Token](https://developer.apple.com/documentation/CryptoTokenKit/authenticating-users-with-a-cryptographic-token)

Grant access to user accounts and the keychain using a hardware-based token.

•

[Spotlight Import](https://developer.apple.com/documentation/CoreSpotlight/CSImportExtension)

Make content in your app searchable in Spotlight, Safari, Siri, and more.

•

•

•

[Sticker Pack](https://developer.apple.com/documentation/Messages)

Add custom stickers to Messages.

•

[Thumbnail](https://developer.apple.com/documentation/QuickLookThumbnailing/providing-thumbnails-of-your-custom-file-types)

Display thumbnails of your custom document types in all apps.

•

•

•

[TV Top Shelf](https://developer.apple.com/documentation/TVServices)

Help users discover your app by providing Top Shelf content and a description of your tvOS app.

•

[Unwanted Communication](https://developer.apple.com/documentation/IdentityLookup/sms-and-call-spam-reporting)

Block incoming phone calls using your app’s custom unsolicited caller database.

•

[Virtual Conference](https://developer.apple.com/documentation/EventKit/EKVirtualConferenceProvider)

Integrate your video conferencing service directly into events on user’s calendars.

•

•

•

[Widgets](https://developer.apple.com/documentation/WidgetKit/Creating-a-Widget-Extension)

Show relevant, glanceable content from your app on the iOS Home Screen and Lock Screen, macOS Notification Center, and as complications in watchOS.

•

•

•

[Xcode Source Editor](https://developer.apple.com/documentation/XcodeKit/creating-a-source-editor-extension)

Provide custom editing features directly inside Xcode’s source editor.

•

The system runs app extensions as separate processes, so they don’t automatically share your app’s resources or permissions. Configure your app extension to run independently whenever possible. If you must share data between your app and app extension, [create an App Group](https://developer.apple.com/documentation/Xcode/configuring-app-groups) and give access to both processes.

## [Host custom extensions in your app](https://developer.apple.com/documentation/technologyoverviews/app-extensions#Host-custom-extensions-in-your-app)

If your app supports contributions from outside apps, you can define your own app extensions and run them in a safe environment using the [ExtensionFoundation](https://developer.apple.com/documentation/ExtensionFoundation) framework. Custom app extensions are a way for you to add new capabilities to your app. For example, a graphics editing app might support new types of filters or visual effects. If your app lets app extensions provide a custom interface, the [ExtensionKit](https://developer.apple.com/documentation/ExtensionKit) framework helps you present that interface securely.
