Collection

  * [ SwiftUI ](/documentation/swiftui)
  * Animations 

API Collection

# Animations

Create smooth visual updates in response to state changes.

## [Overview](/documentation/swiftui/animations#Overview)

You tell SwiftUI how to draw your app’s user interface for different states,
and then rely on SwiftUI to make interface updates when the state changes.

To avoid abrupt visual transitions when the state changes, add animation in
one of the following ways:

  * Animate all of the visual changes for a state change by changing the state inside a call to the [`withAnimation(_:_:)`](/documentation/swiftui/withanimation\(_:_:\)) global function.

  * Add animation to a particular view when a specific value changes by applying the [`animation(_:value:)`](/documentation/swiftui/view/animation\(_:value:\)) view modifier to the view.

  * Animate changes to a [`Binding`](/documentation/swiftui/binding) by using the binding’s [`animation(_:)`](/documentation/swiftui/binding/animation\(_:\)) method.

SwiftUI animates the effects that many built-in view modifiers produce, like
those that set a scale or opacity value. You can animate other values by
making your custom views conform to the
[`Animatable`](/documentation/swiftui/animatable) protocol, and telling
SwiftUI about the value you want to animate.

When an animated state change results in adding or removing a view to or from
the view hierarchy, you can tell SwiftUI how to transition the view into or
out of place using built-in transitions that
[`AnyTransition`](/documentation/swiftui/anytransition) defines, like
[`slide`](/documentation/swiftui/anytransition/slide) or
[`scale`](/documentation/swiftui/anytransition/scale). You can also create
custom transitions.

For design guidance, see [Motion](/design/Human-Interface-Guidelines/motion)
in the Human Interface Guidelines.

## [Topics](/documentation/swiftui/animations#topics)

### [Adding state-based animation to an
action](/documentation/swiftui/animations#Adding-state-based-animation-to-an-
action)

[`func withAnimation<Result>(Animation?, () throws -> Result) rethrows ->
Result`](/documentation/swiftui/withanimation\(_:_:\))

Returns the result of recomputing the view’s body with the provided animation.

[`func withAnimation<Result>(Animation?, completionCriteria:
AnimationCompletionCriteria, () throws -> Result, completion: () -> Void)
rethrows ->
Result`](/documentation/swiftui/withanimation\(_:completioncriteria:_:completion:\))

Returns the result of recomputing the view’s body with the provided animation,
and runs the completion when all animations are complete.

[`struct
AnimationCompletionCriteria`](/documentation/swiftui/animationcompletioncriteria)

The criteria that determines when an animation is considered finished.

[`struct Animation`](/documentation/swiftui/animation)

The way a view changes over time to create a smooth visual transition from one
state to another.

### [Adding state-based animation to a
view](/documentation/swiftui/animations#Adding-state-based-animation-to-a-
view)

[`func animation(_:)`](/documentation/swiftui/view/animation\(_:\))

Applies the given animation to this view when this view changes.

[`func animation<V>(Animation?, value: V) -> some
View`](/documentation/swiftui/view/animation\(_:value:\))

Applies the given animation to this view when the specified value changes.

[`func animation<V>(Animation?, body: (PlaceholderContentView<Self>) -> V) ->
some View`](/documentation/swiftui/view/animation\(_:body:\))

Applies the given animation to all animatable values within the `body`
closure.

### [Creating phase-based
animation](/documentation/swiftui/animations#Creating-phase-based-animation)

[Controlling the timing and movements of your
animations](/documentation/swiftui/controlling-the-timing-and-movements-of-
your-animations)

Build sophisticated animations that you control using phase and keyframe
animators.

[`func phaseAnimator<Phase>(some Sequence, content:
(PlaceholderContentView<Self>, Phase) -> some View, animation: (Phase) ->
Animation?) -> some
View`](/documentation/swiftui/view/phaseanimator\(_:content:animation:\))

Animates effects that you apply to a view over a sequence of phases that
change continuously.

[`func phaseAnimator<Phase>(some Sequence, trigger: some Equatable, content:
(PlaceholderContentView<Self>, Phase) -> some View, animation: (Phase) ->
Animation?) -> some
View`](/documentation/swiftui/view/phaseanimator\(_:trigger:content:animation:\))

Animates effects that you apply to a view over a sequence of phases that
change based on a trigger.

[`struct PhaseAnimator`](/documentation/swiftui/phaseanimator)

A container that animates its content by automatically cycling through a
collection of phases that you provide, each defining a discrete step within an
animation.

### [Creating keyframe-based
animation](/documentation/swiftui/animations#Creating-keyframe-based-
animation)

[`func keyframeAnimator<Value>(initialValue: Value, repeating: Bool, content:
(PlaceholderContentView<Self>, Value) -> some View, keyframes: (Value) -> some
Keyframes) -> some
View`](/documentation/swiftui/view/keyframeanimator\(initialvalue:repeating:content:keyframes:\))

Loops the given keyframes continuously, updating the view using the modifiers
you apply in `body`.

[`func keyframeAnimator<Value>(initialValue: Value, trigger: some Equatable,
content: (PlaceholderContentView<Self>, Value) -> some View, keyframes:
(Value) -> some Keyframes) -> some
View`](/documentation/swiftui/view/keyframeanimator\(initialvalue:trigger:content:keyframes:\))

Plays the given keyframes when the given trigger value changes, updating the
view using the modifiers you apply in `body`.

[`struct KeyframeAnimator`](/documentation/swiftui/keyframeanimator)

A container that animates its content with keyframes.

[`protocol Keyframes`](/documentation/swiftui/keyframes)

A type that defines changes to a value over time.

[`struct KeyframeTimeline`](/documentation/swiftui/keyframetimeline)

A description of how a value changes over time, modeled using keyframes.

[`struct KeyframeTrack`](/documentation/swiftui/keyframetrack)

A sequence of keyframes animating a single property of a root type.

[`struct
KeyframeTrackContentBuilder`](/documentation/swiftui/keyframetrackcontentbuilder)

The builder that creates keyframe track content from the keyframes that you
define within a closure.

[`struct KeyframesBuilder`](/documentation/swiftui/keyframesbuilder)

A builder that combines keyframe content values into a single value.

[`protocol KeyframeTrackContent`](/documentation/swiftui/keyframetrackcontent)

A group of keyframes that define an interpolation curve of an animatable
value.

[`struct CubicKeyframe`](/documentation/swiftui/cubickeyframe)

A keyframe that uses a cubic curve to smoothly interpolate between values.

[`struct LinearKeyframe`](/documentation/swiftui/linearkeyframe)

A keyframe that uses simple linear interpolation.

[`struct MoveKeyframe`](/documentation/swiftui/movekeyframe)

A keyframe that immediately moves to the given value without interpolating.

[`struct SpringKeyframe`](/documentation/swiftui/springkeyframe)

A keyframe that uses a spring function to interpolate to the given value.

### [Creating custom animations](/documentation/swiftui/animations#Creating-
custom-animations)

[`protocol CustomAnimation`](/documentation/swiftui/customanimation)

A type that defines how an animatable value changes over time.

[`struct AnimationContext`](/documentation/swiftui/animationcontext)

Contextual values that a custom animation can use to manage state and access a
view’s environment.

[`struct AnimationState`](/documentation/swiftui/animationstate)

A container that stores the state for a custom animation.

[`protocol AnimationStateKey`](/documentation/swiftui/animationstatekey)

A key for accessing animation state values.

[`struct UnitCurve`](/documentation/swiftui/unitcurve)

A function defined by a two-dimensional curve that maps an input progress in
the range [0,1] to an output progress that is also in the range [0,1]. By
changing the shape of the curve, the effective speed of an animation or other
interpolation can be changed.

[`struct Spring`](/documentation/swiftui/spring)

A representation of a spring’s motion.

### [Making data animatable](/documentation/swiftui/animations#Making-data-
animatable)

[`protocol Animatable`](/documentation/swiftui/animatable)

A type that describes how to animate a property of a view.

[`struct AnimatableValues`](/documentation/swiftui/animatablevalues)

[`struct AnimatablePair`](/documentation/swiftui/animatablepair)

A pair of animatable values, which is itself animatable.

[`protocol VectorArithmetic`](/documentation/swiftui/vectorarithmetic)

A type that can serve as the animatable data of an animatable type.

[`struct EmptyAnimatableData`](/documentation/swiftui/emptyanimatabledata)

An empty type for animatable data.

### [Updating a view on a
schedule](/documentation/swiftui/animations#Updating-a-view-on-a-schedule)

[Updating watchOS apps with timelines](/documentation/watchOS-Apps/updating-
watchos-apps-with-timelines)

Seamlessly schedule updates to your user interface, even while it’s inactive.

[`struct TimelineView`](/documentation/swiftui/timelineview)

A view that updates according to a schedule that you provide.

[`protocol TimelineSchedule`](/documentation/swiftui/timelineschedule)

A type that provides a sequence of dates for use as a schedule.

[`typealias
TimelineViewDefaultContext`](/documentation/swiftui/timelineviewdefaultcontext)

Information passed to a timeline view’s content callback.

### [Synchronizing
geometries](/documentation/swiftui/animations#Synchronizing-geometries)

[`func matchedGeometryEffect<ID>(id: ID, in: Namespace.ID, properties:
MatchedGeometryProperties, anchor: UnitPoint, isSource: Bool) -> some
View`](/documentation/swiftui/view/matchedgeometryeffect\(id:in:properties:anchor:issource:\))

Defines a group of views with synchronized geometry using an identifier and
namespace that you provide.

[`struct
MatchedGeometryProperties`](/documentation/swiftui/matchedgeometryproperties)

A set of view properties that may be synchronized between views using the
`View.matchedGeometryEffect()` function.

[`protocol GeometryEffect`](/documentation/swiftui/geometryeffect)

An effect that changes the visual appearance of a view, largely without
changing its ancestors or descendants.

[`struct Namespace`](/documentation/swiftui/namespace)

A dynamic property type that allows access to a namespace defined by the
persistent identity of the object containing the property (e.g. a view).

[`func geometryGroup() -> some
View`](/documentation/swiftui/view/geometrygroup\(\))

Isolates the geometry (e.g. position and size) of the view from its parent
view.

### [Defining transitions](/documentation/swiftui/animations#Defining-
transitions)

[`func transition(_:)`](/documentation/swiftui/view/transition\(_:\))

Associates a transition with the view.

[`protocol Transition`](/documentation/swiftui/transition)

A description of view changes to apply when a view is added to and removed
from the view hierarchy.

[`struct TransitionProperties`](/documentation/swiftui/transitionproperties)

The properties a `Transition` can have.

[`enum TransitionPhase`](/documentation/swiftui/transitionphase)

An indication of which the current stage of a transition.

[`struct AsymmetricTransition`](/documentation/swiftui/asymmetrictransition)

A composite `Transition` that uses a different transition for insertion versus
removal.

[`struct AnyTransition`](/documentation/swiftui/anytransition)

A type-erased transition.

[`func contentTransition(ContentTransition) -> some
View`](/documentation/swiftui/view/contenttransition\(_:\))

Modifies the view to use a given transition as its method of animating changes
to the contents of its views.

[`var contentTransition:
ContentTransition`](/documentation/swiftui/environmentvalues/contenttransition)

The current method of animating the contents of views.

[`var contentTransitionAddsDrawingGroup:
Bool`](/documentation/swiftui/environmentvalues/contenttransitionaddsdrawinggroup)

A Boolean value that controls whether views that render content transitions
use GPU-accelerated rendering.

[`struct ContentTransition`](/documentation/swiftui/contenttransition)

A kind of transition that applies to the content within a single view, rather
than to the insertion or removal of a view.

[`struct
PlaceholderContentView`](/documentation/swiftui/placeholdercontentview)

A placeholder used to construct an inline modifier, transition, or other
helper type.

[`func navigationTransition(some NavigationTransition) -> some
View`](/documentation/swiftui/view/navigationtransition\(_:\))

Sets the navigation transition style for this view.

[`protocol NavigationTransition`](/documentation/swiftui/navigationtransition)

A type that defines the transition to use when navigating to a view.

[`func matchedTransitionSource(id: some Hashable, in: Namespace.ID) -> some
View`](/documentation/swiftui/view/matchedtransitionsource\(id:in:\))

Identifies this view as the source of a navigation transition, such as a zoom
transition.

[`func matchedTransitionSource(id: some Hashable, in: Namespace.ID,
configuration: (EmptyMatchedTransitionSourceConfiguration) -> some
MatchedTransitionSourceConfiguration) -> some
View`](/documentation/swiftui/view/matchedtransitionsource\(id:in:configuration:\))

Identifies this view as the source of a navigation transition, such as a zoom
transition.

[`protocol
MatchedTransitionSourceConfiguration`](/documentation/swiftui/matchedtransitionsourceconfiguration)

A configuration that defines the appearance of a matched transition source.

[`struct
EmptyMatchedTransitionSourceConfiguration`](/documentation/swiftui/emptymatchedtransitionsourceconfiguration)

An unstyled matched transition source configuration.

### [Moving an animation to another
view](/documentation/swiftui/animations#Moving-an-animation-to-another-view)

[`func withTransaction<Result>(Transaction, () throws -> Result) rethrows ->
Result`](/documentation/swiftui/withtransaction\(_:_:\))

Executes a closure with the specified transaction and returns the result.

[`func withTransaction<R, V>(WritableKeyPath<Transaction, V>, V, () throws ->
R) rethrows -> R`](/documentation/swiftui/withtransaction\(_:_:_:\))

Executes a closure with the specified transaction key path and value and
returns the result.

[`func transaction((inout Transaction) -> Void) -> some
View`](/documentation/swiftui/view/transaction\(_:\))

Applies the given transaction mutation function to all animations used within
the view.

[`func transaction(value: some Equatable, (inout Transaction) -> Void) -> some
View`](/documentation/swiftui/view/transaction\(value:_:\))

Applies the given transaction mutation function to all animations used within
the view.

[`func transaction<V>((inout Transaction) -> Void, body:
(PlaceholderContentView<Self>) -> V) -> some
View`](/documentation/swiftui/view/transaction\(_:body:\))

Applies the given transaction mutation function to all animations used within
the `body` closure.

[`struct Transaction`](/documentation/swiftui/transaction)

The context of the current state-processing update.

[`macro Entry()`](/documentation/swiftui/entry\(\))

Creates an environment values, transaction, container values, or focused
values entry.

[`protocol TransactionKey`](/documentation/swiftui/transactionkey)

A key for accessing values in a transaction.

### [Deprecated types](/documentation/swiftui/animations#Deprecated-types)

[`protocol AnimatableModifier`](/documentation/swiftui/animatablemodifier)

A modifier that can create another modifier with animation.

Deprecated

## [See Also](/documentation/swiftui/animations#see-also)

### [Views](/documentation/swiftui/animations#Views)

[API ReferenceView fundamentals](/documentation/swiftui/view-fundamentals)

Define the visual elements of your app using a hierarchy of views.

[API ReferenceView configuration](/documentation/swiftui/view-configuration)

Adjust the characteristics of views in a hierarchy.

[API ReferenceView styles](/documentation/swiftui/view-styles)

Apply built-in and custom appearances and behaviors to different types of
views.

[API ReferenceText input and output](/documentation/swiftui/text-input-and-
output)

Display formatted text and get text input from the user.

[API ReferenceImages](/documentation/swiftui/images)

Add images and symbols to your app’s user interface.

[API ReferenceControls and indicators](/documentation/swiftui/controls-and-
indicators)

Display values and get user selections.

[API ReferenceMenus and commands](/documentation/swiftui/menus-and-commands)

Provide space-efficient, context-dependent access to commands and controls.

[API ReferenceShapes](/documentation/swiftui/shapes)

Trace and fill built-in and custom shapes with a color, gradient, or other
pattern.

[API ReferenceDrawing and graphics](/documentation/swiftui/drawing-and-
graphics)

Enhance your views with graphical effects and customized drawings.

