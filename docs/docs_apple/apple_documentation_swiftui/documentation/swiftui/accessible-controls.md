Collection

  * [ SwiftUI ](/documentation/swiftui)
  * Accessible controls 

API Collection

# Accessible controls

Improve access to actions that your app can undertake.

## [Overview](/documentation/swiftui/accessible-controls#Overview)

Help people using assistive technologies to gain access to controls in your
app.

For design guidance, see [Accessibility](/design/Human-Interface-
Guidelines/accessibility) in the Accessibility section of the Human Interface
Guidelines.

## [Topics](/documentation/swiftui/accessible-controls#topics)

### [Adding actions to views](/documentation/swiftui/accessible-
controls#Adding-actions-to-views)

[`func accessibilityAction(AccessibilityActionKind, () -> Void) ->
ModifiedContent<Self,
AccessibilityAttachmentModifier>`](/documentation/swiftui/view/accessibilityaction\(_:_:\))

Adds an accessibility action to the view. Actions allow assistive
technologies, such as the VoiceOver, to interact with the view by invoking the
action.

[`func accessibilityActions<Content>(() -> Content) -> some
View`](/documentation/swiftui/view/accessibilityactions\(_:\))

Adds multiple accessibility actions to the view.

[`func
accessibilityAction(named:_:)`](/documentation/swiftui/view/accessibilityaction\(named:_:\))

Adds an accessibility action to the view. Actions allow assistive
technologies, such as the VoiceOver, to interact with the view by invoking the
action.

[`func accessibilityAction<Label>(action: () -> Void, label: () -> Label) ->
some View`](/documentation/swiftui/view/accessibilityaction\(action:label:\))

Adds an accessibility action to the view. Actions allow assistive
technologies, such as the VoiceOver, to interact with the view by invoking the
action.

[`func accessibilityAction<I, Label>(intent: I, label: () -> Label) -> some
View`](/documentation/swiftui/view/accessibilityaction\(intent:label:\))

Adds an accessibility action labeled by the contents of `label` to the view.
Actions allow assistive technologies, such as the VoiceOver, to interact with
the view by invoking the action. When the action is performed, the `intent`
will be invoked.

[`func accessibilityAction<I>(AccessibilityActionKind, intent: I) ->
ModifiedContent<Self,
AccessibilityAttachmentModifier>`](/documentation/swiftui/view/accessibilityaction\(_:intent:\))

Adds an accessibility action representing `actionKind` to the view. Actions
allow assistive technologies, such as the VoiceOver, to interact with the view
by invoking the action. When the action is performed, the `intent` will be
invoked.

[`func
accessibilityAction(named:intent:)`](/documentation/swiftui/view/accessibilityaction\(named:intent:\))

Adds an accessibility action labeled `name` to the view. Actions allow
assistive technologies, such as the VoiceOver, to interact with the view by
invoking the action. When the action is performed, the `intent` will be
invoked.

[`func accessibilityAdjustableAction((AccessibilityAdjustmentDirection) ->
Void) -> ModifiedContent<Self,
AccessibilityAttachmentModifier>`](/documentation/swiftui/view/accessibilityadjustableaction\(_:\))

Adds an accessibility adjustable action to the view. Actions allow assistive
technologies, such as the VoiceOver, to interact with the view by invoking the
action.

[`func accessibilityScrollAction((Edge) -> Void) -> ModifiedContent<Self,
AccessibilityAttachmentModifier>`](/documentation/swiftui/view/accessibilityscrollaction\(_:\))

Adds an accessibility scroll action to the view. Actions allow assistive
technologies, such as the VoiceOver, to interact with the view by invoking the
action.

[`func accessibilityActions<Content>(category: AccessibilityActionCategory, ()
-> Content) -> some
View`](/documentation/swiftui/view/accessibilityactions\(category:_:\))

Adds multiple accessibility actions to the view with a specific category.
Actions allow assistive technologies, such as VoiceOver, to interact with the
view by invoking the action and are grouped by their category. When multiple
action modifiers with an equal category are applied to the view, the actions
are combined together.

[`struct
AccessibilityActionKind`](/documentation/swiftui/accessibilityactionkind)

The structure that defines the kinds of available accessibility actions.

[`enum
AccessibilityAdjustmentDirection`](/documentation/swiftui/accessibilityadjustmentdirection)

A directional indicator you use when making an accessibility adjustment.

[`struct
AccessibilityActionCategory`](/documentation/swiftui/accessibilityactioncategory)

Designates an accessibility action category that is provided and named by the
system.

### [Offering Quick Actions to people](/documentation/swiftui/accessible-
controls#Offering-Quick-Actions-to-people)

[`func accessibilityQuickAction<Style, Content>(style: Style, content: () ->
Content) -> some
View`](/documentation/swiftui/view/accessibilityquickaction\(style:content:\))

Adds a quick action to be shown by the system when active.

[`func accessibilityQuickAction<Style, Content>(style: Style, isActive:
Binding<Bool>, content: () -> Content) -> some
View`](/documentation/swiftui/view/accessibilityquickaction\(style:isactive:content:\))

Adds a quick action to be shown by the system when active.

[`protocol
AccessibilityQuickActionStyle`](/documentation/swiftui/accessibilityquickactionstyle)

A type that describes the presentation style of an accessibility quick action.

### [Making gestures accessible](/documentation/swiftui/accessible-
controls#Making-gestures-accessible)

[`func
accessibilityActivationPoint(_:)`](/documentation/swiftui/view/accessibilityactivationpoint\(_:\))

The activation point for an element is the location assistive technologies use
to initiate gestures.

[`func
accessibilityActivationPoint(_:isEnabled:)`](/documentation/swiftui/view/accessibilityactivationpoint\(_:isenabled:\))

The activation point for an element is the location assistive technologies use
to initiate gestures.

[`func
accessibilityDragPoint(_:description:)`](/documentation/swiftui/view/accessibilitydragpoint\(_:description:\))

The point an assistive technology should use to begin a drag interaction.

[`func
accessibilityDragPoint(_:description:isEnabled:)`](/documentation/swiftui/view/accessibilitydragpoint\(_:description:isenabled:\))

The point an assistive technology should use to begin a drag interaction.

[`func
accessibilityDropPoint(_:description:)`](/documentation/swiftui/view/accessibilitydroppoint\(_:description:\))

The point an assistive technology should use to end a drag interaction.

[`func
accessibilityDropPoint(_:description:isEnabled:)`](/documentation/swiftui/view/accessibilitydroppoint\(_:description:isenabled:\))

The point an assistive technology should use to end a drag interaction.

[`func accessibilityDirectTouch(Bool, options:
AccessibilityDirectTouchOptions) -> ModifiedContent<Self,
AccessibilityAttachmentModifier>`](/documentation/swiftui/view/accessibilitydirecttouch\(_:options:\))

Explicitly set whether this accessibility element is a direct touch area.
Direct touch areas passthrough touch events to the app rather than being
handled through an assistive technology, such as VoiceOver. The modifier
accepts an optional `AccessibilityDirectTouchOptions` option set to customize
the functionality of the direct touch area.

[`func accessibilityZoomAction((AccessibilityZoomGestureAction) -> Void) ->
ModifiedContent<Self,
AccessibilityAttachmentModifier>`](/documentation/swiftui/view/accessibilityzoomaction\(_:\))

Adds an accessibility zoom action to the view. Actions allow assistive
technologies, such as VoiceOver, to interact with the view by invoking the
action.

[`struct
AccessibilityDirectTouchOptions`](/documentation/swiftui/accessibilitydirecttouchoptions)

An option set that defines the functionality of a view’s direct touch area.

[`struct
AccessibilityZoomGestureAction`](/documentation/swiftui/accessibilityzoomgestureaction)

Position and direction information of a zoom gesture that someone performs
with an assistive technology like VoiceOver.

### [Controlling focus](/documentation/swiftui/accessible-
controls#Controlling-focus)

[`func accessibilityFocused(AccessibilityFocusState<Bool>.Binding) -> some
View`](/documentation/swiftui/view/accessibilityfocused\(_:\))

Modifies this view by binding its accessibility element’s focus state to the
given boolean state value.

[`func accessibilityFocused<Value>(AccessibilityFocusState<Value>.Binding,
equals: Value) -> some
View`](/documentation/swiftui/view/accessibilityfocused\(_:equals:\))

Modifies this view by binding its accessibility element’s focus state to the
given state value.

[`struct
AccessibilityFocusState`](/documentation/swiftui/accessibilityfocusstate)

A property wrapper type that can read and write a value that SwiftUI updates
as the focus of any active accessibility technology, such as VoiceOver,
changes.

### [Managing interactivity](/documentation/swiftui/accessible-
controls#Managing-interactivity)

[`func accessibilityRespondsToUserInteraction(Bool) -> ModifiedContent<Self,
AccessibilityAttachmentModifier>`](/documentation/swiftui/view/accessibilityrespondstouserinteraction\(_:\))

Explicitly set whether this Accessibility element responds to user interaction
and would thus be interacted with by technologies such as Switch Control,
Voice Control or Full Keyboard Access.

[`func accessibilityRespondsToUserInteraction(Bool, isEnabled: Bool) ->
ModifiedContent<Self,
AccessibilityAttachmentModifier>`](/documentation/swiftui/view/accessibilityrespondstouserinteraction\(_:isenabled:\))

Explicitly set whether this Accessibility element responds to user interaction
and would thus be interacted with by technologies such as Switch Control,
Voice Control or Full Keyboard Access.

## [See Also](/documentation/swiftui/accessible-controls#see-also)

### [Accessibility](/documentation/swiftui/accessible-controls#Accessibility)

[API ReferenceAccessibility
fundamentals](/documentation/swiftui/accessibility-fundamentals)

Make your SwiftUI apps accessible to everyone, including people with
disabilities.

[API ReferenceAccessible appearance](/documentation/swiftui/accessible-
appearance)

Enhance the legibility of content in your app’s interface.

[API ReferenceAccessible descriptions](/documentation/swiftui/accessible-
descriptions)

Describe interface elements to help people understand what they represent.

[API ReferenceAccessible navigation](/documentation/swiftui/accessible-
navigation)

Enable users to navigate to specific user interface elements using rotors.

