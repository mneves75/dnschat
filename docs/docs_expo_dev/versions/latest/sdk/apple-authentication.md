# Expo AppleAuthentication

[GitHub](https://github.com/expo/expo/tree/sdk-54/packages/expo-apple-
authentication)[Changelog](https://github.com/expo/expo/tree/sdk-54/packages/expo-
apple-authentication/CHANGELOG.md)[npm](https://www.npmjs.com/package/expo-
apple-authentication)

Ask AI

A library that provides Sign-in with Apple capability for iOS.

[GitHub](https://github.com/expo/expo/tree/sdk-54/packages/expo-apple-
authentication)[Changelog](https://github.com/expo/expo/tree/sdk-54/packages/expo-
apple-authentication/CHANGELOG.md)[npm](https://www.npmjs.com/package/expo-
apple-authentication)

Ask AI

iOS

tvOS

Bundled version:

~8.0.7

Copy

* * *

`expo-apple-authentication` provides Apple authentication for iOS. It does not
yet support Android or web.

Any app that includes third-party authentication options must provide Apple
authentication as an option to comply with App Store Review guidelines. For
more information, see Apple authentication on the [Sign In with
Apple](https://developer.apple.com/sign-in-with-apple/) website.

## Installation

Terminal

Copy

`- ``npx expo install expo-apple-authentication`

If you are installing this in an [existing React Native app](/bare/overview),
make sure to [install `expo`](/bare/installing-expo-modules) in your project.

## Configuration in app config

You can configure `expo-apple-authentication` using its built-in [config
plugin](/config-plugins/introduction) if you use config plugins in your
project ([EAS Build](/build/introduction) or `npx expo run:[android|ios]`).
The plugin allows you to configure various properties that cannot be set at
runtime and require building a new app binary to take effect. If your app does
not use EAS Build, then you'll need to manually configure the package.

### Setup iOS project

To enable the Sign In with Apple capability in your app, set the
[`ios.usesAppleSignIn`](/versions/latest/config/app#usesapplesignin) property
to `true` in your project's app config:

app.json

Copy

    
    
    {
      "expo": {
        "ios": {
          "usesAppleSignIn": true
        }
      }
    }
    

### Example app.json with config plugin

Running [EAS Build](/build/introduction) locally will use [iOS capabilities
signing](/build-reference/ios-capabilities) to enable the required
capabilities before building.

app.json

Copy

    
    
    {
      "expo": {
        "plugins": ["expo-apple-authentication"]
      }
    }
    

Are you using this library in an existing React Native app?

Apps that don't use [EAS Build](/build/introduction) must [manually
configure](/build-reference/ios-capabilities#manual-setup) the Apple Sign In
capability for their bundle identifier.

If you enable the Apple Sign In capability through the [Apple Developer
Console](/build-reference/ios-capabilities#apple-developer-console), then be
sure to add the following entitlements in your ios/[app]/[app].entitlements
file:

    
    
    <key>com.apple.developer.applesignin</key>
    <array>
      <string>Default</string>
    </array>
    

Also, set `CFBundleAllowMixedLocalizations` to `true` in your
ios/[app]/Info.plist to ensure the sign-in button uses the device locale.

## Usage

Apple Authentication Usage

Copy

Open in Snack

    
    
    import * as AppleAuthentication from 'expo-apple-authentication';
    import { View, StyleSheet } from 'react-native';
    
    export default function App() {
      return (
        <View style={styles.container}>
          <AppleAuthentication.AppleAuthenticationButton
            buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
            buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
            cornerRadius={5}
            style={styles.button}
            onPress={async () => {
              try {
                const credential = await AppleAuthentication.signInAsync({
                  requestedScopes: [
                    AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
                    AppleAuthentication.AppleAuthenticationScope.EMAIL,
                  ],
                });
                // signed in
              } catch (e) {
                if (e.code === 'ERR_REQUEST_CANCELED') {
                  // handle that the user canceled the sign-in flow
                } else {
                  // handle other errors
                }
              }
            }}
          />
        </View>
      );
    }
    
    const styles = StyleSheet.create({
      container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
      },
      button: {
        width: 200,
        height: 44,
      },
    });
    

## Development and testing

You can test this library in Expo Go on iOS without following any of the
instructions above. However, you'll need to add the config plugin to use this
library if you are using EAS Build. When you sign into Expo Go, the
identifiers and values you receive will likely be different than what you'll
receive in standalone apps.

You can do limited testing of this library on the iOS Simulator. However, not
all methods will behave the same as on a device, so we highly recommend
testing on a real device when possible while developing.

## Verifying the Response from Apple

Apple's response includes a signed JWT with information about the user. To
ensure that the response came from Apple, you can cryptographically verify the
signature with Apple's public key, which is published at
<https://appleid.apple.com/auth/keys>. This process is not specific to Expo.

## API

    
    
    import * as AppleAuthentication from 'expo-apple-authentication';
    

## Component

### `AppleAuthenticationButton`

iOS

tvOS

Type: `React.Element<AppleAuthenticationButtonProps>`

This component displays the proprietary "Sign In with Apple" / "Continue with
Apple" button on your screen. The App Store Guidelines require you to use this
component to start the authentication process instead of a custom button.
Limited customization of the button is available via the provided properties.

You should only attempt to render this if
`AppleAuthentication.isAvailableAsync()` resolves to `true`. This component
will render nothing if it is not available, and you will get a warning in
development mode (`__DEV__ === true`).

The properties of this component extend from `View`; however, you should not
attempt to set `backgroundColor` or `borderRadius` with the `style` property.
This will not work and is against the App Store Guidelines. Instead, you
should use the `buttonStyle` property to choose one of the predefined color
styles and the `cornerRadius` property to change the border radius of the
button.

Make sure to attach height and width via the style props as without these
styles, the button will not appear on the screen.

> See: [Apple
> Documentation](https://developer.apple.com/documentation/authenticationservices/asauthorizationappleidbutton)
> for more details.

AppleAuthenticationButtonProps

### `buttonStyle`

iOS

tvOS

Type: `AppleAuthenticationButtonStyle`

The Apple-defined color scheme to use to display the button.

### `buttonType`

iOS

tvOS

Type: `AppleAuthenticationButtonType`

The type of button text to display ("Sign In with Apple" vs. "Continue with
Apple").

### `cornerRadius`

iOS

tvOS

Optional • Type: `number`

The border radius to use when rendering the button. This works similarly to
`style.borderRadius` in other Views.

### `onPress`

iOS

tvOS

Type: `() => void`

The method to call when the user presses the button. You should call
`AppleAuthentication.signInAsync` in here.

### `style`

iOS

tvOS

Optional • Type: `StyleProp<[Omit](https://www.typescriptlang.org/docs/handbook/utility-types.html#omittype-keys)<[ViewStyle](https://reactnative.dev/docs/view-style-props), 'backgroundColor' | 'borderRadius'>>`

The custom style to apply to the button. Should not include `backgroundColor`
or `borderRadius` properties.

#### Inherited Props

  * `[ViewProps](https://reactnative.dev/docs/view#props)`

## Methods

### `AppleAuthentication.formatFullName(fullName, formatStyle)`

iOS

tvOS

Parameter| Type| Description  
---|---|---  
fullName| `AppleAuthenticationFullName`| The full name object with the
tokenized portions  
formatStyle(optional)| `AppleAuthenticationFullNameFormatStyle`| The style in
which the name should be formatted  
  
  

Creates a locale-aware string representation of a person's name from an object
representing the tokenized portions of a user's full name

Returns:

`string`

A locale-aware string representation of a person's name

### `AppleAuthentication.getCredentialStateAsync(user)`

iOS

tvOS

Parameter| Type| Description  
---|---|---  
user| `string`| The unique identifier for the user whose credential state
you'd like to check. This should come from the user field of an
`AppleAuthenticationCredential` object.  
  
  

Queries the current state of a user credential, to determine if it is still
valid or if it has been revoked.

> Note: This method must be tested on a real device. On the iOS simulator it
> always throws an error.

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<AppleAuthenticationCredentialState>`

A promise that fulfills with an `AppleAuthenticationCredentialState` value
depending on the state of the credential.

### `AppleAuthentication.isAvailableAsync()`

iOS

tvOS

Determine if the current device's operating system supports Apple
authentication.

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<boolean>`

A promise that fulfills with `true` if the system supports Apple
authentication, and `false` otherwise.

### `AppleAuthentication.refreshAsync(options)`

iOS

tvOS

Parameter| Type| Description  
---|---|---  
options| `AppleAuthenticationRefreshOptions`| An
`AppleAuthenticationRefreshOptions` object  
  
  

An operation that refreshes the logged-in user’s credentials. Calling this
method will show the sign in modal before actually refreshing the user
credentials.

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<AppleAuthenticationCredential>`

A promise that fulfills with an `AppleAuthenticationCredential` object after a
successful authentication, and rejects with `ERR_REQUEST_CANCELED` if the user
cancels the refresh operation.

### `AppleAuthentication.signInAsync(options)`

iOS

tvOS

Parameter| Type| Description  
---|---|---  
options(optional)| `AppleAuthenticationSignInOptions`| An optional
`AppleAuthenticationSignInOptions` object  
  
  

Sends a request to the operating system to initiate the Apple authentication
flow, which will present a modal to the user over your app and allow them to
sign in.

You can request access to the user's full name and email address in this
method, which allows you to personalize your UI for signed in users. However,
users can deny access to either or both of these options at runtime.

Additionally, you will only receive Apple Authentication Credentials the first
time users sign into your app, so you must store it for later use. It's best
to store this information either server-side, or using
[SecureStore](/versions/latest/sdk/securestore), so that the data persists
across app installs. You can use `AppleAuthenticationCredential.user` to
identify the user, since this remains the same for apps released by the same
developer.

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<AppleAuthenticationCredential>`

A promise that fulfills with an `AppleAuthenticationCredential` object after a
successful authentication, and rejects with `ERR_REQUEST_CANCELED` if the user
cancels the sign-in operation.

### `AppleAuthentication.signOutAsync(options)`

iOS

tvOS

Parameter| Type| Description  
---|---|---  
options| `AppleAuthenticationSignOutOptions`| An
`AppleAuthenticationSignOutOptions` object  
  
  

An operation that ends the authenticated session. Calling this method will
show the sign in modal before actually signing the user out.

It is not recommended to use this method to sign out the user as it works
counterintuitively. Instead of using this method it is recommended to simply
clear all the user's data collected from using `signInAsync` or `refreshAsync`
methods.

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<AppleAuthenticationCredential>`

A promise that fulfills with an `AppleAuthenticationCredential` object after a
successful authentication, and rejects with `ERR_REQUEST_CANCELED` if the user
cancels the sign-out operation.

## Event Subscriptions

### `AppleAuthentication.addRevokeListener(listener)`

iOS

tvOS

Parameter| Type  
---|---  
listener| `() => void`  
  
  

Returns:

`EventSubscription`

## Interfaces

### `Subscription`

iOS

tvOS

A subscription object that allows to conveniently remove an event listener
from the emitter.

Subscription Methods

### `remove()`

iOS

tvOS

Removes an event listener for which the subscription has been created. After
calling this function, the listener will no longer receive any events from the
emitter.

Returns:

`void`

## Types

### `AppleAuthenticationCredential`

iOS

tvOS

The object type returned from a successful call to
`AppleAuthentication.signInAsync()`, `AppleAuthentication.refreshAsync()`, or
`AppleAuthentication.signOutAsync()` which contains all of the pertinent user
and credential information.

> See: [Apple
> Documentation](https://developer.apple.com/documentation/authenticationservices/asauthorizationappleidcredential)
> for more details.

Property| Type| Description  
---|---|---  
authorizationCode| `string | null`| A short-lived session token used by your app for proof of authorization when interacting with the app's server counterpart. Unlike `user`, this is ephemeral and will change each session.  
email| `string | null`| The user's email address. Might not be present if you didn't request the `EMAIL` scope. May also be null if this is not the first time the user has signed into your app. If the user chose to withhold their email address, this field will instead contain an obscured email address with an Apple domain.  
fullName| `AppleAuthenticationFullName | null`| The user's name. May be `null` or contain `null` values if you didn't request the `FULL_NAME` scope, if the user denied access, or if this is not the first time the user has signed into your app.  
identityToken| `string | null`| A JSON Web Token (JWT) that securely communicates information about the user to your app.  
realUserStatus| `AppleAuthenticationUserDetectionStatus`| A value that
indicates whether the user appears to the system to be a real person.  
state| `string | null`| An arbitrary string that your app provided as `state` in the request that generated the credential. Used to verify that the response was from the request you made. Can be used to avoid replay attacks. If you did not provide `state` when making the sign-in request, this field will be `null`.  
user| `string`| An identifier associated with the authenticated user. You can
use this to check if the user is still authenticated later. This is stable and
can be shared across apps released under the same development team. The same
user will have a different identifier for apps released by other developers.  
  
### `AppleAuthenticationFullName`

iOS

tvOS

An object representing the tokenized portions of the user's full name. Any of
all of the fields may be `null`. Only applicable fields that the user has
allowed your app to access will be nonnull.

Property| Type| Description  
---|---|---  
familyName| `string | null`| -  
givenName| `string | null`| -  
middleName| `string | null`| -  
namePrefix| `string | null`| -  
nameSuffix| `string | null`| -  
nickname| `string | null`| -  
  
### `AppleAuthenticationFullNameFormatStyle`

iOS

tvOS

Literal Type: `string`

A value to specify the style for formatting a name.

> See: [Apple
> Documentation](https://developer.apple.com/documentation/foundation/personnamecomponentsformatter)
> for more details.

Acceptable values are: `'default'` | `'short'` | `'medium'` | `'long'` | `'abbreviated'`

### `AppleAuthenticationRefreshOptions`

iOS

tvOS

The options you can supply when making a call to
`AppleAuthentication.refreshAsync()`. You must include the ID string of the
user whose credentials you'd like to refresh.

> See: [Apple
> Documentation](https://developer.apple.com/documentation/authenticationservices/asauthorizationopenidrequest)
> for more details.

Property| Type| Description  
---|---|---  
requestedScopes(optional)| `AppleAuthenticationScope[]`| Array of user
information scopes to which your app is requesting access. Note that the user
can choose to deny your app access to any scope at the time of logging in. You
will still need to handle `null` values for any scopes you request.
Additionally, note that the requested scopes will only be provided to you the
first time each user signs into your app; in subsequent requests they will be
`null`. Defaults to `[]` (no scopes).  
state(optional)| `string`| An arbitrary string that is returned unmodified in
the corresponding credential after a successful authentication. This can be
used to verify that the response was from the request you made and avoid
replay attacks. More information on this property is available in the OAuth
2.0 protocol [RFC6749](https://tools.ietf.org/html/rfc6749#section-10.12).  
user| `string`| -  
  
### `AppleAuthenticationSignInOptions`

iOS

tvOS

The options you can supply when making a call to
`AppleAuthentication.signInAsync()`. None of these options are required.

> See: [Apple
> Documentation](https://developer.apple.com/documentation/authenticationservices/asauthorizationopenidrequest)
> for more details.

Property| Type| Description  
---|---|---  
nonce(optional)| `string`| An arbitrary string that is used to prevent replay
attacks. See more information on this in the [OpenID Connect
specification](https://openid.net/specs/openid-connect-
core-1_0.html#CodeFlowSteps).  
requestedScopes(optional)| `AppleAuthenticationScope[]`| Array of user
information scopes to which your app is requesting access. Note that the user
can choose to deny your app access to any scope at the time of logging in. You
will still need to handle `null` values for any scopes you request.
Additionally, note that the requested scopes will only be provided to you the
first time each user signs into your app; in subsequent requests they will be
`null`. Defaults to `[]` (no scopes).  
state(optional)| `string`| An arbitrary string that is returned unmodified in
the corresponding credential after a successful authentication. This can be
used to verify that the response was from the request you made and avoid
replay attacks. More information on this property is available in the OAuth
2.0 protocol [RFC6749](https://tools.ietf.org/html/rfc6749#section-10.12).  
  
### `AppleAuthenticationSignOutOptions`

iOS

tvOS

The options you can supply when making a call to
`AppleAuthentication.signOutAsync()`. You must include the ID string of the
user to sign out.

> See: [Apple
> Documentation](https://developer.apple.com/documentation/authenticationservices/asauthorizationopenidrequest)
> for more details.

Property| Type| Description  
---|---|---  
state(optional)| `string`| An arbitrary string that is returned unmodified in
the corresponding credential after a successful authentication. This can be
used to verify that the response was from the request you made and avoid
replay attacks. More information on this property is available in the OAuth
2.0 protocol [RFC6749](https://tools.ietf.org/html/rfc6749#section-10.12).  
user| `string`| -  
  
## Enums

### `AppleAuthenticationButtonStyle`

iOS

tvOS

An enum whose values control which pre-defined color scheme to use when
rendering an `AppleAuthenticationButton`.

#### `WHITE`

`AppleAuthenticationButtonStyle.WHITE ＝ 0`

White button with black text.

#### `WHITE_OUTLINE`

`AppleAuthenticationButtonStyle.WHITE_OUTLINE ＝ 1`

White button with a black outline and black text.

#### `BLACK`

`AppleAuthenticationButtonStyle.BLACK ＝ 2`

Black button with white text.

### `AppleAuthenticationButtonType`

iOS

tvOS

An enum whose values control which pre-defined text to use when rendering an
`AppleAuthenticationButton`.

#### `SIGN_IN`

`AppleAuthenticationButtonType.SIGN_IN ＝ 0`

"Sign in with Apple"

#### `CONTINUE`

`AppleAuthenticationButtonType.CONTINUE ＝ 1`

"Continue with Apple"

#### `SIGN_UP`

iOS 13.2+

`AppleAuthenticationButtonType.SIGN_UP ＝ 2`

"Sign up with Apple"

### `AppleAuthenticationCredentialState`

iOS

tvOS

An enum whose values specify state of the credential when checked with
`AppleAuthentication.getCredentialStateAsync()`.

> See: [Apple
> Documentation](https://developer.apple.com/documentation/authenticationservices/asauthorizationappleidprovidercredentialstate)
> for more details.

#### `REVOKED`

`AppleAuthenticationCredentialState.REVOKED ＝ 0`

#### `AUTHORIZED`

`AppleAuthenticationCredentialState.AUTHORIZED ＝ 1`

#### `NOT_FOUND`

`AppleAuthenticationCredentialState.NOT_FOUND ＝ 2`

#### `TRANSFERRED`

`AppleAuthenticationCredentialState.TRANSFERRED ＝ 3`

### `AppleAuthenticationOperation`

iOS

tvOS

#### `IMPLICIT`

`AppleAuthenticationOperation.IMPLICIT ＝ 0`

An operation that depends on the particular kind of credential provider.

#### `LOGIN`

`AppleAuthenticationOperation.LOGIN ＝ 1`

#### `REFRESH`

`AppleAuthenticationOperation.REFRESH ＝ 2`

#### `LOGOUT`

`AppleAuthenticationOperation.LOGOUT ＝ 3`

### `AppleAuthenticationScope`

iOS

tvOS

An enum whose values specify scopes you can request when calling
`AppleAuthentication.signInAsync()`.

> Note that it is possible that you will not be granted all of the scopes
> which you request. You will still need to handle null values for any fields
> you request.

> See: [Apple
> Documentation](https://developer.apple.com/documentation/authenticationservices/asauthorizationscope)
> for more details.

#### `FULL_NAME`

`AppleAuthenticationScope.FULL_NAME ＝ 0`

#### `EMAIL`

`AppleAuthenticationScope.EMAIL ＝ 1`

### `AppleAuthenticationUserDetectionStatus`

iOS

tvOS

An enum whose values specify the system's best guess for how likely the
current user is a real person.

> See: [Apple
> Documentation](https://developer.apple.com/documentation/authenticationservices/asuserdetectionstatus)
> for more details.

#### `UNSUPPORTED`

`AppleAuthenticationUserDetectionStatus.UNSUPPORTED ＝ 0`

The system does not support this determination and there is no data.

#### `UNKNOWN`

`AppleAuthenticationUserDetectionStatus.UNKNOWN ＝ 1`

The system has not determined whether the user might be a real person.

#### `LIKELY_REAL`

`AppleAuthenticationUserDetectionStatus.LIKELY_REAL ＝ 2`

The user appears to be a real person.

## Error codes

Most of the error codes match the official [Apple Authorization
errors](https://developer.apple.com/documentation/authenticationservices/asauthorizationerror/code).

Code| Description  
---|---  
ERR_INVALID_OPERATION| An invalid authorization operation has been performed.  
ERR_INVALID_RESPONSE| The authorization request received an invalid response.  
ERR_INVALID_SCOPE| An invalid
[`AppleAuthenticationScope`](/versions/latest/sdk/apple-
authentication#appleauthenticationscope) was passed in.  
ERR_REQUEST_CANCELED| The user canceled the authorization attempt.  
ERR_REQUEST_FAILED| The authorization attempt failed. See the error message
for additional information.  
ERR_REQUEST_NOT_HANDLED| The authorization request wasn't correctly handled.  
ERR_REQUEST_NOT_INTERACTIVE| The authorization request isn't interactive.  
ERR_REQUEST_UNKNOWN| The authorization attempt failed for an unknown reason.

