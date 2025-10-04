Collection

  * [ SwiftUI ](/documentation/swiftui)
  * Gestures 

API Collection

# Gestures

Define interactions from taps, clicks, and swipes to fine-grained gestures.

## [Overview](/documentation/swiftui/gestures#Overview)

Respond to gestures by adding gesture modifiers to your views. You can listen
for taps, drags, pinches, and other standard gestures.

You can also compose custom gestures from individual gestures using the
[`simultaneously(with:)`](/documentation/swiftui/gesture/simultaneously\(with:\)),
[`sequenced(before:)`](/documentation/swiftui/gesture/sequenced\(before:\)),
or
[`exclusively(before:)`](/documentation/swiftui/gesture/exclusively\(before:\))
modifiers, or combine gestures with keyboard modifiers using the
[`modifiers(_:)`](/documentation/swiftui/gesture/modifiers\(_:\)) modifier.

Important

When you need a button, use a [`Button`](/documentation/swiftui/button)
instance rather than a tap gesture. You can use any view as the button’s
label, and the button type automatically provides many of the standard
behaviors that users expect from a button, like accessibility labels and
hints.

For design guidance, see [Gestures](/design/Human-Interface-
Guidelines/gestures) in the Human Interface Guidelines.

## [Topics](/documentation/swiftui/gestures#topics)

### [Essentials](/documentation/swiftui/gestures#Essentials)

[Adding interactivity with gestures](/documentation/swiftui/adding-
interactivity-with-gestures)

Use gesture modifiers to add interactivity to your app.

### [Recognizing tap gestures](/documentation/swiftui/gestures#Recognizing-
tap-gestures)

[`func onTapGesture(count: Int, perform: () -> Void) -> some
View`](/documentation/swiftui/view/ontapgesture\(count:perform:\))

Adds an action to perform when this view recognizes a tap gesture.

[`func
onTapGesture(count:coordinateSpace:perform:)`](/documentation/swiftui/view/ontapgesture\(count:coordinatespace:perform:\))

Adds an action to perform when this view recognizes a tap gesture, and
provides the action with the location of the interaction.

[`struct TapGesture`](/documentation/swiftui/tapgesture)

A gesture that recognizes one or more taps.

[`struct SpatialTapGesture`](/documentation/swiftui/spatialtapgesture)

A gesture that recognizes one or more taps and reports their location.

### [Recognizing long press
gestures](/documentation/swiftui/gestures#Recognizing-long-press-gestures)

[`func onLongPressGesture(minimumDuration: Double, maximumDistance: CGFloat,
perform: () -> Void, onPressingChanged: ((Bool) -> Void)?) -> some
View`](/documentation/swiftui/view/onlongpressgesture\(minimumduration:maximumdistance:perform:onpressingchanged:\))

Adds an action to perform when this view recognizes a long press gesture.

[`func onLongPressGesture(minimumDuration: Double, perform: () -> Void,
onPressingChanged: ((Bool) -> Void)?) -> some
View`](/documentation/swiftui/view/onlongpressgesture\(minimumduration:perform:onpressingchanged:\))

Adds an action to perform when this view recognizes a long press gesture.

[`func onLongTouchGesture(minimumDuration: Double, perform: () -> Void,
onTouchingChanged: ((Bool) -> Void)?) -> some
View`](/documentation/swiftui/view/onlongtouchgesture\(minimumduration:perform:ontouchingchanged:\))

Adds an action to perform when this view recognizes a remote long touch
gesture. A long touch gesture is when the finger is on the remote touch
surface without actually pressing.

[`struct LongPressGesture`](/documentation/swiftui/longpressgesture)

A gesture that succeeds when the user performs a long press.

### [Recognizing spatial events](/documentation/swiftui/gestures#Recognizing-
spatial-events)

[`struct SpatialEventGesture`](/documentation/swiftui/spatialeventgesture)

A gesture that provides information about ongoing spatial events like clicks
and touches.

[`struct
SpatialEventCollection`](/documentation/swiftui/spatialeventcollection)

A collection of spatial input events that target a specific view.

[`enum Chirality`](/documentation/swiftui/chirality)

The chirality, or handedness, of a pose.

### [Recognizing gestures that change over
time](/documentation/swiftui/gestures#Recognizing-gestures-that-change-over-
time)

[`func gesture(_:)`](/documentation/swiftui/view/gesture\(_:\))

Attaches an
[`NSGestureRecognizerRepresentable`](/documentation/swiftui/nsgesturerecognizerrepresentable)
to the view.

[`func gesture<T>(T, isEnabled: Bool) -> some
View`](/documentation/swiftui/view/gesture\(_:isenabled:\))

Attaches a gesture to the view with a lower precedence than gestures defined
by the view.

[`func gesture<T>(T, name: String, isEnabled: Bool) -> some
View`](/documentation/swiftui/view/gesture\(_:name:isenabled:\))

Attaches a gesture to the view with a lower precedence than gestures defined
by the view.

[`func gesture<T>(T, including: GestureMask) -> some
View`](/documentation/swiftui/view/gesture\(_:including:\))

Attaches a gesture to the view with a lower precedence than gestures defined
by the view.

[`struct DragGesture`](/documentation/swiftui/draggesture)

A dragging motion that invokes an action as the drag-event sequence changes.

[`struct WindowDragGesture`](/documentation/swiftui/windowdraggesture)

A gesture that recognizes the motion of and handles dragging a window.

[`struct MagnifyGesture`](/documentation/swiftui/magnifygesture)

A gesture that recognizes a magnification motion and tracks the amount of
magnification.

[`struct RotateGesture`](/documentation/swiftui/rotategesture)

A gesture that recognizes a rotation motion and tracks the angle of the
rotation.

[`struct RotateGesture3D`](/documentation/swiftui/rotategesture3d)

A gesture that recognizes 3D rotation motion and tracks the angle and axis of
the rotation.

[`struct GestureMask`](/documentation/swiftui/gesturemask)

Options that control how adding a gesture to a view affects other gestures
recognized by the view and its subviews.

### [Recognizing Apple Pencil
gestures](/documentation/swiftui/gestures#Recognizing-Apple-Pencil-gestures)

[`func onPencilDoubleTap(perform: (PencilDoubleTapGestureValue) -> Void) ->
some View`](/documentation/swiftui/view/onpencildoubletap\(perform:\))

Adds an action to perform after the user double-taps their Apple Pencil.

[`func onPencilSqueeze(perform: (PencilSqueezeGesturePhase) -> Void) -> some
View`](/documentation/swiftui/view/onpencilsqueeze\(perform:\))

Adds an action to perform when the user squeezes their Apple Pencil.

[`var preferredPencilDoubleTapAction:
PencilPreferredAction`](/documentation/swiftui/environmentvalues/preferredpencildoubletapaction)

The action that the user prefers to perform after double-tapping their Apple
Pencil, as selected in the Settings app.

[`var preferredPencilSqueezeAction:
PencilPreferredAction`](/documentation/swiftui/environmentvalues/preferredpencilsqueezeaction)

The action that the user prefers to perform when squeezing their Apple Pencil,
as selected in the Settings app.

[`struct PencilPreferredAction`](/documentation/swiftui/pencilpreferredaction)

An action that the user prefers to perform after double-tapping their Apple
Pencil.

[`struct
PencilDoubleTapGestureValue`](/documentation/swiftui/pencildoubletapgesturevalue)

Describes the value of an Apple Pencil double-tap gesture.

[`struct
PencilSqueezeGestureValue`](/documentation/swiftui/pencilsqueezegesturevalue)

Describes the value of an Apple Pencil squeeze gesture.

[`enum
PencilSqueezeGesturePhase`](/documentation/swiftui/pencilsqueezegesturephase)

Describes the phase and value of an Apple Pencil squeeze gesture.

[`struct PencilHoverPose`](/documentation/swiftui/pencilhoverpose)

A value describing the location and distance of an Apple Pencil hovering in
the area above a view’s bounds.

### [Combining gestures](/documentation/swiftui/gestures#Combining-gestures)

[Composing SwiftUI gestures](/documentation/swiftui/composing-swiftui-
gestures)

Combine gestures to create complex interactions.

[`func simultaneousGesture<T>(T, including: GestureMask) -> some
View`](/documentation/swiftui/view/simultaneousgesture\(_:including:\))

Attaches a gesture to the view to process simultaneously with gestures defined
by the view.

[`func simultaneousGesture<T>(T, isEnabled: Bool) -> some
View`](/documentation/swiftui/view/simultaneousgesture\(_:isenabled:\))

Attaches a gesture to the view to process simultaneously with gestures defined
by the view.

[`func simultaneousGesture<T>(T, name: String, isEnabled: Bool) -> some
View`](/documentation/swiftui/view/simultaneousgesture\(_:name:isenabled:\))

Attaches a gesture to the view to process simultaneously with gestures defined
by the view.

[`struct SequenceGesture`](/documentation/swiftui/sequencegesture)

A gesture that’s a sequence of two gestures.

[`struct SimultaneousGesture`](/documentation/swiftui/simultaneousgesture)

A gesture containing two gestures that can happen at the same time with
neither of them preceding the other.

[`struct ExclusiveGesture`](/documentation/swiftui/exclusivegesture)

A gesture that consists of two gestures where only one of them can succeed.

### [Defining custom gestures](/documentation/swiftui/gestures#Defining-
custom-gestures)

[`func highPriorityGesture<T>(T, including: GestureMask) -> some
View`](/documentation/swiftui/view/highprioritygesture\(_:including:\))

Attaches a gesture to the view with a higher precedence than gestures defined
by the view.

[`func highPriorityGesture<T>(T, isEnabled: Bool) -> some
View`](/documentation/swiftui/view/highprioritygesture\(_:isenabled:\))

Attaches a gesture to the view with a higher precedence than gestures defined
by the view.

[`func highPriorityGesture<T>(T, name: String, isEnabled: Bool) -> some
View`](/documentation/swiftui/view/highprioritygesture\(_:name:isenabled:\))

Attaches a gesture to the view with a higher precedence than gestures defined
by the view.

[`func handGestureShortcut(HandGestureShortcut, isEnabled: Bool) -> some
View`](/documentation/swiftui/view/handgestureshortcut\(_:isenabled:\))

Assigns a hand gesture shortcut to the modified control.

[`func defersSystemGestures(on: Edge.Set) -> some
View`](/documentation/swiftui/view/deferssystemgestures\(on:\))

Sets the screen edge from which you want your gesture to take precedence over
the system gesture.

[`protocol Gesture`](/documentation/swiftui/gesture)

An instance that matches a sequence of events to a gesture, and returns a
stream of values for each of its states.

[`struct AnyGesture`](/documentation/swiftui/anygesture)

A type-erased gesture.

[`struct
HandActivationBehavior`](/documentation/swiftui/handactivationbehavior)

An activation behavior specific to hand-driven input.

[`struct HandGestureShortcut`](/documentation/swiftui/handgestureshortcut)

Hand gesture shortcuts describe finger and wrist movements that the user can
perform in order to activate a button or toggle.

### [Managing gesture state](/documentation/swiftui/gestures#Managing-gesture-
state)

[`struct GestureState`](/documentation/swiftui/gesturestate)

A property wrapper type that updates a property while the user performs a
gesture and resets the property back to its initial state when the gesture
ends.

[`struct GestureStateGesture`](/documentation/swiftui/gesturestategesture)

A gesture that updates the state provided by a gesture’s updating callback.

### [Handling activation events](/documentation/swiftui/gestures#Handling-
activation-events)

[`func allowsWindowActivationEvents(Bool?) -> some
View`](/documentation/swiftui/view/allowswindowactivationevents\(_:\))

Configures whether gestures in this view hierarchy can handle events that
activate the containing window.

### [Deprecated gestures](/documentation/swiftui/gestures#Deprecated-gestures)

[`struct MagnificationGesture`](/documentation/swiftui/magnificationgesture)

A gesture that recognizes a magnification motion and tracks the amount of
magnification.

Deprecated

[`struct RotationGesture`](/documentation/swiftui/rotationgesture)

A gesture that recognizes a rotation motion and tracks the angle of the
rotation.

Deprecated

## [See Also](/documentation/swiftui/gestures#see-also)

### [Event handling](/documentation/swiftui/gestures#Event-handling)

[API ReferenceInput events](/documentation/swiftui/input-events)

Respond to input from a hardware device, like a keyboard or a Touch Bar.

[API ReferenceClipboard](/documentation/swiftui/clipboard)

Enable people to move or duplicate items by issuing Copy and Paste commands.

[API ReferenceDrag and drop](/documentation/swiftui/drag-and-drop)

Enable people to move or duplicate items by dragging them from one location to
another.

[API ReferenceFocus](/documentation/swiftui/focus)

Identify and control which visible object responds to user interaction.

[API ReferenceSystem events](/documentation/swiftui/system-events)

React to system events, like opening a URL.

