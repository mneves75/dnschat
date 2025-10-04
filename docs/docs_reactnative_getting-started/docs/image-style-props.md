On this page

# Image Style Props

## Examples​

### Image Resize Mode​

### Image Border​

### Image Border Radius​

### Image Tint​

# Reference

## Props​

### `backfaceVisibility`​

The property defines whether or not the back face of a rotated image should be
visible.

Type| Default  
---|---  
enum(`'visible'`, `'hidden'`)| `'visible'`  
  
* * *

### `backgroundColor`​

Type  
---  
[color](/docs/colors)  
  
* * *

### `borderBottomLeftRadius`​

Type  
---  
number  
  
* * *

### `borderBottomRightRadius`​

Type  
---  
number  
  
* * *

### `borderColor`​

Type  
---  
[color](/docs/colors)  
  
* * *

### `borderRadius`​

Type  
---  
number  
  
* * *

### `borderTopLeftRadius`​

Type  
---  
number  
  
* * *

### `borderTopRightRadius`​

Type  
---  
number  
  
* * *

### `borderWidth`​

Type  
---  
number  
  
* * *

### `opacity`​

Set an opacity value for the image. The number should be in the range from
`0.0` to `1.0`.

Type| Default  
---|---  
number| `1.0`  
  
* * *

### `overflow`​

Type| Default  
---|---  
enum(`'visible'`, `'hidden'`)| `'visible'`  
  
* * *

### `overlayColor`

Android

​

When the image has rounded corners, specifying an overlayColor will cause the
remaining space in the corners to be filled with a solid color. This is useful
in cases which are not supported by the Android implementation of rounded
corners:

  * Certain resize modes, such as `'contain'`
  * Animated GIFs

A typical way to use this prop is with images displayed on a solid background
and setting the `overlayColor` to the same color as the background.

For details of how this works under the hood, see [Fresco
documentation](https://frescolib.org/docs/rounded-corners-and-circles.html).

Type  
---  
string  
  
* * *

### `resizeMode`​

Determines how to resize the image when the frame doesn't match the raw image
dimensions. Defaults to `cover`.

  * `cover`: Scale the image uniformly (maintain the image's aspect ratio) so that:

    * Both dimensions (width and height) of the image will be equal to or larger than the corresponding dimension of the view (minus padding)
    * At least one dimension of the scaled image will be equal to the corresponding dimension of the view (minus padding)
  * `contain`: Scale the image uniformly (maintain the image's aspect ratio) so that both dimensions (width and height) of the image will be equal to or less than the corresponding dimension of the view (minus padding).

  * `stretch`: Scale width and height independently, This may change the aspect ratio of the src.

  * `repeat`: Repeat the image to cover the frame of the view. The image will keep its size and aspect ratio, unless it is larger than the view, in which case it will be scaled down uniformly so that it is contained in the view.

  * `center`: Center the image in the view along both dimensions. If the image is larger than the view, scale it down uniformly so that it is contained in the view.

Type| Default  
---|---  
enum(`'cover'`, `'contain'`, `'stretch'`, `'repeat'`, `'center'`)| `'cover'`  
  
* * *

### `objectFit`​

Determines how to resize the image when the frame doesn't match the raw image
dimensions.

Type| Default  
---|---  
enum(`'cover'`, `'contain'`, `'fill'`, `'scale-down'`)| `'cover'`  
  
* * *

### `tintColor`​

Changes the color of all the non-transparent pixels to the tintColor.

Type  
---  
[color](/docs/colors)  
  
[Edit page for next release](https://github.com/facebook/react-native-
website/edit/main/docs/image-style-props.md)[Edit page for current
release](https://github.com/facebook/react-native-
website/edit/main/website/versioned_docs/version-0.81/image-style-props.md)

Last updated on **Aug 20, 2025**

[ PreviousSafeAreaView](/docs/safeareaview)[NextLayout Props](/docs/layout-
props)

  * Examples
    * Image Resize Mode
    * Image Border
    * Image Border Radius
    * Image Tint
  * Props
    * `backfaceVisibility`
    * `backgroundColor`
    * `borderBottomLeftRadius`
    * `borderBottomRightRadius`
    * `borderColor`
    * `borderRadius`
    * `borderTopLeftRadius`
    * `borderTopRightRadius`
    * `borderWidth`
    * `opacity`
    * `overflow`
    * `overlayColor` Android
    * `resizeMode`
    * `objectFit`
    * `tintColor`

