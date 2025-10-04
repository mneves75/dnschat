Collection

  * [ SwiftUI ](/documentation/swiftui)
  * Accessible appearance 

API Collection

# Accessible appearance

Enhance the legibility of content in your app’s interface.

## [Overview](/documentation/swiftui/accessible-appearance#Overview)

Make content easier for people to see by making it larger, giving it greater
contrast, or reducing the amount of distracting motion.

For design guidance, see [Accessibility](/design/Human-Interface-
Guidelines/accessibility) in the Accessibility section of the Human Interface
Guidelines.

## [Topics](/documentation/swiftui/accessible-appearance#topics)

### [Managing color](/documentation/swiftui/accessible-appearance#Managing-
color)

[`func accessibilityIgnoresInvertColors(Bool) -> some
View`](/documentation/swiftui/view/accessibilityignoresinvertcolors\(_:\))

Sets whether this view should ignore the system Smart Invert setting.

[`var accessibilityInvertColors:
Bool`](/documentation/swiftui/environmentvalues/accessibilityinvertcolors)

Whether the system preference for Invert Colors is enabled.

[`var accessibilityDifferentiateWithoutColor:
Bool`](/documentation/swiftui/environmentvalues/accessibilitydifferentiatewithoutcolor)

Whether the system preference for Differentiate without Color is enabled.

### [Enlarging content](/documentation/swiftui/accessible-
appearance#Enlarging-content)

[`func accessibilityShowsLargeContentViewer() -> some
View`](/documentation/swiftui/view/accessibilityshowslargecontentviewer\(\))

Adds a default large content view to be shown by the large content viewer.

[`func accessibilityShowsLargeContentViewer<V>(() -> V) -> some
View`](/documentation/swiftui/view/accessibilityshowslargecontentviewer\(_:\))

Adds a custom large content view to be shown by the large content viewer.

[`var accessibilityLargeContentViewerEnabled:
Bool`](/documentation/swiftui/environmentvalues/accessibilitylargecontentviewerenabled)

Whether the Large Content Viewer is enabled.

### [Improving legibility](/documentation/swiftui/accessible-
appearance#Improving-legibility)

[`var accessibilityShowButtonShapes:
Bool`](/documentation/swiftui/environmentvalues/accessibilityshowbuttonshapes)

Whether the system preference for Show Button Shapes is enabled.

[`var accessibilityReduceTransparency:
Bool`](/documentation/swiftui/environmentvalues/accessibilityreducetransparency)

Whether the system preference for Reduce Transparency is enabled.

[`var legibilityWeight:
LegibilityWeight?`](/documentation/swiftui/environmentvalues/legibilityweight)

The font weight to apply to text.

[`enum LegibilityWeight`](/documentation/swiftui/legibilityweight)

The Accessibility Bold Text user setting options.

### [Minimizing motion](/documentation/swiftui/accessible-
appearance#Minimizing-motion)

[`var accessibilityDimFlashingLights:
Bool`](/documentation/swiftui/environmentvalues/accessibilitydimflashinglights)

Whether the setting to reduce flashing or strobing lights in video content is
on. This setting can also be used to determine if UI in playback controls
should be shown to indicate upcoming content that includes flashing or
strobing lights.

[`var accessibilityPlayAnimatedImages:
Bool`](/documentation/swiftui/environmentvalues/accessibilityplayanimatedimages)

Whether the setting for playing animations in an animated image is on. When
this value is false, any presented image that contains animation should not
play automatically.

[`var accessibilityReduceMotion:
Bool`](/documentation/swiftui/environmentvalues/accessibilityreducemotion)

Whether the system preference for Reduce Motion is enabled.

### [Using assistive access](/documentation/swiftui/accessible-
appearance#Using-assistive-access)

[`var accessibilityAssistiveAccessEnabled:
Bool`](/documentation/swiftui/environmentvalues/accessibilityassistiveaccessenabled)

A Boolean value that indicates whether Assistive Access is in use.

[`struct AssistiveAccess`](/documentation/swiftui/assistiveaccess)

A scene that presents an interface appropriate for Assistive Access on iOS and
iPadOS. On other platforms, this scene is unused.

## [See Also](/documentation/swiftui/accessible-appearance#see-also)

### [Accessibility](/documentation/swiftui/accessible-
appearance#Accessibility)

[API ReferenceAccessibility
fundamentals](/documentation/swiftui/accessibility-fundamentals)

Make your SwiftUI apps accessible to everyone, including people with
disabilities.

[API ReferenceAccessible controls](/documentation/swiftui/accessible-controls)

Improve access to actions that your app can undertake.

[API ReferenceAccessible descriptions](/documentation/swiftui/accessible-
descriptions)

Describe interface elements to help people understand what they represent.

[API ReferenceAccessible navigation](/documentation/swiftui/accessible-
navigation)

Enable users to navigate to specific user interface elements using rotors.

