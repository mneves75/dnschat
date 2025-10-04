Collection

  * [ SwiftUI ](/documentation/swiftui)
  * View fundamentals 

API Collection

# View fundamentals

Define the visual elements of your app using a hierarchy of views.

## [Overview](/documentation/SwiftUI/View-fundamentals#Overview)

Views are the building blocks that you use to declare your app’s user
interface. Each view contains a description of what to display for a given
state. Every bit of your app that’s visible to the user derives from the
description in a view, and any type that conforms to the
[`View`](/documentation/swiftui/view) protocol can act as a view in your app.

Compose a custom view by combining built-in views that SwiftUI provides with
other custom views that you create in your view’s
[`body`](/documentation/swiftui/view/body-8kl5o) computed property. Configure
views using the view modifiers that SwiftUI provides, or by defining your own
view modifiers using the [`ViewModifier`](/documentation/swiftui/viewmodifier)
protocol and the [`modifier(_:)`](/documentation/swiftui/view/modifier\(_:\))
method.

## [Topics](/documentation/SwiftUI/View-fundamentals#topics)

### [Creating a view](/documentation/SwiftUI/View-fundamentals#Creating-a-
view)

[Declaring a custom view](/documentation/swiftui/declaring-a-custom-view)

Define views and assemble them into a view hierarchy.

[`protocol View`](/documentation/swiftui/view)

A type that represents part of your app’s user interface and provides
modifiers that you use to configure views.

[`struct ViewBuilder`](/documentation/swiftui/viewbuilder)

A custom parameter attribute that constructs views from closures.

### [Modifying a view](/documentation/SwiftUI/View-fundamentals#Modifying-a-
view)

[Configuring views](/documentation/swiftui/configuring-views)

Adjust the characteristics of a view by applying view modifiers.

[Reducing view modifier maintenance](/documentation/swiftui/reducing-view-
modifier-maintenance)

Bundle view modifiers that you regularly reuse into a custom view modifier.

[`func modifier<T>(T) -> ModifiedContent<Self,
T>`](/documentation/swiftui/view/modifier\(_:\))

Applies a modifier to a view and returns a new view.

[`protocol ViewModifier`](/documentation/swiftui/viewmodifier)

A modifier that you apply to a view or another view modifier, producing a
different version of the original value.

[`struct EmptyModifier`](/documentation/swiftui/emptymodifier)

An empty, or identity, modifier, used during development to switch modifiers
at compile time.

[`struct ModifiedContent`](/documentation/swiftui/modifiedcontent)

A value with a modifier applied to it.

[`protocol
EnvironmentalModifier`](/documentation/swiftui/environmentalmodifier)

A modifier that must resolve to a concrete modifier in an environment before
use.

[`struct ManipulableModifier`](/documentation/swiftui/manipulablemodifier)

[`struct
ManipulableResponderModifier`](/documentation/swiftui/manipulablerespondermodifier)

[`struct
ManipulableTransformBindingModifier`](/documentation/swiftui/manipulabletransformbindingmodifier)

[`struct
ManipulationGeometryModifier`](/documentation/swiftui/manipulationgeometrymodifier)

[`struct
ManipulationGestureModifier`](/documentation/swiftui/manipulationgesturemodifier)

[`struct
ManipulationUsingGestureStateModifier`](/documentation/swiftui/manipulationusinggesturestatemodifier)

[`enum Manipulable`](/documentation/swiftui/manipulable)

A namespace for various manipulable related types.

### [Responding to view life cycle updates](/documentation/SwiftUI/View-
fundamentals#Responding-to-view-life-cycle-updates)

[`func onAppear(perform: (() -> Void)?) -> some
View`](/documentation/swiftui/view/onappear\(perform:\))

Adds an action to perform before this view appears.

[`func onDisappear(perform: (() -> Void)?) -> some
View`](/documentation/swiftui/view/ondisappear\(perform:\))

Adds an action to perform after this view disappears.

[`func task(priority: TaskPriority, () async -> Void) -> some
View`](/documentation/swiftui/view/task\(priority:_:\))

Adds an asynchronous task to perform before this view appears.

[`func task<T>(id: T, priority: TaskPriority, () async -> Void) -> some
View`](/documentation/swiftui/view/task\(id:priority:_:\))

Adds a task to perform before this view appears or when a specified value
changes.

### [Managing the view hierarchy](/documentation/SwiftUI/View-
fundamentals#Managing-the-view-hierarchy)

[`func id<ID>(ID) -> some View`](/documentation/swiftui/view/id\(_:\))

Binds a view’s identity to the given proxy value.

[`func tag<V>(V, includeOptional: Bool) -> some
View`](/documentation/swiftui/view/tag\(_:includeoptional:\))

Sets the unique tag value of this view.

[`func equatable() ->
EquatableView<Self>`](/documentation/swiftui/view/equatable\(\))

Prevents the view from updating its child view when its new value is the same
as its old value.

### [Supporting view types](/documentation/SwiftUI/View-
fundamentals#Supporting-view-types)

[`struct AnyView`](/documentation/swiftui/anyview)

A type-erased view.

[`struct EmptyView`](/documentation/swiftui/emptyview)

A view that doesn’t contain any content.

[`struct EquatableView`](/documentation/swiftui/equatableview)

A view type that compares itself against its previous value and prevents its
child updating if its new value is the same as its old value.

[`struct SubscriptionView`](/documentation/swiftui/subscriptionview)

A view that subscribes to a publisher with an action.

[`struct TupleView`](/documentation/swiftui/tupleview)

A View created from a swift tuple of View values.

## [See Also](/documentation/SwiftUI/View-fundamentals#see-also)

### [Views](/documentation/SwiftUI/View-fundamentals#Views)

[API ReferenceView configuration](/documentation/swiftui/view-configuration)

Adjust the characteristics of views in a hierarchy.

[API ReferenceView styles](/documentation/swiftui/view-styles)

Apply built-in and custom appearances and behaviors to different types of
views.

[API ReferenceAnimations](/documentation/swiftui/animations)

Create smooth visual updates in response to state changes.

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

