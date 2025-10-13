# Expo Asset

[GitHub](https://github.com/expo/expo/tree/sdk-54/packages/expo-
asset)[Changelog](https://github.com/expo/expo/tree/sdk-54/packages/expo-
asset/CHANGELOG.md)[npm](https://www.npmjs.com/package/expo-asset)

Ask AI

A universal library that allows downloading assets and using them with other
libraries.

[GitHub](https://github.com/expo/expo/tree/sdk-54/packages/expo-
asset)[Changelog](https://github.com/expo/expo/tree/sdk-54/packages/expo-
asset/CHANGELOG.md)[npm](https://www.npmjs.com/package/expo-asset)

Ask AI

Android

iOS

tvOS

Web

Bundled version:

~12.0.9

Copy

* * *

`expo-asset` provides an interface to Expo's asset system. An asset is any
file that lives alongside the source code of your app that the app needs at
runtime. Examples include images, fonts, and sounds. Expo's asset system
integrates with React Native's, so that you can refer to files with
`require('path/to/file')`. This is how you refer to static image files in
React Native for use in an `Image` component, for example. Check out React
Native's [documentation on static image
resources](https://reactnative.dev/docs/images#static-image-resources) for
more information. This method of referring to static image resources works out
of the box with Expo.

## Installation

Terminal

Copy

`- ``npx expo install expo-asset`

If you are installing this in an [existing React Native app](/bare/overview),
make sure to [install `expo`](/bare/installing-expo-modules) in your project.

## Configuration in app config

You can configure `expo-asset` using its built-in [config plugin](/config-
plugins/introduction) if you use config plugins in your project ([EAS
Build](/build/introduction) or `npx expo run:[android|ios]`). The plugin
allows you to configure various properties that cannot be set at runtime and
require building a new app binary to take effect.

### Example app.json with config plugin

app.json

Copy

    
    
    {
      "expo": {
        "plugins": [
          [
            "expo-asset",
            {
              "assets": ["path/to/file.png", "path/to/directory"]
            }
          ]
        ]
      }
    }
    

### Configurable properties

Name| Default| Description  
---|---|---  
`assets`| `[]`| An array of asset files or directories to link to the native
project. The paths should be relative to the project root so that the file
names, whether specified directly or using a directory, will become the
resource names. Supported file types:

  * Images: `.png`, `.jpg`, `.gif`
  * Media: `.mp4`, `.mp3`, `.lottie`, `.riv`
  * SQLite database files: `.db`

> Note: To import an existing database file (`.db`), see instructions in
> [SQLite API reference](/versions/latest/sdk/sqlite#import-an-existing-
> database). For other file types (such as `.lottie` or `.riv`), see [how to
> add a file extension to `assetExts` in metro config](/guides/customizing-
> metro#adding-more-file-extensions-to-assetexts).  
  
### Usage

Learn more about how to use the `expo-asset` config plugin to embed an asset
file in your project in [Load an asset at build time](/develop/user-
interface/assets#load-an-asset-at-build-time).

## API

    
    
    import { Asset } from 'expo-asset';
    

## Hooks

### `useAssets(moduleIds)`

Android

iOS

tvOS

Web

Parameter| Type  
---|---  
moduleIds| `number | number[]`  
  
  

Downloads and stores one or more assets locally. After the assets are loaded,
this hook returns a list of asset instances. If something went wrong when
loading the assets, an error is returned.

> Note, the assets are not "reloaded" when you dynamically change the asset
> list.

Returns:

`[[Asset[]](/versions/latest/sdk/asset#asset) | undefined, [Error](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error) | undefined]`

Returns an array containing:

  * on the first position, a list of all loaded assets. If they aren't loaded yet, this value is `undefined`.
  * on the second position, an error which encountered when loading the assets. If there was no error, this value is `undefined`.

Example

    
    
    const [assets, error] = useAssets([require('path/to/asset.jpg'), require('path/to/other.png')]);
    
    return assets ? <Image source={assets[0]} /> : null;
    

## Classes

### `Asset`

Android

iOS

tvOS

Web

The `Asset` class represents an asset in your app. It gives metadata about the
asset (such as its name and type) and provides facilities to load the asset
data.

Asset Properties

### `downloaded`

Android

iOS

tvOS

Web

Type: `boolean` • Default: `false`

Whether the asset has finished downloading from a call to `downloadAsync()`.

### `hash`

Android

iOS

tvOS

Web

Read Only • Literal type: `union` • Default: `null`

The MD5 hash of the asset's data.

Acceptable values are: `null` | `string`

### `height`

Android

iOS

tvOS

Web

Literal type: `union` • Default: `null`

If the asset is an image, the height of the image data divided by the scale
factor. The scale factor is the number after `@` in the filename, or `1` if
not present.

Acceptable values are: `null` | `number`

### `localUri`

Android

iOS

tvOS

Web

Literal type: `union` • Default: `null`

If the asset has been downloaded (by calling `downloadAsync()`), the `file://`
URI pointing to the local file on the device that contains the asset data.

Acceptable values are: `null` | `string`

### `name`

Android

iOS

tvOS

Web

Type: `string`

The name of the asset file without the extension. Also without the part from
`@` onward in the filename (used to specify scale factor for images).

### `type`

Android

iOS

tvOS

Web

Read Only • Type: `string`

The extension of the asset filename.

### `uri`

Android

iOS

tvOS

Web

Read Only • Type: `string`

A URI that points to the asset's data on the remote server. When running the
published version of your app, this refers to the location on Expo's asset
server where Expo has stored your asset. When running the app from Expo CLI
during development, this URI points to Expo CLI's server running on your
computer and the asset is served directly from your computer. If you are not
using Classic Updates (legacy), this field should be ignored as we ensure your
assets are on device before running your application logic.

### `width`

Android

iOS

tvOS

Web

Literal type: `union` • Default: `null`

If the asset is an image, the width of the image data divided by the scale
factor. The scale factor is the number after `@` in the filename, or `1` if
not present.

Acceptable values are: `null` | `number`

Asset Methods

### `downloadAsync()`

Android

iOS

tvOS

Web

Downloads the asset data to a local file in the device's cache directory. Once
the returned promise is fulfilled without error, the `localUri` field of this
asset points to a local file containing the asset data. The asset is only
downloaded if an up-to-date local file for the asset isn't already present due
to an earlier download. The downloaded `Asset` will be returned when the
promise is resolved.

> Note: There is no guarantee that files downloaded via `downloadAsync`
> persist between app sessions. `downloadAsync` stores files in the caches
> directory, so it's up to the OS to clear this folder at its own discretion
> or when the user manually purges the caches directory. Downloaded assets are
> stored as `ExponentAsset-{cacheFileId}.{extension}` within the cache
> directory. To manually clear cached assets, you can use [`expo-file-
> system`](/versions/latest/sdk/filesystem) to delete the cache directory:
> `Paths.cache.delete()` or use the legacy API `deleteAsync(cacheDirectory)`.

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<[Asset](/versions/latest/sdk/asset#asset)>`

Returns a Promise which fulfills with an `Asset` instance.

### `fromMetadata(meta)`

Android

iOS

tvOS

Web

Parameter| Type  
---|---  
meta| `AssetMetadata`  
  
  

Returns:

`[Asset](/versions/latest/sdk/asset#asset)`

### `fromModule(virtualAssetModule)`

Android

iOS

tvOS

Web

Parameter| Type| Description  
---|---|---  
virtualAssetModule| `string | number | {  height: number,  uri: string,  width: number }`| The value of `require('path/to/file')` for the asset or external network URL  
  
  

Returns the `Asset` instance representing an asset given its module or URL.

Returns:

`[Asset](/versions/latest/sdk/asset#asset)`

The `Asset` instance for the asset.

### `fromURI(uri)`

Android

iOS

tvOS

Web

Parameter| Type  
---|---  
uri| `string`  
  
  

Returns:

`[Asset](/versions/latest/sdk/asset#asset)`

### `loadAsync(moduleId)`

Android

iOS

tvOS

Web

Parameter| Type| Description  
---|---|---  
moduleId| `string | number | number[] | string[]`| An array of `require('path/to/file')` or external network URLs. Can also be just one module or URL without an Array.  
  
  

A helper that wraps `Asset.fromModule(module).downloadAsync` for convenience.

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<[Asset[]](/versions/latest/sdk/asset#asset)>`

Returns a Promise that fulfills with an array of `Asset`s when the asset(s)
has been saved to disk.

Example

    
    
    const [{ localUri }] = await Asset.loadAsync(require('./assets/snack-icon.png'));
    

## Types

### `AssetDescriptor`

Android

iOS

tvOS

Web

Property| Type| Description  
---|---|---  
hash(optional)| `string | null`| -  
height(optional)| `number | null`| -  
name| `string`| -  
type| `string`| -  
uri| `string`| -  
width(optional)| `number | null`| -  
  
### `AssetMetadata`

Android

iOS

tvOS

Web

Type: `[Pick](https://www.typescriptlang.org/docs/handbook/utility-types.html#picktype-keys)<[PackagerAsset](https://github.com/facebook/react-native/blob/main/packages/assets/registry.js), 'httpServerLocation' | 'name' | 'hash' | 'type' | 'scales' | 'width' | 'height'>` extended by:

Property| Type| Description  
---|---|---  
fileHashes(optional)| `string[]`| -  
fileUris(optional)| `string[]`| -  
uri(optional)| `string`| -

