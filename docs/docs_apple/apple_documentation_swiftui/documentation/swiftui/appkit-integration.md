Collection

  * [ SwiftUI ](/documentation/swiftui)
  * AppKit integration 

API Collection

# AppKit integration

Add AppKit views to your SwiftUI app, or use SwiftUI views in your AppKit app.

## [Overview](/documentation/swiftui/appkit-integration#Overview)

Integrate SwiftUI with your app’s existing content using hosting controllers
to add SwiftUI views into AppKit interfaces. A hosting controller wraps a set
of SwiftUI views in a form that you can then add to your storyboard-based app.

You can also add AppKit views and view controllers to your SwiftUI interfaces.
A representable object wraps the designated view or view controller, and
facilitates communication between the wrapped object and your SwiftUI views.

For design guidance, see [Designing for macOS](/design/Human-Interface-
Guidelines/designing-for-macos) in the Human Interface Guidelines.

## [Topics](/documentation/swiftui/appkit-integration#topics)

### [Displaying SwiftUI views in AppKit](/documentation/swiftui/appkit-
integration#Displaying-SwiftUI-views-in-AppKit)

[Unifying your app’s animations](/documentation/swiftui/unifying-your-app-s-
animations)

Create a consistent UI animation experience across SwiftUI, UIKit, and AppKit.

[`class NSHostingController`](/documentation/swiftui/nshostingcontroller)

An AppKit view controller that hosts SwiftUI view hierarchy.

[`class NSHostingView`](/documentation/swiftui/nshostingview)

An AppKit view that hosts a SwiftUI view hierarchy.

[`class NSHostingMenu`](/documentation/swiftui/nshostingmenu)

An AppKit menu with menu items that are defined by a SwiftUI View.

[`struct
NSHostingSizingOptions`](/documentation/swiftui/nshostingsizingoptions)

Options for how hosting views and controllers reflect their content’s size
into Auto Layout constraints.

[`class
NSHostingSceneRepresentation`](/documentation/swiftui/nshostingscenerepresentation)

An AppKit type that hosts and can present SwiftUI scenes

[`struct
NSHostingSceneBridgingOptions`](/documentation/swiftui/nshostingscenebridgingoptions)

Options for how hosting views and controllers manage aspects of the associated
window.

### [Adding AppKit views to SwiftUI view
hierarchies](/documentation/swiftui/appkit-integration#Adding-AppKit-views-to-
SwiftUI-view-hierarchies)

[`protocol NSViewRepresentable`](/documentation/swiftui/nsviewrepresentable)

A wrapper that you use to integrate an AppKit view into your SwiftUI view
hierarchy.

[`struct
NSViewRepresentableContext`](/documentation/swiftui/nsviewrepresentablecontext)

Contextual information about the state of the system that you use to create
and update your AppKit view.

[`protocol
NSViewControllerRepresentable`](/documentation/swiftui/nsviewcontrollerrepresentable)

A wrapper that you use to integrate an AppKit view controller into your
SwiftUI interface.

[`struct
NSViewControllerRepresentableContext`](/documentation/swiftui/nsviewcontrollerrepresentablecontext)

Contextual information about the state of the system that you use to create
and update your AppKit view controller.

### [Adding AppKit gesture recognizers into SwiftUI view
hierarchies](/documentation/swiftui/appkit-integration#Adding-AppKit-gesture-
recognizers-into-SwiftUI-view-hierarchies)

[`protocol
NSGestureRecognizerRepresentable`](/documentation/swiftui/nsgesturerecognizerrepresentable)

A wrapper for an `NSGestureRecognizer` that you use to integrate that gesture
recognizer into your SwiftUI hierarchy.

[`struct
NSGestureRecognizerRepresentableContext`](/documentation/swiftui/nsgesturerecognizerrepresentablecontext)

Contextual information about the state of the system that you use to create
and update a represented gesture recognizer.

[`struct
NSGestureRecognizerRepresentableCoordinateSpaceConverter`](/documentation/swiftui/nsgesturerecognizerrepresentablecoordinatespaceconverter)

A structure used to convert locations to and from coordinate spaces in the
hierarchy of the SwiftUI view associated with an
[`NSGestureRecognizerRepresentable`](/documentation/swiftui/nsgesturerecognizerrepresentable).

## [See Also](/documentation/swiftui/appkit-integration#see-also)

### [Framework integration](/documentation/swiftui/appkit-
integration#Framework-integration)

[API ReferenceUIKit integration](/documentation/swiftui/uikit-integration)

Add UIKit views to your SwiftUI app, or use SwiftUI views in your UIKit app.

[API ReferenceWatchKit integration](/documentation/swiftui/watchkit-
integration)

Add WatchKit views to your SwiftUI app, or use SwiftUI views in your WatchKit
app.

[API ReferenceTechnology-specific views](/documentation/swiftui/technology-
specific-views)

Use SwiftUI views that other Apple frameworks provide.

