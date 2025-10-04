# Expo Application

[GitHub](https://github.com/expo/expo/tree/sdk-54/packages/expo-
application)[Changelog](https://github.com/expo/expo/tree/sdk-54/packages/expo-
application/CHANGELOG.md)[npm](https://www.npmjs.com/package/expo-application)

Ask AI

A universal library that provides information about the native application's
ID, app name, and build version at runtime.

[GitHub](https://github.com/expo/expo/tree/sdk-54/packages/expo-
application)[Changelog](https://github.com/expo/expo/tree/sdk-54/packages/expo-
application/CHANGELOG.md)[npm](https://www.npmjs.com/package/expo-application)

Ask AI

Android

iOS

tvOS

Web

Bundled version:

~7.0.7

Copy

* * *

`expo-application` provides useful information about the native application's
ID, app name, and build version at runtime.

## Installation

Terminal

Copy

`- ``npx expo install expo-application`

If you are installing this in an [existing React Native app](/bare/overview),
make sure to [install `expo`](/bare/installing-expo-modules) in your project.

## API

    
    
    import * as Application from 'expo-application';
    

## Constants

### `Application.applicationId`

Android

iOS

tvOS

Web

Type: `string | null`

The ID of the application. On Android, this is the application ID. On iOS,
this is the bundle ID. On web, this is `null`.

Example

`"com.cocoacasts.scribbles"`, `"com.apple.Pages"`

### `Application.applicationName`

Android

iOS

tvOS

Web

Type: `string | null`

The human-readable name of the application that is displayed with the app's
icon on the device's home screen or desktop. On Android and iOS, this value is
a `string` unless the name could not be retrieved, in which case this value
will be `null`. On web this value is `null`.

Example

`"Expo"`, `"Yelp"`, `"Instagram"`

### `Application.nativeApplicationVersion`

Android

iOS

tvOS

Web

Type: `string | null`

The human-readable version of the native application that may be displayed in
the app store. At time when native app is built, on Android, this is the
version name set by `version` in app config, and on iOS, the `Info.plist`
value for `CFBundleShortVersionString`. On web, this value is `null`.

Example

`"2.11.0"`

### `Application.nativeBuildVersion`

Android

iOS

tvOS

Web

Type: `string | null`

The internal build version of the native application that the app stores may
use to distinguish between different binaries. At the time when native app is
built, On Android, this is the version code set by `android.versionCode` in
app config, and on iOS, the `Info.plist` value for `CFBundleVersion` (set with
`ios.buildNumber` value in app config in a standalone app). On web, this value
is `null`. The return type on Android and iOS is `string`.

Example

`"114"`

## Methods

### `Application.getAndroidId()`

Android

Gets the value of
[`Settings.Secure.ANDROID_ID`](https://developer.android.com/reference/android/provider/Settings.Secure.html#ANDROID_ID).
This is a hexadecimal `string` unique to each combination of app-signing key,
user, and device. The value may change if a factory reset is performed on the
device or if an APK signing key changes. For more information about how the
platform handles `ANDROID_ID` in Android 8.0 (API level 26) and higher, see
[Android 8.0 Behavior
Changes](https://developer.android.com/about/versions/oreo/android-8.0-changes.html#privacy-
all). On iOS and web, this function is unavailable.

> In versions of the platform lower than Android 8.0 (API level 26), this
> value remains constant for the lifetime of the user's device. See the
> [ANDROID_ID](https://developer.android.com/reference/android/provider/Settings.Secure.html#ANDROID_ID)
> official docs for more information.

Returns:

`string`

Example

    
    
    Application.getAndroidId();
    // "dd96dec43fb81c97"
    

### `Application.getInstallationTimeAsync()`

Android

iOS

tvOS

Web

Gets the time the app was installed onto the device, not counting subsequent
updates. If the app is uninstalled and reinstalled, this method returns the
time the app was reinstalled.

  * On Android, this method uses [`PackageInfo.firstInstallTime`](https://developer.android.com/reference/android/content/pm/PackageInfo.html#firstInstallTime).
  * On iOS, this method uses the [`NSFileCreationDate`](https://developer.apple.com/documentation/foundation/nsfilecreationdate?language=objc) of the app's document root directory.
  * On web, this method returns `null`.

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<[Date](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Date)>`

A `Promise` that fulfills with a `Date` object that specifies the time the app
was installed on the device.

Example

    
    
    await Application.getInstallationTimeAsync();
    // 2019-07-18T18:08:26.121Z
    

### `Application.getInstallReferrerAsync()`

Android

Gets the referrer URL of the installed app with the [`Install Referrer
API`](https://developer.android.com/google/play/installreferrer) from the
Google Play Store. In practice, the referrer URL may not be a complete,
absolute URL.

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<string>`

A `Promise` that fulfills with a `string` of the referrer URL of the installed
app.

Example

    
    
    await Application.getInstallReferrerAsync();
    // "utm_source=google-play&utm_medium=organic"
    

### `Application.getIosApplicationReleaseTypeAsync()`

iOS

Gets the iOS application release type.

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<ApplicationReleaseType>`

A `Promise` which fulfills with an `ApplicationReleaseType`.

### `Application.getIosIdForVendorAsync()`

iOS

Gets the iOS "identifier for vendor"
([IDFV](https://developer.apple.com/documentation/uikit/uidevice/1620059-identifierforvendor))
value, a string ID that uniquely identifies a device to the app’s vendor. This
method may sometimes return `nil`, in which case wait and call the method
again later. This might happen when the device has been restarted before the
user has unlocked the device.

The OS will change the vendor identifier if all apps from the current app's
vendor have been uninstalled.

Returns:

`[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<string | null>`

A `Promise` that fulfills with a `string` specifying the app's vendor ID. Apps
from the same vendor will return the same ID. See Apple's documentation for
more information about the vendor ID's semantics.

Example

    
    
    await Application.getIosIdForVendorAsync();
    // "68753A44-4D6F-1226-9C60-0050E4C00067"
    

### `Application.getIosPushNotificationServiceEnvironmentAsync()`

iOS

Gets the current [Apple Push Notification
(APN)](https://developer.apple.com/documentation/bundleresources/entitlements/aps-
environment?language=objc) service environment.

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<PushNotificationServiceEnvironment>`

A `Promise` that fulfills with the string, either `'development'` or
`'production'`, based on the current APN environment, or `null` on the
simulator as it does not support registering with APNs.

### `Application.getLastUpdateTimeAsync()`

Android

Gets the last time the app was updated from the Google Play Store.

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<[Date](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Date)>`

A `Promise` that fulfills with a `Date` object that specifies the last time
the app was updated via the Google Play Store.

Example

    
    
    await Application.getLastUpdateTimeAsync();
    // 2019-07-18T21:20:16.887Z
    

## Types

### `PushNotificationServiceEnvironment`

iOS

Literal Type: `union`

Maps to the [`aps-
environment`](https://developer.apple.com/documentation/bundleresources/entitlements/aps-
environment) key in the native target's registered entitlements.

Acceptable values are: `'development'` | `'production'` | `null`

## Enums

### `ApplicationReleaseType`

iOS

#### `UNKNOWN`

`ApplicationReleaseType.UNKNOWN ＝ 0`

#### `SIMULATOR`

`ApplicationReleaseType.SIMULATOR ＝ 1`

#### `ENTERPRISE`

`ApplicationReleaseType.ENTERPRISE ＝ 2`

#### `DEVELOPMENT`

`ApplicationReleaseType.DEVELOPMENT ＝ 3`

#### `AD_HOC`

`ApplicationReleaseType.AD_HOC ＝ 4`

#### `APP_STORE`

`ApplicationReleaseType.APP_STORE ＝ 5`

## Error codes

Code| Description  
---|---  
`ERR_APPLICATION_PACKAGE_NAME_NOT_FOUND`| Error code thrown by
`getInstallationTimeAsync` and `getLastUpdateTimeAsync`. This may be thrown if
the package information or package name could not be retrieved.  
`ERR_APPLICATION_INSTALL_REFERRER_UNAVAILABLE`| The current Play Store app
doesn't provide the installation referrer API, or the Play Store may not be
installed. This error code may come up when testing on an AVD that doesn't
come with the Play Store pre-installed, such as the Google Pixel 3 and Nexus
6.  
`ERR_APPLICATION_INSTALL_REFERRER_CONNECTION`| A connection could not be
established to the Google Play Store.  
`ERR_APPLICATION_INSTALL_REFERRER_REMOTE_EXCEPTION`| A `RemoteException` was
thrown after a connection was established to the Play Store. This may happen
if the process hosting the remote object is no longer available, which usually
means the process crashed. See [this StackOverflow answer on
`RemoteException`](https://stackoverflow.com/questions/3156389/android-
remoteexceptions-and-services) for more information.  
`ERR_APPLICATION_INSTALL_REFERRER`| General default case error code for the
`getInstallReferrerAsync` method. This error code will be thrown if an
exception occurred when getting the install referrer, but the exception was
none of the more precise errors. The
[`responseCode`](https://developer.android.com/reference/com/android/installreferrer/api/InstallReferrerClient.InstallReferrerResponse.html)
is provided along with the error.  
`ERR_APPLICATION_INSTALL_REFERRER_SERVICE_DISCONNECTED`| Connection to the
install referrer service was lost. This error is thrown when an attempt was
made to connect and set up the install referrer service, but the connection
was lost. See the [Android
documentation](https://developer.android.com/reference/com/android/installreferrer/api/InstallReferrerStateListener)
for more information.

