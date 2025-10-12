# Image views

An image view displays a single image — or in some cases, an animated sequence
of images — on a transparent or opaque background.

Within an image view, you can stretch, scale, size to fit, or pin the image to
a specific location. Image views are typically not interactive.

## [Best practices](/design/human-interface-guidelines/image-views#Best-
practices)

**Use an image view when the primary purpose of the view is simply to display
an image.** In rare cases where you might want an image to be interactive,
configure a system-provided [button](https://developer.apple.com/design/human-
interface-guidelines/buttons) to display the image instead of adding button
behaviors to an image view.

**If you want to display an icon in your interface, consider using a symbol or
interface icon instead of an image view.** [SF Symbols](/design/human-
interface-guidelines/sf-symbols) provides a large library of streamlined,
vector-based images that you can render with various colors and opacities. An
[icon](https://developer.apple.com/design/human-interface-guidelines/icons)
(also called a glyph or template image) is typically a bitmap image in which
the nontransparent pixels can receive color. Both symbols and interface icons
can use the accent colors people choose.

## [Content](/design/human-interface-guidelines/image-views#Content)

An image view can contain rich image data in various formats, like PNG, JPEG,
and PDF. For more guidance, see [Images](/design/human-interface-
guidelines/images).

**Take care when overlaying text on images.** Compositing text on top of
images can decrease both the clarity of the image and the legibility of the
text. To help improve the results, ensure the text contrasts well with the
image, and consider ways to make the text object stand out, like adding a text
shadow or background layer.

**Aim to use a consistent size for all images in an animated sequence.** When
you prescale images to fit the view, the system doesn’t have to perform any
scaling. In cases where the system must do the scaling, performance is
generally better when all images are the same size and shape.

## [Platform considerations](/design/human-interface-guidelines/image-
views#Platform-considerations)

 _No additional considerations for iOS or iPadOS._

### [macOS](/design/human-interface-guidelines/image-views#macOS)

**If your app needs an editable image view, use an image well.** An [image
well](https://developer.apple.com/design/human-interface-guidelines/image-
wells) is an image view that supports copying, pasting, dragging, and using
the Delete key to clear its content.

**Use an image button instead of an image view to make a clickable image.** An
[image button](https://developer.apple.com/design/human-interface-
guidelines/buttons#Image-buttons) contains an image or icon, appears in a
view, and initiates an instantaneous app-specific action.

### [tvOS](/design/human-interface-guidelines/image-views#tvOS)

Many tvOS images combine multiple layers with transparency to create a feeling
of depth. For guidance, see [Layered images](/design/human-interface-
guidelines/images#Layered-images).

### [visionOS](/design/human-interface-guidelines/image-views#visionOS)

You can add the appearance of depth to image views in a standard window to
give your content more visual substance and improve the experience when people
view it from an angle. If you display 3D content in a standard window, the
system clips it when it extends too far from the window’s surface; for
guidance, see [Windows](/design/human-interface-guidelines/windows).

If you want to display true 3D content, use a volume; for guidance, see
[visionOS volumes](/design/human-interface-guidelines/windows#visionOS-
volumes).

### [watchOS](/design/human-interface-guidelines/image-views#watchOS)

**Use SwiftUI to create animations when possible.** Alternatively, you can use
WatchKit to animate a sequence of images within an image element if necessary.
For developer guidance, see
[`WKImageAnimatable`](/documentation/WatchKit/WKImageAnimatable).

## [Resources](/design/human-interface-guidelines/image-views#Resources)

#### [Related](/design/human-interface-guidelines/image-views#Related)

[Images](/design/human-interface-guidelines/images)

[Image wells](/design/human-interface-guidelines/image-wells)

[Image buttons](/design/human-interface-guidelines/buttons#Image-buttons)

[SF Symbols](/design/human-interface-guidelines/sf-symbols)

#### [Developer documentation](/design/human-interface-guidelines/image-
views#Developer-documentation)

[`Image`](/documentation/SwiftUI/Image) — SwiftUI

[`UIImageView`](/documentation/UIKit/UIImageView) — UIKit

[`NSImageView`](/documentation/AppKit/NSImageView) — AppKit

#### [Videos](/design/human-interface-guidelines/image-views#Videos)

[ Support HDR images in your app
](https://developer.apple.com/videos/play/wwdc2023/10181)

[ Add rich graphics to your SwiftUI app
](https://developer.apple.com/videos/play/wwdc2021/10021)

## [Change log](/design/human-interface-guidelines/image-views#Change-log)

Date| Changes  
---|---  
June 21, 2023| Updated to include guidance for visionOS.

