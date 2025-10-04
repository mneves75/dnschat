Collection

  * [ SwiftUI ](/documentation/swiftui)
  * Accessibility fundamentals 

API Collection

# Accessibility fundamentals

Make your SwiftUI apps accessible to everyone, including people with
disabilities.

## [Overview](/documentation/swiftui/accessibility-fundamentals#Overview)

Like all Apple UI frameworks, SwiftUI comes with built-in accessibility
support. The framework introspects common elements like navigation views,
lists, text fields, sliders, buttons, and so on, and provides basic
accessibility labels and values by default. You don’t have to do any extra
work to enable these standard accessibility features.

SwiftUI also provides tools to help you enhance the accessibility of your app.
To find out what enhancements you need, try using your app with accessibility
features like VoiceOver, Voice Control, and Switch Control, or get feedback
from users of your app that regularly use these features. Then use the
accessibility view modifiers that SwiftUI provides to improve the experience.
For example, you can explicitly add accessibility labels to elements in your
UI using the
[`accessibilityLabel(_:)`](/documentation/swiftui/view/accessibilitylabel\(_:\))
or the
[`accessibilityValue(_:)`](/documentation/swiftui/view/accessibilityvalue\(_:\))
view modifier.

Customize your use of accessibility modifiers for all the platforms that your
app runs on. For example, you may need to adjust the accessibility elements
for a companion Apple Watch app that shares a common code base with an iOS
app. If you integrate AppKit or UIKit controls in SwiftUI, expose any
accessibility labels and make them accessible from your
[`NSViewRepresentable`](/documentation/swiftui/nsviewrepresentable) or
[`UIViewRepresentable`](/documentation/swiftui/uiviewrepresentable) views, or
provide custom accessibility information if the underlying accessibility
labels aren’t available.

For design guidance, see [Accessibility](/design/Human-Interface-
Guidelines/accessibility) in the Human Interface Guidelines.

## [Topics](/documentation/swiftui/accessibility-fundamentals#topics)

### [Essentials](/documentation/swiftui/accessibility-fundamentals#Essentials)

[Creating Accessible Views](/documentation/swiftui/creating_accessible_views)

Make your app accessible to everyone by applying accessibility modifiers to
your SwiftUI views.

### [Creating accessible elements](/documentation/swiftui/accessibility-
fundamentals#Creating-accessible-elements)

[`func accessibilityElement(children: AccessibilityChildBehavior) -> some
View`](/documentation/swiftui/view/accessibilityelement\(children:\))

Creates a new accessibility element, or modifies the
[`AccessibilityChildBehavior`](/documentation/swiftui/accessibilitychildbehavior)
of the existing accessibility element.

[`func accessibilityChildren<V>(children: () -> V) -> some
View`](/documentation/swiftui/view/accessibilitychildren\(children:\))

Replaces the existing accessibility element’s children with one or more new
synthetic accessibility elements.

[`func accessibilityRepresentation<V>(representation: () -> V) -> some
View`](/documentation/swiftui/view/accessibilityrepresentation\(representation:\))

Replaces one or more accessibility elements for this view with new
accessibility elements.

[`struct
AccessibilityChildBehavior`](/documentation/swiftui/accessibilitychildbehavior)

Defines the behavior for the child elements of the new parent element.

### [Identifying elements](/documentation/swiftui/accessibility-
fundamentals#Identifying-elements)

[`func accessibilityIdentifier(String) -> ModifiedContent<Self,
AccessibilityAttachmentModifier>`](/documentation/swiftui/view/accessibilityidentifier\(_:\))

Uses the string you specify to identify the view.

[`func accessibilityIdentifier(String, isEnabled: Bool) ->
ModifiedContent<Self,
AccessibilityAttachmentModifier>`](/documentation/swiftui/view/accessibilityidentifier\(_:isenabled:\))

Uses the string you specify to identify the view.

### [Hiding elements](/documentation/swiftui/accessibility-
fundamentals#Hiding-elements)

[`func accessibilityHidden(Bool) -> ModifiedContent<Self,
AccessibilityAttachmentModifier>`](/documentation/swiftui/view/accessibilityhidden\(_:\))

Specifies whether to hide this view from system accessibility features.

[`func accessibilityHidden(Bool, isEnabled: Bool) -> ModifiedContent<Self,
AccessibilityAttachmentModifier>`](/documentation/swiftui/view/accessibilityhidden\(_:isenabled:\))

Specifies whether to hide this view from system accessibility features.

### [Supporting types](/documentation/swiftui/accessibility-
fundamentals#Supporting-types)

[`struct
AccessibilityTechnologies`](/documentation/swiftui/accessibilitytechnologies)

Accessibility technologies available to the system.

[`struct
AccessibilityAttachmentModifier`](/documentation/swiftui/accessibilityattachmentmodifier)

A view modifier that adds accessibility properties to the view

## [See Also](/documentation/swiftui/accessibility-fundamentals#see-also)

### [Accessibility](/documentation/swiftui/accessibility-
fundamentals#Accessibility)

[API ReferenceAccessible appearance](/documentation/swiftui/accessible-
appearance)

Enhance the legibility of content in your app’s interface.

[API ReferenceAccessible controls](/documentation/swiftui/accessible-controls)

Improve access to actions that your app can undertake.

[API ReferenceAccessible descriptions](/documentation/swiftui/accessible-
descriptions)

Describe interface elements to help people understand what they represent.

[API ReferenceAccessible navigation](/documentation/swiftui/accessible-
navigation)

Enable users to navigate to specific user interface elements using rotors.

