Collection

  * [ SwiftUI ](/documentation/swiftui)
  * Previews in Xcode 

API Collection

# Previews in Xcode

Generate dynamic, interactive previews of your custom views.

## [Overview](/documentation/swiftui/previews-in-xcode#Overview)

When you create a custom [`View`](/documentation/swiftui/view) with SwiftUI,
Xcode can display a preview of the view’s content that stays up-to-date as you
make changes to the view’s code. You use one of the preview macros — like
[`Preview(_:body:)`](/documentation/swiftui/preview\(_:body:\)) — to tell
Xcode what to display. Xcode shows the preview in a canvas beside your code.

Different preview macros enable different kinds of configuration. For example,
you can add traits that affect the preview’s appearance using the
[`Preview(_:traits:_:body:)`](/documentation/swiftui/preview\(_:traits:_:body:\))
macro or add custom viewpoints for the preview using the
[`Preview(_:traits:body:cameras:)`](/documentation/swiftui/preview\(_:traits:body:cameras:\))
macro. You can also check how your view behaves inside a specific scene type.
For example, in visionOS you can use the
[`Preview(_:immersionStyle:traits:body:)`](/documentation/swiftui/preview\(_:immersionstyle:traits:body:\))
macro to preview your view inside an
[`ImmersiveSpace`](/documentation/swiftui/immersivespace).

You typically rely on preview macros to create previews in your code. However,
if you can’t get the behavior you need using a preview macro, you can use the
[`PreviewProvider`](/documentation/swiftui/previewprovider) protocol and its
associated supporting types to define and configure a preview.

## [Topics](/documentation/swiftui/previews-in-xcode#topics)

### [Essentials](/documentation/swiftui/previews-in-xcode#Essentials)

[Previewing your app’s interface in Xcode](/documentation/Xcode/previewing-
your-apps-interface-in-xcode)

Iterate designs quickly and preview your apps’ displays across different Apple
devices.

### [Creating a preview](/documentation/swiftui/previews-in-xcode#Creating-a-
preview)

[`macro Preview(String?, body: () -> any
View)`](/documentation/swiftui/preview\(_:body:\))

Creates a preview of a SwiftUI view.

[`macro Preview(String?, traits: PreviewTrait<Preview.ViewTraits>,
PreviewTrait<Preview.ViewTraits>..., body: () -> any
View)`](/documentation/swiftui/preview\(_:traits:_:body:\))

Creates a preview of a SwiftUI view using the specified traits.

[`macro Preview(String?, traits: PreviewTrait<Preview.ViewTraits>..., body: ()
-> any View, cameras: () ->
[PreviewCamera])`](/documentation/swiftui/preview\(_:traits:body:cameras:\))

Creates a preview of a SwiftUI view using the specified traits and custom
viewpoints.

### [Creating a preview in the context of a
scene](/documentation/swiftui/previews-in-xcode#Creating-a-preview-in-the-
context-of-a-scene)

[`macro Preview<Style>(String?, immersionStyle: Style, traits:
PreviewTrait<Preview.ViewTraits>..., body: () -> any
View)`](/documentation/swiftui/preview\(_:immersionstyle:traits:body:\))

Creates a preview of a SwiftUI view in an immersive space.

[`macro Preview<Style>(String?, immersionStyle: Style, traits:
PreviewTrait<Preview.ViewTraits>..., body: () -> any View, cameras: () ->
[PreviewCamera])`](/documentation/swiftui/preview\(_:immersionstyle:traits:body:cameras:\))

Creates a preview of a SwiftUI view in an immersive space with custom
viewpoints.

[`macro Preview<Style>(String?, windowStyle: Style, traits:
PreviewTrait<Preview.ViewTraits>..., body: () -> any
View)`](/documentation/swiftui/preview\(_:windowstyle:traits:body:\))

Creates a preview of a SwiftUI view in a window.

[`macro Preview<Style>(String?, windowStyle: Style, traits:
PreviewTrait<Preview.ViewTraits>..., body: () -> any View, cameras: () ->
[PreviewCamera])`](/documentation/swiftui/preview\(_:windowstyle:traits:body:cameras:\))

Creates a preview of a SwiftUI view in a window with custom viewpoints.

### [Defining a preview](/documentation/swiftui/previews-in-xcode#Defining-a-
preview)

[`macro Previewable()`](/documentation/swiftui/previewable\(\))

Tag allowing a dynamic property to appear inline in a preview.

[`protocol PreviewProvider`](/documentation/swiftui/previewprovider)

A type that produces view previews in Xcode.

[`enum PreviewPlatform`](/documentation/swiftui/previewplatform)

Platforms that can run the preview.

[`func previewDisplayName(String?) -> some
View`](/documentation/swiftui/view/previewdisplayname\(_:\))

Sets a user visible name to show in the canvas for a preview.

[`protocol PreviewModifier`](/documentation/swiftui/previewmodifier)

A type that defines an environment in which previews can appear.

[`struct
PreviewModifierContent`](/documentation/swiftui/previewmodifiercontent)

The type-erased content of a preview.

### [Customizing a preview](/documentation/swiftui/previews-in-
xcode#Customizing-a-preview)

[`func previewDevice(PreviewDevice?) -> some
View`](/documentation/swiftui/view/previewdevice\(_:\))

Overrides the device for a preview.

[`struct PreviewDevice`](/documentation/swiftui/previewdevice)

A simulator device that runs a preview.

[`func previewLayout(PreviewLayout) -> some
View`](/documentation/swiftui/view/previewlayout\(_:\))

Overrides the size of the container for the preview.

[`func previewInterfaceOrientation(InterfaceOrientation) -> some
View`](/documentation/swiftui/view/previewinterfaceorientation\(_:\))

Overrides the orientation of the preview.

[`struct InterfaceOrientation`](/documentation/swiftui/interfaceorientation)

The orientation of the interface from the user’s perspective.

### [Setting a context](/documentation/swiftui/previews-in-xcode#Setting-a-
context)

[`func previewContext<C>(C) -> some
View`](/documentation/swiftui/view/previewcontext\(_:\))

Declares a context for the preview.

[`protocol PreviewContext`](/documentation/swiftui/previewcontext)

A context type for use with a preview.

[`protocol PreviewContextKey`](/documentation/swiftui/previewcontextkey)

A key type for a preview context.

### [Building in debug mode](/documentation/swiftui/previews-in-
xcode#Building-in-debug-mode)

[`struct DebugReplaceableView`](/documentation/swiftui/debugreplaceableview)

Erases view opaque result types in debug builds.

## [See Also](/documentation/swiftui/previews-in-xcode#see-also)

### [Tool support](/documentation/swiftui/previews-in-xcode#Tool-support)

[API ReferenceXcode library customization](/documentation/swiftui/xcode-
library-customization)

Expose custom views and modifiers in the Xcode library.

[API ReferencePerformance analysis](/documentation/swiftui/performance-
analysis)

Measure and improve your app’s responsiveness.

