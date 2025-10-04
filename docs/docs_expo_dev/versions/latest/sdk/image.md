# ![Expo Image icon](/static/images/packages/expo-image.png)Expo Image

[GitHub](https://github.com/expo/expo/tree/sdk-54/packages/expo-
image)[Changelog](https://github.com/expo/expo/tree/sdk-54/packages/expo-
image/CHANGELOG.md)[npm](https://www.npmjs.com/package/expo-image)

Ask AI

A cross-platform and performant React component that loads and renders images.

[GitHub](https://github.com/expo/expo/tree/sdk-54/packages/expo-
image)[Changelog](https://github.com/expo/expo/tree/sdk-54/packages/expo-
image/CHANGELOG.md)[npm](https://www.npmjs.com/package/expo-image)

Ask AI

Android

iOS

tvOS

Web

Bundled version:

~3.0.8

Copy

* * *

`expo-image` is a cross-platform React component that loads and renders
images.

Main features:

  * Designed for speed
  * Support for many image formats (including animated ones)
  * Disk and memory caching
  * Supports [BlurHash](https://blurha.sh) and [ThumbHash](https://evanw.github.io/thumbhash/) \- compact representations of a placeholder for an image
  * Transitioning between images when the source changes (no more flickering!)
  * Implements the CSS [`object-fit`](https://developer.mozilla.org/en-US/docs/Web/CSS/object-fit) and [`object-position`](https://developer.mozilla.org/en-US/docs/Web/CSS/object-position) properties (see [`contentFit`](/versions/latest/sdk/image#contentfit) and [`contentPosition`](/versions/latest/sdk/image#contentposition) props)
  * Uses performant [`SDWebImage`](https://github.com/SDWebImage/SDWebImage) and [`Glide`](https://github.com/bumptech/glide) under the hood

#### Supported image formats

Format| Android| iOS| Web  
---|---|---|---  
WebP| | |   
PNG / APNG| | |   
AVIF| | |   
HEIC| | |  [not adopted yet](https://caniuse.com/heif)  
JPEG| | |   
GIF| | |   
SVG| | |   
ICO| | |   
ICNS| | |   
  
## Installation

Terminal

Copy

`- ``npx expo install expo-image`

If you are installing this in an [existing React Native app](/bare/overview),
make sure to [install `expo`](/bare/installing-expo-modules) in your project.

## Usage

    
    
    import { Image } from 'expo-image';
    import { StyleSheet, View } from 'react-native';
    
    const blurhash =
      '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[';
    
    export default function App() {
      return (
        <View style={styles.container}>
          <Image
            style={styles.image}
            source="https://picsum.photos/seed/696/3000/2000"
            placeholder={{ blurhash }}
            contentFit="cover"
            transition={1000}
          />
        </View>
      );
    }
    
    const styles = StyleSheet.create({
      container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
      },
      image: {
        flex: 1,
        width: '100%',
        backgroundColor: '#0553',
      },
    });
    

## API

    
    
    import { Image } from 'expo-image';
    

## Components

### `Image`

Android

iOS

tvOS

Web

Type:
`React.[PureComponent](https://react.dev/reference/react/PureComponent)<ImageProps>`

Some props are from React Native Image that Expo Image supports (more or less)
for easier migration, but all of them are deprecated and might be removed in
the future.

ImageProps

### `accessibilityLabel`

Android

iOS

tvOS

Web

Optional • Type: `string` • Default: `undefined`

The text that's read by the screen reader when the user interacts with the
image. Sets the `alt` tag on web which is used for web crawlers and link
traversal.

### `accessible`

Android

iOS

Optional • Type: `boolean` • Default: `false`

When true, indicates that the view is an accessibility element. When a view is
an accessibility element, it groups its children into a single selectable
component.

On Android, the `accessible` property will be translated into the native
`isScreenReaderFocusable`, so it's only affecting the screen readers
behaviour.

### `allowDownscaling`

Android

iOS

tvOS

Web

Optional • Type: `boolean` • Default: `true`

Whether the image should be downscaled to match the size of the view
container. Turning off this functionality could negatively impact the
application's performance, particularly when working with large assets.
However, it would result in smoother image resizing, and end-users would
always have access to the highest possible asset quality.

Downscaling is never used when the `contentFit` prop is set to `none` or
`fill`.

### `alt`

Android

iOS

tvOS

Web

Optional • Type: `string` • Default: `undefined`

The text that's read by the screen reader when the user interacts with the
image. Sets the `alt` tag on web which is used for web crawlers and link
traversal. Is an alias for `accessibilityLabel`.

### `autoplay`

Android

iOS

Optional • Type: `boolean` • Default: `true`

Determines if an image should automatically begin playing if it is an animated
image.

### `blurRadius`

Android

iOS

tvOS

Web

Optional • Type: `number` • Default: `0`

The radius of the blur in points, `0` means no blur effect. This effect is not
applied to placeholders.

### `cachePolicy`

Android

iOS

tvOS

Web

Optional • Literal type: `union` • Default: `'disk'`

Determines whether to cache the image and where: on the disk, in the memory or
both.

  * `'none'` \- Image is not cached at all.

  * `'disk'` \- Image is queried from the disk cache if exists, otherwise it's downloaded and then stored on the disk.

  * `'memory'` \- Image is cached in memory. Might be useful when you render a high-resolution picture many times. Memory cache may be purged very quickly to prevent high memory usage and the risk of out of memory exceptions.

  * `'memory-disk'` \- Image is cached in memory, but with a fallback to the disk cache.

Acceptable values are: `null` | `'none'` | `'disk'` | `'memory'` | `'memory-disk'`

### `contentFit`

Android

iOS

tvOS

Web

Optional • Type: `ImageContentFit` • Default: `'cover'`

Determines how the image should be resized to fit its container. This property
tells the image to fill the container in a variety of ways; such as "preserve
that aspect ratio" or "stretch up and take up as much space as possible". It
mirrors the CSS [`object-fit`](https://developer.mozilla.org/en-
US/docs/Web/CSS/object-fit) property.

  * `'cover'` \- The image is sized to maintain its aspect ratio while filling the container box. If the image's aspect ratio does not match the aspect ratio of its box, then the object will be clipped to fit.

  * `'contain'` \- The image is scaled down or up to maintain its aspect ratio while fitting within the container box.

  * `'fill'` \- The image is sized to entirely fill the container box. If necessary, the image will be stretched or squished to fit.

  * `'none'` \- The image is not resized and is centered by default. When specified, the exact position can be controlled with `contentPosition` prop.

  * `'scale-down'` \- The image is sized as if `none` or `contain` were specified, whichever would result in a smaller concrete image size.

### `contentPosition`

Android

iOS

tvOS

Web

Optional • Type: `ImageContentPosition` • Default: `'center'`

It is used together with `contentFit` to specify how the image should be
positioned with x/y coordinates inside its own container. An equivalent of the
CSS [`object-position`](https://developer.mozilla.org/en-
US/docs/Web/CSS/object-position) property.

### `decodeFormat`

Android

Optional • Type: `ImageDecodeFormat` • Default: `'argb'`

The format in which the image data should be decoded. It's not guaranteed that
the platform will use the specified format.

  * `'argb'` \- The image is decoded into a 32-bit color space with alpha channel (<https://developer.android.com/reference/android/graphics/Bitmap.Config#ARGB_8888>).

  * `'rgb'` \- The image is decoded into a 16-bit color space without alpha channel (<https://developer.android.com/reference/android/graphics/Bitmap.Config#RGB_565>).

> Deprecated Provides compatibility for [`defaultSource` from React Native
> Image](https://reactnative.dev/docs/image#defaultsource). Use `placeholder`
> prop instead.

### `defaultSource`

Android

iOS

tvOS

Web

Optional • Literal type: `union`

Acceptable values are: `null` | `ImageSource`

### `enableLiveTextInteraction`

iOS 16.0+

Optional • Type: `boolean` • Default: `false`

Enables Live Text interaction with the image. Check official [Apple
documentation](https://developer.apple.com/documentation/visionkit/enabling_live_text_interactions_with_images)
for more details.

### `enforceEarlyResizing`

iOS

Optional • Type: `boolean` • Default: `false`

Force early resizing of the image to match the container size. This option
helps to reduce the memory usage of the image view, especially when the image
is larger than the container. It may affect the `resizeType` and
`contentPosition` properties when the image view is resized dynamically.

> Deprecated Provides compatibility for [`fadeDuration` from React Native
> Image](https://reactnative.dev/docs/image#fadeduration-android). Instead use
> `transition` with the provided duration.

### `fadeDuration`

Android

iOS

tvOS

Web

Optional • Type: `number`

### `focusable`

Android

Optional • Type: `boolean` • Default: `false`

Whether this View should be focusable with a non-touch input device and
receive focus with a hardware keyboard.

> Deprecated Provides compatibility for [`loadingIndicatorSource` from React
> Native Image](https://reactnative.dev/docs/image#loadingindicatorsource).
> Use `placeholder` prop instead.

### `loadingIndicatorSource`

Android

iOS

tvOS

Web

Optional • Literal type: `union`

Acceptable values are: `null` | `ImageSource`

### `onDisplay`

Android

iOS

tvOS

Web

Optional • Type: `() => void`

Called when the image view successfully rendered the source image.

### `onError`

Android

iOS

tvOS

Web

Optional • Type: `(event: ImageErrorEventData) => void`

Called on an image fetching error.

### `onLoad`

Android

iOS

tvOS

Web

Optional • Type: `(event: ImageLoadEventData) => void`

Called when the image load completes successfully.

### `onLoadEnd`

Android

iOS

tvOS

Web

Optional • Type: `() => void`

Called when the image load either succeeds or fails.

### `onLoadStart`

Android

iOS

tvOS

Web

Optional • Type: `() => void`

Called when the image starts to load.

### `onProgress`

Android

iOS

tvOS

Web

Optional • Type: `(event: ImageProgressEventData) => void`

Called when the image is loading. Can be called multiple times before the
image has finished loading. The event object provides details on how many
bytes were loaded so far and what's the expected total size.

### `placeholder`

Android

iOS

tvOS

Web

Optional • Literal type: `union`

An image to display while loading the proper image and no image has been
displayed yet or the source is unset.

> Note: The default value for placeholder's content fit is 'scale-down', which
> differs from the source image's default value. Using a lower-resolution
> placeholder may cause flickering due to scaling differences between it and
> the final image. To prevent this, you can set the `placeholderContentFit` to
> match the `contentFit` value.

Acceptable values are: `null` | `string` | `number` | `ImageSource` | `[SharedRef](/versions/v54.0.0/sdk/expo#sharedreftype)<'image'>` | `ImageSource[]` | `string[]`

### `placeholderContentFit`

Android

iOS

tvOS

Web

Optional • Type: `ImageContentFit` • Default: `'scale-down'`

Determines how the placeholder should be resized to fit its container.
Available resize modes are the same as for the `contentFit` prop.

### `priority`

Android

iOS

tvOS

Web

Optional • Literal type: `union` • Default: `'normal'`

Priorities for completing loads. If more than one load is queued at a time,
the load with the higher priority will be started first. Priorities are
considered best effort, there are no guarantees about the order in which loads
will start or finish.

Acceptable values are: `null` | `'low'` | `'normal'` | `'high'`

### `recyclingKey`

Android

iOS

Optional • Literal type: `union` • Default: `null`

Changing this prop resets the image view content to blank or a placeholder
before loading and rendering the final image. This is especially useful for
any kinds of recycling views like
[FlashList](https://github.com/shopify/flash-list) to prevent showing the
previous source before the new one fully loads.

Acceptable values are: `null` | `string`

> Deprecated Provides compatibility for [`resizeMode` from React Native
> Image](https://reactnative.dev/docs/image#resizemode). Note that `"repeat"`
> option is not supported at all. Use the more powerful `contentFit` and
> `contentPosition` props instead.

### `resizeMode`

Android

iOS

tvOS

Web

Optional • Literal type: `string`

Acceptable values are: `'cover'` | `'contain'` | `'center'` | `'stretch'` | `'repeat'`

### `responsivePolicy`

Web

Optional • Literal type: `string` • Default: `'static'`

Controls the selection of the image source based on the container or viewport
size on the web.

If set to `'static'`, the browser selects the correct source based on user's
viewport width. Works with static rendering. Make sure to set the
`'webMaxViewportWidth'` property on each source for best results. For example,
if an image occupies 1/3 of the screen width, set the `'webMaxViewportWidth'`
to 3x the image width. The source with the largest `'webMaxViewportWidth'` is
used even for larger viewports.

If set to `'initial'`, the component will select the correct source during
mount based on container size. Does not work with static rendering.

If set to `'live'`, the component will select the correct source on every
resize based on container size. Does not work with static rendering.

Acceptable values are: `'live'` | `'initial'` | `'static'`

### `source`

Android

iOS

tvOS

Web

Optional • Literal type: `union`

The image source, either a remote URL, a local file resource or a number that
is the result of the `require()` function. When provided as an array of
sources, the source that fits best into the container size and is closest to
the screen scale will be chosen. In this case it is important to provide
`width`, `height` and `scale` properties.

Acceptable values are: `null` | `string` | `number` | `ImageSource` | `[SharedRef](/versions/v54.0.0/sdk/expo#sharedreftype)<'image'>` | `ImageSource[]` | `string[]`

### `tintColor`

Android

iOS

tvOS

Web

Optional • Literal type: `union` • Default: `null`

A color used to tint template images (a bitmap image where only the opacity
matters). The color is applied to every non-transparent pixel, causing the
image's shape to adopt that color. This effect is not applied to placeholders.

Acceptable values are: `null` | `string`

### `transition`

Android

iOS

tvOS

Web

Optional • Literal type: `union`

Describes how the image view should transition the contents when switching the
image source.  
If provided as a number, it is the duration in milliseconds of the `'cross-
dissolve'` effect.

Acceptable values are: `null` | `number` | `ImageTransition`

### `useAppleWebpCodec`

iOS

Optional • Type: `boolean` • Default: `true`

Whether to use the Apple's default WebP codec.

Set this prop to `false` to use the official standard-compliant
[libwebp](https://github.com/webmproject/libwebp) codec for WebP images. The
default implementation from Apple is faster and uses less memory but may
render animated images with incorrect blending or play them at the wrong
framerate.

> See: <https://github.com/SDWebImage/SDWebImage/wiki/Advanced-Usage#awebp-
> coder>

#### Inherited Props

  * `[Omit](https://www.typescriptlang.org/docs/handbook/utility-types.html#omittype-keys)<[ViewProps](https://reactnative.dev/docs/view#props), 'style' | 'children'>`

### `ImageBackground`

Android

iOS

tvOS

Web

Type:
`React.[Element](https://www.typescriptlang.org/docs/handbook/jsx.html#function-
component)<ImageBackgroundProps>`

It allows you to use an image as a background while rendering other content on
top of it. It extends all `Image` props but provides separate styling controls
for the container and the background image itself.

ImageBackgroundProps

### `imageStyle`

Android

iOS

tvOS

Web

Optional • Type: `StyleProp<ImageStyle>`

Style object for the image.

### `style`

Android

iOS

tvOS

Web

Optional • Type: `StyleProp<[ViewStyle](https://reactnative.dev/docs/view-
style-props)>`

The style of the image container.

#### Inherited Props

  * `[Omit](https://www.typescriptlang.org/docs/handbook/utility-types.html#omittype-keys)<ImageProps, 'style'>`

## Static Methods

### `clearDiskCache()`

Android

iOS

Asynchronously clears all images from the disk cache.

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<boolean>`

A promise resolving to `true` when the operation succeeds. It may resolve to
`false` on Android when the activity is no longer available. Resolves to
`false` on Web.

### `clearMemoryCache()`

Android

iOS

Asynchronously clears all images stored in memory.

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<boolean>`

A promise resolving to `true` when the operation succeeds. It may resolve to
`false` on Android when the activity is no longer available. Resolves to
`false` on Web.

### `generateBlurhashAsync(source, numberOfComponents)`

Android

iOS

Parameter| Type| Description  
---|---|---  
source| `string | ImageRef`| The image source, either a URL (string) or an ImageRef  
numberOfComponents| `[number, number] | {  height: number,  width: number }`| The number of components to encode the blurhash with. Must be between 1 and 9. Defaults to `[4, 3]`.  
  
  

Asynchronously generates a [Blurhash](https://blurha.sh) from an image.

Returns:

`[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<null | string>`

A promise resolving to the blurhash string.

### `generateThumbhashAsync(source)`

Android

iOS

Parameter| Type| Description  
---|---|---  
source| `string | ImageRef`| The image source, either a URL (string) or an ImageRef  
  
  

Asynchronously generates a [Thumbhash](https://evanw.github.io/thumbhash/)
from an image.

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<string>`

A promise resolving to the thumbhash string.

### `getCachePathAsync(cacheKey)`

Android

iOS

Parameter| Type| Description  
---|---|---  
cacheKey| `string`| The cache key for the requested image. Unless you have set
a custom cache key, this will be the source URL of the image.  
  
  

Asynchronously checks if an image exists in the disk cache and resolves to the
path of the cached image if it does.

Returns:

`[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<null | string>`

A promise resolving to the path of the cached image. It will resolve to `null`
if the image does not exist in the cache.

### `loadAsync(source, options)`

Android

iOS

Web

Parameter| Type  
---|---  
source| `string | number | ImageSource`  
options(optional)| `ImageLoadOptions`  
  
  

Loads an image from the given source to memory and resolves to an object that
references the native image instance.

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<ImageRef>`

### `prefetch(urls, cachePolicy)`

Android

iOS

tvOS

Web

Parameter| Type| Description  
---|---|---  
urls| `string | string[]`| A URL string or an array of URLs of images to prefetch.  
cachePolicy(optional)| `'disk' | 'memory' | 'memory-disk'`| The cache policy for prefetched images.  
  
  

Preloads images at the given URLs that can be later used in the image view.
Preloaded images are cached to the memory and disk by default, so make sure to
use `disk` (default) or `memory-disk` cache policy.

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<boolean>`

A promise resolving to `true` as soon as all images have been successfully
prefetched. If an image fails to be prefetched, the promise will immediately
resolve to `false` regardless of whether other images have finished
prefetching.

### `prefetch(urls, options)`

Android

iOS

tvOS

Web

Parameter| Type| Description  
---|---|---  
urls| `string | string[]`| A URL string or an array of URLs of images to prefetch.  
options(optional)| `ImagePrefetchOptions`| Options for prefetching images.  
  
  

Preloads images at the given URLs that can be later used in the image view.
Preloaded images are cached to the memory and disk by default, so make sure to
use `disk` (default) or `memory-disk` cache policy.

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<boolean>`

A promise resolving to `true` as soon as all images have been successfully
prefetched. If an image fails to be prefetched, the promise will immediately
resolve to `false` regardless of whether other images have finished
prefetching.

## Component Methods

### `getAnimatableRef()`

Android

iOS

tvOS

Web

Returns:

`null | [View](https://reactnative.dev/docs/view) | Image`

### `lockResourceAsync()`

Android

iOS

Prevents the resource from being reloaded by locking it.

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<void>`

### `reloadAsync()`

Android

iOS

Reloads the resource, ignoring lock.

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<void>`

### `startAnimating()`

Android

iOS

Asynchronously starts playback of the view's image if it is animated.

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<void>`

### `stopAnimating()`

Android

iOS

Asynchronously stops the playback of the view's image if it is animated.

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<void>`

### `unlockResourceAsync()`

Android

iOS

Releases the lock on the resource, allowing it to be reloaded.

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<void>`

## Hooks

### `useImage(source, options, dependencies)`

Android

iOS

Web

Parameter| Type  
---|---  
source| `string | number | ImageSource`  
options(optional)| `ImageLoadOptions`  
dependencies(optional)| `DependencyList`  
  
  

A hook that loads an image from the given source and returns a reference to
the native image instance, or `null` until the first image is successfully
loaded.

It loads a new image every time the `uri` of the provided source changes. To
trigger reloads in some other scenarios, you can provide an additional
dependency list.

Returns:

`ImageRef | null`

Example

    
    
    import { useImage, Image } from 'expo-image';
    import { Text } from 'react-native';
    
    export default function MyImage() {
      const image = useImage('https://picsum.photos/1000/800', {
        maxWidth: 800,
        onError(error, retry) {
          console.error('Loading failed:', error.message);
        }
      });
    
      if (!image) {
        return <Text>Image is loading...</Text>;
      }
    
      return <Image source={image} style={{ width: image.width / 2, height: image.height / 2 }} />;
    }
    

## Classes

### `ImageRef`

Android

iOS

tvOS

Web

Type: Class extends
`[SharedRef](/versions/v54.0.0/sdk/expo#sharedreftype)<'image'>`

An object that is a reference to a native image instance –
[Drawable](https://developer.android.com/reference/android/graphics/drawable/Drawable)
on Android and
[UIImage](https://developer.apple.com/documentation/uikit/uiimage) on iOS.
Instances of this class can be passed as a source to the Image component in
which case the image is rendered immediately since its native representation
is already available in the memory.

ImageRef Properties

### `height`

Android

iOS

tvOS

Web

Read Only • Type: `number`

Logical height of the image. Multiply it by the value in the `scale` property
to get the height in pixels.

### `isAnimated`

Android

iOS

tvOS

Web

Optional • Read Only • Type: `boolean`

Whether the referenced image is an animated image.

### `mediaType`

iOS

Read Only • Literal type: `union`

Media type (also known as MIME type) of the image, based on its format.
Returns `null` when the format is unknown or not supported.

Acceptable values are: `null` | `string`

### `nativeRefType`

Android

iOS

tvOS

Web

Type: `string`

The type of the native reference.

### `scale`

Android

iOS

tvOS

Web

Read Only • Type: `number`

On iOS, if you load an image from a file whose name includes the `@2x`
modifier, the scale is set to 2.0. All other images are assumed to have a
scale factor of 1.0. On Android, it calculates the scale based on the bitmap
density divided by screen density.

On all platforms, if you multiply the logical size of the image by this value,
you get the dimensions of the image in pixels.

### `width`

Android

iOS

tvOS

Web

Read Only • Type: `number`

Logical width of the image. Multiply it by the value in the `scale` property
to get the width in pixels.

## Types

### `ImageContentPosition`

Android

iOS

tvOS

Web

Specifies the position of the image inside its container. One value controls
the x-axis and the second value controls the y-axis.

Additionally, it supports stringified shorthand form that specifies the edges
to which to align the image content:  
`'center'`, `'top'`, `'right'`, `'bottom'`, `'left'`, `'top center'`, `'top
right'`, `'top left'`, `'right center'`, `'right top'`, `'right bottom'`,
`'bottom center'`, `'bottom right'`, `'bottom left'`, `'left center'`, `'left
top'`, `'left bottom'`.  
If only one keyword is provided, then the other dimension is set to `'center'`
(`'50%'`), so the image is placed in the middle of the specified edge.  
As an example, `'top right'` is the same as `{ top: 0, right: 0 }` and
`'bottom'` is the same as `{ bottom: 0, left: '50%' }`.

Type: `ImageContentPositionString` or `object` shaped as below:

Property| Type| Description  
---|---|---  
right(optional)| `ImageContentPositionValue`| -  
top(optional)| `ImageContentPositionValue`| -  
  
Or `object` shaped as below:

Property| Type| Description  
---|---|---  
left(optional)| `ImageContentPositionValue`| -  
top(optional)| `ImageContentPositionValue`| -  
  
Or `object` shaped as below:

Property| Type| Description  
---|---|---  
bottom(optional)| `ImageContentPositionValue`| -  
right(optional)| `ImageContentPositionValue`| -  
  
Or `object` shaped as below:

Property| Type| Description  
---|---|---  
bottom(optional)| `ImageContentPositionValue`| -  
left(optional)| `ImageContentPositionValue`| -  
  
### `ImageContentPositionValue`

Android

iOS

tvOS

Web

Literal Type: `union`

A value that represents the relative position of a single axis.

If `number`, it is a distance in points (logical pixels) from the respective
edge.  
If `string`, it must be a percentage value where `'100%'` is the difference in
size between the container and the image along the respective axis, or
`'center'` which is an alias for `'50%'` that is the default value. You can
read more regarding percentages on the MDN docs for [`background-
position`](https://developer.mozilla.org/en-US/docs/Web/CSS/background-
position#regarding_percentages) that describes this concept well.

Acceptable values are: `number` | `string` | `{number}%` | `{number}` | `'center'`

### `ImageErrorEventData`

Android

iOS

tvOS

Web

Property| Type| Description  
---|---|---  
error| `string`| -  
  
### `ImageLoadEventData`

Android

iOS

tvOS

Web

Property| Type| Description  
---|---|---  
cacheType| `'none' | 'disk' | 'memory'`| -  
source| `{  height: number,  isAnimated: boolean,  mediaType: string | null,  url: string,  width: number }`| -  
  
### `ImageLoadOptions`

Android

iOS

tvOS

Web

An object with options for the `useImage` hook.

Property| Type| Description  
---|---|---  
maxHeight(optional)| `number`| Only for: iOS  
If provided, the image will be automatically resized to not exceed this height
in pixels, preserving its aspect ratio.  
maxWidth(optional)| `number`| Only for: iOS  
If provided, the image will be automatically resized to not exceed this width
in pixels, preserving its aspect ratio.  
onError(optional)| `(error: [Error](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Error), retry: () => void) =>
void`| Function to call when the image has failed to load. In addition to the
error, it also provides a function that retries loading the image.  
  
### `ImagePrefetchOptions`

Android

iOS

tvOS

Web

Property| Type| Description  
---|---|---  
cachePolicy(optional)| `'disk' | 'memory-disk' | 'memory'`| The cache policy for prefetched images.Default:`'memory-disk'`  
headers(optional)| `Record<string, string>`| A map of headers to use when
prefetching the images.  
  
### `ImageProgressEventData`

Android

iOS

tvOS

Web

Property| Type| Description  
---|---|---  
loaded| `number`| -  
total| `number`| -  
  
### `ImageSource`

Android

iOS

tvOS

Web

Property| Type| Description  
---|---|---  
blurhash(optional)| `string`| A string used to generate the image
`placeholder`. For example, `placeholder={blurhash}`. If `uri` is provided as
the value of the `source` prop, this is ignored since the `source` can only
have `blurhash` or `uri`. When using the blurhash, you should also provide
`width` and `height` (higher values reduce performance), otherwise their
default value is `16`. For more information, see
[`woltapp/blurhash`](https://github.com/woltapp/blurhash) repository.  
cacheKey(optional)| `string`| The cache key used to query and store this
specific image. If not provided, the `uri` is used also as the cache key.  
headers(optional)| `Record<string, string>`| An object representing the HTTP
headers to send along with the request for a remote image. On web requires the
`Access-Control-Allow-Origin` header returned by the server to include the
current domain.  
height(optional)| `number | null`| Can be specified if known at build time, in which case the value will be used to set the default `<Image/>` component dimension.  
isAnimated(optional)| `boolean`| Only for: AndroidiOS  
Whether the image is animated (an animated GIF or WebP for example).  
thumbhash(optional)| `string`| A string used to generate the image
`placeholder`. For example, `placeholder={thumbhash}`. If `uri` is provided as
the value of the `source` prop, this is ignored since the `source` can only
have `thumbhash` or `uri`. For more information, see [`thumbhash
website`](https://evanw.github.io/thumbhash/).  
uri(optional)| `string`| A string representing the resource identifier for the
image, which could be an HTTPS address, a local file path, or the name of a
static image resource.  
webMaxViewportWidth(optional)| `number`| Only for: Web  
The max width of the viewport for which this source should be selected. Has no
effect if `source` prop is not an array or has only 1 element. Has no effect
if `responsivePolicy` is not set to `static`. Ignored if `blurhash` or
`thumbhash` is provided (image hashes are never selected if passed in an
array).  
width(optional)| `number | null`| Can be specified if known at build time, in which case the value will be used to set the default `<Image/>` component dimension.  
  
### `ImageTransition`

Android

iOS

tvOS

Web

An object that describes the smooth transition when switching the image
source.

Property| Type| Description  
---|---|---  
duration(optional)| `number`| The duration of the transition in
milliseconds.Default:`0`  
effect(optional)| `'cross-dissolve' | 'flip-from-top' | 'flip-from-right' | 'flip-from-bottom' | 'flip-from-left' | 'curl-up' | 'curl-down' | null`| An animation effect used for transition.Default:`'cross-dissolve' On Android, only `'cross-dissolve'` is supported. On Web, `'curl-up'` and `'curl-down'` effects are not supported.`  
timing(optional)| `'ease-in-out' | 'ease-in' | 'ease-out' | 'linear'`| Specifies the speed curve of the transition effect and how intermediate values are calculated.Default:`'ease-in-out'`  
  
## Generating a blurhash on a server

Images can significantly improve the visual experience, however, they can also
slow down app/page loading times due to their large file sizes. To overcome
this, you can create placeholder images using blurhash algorithm that provides
an immersive experience while deferring the loading of the actual picture
until later.

This guide demonstrates how to create a blurhash of an uploaded image on the
backend using JavaScript and Express.js. The same techniques and principles
apply to other languages and server technologies.

Start by installing a few dependencies:
[`multer`](https://github.com/expressjs/multer) for handling multipart
requests, [`sharp`](https://github.com/lovell/sharp) for converting files to a
data buffer, and the official [`blurhash` JavaScript
package](https://github.com/woltapp/blurhash/tree/master/TypeScript).

Terminal

Copy

`- ``npm install multer sharp blurhash`

Next, import all required functions from installed packages and initialize
`multer`:

    
    
    // Multer is a middleware for handling `multipart/form-data`.
    const multer = require('multer');
    // Sharp allows you to receive a data buffer from the uploaded image.
    const sharp = require('sharp');
    // Import the encode function from the blurhash package.
    const { encode } = require('blurhash');
    
    // Initialize `multer`.
    const upload = multer();
    

Assuming the `app` is a variable that holds a reference to the Express server,
an endpoint can be created that accepts an image and returns a JSON response
containing the generated blurhash.

    
    
    app.post('/blurhash', upload.single('image'), async (req, res) => {
      const { file } = req;
      // If the file is not available we're returning with error.
      if (file === null) {
        res.status(400).json({ message: 'Image is missing' });
        return;
      }
    
      // Users can specify number of components in each axes.
      const componentX = req.body.componentX ?? 4;
      const componentY = req.body.componentY ?? 3;
    
      // We're converting provided image to a byte buffer.
      // Sharp currently supports multiple common formats like JPEG, PNG, WebP, GIF, and AVIF.
      const { data, info } = await sharp(file.buffer).ensureAlpha().raw().toBuffer({
        resolveWithObject: true,
      });
    
      const blurhash = encode(
        new Uint8ClampedArray(data),
        info.width,
        info.height,
        componentX,
        componentY
      );
      res.json({ blurhash });
    });
    

Additionally, the request can include two parameters: `componentX` and
`componentY`, are passed through the algorithm. These values can be calculated
or hard-coded on the server or specified by the user. However, they must be
within the range of 1 to 9 and have an aspect ratio similar to the uploaded
image. A value of 9 will give the best results but may take longer to generate
the hash.

The process of generating a blurhash can be accomplished in various languages
and server technologies, similar to the one using JavaScript. The key step is
to locate an encoder for your chosen language, which can often be found in the
[`woltapp/blurhash`](https://github.com/woltapp/blurhash#implementations)
repository. Once you have the encoder, you will need to obtain a
representation of the image. Some libraries use a default image class (for
example, the Swift implementation uses `UIImage`). In other cases, you will
have to provide raw byte data. Make sure to check the encoder's documentation
to confirm the expected data format.

> When working with raw byte data, ensure that the alpha layer is present
> (each pixel is represented by red, green, blue, and alpha values). Failing
> to do so will lead to errors such as "width and height must match the pixels
> array".

