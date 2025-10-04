# ![Expo LocalAuthentication icon](/static/images/packages/expo-local-
authentication.png)Expo LocalAuthentication

[GitHub](https://github.com/expo/expo/tree/sdk-54/packages/expo-local-
authentication)[Changelog](https://github.com/expo/expo/tree/sdk-54/packages/expo-
local-authentication/CHANGELOG.md)[npm](https://www.npmjs.com/package/expo-
local-authentication)

Ask AI

A library that provides functionality for implementing the Fingerprint API
(Android) or FaceID and TouchID (iOS) to authenticate the user with a face or
fingerprint scan.

[GitHub](https://github.com/expo/expo/tree/sdk-54/packages/expo-local-
authentication)[Changelog](https://github.com/expo/expo/tree/sdk-54/packages/expo-
local-authentication/CHANGELOG.md)[npm](https://www.npmjs.com/package/expo-
local-authentication)

Ask AI

Android

iOS

Bundled version:

~17.0.7

Copy

* * *

`expo-local-authentication` allows you to use the Biometric Prompt (Android)
or FaceID and TouchID (iOS) to authenticate the user with a fingerprint or
face scan.

## Known limitation

### iOS

iOS

The FaceID authentication for iOS is not supported in Expo Go. You will need
to create a [development build](/develop/development-builds/introduction) to
test FaceID.

## Installation

Terminal

Copy

`- ``npx expo install expo-local-authentication`

If you are installing this in an [existing React Native app](/bare/overview),
make sure to [install `expo`](/bare/installing-expo-modules) in your project.

## Configuration in app config

You can configure `expo-local-authentication` using its built-in [config
plugin](/config-plugins/introduction) if you use config plugins in your
project ([EAS Build](/build/introduction) or `npx expo run:[android|ios]`).
The plugin allows you to configure various properties that cannot be set at
runtime and require building a new app binary to take effect.

### Example app.json with config plugin

app.json

Copy

    
    
    {
      "expo": {
        "plugins": [
          [
            "expo-local-authentication",
            {
              "faceIDPermission": "Allow $(PRODUCT_NAME) to use Face ID."
            }
          ]
        ]
      }
    }
    

### Configurable properties

Name| Default| Description  
---|---|---  
`faceIDPermission`| `"Allow $(PRODUCT_NAME) to use Face ID"`| Only for: iOS  
A string to set the `NSFaceIDUsageDescription` permission message.  
  
Are you using this library in an existing React Native app?

If you're not using Continuous Native Generation ([CNG](/workflow/continuous-
native-generation)) or you're using a native ios project manually, then you
need to add `NSFaceIDUsageDescription` key to your ios/[app]/Info.plist:

Info.plist

Copy

    
    
    <key>NSFaceIDUsageDescription</key>
    <string>Allow $(PRODUCT_NAME) to use FaceID</string>
    

## API

    
    
    import * as LocalAuthentication from 'expo-local-authentication';
    

## Methods

### `LocalAuthentication.authenticateAsync(options)`

Android

iOS

Parameter| Type  
---|---  
options(optional)| `LocalAuthenticationOptions`  
  
  

Attempts to authenticate via Fingerprint/TouchID (or FaceID if available on
the device).

> Note: Apple requires apps which use FaceID to provide a description of why
> they use this API. If you try to use FaceID on an iPhone with FaceID without
> providing `infoPlist.NSFaceIDUsageDescription` in `app.json`, the module
> will authenticate using device passcode. For more information about usage
> descriptions on iOS, see [permissions guide](/guides/permissions#ios).

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<LocalAuthenticationResult>`

Returns a promise which fulfils with `LocalAuthenticationResult`.

### `LocalAuthentication.cancelAuthenticate()`

Android

Cancels authentication flow.

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<void>`

### `LocalAuthentication.getEnrolledLevelAsync()`

Android

iOS

Determine what kind of authentication is enrolled on the device.

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<SecurityLevel>`

Returns a promise which fulfils with `SecurityLevel`.

> Note: On Android devices prior to M, `SECRET` can be returned if only the
> SIM lock has been enrolled, which is not the method that `authenticateAsync`
> prompts.

### `LocalAuthentication.hasHardwareAsync()`

Android

iOS

Determine whether a face or fingerprint scanner is available on the device.

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<boolean>`

Returns a promise which fulfils with a `boolean` value indicating whether a
face or fingerprint scanner is available on this device.

### `LocalAuthentication.isEnrolledAsync()`

Android

iOS

Determine whether the device has saved fingerprints or facial data to use for
authentication.

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<boolean>`

Returns a promise which fulfils to `boolean` value indicating whether the
device has saved fingerprints or facial data for authentication.

### `LocalAuthentication.supportedAuthenticationTypesAsync()`

Android

iOS

Determine what kinds of authentications are available on the device.

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<AuthenticationType[]>`

Returns a promise which fulfils to an array containing `AuthenticationType`s.

Devices can support multiple authentication methods - i.e. `[1,2]` means the
device supports both fingerprint and facial recognition. If none are
supported, this method returns an empty array.

## Types

### `BiometricsSecurityLevel`

Android

Literal Type: `string`

Security level of the biometric authentication to allow.

Acceptable values are: `'weak'` | `'strong'`

### `LocalAuthenticationError`

Android

iOS

Literal Type: `string`

One of the error values returned by the `LocalAuthenticationResult` object.

Acceptable values are: `'not_enrolled'` | `'user_cancel'` | `'app_cancel'` | `'not_available'` | `'lockout'` | `'no_space'` | `'timeout'` | `'unable_to_process'` | `'unknown'` | `'system_cancel'` | `'user_fallback'` | `'invalid_context'` | `'passcode_not_set'` | `'authentication_failed'`

### `LocalAuthenticationOptions`

Android

iOS

Property| Type| Description  
---|---|---  
biometricsSecurityLevel(optional)| `BiometricsSecurityLevel`| Only for:
Android  
Sets the security class of biometric authentication to allow. `strong` allows
only Android Class 3 biometrics. For example, a fingerprint or a 3D face scan.
`weak` allows both Android Class 3 and Class 2 biometrics. Class 2 biometrics
are less secure than Class 3. For example, a camera-based face
unlock.Default:`'weak'`  
cancelLabel(optional)| `string`| Allows customizing the default `Cancel` label
shown.  
disableDeviceFallback(optional)| `boolean`| After several failed attempts, the
system falls back to the device passcode. This setting allows you to disable
this option and instead handle the fallback yourself. This can be preferable
in certain custom authentication workflows. This behaviour maps to using the
iOS
[`LAPolicyDeviceOwnerAuthenticationWithBiometrics`](https://developer.apple.com/documentation/localauthentication/lapolicy/deviceownerauthenticationwithbiometrics)
policy rather than the
[`LAPolicyDeviceOwnerAuthentication`](https://developer.apple.com/documentation/localauthentication/lapolicy/deviceownerauthentication?language=objc)
policy. Defaults to `false`.  
fallbackLabel(optional)| `string`| Only for: iOS  
Allows to customize the default `Use Passcode` label shown after several
failed authentication attempts. Setting this option to an empty string
disables this button from showing in the prompt.  
promptDescription(optional)| `string`| Only for: Android  
A description displayed in the middle of the authentication prompt.  
promptMessage(optional)| `string`| A message that is shown alongside the
TouchID or FaceID prompt.  
promptSubtitle(optional)| `string`| Only for: Android  
A subtitle displayed below the prompt message in the authentication prompt.  
requireConfirmation(optional)| `boolean`| Only for: Android  
Sets a hint to the system for whether to require user confirmation after
authentication. This may be ignored by the system if the user has disabled
implicit authentication in Settings or if it does not apply to a particular
biometric modality. Defaults to `true`.  
  
### `LocalAuthenticationResult`

Android

iOS

Type: `object` shaped as below:

Property| Type| Description  
---|---|---  
success| `true`| -  
  
Or `object` shaped as below:

Property| Type| Description  
---|---|---  
error| `LocalAuthenticationError`| -  
success| `false`| -  
warning(optional)| `string`| -  
  
## Enums

### `AuthenticationType`

Android

iOS

#### `FINGERPRINT`

`AuthenticationType.FINGERPRINT ＝ 1`

Indicates fingerprint support.

#### `FACIAL_RECOGNITION`

`AuthenticationType.FACIAL_RECOGNITION ＝ 2`

Indicates facial recognition support.

#### `IRIS`

Android

`AuthenticationType.IRIS ＝ 3`

Indicates iris recognition support.

### `SecurityLevel`

Android

iOS

#### `NONE`

`SecurityLevel.NONE ＝ 0`

Indicates no enrolled authentication.

#### `SECRET`

`SecurityLevel.SECRET ＝ 1`

Indicates non-biometric authentication (e.g. PIN, Pattern).

#### `BIOMETRIC_WEAK`

`SecurityLevel.BIOMETRIC_WEAK ＝ 2`

Indicates weak biometric authentication. For example, a 2D image-based face
unlock.

> There are currently no weak biometric authentication options on iOS.

#### `BIOMETRIC_STRONG`

`SecurityLevel.BIOMETRIC_STRONG ＝ 3`

Indicates strong biometric authentication. For example, a fingerprint scan or
3D face unlock.

## Permissions

### Android

The following permissions are added automatically through this library's
AndroidManifest.xml:

Android Permission| Description  
---|---  
`USE_BIOMETRIC`| Allows an app to use device supported biometric modalities.  
`USE_FINGERPRINT`|

> This constant was deprecated in API level 28. Applications should request
> USE_BIOMETRIC instead  
  
### iOS

The following usage description keys are used by this library:

Info.plist Key| Description  
---|---  
`NSFaceIDUsageDescription`| A message that tells the user why the app is
requesting the ability to authenticate with Face ID.

