# Expo Linking

[GitHub](https://github.com/expo/expo/tree/sdk-54/packages/expo-
linking)[Changelog](https://github.com/expo/expo/tree/sdk-54/packages/expo-
linking/CHANGELOG.md)[npm](https://www.npmjs.com/package/expo-linking)

Ask AI

An API that provides methods to create and open deep links universally.

[GitHub](https://github.com/expo/expo/tree/sdk-54/packages/expo-
linking)[Changelog](https://github.com/expo/expo/tree/sdk-54/packages/expo-
linking/CHANGELOG.md)[npm](https://www.npmjs.com/package/expo-linking)

Ask AI

Android

iOS

tvOS

Web

Bundled version:

~8.0.8

Copy

* * *

`expo-linking` provides utilities for your app to interact with other
installed apps using deep links. It also provides helper methods for
constructing and parsing deep links into your app. This library is an
extension of the React Native
[`Linking`](https://reactnative.dev/docs/linking).

For a more comprehensive explanation of how to use `expo-linking`, refer to
the [Linking into other apps](/linking/into-other-apps).

## Installation

Terminal

Copy

`- ``npx expo install expo-linking`

If you are installing this in an [existing React Native app](/bare/overview),
make sure to [install `expo`](/bare/installing-expo-modules) in your project.

## API

    
    
    import * as Linking from 'expo-linking';
    

## Hooks

### `useLinkingURL()`

Android

iOS

tvOS

Web

Returns the linking URL followed by any subsequent changes to the URL. Always
returns the initial URL immediately on reload.

Returns:

`string | null`

Returns the initial URL or `null`.

> Deprecated Use `useLinkingURL` hook instead.

### `useURL()`

Android

iOS

tvOS

Web

Returns the initial URL followed by any subsequent changes to the URL.

Returns:

`string | null`

Returns the initial URL or `null`.

## Methods

### `Linking.canOpenURL(url)`

Android

iOS

tvOS

Web

Parameter| Type| Description  
---|---|---  
url| `string`| The URL that you want to test can be opened.  
  
  

Determine whether or not an installed app can handle a given URL. On web this
always returns `true` because there is no API for detecting what URLs can be
opened.

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<boolean>`

A `Promise` object that is fulfilled with `true` if the URL can be handled,
otherwise it `false` if not. The `Promise` will reject on Android if it was
impossible to check if the URL can be opened, and on iOS if you didn't [add
the specific scheme in the `LSApplicationQueriesSchemes` key inside
Info.plist](/guides/linking#linking-from-your-app).

### `Linking.collectManifestSchemes()`

Android

iOS

tvOS

Web

Collect a list of platform schemes from the manifest.

This method is based on the `Scheme` modules from `@expo/config-plugins` which
are used for collecting the schemes before prebuilding a native app.

  * Android: `scheme` -> `android.scheme` -> `android.package`
  * iOS: `scheme` -> `ios.scheme` -> `ios.bundleIdentifier`

Returns:

`string[]`

### `Linking.createURL(path, namedParameters)`

Android

iOS

tvOS

Web

Parameter| Type| Description  
---|---|---  
path| `string`| Addition path components to append to the base URL.  
namedParameters(optional)|
`[CreateURLOptions](/versions/latest/sdk/linking#createurloptions)`|
Additional options object.Default:`{}`  
  
  

Helper method for constructing a deep link into your app, given an optional
path and set of query parameters. Creates a URI scheme with two slashes by
default.

The scheme must be defined in the [app config](/versions/latest/config/app)
under `expo.scheme` or `expo.{android,ios}.scheme`. Platform-specific schemes
defined under `expo.{android,ios}.scheme` take precedence over universal
schemes defined under `expo.scheme`.

#### Examples

  * Development and production builds: `<scheme>://path` \- uses the optional `scheme` property if provided, and otherwise uses the first scheme defined by your app config
  * Web (dev): `https://localhost:19006/path`
  * Web (prod): `https://myapp.com/path`
  * Expo Go (dev): `exp://128.0.0.1:8081/--/path`

The behavior of this method in Expo Go for published updates is undefined and
should not be relied upon. The created URL in this case is neither stable nor
predictable during the lifetime of the app. If a stable URL is needed, for
example in authorization callbacks, a build (or development build) of your
application should be used and the scheme provided.

Returns:

`string`

A URL string which points to your app with the given deep link information.

### `Linking.getInitialURL()`

Android

iOS

tvOS

Web

Get the URL that was used to launch the app if it was launched by a link.

Returns:

`[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<string | null>`

The URL string that launched your app, or `null`.

### `Linking.getLinkingURL()`

Android

iOS

tvOS

Web

Get the URL that was used to launch the app if it was launched by a link.

Returns:

`string | null`

The URL string that launched your app, or `null`.

### `Linking.hasConstantsManifest()`

Android

iOS

tvOS

Web

Ensure the user has linked the expo-constants manifest in bare workflow.

Returns:

`boolean`

### `Linking.hasCustomScheme()`

Android

iOS

tvOS

Web

Returns:

`boolean`

### `Linking.openSettings()`

Android

iOS

tvOS

Web

Open the operating system settings app and displays the app’s custom settings,
if it has any.

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<void>`

### `Linking.openURL(url)`

Android

iOS

tvOS

Web

Parameter| Type| Description  
---|---|---  
url| `string`| A URL for the operating system to open. For example:
`tel:5555555`, `exp://`.  
  
  

Attempt to open the given URL with an installed app. See the [Linking
guide](/guides/linking) for more information.

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<true>`

A `Promise` that is fulfilled with `true` if the link is opened operating
system automatically or the user confirms the prompt to open the link. The
`Promise` rejects if there are no applications registered for the URL or the
user cancels the dialog.

### `Linking.parse(url)`

Android

iOS

tvOS

Web

Parameter| Type| Description  
---|---|---  
url| `string`| A URL that points to the currently running experience (for
example, an output of `Linking.createURL()`).  
  
  

Helper method for parsing out deep link information from a URL.

Returns:

`ParsedURL`

A `ParsedURL` object.

### `Linking.parseInitialURLAsync()`

Android

iOS

tvOS

Web

Helper method which wraps React Native's `Linking.getInitialURL()` in
`Linking.parse()`. Parses the deep link information out of the URL used to
open the experience initially. If no link opened the app, all the fields will
be `null`.

> On the web it parses the current window URL.

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<ParsedURL>`

A promise that resolves with `ParsedURL` object.

### `Linking.resolveScheme(options)`

Android

iOS

tvOS

Web

Parameter| Type  
---|---  
options| `{  isSilent: boolean,  scheme: string }`  
  
  

Returns:

`string`

### `Linking.sendIntent(action, extras)`

Android

Parameter| Type  
---|---  
action| `string`  
extras(optional)| `SendIntentExtras[]`  
  
  

Launch an Android intent with extras.

> Use [`expo-intent-launcher`](/versions/latest/sdk/intent-launcher) instead.
> `sendIntent` is only included in `Linking` for API compatibility with React
> Native's Linking API.

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<void>`

## Event Subscriptions

### `Linking.addEventListener(type, handler)`

Android

iOS

tvOS

Web

Parameter| Type| Description  
---|---|---  
type| `'url'`| The only valid type is `'url'`.  
handler| `[URLListener](/versions/latest/sdk/linking#urllistenerevent)`| An
`URLListener` function that takes an `event` object of the type `EventType`.  
  
  

Add a handler to `Linking` changes by listening to the `url` event type and
providing the handler. It is recommended to use the `useURL()` hook instead.

Returns:

`EmitterSubscription`

An EmitterSubscription that has the remove method from EventSubscription

> See: [React Native documentation on
> Linking](https://reactnative.dev/docs/linking#addeventlistener).

## Types

### `CreateURLOptions`

Android

iOS

tvOS

Web

Property| Type| Description  
---|---|---  
isTripleSlashed(optional)| `boolean`| Should the URI be triple slashed
`scheme:///path` or double slashed `scheme://path`.  
queryParams(optional)| `QueryParams`| An object of parameters that will be
converted into a query string.  
scheme(optional)| `string`| URI protocol `<scheme>://` that must be built into
your native app.  
  
### `EventType`

Android

iOS

tvOS

Web

Property| Type| Description  
---|---|---  
nativeEvent(optional)| `[MessageEvent](https://developer.mozilla.org/en-
US/docs/Web/API/MessageEvent)`| -  
url| `string`| -  
  
### `NativeURLListener(nativeEvent)`

Android

iOS

tvOS

Web

Parameter| Type  
---|---  
nativeEvent| `[MessageEvent](https://developer.mozilla.org/en-
US/docs/Web/API/MessageEvent)`  
  
Returns:

`void`

### `ParsedURL`

Android

iOS

tvOS

Web

Property| Type| Description  
---|---|---  
hostname| `string | null`| -  
path| `string | null`| The path into the app specified by the URL.  
queryParams| `QueryParams | null`| The set of query parameters specified by the query string of the url used to open the app.  
scheme| `string | null`| -  
  
### `QueryParams`

Android

iOS

tvOS

Web

Type: `Record<string, undefined | string | string[]>`

### `SendIntentExtras`

Android

iOS

tvOS

Web

Property| Type| Description  
---|---|---  
key| `string`| -  
value| `string | number | boolean`| -  
  
### `URLListener(event)`

Android

iOS

tvOS

Web

Parameter| Type  
---|---  
event| `EventType`  
  
Returns:

`void`

