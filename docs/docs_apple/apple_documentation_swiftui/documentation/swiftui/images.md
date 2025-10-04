Collection

  * [ SwiftUI ](/documentation/swiftui)
  * Images 

API Collection

# Images

Add images and symbols to your app’s user interface.

## [Overview](/documentation/swiftui/images#Overview)

Display images, including [SF Symbols](/design/Human-Interface-Guidelines/sf-
symbols), images that you store in an asset catalog, and images that you store
on disk, using an [`Image`](/documentation/swiftui/image) view.

For images that take time to retrieve — for example, when you load an image
from a network endpoint — load the image asynchronously using
[`AsyncImage`](/documentation/swiftui/asyncimage). You can instruct that view
to display a placeholder during the load operation.

For design guidance, see [Images](/design/Human-Interface-Guidelines/images)
in the Human Interface Guidelines.

## [Topics](/documentation/swiftui/images#topics)

### [Creating an image](/documentation/swiftui/images#Creating-an-image)

[`struct Image`](/documentation/swiftui/image)

A view that displays an image.

### [Configuring an image](/documentation/swiftui/images#Configuring-an-image)

[Fitting images into available space](/documentation/swiftui/fitting-images-
into-available-space)

Adjust the size and shape of images in your app’s user interface by applying
view modifiers.

[`func imageScale(Image.Scale) -> some
View`](/documentation/swiftui/view/imagescale\(_:\))

Scales images within the view according to one of the relative sizes available
including small, medium, and large images sizes.

[`var imageScale:
Image.Scale`](/documentation/swiftui/environmentvalues/imagescale)

The image scale for this environment.

[`enum Scale`](/documentation/swiftui/image/scale)

A scale to apply to vector images relative to text.

[`enum Orientation`](/documentation/swiftui/image/orientation)

The orientation of an image.

[`enum ResizingMode`](/documentation/swiftui/image/resizingmode)

The modes that SwiftUI uses to resize an image to fit within its containing
view.

### [Loading images asynchronously](/documentation/swiftui/images#Loading-
images-asynchronously)

[`struct AsyncImage`](/documentation/swiftui/asyncimage)

A view that asynchronously loads and displays an image.

[`enum AsyncImagePhase`](/documentation/swiftui/asyncimagephase)

The current phase of the asynchronous image loading operation.

### [Setting a symbol variant](/documentation/swiftui/images#Setting-a-symbol-
variant)

[`func symbolVariant(SymbolVariants) -> some
View`](/documentation/swiftui/view/symbolvariant\(_:\))

Makes symbols within the view show a particular variant.

[`var symbolVariants:
SymbolVariants`](/documentation/swiftui/environmentvalues/symbolvariants)

The symbol variant to use in this environment.

[`struct SymbolVariants`](/documentation/swiftui/symbolvariants)

A variant of a symbol.

### [Managing symbol effects](/documentation/swiftui/images#Managing-symbol-
effects)

[`func symbolEffect<T>(T, options: SymbolEffectOptions, isActive: Bool) ->
some View`](/documentation/swiftui/view/symboleffect\(_:options:isactive:\))

Returns a new view with a symbol effect added to it.

[`func symbolEffect<T, U>(T, options: SymbolEffectOptions, value: U) -> some
View`](/documentation/swiftui/view/symboleffect\(_:options:value:\))

Returns a new view with a symbol effect added to it.

[`func symbolEffectsRemoved(Bool) -> some
View`](/documentation/swiftui/view/symboleffectsremoved\(_:\))

Returns a new view with its inherited symbol image effects either removed or
left unchanged.

[`struct
SymbolEffectTransition`](/documentation/swiftui/symboleffecttransition)

Creates a transition that applies the Appear, Disappear, DrawOn or DrawOff
symbol animation to symbol images within the inserted or removed view
hierarchy.

### [Setting symbol rendering modes](/documentation/swiftui/images#Setting-
symbol-rendering-modes)

[`func symbolRenderingMode(SymbolRenderingMode?) -> some
View`](/documentation/swiftui/view/symbolrenderingmode\(_:\))

Sets the rendering mode for symbol images within this view.

[`var symbolRenderingMode:
SymbolRenderingMode?`](/documentation/swiftui/environmentvalues/symbolrenderingmode)

The current symbol rendering mode, or `nil` denoting that the mode is picked
automatically using the current image and foreground style as parameters.

[`struct SymbolRenderingMode`](/documentation/swiftui/symbolrenderingmode)

A symbol rendering mode.

[`struct
SymbolColorRenderingMode`](/documentation/swiftui/symbolcolorrenderingmode)

A method of filling a layer in a symbol image.

[`struct
SymbolVariableValueMode`](/documentation/swiftui/symbolvariablevaluemode)

A method of rendering the variable value of a symbol image.

### [Rendering images from views](/documentation/swiftui/images#Rendering-
images-from-views)

[`class ImageRenderer`](/documentation/swiftui/imagerenderer)

An object that creates images from SwiftUI views.

## [See Also](/documentation/swiftui/images#see-also)

### [Views](/documentation/swiftui/images#Views)

[API ReferenceView fundamentals](/documentation/swiftui/view-fundamentals)

Define the visual elements of your app using a hierarchy of views.

[API ReferenceView configuration](/documentation/swiftui/view-configuration)

Adjust the characteristics of views in a hierarchy.

[API ReferenceView styles](/documentation/swiftui/view-styles)

Apply built-in and custom appearances and behaviors to different types of
views.

[API ReferenceAnimations](/documentation/swiftui/animations)

Create smooth visual updates in response to state changes.

[API ReferenceText input and output](/documentation/swiftui/text-input-and-
output)

Display formatted text and get text input from the user.

[API ReferenceControls and indicators](/documentation/swiftui/controls-and-
indicators)

Display values and get user selections.

[API ReferenceMenus and commands](/documentation/swiftui/menus-and-commands)

Provide space-efficient, context-dependent access to commands and controls.

[API ReferenceShapes](/documentation/swiftui/shapes)

Trace and fill built-in and custom shapes with a color, gradient, or other
pattern.

[API ReferenceDrawing and graphics](/documentation/swiftui/drawing-and-
graphics)

Enhance your views with graphical effects and customized drawings.

