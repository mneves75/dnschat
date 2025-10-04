# app.json / app.config.js

[Edit](https://github.com/expo/expo/edit/main/docs/pages/versions/unversioned/config/app.mdx)

Ask AI

Copy

A reference of available properties in Expo app config.

[Edit](https://github.com/expo/expo/edit/main/docs/pages/versions/unversioned/config/app.mdx)

Ask AI

Copy

* * *

The following is a list of properties that are available for you under the
`"expo"` key in app.json or app.config.json. These properties can be passed to
the top level object of app.config.js or app.config.ts.

[Configuration with app configFor information on app configuration, the
differences between various app config files, and how to use them
dynamically.](/workflow/configuration)

## Properties

`name`

Type: `string`

The name of your app as it appears both within Expo Go and on your home screen
as a standalone app.

Bare Workflow

To change the name of your app, edit the 'Display Name' field in Xcode and the
`app_name` string in `android/app/src/main/res/values/strings.xml`

`description`

Type: `string`

A short description of what your app is and why it is great.

`slug`

Type: `string`

A URL-friendly name for your project that is unique across your account.

`owner`

Type: `string`

The name of the Expo account that owns the project. This is useful for teams
collaborating on a project. If not provided, the owner defaults to the
username of the current user.

`currentFullName`

Type: `string`

The auto generated Expo account name and slug used for display purposes. It is
not meant to be set directly. Formatted like `@username/slug`. When
unauthenticated, the username is `@anonymous`. For published projects, this
value may change when a project is transferred between accounts or renamed.

`originalFullName`

Type: `string`

The auto generated Expo account name and slug used for services like
Notifications and AuthSession proxy. It is not meant to be set directly.
Formatted like `@username/slug`. When unauthenticated, the username is
`@anonymous`. For published projects, this value will not change when a
project is transferred between accounts or renamed.

`sdkVersion`

Type: `string`

The Expo sdkVersion to run the project on. This should line up with the
version specified in your package.json.

`runtimeVersion`

One of types:

  * `string` matching the following pattern: `^[a-zA-Z\d][a-zA-Z\d._+()-]{0,254}$`
  * `string` matching the following pattern: `^exposdk:((\d+\.\d+\.\d+)|(UNVERSIONED))$`
  * An `object` with the following properties:

`policy`

Type: `enum` • Path: `runtimeVersion.policy`

Valid values: `nativeVersion`, `sdkVersion`, `appVersion`, `fingerprint`.

Property indicating compatibility between a build's native code and an OTA
update.

`version`

Type: `string`

Your app version. In addition to this field, you'll also use `ios.buildNumber`
and `android.versionCode` — read more about how to version your app
[here](https://docs.expo.dev/distribution/app-stores/#versioning-your-app). On
iOS this corresponds to `CFBundleShortVersionString`, and on Android, this
corresponds to `versionName`. The required format can be found
[here](https://developer.apple.com/documentation/bundleresources/information_property_list/cfbundleshortversionstring).

Bare Workflow

To change your app version, edit the 'Version' field in Xcode and the
`versionName` string in `android/app/build.gradle`

`platforms`

Type: `array`

Platforms that your project explicitly supports. If not specified, it defaults
to `["ios", "android"]`.

Example

`[ "ios", "android", "web" ]`

`githubUrl`

Type: `string`

If you would like to share the source code of your app on Github, enter the
URL for the repository here and it will be linked to from your Expo project
page.

Example

`"https://github.com/expo/expo"`

`orientation`

Type: `enum`

Locks your app to a specific orientation with portrait or landscape. Defaults
to no lock. Valid values: `default`, `portrait`, `landscape`

`userInterfaceStyle`

Type: `enum`

Configuration to force the app to always use the light or dark user-interface
appearance, such as "dark mode", or make it automatically adapt to the system
preferences. If not provided, defaults to `light`. Requires `expo-system-ui`
be installed in your project to work on Android.

`backgroundColor`

Type: `string`

The background color for your app, behind any of your React views. This is
also known as the root view background color. Requires `expo-system-ui` be
installed in your project to work on iOS.

6 character long hex color string, for example, `'#000000'`. Default is white:
`'#ffffff'`

`primaryColor`

Type: `string`

On Android, this will determine the color of your app in the multitasker.
Currently this is not used on iOS, but it may be used for other purposes in
the future.

6 character long hex color string, for example, `'#000000'`

`icon`

Type: `string`

Local path or remote URL to an image to use for your app's icon. We recommend
that you use a 1024x1024 png file. This icon will appear on the home screen
and within the Expo Go app.

Bare Workflow

To change your app's icon, edit or replace the files in `ios/<PROJECT-
NAME>/Assets.xcassets/AppIcon.appiconset` (we recommend using Xcode), and
`android/app/src/main/res/mipmap-<RESOLUTION>`. Be sure to follow the
guidelines for each platform ([iOS](https://developer.apple.com/design/human-
interface-guidelines/ios/icons-and-images/app-icon/), [Android 7.1 and
below](https://material.io/design/iconography/#icon-treatments), and [Android
8+](https://developer.android.com/guide/practices/ui_guidelines/icon_design_adaptive))
and to provide your new icon in each existing size.

`notification`

Type: `object`

@deprecated in favor of the expo-notifications config plugin. This field will
be removed in SDK 55. Configuration for remote (push) notifications.

`icon`

Type: `string` • Path: `notification.icon`

(Android only) Local path or remote URL to an image to use as the icon for
push notifications. 96x96 png grayscale with transparency. We recommend
following [Google's design
guidelines](https://material.io/design/iconography/product-icons.html#design-
principles). If not provided, defaults to your app icon.

`color`

Type: `string` • Path: `notification.color`

(Android only) Tint color for the push notification image when it appears in
the notification tray. Defaults to `#ffffff`

6 character long hex color string, for example, `'#000000'`

`iosDisplayInForeground`

Type: `boolean` • Path: `notification.iosDisplayInForeground`

Whether or not to display notifications when the app is in the foreground on
iOS. `_displayInForeground` option in the individual push notification message
overrides this option. [Learn more.](https://docs.expo.dev/push-
notifications/receiving-notifications/#foreground-notification-behavior)
Defaults to `false`.

`androidMode`

Type: `enum` • Path: `notification.androidMode`

Show each push notification individually (`default`) or collapse into one
(`collapse`).

`androidCollapsedTitle`

Type: `string` • Path: `notification.androidCollapsedTitle`

If `androidMode` is set to `collapse`, this title is used for the collapsed
notification message. For example, `'#{unread_notifications} new
interactions'`.

`androidStatusBar`

Type: `object`

Configuration for the status bar on Android. For more details navigate to
[Configuring StatusBar](https://docs.expo.dev/guides/configuring-statusbar/).

`barStyle`

Type: `enum` • Path: `androidStatusBar.barStyle`

Configures the status bar icons to have a light or dark color. Valid values:
`light-content`, `dark-content`. Defaults to `dark-content`

`backgroundColor`

Type: `string` • Path: `androidStatusBar.backgroundColor`

Specifies the background color of the status bar. Defaults to `#00000000`
(transparent) for `dark-content` bar style and `#00000088` (semi-transparent
black) for `light-content` bar style

6 character long hex color string `'#RRGGBB'`, for example, `'#000000'` for
black. Or 8 character long hex color string `'#RRGGBBAA'`, for example,
`'#00000088'` for semi-transparent black.

`hidden`

Type: `boolean` • Path: `androidStatusBar.hidden`

Instructs the system whether the status bar should be visible or not. Defaults
to `false`

`translucent`

Type: `boolean` • Path: `androidStatusBar.translucent`

When false, the system status bar pushes the content of your app down (similar
to `position: relative`). When true, the status bar floats above the content
in your app (similar to `position: absolute`). Defaults to `true` to match the
iOS status bar behavior (which can only float above content). Explicitly
setting this property to `true` will add `android:windowTranslucentStatus` to
`styles.xml` and may cause unexpected keyboard behavior on Android when using
the `softwareKeyboardLayoutMode` set to `resize`. In this case you will have
to use `KeyboardAvoidingView` to manage the keyboard layout.

`androidNavigationBar`

Type: `object`

Configuration for the bottom navigation bar on Android. Can be used to
configure the `expo-navigation-bar` module in EAS Build.

`visible`

Type: `enum` • Path: `androidNavigationBar.visible`

Determines how and when the navigation bar is shown. [Learn
more](https://developer.android.com/training/system-ui/immersive). Requires
`expo-navigation-bar` be installed in your project. Valid values: `leanback`,
`immersive`, `sticky-immersive`

`leanback` results in the navigation bar being hidden until the first touch
gesture is registered.

`immersive` results in the navigation bar being hidden until the user swipes
up from the edge where the navigation bar is hidden.

`sticky-immersive` is identical to `'immersive'` except that the navigation
bar will be semi-transparent and will be hidden again after a short period of
time.

`barStyle`

Type: `enum` • Path: `androidNavigationBar.barStyle`

Configure the navigation bar icons to have a light or dark color. Supported on
Android Oreo and newer. Valid values: `'light-content'`, `'dark-content'`

`backgroundColor`

Type: `string` • Path: `androidNavigationBar.backgroundColor`

Specifies the background color of the navigation bar.

6 character long hex color string, for example, `'#000000'`

`developmentClient`

Type: `object`

Settings that apply specifically to running this app in a development client

`silentLaunch`

Type: `boolean` • Path: `developmentClient.silentLaunch`

If true, the app will launch in a development client with no additional
dialogs or progress indicators, just like in a standalone app.

`scheme`

One of types:

  * `string` matching the following pattern: `^[a-z][a-z0-9+.-]*$`
`{ "type": "array", "items": { "type": "string", "pattern":
"^[a-z][a-z0-9+.-]*$" } }`

URL scheme(s) to link into your app. For example, if we set this to `'demo'`,
then demo:// URLs would open your app when tapped. This is a build-time
configuration, it has no effect in Expo Go.

String beginning with a lowercase letter followed by any combination of
lowercase letters, digits, "+", "." or "-"

Bare Workflow

To change your app's scheme, replace all occurrences of the old scheme in
`Info.plist` and `AndroidManifest.xml`

`extra`

Type: `object`

Any extra fields you want to pass to your experience. Values are accessible
via `Constants.expoConfig.extra` ([Learn
more](https://docs.expo.dev/versions/latest/sdk/constants/#constantsmanifest))

`updates`

Type: `object`

Configuration for the expo-updates library

`enabled`

Type: `boolean` • Path: `updates.enabled`

Whether the updates system will run. Defaults to true. If set to false, builds
will only use code and assets bundled at time of build.

`checkAutomatically`

Type: `enum` • Path: `updates.checkAutomatically`

By default, expo-updates will check for updates every time the app is loaded.
Set this to `ON_ERROR_RECOVERY` to disable automatic checking unless
recovering from an error. Set this to `NEVER` to disable automatic checking.
Valid values: `ON_LOAD` (default value), `ON_ERROR_RECOVERY`, `WIFI_ONLY`,
`NEVER`

`useEmbeddedUpdate`

Type: `boolean` • Path: `updates.useEmbeddedUpdate`

Whether to load the embedded update. Defaults to true. If set to false, an
update will be fetched at launch. When set to false, ensure that
`checkAutomatically` is set to `ON_LOAD` and `fallbackToCacheTimeout` is large
enough for the initial remote update to download. This should not be used in
production.

`fallbackToCacheTimeout`

Type: `number` • Path: `updates.fallbackToCacheTimeout`

How long (in ms) to wait for the app to check for and fetch a new update upon
launch before falling back to the most recent update already present on the
device. Defaults to 0. Must be between 0 and 300000 (5 minutes). If the
startup update check takes longer than this value, any update downloaded
during the check will be applied upon the next app launch.

`url`

Type: `string` • Path: `updates.url`

URL from which expo-updates will fetch update manifests

`codeSigningCertificate`

Type: `string` • Path: `updates.codeSigningCertificate`

Local path of a PEM-formatted X.509 certificate used for verifying codesigned
updates. When provided, all updates downloaded by expo-updates must be signed.

`codeSigningMetadata`

Type: `object` • Path: `updates.codeSigningMetadata`

Metadata for `codeSigningCertificate`

`alg`

Type: `enum` • Path: `updates.codeSigningMetadata.alg`

Algorithm used to generate manifest code signing signature. Valid values:
`rsa-v1_5-sha256`

`keyid`

Type: `string` • Path: `updates.codeSigningMetadata.keyid`

Identifier for the key in the certificate. Used to instruct signing mechanisms
when signing or verifying signatures.

`requestHeaders`

Type: `object` • Path: `updates.requestHeaders`

Extra HTTP headers to include in HTTP requests made by `expo-updates` when
fetching manifests or assets. These may override preset headers.

`assetPatternsToBeBundled`

Type: `array` • Path: `updates.assetPatternsToBeBundled`

Array of glob patterns specifying which files should be included in updates.
Glob patterns are relative to the project root. A value of `['**']` will match
all asset files within the project root. When not supplied all asset files
will be included. Example: Given a value of `['app/images/**/*.png',
'app/fonts/**/*.woff']` all `.png` files in all subdirectories of `app/images`
and all `.woff` files in all subdirectories of `app/fonts` will be included in
updates.

`disableAntiBrickingMeasures`

Type: `boolean` • Path: `updates.disableAntiBrickingMeasures`

Whether to disable the built-in expo-updates anti-bricking measures. Defaults
to false. If set to true, this will allow overriding certain configuration
options from the JS API, which is liable to leave an app in a bricked state if
not done carefully. This should not be used in production.

`useNativeDebug`

Type: `boolean` • Path: `updates.useNativeDebug`

Enable debugging of native code with updates enabled. Defaults to false. If
set to true, the EX_UPDATES_NATIVE_DEBUG environment variable will be set in
Podfile.properties.json and gradle.properties. This causes Xcode and Android
Studio debug builds to be built with expo-updates enabled, and JS debugging
(with dev client or packager) disabled. This should not be used in production.

`locales`

Type: `object`

Provide overrides by locale for System Dialog prompts like Permissions Boxes

Bare Workflow

To add or change language and localization information in your iOS app, you
need to use Xcode.

`plugins`

Type: `array`

Config plugins for adding extra functionality to your project. [Learn
more](https://docs.expo.dev/guides/config-plugins/).

Bare Workflow

Plugins that add modifications can only be used with
[prebuilding](https://expo.fyi/prebuilding) and managed EAS Build

`splash`

Type: `object`

Configuration for loading and splash screen for standalone apps.

Bare Workflow

To change your app's icon, edit or replace the files in `ios/<PROJECT-
NAME>/Assets.xcassets/AppIcon.appiconset` (we recommend using Xcode), and
`android/app/src/main/res/mipmap-<RESOLUTION>` (Android Studio can [generate
the appropriate image files for
you](https://developer.android.com/studio/write/image-asset-studio)). Be sure
to follow the guidelines for each platform
([iOS](https://developer.apple.com/design/human-interface-
guidelines/ios/icons-and-images/app-icon/), [Android 7.1 and
below](https://material.io/design/iconography/#icon-treatments), and [Android
8+](https://developer.android.com/guide/practices/ui_guidelines/icon_design_adaptive))
and to provide your new icon in each required size.

`backgroundColor`

Type: `string` • Path: `splash.backgroundColor`

Color to fill the loading screen background

6 character long hex color string, for example, `'#000000'`

Bare Workflow

For Android, edit the `colorPrimary` item in
`android/app/src/main/res/values/colors.xml`

`resizeMode`

Type: `enum` • Path: `splash.resizeMode`

Determines how the `image` will be displayed in the splash loading screen.
Must be one of `cover` or `contain`, defaults to `contain`.

`image`

Type: `string` • Path: `splash.image`

Local path or remote URL to an image to fill the background of the loading
screen. Image size and aspect ratio are up to you. Must be a .png.

`jsEngine`

Type: `enum`

@deprecated This field will be removed in a future release. When it is
removed, you can continue using JavaScriptCore instead of Hermes by following
the instructions in [@react-native-
community/javascriptcore](https://github.com/react-native-
community/javascriptcore). Specifies the JavaScript engine for Android apps.
Defaults to `hermes`. Valid values: `hermes`, `jsc`.

Bare Workflow

To change the JavaScript engine, update the `expo.jsEngine` value in
`ios/Podfile.properties.json` or `android/gradle.properties`

`newArchEnabled`

Type: `boolean`

A Boolean value that indicates whether the app should use the new
architecture. Defaults to true.

`buildCacheProvider`

Type: `undefined`

Enable downloading cached builds from remote.

`ios`

Type: `object`

Configuration that is specific to the iOS platform.

`appleTeamId`

Type: `string` • Path: `ios.appleTeamId`

The Apple development team ID to use for all native targets. You can find your
team ID in [the Apple Developer
Portal](https://developer.apple.com/help/account/manage-your-team/locate-your-
team-id/).

`publishManifestPath`

Type: `string` • Path: `ios.publishManifestPath`

The manifest for the iOS version of your app will be written to this path
during publish.

`publishBundlePath`

Type: `string` • Path: `ios.publishBundlePath`

The bundle for the iOS version of your app will be written to this path during
publish.

`bundleIdentifier`

Type: `string` • Path: `ios.bundleIdentifier`

The bundle identifier for your iOS standalone app. You make it up, but it
needs to be unique on the App Store. See [this StackOverflow
question](http://stackoverflow.com/questions/11347470/what-does-bundle-
identifier-mean-in-the-ios-project).

iOS bundle identifier notation unique name for your app. For example,
`host.exp.expo`, where `exp.host` is our domain and `expo` is our app name.

Bare Workflow

Set this value in `info.plist` under `CFBundleIdentifier`

`buildNumber`

Type: `string` • Path: `ios.buildNumber`

Build number for your iOS standalone app. Corresponds to `CFBundleVersion` and
must match Apple's [specified
format](https://developer.apple.com/documentation/bundleresources/information_property_list/cfbundleversion).
(Note: Transporter will pull the value for `Version Number` from
`expo.version` and NOT from `expo.ios.buildNumber`.)

Bare Workflow

Set this value in `info.plist` under `CFBundleVersion`

`backgroundColor`

Type: `string` • Path: `ios.backgroundColor`

The background color for your iOS app, behind any of your React views.
Overrides the top-level `backgroundColor` key if it is present. Requires
`expo-system-ui` be installed in your project to work on iOS.

6 character long hex color string, for example, `'#000000'`

`scheme`

One of types:

  * `string` matching the following pattern: `^[a-z][a-z0-9+.-]*$`
`{ "type": "array", "items": { "type": "string", "pattern":
"^[a-z][a-z0-9+.-]*$" } }`

URL scheme(s) to link into your iOS app. Schemes added to this field will be
merged with the schemes in the `scheme` key at the top level of the config.

String beginning with a lowercase letter followed by any combination of
lowercase letters, digits, "+", "." or "-"

Bare Workflow

To change your app's scheme, replace all occurrences of the old scheme in
`Info.plist` and `AndroidManifest.xml`

`icon`

One of types:

  * `string` matching the following pattern: `\.icon$`
  * `string`
  * An `object` with the following properties:

`light`

Type: `string` • Path: `ios.icon.light`

The light icon. It will appear when neither dark nor tinted icons are used, or
if they are not provided.

`dark`

Type: `string` • Path: `ios.icon.dark`

The dark icon. It will appear for the app when the user's system appearance is
dark. See Apple's [Human Interface
Guidelines](https://developer.apple.com/design/human-interface-guidelines/app-
icons#iOS-iPadOS) for more information.

`tinted`

Type: `string` • Path: `ios.icon.tinted`

The tinted icon. It will appear for the app when the user's system appearance
is tinted. See Apple's [Human Interface
Guidelines](https://developer.apple.com/design/human-interface-guidelines/app-
icons#iOS-iPadOS) for more information.

Local path or remote URL to an image to use for your app's icon on iOS.
Alternatively, an object specifying different icons for various system
appearances (e.g., dark, tinted) can be provided. You can also provide a path
to a .icon directory. If specified, this overrides the top-level `icon` key.
Use a 1024x1024 icon which follows Apple's interface guidelines for icons,
including color profile and transparency.

Expo will generate the other required sizes. This icon will appear on the home
screen and within the Expo Go app.

`appStoreUrl`

Type: `string` • Path: `ios.appStoreUrl`

URL to your app on the Apple App Store, if you have deployed it there. This is
used to link to your store page from your Expo project page if your app is
public.

Example

`"https://apps.apple.com/us/app/expo-client/id982107779"`

`bitcode`

Type: `undefined` • Path: `ios.bitcode`

Enable iOS Bitcode optimizations in the native build. Accepts the name of an
iOS build configuration to enable for a single configuration and disable for
all others, e.g. Debug, Release. Not available in Expo Go. Defaults to
`undefined` which uses the template's predefined settings.

`config`

Type: `object` • Path: `ios.config`

Note: This property key is not included in the production manifest and will
evaluate to `undefined`. It is used internally only in the build process,
because it contains API keys that some may want to keep private.

`branch`

Type: `object` • Path: `ios.config.branch`

[Branch](https://branch.io/) key to hook up Branch linking services.

`apiKey`

Type: `string` • Path: `ios.config.branch.apiKey`

Your Branch API key

`usesNonExemptEncryption`

Type: `boolean` • Path: `ios.config.usesNonExemptEncryption`

Sets `ITSAppUsesNonExemptEncryption` in the standalone ipa's Info.plist to the
given boolean value.

`googleMapsApiKey`

Type: `string` • Path: `ios.config.googleMapsApiKey`

[Google Maps iOS SDK](https://developers.google.com/maps/documentation/ios-
sdk/start) key for your standalone app.

`googleMobileAdsAppId`

Type: `string` • Path: `ios.config.googleMobileAdsAppId`

[Google Mobile Ads App ID](https://support.google.com/admob/answer/6232340)
Google AdMob App ID.

`googleMobileAdsAutoInit`

Type: `boolean` • Path: `ios.config.googleMobileAdsAutoInit`

A boolean indicating whether to initialize Google App Measurement and begin
sending user-level event data to Google immediately when the app starts. The
default in Expo (Go and in standalone apps) is `false`. [Sets the opposite of
the given value to the following key in
`Info.plist`.](https://developers.google.com/admob/ios/eu-
consent#delay_app_measurement_optional)

`googleServicesFile`

Type: `string` • Path: `ios.googleServicesFile`

[Firebase Configuration
File](https://support.google.com/firebase/answer/7015592) Location of the
`GoogleService-Info.plist` file for configuring Firebase.

`supportsTablet`

Type: `boolean` • Path: `ios.supportsTablet`

Whether your standalone iOS app supports tablet screen sizes. Defaults to
`false`.

Bare Workflow

Set this value in `info.plist` under `UISupportedInterfaceOrientations~ipad`

`isTabletOnly`

Type: `boolean` • Path: `ios.isTabletOnly`

If true, indicates that your standalone iOS app does not support handsets, and
only supports tablets.

Bare Workflow

Set this value in `info.plist` under `UISupportedInterfaceOrientations`

`requireFullScreen`

Type: `boolean` • Path: `ios.requireFullScreen`

If true, indicates that your standalone iOS app does not support Slide Over
and Split View on iPad. Defaults to `false`

Bare Workflow

Use Xcode to set `UIRequiresFullScreen`

`userInterfaceStyle`

Type: `enum` • Path: `ios.userInterfaceStyle`

Configuration to force the app to always use the light or dark user-interface
appearance, such as "dark mode", or make it automatically adapt to the system
preferences. If not provided, defaults to `light`.

`infoPlist`

Type: `object` • Path: `ios.infoPlist`

Dictionary of arbitrary configuration to add to your standalone app's native
Info.plist. Applied prior to all other Expo-specific configuration. No other
validation is performed, so use this at your own risk of rejection from the
App Store.

`entitlements`

Type: `object` • Path: `ios.entitlements`

Dictionary of arbitrary configuration to add to your standalone app's native
*.entitlements (plist). Applied prior to all other Expo-specific
configuration. No other validation is performed, so use this at your own risk
of rejection from the App Store.

`privacyManifests`

Type: `object` • Path: `ios.privacyManifests`

Dictionary of privacy manifest definitions to add to your app's native
PrivacyInfo.xcprivacy file. [Learn
more](https://developer.apple.com/documentation/bundleresources/privacy_manifest_files)

`NSPrivacyAccessedAPITypes`

Type: `array` • Path: `ios.privacyManifests.NSPrivacyAccessedAPITypes`

A list of required reasons of why your app uses restricted API categories.
[Learn
more](https://developer.apple.com/documentation/bundleresources/privacy_manifest_files/describing_use_of_required_reason_api)

`NSPrivacyAccessedAPIType`

Type: `string` • Path:
`ios.privacyManifests.NSPrivacyAccessedAPITypes.NSPrivacyAccessedAPIType`

A string that identifies the category of required reason APIs your app uses

`NSPrivacyAccessedAPITypeReasons`

Type: `array` • Path:
`ios.privacyManifests.NSPrivacyAccessedAPITypes.NSPrivacyAccessedAPITypeReasons`

A list of reasons for a specific category.

`NSPrivacyTrackingDomains`

Type: `array` • Path: `ios.privacyManifests.NSPrivacyTrackingDomains`

A list of domains that your app uses for tracking.

`NSPrivacyTracking`

Type: `boolean` • Path: `ios.privacyManifests.NSPrivacyTracking`

A Boolean that indicates whether your app or third-party SDK uses data for
tracking.

`NSPrivacyCollectedDataTypes`

Type: `array` • Path: `ios.privacyManifests.NSPrivacyCollectedDataTypes`

A list of collected data types that your app uses.

`NSPrivacyCollectedDataType`

Type: `string` • Path:
`ios.privacyManifests.NSPrivacyCollectedDataTypes.NSPrivacyCollectedDataType`

`NSPrivacyCollectedDataTypeLinked`

Type: `boolean` • Path:
`ios.privacyManifests.NSPrivacyCollectedDataTypes.NSPrivacyCollectedDataTypeLinked`

`NSPrivacyCollectedDataTypeTracking`

Type: `boolean` • Path:
`ios.privacyManifests.NSPrivacyCollectedDataTypes.NSPrivacyCollectedDataTypeTracking`

`NSPrivacyCollectedDataTypePurposes`

Type: `array` • Path:
`ios.privacyManifests.NSPrivacyCollectedDataTypes.NSPrivacyCollectedDataTypePurposes`

`associatedDomains`

Type: `array` • Path: `ios.associatedDomains`

An array that contains Associated Domains for the standalone app. [Learn
more](https://developer.apple.com/documentation/safariservices/supporting_associated_domains).

Entries must follow the format `applinks:<fully qualified domain>[:port
number]`. [Learn
more](https://developer.apple.com/documentation/safariservices/supporting_associated_domains).

Bare Workflow

Build with EAS, or use Xcode to enable this capability manually. [Learn
more](https://developer.apple.com/documentation/safariservices/supporting_associated_domains).

`usesIcloudStorage`

Type: `boolean` • Path: `ios.usesIcloudStorage`

A boolean indicating if the app uses iCloud Storage for `DocumentPicker`. See
`DocumentPicker` docs for details.

Bare Workflow

Use Xcode, or ios.entitlements to configure this.

`usesAppleSignIn`

Type: `boolean` • Path: `ios.usesAppleSignIn`

A boolean indicating if the app uses Apple Sign-In. See `AppleAuthentication`
docs for details.

`usesBroadcastPushNotifications`

Type: `boolean` • Path: `ios.usesBroadcastPushNotifications`

A boolean indicating if the app uses Push Notifications Broadcast option for
Push Notifications capability. If true, EAS CLI will use the value during
capability syncing. If EAS CLI is not used, this configuration will not have
any effect unless another tool is used to operate on it, so enable the
capability manually on the Apple Developer Portal in that case.

`accessesContactNotes`

Type: `boolean` • Path: `ios.accessesContactNotes`

A Boolean value that indicates whether the app may access the notes stored in
contacts. You must [receive permission from
Apple](https://developer.apple.com/documentation/bundleresources/entitlements/com_apple_developer_contacts_notes)
before you can submit your app for review with this capability.

`splash`

Type: `object` • Path: `ios.splash`

Configuration for loading and splash screen for standalone iOS apps.

`backgroundColor`

Type: `string` • Path: `ios.splash.backgroundColor`

Color to fill the loading screen background

6 character long hex color string, for example, `'#000000'`

`resizeMode`

Type: `enum` • Path: `ios.splash.resizeMode`

Determines how the `image` will be displayed in the splash loading screen.
Must be one of `cover` or `contain`, defaults to `contain`.

`image`

Type: `string` • Path: `ios.splash.image`

Local path or remote URL to an image to fill the background of the loading
screen. Image size and aspect ratio are up to you. Must be a .png.

`tabletImage`

Type: `string` • Path: `ios.splash.tabletImage`

Local path or remote URL to an image to fill the background of the loading
screen. Image size and aspect ratio are up to you. Must be a .png.

`dark`

Type: `object` • Path: `ios.splash.dark`

Configuration for loading and splash screen for standalone iOS apps in dark
mode.

`backgroundColor`

Type: `string` • Path: `ios.splash.dark.backgroundColor`

Color to fill the loading screen background

6 character long hex color string, for example, `'#000000'`

`resizeMode`

Type: `enum` • Path: `ios.splash.dark.resizeMode`

Determines how the `image` will be displayed in the splash loading screen.
Must be one of `cover` or `contain`, defaults to `contain`.

`image`

Type: `string` • Path: `ios.splash.dark.image`

Local path or remote URL to an image to fill the background of the loading
screen. Image size and aspect ratio are up to you. Must be a .png.

`tabletImage`

Type: `string` • Path: `ios.splash.dark.tabletImage`

Local path or remote URL to an image to fill the background of the loading
screen. Image size and aspect ratio are up to you. Must be a .png.

`jsEngine`

Type: `enum` • Path: `ios.jsEngine`

@deprecated This field will be removed in a future release. When it is
removed, you can continue using JavaScriptCore instead of Hermes by following
the instructions in [@react-native-
community/javascriptcore](https://github.com/react-native-
community/javascriptcore). Specifies the JavaScript engine for iOS apps. Not
supported in Expo Go. Defaults to `hermes`. Valid values: `hermes`, `jsc`.

Bare Workflow

To change the JavaScript engine, update the `expo.jsEngine` value in
`ios/Podfile.properties.json`

`newArchEnabled`

Type: `boolean` • Path: `ios.newArchEnabled`

A Boolean value that indicates whether the iOS app should use the new
architecture.

`runtimeVersion`

One of types:

  * `string` matching the following pattern: `^[a-zA-Z\d][a-zA-Z\d._+()-]{0,254}$`
  * `string` matching the following pattern: `^exposdk:((\d+\.\d+\.\d+)|(UNVERSIONED))$`
  * An `object` with the following properties:

`policy`

Type: `enum` • Path: `ios.runtimeVersion.policy`

Valid values: `nativeVersion`, `sdkVersion`, `appVersion`, `fingerprint`.

Property indicating compatibility between an iOS build's native code and an
OTA update for the iOS platform. If provided, this will override the value of
the top level `runtimeVersion` key on iOS.

`version`

Type: `string` • Path: `ios.version`

Your iOS app version. Takes precedence over the root `version` field. In
addition to this field, you'll also use `ios.buildNumber` — read more about
how to version your app [here](https://docs.expo.dev/distribution/app-
stores/#versioning-your-app). This corresponds to
`CFBundleShortVersionString`. The required format can be found
[here](https://developer.apple.com/documentation/bundleresources/information_property_list/cfbundleshortversionstring).

Bare Workflow

To change your app version, edit the 'Version' field in Xcode`

`android`

Type: `object`

Configuration that is specific to the Android platform.

`publishManifestPath`

Type: `string` • Path: `android.publishManifestPath`

The manifest for the Android version of your app will be written to this path
during publish.

`publishBundlePath`

Type: `string` • Path: `android.publishBundlePath`

The bundle for the Android version of your app will be written to this path
during publish.

`package`

Type: `string` • Path: `android.package`

The package name for your Android standalone app. You make it up, but it needs
to be unique on the Play Store. See [this StackOverflow
question](http://stackoverflow.com/questions/6273892/android-package-name-
convention).

Reverse DNS notation unique name for your app. Valid Android Application ID.
For example, `com.example.app`, where `com.example` is our domain and `app` is
our app. The name may only contain lowercase and uppercase letters (a-z, A-Z),
numbers (0-9) and underscores (_), separated by periods (.). Each component of
the name should start with a lowercase letter.

Bare Workflow

This is set in `android/app/build.gradle` as `applicationId` as well as in
your `AndroidManifest.xml` file (multiple places).

`versionCode`

Type: `integer` • Path: `android.versionCode`

Version number required by Google Play. Increment by one for each release.
Must be a positive integer. [Learn
more](https://developer.android.com/studio/publish/versioning.html)

Bare Workflow

This is set in `android/app/build.gradle` as `versionCode`

`backgroundColor`

Type: `string` • Path: `android.backgroundColor`

The background color for your Android app, behind any of your React views.
Overrides the top-level `backgroundColor` key if it is present.

6 character long hex color string, for example, `'#000000'`

Bare Workflow

This is set in `android/app/src/main/AndroidManifest.xml` under
`android:windowBackground`

`userInterfaceStyle`

Type: `enum` • Path: `android.userInterfaceStyle`

Configuration to force the app to always use the light or dark user-interface
appearance, such as "dark mode", or make it automatically adapt to the system
preferences. If not provided, defaults to `light`. Requires `expo-system-ui`
be installed in your project to work on Android.

`scheme`

One of types:

  * `string` matching the following pattern: `^[a-z][a-z0-9+.-]*$`
`{ "type": "array", "items": { "type": "string", "pattern":
"^[a-z][a-z0-9+.-]*$" } }`

URL scheme(s) to link into your Android app. Schemes added to this field will
be merged with the schemes in the `scheme` key at the top level of the config.

String beginning with a lowercase letter followed by any combination of
lowercase letters, digits, "+", "." or "-"

Bare Workflow

To change your app's scheme, replace all occurrences of the old scheme in
`Info.plist` and `AndroidManifest.xml`

`icon`

Type: `string` • Path: `android.icon`

Local path or remote URL to an image to use for your app's icon on Android. If
specified, this overrides the top-level `icon` key. We recommend that you use
a 1024x1024 png file (transparency is recommended for the Google Play Store).
This icon will appear on the home screen and within the Expo Go app.

`adaptiveIcon`

Type: `object` • Path: `android.adaptiveIcon`

Settings for an Adaptive Launcher Icon on Android. [Learn
more](https://developer.android.com/guide/practices/ui_guidelines/icon_design_adaptive)

`foregroundImage`

Type: `string` • Path: `android.adaptiveIcon.foregroundImage`

Local path or remote URL to an image to use for your app's icon on Android. If
specified, this overrides the top-level `icon` and the `android.icon` keys.
Should follow the [specified
guidelines](https://developer.android.com/guide/practices/ui_guidelines/icon_design_adaptive).
This icon will appear on the home screen.

`monochromeImage`

Type: `string` • Path: `android.adaptiveIcon.monochromeImage`

Local path or remote URL to an image representing the Android 13+
monochromatic icon. Should follow the [specified
guidelines](https://developer.android.com/guide/practices/ui_guidelines/icon_design_adaptive).
This icon will appear on the home screen when the user enables 'Themed icons'
in system settings on a device running Android 13+.

`backgroundImage`

Type: `string` • Path: `android.adaptiveIcon.backgroundImage`

Local path or remote URL to a background image for your app's Adaptive Icon on
Android. If specified, this overrides the `backgroundColor` key. Must have the
same dimensions as `foregroundImage`, and has no effect if `foregroundImage`
is not specified. Should follow the [specified
guidelines](https://developer.android.com/guide/practices/ui_guidelines/icon_design_adaptive).

`backgroundColor`

Type: `string` • Path: `android.adaptiveIcon.backgroundColor`

Color to use as the background for your app's Adaptive Icon on Android.
Defaults to white, `#FFFFFF`. Has no effect if `foregroundImage` is not
specified.

6 character long hex color string, for example, `'#000000'`

`playStoreUrl`

Type: `string` • Path: `android.playStoreUrl`

URL to your app on the Google Play Store, if you have deployed it there. This
is used to link to your store page from your Expo project page if your app is
public.

Example

`"https://play.google.com/store/apps/details?id=host.exp.exponent"`

`permissions`

Type: `array` • Path: `android.permissions`

A list of permissions to add to the app `AndroidManifest.xml` during prebuild.
For example: `['android.permission.SCHEDULE_EXACT_ALARM']`

Bare Workflow

To change the permissions your app requests, edit `AndroidManifest.xml`
directly. To prevent your app from requesting specific permissions (which may
automatically be added through an installed native package), add those
permissions to `AndroidManifest.xml` along with a `tools:node="remove"` tag.

`blockedPermissions`

Type: `array` • Path: `android.blockedPermissions`

List of permissions to block in the final `AndroidManifest.xml`. This is
useful for removing permissions that are added by native package
`AndroidManifest.xml` files which are merged into the final manifest.
Internally this feature uses the `tools:node="remove"` XML attribute to remove
permissions. Not available in Expo Go.

`googleServicesFile`

Type: `string` • Path: `android.googleServicesFile`

[Firebase Configuration
File](https://support.google.com/firebase/answer/7015592) Location of the
`google-services.json` file for configuring Firebase. Including this key
automatically enables FCM in your standalone app.

Bare Workflow

Add or edit the file directly at `android/app/google-services.json`

`config`

Type: `object` • Path: `android.config`

Note: This property key is not included in the production manifest and will
evaluate to `undefined`. It is used internally only in the build process,
because it contains API keys that some may want to keep private.

`branch`

Type: `object` • Path: `android.config.branch`

[Branch](https://branch.io/) key to hook up Branch linking services.

`apiKey`

Type: `string` • Path: `android.config.branch.apiKey`

Your Branch API key

`googleMaps`

Type: `object` • Path: `android.config.googleMaps`

[Google Maps Android
SDK](https://developers.google.com/maps/documentation/android-api/signup)
configuration for your standalone app.

`apiKey`

Type: `string` • Path: `android.config.googleMaps.apiKey`

Your Google Maps Android SDK API key

`googleMobileAdsAppId`

Type: `string` • Path: `android.config.googleMobileAdsAppId`

[Google Mobile Ads App ID](https://support.google.com/admob/answer/6232340)
Google AdMob App ID.

`googleMobileAdsAutoInit`

Type: `boolean` • Path: `android.config.googleMobileAdsAutoInit`

A boolean indicating whether to initialize Google App Measurement and begin
sending user-level event data to Google immediately when the app starts. The
default in Expo (Client and in standalone apps) is `false`. [Sets the opposite
of the given value to the following key in
`Info.plist`](https://developers.google.com/admob/ios/eu-
consent#delay_app_measurement_optional)

`splash`

Type: `object` • Path: `android.splash`

Configuration for loading and splash screen for managed and standalone Android
apps.

`backgroundColor`

Type: `string` • Path: `android.splash.backgroundColor`

Color to fill the loading screen background

6 character long hex color string, for example, `'#000000'`

`resizeMode`

Type: `enum` • Path: `android.splash.resizeMode`

Determines how the `image` will be displayed in the splash loading screen.
Must be one of `cover`, `contain` or `native`, defaults to `contain`.

`image`

Type: `string` • Path: `android.splash.image`

Local path or remote URL to an image to fill the background of the loading
screen. Image size and aspect ratio are up to you. Must be a .png.

`mdpi`

Type: `string` • Path: `android.splash.mdpi`

Local path or remote URL to an image to fill the background of the loading
screen in "native" mode. Image size and aspect ratio are up to you. [Learn
more](https://developer.android.com/training/multiscreen/screendensities)

`Natural sized image (baseline)`

`hdpi`

Type: `string` • Path: `android.splash.hdpi`

Local path or remote URL to an image to fill the background of the loading
screen in "native" mode. Image size and aspect ratio are up to you. [Learn
more](https://developer.android.com/training/multiscreen/screendensities)

`Scale 1.5x`

`xhdpi`

Type: `string` • Path: `android.splash.xhdpi`

Local path or remote URL to an image to fill the background of the loading
screen in "native" mode. Image size and aspect ratio are up to you. [Learn
more](https://developer.android.com/training/multiscreen/screendensities)

`Scale 2x`

`xxhdpi`

Type: `string` • Path: `android.splash.xxhdpi`

Local path or remote URL to an image to fill the background of the loading
screen in "native" mode. Image size and aspect ratio are up to you. [Learn
more](https://developer.android.com/training/multiscreen/screendensities)

`Scale 3x`

`xxxhdpi`

Type: `string` • Path: `android.splash.xxxhdpi`

Local path or remote URL to an image to fill the background of the loading
screen in "native" mode. Image size and aspect ratio are up to you. [Learn
more](https://developer.android.com/training/multiscreen/screendensities)

`Scale 4x`

`dark`

Type: `object` • Path: `android.splash.dark`

Configuration for loading and splash screen for managed and standalone Android
apps in dark mode.

`backgroundColor`

Type: `string` • Path: `android.splash.dark.backgroundColor`

Color to fill the loading screen background

6 character long hex color string, for example, `'#000000'`

`resizeMode`

Type: `enum` • Path: `android.splash.dark.resizeMode`

Determines how the `image` will be displayed in the splash loading screen.
Must be one of `cover`, `contain` or `native`, defaults to `contain`.

`image`

Type: `string` • Path: `android.splash.dark.image`

Local path or remote URL to an image to fill the background of the loading
screen. Image size and aspect ratio are up to you. Must be a .png.

`mdpi`

Type: `string` • Path: `android.splash.dark.mdpi`

Local path or remote URL to an image to fill the background of the loading
screen in "native" mode. Image size and aspect ratio are up to you. [Learn
more](https://developer.android.com/training/multiscreen/screendensities)

`Natural sized image (baseline)`

`hdpi`

Type: `string` • Path: `android.splash.dark.hdpi`

Local path or remote URL to an image to fill the background of the loading
screen in "native" mode. Image size and aspect ratio are up to you. [Learn
more](https://developer.android.com/training/multiscreen/screendensities)

`Scale 1.5x`

`xhdpi`

Type: `string` • Path: `android.splash.dark.xhdpi`

Local path or remote URL to an image to fill the background of the loading
screen in "native" mode. Image size and aspect ratio are up to you. [Learn
more](https://developer.android.com/training/multiscreen/screendensities)

`Scale 2x`

`xxhdpi`

Type: `string` • Path: `android.splash.dark.xxhdpi`

Local path or remote URL to an image to fill the background of the loading
screen in "native" mode. Image size and aspect ratio are up to you. [Learn
more](https://developer.android.com/training/multiscreen/screendensities)

`Scale 3x`

`xxxhdpi`

Type: `string` • Path: `android.splash.dark.xxxhdpi`

Local path or remote URL to an image to fill the background of the loading
screen in "native" mode. Image size and aspect ratio are up to you. [Learn
more](https://developer.android.com/training/multiscreen/screendensities)

`Scale 4x`

`intentFilters`

Type: `array` • Path: `android.intentFilters`

Configuration for setting an array of custom intent filters in Android
manifest. [Learn more](https://developer.android.com/guide/components/intents-
filters)

Bare Workflow

This is set in `AndroidManifest.xml` directly. [Learn
more.](https://developer.android.com/guide/components/intents-filters)

Example

`[ { "autoVerify": true, "action": "VIEW", "data": { "scheme": "https",
"host": "*.example.com" }, "category": [ "BROWSABLE", "DEFAULT" ] } ]`

`autoVerify`

Type: `boolean` • Path: `android.intentFilters.autoVerify`

You may also use an intent filter to set your app as the default handler for
links (without showing the user a dialog with options). To do so use `true`
and then configure your server to serve a JSON file verifying that you own the
domain. [Learn more](https://developer.android.com/training/app-links)

`action`

Type: `string` • Path: `android.intentFilters.action`

`data`

Type: `undefined` • Path: `android.intentFilters.data`

`category`

Type: `undefined` • Path: `android.intentFilters.category`

`allowBackup`

Type: `boolean` • Path: `android.allowBackup`

Allows your user's app data to be automatically backed up to their Google
Drive. If this is set to false, no backup or restore of the application will
ever be performed (this is useful if your app deals with sensitive
information). Defaults to the Android default, which is `true`.

`softwareKeyboardLayoutMode`

Type: `enum` • Path: `android.softwareKeyboardLayoutMode`

Determines how the software keyboard will impact the layout of your
application. This maps to the `android:windowSoftInputMode` property. Defaults
to `resize`. Valid values: `resize`, `pan`.

`jsEngine`

Type: `enum` • Path: `android.jsEngine`

@deprecated This field will be removed in a future release. When it is
removed, you can continue using JavaScriptCore instead of Hermes by following
the instructions in [@react-native-
community/javascriptcore](https://github.com/react-native-
community/javascriptcore). Specifies the JavaScript engine for Android apps.
Defaults to `hermes`. Valid values: `hermes`, `jsc`.

Bare Workflow

To change the JavaScript engine, update the `expo.jsEngine` value in
`android/gradle.properties`

`newArchEnabled`

Type: `boolean` • Path: `android.newArchEnabled`

A Boolean value that indicates whether the Android app should use the new
architecture.

`runtimeVersion`

One of types:

  * `string` matching the following pattern: `^[a-zA-Z\d][a-zA-Z\d._+()-]{0,254}$`
  * `string` matching the following pattern: `^exposdk:((\d+\.\d+\.\d+)|(UNVERSIONED))$`
  * An `object` with the following properties:

`policy`

Type: `enum` • Path: `android.runtimeVersion.policy`

Valid values: `nativeVersion`, `sdkVersion`, `appVersion`, `fingerprint`.

Property indicating compatibility between a Android build's native code and an
OTA update for the Android platform. If provided, this will override the value
of top level `runtimeVersion` key on Android.

`version`

Type: `string` • Path: `android.version`

Your android app version. Takes precedence over the root `version` field. In
addition to this field, you'll also use `android.versionCode` — read more
about how to version your app [here](https://docs.expo.dev/distribution/app-
stores/#versioning-your-app). This corresponds to `versionName`. The required
format can be found
[here](https://developer.apple.com/documentation/bundleresources/information_property_list/cfbundleshortversionstring).

Bare Workflow

To change your app version, edit the `versionName` string in
`android/app/build.gradle`

`edgeToEdgeEnabled`

Type: `boolean` • Path: `android.edgeToEdgeEnabled`

Enable your app to run in [edge-to-
edge](https://developer.android.com/develop/ui/views/layout/edge-to-edge)
mode. Default to false.

Bare Workflow

To change the setting, update the `expo.edgeToEdgeEnabled` value in
`android/gradle.properties` and update the `AppTheme`'s `parent` attribute to
one of the [Theme.EdgeToEdge values](https://github.com/zoontek/react-native-
edge-to-edge#pick-a-parent-theme) in `styles.xml`

`predictiveBackGestureEnabled`

Type: `boolean` • Path: `android.predictiveBackGestureEnabled`

Enable your app to use the [predictive back
gesture](https://developer.android.com/guide/navigation/custom-
back/predictive-back-gesture) on Android 13 (API level 33) and later. Default
to false.

Bare Workflow

To change the setting, update the `android:enableOnBackInvokedCallback` value
in `AndroidManifest.xml`.

`web`

Type: `object`

Configuration that is specific to the web platform.

`output`

Type: `enum` • Path: `web.output`

Sets the export method for the web app for both `expo start` and `expo
export`. `static` statically renders HTML files for every route in the `app/`
directory, which is available only in Expo Router apps. `single` outputs a
Single Page Application (SPA), with a single `index.html` in the output
folder, and has no statically indexable HTML. `server` outputs static HTML,
and API Routes for hosting with a custom Node.js server. Defaults to `single`.

`favicon`

Type: `string` • Path: `web.favicon`

Relative path of an image to use for your app's favicon.

`name`

Type: `string` • Path: `web.name`

Defines the title of the document, defaults to the outer level name

`shortName`

Type: `string` • Path: `web.shortName`

A short version of the app's name, 12 characters or fewer. Used in app
launcher and new tab pages. Maps to `short_name` in the PWA manifest.json.
Defaults to the `name` property.

Maximum 12 characters long

`lang`

Type: `string` • Path: `web.lang`

Specifies the primary language for the values in the name and short_name
members. This value is a string containing a single language tag.

`scope`

Type: `string` • Path: `web.scope`

Defines the navigation scope of this website's context. This restricts what
web pages can be viewed while the manifest is applied. If the user navigates
outside the scope, it returns to a normal web page inside a browser
tab/window. If the scope is a relative URL, the base URL will be the URL of
the manifest.

`themeColor`

Type: `string` • Path: `web.themeColor`

Defines the color of the Android tool bar, and may be reflected in the app's
preview in task switchers.

6 character long hex color string, for example, `'#000000'`

`description`

Type: `string` • Path: `web.description`

Provides a general description of what the pinned website does.

`dir`

Type: `enum` • Path: `web.dir`

Specifies the primary text direction for the name, short_name, and description
members. Together with the lang member, it helps the correct display of right-
to-left languages.

`display`

Type: `enum` • Path: `web.display`

Defines the developers’ preferred display mode for the website.

`startUrl`

Type: `string` • Path: `web.startUrl`

The URL that loads when a user launches the application (e.g., when added to
home screen), typically the index. Note: This has to be a relative URL,
relative to the manifest URL.

`orientation`

Type: `enum` • Path: `web.orientation`

Defines the default orientation for all the website's top level browsing
contexts.

`backgroundColor`

Type: `string` • Path: `web.backgroundColor`

Defines the expected “background color” for the website. This value repeats
what is already available in the site’s CSS, but can be used by browsers to
draw the background color of a shortcut when the manifest is available before
the stylesheet has loaded. This creates a smooth transition between launching
the web application and loading the site's content.

6 character long hex color string, for example, `'#000000'`

`barStyle`

Type: `enum` • Path: `web.barStyle`

If content is set to default, the status bar appears normal. If set to black,
the status bar has a black background. If set to black-translucent, the status
bar is black and translucent. If set to default or black, the web content is
displayed below the status bar. If set to black-translucent, the web content
is displayed on the entire screen, partially obscured by the status bar.

`preferRelatedApplications`

Type: `boolean` • Path: `web.preferRelatedApplications`

Hints for the user agent to indicate to the user that the specified native
applications (defined in expo.ios and expo.android) are recommended over the
website.

`dangerous`

Type: `object` • Path: `web.dangerous`

Experimental features. These will break without deprecation notice.

`splash`

Type: `object` • Path: `web.splash`

Configuration for PWA splash screens.

Bare Workflow

Use [expo-splash-screen](https://github.com/expo/expo/tree/main/packages/expo-
splash-screen#expo-splash-screen)

`backgroundColor`

Type: `string` • Path: `web.splash.backgroundColor`

Color to fill the loading screen background

6 character long hex color string, for example, `'#000000'`

`resizeMode`

Type: `enum` • Path: `web.splash.resizeMode`

Determines how the `image` will be displayed in the splash loading screen.
Must be one of `cover` or `contain`, defaults to `contain`.

`image`

Type: `string` • Path: `web.splash.image`

Local path or remote URL to an image to fill the background of the loading
screen. Image size and aspect ratio are up to you. Must be a .png.

`config`

Type: `object` • Path: `web.config`

Firebase web configuration. Used by the expo-firebase packages on both web and
native. [Learn
more](https://firebase.google.com/docs/reference/js/firebase.html#initializeapp)

`firebase`

Type: `object` • Path: `web.config.firebase`

`apiKey`

Type: `string` • Path: `web.config.firebase.apiKey`

`authDomain`

Type: `string` • Path: `web.config.firebase.authDomain`

`databaseURL`

Type: `string` • Path: `web.config.firebase.databaseURL`

`projectId`

Type: `string` • Path: `web.config.firebase.projectId`

`storageBucket`

Type: `string` • Path: `web.config.firebase.storageBucket`

`messagingSenderId`

Type: `string` • Path: `web.config.firebase.messagingSenderId`

`appId`

Type: `string` • Path: `web.config.firebase.appId`

`measurementId`

Type: `string` • Path: `web.config.firebase.measurementId`

`bundler`

Type: `enum` • Path: `web.bundler`

Sets the bundler to use for the web platform. Only supported in the local CLI
`npx expo`. Defaults to `webpack` if the `@expo/webpack-config` package is
installed, if not, it defaults to `metro`.

`experiments`

Type: `object`

Enable experimental features that may be unstable, unsupported, or removed
without deprecation notices.

`baseUrl`

Type: `string` • Path: `experiments.baseUrl`

Export a website relative to a subpath of a domain. The path will be prepended
as-is to links to all bundled resources. Prefix the path with a `/`
(recommended) to load all resources relative to the server root. If the path
does not start with a `/` then resources will be loaded relative to the code
that requests them, this could lead to unexpected behavior. Example
'/subpath'. Defaults to '' (empty string).

`buildCacheProvider`

Type: `undefined` • Path: `experiments.buildCacheProvider`

@deprecated This field is not longer marked as experimental and will be
removed in a future release, use the `buildCacheProvider` field instead.

`supportsTVOnly`

Type: `boolean` • Path: `experiments.supportsTVOnly`

If true, indicates that this project does not support tablets or handsets, and
only supports Apple TV and Android TV

`tsconfigPaths`

Type: `boolean` • Path: `experiments.tsconfigPaths`

Enable tsconfig/jsconfig `compilerOptions.paths` and `compilerOptions.baseUrl`
support for import aliases in Metro.

`typedRoutes`

Type: `boolean` • Path: `experiments.typedRoutes`

Enable support for statically typed links in Expo Router. This feature
requires TypeScript be set up in your Expo Router v2 project.

`turboModules`

Type: `boolean` • Path: `experiments.turboModules`

Enables Turbo Modules, which are a type of native modules that use a different
way of communicating between JS and platform code. When installing a Turbo
Module you will need to enable this experimental option (the library still
needs to be a part of Expo SDK already, like react-native-reanimated v2).
Turbo Modules do not support remote debugging and enabling this option will
disable remote debugging.

`reactCanary`

Type: `boolean` • Path: `experiments.reactCanary`

Experimentally use a vendored canary build of React for testing upcoming
features.

`reactCompiler`

Type: `boolean` • Path: `experiments.reactCompiler`

Experimentally enable React Compiler.

`reactServerComponentRoutes`

Type: `boolean` • Path: `experiments.reactServerComponentRoutes`

Experimentally enable React Server Components by default in Expo Router and
concurrent routing for transitions.

`reactServerFunctions`

Type: `boolean` • Path: `experiments.reactServerFunctions`

Experimentally enable React Server Functions support in Expo CLI and Expo
Router.

`_internal`

Type: `object`

Internal properties for developer tools

`pluginHistory`

Type: `object` • Path: `_internal.pluginHistory`

List of plugins already run on the config

