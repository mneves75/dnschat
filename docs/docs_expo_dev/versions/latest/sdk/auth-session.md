# Expo AuthSession

[GitHub](https://github.com/expo/expo/tree/sdk-54/packages/expo-auth-
session)[Changelog](https://github.com/expo/expo/tree/sdk-54/packages/expo-
auth-session/CHANGELOG.md)[npm](https://www.npmjs.com/package/expo-auth-
session)

Ask AI

A universal library that provides an API to handle browser-based
authentication.

[GitHub](https://github.com/expo/expo/tree/sdk-54/packages/expo-auth-
session)[Changelog](https://github.com/expo/expo/tree/sdk-54/packages/expo-
auth-session/CHANGELOG.md)[npm](https://www.npmjs.com/package/expo-auth-
session)

Ask AI

Android

iOS

Web

Bundled version:

~7.0.8

Copy

* * *

`AuthSession` enables web browser-based authentication (for example, browser-
based OAuth flows) in your app by utilizing
[WebBrowser](/versions/latest/sdk/webbrowser) and
[Crypto](/versions/latest/sdk/crypto). For implementation details, refer to
this reference, and for usage, see the
[Authentication](/guides/authentication) guide.

> Note: `AuthSession` enables general-purpose OAuth and OpenID Connect
> browser-based auth workflows. Where available, we recommend using a library
> supplied by your identity provider, as it will handle implementation details
> specific to that provider. For example, use [`@react-native-google-
> signin/google-signin`](/guides/google-authentication) for Google
> authentication and [`react-native-fbsdk-next`](/guides/facebook-
> authentication) for Facebook. For more information, see
> [Authentication](/develop/authentication) overview.

## Installation

> `expo-crypto` is a peer dependency and must be installed alongside `expo-
> auth-session`.

Terminal

Copy

`- ``npx expo install expo-auth-session expo-crypto`

If you are installing this in an [existing React Native app](/bare/overview),
make sure to [install `expo`](/bare/installing-expo-modules) in your project.

## Configuration

Are you using this library in an existing React Native app?

To use this library, you need to set up deep linking in your app by setting up
a `scheme`. Use the [`uri-scheme` CLI](https://www.npmjs.com/package/uri-
scheme) utility to easily add, remove, list, and open your URIs.

For example, to make your native app handle `mycoolredirect://`, run:

Terminal

Copy

`- ``npx uri-scheme add mycoolredirect`

You should now be able to see a list of all your project's schemes by running:

Terminal

Copy

`- ``npx uri-scheme list`

You can test it to ensure it works like this:

Terminal

`# Rebuild the native apps, be sure to use an emulator`

`- ``yarn android`

`- ``yarn ios`

  
`# Open a URI scheme`

`- ``npx uri-scheme open mycoolredirect://some/redirect`

### Usage in standalone apps

app.json

Copy

    
    
    {
      "expo": {
        "scheme": "mycoolredirect"
      }
    }
    

To be able to deep link back into your app, you will need to set a `scheme` in
your project's app config, and then build your standalone app (it can't be
updated with an update). If you do not include a scheme, the authentication
flow will complete, but it will be unable to pass the information back into
your application and the user will have to manually exit the authentication
modal (resulting in a canceled event).

## Guides

> The guides have moved: [Authentication Guide](/guides/authentication).

## How web browser based authentication flows work

The typical flow for browser-based authentication in mobile apps is as
follows:

  * Initiation: the user presses a sign in button
  * Open web browser: the app opens up a web browser to the authentication provider sign in page. The url that is opened for the sign in page usually includes information to identify the app, and a URL to redirect to on success. _Note: the web browser should share cookies with your system web browser so that users do not need to sign in again if they are already authenticated on the system browser -- Expo's[WebBrowser](/versions/latest/sdk/webbrowser) API takes care of this._
  * Authentication provider redirects: upon successful authentication, the authentication provider should redirect back to the application by redirecting to URL provided by the app in the query parameters on the sign in page ([read more about how linking works in mobile apps](/linking/overview)), _provided that the URL is in the allowlist of allowed redirect URLs_. Allowlisting redirect URLs is important to prevent malicious actors from pretending to be your application. The redirect includes data in the URL (such as user id and token), either in the location hash, query parameters, or both.
  * App handles redirect: the redirect is handled by the app and data is parsed from the redirect URL.

## Security considerations

  * Never put any secret keys inside your application code, there is no secure way to do this! Instead, you should store your secret key(s) on a server and expose an endpoint that makes API calls for your client and passes the data back.

## API

    
    
    import * as AuthSession from 'expo-auth-session';
    

## Hooks

### `useAuthRequest(config, discovery)`

Android

iOS

Web

Parameter| Type| Description  
---|---|---  
config| `AuthRequestConfig`| A valid `AuthRequestConfig` that specifies what
provider to use.  
discovery| `null | DiscoveryDocument`| A loaded `DiscoveryDocument` with endpoints used for authenticating. Only `authorizationEndpoint` is required for requesting an authorization code.  
  
  

Load an authorization request for a code. When the prompt method completes
then the response will be fulfilled.

> In order to close the popup window on web, you need to invoke
> `WebBrowser.maybeCompleteAuthSession()`. See the [GitHub
> example](/guides/authentication#github) for more info.

If an Implicit grant flow was used, you can pass the `response.params` to
`TokenResponse.fromQueryParams()` to get a `TokenResponse` instance which you
can use to easily refresh the token.

Returns:

`[AuthRequest | null, AuthSessionResult | null, (options: AuthRequestPromptOptions) => [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<AuthSessionResult>]`

Returns a loaded request, a response, and a prompt method in a single array in
the following order:

  * `request` \- An instance of `AuthRequest` that can be used to prompt the user for authorization. This will be `null` until the auth request has finished loading.
  * `response` \- This is `null` until `promptAsync` has been invoked. Once fulfilled it will return information about the authorization.
  * `promptAsync` \- When invoked, a web browser will open up and prompt the user for authentication. Accepts an `AuthRequestPromptOptions` object with options about how the prompt will execute.

Example

    
    
    const [request, response, promptAsync] = useAuthRequest({ ... }, { ... });
    

### `useAuthRequestResult(request, discovery, customOptions)`

Android

iOS

Web

Parameter| Type  
---|---  
request| `null | AuthRequest`  
discovery| `null | DiscoveryDocument`  
customOptions(optional)| `AuthRequestPromptOptions`  
  
  

Returns:

`[AuthSessionResult | null, [PromptMethod](/versions/latest/sdk/auth-session#promptmethodoptions)]`

### `useAutoDiscovery(issuerOrDiscovery)`

Android

iOS

Web

Parameter| Type| Description  
---|---|---  
issuerOrDiscovery| `IssuerOrDiscovery`| URL using the `https` scheme with no
query or fragment component that the OP asserts as its Issuer Identifier.  
  
  

Given an OpenID Connect issuer URL, this will fetch and return the
`DiscoveryDocument` (a collection of URLs) from the resource provider.

Returns:

`DiscoveryDocument | null`

Returns `null` until the `DiscoveryDocument` has been fetched from the
provided issuer URL.

Example

    
    
    const discovery = useAutoDiscovery('https://example.com/auth');
    

### `useLoadedAuthRequest(config, discovery, AuthRequestInstance)`

Android

iOS

Web

Parameter| Type  
---|---  
config| `AuthRequestConfig`  
discovery| `null | DiscoveryDocument`  
AuthRequestInstance| `AuthRequest`  
  
  

Returns:

`AuthRequest | null`

## Classes

### `AccessTokenRequest`

Android

iOS

Web

Type: Class extends `TokenRequest<AccessTokenRequestConfig>` implements
`AccessTokenRequestConfig`

Access token request. Exchange an authorization code for a user access token.

[Section 4.1.3](https://tools.ietf.org/html/rfc6749#section-4.1.3)

AccessTokenRequest Properties

### `grantType`

Android

iOS

Web

Type: `GrantType`

AccessTokenRequest Methods

### `getHeaders()`

Android

iOS

Web

Returns:

`Headers`

### `getQueryBody()`

Android

iOS

Web

Returns:

`Record<string, string>`

### `getRequestConfig()`

Android

iOS

Web

Returns:

`{  clientId: string,  clientSecret: undefined | string,  code: string,  extraParams: undefined | Record<string, string>,  grantType: GrantType,  redirectUri: string,  scopes: undefined | string[] }`

### `performAsync(discovery)`

Android

iOS

Web

Parameter| Type  
---|---  
discovery| `[Pick](https://www.typescriptlang.org/docs/handbook/utility-
types.html#picktype-keys)<DiscoveryDocument, 'tokenEndpoint'>`  
  
  

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<TokenResponse>`

### `AuthError`

Android

iOS

Web

Type: Class extends `ResponseError`

Represents an authorization response error: [Section
5.2](https://tools.ietf.org/html/rfc6749#section-5.2). Often times providers
will fail to return the proper error message for a given error code. This
error method will add the missing description for more context on what went
wrong.

AuthError Properties

### `code`

Android

iOS

Web

Type: `string`

### `description`

Android

iOS

Web

Optional • Type: `string`

Used to assist the client developer in understanding the error that occurred.

### `info`

Android

iOS

Web

Optional • Type: `any`

### `params`

Android

iOS

Web

Type: `Record<string, string>`

Raw results of the error.

### `state`

Android

iOS

Web

Optional • Type: `string`

Required only if state is used in the initial request

### `uri`

Android

iOS

Web

Optional • Type: `string`

A URI identifying a human-readable web page with information about the error,
used to provide the client developer with additional information about the
error.

### `AuthRequest`

Android

iOS

Web

Type: Class implements
`[Omit](https://www.typescriptlang.org/docs/handbook/utility-
types.html#omittype-keys)<AuthRequestConfig, 'state'>`

Used to manage an authorization request according to the OAuth spec: [Section
4.1.1](https://tools.ietf.org/html/rfc6749#section-4.1.1). You can use this
class directly for more info around the authorization.

Common use-cases:

  * Parse a URL returned from the authorization server with `parseReturnUrlAsync()`.
  * Get the built authorization URL with `makeAuthUrlAsync()`.
  * Get a loaded JSON representation of the auth request with crypto state loaded with `getAuthRequestConfigAsync()`.

Example

    
    
    // Create a request.
    const request = new AuthRequest({ ... });
    
    // Prompt for an auth code
    const result = await request.promptAsync(discovery);
    
    // Get the URL to invoke
    const url = await request.makeAuthUrlAsync(discovery);
    
    // Get the URL to invoke
    const parsed = await request.parseReturnUrlAsync("<URL From Server>");
    

AuthRequest Properties

### `codeVerifier`

Android

iOS

Web

Optional • Type: `string`

### `state`

Android

iOS

Web

Type: `string`

Used for protection against [Cross-Site Request
Forgery](https://tools.ietf.org/html/rfc6749#section-10.12).

### `url`

Android

iOS

Web

Literal type: `union` • Default: `null`

Acceptable values are: `null` | `string`

AuthRequest Methods

### `getAuthRequestConfigAsync()`

Android

iOS

Web

Load and return a valid auth request based on the input config.

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<AuthRequestConfig>`

### `makeAuthUrlAsync(discovery)`

Android

iOS

Web

Parameter| Type  
---|---  
discovery| `AuthDiscoveryDocument`  
  
  

Create the URL for authorization.

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<string>`

### `parseReturnUrl(url)`

Android

iOS

Web

Parameter| Type  
---|---  
url| `string`  
  
  

Returns:

`AuthSessionResult`

### `promptAsync(discovery, promptOptions)`

Android

iOS

Web

Parameter| Type  
---|---  
discovery| `AuthDiscoveryDocument`  
promptOptions(optional)| `AuthRequestPromptOptions`  
  
  

Prompt a user to authorize for a code.

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<AuthSessionResult>`

### `RefreshTokenRequest`

Android

iOS

Web

Type: Class extends `TokenRequest<RefreshTokenRequestConfig>` implements
`RefreshTokenRequestConfig`

Refresh request.

[Section 6](https://tools.ietf.org/html/rfc6749#section-6)

RefreshTokenRequest Properties

### `grantType`

Android

iOS

Web

Type: `GrantType`

RefreshTokenRequest Methods

### `getHeaders()`

Android

iOS

Web

Returns:

`Headers`

### `getQueryBody()`

Android

iOS

Web

Returns:

`Record<string, string>`

### `getRequestConfig()`

Android

iOS

Web

Returns:

`{  clientId: string,  clientSecret: undefined | string,  extraParams: undefined | Record<string, string>,  grantType: GrantType,  refreshToken: undefined | string,  scopes: undefined | string[] }`

### `performAsync(discovery)`

Android

iOS

Web

Parameter| Type  
---|---  
discovery| `[Pick](https://www.typescriptlang.org/docs/handbook/utility-
types.html#picktype-keys)<DiscoveryDocument, 'tokenEndpoint'>`  
  
  

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<TokenResponse>`

### `Request`

Android

iOS

Web

Request Methods

### `getQueryBody()`

Android

iOS

Web

Returns:

`Record<string, string>`

### `getRequestConfig()`

Android

iOS

Web

Returns:

`T`

### `performAsync(discovery)`

Android

iOS

Web

Parameter| Type  
---|---  
discovery| `DiscoveryDocument`  
  
  

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<B>`

### `ResponseError`

Android

iOS

Web

Type: Class extends `CodedError`

[Section 4.1.2.1](https://tools.ietf.org/html/rfc6749#section-4.1.2.1)

ResponseError Properties

### `code`

Android

iOS

Web

Type: `string`

### `description`

Android

iOS

Web

Optional • Type: `string`

Used to assist the client developer in understanding the error that occurred.

### `info`

Android

iOS

Web

Optional • Type: `any`

### `params`

Android

iOS

Web

Type: `Record<string, string>`

Raw results of the error.

### `uri`

Android

iOS

Web

Optional • Type: `string`

A URI identifying a human-readable web page with information about the error,
used to provide the client developer with additional information about the
error.

### `RevokeTokenRequest`

Android

iOS

Web

Type: Class extends `Request<RevokeTokenRequestConfig, boolean>` implements
`RevokeTokenRequestConfig`

Revocation request for a given token.

[Section 2.1](https://tools.ietf.org/html/rfc7009#section-2.1)

RevokeTokenRequest Methods

### `getHeaders()`

Android

iOS

Web

Returns:

`Headers`

### `getQueryBody()`

Android

iOS

Web

Returns:

`Record<string, string>`

### `getRequestConfig()`

Android

iOS

Web

Returns:

`{  clientId: undefined | string,  clientSecret: undefined | string,  token: string,  tokenTypeHint: undefined | TokenTypeHint }`

### `performAsync(discovery)`

Android

iOS

Web

Parameter| Type| Description  
---|---|---  
discovery| `[Pick](https://www.typescriptlang.org/docs/handbook/utility-
types.html#picktype-keys)<DiscoveryDocument, 'revocationEndpoint'>`| The
`revocationEndpoint` for a provider.  
  
  

Perform a token revocation request.

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<boolean>`

### `TokenError`

Android

iOS

Web

Type: Class extends `ResponseError`

[Section 4.1.2.1](https://tools.ietf.org/html/rfc6749#section-4.1.2.1)

TokenError Properties

### `code`

Android

iOS

Web

Type: `string`

### `description`

Android

iOS

Web

Optional • Type: `string`

Used to assist the client developer in understanding the error that occurred.

### `info`

Android

iOS

Web

Optional • Type: `any`

### `params`

Android

iOS

Web

Type: `Record<string, string>`

Raw results of the error.

### `uri`

Android

iOS

Web

Optional • Type: `string`

A URI identifying a human-readable web page with information about the error,
used to provide the client developer with additional information about the
error.

### `TokenRequest`

Android

iOS

Web

Type: Class extends `Request<T, TokenResponse>` implements
`TokenRequestConfig`

A generic token request.

TokenRequest Properties

### `grantType`

Android

iOS

Web

Type: `GrantType`

TokenRequest Methods

### `getHeaders()`

Android

iOS

Web

Returns:

`Headers`

### `getQueryBody()`

Android

iOS

Web

Returns:

`Record<string, string>`

### `getRequestConfig()`

Android

iOS

Web

Returns:

`T`

### `performAsync(discovery)`

Android

iOS

Web

Parameter| Type  
---|---  
discovery| `[Pick](https://www.typescriptlang.org/docs/handbook/utility-
types.html#picktype-keys)<DiscoveryDocument, 'tokenEndpoint'>`  
  
  

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<TokenResponse>`

### `TokenResponse`

Android

iOS

Web

Type: Class implements `TokenResponseConfig`

Token Response.

[Section 5.1](https://tools.ietf.org/html/rfc6749#section-5.1)

TokenResponse Properties

### `rawResponse`

Android

iOS

Web

Optional • Type: `unknown`

Contains the unprocessed token response. Use it to access properties which
aren't part of RFC 6749.

TokenResponse Methods

### `fromQueryParams(params)`

Android

iOS

Web

Parameter| Type  
---|---  
params| `Record<string, any>`  
  
  

Creates a `TokenResponse` from query parameters returned from an
`AuthRequest`.

Returns:

`TokenResponse`

### `getRequestConfig()`

Android

iOS

Web

Returns:

`TokenResponseConfig`

### `isTokenFresh(token, secondsMargin)`

Android

iOS

Web

Parameter| Type  
---|---  
token| `[Pick](https://www.typescriptlang.org/docs/handbook/utility-types.html#picktype-keys)<TokenResponse, 'expiresIn' | 'issuedAt'>`  
secondsMargin(optional)| `number`  
  
  

Determines whether a token refresh request must be made to refresh the tokens

Returns:

`boolean`

### `refreshAsync(config, discovery)`

Android

iOS

Web

Parameter| Type  
---|---  
config| `[Omit](https://www.typescriptlang.org/docs/handbook/utility-types.html#omittype-keys)<TokenRequestConfig, 'refreshToken' | 'grantType'>`  
discovery| `[Pick](https://www.typescriptlang.org/docs/handbook/utility-
types.html#picktype-keys)<DiscoveryDocument, 'tokenEndpoint'>`  
  
  

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<TokenResponse>`

### `shouldRefresh()`

Android

iOS

Web

Returns:

`boolean`

## Methods

### `AuthSession.dismiss()`

Android

iOS

Web

Cancels an active `AuthSession` if there is one.

Returns:

`void`

### `AuthSession.exchangeCodeAsync(config, discovery)`

Android

iOS

Web

Parameter| Type| Description  
---|---|---  
config| `AccessTokenRequestConfig`| Configuration used to exchange the code
for a token.  
discovery| `[Pick](https://www.typescriptlang.org/docs/handbook/utility-
types.html#picktype-keys)<DiscoveryDocument, 'tokenEndpoint'>`| The
`tokenEndpoint` for a provider.  
  
  

Exchange an authorization code for an access token that can be used to get
data from the provider.

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<TokenResponse>`

Returns a discovery document with a valid `tokenEndpoint` URL.

### `AuthSession.fetchDiscoveryAsync(issuer)`

Android

iOS

Web

Parameter| Type| Description  
---|---|---  
issuer| `string`| An `Issuer` URL to fetch from.  
  
  

Fetch a `DiscoveryDocument` from a well-known resource provider that supports
auto discovery.

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<DiscoveryDocument>`

Returns a discovery document that can be used for authentication.

### `AuthSession.fetchUserInfoAsync(config, discovery)`

Android

iOS

Web

Parameter| Type| Description  
---|---|---  
config| `[Pick](https://www.typescriptlang.org/docs/handbook/utility-
types.html#picktype-keys)<TokenResponse, 'accessToken'>`| The `accessToken`
for a user, returned from a code exchange or auth request.  
discovery| `[Pick](https://www.typescriptlang.org/docs/handbook/utility-
types.html#picktype-keys)<DiscoveryDocument, 'userInfoEndpoint'>`| The
`userInfoEndpoint` for a provider.  
  
  

Fetch generic user info from the provider's OpenID Connect `userInfoEndpoint`
(if supported).

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<Record<string, any>>`

> See: [UserInfo](https://openid.net/specs/openid-connect-
> core-1_0.html#UserInfo).

### `AuthSession.getCurrentTimeInSeconds()`

Android

iOS

Web

Returns the current time in seconds.

Returns:

`number`

### `AuthSession.getDefaultReturnUrl(urlPath, options)`

Android

iOS

Web

Parameter| Type  
---|---  
urlPath(optional)| `string`  
options(optional)|
`[Omit](https://www.typescriptlang.org/docs/handbook/utility-
types.html#omittype-
keys)<[CreateURLOptions](/versions/latest/sdk/linking#createurloptions),
'queryParams'>`  
  
  

Returns:

`string`

> Deprecated Use `makeRedirectUri()` instead.

### `AuthSession.getRedirectUrl(path)`

Android

iOS

Web

Parameter| Type  
---|---  
path(optional)| `string`  
  
  

Get the URL that your authentication provider needs to redirect to. For
example: `https://auth.expo.io/@your-username/your-app-slug`. You can pass an
additional path component to be appended to the default redirect URL.

> Note This method will throw an exception if you're using the bare workflow
> on native.

Returns:

`string`

Example

    
    
    const url = AuthSession.getRedirectUrl('redirect');
    
    // Managed: https://auth.expo.io/@your-username/your-app-slug/redirect
    // Web: https://localhost:19006/redirect
    

### `AuthSession.issuerWithWellKnownUrl(issuer)`

Android

iOS

Web

Parameter| Type  
---|---  
issuer| `string`  
  
  

Append the well known resources path and OpenID connect discovery document
path to a URL <https://tools.ietf.org/html/rfc5785>

Returns:

`string`

### `AuthSession.loadAsync(config, issuerOrDiscovery)`

Android

iOS

Web

Parameter| Type| Description  
---|---|---  
config| `AuthRequestConfig`| A valid `AuthRequestConfig` that specifies what
provider to use.  
issuerOrDiscovery| `IssuerOrDiscovery`| A loaded `DiscoveryDocument` or issuer
URL. (Only `authorizationEndpoint` is required for requesting an authorization
code).  
  
  

Build an `AuthRequest` and load it before returning.

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<AuthRequest>`

Returns an instance of `AuthRequest` that can be used to prompt the user for
authorization.

### `AuthSession.makeRedirectUri(options)`

Android

iOS

Web

Parameter| Type| Description  
---|---|---  
options(optional)| `AuthSessionRedirectUriOptions`| Additional options for
configuring the path.Default:`{}`  
  
  

Create a redirect url for the current platform and environment. You need to
manually define the redirect that will be used in a bare workflow React Native
app, or an Expo standalone app, this is because it cannot be inferred
automatically.

  * Web: Generates a path based on the current `window.location`. For production web apps, you should hard code the URL as well.
  * Managed workflow: Uses the `scheme` property of your app config.
  * Bare workflow: Will fallback to using the `native` option for bare workflow React Native apps.

Returns:

`string`

The `redirectUri` to use in an authentication request.

Example

    
    
    const redirectUri = makeRedirectUri({
      scheme: 'my-scheme',
      path: 'redirect'
    });
    // Development Build: my-scheme://redirect
    // Expo Go: exp://127.0.0.1:8081/--/redirect
    // Web dev: https://localhost:19006/redirect
    // Web prod: https://yourwebsite.com/redirect
    
    const redirectUri2 = makeRedirectUri({
      scheme: 'scheme2',
      preferLocalhost: true,
      isTripleSlashed: true,
    });
    // Development Build: scheme2:///
    // Expo Go: exp://localhost:8081
    // Web dev: https://localhost:19006
    // Web prod: https://yourwebsite.com
    

### `AuthSession.refreshAsync(config, discovery)`

Android

iOS

Web

Parameter| Type| Description  
---|---|---  
config| `RefreshTokenRequestConfig`| Configuration used to refresh the given
access token.  
discovery| `[Pick](https://www.typescriptlang.org/docs/handbook/utility-
types.html#picktype-keys)<DiscoveryDocument, 'tokenEndpoint'>`| The
`tokenEndpoint` for a provider.  
  
  

Refresh an access token.

  * If the provider didn't return a `refresh_token` then the access token may not be refreshed.
  * If the provider didn't return a `expires_in` then it's assumed that the token does not expire.
  * Determine if a token needs to be refreshed via `TokenResponse.isTokenFresh()` or `shouldRefresh()` on an instance of `TokenResponse`.

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<TokenResponse>`

Returns a discovery document with a valid `tokenEndpoint` URL.

> See: [Section 6](https://tools.ietf.org/html/rfc6749#section-6).

### `AuthSession.requestAsync(requestUrl, fetchRequest)`

Android

iOS

Web

Parameter| Type  
---|---  
requestUrl| `string`  
fetchRequest| `FetchRequest`  
  
  

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<T>`

### `AuthSession.resolveDiscoveryAsync(issuerOrDiscovery)`

Android

iOS

Web

Parameter| Type  
---|---  
issuerOrDiscovery| `IssuerOrDiscovery`  
  
  

Utility method for resolving the discovery document from an issuer or object.

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<DiscoveryDocument>`

### `AuthSession.revokeAsync(config, discovery)`

Android

iOS

Web

Parameter| Type| Description  
---|---|---  
config| `RevokeTokenRequestConfig`| Configuration used to revoke a refresh or
access token.  
discovery| `[Pick](https://www.typescriptlang.org/docs/handbook/utility-
types.html#picktype-keys)<DiscoveryDocument, 'revocationEndpoint'>`| The
`revocationEndpoint` for a provider.  
  
  

Revoke a token with a provider. This makes the token unusable, effectively
requiring the user to login again.

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<boolean>`

Resolves to `true` when the revocation request completes. Rejects with an
error if the provider does not expose a `revocationEndpoint` or the request
fails. Many providers do not support this feature.

## Types

### `AccessTokenRequestConfig`

Android

iOS

Web

Config used to exchange an authorization code for an access token.

> See: [Section 4.1.3](https://tools.ietf.org/html/rfc6749#section-4.1.3)

Type: `TokenRequestConfig` extended by:

Property| Type| Description  
---|---|---  
code| `string`| The authorization code received from the authorization server.  
redirectUri| `string`| If the `redirectUri` parameter was included in the
`AuthRequest`, then it must be supplied here as well. [Section
3.1.2](https://tools.ietf.org/html/rfc6749#section-3.1.2)  
  
### `AuthDiscoveryDocument`

Android

iOS

Web

Type: `[Pick](https://www.typescriptlang.org/docs/handbook/utility-
types.html#picktype-keys)<DiscoveryDocument, 'authorizationEndpoint'>`

### `AuthErrorConfig`

Android

iOS

Web

Type: `ResponseErrorConfig` extended by:

Property| Type| Description  
---|---|---  
state(optional)| `string`| Required only if state is used in the initial
request  
  
### `AuthRequestConfig`

Android

iOS

Web

Represents an OAuth authorization request as JSON.

Property| Type| Description  
---|---|---  
clientId| `string`| A unique string representing the registration information
provided by the client. The client identifier is not a secret; it is exposed
to the resource owner and shouldn't be used alone for client authentication.
The client identifier is unique to the authorization server. [Section
2.2](https://tools.ietf.org/html/rfc6749#section-2.2)  
clientSecret(optional)| `string`| Client secret supplied by an auth provider.
There is no secure way to store this on the client. [Section
2.3.1](https://tools.ietf.org/html/rfc6749#section-2.3.1)  
codeChallenge(optional)| `string`| Derived from the code verifier by using the
`CodeChallengeMethod`. [Section
4.2](https://tools.ietf.org/html/rfc7636#section-4.2)  
codeChallengeMethod(optional)| `CodeChallengeMethod`| Method used to generate
the code challenge. You should never use `Plain` as it's not good enough for
secure verification.Default:`CodeChallengeMethod.S256`  
extraParams(optional)| `Record<string, string>`| Extra query params that'll be
added to the query string.  
prompt(optional)| `Prompt | Prompt[]`| Informs the server if the user should be prompted to login or consent again. This can be used to present a dialog for switching accounts after the user has already been logged in. [Section 3.1.2.1](https://openid.net/specs/openid-connect-core-1_0.html#AuthorizationRequest)  
redirectUri| `string`| After completing an interaction with a resource owner
the server will redirect to this URI. Learn more about [linking in
Expo](/guides/linking). [Section
3.1.2](https://tools.ietf.org/html/rfc6749#section-3.1.2)  
responseType(optional)| `ResponseType | string`| Specifies what is returned from the authorization server. [Section 3.1.1](https://tools.ietf.org/html/rfc6749#section-3.1.1)Default:`ResponseType.Code`  
scopes(optional)| `string[]`| List of strings to request access to. [Section
3.3](https://tools.ietf.org/html/rfc6749#section-3.3)  
state(optional)| `string`| Used for protection against [Cross-Site Request
Forgery](https://tools.ietf.org/html/rfc6749#section-10.12).  
usePKCE(optional)| `boolean`| Should use [Proof Key for Code
Exchange](https://oauth.net/2/pkce/).Default:`true`  
  
### `AuthRequestPromptOptions`

Android

iOS

Web

Options passed to the `promptAsync()` method of `AuthRequest`s. This can be
used to configure how the web browser should look and behave.

Type: `[Omit](https://www.typescriptlang.org/docs/handbook/utility-
types.html#omittype-
keys)<[AuthSessionOpenOptions](/versions/latest/sdk/webbrowser#authsessionopenoptions),
'windowFeatures'>` extended by:

Property| Type| Description  
---|---|---  
url(optional)| `string`| URL to open when prompting the user. This usually
should be defined internally and left `undefined` in most cases.  
windowFeatures(optional)|
`[WebBrowserWindowFeatures](/versions/latest/sdk/webbrowser#webbrowserwindowfeatures)`|
Only for: Web  
Features to use with `window.open()`.  
  
### `AuthSessionRedirectUriOptions`

Android

iOS

Web

Options passed to `makeRedirectUri`.

Property| Type| Description  
---|---|---  
isTripleSlashed(optional)| `boolean`| Should the URI be triple slashed
`scheme:///path` or double slashed `scheme://path`. Defaults to `false`.  
native(optional)| `string`| Manual scheme to use in Bare and Standalone native
app contexts. Takes precedence over all other properties. You must define the
URI scheme that will be used in a custom built native application or
standalone Expo application. The value should conform to your native app's URI
schemes. You can see conformance with `npx uri-scheme list`.  
path(optional)| `string`| Optional path to append to a URI. This will not be
added to `native`.  
preferLocalhost(optional)| `boolean`| Attempt to convert the Expo server IP
address to localhost. This is useful for testing when your IP changes often,
this will only work for iOS simulator.Default:`false`  
queryParams(optional)| `Record<string, string | undefined>`| Optional native scheme URI protocol `<scheme>://` that must be built into your native app.  
scheme(optional)| `string`| URI protocol `<scheme>://` that must be built into
your native app.  
  
### `AuthSessionResult`

Android

iOS

Web

Object returned after an auth request has completed.

  * If the user cancelled the authentication session by closing the browser, the result is `{ type: 'cancel' }`.
  * If the authentication is dismissed manually with `AuthSession.dismiss()`, the result is `{ type: 'dismiss' }`.
  * If the authentication flow is successful, the result is `{ type: 'success', params: Object, event: Object }`.
  * If the authentication flow is returns an error, the result is `{ type: 'error', params: Object, error: string, event: Object }`.

Type: `object` shaped as below:

Property| Type| Description  
---|---|---  
type| `'cancel' | 'dismiss' | 'opened' | 'locked'`| How the auth completed.  
  
Or `object` shaped as below:

Property| Type| Description  
---|---|---  
authentication| `TokenResponse | null`| Returned when the auth finishes with an `access_token` property.  
error(optional)| `AuthError | null`| Possible error if the auth failed with type `error`.  
errorCode| `string | null`| 

> Deprecated Legacy error code query param, use `error` instead.  
  
params| `Record<string, string>`| Query params from the `url` as an object.  
type| `'error' | 'success'`| How the auth completed.  
url| `string`| Auth URL that was opened  
  
### `DiscoveryDocument`

Android

iOS

Web

Property| Type| Description  
---|---|---  
authorizationEndpoint(optional)| `string`| Used to interact with the resource
owner and obtain an authorization grant. [Section
3.1](https://tools.ietf.org/html/rfc6749#section-3.1)  
discoveryDocument(optional)| `ProviderMetadata`| All metadata about the
provider.  
endSessionEndpoint(optional)| `string`| URL at the OP to which an RP can
perform a redirect to request that the End-User be logged out at the OP.
[OPMetadata](https://openid.net/specs/openid-connect-
session-1_0-17.html#OPMetadata)  
registrationEndpoint(optional)| `string`| URL of the OP's [Dynamic Client
Registration](https://openid.net/specs/openid-connect-
discovery-1_0.html#OpenID.Registration) Endpoint.  
revocationEndpoint(optional)| `string`| Used to revoke a token (generally for
signing out). The spec requires a revocation endpoint, but some providers
(like Spotify) do not support one. [Section
2.1](https://tools.ietf.org/html/rfc7009#section-2.1)  
tokenEndpoint(optional)| `string`| Used by the client to obtain an access
token by presenting its authorization grant or refresh token. The token
endpoint is used with every authorization grant except for the implicit grant
type (since an access token is issued directly). [Section
3.2](https://tools.ietf.org/html/rfc6749#section-3.2)  
userInfoEndpoint(optional)| `string`| URL of the OP's UserInfo Endpoint used
to return info about the authenticated user.
[UserInfo](https://openid.net/specs/openid-connect-core-1_0.html#UserInfo)  
  
> Deprecated See [Facebook authentication](/guides/facebook-authentication).

### `FacebookAuthRequestConfig`

Android

iOS

Web

Type: `ProviderAuthRequestConfig` extended by:

Property| Type| Description  
---|---|---  
androidClientId(optional)| `string`| Android native client ID for use in
development builds and bare workflow.  
iosClientId(optional)| `string`| iOS native client ID for use in development
builds and bare workflow.  
webClientId(optional)| `string`| Expo web client ID for use in the browser.  
  
### `FetchRequest`

Android

iOS

Web

Property| Type| Description  
---|---|---  
body(optional)| `Record<string, string>`| -  
dataType(optional)| `string`| -  
headers(optional)| `Headers`| -  
method(optional)| `string`| -  
  
> Deprecated See [Google authentication](/guides/google-authentication).

### `GoogleAuthRequestConfig`

Android

iOS

Web

Type: `ProviderAuthRequestConfig` extended by:

Property| Type| Description  
---|---|---  
androidClientId(optional)| `string`| Android native client ID for use in
standalone, and bare workflow.  
iosClientId(optional)| `string`| iOS native client ID for use in standalone,
bare workflow, and custom clients.  
language(optional)| `string`| Language code ISO 3166-1 alpha-2 region code,
such as 'it' or 'pt-PT'.  
loginHint(optional)| `string`| If the user's email address is known ahead of
time, it can be supplied to be the default option. If the user has approved
access for this app in the past then auth may return without any further
interaction.  
selectAccount(optional)| `boolean`| When `true`, the service will allow the
user to switch between accounts (if possible).Default:`false.`  
shouldAutoExchangeCode(optional)| `boolean`| Should the hook automatically
exchange the response code for an authentication token. Defaults to `true` on
installed apps (Android, iOS) when `ResponseType.Code` is used (default).  
webClientId(optional)| `string`| Expo web client ID for use in the browser.  
  
### `Headers`

Android

iOS

Web

Type: `Record<string, string>` extended by:

Property| Type| Description  
---|---|---  
Accept(optional)| `string`| -  
Authorization(optional)| `string`| -  
Content-Type| `string`| -  
  
### `Issuer`

Android

iOS

Web

URL using the `https` scheme with no query or fragment component that the OP
asserts as its Issuer Identifier.

Type: `string`

### `IssuerOrDiscovery`

Android

iOS

Web

Literal Type: `union`

Acceptable values are: `Issuer` | `DiscoveryDocument`

### `PromptMethod(options)`

Android

iOS

Web

Parameter| Type  
---|---  
options(optional)| `AuthRequestPromptOptions`  
  
Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<AuthSessionResult>`

### `ProviderAuthRequestConfig`

Android

iOS

Web

Type: `AuthRequestConfig` extended by:

Property| Type| Description  
---|---|---  
language(optional)| `string`| Language for the sign in UI, in the form of ISO
639-1 language code optionally followed by a dash and ISO 3166-1 alpha-2
region code, such as 'it' or 'pt-PT'. Only set this value if it's different
from the system default (which you can access via expo-localization).  
  
### `ProviderMetadata`

Android

iOS

Web

OpenID Providers have metadata describing their configuration.
[ProviderMetadata](https://openid.net/specs/openid-connect-
discovery-1_0.html#ProviderMetadata)

Type: `Record<string, string | boolean | string[]>` `ProviderMetadataEndpoints` extended by:

Property| Type| Description  
---|---|---  
backchannel_logout_session_supported(optional)| `boolean`| -  
backchannel_logout_supported(optional)| `boolean`| -  
check_session_iframe(optional)| `string`| -  
claim_types_supported(optional)| `string[]`| a list of the Claim Types that
the OpenID Provider supports.  
claims_locales_supported(optional)| `string[]`| Languages and scripts
supported for values in Claims being returned.  
claims_parameter_supported(optional)| `boolean`| Boolean value specifying
whether the OP supports use of the claims parameter, with `true` indicating
support.Default:`false`  
claims_supported(optional)| `string[]`| a list of the Claim Names of the
Claims that the OpenID Provider may be able to supply values for. Note that
for privacy or other reasons, this might not be an exhaustive list.  
code_challenge_methods_supported(optional)| `CodeChallengeMethod[]`| -  
display_values_supported(optional)| `string[]`| a list of the `display`
parameter values that the OpenID Provider supports.  
frontchannel_logout_session_supported(optional)| `boolean`| -  
frontchannel_logout_supported(optional)| `boolean`| -  
grant_types_supported(optional)| `string[]`| JSON array containing a list of
the OAuth 2.0 Grant Type values that this OP supports. Dynamic OpenID
Providers MUST support the authorization_code and implicit Grant Type values
and MAY support other Grant Types. If omitted, the default value is
["authorization_code", "implicit"].  
id_token_signing_alg_values_supported(optional)| `string[]`| JSON array
containing a list of the JWS signing algorithms (alg values) supported by the
OP for the ID Token to encode the Claims in a JWT. The algorithm RS256 MUST be
included.  
jwks_uri(optional)| `string`| URL of the OP's JSON Web Key Set
[JWK](https://openid.net/specs/openid-connect-discovery-1_0.html#JWK)
document.  
op_policy_uri(optional)| `string`| URL that the OpenID Provider provides to
the person registering the Client to read about the OP's requirements on how
the Relying Party can use the data provided by the OP. The registration
process SHOULD display this URL to the person registering the Client if it is
given.  
op_tos_uri(optional)| `string`| URL that the OpenID Provider provides to the
person registering the Client to read about OpenID Provider's terms of
service. The registration process should display this URL to the person
registering the Client if it is given.  
request_parameter_supported(optional)| `boolean`| Boolean value specifying
whether the OP supports use of the request parameter, with `true` indicating
support.Default:`false`  
request_uri_parameter_supported(optional)| `boolean`| Whether the OP supports
use of the `request_uri` parameter, with `true` indicating
support.Default:`true`  
require_request_uri_registration(optional)| `boolean`| Whether the OP requires
any `request_uri` values used to be pre-registered using the `request_uris`
registration parameter. Pre-registration is required when the value is
`true`.Default:`false`  
response_modes_supported(optional)| `string[]`| JSON array containing a list
of the OAuth 2.0 `response_mode` values that this OP supports, as specified in
[OAuth 2.0 Multiple Response Type Encoding
Practices](https://openid.net/specs/openid-connect-
discovery-1_0.html#OAuth.Responses). If omitted, the default for Dynamic
OpenID Providers is `["query", "fragment"]`.  
response_types_supported(optional)| `string[]`| JSON array containing a list
of the OAuth 2.0 `response_type` values that this OP supports. Dynamic OpenID
Providers must support the `code`, `id_token`, and the `token` `id_token`
Response Type values  
scopes_supported(optional)| `string[]`| JSON array containing a list of the
OAuth 2.0 [RFC6749](https://openid.net/specs/openid-connect-
discovery-1_0.html#RFC6749) scope values that this server supports.  
service_documentation(optional)| `string`| URL of a page containing human-
readable information that developers might want or need to know when using the
OpenID Provider. In particular, if the OpenID Provider does not support
Dynamic Client Registration, then information on how to register Clients needs
to be provided in this documentation.  
subject_types_supported(optional)| `string[]`| JSON array containing a list of
the Subject Identifier types that this OP supports. Valid types include
`pairwise` and `public`.  
token_endpoint_auth_methods_supported(optional)| `('client_secret_post' | 'client_secret_basic' | 'client_secret_jwt' | 'private_key_jwt' | string)[]`| A list of Client authentication methods supported by this Token Endpoint. If omitted, the default is `['client_secret_basic']`  
ui_locales_supported(optional)| `string[]`| Languages and scripts supported
for the user interface, represented as a JSON array of
[BCP47](https://openid.net/specs/openid-connect-discovery-1_0.html#RFC5646)
language tag values.  
  
### `ProviderMetadataEndpoints`

Android

iOS

Web

Property| Type| Description  
---|---|---  
authorization_endpoint| `string`| URL of the OP's OAuth 2.0 Authorization
Endpoint.  
device_authorization_endpoint(optional)| `string`| -  
end_session_endpoint(optional)| `string`| -  
introspection_endpoint(optional)| `string`| -  
issuer(optional)| `Issuer`| -  
registration_endpoint(optional)| `string`| -  
revocation_endpoint(optional)| `string`| -  
token_endpoint| `string`| URL of the OP's OAuth 2.0 Token Endpoint. This is
required unless only the Implicit Flow is used.  
userinfo_endpoint(optional)| `string`| URL of the OP's UserInfo Endpoint.  
  
### `RefreshTokenRequestConfig`

Android

iOS

Web

Config used to request a token refresh, or code exchange.

> See: [Section 6](https://tools.ietf.org/html/rfc6749#section-6)

Type: `TokenRequestConfig` extended by:

Property| Type| Description  
---|---|---  
refreshToken(optional)| `string`| The refresh token issued to the client.  
  
### `ResponseErrorConfig`

Android

iOS

Web

Server response error.

Type: `Record<string, any>` extended by:

Property| Type| Description  
---|---|---  
error| `string`| Error code  
error_description(optional)| `string`| Additional message  
error_uri(optional)| `string`| URI for more info on the error  
  
### `RevokeTokenRequestConfig`

Android

iOS

Web

Config used to revoke a token.

> See: [Section 2.1](https://tools.ietf.org/html/rfc7009#section-2.1)

Type: `[Partial](https://www.typescriptlang.org/docs/handbook/utility-
types.html#partialtype)<TokenRequestConfig>` extended by:

Property| Type| Description  
---|---|---  
token| `string`| The token that the client wants to get revoked. [Section
3.1](https://tools.ietf.org/html/rfc6749#section-3.1)  
tokenTypeHint(optional)| `TokenTypeHint`| A hint about the type of the token
submitted for revocation. [Section
3.2](https://tools.ietf.org/html/rfc6749#section-3.2)  
  
### `ServerTokenResponseConfig`

Android

iOS

Web

Object returned from the server after a token response.

Property| Type| Description  
---|---|---  
access_token| `string`| -  
expires_in(optional)| `number`| -  
id_token(optional)| `string`| -  
issued_at(optional)| `number`| -  
refresh_token(optional)| `string`| -  
scope(optional)| `string`| -  
token_type(optional)| `TokenType`| -  
  
### `TokenRequestConfig`

Android

iOS

Web

Config used to request a token refresh, revocation, or code exchange.

Property| Type| Description  
---|---|---  
clientId| `string`| A unique string representing the registration information
provided by the client. The client identifier is not a secret; it is exposed
to the resource owner and shouldn't be used alone for client authentication.
The client identifier is unique to the authorization server. [Section
2.2](https://tools.ietf.org/html/rfc6749#section-2.2)  
clientSecret(optional)| `string`| Client secret supplied by an auth provider.
There is no secure way to store this on the client. [Section
2.3.1](https://tools.ietf.org/html/rfc6749#section-2.3.1)  
extraParams(optional)| `Record<string, string>`| Extra query params that'll be
added to the query string.  
scopes(optional)| `string[]`| List of strings to request access to. [Section
3.3](https://tools.ietf.org/html/rfc6749#section-3.3)  
  
### `TokenResponseConfig`

Android

iOS

Web

Property| Type| Description  
---|---|---  
accessToken| `string`| The access token issued by the authorization server.
[Section 4.2.2](https://tools.ietf.org/html/rfc6749#section-4.2.2)  
expiresIn(optional)| `number`| The lifetime in seconds of the access token.
For example, the value `3600` denotes that the access token will expire in one
hour from the time the response was generated. If omitted, the authorization
server should provide the expiration time via other means or document the
default value. [Section
4.2.2](https://tools.ietf.org/html/rfc6749#section-4.2.2)  
idToken(optional)| `string`| ID Token value associated with the authenticated
session. [TokenResponse](https://openid.net/specs/openid-connect-
core-1_0.html#TokenResponse)  
issuedAt(optional)| `number`| Time in seconds when the token was received by
the client.  
refreshToken(optional)| `string`| The refresh token, which can be used to
obtain new access tokens using the same authorization grant. [Section
5.1](https://tools.ietf.org/html/rfc6749#section-5.1)  
scope(optional)| `string`| The scope of the access token. Only required if
it's different to the scope that was requested by the client. [Section
3.3](https://tools.ietf.org/html/rfc6749#section-3.3)  
state(optional)| `string`| Required if the "state" parameter was present in
the client authorization request. The exact value received from the client.
[Section 4.2.2](https://tools.ietf.org/html/rfc6749#section-4.2.2)  
tokenType(optional)| `TokenType`| The type of the token issued. Value is case
insensitive. [Section 7.1](https://tools.ietf.org/html/rfc6749#section-7.1)  
  
### `TokenType`

Android

iOS

Web

Literal Type: `string`

Access token type.

> See: [Section 7.1](https://tools.ietf.org/html/rfc6749#section-7.1)

Acceptable values are: `'bearer'` | `'mac'`

## Enums

### `CodeChallengeMethod`

Android

iOS

Web

#### `Plain`

`CodeChallengeMethod.Plain ＝ "plain"`

This should not be used. When used, the code verifier will be sent to the
server as-is.

#### `S256`

`CodeChallengeMethod.S256 ＝ "S256"`

The default and recommended method for transforming the code verifier.

  * Convert the code verifier to ASCII.
  * Create a digest of the string using crypto method SHA256.
  * Convert the digest to Base64 and URL encode it.

### `GrantType`

Android

iOS

Web

Grant type values used in dynamic client registration and auth requests.

> See: [Appendix A.10](https://tools.ietf.org/html/rfc6749#appendix-A.10)

#### `AuthorizationCode`

`GrantType.AuthorizationCode ＝ "authorization_code"`

Used for exchanging an authorization code for one or more tokens.

[Section 4.1.3](https://tools.ietf.org/html/rfc6749#section-4.1.3)

#### `ClientCredentials`

`GrantType.ClientCredentials ＝ "client_credentials"`

Used for client credentials flow.

[Section 4.4.2](https://tools.ietf.org/html/rfc6749#section-4.4.2)

#### `Implicit`

`GrantType.Implicit ＝ "implicit"`

Used when obtaining an access token.

[Section 4.2](https://tools.ietf.org/html/rfc6749#section-4.2)

#### `RefreshToken`

`GrantType.RefreshToken ＝ "refresh_token"`

Used when exchanging a refresh token for a new token.

[Section 6](https://tools.ietf.org/html/rfc6749#section-6)

### `Prompt`

Android

iOS

Web

Informs the server if the user should be prompted to login or consent again.
This can be used to present a dialog for switching accounts after the user has
already been logged in. You should use this in favor of clearing cookies
(which is mostly not possible on iOS).

> See: [Section 3.1.2.1](https://openid.net/specs/openid-connect-
> core-1_0.html#AuthorizationRequest).

#### `Consent`

`Prompt.Consent ＝ "consent"`

Server should prompt the user for consent before returning information to the
client. If it cannot obtain consent, it must return an error, typically
`consent_required`.

#### `Login`

`Prompt.Login ＝ "login"`

The server should prompt the user to reauthenticate. If it cannot
reauthenticate the End-User, it must return an error, typically
`login_required`.

#### `None`

`Prompt.None ＝ "none"`

Server must not display any auth or consent UI. Can be used to check for
existing auth or consent. An error is returned if a user isn't already
authenticated or the client doesn't have pre-configured consent for the
requested claims, or does not fulfill other conditions for processing the
request. The error code will typically be `login_required`,
`interaction_required`, or another code defined in [Section
3.1.2.6](https://openid.net/specs/openid-connect-core-1_0.html#AuthError).

#### `SelectAccount`

`Prompt.SelectAccount ＝ "select_account"`

Server should prompt the user to select an account. Can be used to switch
accounts. If it can't obtain an account selection choice made by the user, it
must return an error, typically `account_selection_required`.

### `ResponseType`

Android

iOS

Web

The client informs the authorization server of the desired grant type by using
the response type.

> See: [Section 3.1.1](https://tools.ietf.org/html/rfc6749#section-3.1.1).

#### `Code`

`ResponseType.Code ＝ "code"`

For requesting an authorization code as described by [Section
4.1.1](https://tools.ietf.org/html/rfc6749#section-4.1.1).

#### `IdToken`

`ResponseType.IdToken ＝ "id_token"`

A custom registered type for getting an `id_token` from Google OAuth.

#### `Token`

`ResponseType.Token ＝ "token"`

For requesting an access token (implicit grant) as described by [Section
4.2.1](https://tools.ietf.org/html/rfc6749#section-4.2.1).

### `TokenTypeHint`

Android

iOS

Web

A hint about the type of the token submitted for revocation. If not included
then the server should attempt to deduce the token type.

> See: [Section 2.1](https://tools.ietf.org/html/rfc7009#section-2.1)

#### `AccessToken`

`TokenTypeHint.AccessToken ＝ "access_token"`

Access token.

[Section 1.4](https://tools.ietf.org/html/rfc6749#section-1.4)

#### `RefreshToken`

`TokenTypeHint.RefreshToken ＝ "refresh_token"`

Refresh token.

[Section 1.5](https://tools.ietf.org/html/rfc6749#section-1.5)

## Advanced usage

### Filtering out AuthSession events in Linking handlers

There are many reasons why you might want to handle inbound links into your
app, such as push notifications or just regular deep linking (you can read
more about this in the [Linking](/linking/overview)); authentication redirects
are only one type of deep link, and `AuthSession` handles these particular
links for you. In your own `Linking.addEventListener` handlers, you can filter
out deep links that are handled by `AuthSession` by checking if the URL
includes the `+expo-auth-session` string -- if it does, you can ignore it.
This works because `AuthSession` adds `+expo-auth-session` to the default
`returnUrl`; however, if you provide your own `returnUrl`, you may want to
consider adding a similar identifier to enable you to filter out `AuthSession`
events from other handlers.

### With React Navigation

If you are using deep linking with React Navigation, filtering through
`Linking.addEventListener` will not be sufficient because deep linking is
[handled differently](https://reactnavigation.org/docs/configuring-
links/#advanced-cases). Instead, to filter these events, add a custom
`getStateFromPath` function to your linking configuration, and then filter by
URL in the same way as described above.

