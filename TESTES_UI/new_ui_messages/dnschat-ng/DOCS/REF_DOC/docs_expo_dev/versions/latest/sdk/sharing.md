# ![Expo Sharing icon](/static/images/packages/expo-sharing.png)Expo Sharing

[GitHub](https://github.com/expo/expo/tree/sdk-54/packages/expo-
sharing)[Changelog](https://github.com/expo/expo/tree/sdk-54/packages/expo-
sharing/CHANGELOG.md)[npm](https://www.npmjs.com/package/expo-sharing)

Ask AI

A library that provides implementing sharing files.

[GitHub](https://github.com/expo/expo/tree/sdk-54/packages/expo-
sharing)[Changelog](https://github.com/expo/expo/tree/sdk-54/packages/expo-
sharing/CHANGELOG.md)[npm](https://www.npmjs.com/package/expo-sharing)

Ask AI

Android

iOS

Web

Bundled version:

~14.0.7

Copy

* * *

`expo-sharing` allows you to share files directly with other compatible
applications.

#### Sharing limitations on web

  * `expo-sharing` for web is built on top of the Web Share API, which still has [very limited browser support](https://caniuse.com/#feat=web-share). Be sure to check that the API can be used before calling it by using `Sharing.isAvailableAsync()`.
  * HTTPS required on web: The Web Share API is only available on web when the page is served over https. Run your app with `npx expo start --tunnel` to enable it.
  * No local file sharing on web: Sharing local files by URI works on Android and iOS, but not on web. You cannot share local files on web by URI — you will need to upload them somewhere and share that URI.

#### Sharing to your app from other apps

Currently `expo-sharing` only supports sharing _from your app to other apps_
and you cannot register to your app to have content shared to it through the
native share dialog on native platforms. You can read more [in the related
feature request](https://expo.canny.io/feature-requests/p/share-extension-ios-
share-intent-android). You can setup this functionality manually in Xcode and
Android Studio and create an [Expo Config Plugin](/config-
plugins/introduction) to continue using [Expo Prebuild](/workflow/prebuild).

## Installation

Terminal

Copy

`- ``npx expo install expo-sharing`

If you are installing this in an [existing React Native app](/bare/overview),
make sure to [install `expo`](/bare/installing-expo-modules) in your project.

## API

    
    
    import * as Sharing from 'expo-sharing';
    

## Methods

### `Sharing.isAvailableAsync()`

Android

iOS

Web

Determine if the sharing API can be used in this app.

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<boolean>`

A promise that fulfills with `true` if the sharing API can be used, and
`false` otherwise.

### `Sharing.shareAsync(url, options)`

Android

iOS

Web

Parameter| Type| Description  
---|---|---  
url| `string`| Local file URL to share.  
options(optional)| `SharingOptions`| A map of share options.Default:`{}`  
  
  

Opens action sheet to share file to different applications which can handle
this type of file.

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<void>`

## Types

### `SharingOptions`

Android

iOS

Web

Property| Type| Description  
---|---|---  
anchor(optional)| `{  height: number,  width: number,  x: number,  y: number
}`| Only for: iOS  
set the anchor point for iPad  
dialogTitle(optional)| `string`| Only for: AndroidWeb  
Sets share dialog title.  
mimeType(optional)| `string`| Only for: Android  
Sets `mimeType` for `Intent`.  
UTI(optional)| `string`| Only for: iOS  
[Uniform Type
Identifier](https://developer.apple.com/library/archive/documentation/FileManagement/Conceptual/understanding_utis/understand_utis_conc/understand_utis_conc.html)

  * the type of the target file.

