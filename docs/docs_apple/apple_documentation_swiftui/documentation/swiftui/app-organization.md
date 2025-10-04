Collection

  * [ SwiftUI ](/documentation/swiftui)
  * App organization 

API Collection

# App organization

Define the entry point and top-level structure of your app.

## [Overview](/documentation/swiftui/app-organization#Overview)

Describe your app’s structure declaratively, much like you declare a view’s
appearance. Create a type that conforms to the
[`App`](/documentation/swiftui/app) protocol and use it to enumerate the
[Scenes](/documentation/swiftui/scenes) that represent aspects of your app’s
user interface.

SwiftUI enables you to write code that works across all of Apple’s platforms.
However, it also enables you to tailor your app to the specific capabilities
of each platform. For example, if you need to respond to the callbacks that
the system traditionally makes on a UIKit, AppKit, or WatchKit app’s delegate,
define a delegate object and instantiate it in your app structure using an
appropriate delegate adaptor property wrapper, like
[`UIApplicationDelegateAdaptor`](/documentation/swiftui/uiapplicationdelegateadaptor).

For platform-specific design guidance, see [Getting started](/design/Human-
Interface-Guidelines/getting-started) in the Human Interface Guidelines.

## [Topics](/documentation/swiftui/app-organization#topics)

### [Creating an app](/documentation/swiftui/app-organization#Creating-an-app)

[Destination Video](/documentation/visionOS/destination-video)

Leverage SwiftUI to build an immersive media experience in a multiplatform
app.

[Hello World](/documentation/visionOS/World)

Use windows, volumes, and immersive spaces to teach people about the Earth.

[Backyard Birds: Building an app with SwiftData and
widgets](/documentation/swiftui/backyard-birds-sample)

Create an app with persistent data, interactive widgets, and an all new in-app
purchase experience.

[Food Truck: Building a SwiftUI multiplatform
app](/documentation/swiftui/food_truck_building_a_swiftui_multiplatform_app)

Create a single codebase and app target for Mac, iPad, and iPhone.

[Fruta: Building a Feature-Rich App with
SwiftUI](/documentation/appclip/fruta_building_a_feature-
rich_app_with_swiftui)

Create a shared codebase to build a multiplatform app that offers widgets and
an App Clip.

[Migrating to the SwiftUI life cycle](/documentation/swiftui/migrating-to-the-
swiftui-life-cycle)

Use a scene-based life cycle in SwiftUI while keeping your existing codebase.

[`protocol App`](/documentation/swiftui/app)

A type that represents the structure and behavior of an app.

### [Targeting iOS and iPadOS](/documentation/swiftui/app-
organization#Targeting-iOS-and-iPadOS)

[`UILaunchScreen`](/documentation/BundleResources/Information-Property-
List/UILaunchScreen)

The user interface to show while an app launches.

[`UILaunchScreens`](/documentation/BundleResources/Information-Property-
List/UILaunchScreens)

The user interfaces to show while an app launches in response to different URL
schemes.

[`struct
UIApplicationDelegateAdaptor`](/documentation/swiftui/uiapplicationdelegateadaptor)

A property wrapper type that you use to create a UIKit app delegate.

### [Targeting macOS](/documentation/swiftui/app-organization#Targeting-macOS)

[`struct
NSApplicationDelegateAdaptor`](/documentation/swiftui/nsapplicationdelegateadaptor)

A property wrapper type that you use to create an AppKit app delegate.

### [Targeting watchOS](/documentation/swiftui/app-organization#Targeting-
watchOS)

[`struct
WKApplicationDelegateAdaptor`](/documentation/swiftui/wkapplicationdelegateadaptor)

A property wrapper that is used in `App` to provide a delegate from WatchKit.

[`struct
WKExtensionDelegateAdaptor`](/documentation/swiftui/wkextensiondelegateadaptor)

A property wrapper type that you use to create a WatchKit extension delegate.

### [Targeting tvOS](/documentation/swiftui/app-organization#Targeting-tvOS)

[Creating a tvOS media catalog app in
SwiftUI](/documentation/swiftui/creating-a-tvos-media-catalog-app-in-swiftui)

Build standard content lockups and rows of content shelves for your tvOS app.

### [Handling system recenter events](/documentation/swiftui/app-
organization#Handling-system-recenter-events)

[`enum WorldRecenterPhase`](/documentation/swiftui/worldrecenterphase)

A type that represents information associated with a phase of a system
recenter event. Values of this type are passed to the closure specified in
View.onWorldRecenter(action:).

## [See Also](/documentation/swiftui/app-organization#see-also)

### [App structure](/documentation/swiftui/app-organization#App-structure)

[API ReferenceScenes](/documentation/swiftui/scenes)

Declare the user interface groupings that make up the parts of your app.

[API ReferenceWindows](/documentation/swiftui/windows)

Display user interface content in a window or a collection of windows.

[API ReferenceImmersive spaces](/documentation/swiftui/immersive-spaces)

Display unbounded content in a person’s surroundings.

[API ReferenceDocuments](/documentation/swiftui/documents)

Enable people to open and manage documents.

[API ReferenceNavigation](/documentation/swiftui/navigation)

Enable people to move between different parts of your app’s view hierarchy
within a scene.

[API ReferenceModal presentations](/documentation/swiftui/modal-presentations)

Present content in a separate view that offers focused interaction.

[API ReferenceToolbars](/documentation/swiftui/toolbars)

Provide immediate access to frequently used commands and controls.

[API ReferenceSearch](/documentation/swiftui/search)

Enable people to search for text or other content within your app.

[API ReferenceApp extensions](/documentation/swiftui/app-extensions)

Extend your app’s basic functionality to other parts of the system, like by
adding a Widget.

