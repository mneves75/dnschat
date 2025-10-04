Collection

  * [ SwiftUI ](/documentation/swiftui)
  * Model data 

API Collection

# Model data

Manage the data that your app uses to drive its interface.

## [Overview](/documentation/swiftui/model-data#Overview)

SwiftUI offers a declarative approach to user interface design. As you compose
a hierarchy of views, you also indicate data dependencies for the views. When
the data changes, either due to an external event or because of an action that
the user performs, SwiftUI automatically updates the affected parts of the
interface. As a result, the framework automatically performs most of the work
that view controllers traditionally do.

The framework provides tools, like state variables and bindings, for
connecting your app’s data to the user interface. These tools help you
maintain a single source of truth for every piece of data in your app, in part
by reducing the amount of glue logic you write. Select the tool that best
suits the task you need to perform:

  * Manage transient UI state locally within a view by wrapping value types as [`State`](/documentation/swiftui/state) properties.

  * Share a reference to a source of truth, like local state, using the [`Binding`](/documentation/swiftui/binding) property wrapper.

  * Connect to and observe reference model data in views by applying the [`Observable()`](/documentation/Observation/Observable\(\)) macro to the model data type. Instantiate an observable model data type directly in a view using a [`State`](/documentation/swiftui/state) property. Share the observable model data with other views in the hierarchy without passing a reference using the [`Environment`](/documentation/swiftui/environment) property wrapper.

### [Leveraging property wrappers](/documentation/swiftui/model-
data#Leveraging-property-wrappers)

SwiftUI implements many data management types, like
[`State`](/documentation/swiftui/state) and
[`Binding`](/documentation/swiftui/binding), as Swift property wrappers. Apply
a property wrapper by adding an attribute with the wrapper’s name to a
property’s declaration.

    
    
    @State private var isVisible = true // Declares isVisible as a state variable.
    

The property gains the behavior that the wrapper specifies. The state and data
flow property wrappers in SwiftUI watch for changes in your data, and
automatically update affected views as necessary. When you refer directly to
the property in your code, you access the wrapped value, which for the
`isVisible` state property in the example above is the stored Boolean.

    
    
    if isVisible == true {
        Text("Hello") // Only renders when isVisible is true.
    }
    

Alternatively, you can access a property wrapper’s projected value by
prefixing the property name with the dollar sign (`$`). SwiftUI state and data
flow property wrappers project a [`Binding`](/documentation/swiftui/binding),
which is a two-way connection to the wrapped value, allowing another view to
access and mutate a single source of truth.

    
    
    Toggle("Visible", isOn: $isVisible) // The toggle can update the stored value.
    

For more information about property wrappers, see [Property
Wrappers](https://docs.swift.org/swift-
book/LanguageGuide/Properties.html#ID617) in [The Swift Programming
Language](https://swift.org/documentation/#the-swift-programming-language).

## [Topics](/documentation/swiftui/model-data#topics)

### [Creating and sharing view state](/documentation/swiftui/model-
data#Creating-and-sharing-view-state)

[Managing user interface state](/documentation/swiftui/managing-user-
interface-state)

Encapsulate view-specific data within your app’s view hierarchy to make your
views reusable.

[`struct State`](/documentation/swiftui/state)

A property wrapper type that can read and write a value managed by SwiftUI.

[`struct Bindable`](/documentation/swiftui/bindable)

A property wrapper type that supports creating bindings to the mutable
properties of observable objects.

[`struct Binding`](/documentation/swiftui/binding)

A property wrapper type that can read and write a value owned by a source of
truth.

### [Creating model data](/documentation/swiftui/model-data#Creating-model-
data)

[Managing model data in your app](/documentation/swiftui/managing-model-data-
in-your-app)

Create connections between your app’s data model and views.

[Migrating from the Observable Object protocol to the Observable
macro](/documentation/swiftui/migrating-from-the-observable-object-protocol-
to-the-observable-macro)

Update your existing app to leverage the benefits of Observation in Swift.

[`@attached(member, names: named(_$observationRegistrar), named(access),
named(withMutation), named(shouldNotifyObservers)) @attached(memberAttribute)
@attached(extension, conformances: Observable) macro
Observable()`](/documentation/Observation/Observable\(\))

Defines and implements conformance of the Observable protocol.

[Monitoring data changes in your app](/documentation/swiftui/monitoring-model-
data-changes-in-your-app)

Show changes to data in your app’s user interface by using observable objects.

[`struct StateObject`](/documentation/swiftui/stateobject)

A property wrapper type that instantiates an observable object.

[`struct ObservedObject`](/documentation/swiftui/observedobject)

A property wrapper type that subscribes to an observable object and
invalidates a view whenever the observable object changes.

[`protocol ObservableObject :
AnyObject`](/documentation/Combine/ObservableObject)

A type of object with a publisher that emits before the object has changed.

### [Responding to data changes](/documentation/swiftui/model-data#Responding-
to-data-changes)

[`func
onChange(of:initial:_:)`](/documentation/swiftui/view/onchange\(of:initial:_:\))

Adds a modifier for this view that fires an action when a specific value
changes.

[`func onReceive<P>(P, perform: (P.Output) -> Void) -> some
View`](/documentation/swiftui/view/onreceive\(_:perform:\))

Adds an action to perform when this view detects data emitted by the given
publisher.

### [Distributing model data throughout your
app](/documentation/swiftui/model-data#Distributing-model-data-throughout-
your-app)

[`func environmentObject<T>(T) -> some
View`](/documentation/swiftui/view/environmentobject\(_:\))

Supplies an observable object to a view’s hierarchy.

[`func environmentObject<T>(T) -> some
Scene`](/documentation/swiftui/scene/environmentobject\(_:\))

Supplies an `ObservableObject` to a view subhierarchy.

[`struct EnvironmentObject`](/documentation/swiftui/environmentobject)

A property wrapper type for an observable object that a parent or ancestor
view supplies.

### [Managing dynamic data](/documentation/swiftui/model-data#Managing-
dynamic-data)

[`protocol DynamicProperty`](/documentation/swiftui/dynamicproperty)

An interface for a stored variable that updates an external property of a
view.

## [See Also](/documentation/swiftui/model-data#see-also)

### [Data and storage](/documentation/swiftui/model-data#Data-and-storage)

[API ReferenceEnvironment values](/documentation/swiftui/environment-values)

Share data throughout a view hierarchy using the environment.

[API ReferencePreferences](/documentation/swiftui/preferences)

Indicate configuration preferences from views to their container views.

[API ReferencePersistent storage](/documentation/swiftui/persistent-storage)

Store data for use across sessions of your app.

