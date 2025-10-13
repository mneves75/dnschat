# ![Expo Font icon](/static/images/packages/expo-font.png)Expo Font

[GitHub](https://github.com/expo/expo/tree/sdk-54/packages/expo-
font)[Changelog](https://github.com/expo/expo/tree/sdk-54/packages/expo-
font/CHANGELOG.md)[npm](https://www.npmjs.com/package/expo-font)

Ask AI

A library that allows loading fonts at runtime and using them in React Native
components.

[GitHub](https://github.com/expo/expo/tree/sdk-54/packages/expo-
font)[Changelog](https://github.com/expo/expo/tree/sdk-54/packages/expo-
font/CHANGELOG.md)[npm](https://www.npmjs.com/package/expo-font)

Ask AI

Android

iOS

tvOS

Web

Bundled version:

~14.0.8

Copy

* * *

`expo-font` allows loading fonts from the web and using them in React Native
components. See more detailed usage information in the [Fonts](/develop/user-
interface/fonts) guide.

## Installation

Terminal

Copy

`- ``npx expo install expo-font`

If you are installing this in an [existing React Native app](/bare/overview),
make sure to [install `expo`](/bare/installing-expo-modules) in your project.

## Configuration in app config

There are two ways to add fonts to your app: using the `expo-font` config
plugin (recommended) or loading them at runtime.

The plugin allows you to embed font files at build time which is more
efficient than [`useFonts`](/versions/latest/sdk/font#usefontsmap) or
[`loadAsync`](/versions/latest/sdk/font#loadasyncfontfamilyorfontmap-source).
After you set up the config plugin and run [prebuild](/workflow/continuous-
native-generation#usage), you can render custom fonts right away. The plugin
can be configured in different ways, see the [Fonts](/develop/user-
interface/fonts#with-expo-font-config-plugin) guide on how to use it.

### Example app.json with config plugin

app.json

Copy

    
    
    {
      "expo": {
        "plugins": [
          [
            "expo-font",
            {
              "fonts": ["./path/to/file.ttf"],
              "android": {
                "fonts": [
                  {
                    "fontFamily": "Source Serif 4",
                    "fontDefinitions": [
                      {
                        "path": "./path/to/SourceSerif4-ExtraBold.ttf",
                        "weight": 800
                      }
                    ]
                  }
                ]
              }
            }
          ]
        ]
      }
    }
    

### Configurable properties

Name| Default| Description  
---|---|---  
`fonts`| `[]`| An array of font definitions to link to the native project. The
paths should be relative to the project root. On Android, the file name
becomes the font family name. On iOS, the font family name is always taken
directly from the font file and may not be the same as the file name — follow
the [naming advice](/develop/user-interface/fonts#how-to-determine-which-font-
family-name-to-use) or use `getLoadedFonts` to see what fonts are available.  
`android`| `[]`| An array of font definitions to link to the native project on
Android. Use the object syntax to embed [xml
fonts](https://developer.android.com/develop/ui/views/text-and-emoji/fonts-in-
xml) with custom family name.  
`ios`| `[]`| An array of font file paths to link to the native project on iOS.
The font family name is taken directly from the font file.  
  
Are you using this library in an existing React Native app?

  * Android: Copy font files to android/app/src/main/assets/fonts.
  * iOS: See [Adding a Custom Font to Your App](https://developer.apple.com/documentation/uikit/adding-a-custom-font-to-your-app) in the Apple Developer documentation.

## Usage

If you don't want to use the [config
plugin](/versions/latest/sdk/font#configuration-in-app-config), you can load a
font at runtime with the `useFonts` hook, as shown in the snippet:

Example of loading and using a custom font

Copy

Open in Snack

    
    
    import { useFonts } from 'expo-font';
    import * as SplashScreen from 'expo-splash-screen';
    import { useEffect } from 'react';
    import { Text, View, StyleSheet } from 'react-native';
    
    SplashScreen.preventAutoHideAsync();
    
    export default function App() {
      // Use `useFonts` only if you can't use the config plugin.
      const [loaded, error] = useFonts({
        'Inter-Black': require('./assets/fonts/Inter-Black.otf'),
      });
    
      useEffect(() => {
        if (loaded || error) {
          SplashScreen.hideAsync();
        }
      }, [loaded, error]);
    
      if (!loaded && !error) {
        return null;
      }
    
      return (
        <View style={styles.container}>
          <Text style={{ fontFamily: 'Inter-Black', fontSize: 30 }}>Inter Black</Text>
          <Text style={{ fontSize: 30 }}>Platform Default</Text>
        </View>
      );
    }
    
    const styles = StyleSheet.create({
      container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      },
    });
    

## API

    
    
    import * as Font from 'expo-font';
    

## Hooks

### `useFonts(map)`

Android

iOS

tvOS

Web

Parameter| Type| Description  
---|---|---  
map| `string | Record<string, FontSource>`| A map of `fontFamily`s to `FontSource`s. After loading the font you can use the key in the `fontFamily` style prop of a `Text` element.  
  
  

Load a map of fonts at runtime with `loadAsync`. This returns a `boolean` if
the fonts are loaded and ready to use. It also returns an error if something
went wrong, to use in development.

> Note, the fonts are not "reloaded" when you dynamically change the font map.

Returns:

`[boolean, null | [Error](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error)]`

  * loaded (`boolean`) - A boolean to detect if the font for `fontFamily` has finished loading.
  * error (`Error | null`) - An error encountered when loading the fonts.

Example

    
    
    const [loaded, error] = useFonts({
      'Inter-Black': require('./assets/fonts/Inter-Black.otf'),
    });
    

## Methods

### `getLoadedFonts()`

Android

iOS

tvOS

Web

Synchronously get all the fonts that have been loaded. This includes fonts
that were bundled at build time using the config plugin, as well as those
loaded at runtime using `loadAsync`.

Returns:

`string[]`

Returns array of strings which you can use as `fontFamily` [style
prop](https://reactnative.dev/docs/text#style).

### `isLoaded(fontFamily)`

Android

iOS

tvOS

Web

Parameter| Type| Description  
---|---|---  
fontFamily| `string`| The name used to load the `FontResource`.  
  
  

Synchronously detect if the font for `fontFamily` has finished loading.

Returns:

`boolean`

Returns `true` if the font has fully loaded.

### `isLoading(fontFamily)`

Android

iOS

tvOS

Web

Parameter| Type| Description  
---|---|---  
fontFamily| `string`| The name used to load the `FontResource`.  
  
  

Synchronously detect if the font for `fontFamily` is still being loaded.

Returns:

`boolean`

Returns `true` if the font is still loading.

### `loadAsync(fontFamilyOrFontMap, source)`

Android

iOS

tvOS

Web

Parameter| Type| Description  
---|---|---  
fontFamilyOrFontMap| `string | Record<string, FontSource>`| String or map of values that can be used as the `fontFamily` [style prop](https://reactnative.dev/docs/text#style) with React Native `Text` elements.  
source(optional)| `FontSource`| The font asset that should be loaded into the
`fontFamily` namespace.  
  
  

An efficient method for loading fonts from static or remote resources which
can then be used with the platform's native text elements. In the browser,
this generates a `@font-face` block in a shared style sheet for fonts. No CSS
is needed to use this method.

> Note: We recommend using the config plugin instead whenever possible.

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<void>`

Returns a promise that fulfils when the font has loaded. Often you may want to
wrap the method in a `try/catch/finally` to ensure the app continues if the
font fails to load.

### `renderToImageAsync(glyphs, options)`

Android

iOS

Parameter| Type| Description  
---|---|---  
glyphs| `string`| Text to be exported.  
options(optional)| `RenderToImageOptions`| RenderToImageOptions.  
  
  

Creates an image with provided text.

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<string>`

Promise which fulfils with uri to image.

## Interfaces

### `RenderToImageOptions`

Android

iOS

tvOS

Web

Property| Type| Description  
---|---|---  
color(optional)| `string`| Font colorDefault:`'black'`  
fontFamily(optional)| `string`| Font family name.Default:`system default`  
size(optional)| `number`| Size of the font.Default:`24`  
  
## Types

### `FontResource`

Android

iOS

tvOS

Web

An object used to dictate the resource that is loaded into the provided font
namespace when used with `loadAsync`.

Property| Type| Description  
---|---|---  
default(optional)| `string`| -  
display(optional)| `FontDisplay`| Only for: Web  
Sets the `font-display` property for a given typeface in the browser.  
uri(optional)| `string | number`| -  
  
### `FontSource`

Android

iOS

tvOS

Web

Literal Type: `union`

The different types of assets you can provide to the `loadAsync()` function. A
font source can be a URI, a module ID, or an Expo Asset.

Acceptable values are: `string` | `number` | `[Asset](/versions/latest/sdk/asset#asset)` | `FontResource`

## Enums

### `FontDisplay`

Web

Sets the [font-display](https://developer.mozilla.org/en-
US/docs/Web/CSS/@font-face/font-display) for a given typeface. The default
font value on web is `FontDisplay.AUTO`. Even though setting the `fontDisplay`
does nothing on native platforms, the default behavior emulates
`FontDisplay.SWAP` on flagship devices like iOS, Samsung, Pixel, etc. Default
functionality varies on One Plus devices. In the browser this value is set in
the generated `@font-face` CSS block and not as a style property meaning you
cannot dynamically change this value based on the element it's used in.

#### `AUTO`

`FontDisplay.AUTO ＝ "auto"`

(Default) The font display strategy is defined by the user agent or platform.
This generally defaults to the text being invisible until the font is loaded.
Good for buttons or banners that require a specific treatment.

#### `BLOCK`

`FontDisplay.BLOCK ＝ "block"`

The text will be invisible until the font has loaded. If the font fails to
load then nothing will appear - it's best to turn this off when debugging
missing text.

#### `FALLBACK`

`FontDisplay.FALLBACK ＝ "fallback"`

Splits the behavior between `SWAP` and `BLOCK`. There will be a [100ms
timeout](https://developers.google.com/web/updates/2016/02/font-display?hl=en)
where the text with a custom font is invisible, after that the text will
either swap to the styled text or it'll show the unstyled text and continue to
load the custom font. This is good for buttons that need a custom font but
should also be quickly available to screen-readers.

#### `OPTIONAL`

`FontDisplay.OPTIONAL ＝ "optional"`

This works almost identically to `FALLBACK`, the only difference is that the
browser will decide to load the font based on slow connection speed or
critical resource demand.

#### `SWAP`

`FontDisplay.SWAP ＝ "swap"`

Fallback text is rendered immediately with a default font while the desired
font is loaded. This is good for making the content appear to load instantly
and is usually preferred.

## Error codes

Code| Description  
---|---  
ERR_FONT_API| If the arguments passed to `loadAsync` are invalid.  
ERR_FONT_SOURCE| The provided resource was of an incorrect type.  
ERR_WEB_ENVIRONMENT| The browser's `document` element doesn't support
injecting fonts.  
ERR_DOWNLOAD| Failed to download the provided resource.  
ERR_FONT_FAMILY| Invalid font family name was provided.  
ERR_UNLOAD| Attempting to unload fonts that haven't finished loading yet.

