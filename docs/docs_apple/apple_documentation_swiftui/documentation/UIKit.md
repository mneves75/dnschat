Framework

# UIKit

Construct and manage a graphical, event-driven user interface for your iOS,
iPadOS, or tvOS app.

iOS 2.0+iPadOS 2.0+Mac Catalyst 13.0+tvOS 9.0+visionOS 1.0+watchOS 2.0+

## [Overview](/documentation/UIKit#overview)

UIKit provides a variety of features for building apps, including components
you can use to construct the core infrastructure of your iOS, iPadOS, or tvOS
apps. The framework provides the window and view architecture for implementing
your UI, the event-handling infrastructure for delivering Multi-Touch and
other types of input to your app, and the main run loop for managing
interactions between the user, the system, and your app.

UIKit also includes support for animations, documents, drawing and printing,
text management and display, search, app extensions, resource management, and
getting information about the current device. You can also customize
accessibility support, and localize your app’s interface for different
languages, countries, or cultural regions.

UIKit works seamlessly with the [SwiftUI](/documentation/SwiftUI) framework,
so you can implement parts of your UIKit app in SwiftUI or mix interface
elements between the two frameworks. For example, you can place UIKit views
and view controllers inside SwiftUI views, and vice versa.

To build a macOS app, you can use [SwiftUI](/documentation/SwiftUI) to create
an app that works across all of Apple’s platforms, or use
[AppKit](/documentation/AppKit) to create an app for Mac only. Alternatively,
you can bring your UIKit iPad app to the Mac with [Mac
Catalyst](/documentation/uikit/mac-catalyst).

Important

Use UIKit classes only from your app’s main thread or main dispatch queue,
unless otherwise indicated in the documentation for those classes. This
restriction particularly applies to classes that derive from
[`UIResponder`](/documentation/uikit/uiresponder) or that involve manipulating
your app’s user interface in any way.

## [Topics](/documentation/UIKit#topics)

### [Essentials](/documentation/UIKit#Essentials)

[Adopting Liquid Glass](/documentation/TechnologyOverviews/adopting-liquid-
glass)

Find out how to bring the new material to your app.

[UIKit updates](/documentation/Updates/UIKit)

Learn about important changes to UIKit.

[About App Development with UIKit](/documentation/uikit/about-app-development-
with-uikit)

Learn about the basic support that UIKit and Xcode provide for your iOS and
tvOS apps.

[API ReferenceProtecting the User’s Privacy](/documentation/uikit/protecting-
the-user-s-privacy)

Secure personal data, and respect user preferences for how data is used.

### [App structure](/documentation/UIKit#App-structure)

UIKit manages your app’s interactions with the system and provides classes for
you to manage your app’s data and resources.

[API ReferenceApp and environment](/documentation/uikit/app-and-environment)

Manage life-cycle events and your app’s UI scenes, and get information about
traits and the environment in which your app runs.

[API ReferenceDocuments, data, and pasteboard](/documentation/uikit/documents-
data-and-pasteboard)

Organize your app’s data and share that data on the pasteboard.

[API ReferenceResource management](/documentation/uikit/resource-management)

Manage the images, strings, storyboards, and nib files that you use to
implement your app’s interface.

[API ReferenceApp extensions](/documentation/uikit/app-extensions)

Extend your app’s basic functionality to other parts of the system.

[API ReferenceInterprocess communication](/documentation/uikit/interprocess-
communication)

Display activity-based services to people.

[API ReferenceMac Catalyst](/documentation/uikit/mac-catalyst)

Create a version of your iPad app that users can run on a Mac device.

### [User interface](/documentation/UIKit#User-interface)

Views help you display content onscreen and facilitate user interactions; view
controllers help you manage views and the structure of your interface.

[API ReferenceViews and controls](/documentation/uikit/views-and-controls)

Present your content onscreen and define the interactions allowed with that
content.

[API ReferenceView controllers](/documentation/uikit/view-controllers)

Manage your interface using view controllers and facilitate navigation around
your app’s content.

[API ReferenceView layout](/documentation/uikit/view-layout)

Use stack views to lay out the views of your interface automatically. Use Auto
Layout when you require precise placement of your views.

[API ReferenceAppearance customization](/documentation/uikit/appearance-
customization)

Apply Liquid Glass to views, support Dark Mode in your app, customize the
appearance of bars, and use appearance proxies to modify your UI.

[API ReferenceAnimation and haptics](/documentation/uikit/animation-and-
haptics)

Provide feedback to users using view-based animations and haptics.

[API ReferenceWindows and screens](/documentation/uikit/windows-and-screens)

Provide a container for your view hierarchies and other content.

### [User interactions](/documentation/UIKit#User-interactions)

Responders and gesture recognizers help you handle touches and other events.
Drag and drop, focus, peek and pop, and accessibility handle other user
interactions.

[API ReferenceTouches, presses, and gestures](/documentation/uikit/touches-
presses-and-gestures)

Encapsulate your app’s event-handling logic in gesture recognizers so that you
can reuse that code throughout your app.

[API ReferenceMenus and shortcuts](/documentation/uikit/menus-and-shortcuts)

Simplify interactions with your app using menu systems, contextual menus, Home
Screen quick actions, and keyboard shortcuts.

[API ReferenceDrag and drop](/documentation/uikit/drag-and-drop)

Bring drag and drop to your app by using interaction APIs with your views.

[API ReferencePointer interactions](/documentation/uikit/pointer-interactions)

Support pointer interactions in your custom controls and views.

[API ReferenceApple Pencil interactions](/documentation/uikit/apple-pencil-
interactions)

Handle user interactions like double tap and squeeze on Apple Pencil.

[API ReferenceFocus-based navigation](/documentation/uikit/focus-based-
navigation)

Navigate the interface of your UIKit app using a remote, game controller, or
keyboard.

[API ReferenceAccessibility for UIKit](/documentation/uikit/accessibility-for-
uikit)

Make your UIKit apps accessible to everyone who uses iOS and tvOS.

### [Graphics, drawing, and printing](/documentation/UIKit#Graphics-drawing-
and-printing)

UIKit provides classes and protocols that help you configure your drawing
environment and render your content.

[API ReferenceImages and PDF](/documentation/uikit/images-and-pdf)

Create and manage images, including those that use bitmap and PDF formats.

[API ReferenceDrawing](/documentation/uikit/drawing)

Configure your app’s drawing environment using colors, renderers, draw paths,
strings, and shadows.

[API ReferencePrinting](/documentation/uikit/printing)

Display the system print panels and manage the printing process.

### [Text](/documentation/UIKit#Text)

In addition to text views that simplify displaying text in your app, UIKit
provides custom text management and rendering that supports the system
keyboards.

[API ReferenceText display and fonts](/documentation/uikit/text-display-and-
fonts)

Display text, manage fonts, and check spelling.

[API ReferenceTextKit](/documentation/uikit/textkit)

Manage text storage and perform custom layout of text-based content in your
app’s views.

[API ReferenceKeyboards and input](/documentation/uikit/keyboards-and-input)

Configure the system keyboard, create your own keyboards to handle input, or
detect key presses on a physical keyboard.

[API ReferenceWriting Tools](/documentation/uikit/writing-tools)

Add support for Writing Tools to your app’s text views.

[API ReferenceHandwriting recognition](/documentation/uikit/handwriting-
recognition)

Configure text fields and custom views that accept text to handle input from
Apple Pencil.

### [Deprecated](/documentation/UIKit#Deprecated)

Avoid using deprecated classes and protocols in your apps.

[API ReferenceDeprecated symbols](/documentation/uikit/deprecated-symbols)

Review unsupported symbols and their replacements.

### [Reference](/documentation/UIKit#Reference)

[API ReferenceUIKit Enumerations](/documentation/uikit/uikit-enumerations)

[API ReferenceUIKit Constants](/documentation/uikit/uikit-constants)

This document describes constants that are used throughout the UIKit
framework.

[API ReferenceUIKit Data Types](/documentation/uikit/uikit-data-types)

The UIKit framework defines data types that are used in multiple places
throughout the framework.

[API ReferenceUIKit Functions](/documentation/uikit/uikit-functions)

The UIKit framework defines a number of functions, many of them used in
graphics and drawing operations.

