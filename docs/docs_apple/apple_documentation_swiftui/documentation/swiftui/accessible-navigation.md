Collection

  * [ SwiftUI ](/documentation/swiftui)
  * Accessible navigation 

API Collection

# Accessible navigation

Enable users to navigate to specific user interface elements using rotors.

## [Overview](/documentation/swiftui/accessible-navigation#Overview)

An accessibility rotor is a shortcut that enables users to quickly navigate to
specific elements of the user interface, and, optionally, to specific ranges
of text within those elements.

The system automatically provides rotors for many navigable elements, but you
can supply additional rotors for specific purposes, or replace system rotors
when they don’t automatically pick up off-screen elements, like those far down
in a [`LazyVStack`](/documentation/swiftui/lazyvstack) or a
[`List`](/documentation/swiftui/list).

For design guidance, see [Accessibility](/design/Human-Interface-
Guidelines/accessibility) in the Accessibility section of the Human Interface
Guidelines.

## [Topics](/documentation/swiftui/accessible-navigation#topics)

### [Working with rotors](/documentation/swiftui/accessible-
navigation#Working-with-rotors)

[`func
accessibilityRotor(_:entries:)`](/documentation/swiftui/view/accessibilityrotor\(_:entries:\))

Create an Accessibility Rotor with the specified user-visible label, and
entries generated from the content closure.

[`func
accessibilityRotor(_:entries:entryID:entryLabel:)`](/documentation/swiftui/view/accessibilityrotor\(_:entries:entryid:entrylabel:\))

Create an Accessibility Rotor with the specified user-visible label and
entries.

[`func
accessibilityRotor(_:entries:entryLabel:)`](/documentation/swiftui/view/accessibilityrotor\(_:entries:entrylabel:\))

Create an Accessibility Rotor with the specified user-visible label and
entries.

[`func
accessibilityRotor(_:textRanges:)`](/documentation/swiftui/view/accessibilityrotor\(_:textranges:\))

Create an Accessibility Rotor with the specified user-visible label and
entries for each of the specified ranges. The Rotor will be attached to the
current Accessibility element, and each entry will go the specified range of
that element.

### [Creating rotors](/documentation/swiftui/accessible-navigation#Creating-
rotors)

[`protocol
AccessibilityRotorContent`](/documentation/swiftui/accessibilityrotorcontent)

Content within an accessibility rotor.

[`struct
AccessibilityRotorContentBuilder`](/documentation/swiftui/accessibilityrotorcontentbuilder)

Result builder you use to generate rotor entry content.

[`struct
AccessibilityRotorEntry`](/documentation/swiftui/accessibilityrotorentry)

A struct representing an entry in an Accessibility Rotor.

### [Replacing system rotors](/documentation/swiftui/accessible-
navigation#Replacing-system-rotors)

[`struct
AccessibilitySystemRotor`](/documentation/swiftui/accessibilitysystemrotor)

Designates a Rotor that replaces one of the automatic, system-provided Rotors
with a developer-provided Rotor.

### [Configuring rotors](/documentation/swiftui/accessible-
navigation#Configuring-rotors)

[`func accessibilityRotorEntry<ID>(id: ID, in: Namespace.ID) -> some
View`](/documentation/swiftui/view/accessibilityrotorentry\(id:in:\))

Defines an explicit identifier tying an Accessibility element for this view to
an entry in an Accessibility Rotor.

[`func accessibilityLinkedGroup<ID>(id: ID, in: Namespace.ID) -> some
View`](/documentation/swiftui/view/accessibilitylinkedgroup\(id:in:\))

Links multiple accessibility elements so that the user can quickly navigate
from one element to another, even when the elements are not near each other in
the accessibility hierarchy.

[`func accessibilitySortPriority(Double) -> ModifiedContent<Self,
AccessibilityAttachmentModifier>`](/documentation/swiftui/view/accessibilitysortpriority\(_:\))

Sets the sort priority order for this view’s accessibility element, relative
to other elements at the same level.

## [See Also](/documentation/swiftui/accessible-navigation#see-also)

### [Accessibility](/documentation/swiftui/accessible-
navigation#Accessibility)

[API ReferenceAccessibility
fundamentals](/documentation/swiftui/accessibility-fundamentals)

Make your SwiftUI apps accessible to everyone, including people with
disabilities.

[API ReferenceAccessible appearance](/documentation/swiftui/accessible-
appearance)

Enhance the legibility of content in your app’s interface.

[API ReferenceAccessible controls](/documentation/swiftui/accessible-controls)

Improve access to actions that your app can undertake.

[API ReferenceAccessible descriptions](/documentation/swiftui/accessible-
descriptions)

Describe interface elements to help people understand what they represent.

