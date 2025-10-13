# ![Expo Clipboard icon](/static/images/packages/expo-clipboard.png)Expo
Clipboard

[GitHub](https://github.com/expo/expo/tree/sdk-54/packages/expo-
clipboard)[Changelog](https://github.com/expo/expo/tree/sdk-54/packages/expo-
clipboard/CHANGELOG.md)[npm](https://www.npmjs.com/package/expo-clipboard)

Ask AI

A universal library that allows getting and setting Clipboard content.

[GitHub](https://github.com/expo/expo/tree/sdk-54/packages/expo-
clipboard)[Changelog](https://github.com/expo/expo/tree/sdk-54/packages/expo-
clipboard/CHANGELOG.md)[npm](https://www.npmjs.com/package/expo-clipboard)

Ask AI

Android

iOS

Web

Bundled version:

~8.0.7

Copy

* * *

`expo-clipboard` provides an interface for getting and setting Clipboard
content on Android, iOS, and Web.

## Installation

Terminal

Copy

`- ``npx expo install expo-clipboard`

If you are installing this in an [existing React Native app](/bare/overview),
make sure to [install `expo`](/bare/installing-expo-modules) in your project.

## Usage

Clipboard

Copy

Open in Snack

    
    
    import { useState } from 'react';
    import { View, Text, Button, StyleSheet } from 'react-native';
    import * as Clipboard from 'expo-clipboard';
    
    export default function App() {
      const [copiedText, setCopiedText] = useState('');
    
      const copyToClipboard = async () => {
        await Clipboard.setStringAsync('hello world');
      };
    
      const fetchCopiedText = async () => {
        const text = await Clipboard.getStringAsync();
        setCopiedText(text);
      };
    
      return (
        <View style={styles.container}>
          <Button title="Click here to copy to Clipboard" onPress={copyToClipboard} />
          <Button title="View copied text" onPress={fetchCopiedText} />
          <Text style={styles.copiedText}>{copiedText}</Text>
        </View>
      );
    }
    
    const styles = StyleSheet.create({
      container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      },
      copiedText: {
        marginTop: 10,
        color: 'red',
      },
    });
    

## API

    
    
    import * as Clipboard from 'expo-clipboard';
    

> On Web, this module uses the [`AsyncClipboard`
> API](https://developer.mozilla.org/en-US/docs/Web/API/Clipboard_API), which
> might behave differently between browsers or not be fully supported.
> Especially on WebKit, there's an issue which makes this API unusable in
> asynchronous code. [Click here for more
> details](https://bugs.webkit.org/show_bug.cgi?id=222262).

## Component

### `ClipboardPasteButton`

Android

iOS

Web

Type: `React.Element<ClipboardPasteButtonProps>`

This component displays the `UIPasteControl` button on your screen. This
allows pasting from the clipboard without requesting permission from the user.

You should only attempt to render this if `Clipboard.isPasteButtonAvailable`
is `true`. This component will render nothing if it is not available, and you
will get a warning in development mode (`__DEV__ === true`).

The properties of this component extend from `View`; however, you should not
attempt to set `backgroundColor`, `color` or `borderRadius` with the `style`
property. Apple restricts customisation of this view. Instead, you should use
the backgroundColor and foregroundColor properties to set the colors of the
button, the cornerStyle property to change the border radius, and the
displayMode property to change the appearance of the icon and label. The word
"Paste" is not editable and neither is the icon.

Make sure to attach height and width via the style props as without these
styles, the button will not appear on the screen.

> See: [Apple
> Documentation](https://developer.apple.com/documentation/uikit/uipastecontrol)
> for more details.

ClipboardPasteButtonProps

### `acceptedContentTypes`

Android

iOS

Web

Optional • Type: `AcceptedContentType[]` • Default: `['plain-text', 'image']`

An array of the content types that will cause the button to become active.

> Do not include `plain-text` and `html` at the same time as this will cause
> all text to be treated as `html`.

### `backgroundColor`

Android

iOS

Web

Optional • Literal type: `union`

The backgroundColor of the button. Leaving this as the default allows the
color to adjust to the system theme settings.

Acceptable values are: `string` | `null`

### `cornerStyle`

Android

iOS

Web

Optional • Literal type: `union` • Default: `'capsule'`

The cornerStyle of the button.

> See: [Apple
> Documentation](https://developer.apple.com/documentation/uikit/uibutton/configuration/cornerstyle)
> for more details.

Acceptable values are: `CornerStyleType` | `null`

### `displayMode`

Android

iOS

Web

Optional • Literal type: `union` • Default: `'iconAndLabel'`

The displayMode of the button.

> See: [Apple
> Documentation](https://developer.apple.com/documentation/uikit/uipastecontrol/displaymode)
> for more details.

Acceptable values are: `DisplayModeType` | `null`

### `foregroundColor`

Android

iOS

Web

Optional • Literal type: `union` • Default: `'white'`

The foregroundColor of the button.

Acceptable values are: `string` | `null`

### `imageOptions`

Android

iOS

Web

Optional • Literal type: `union`

The options to use when pasting an image from the clipboard.

Acceptable values are: `GetImageOptions` | `null`

### `onPress`

Android

iOS

Web

Type: `(data: PasteEventPayload) => void`

A callback that is called with the result of the paste action. Inspect the
`type` property to determine the type of the pasted data.

Can be one of `text` or `image`.

Example

    
    
      onPress={(data) => {
        if (data.type === 'image') {
          setImageData(data);
       } else {
          setTextData(data);
        }
      }}
    

### `style`

Android

iOS

Web

Optional • Type: `StyleProp<[Omit](https://www.typescriptlang.org/docs/handbook/utility-types.html#omittype-keys)<[ViewStyle](https://reactnative.dev/docs/view-style-props), 'backgroundColor' | 'borderRadius' | 'color'>>`

The custom style to apply to the button. Should not include `backgroundColor`,
`borderRadius` or `color` properties.

#### Inherited Props

  * `[ViewProps](https://reactnative.dev/docs/view#props)`

## Constants

### `isPasteButtonAvailable`

Android

iOS

Web

Type: `boolean`

Property that determines if the `ClipboardPasteButton` is available.

This requires the users device to be using at least iOS 16.

`true` if the component is available, and `false` otherwise.

## Methods

### `getImageAsync(options)`

Android

iOS

Web

Parameter| Type| Description  
---|---|---  
options| `GetImageOptions`| A `GetImageOptions` object to specify the desired
format of the image.  
  
  

Gets the image from the user's clipboard and returns it in the specified
format. Calling this method on web will prompt the user to grant your app
permission to "see text and images copied to the clipboard."

Returns:

`[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<ClipboardImage | null>`

If there was an image in the clipboard, the promise resolves to a
`ClipboardImage` object containing the base64 string and metadata of the
image. Otherwise, it resolves to `null`.

Example

    
    
    const img = await Clipboard.getImageAsync({ format: 'png' });
    // ...
    <Image source={{ uri: img?.data }} style={{ width: 200, height: 200 }} />
    

### `getStringAsync(options)`

Android

iOS

Web

Parameter| Type| Description  
---|---|---  
options(optional)| `GetStringOptions`| Options for the clipboard content to be
retrieved.Default:`{}`  
  
  

Gets the content of the user's clipboard. Calling this method on web will
prompt the user to grant your app permission to "see text and images copied to
the clipboard."

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<string>`

A promise that resolves to the content of the clipboard.

### `getUrlAsync()`

iOS

Gets the URL from the user's clipboard.

Returns:

`[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<string | null>`

A promise that fulfills to the URL in the clipboard.

### `hasImageAsync()`

Android

iOS

Web

Returns whether the clipboard has an image content.

On web, this requires the user to grant your app permission to _"see text and
images copied to the clipboard"_.

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<boolean>`

A promise that fulfills to `true` if clipboard has image content, resolves to
`false` otherwise.

### `hasStringAsync()`

Android

iOS

Web

Returns whether the clipboard has text content. Returns true for both plain
text and rich text (e.g. HTML).

On web, this requires the user to grant your app permission to _"see text and
images copied to the clipboard"_.

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<boolean>`

A promise that fulfills to `true` if clipboard has text content, resolves to
`false` otherwise.

### `hasUrlAsync()`

iOS

Returns whether the clipboard has a URL content.

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<boolean>`

A promise that fulfills to `true` if clipboard has URL content, resolves to
`false` otherwise.

### `setImageAsync(base64Image)`

Android

iOS

Web

Parameter| Type| Description  
---|---|---  
base64Image| `string`| Image encoded as a base64 string, without MIME type.  
  
  

Sets an image in the user's clipboard.

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<void>`

Example

    
    
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      base64: true,
    });
    await Clipboard.setImageAsync(result.base64);
    

> Deprecated Use `setStringAsync()` instead.

### `setString(text)`

Android

iOS

Web

Parameter| Type  
---|---  
text| `string`  
  
  

Sets the content of the user's clipboard.

Returns:

`void`

On web, this returns a boolean value indicating whether or not the string was
saved to the user's clipboard. On iOS and Android, nothing is returned.

### `setStringAsync(text, options)`

Android

iOS

Web

Parameter| Type| Description  
---|---|---  
text| `string`| The string to save to the clipboard.  
options(optional)| `SetStringOptions`| Options for the clipboard content to be
set.Default:`{}`  
  
  

Sets the content of the user's clipboard.

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<boolean>`

On web, this returns a promise that fulfills to a boolean value indicating
whether or not the string was saved to the user's clipboard. On iOS and
Android, the promise always resolves to `true`.

### `setUrlAsync(url)`

iOS

Parameter| Type| Description  
---|---|---  
url| `string`| The URL to save to the clipboard.  
  
  

Sets a URL in the user's clipboard.

This function behaves the same as `setStringAsync()`, except that it sets the
clipboard content type to be a URL. It lets your app or other apps know that
the clipboard contains a URL and behave accordingly.

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<void>`

## Event Subscriptions

### `addClipboardListener(listener)`

Android

iOS

Web

Parameter| Type| Description  
---|---|---  
listener| `(event: ClipboardEvent) => void`| Callback to execute when listener
is triggered. The callback is provided a single argument that is an object
containing information about clipboard contents.  
  
  

Adds a listener that will fire whenever the content of the user's clipboard
changes. This method is a no-op on Web.

Returns:

`EventSubscription`

Example

    
    
    Clipboard.addClipboardListener(({ contentTypes }: ClipboardEvent) => {
      if (contentTypes.includes(Clipboard.ContentType.PLAIN_TEXT)) {
        Clipboard.getStringAsync().then(content => {
          alert('Copy pasta! Here\'s the string that was copied: ' + content)
        });
      } else if (contentTypes.includes(Clipboard.ContentType.IMAGE)) {
        alert('Yay! Clipboard contains an image');
      }
    });
    

### `removeClipboardListener(subscription)`

Android

iOS

Web

Parameter| Type| Description  
---|---|---  
subscription| `EventSubscription`| The subscription to remove (created by
addClipboardListener).  
  
  

Removes the listener added by addClipboardListener. This method is a no-op on
Web.

Returns:

`void`

Example

    
    
    const subscription = addClipboardListener(() => {
      alert('Copy pasta!');
    });
    removeClipboardListener(subscription);
    

## Interfaces

### `Subscription`

Android

iOS

Web

A subscription object that allows to conveniently remove an event listener
from the emitter.

Subscription Methods

### `remove()`

Android

iOS

Web

Removes an event listener for which the subscription has been created. After
calling this function, the listener will no longer receive any events from the
emitter.

Returns:

`void`

## Types

### `AcceptedContentType`

Android

iOS

Web

Literal Type: `string`

Acceptable values are: `'plain-text'` | `'image'` | `'url'` | `'html'`

### `ClipboardEvent`

Android

iOS

Web

Property| Type| Description  
---|---|---  
content| `string`|

> Deprecated Returns empty string. Use `getStringAsync()` instead to retrieve
> clipboard content.  
  
contentTypes| `ContentType[]`| An array of content types that are available on
the clipboard.  
  
### `ClipboardImage`

Android

iOS

Web

Property| Type| Description  
---|---|---  
data| `string`| A Base64-encoded string of the image data. Its format is
dependent on the `format` option. You can use it directly as the source of an
`Image` element.

> NOTE: The string is already prepended with `data:image/png;base64,` or
> `data:image/jpeg;base64,` prefix.

Example

    
    
    <Image
      source={{ uri: clipboardImage.data }}
      style={{ width: 200, height: 200 }}
    />
      
  
size| `{  height: number,  width: number }`| Dimensions (`width` and `height`)
of the image pasted from clipboard.  
  
### `CornerStyleType`

Android

iOS

Web

Literal Type: `string`

Acceptable values are: `'dynamic'` | `'fixed'` | `'capsule'` | `'large'` | `'medium'` | `'small'`

### `DisplayModeType`

Android

iOS

Web

Literal Type: `string`

Acceptable values are: `'iconAndLabel'` | `'iconOnly'` | `'labelOnly'`

### `GetImageOptions`

Android

iOS

Web

Property| Type| Description  
---|---|---  
format| `'png' | 'jpeg'`| The format of the clipboard image to be converted to.  
jpegQuality(optional)| `number`| Specify the quality of the returned image,
between `0` and `1`. Defaults to `1` (highest quality). Applicable only when
`format` is set to `jpeg`, ignored otherwise.Default:`1`  
  
### `GetStringOptions`

Android

iOS

Web

Property| Type| Description  
---|---|---  
preferredFormat(optional)| `StringFormat`| The target format of the clipboard
string to be converted to, if possible.Default:`StringFormat.PLAIN_TEXT`  
  
### `ImagePasteEvent`

Android

iOS

Web

Type: `ClipboardImage` extended by:

Property| Type| Description  
---|---|---  
type| `'image'`| -  
  
### `PasteEventPayload`

Android

iOS

Web

Literal Type: `union`

Acceptable values are: `TextPasteEvent` | `ImagePasteEvent`

### `SetStringOptions`

Android

iOS

Web

Property| Type| Description  
---|---|---  
inputFormat(optional)| `StringFormat`| The input format of the provided
string. Adjusting this option can help other applications interpret copied
string properly.Default:`StringFormat.PLAIN_TEXT`  
  
### `TextPasteEvent`

Android

iOS

Web

Property| Type| Description  
---|---|---  
text| `string`| -  
type| `'text'`| -  
  
## Enums

### `ContentType`

Android

iOS

Web

Type used to define what type of data is stored in the clipboard.

#### `HTML`

`ContentType.HTML ＝ "html"`

#### `IMAGE`

`ContentType.IMAGE ＝ "image"`

#### `PLAIN_TEXT`

`ContentType.PLAIN_TEXT ＝ "plain-text"`

#### `URL`

iOS

`ContentType.URL ＝ "url"`

### `StringFormat`

Android

iOS

Web

Type used to determine string format stored in the clipboard.

#### `HTML`

`StringFormat.HTML ＝ "html"`

#### `PLAIN_TEXT`

`StringFormat.PLAIN_TEXT ＝ "plainText"`

