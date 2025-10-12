# ![Expo Cellular icon](/static/images/packages/expo-cellular.png)Expo
Cellular

[GitHub](https://github.com/expo/expo/tree/sdk-54/packages/expo-
cellular)[Changelog](https://github.com/expo/expo/tree/sdk-54/packages/expo-
cellular/CHANGELOG.md)[npm](https://www.npmjs.com/package/expo-cellular)

Ask AI

An API that provides information about the user's cellular service provider.

[GitHub](https://github.com/expo/expo/tree/sdk-54/packages/expo-
cellular)[Changelog](https://github.com/expo/expo/tree/sdk-54/packages/expo-
cellular/CHANGELOG.md)[npm](https://www.npmjs.com/package/expo-cellular)

Ask AI

Android

iOS

Web

Bundled version:

~8.0.7

Copy

* * *

`expo-cellular` provides information about the user's cellular service
provider, such as its unique identifier, cellular connection type, and whether
it allows VoIP calls on its network.

## Installation

Terminal

Copy

`- ``npx expo install expo-cellular`

If you are installing this in an [existing React Native app](/bare/overview),
make sure to [install `expo`](/bare/installing-expo-modules) in your project.

## Configuration

Are you using this library in an existing React Native app?

If you're not using Continuous Native Generation ([CNG](/workflow/continuous-
native-generation)) or you're using native a android project manually, then
you need to add `android.permission.READ_PHONE_STATE` permission to your
project's AndroidManifest.xml. This permission is used for `TelephonyManager`.

android/app/src/main/AndroidManifest.xml

Copy

    
    
    <uses-permission android:name="android.permission.READ_PHONE_STATE" />
    

This library does not require the more risky `READ_PRIVILEGED_PHONE_STATE`
permission.

## API

    
    
    import * as Cellular from 'expo-cellular';
    

## Constants

> Deprecated Use `allowsVoipAsync()` instead.

### `Cellular.allowsVoip`

Android

iOS

Web

Type: `boolean | null`

Indicates if the carrier allows making VoIP calls on its network. On Android,
this checks whether the system supports SIP-based VoIP API. See the [Android
documentation](https://developer.android.com/reference/android/net/sip/SipManager.html#isVoipSupported\(android.content.Context\))
for more information.

On iOS, if you configure a device for a carrier and then remove the SIM card,
this property retains the `boolean` value indicating the carrier’s policy
regarding VoIP. If you then install a new SIM card, its VoIP policy `boolean`
replaces the previous value of this property.

On web, this returns `null`.

Example

    
    
    Cellular.allowsVoip; // true or false
    

> Deprecated Use `getCarrierNameAsync()` instead.

### `Cellular.carrier`

Android

iOS

Web

Type: `string | null`

The name of the user’s home cellular service provider. If the device has dual
SIM cards, only the carrier for the currently active SIM card will be
returned. On Android, this value is only available when the SIM state is
[`SIM_STATE_READY`](https://developer.android.com/reference/android/telephony/TelephonyManager.html#SIM_STATE_READY).
Otherwise, this returns `null`.

On iOS, if you configure a device for a carrier and then remove the SIM card,
this property retains the name of the carrier. If you then install a new SIM
card, its carrier name replaces the previous value of this property. The value
for this property is `null` if the user never configured a carrier for the
device.

On web, this returns `null`.

Example

    
    
    Cellular.carrier; // "T-Mobile" or "Verizon"
    

> Deprecated Use `getIsoCountryCodeAsync()` instead.

### `Cellular.isoCountryCode`

Android

iOS

Web

Type: `string | null`

The ISO country code for the user’s cellular service provider. On iOS, the
value is `null` if any of the following apply:

  * The device is in airplane mode.
  * There is no SIM card in the device.
  * The device is outside of cellular service range.

On web, this returns `null`.

Example

    
    
    Cellular.isoCountryCode; // "us" or "au"
    

> Deprecated Use `getMobileCountryCodeAsync()` instead.

### `Cellular.mobileCountryCode`

Android

iOS

Web

Type: `string | null`

The mobile country code (MCC) for the user’s current registered cellular
service provider. On Android, this value is only available when SIM state is
[`SIM_STATE_READY`](https://developer.android.com/reference/android/telephony/TelephonyManager.html#SIM_STATE_READY).
Otherwise, this returns `null`. On iOS, the value may be null on hardware
prior to iPhone 4S when in airplane mode. Furthermore, the value for this
property is `null` if any of the following apply:

  * There is no SIM card in the device.
  * The device is outside of cellular service range.

On web, this returns `null`.

Example

    
    
    Cellular.mobileCountryCode; // "310"
    

> Deprecated Use `getMobileNetworkCodeAsync()` instead.

### `Cellular.mobileNetworkCode`

Android

iOS

Web

Type: `string | null`

The ISO country code for the user’s cellular service provider. On iOS, the
value is `null` if any of the following apply:

  * The device is in airplane mode.
  * There is no SIM card in the device.
  * The device is outside of cellular service range.

On web, this returns `null`.

Example

    
    
    Cellular.mobileNetworkCode; // "260"
    

## Hooks

### `usePermissions(options)`

Android

iOS

Web

Parameter| Type  
---|---  
options(optional)| `PermissionHookOptions<object>`  
  
  

Check or request permissions to access the phone state. This uses both
`Cellular.requestPermissionsAsync` and `Cellular.getPermissionsAsync` to
interact with the permissions.

Returns:

`[null | PermissionResponse, RequestPermissionMethod<PermissionResponse>, GetPermissionMethod<PermissionResponse>]`

Example

    
    
    const [status, requestPermission] = Cellular.usePermissions();
    

## Methods

### `Cellular.allowsVoipAsync()`

Android

iOS

Web

Returns:

`[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<boolean | null>`

Returns if the carrier allows making VoIP calls on its network. On Android,
this checks whether the system supports SIP-based VoIP API. See
[here](https://developer.android.com/reference/android/net/sip/SipManager.html#isVoipSupported\(android.content.Context\))
to view more information.

On iOS, if you configure a device for a carrier and then remove the SIM card,
this property retains the `boolean` value indicating the carrier’s policy
regarding VoIP. If you then install a new SIM card, its VoIP policy `boolean`
replaces the previous value of this property.

On web, this returns `null`.

Example

    
    
    await Cellular.allowsVoipAsync(); // true or false
    

### `Cellular.getCarrierNameAsync()`

Android

iOS

Web

Returns:

`[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<string | null>`

Returns name of the user’s home cellular service provider. If the device has
dual SIM cards, only the carrier for the currently active SIM card will be
returned.

On Android, this value is only available when the SIM state is
[`SIM_STATE_READY`](https://developer.android.com/reference/android/telephony/TelephonyManager.html#SIM_STATE_READY).
Otherwise, this returns `null`.

On iOS, if you configure a device for a carrier and then remove the SIM card,
this property retains the name of the carrier. If you then install a new SIM
card, its carrier name replaces the previous value of this property. The value
for this property is `null` if the user never configured a carrier for the
device.

On web, this returns `null`.

Example

    
    
    await Cellular.getCarrierNameAsync(); // "T-Mobile" or "Verizon"
    

### `Cellular.getCellularGenerationAsync()`

Android

iOS

Web

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<CellularGeneration>`

Returns a promise which fulfils with a `Cellular.CellularGeneration` enum
value that represents the current cellular-generation type.

You will need to check if the native permission has been accepted to obtain
generation. If the permission is denied `getCellularGenerationAsync` will
resolve to `Cellular.Cellular Generation.UNKNOWN`.

On web, this method uses
[`navigator.connection.effectiveType`](https://developer.mozilla.org/en-
US/docs/Web/API/NetworkInformation/effectiveType) to detect the effective type
of the connection using a combination of recently observed round-trip time and
downlink values. See [here](https://developer.mozilla.org/en-
US/docs/Web/API/Network_Information_API) to view browser compatibility.

Example

    
    
    await Cellular.getCellularGenerationAsync();
    // CellularGeneration.CELLULAR_4G
    

### `Cellular.getIsoCountryCodeAsync()`

Android

iOS

Web

Returns:

`[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<string | null>`

Returns the ISO country code for the user’s cellular service provider.

On iOS, the value is `null` if any of the following apply:

  * The device is in airplane mode.
  * There is no SIM card in the device.
  * The device is outside of cellular service range.

On web, this returns `null`.

Example

    
    
    await Cellular.getIsoCountryCodeAsync(); // "us" or "au"
    

### `Cellular.getMobileCountryCodeAsync()`

Android

iOS

Web

Returns:

`[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<string | null>`

Returns mobile country code (MCC) for the user’s current registered cellular
service provider.

On Android, this value is only available when SIM state is
[`SIM_STATE_READY`](https://developer.android.com/reference/android/telephony/TelephonyManager.html#SIM_STATE_READY).
Otherwise, this returns `null`. On iOS, the value may be null on hardware
prior to iPhone 4S when in airplane mode. Furthermore, the value for this
property is `null` if any of the following apply:

  * There is no SIM card in the device.
  * The device is outside of cellular service range.

On web, this returns `null`.

Example

    
    
    await Cellular.getMobileCountryCodeAsync(); // "310"
    

### `Cellular.getMobileNetworkCodeAsync()`

Android

iOS

Web

Returns:

`[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<string | null>`

Returns the mobile network code (MNC) for the user’s current registered
cellular service provider.

On Android, this value is only available when SIM state is
[`SIM_STATE_READY`](https://developer.android.com/reference/android/telephony/TelephonyManager.html#SIM_STATE_READY).
Otherwise, this returns `null`. On iOS, the value may be null on hardware
prior to iPhone 4S when in airplane mode. Furthermore, the value for this
property is `null` if any of the following apply:

  * There is no SIM card in the device.
  * The device is outside of cellular service range.

On web, this returns `null`.

Example

    
    
    await Cellular.getMobileNetworkCodeAsync(); // "310"
    

### `Cellular.getPermissionsAsync()`

Android

iOS

Web

Checks user's permissions for accessing phone state.

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<PermissionResponse>`

### `Cellular.requestPermissionsAsync()`

Android

iOS

Web

Asks the user to grant permissions for accessing the phone state.

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<PermissionResponse>`

## Enums

### `CellularGeneration`

Android

iOS

Web

Describes the current generation of the cellular connection. It is an enum
with these possible values:

#### `UNKNOWN`

`CellularGeneration.UNKNOWN ＝ 0`

Either we are not currently connected to a cellular network or type could not
be determined.

#### `CELLULAR_2G`

`CellularGeneration.CELLULAR_2G ＝ 1`

Currently connected to a 2G cellular network. Includes CDMA, EDGE, GPRS, and
IDEN type connections.

#### `CELLULAR_3G`

`CellularGeneration.CELLULAR_3G ＝ 2`

Currently connected to a 3G cellular network. Includes EHRPD, EVDO, HSPA,
HSUPA, HSDPA, HSPAP, and UTMS type connections.

#### `CELLULAR_4G`

`CellularGeneration.CELLULAR_4G ＝ 3`

Currently connected to a 4G cellular network. Includes LTE type connections.

#### `CELLULAR_5G`

`CellularGeneration.CELLULAR_5G ＝ 4`

Currently connected to a 5G cellular network. Includes NR and NRNSA type
connections.

## Error codes

Code| Description  
---|---  
ERR_CELLULAR_GENERATION_UNKNOWN_NETWORK_TYPE| Unable to access network type or
not connected to a cellular network  
  
## Permissions

### Android

You must add the following permissions to your app.json inside the
[`expo.android.permissions`](/versions/latest/config/app#permissions) array.

Android Permission| Description  
---|---  
`READ_PHONE_STATE`| Allows read only access to phone state, including the
current cellular network information, the status of any ongoing calls, and a
list of any PhoneAccounts registered on the device.

> Allows read only access to phone state, including the current cellular
> network information, the status of any ongoing calls, and a list of any
> `[PhoneAccount](https://developer.android.com/reference/android/telecom/PhoneAccount)`s
> registered on the device.  
  
### iOS

_No permissions required_.

