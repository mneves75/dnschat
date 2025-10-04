Collection

  * [ SwiftUI ](/documentation/swiftui)
  * Focus 

API Collection

# Focus

Identify and control which visible object responds to user interaction.

## [Overview](/documentation/swiftui/focus#Overview)

Focus indicates which element in the display receives the next input. Use view
modifiers to indicate which views can receive focus, to detect which view has
focus, and to programmatically control focus state.

For design guidance, see [Focus and selection](/design/Human-Interface-
Guidelines/focus-and-selection) in the Human Interface Guidelines.

## [Topics](/documentation/swiftui/focus#topics)

### [Essentials](/documentation/swiftui/focus#Essentials)

[Focus Cookbook: Supporting and enhancing focus-driven interactions in your
SwiftUI app](/documentation/swiftui/focus-cookbook-sample)

Create custom focusable views with key-press handlers that accelerate keyboard
input and support movement, and control focus programmatically.

### [Indicating that a view can receive
focus](/documentation/swiftui/focus#Indicating-that-a-view-can-receive-focus)

[`func focusable(Bool) -> some
View`](/documentation/swiftui/view/focusable\(_:\))

Specifies if the view is focusable.

[`func focusable(Bool, interactions: FocusInteractions) -> some
View`](/documentation/swiftui/view/focusable\(_:interactions:\))

Specifies if the view is focusable, and if so, what focus-driven interactions
it supports.

[`struct FocusInteractions`](/documentation/swiftui/focusinteractions)

Values describe different focus interactions that a view can support.

### [Managing focus state](/documentation/swiftui/focus#Managing-focus-state)

[`func focused<Value>(FocusState<Value>.Binding, equals: Value) -> some
View`](/documentation/swiftui/view/focused\(_:equals:\))

Modifies this view by binding its focus state to the given state value.

[`func focused(FocusState<Bool>.Binding) -> some
View`](/documentation/swiftui/view/focused\(_:\))

Modifies this view by binding its focus state to the given Boolean state
value.

[`var isFocused: Bool`](/documentation/swiftui/environmentvalues/isfocused)

Returns whether the nearest focusable ancestor has focus.

[`struct FocusState`](/documentation/swiftui/focusstate)

A property wrapper type that can read and write a value that SwiftUI updates
as the placement of focus within the scene changes.

[`struct FocusedValue`](/documentation/swiftui/focusedvalue)

A property wrapper for observing values from the focused view or one of its
ancestors.

[`macro Entry()`](/documentation/swiftui/entry\(\))

Creates an environment values, transaction, container values, or focused
values entry.

[`protocol FocusedValueKey`](/documentation/swiftui/focusedvaluekey)

A protocol for identifier types used when publishing and observing focused
values.

[`struct FocusedBinding`](/documentation/swiftui/focusedbinding)

A convenience property wrapper for observing and automatically unwrapping
state bindings from the focused view or one of its ancestors.

[`func searchFocused(FocusState<Bool>.Binding) -> some
View`](/documentation/swiftui/view/searchfocused\(_:\))

Modifies this view by binding the focus state of the search field associated
with the nearest searchable modifier to the given Boolean value.

[`func searchFocused<V>(FocusState<V>.Binding, equals: V) -> some
View`](/documentation/swiftui/view/searchfocused\(_:equals:\))

Modifies this view by binding the focus state of the search field associated
with the nearest searchable modifier to the given value.

### [Exposing value types to focused
views](/documentation/swiftui/focus#Exposing-value-types-to-focused-views)

[`func focusedValue<T>(T?) -> some
View`](/documentation/swiftui/view/focusedvalue\(_:\))

Sets the focused value for the given object type.

[`func focusedValue(_:_:)`](/documentation/swiftui/view/focusedvalue\(_:_:\))

Modifies this view by injecting a value that you provide for use by other
views whose state depends on the focused view hierarchy.

[`func focusedSceneValue<T>(T?) -> some
View`](/documentation/swiftui/view/focusedscenevalue\(_:\))

Sets the focused value for the given object type at a scene-wide scope.

[`func
focusedSceneValue(_:_:)`](/documentation/swiftui/view/focusedscenevalue\(_:_:\))

Modifies this view by injecting a value that you provide for use by other
views whose state depends on the focused scene.

[`struct FocusedValues`](/documentation/swiftui/focusedvalues)

A collection of state exported by the focused scene or view and its ancestors.

### [Exposing reference types to focused
views](/documentation/swiftui/focus#Exposing-reference-types-to-focused-views)

[`func focusedObject(_:)`](/documentation/swiftui/view/focusedobject\(_:\))

Creates a new view that exposes the provided object to other views whose whose
state depends on the focused view hierarchy.

[`func
focusedSceneObject(_:)`](/documentation/swiftui/view/focusedsceneobject\(_:\))

Creates a new view that exposes the provided object to other views whose whose
state depends on the active scene.

[`struct FocusedObject`](/documentation/swiftui/focusedobject)

A property wrapper type for an observable object supplied by the focused view
or one of its ancestors.

### [Setting focus scope](/documentation/swiftui/focus#Setting-focus-scope)

[`func focusScope(Namespace.ID) -> some
View`](/documentation/swiftui/view/focusscope\(_:\))

Creates a focus scope that SwiftUI uses to limit default focus preferences.

[`func focusSection() -> some
View`](/documentation/swiftui/view/focussection\(\))

Indicates that the view’s frame and cohort of focusable descendants should be
used to guide focus movement.

### [Controlling default focus](/documentation/swiftui/focus#Controlling-
default-focus)

[`func prefersDefaultFocus(Bool, in: Namespace.ID) -> some
View`](/documentation/swiftui/view/prefersdefaultfocus\(_:in:\))

Indicates that the view should receive focus by default for a given namespace.

[`func defaultFocus<V>(FocusState<V>.Binding, V, priority:
DefaultFocusEvaluationPriority) -> some
View`](/documentation/swiftui/view/defaultfocus\(_:_:priority:\))

Defines a region of the window in which default focus is evaluated by
assigning a value to a given focus state binding.

[`struct
DefaultFocusEvaluationPriority`](/documentation/swiftui/defaultfocusevaluationpriority)

Prioritizations for default focus preferences when evaluating where to move
focus in different circumstances.

### [Resetting focus](/documentation/swiftui/focus#Resetting-focus)

[`var resetFocus:
ResetFocusAction`](/documentation/swiftui/environmentvalues/resetfocus)

An action that requests the focus system to reevaluate default focus.

[`struct ResetFocusAction`](/documentation/swiftui/resetfocusaction)

An environment value that provides the ability to reevaluate default focus.

### [Configuring effects](/documentation/swiftui/focus#Configuring-effects)

[`func focusEffectDisabled(Bool) -> some
View`](/documentation/swiftui/view/focuseffectdisabled\(_:\))

Adds a condition that controls whether this view can display focus effects,
such as a default focus ring or hover effect.

[`var isFocusEffectEnabled:
Bool`](/documentation/swiftui/environmentvalues/isfocuseffectenabled)

A Boolean value that indicates whether the view associated with this
environment allows focus effects to be displayed.

## [See Also](/documentation/swiftui/focus#see-also)

### [Event handling](/documentation/swiftui/focus#Event-handling)

[API ReferenceGestures](/documentation/swiftui/gestures)

Define interactions from taps, clicks, and swipes to fine-grained gestures.

[API ReferenceInput events](/documentation/swiftui/input-events)

Respond to input from a hardware device, like a keyboard or a Touch Bar.

[API ReferenceClipboard](/documentation/swiftui/clipboard)

Enable people to move or duplicate items by issuing Copy and Paste commands.

[API ReferenceDrag and drop](/documentation/swiftui/drag-and-drop)

Enable people to move or duplicate items by dragging them from one location to
another.

[API ReferenceSystem events](/documentation/swiftui/system-events)

React to system events, like opening a URL.

