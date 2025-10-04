Collection

  * [ SwiftUI ](/documentation/swiftui)
  * Drag and drop 

API Collection

# Drag and drop

Enable people to move or duplicate items by dragging them from one location to
another.

## [Overview](/documentation/swiftui/drag-and-drop#Overview)

Drag and drop offers people a convenient way to move content from one part of
your app to another, or from one app to another, using an intuitive dragging
gesture. Support this feature in your app by adding view modifiers to
potential source and destination views within your app’s interface.

In your modifiers, provide or accept types that conform to the
[`Transferable`](/documentation/CoreTransferable/Transferable) protocol, or
that inherit from the
[`NSItemProvider`](/documentation/Foundation/NSItemProvider) class. When
possible, prefer using transferable items.

For design guidance, see [Drag and drop](/design/Human-Interface-
Guidelines/drag-and-drop) in the Human Interface Guidelines.

## [Topics](/documentation/swiftui/drag-and-drop#topics)

### [Essentials](/documentation/swiftui/drag-and-drop#Essentials)

[Adopting drag and drop using SwiftUI](/documentation/swiftui/adopting-drag-
and-drop-using-swiftui)

Enable drag-and-drop interactions in lists, tables and custom views.

[Making a view into a drag source](/documentation/swiftui/making-a-view-into-
a-drag-source)

Adopt draggable API to provide items for drag-and-drop operations.

### [Configuring drag and drop behavior](/documentation/swiftui/drag-and-
drop#Configuring-drag-and-drop-behavior)

[`struct DragConfiguration`](/documentation/swiftui/dragconfiguration)

The behavior of the drag, proposed by the dragging source.

[`struct DropConfiguration`](/documentation/swiftui/dropconfiguration)

Describes the behavior of the drop.

### [Moving items](/documentation/swiftui/drag-and-drop#Moving-items)

[`struct DragSession`](/documentation/swiftui/dragsession)

Describes the ongoing dragging session.

[`struct DropSession`](/documentation/swiftui/dropsession)

### [Moving transferable items](/documentation/swiftui/drag-and-drop#Moving-
transferable-items)

[`func draggable<T>(@autoclosure () -> T) -> some
View`](/documentation/swiftui/view/draggable\(_:\))

Activates this view as the source of a drag and drop operation.

[`func draggable<V, T>(@autoclosure () -> T, preview: () -> V) -> some
View`](/documentation/swiftui/view/draggable\(_:preview:\))

Activates this view as the source of a drag and drop operation.

[`func dropDestination<T>(for: T.Type, action: ([T], CGPoint) -> Bool,
isTargeted: (Bool) -> Void) -> some
View`](/documentation/swiftui/view/dropdestination\(for:action:istargeted:\))

Defines the destination of a drag and drop operation that handles the dropped
content with a closure that you specify.

Deprecated

### [Moving items using item providers](/documentation/swiftui/drag-and-
drop#Moving-items-using-item-providers)

[`func itemProvider(Optional<() -> NSItemProvider?>) -> some
View`](/documentation/swiftui/view/itemprovider\(_:\))

Provides a closure that vends the drag representation to be used for a
particular data element.

[`func onDrag<V>(() -> NSItemProvider, preview: () -> V) -> some
View`](/documentation/swiftui/view/ondrag\(_:preview:\))

Activates this view as the source of a drag and drop operation.

[`func onDrag(() -> NSItemProvider) -> some
View`](/documentation/swiftui/view/ondrag\(_:\))

Activates this view as the source of a drag and drop operation.

[`func
onDrop(of:isTargeted:perform:)`](/documentation/swiftui/view/ondrop\(of:istargeted:perform:\))

Defines the destination of a drag-and-drop operation that handles the dropped
content with a closure that you specify.

[`func
onDrop(of:delegate:)`](/documentation/swiftui/view/ondrop\(of:delegate:\))

Defines the destination of a drag and drop operation using behavior controlled
by the delegate that you provide.

[`protocol DropDelegate`](/documentation/swiftui/dropdelegate)

An interface that you implement to interact with a drop operation in a view
modified to accept drops.

[`struct DropProposal`](/documentation/swiftui/dropproposal)

The behavior of a drop.

[`enum DropOperation`](/documentation/swiftui/dropoperation)

Operation types that determine how a drag and drop session resolves when the
user drops a drag item.

[`struct DropInfo`](/documentation/swiftui/dropinfo)

The current state of a drop.

### [Describing preview formations](/documentation/swiftui/drag-and-
drop#Describing-preview-formations)

[`struct
DragDropPreviewsFormation`](/documentation/swiftui/dragdroppreviewsformation)

On macOS, describes the way the dragged previews are visually composed. Both
drag sources and drop destination can specify their desired preview formation.

### [Configuring spring loading](/documentation/swiftui/drag-and-
drop#Configuring-spring-loading)

[`func springLoadingBehavior(SpringLoadingBehavior) -> some
View`](/documentation/swiftui/view/springloadingbehavior\(_:\))

Sets the spring loading behavior this view.

[`var springLoadingBehavior:
SpringLoadingBehavior`](/documentation/swiftui/environmentvalues/springloadingbehavior)

The behavior of spring loaded interactions for the views associated with this
environment.

[`struct SpringLoadingBehavior`](/documentation/swiftui/springloadingbehavior)

The options for controlling the spring loading behavior of views.

## [See Also](/documentation/swiftui/drag-and-drop#see-also)

### [Event handling](/documentation/swiftui/drag-and-drop#Event-handling)

[API ReferenceGestures](/documentation/swiftui/gestures)

Define interactions from taps, clicks, and swipes to fine-grained gestures.

[API ReferenceInput events](/documentation/swiftui/input-events)

Respond to input from a hardware device, like a keyboard or a Touch Bar.

[API ReferenceClipboard](/documentation/swiftui/clipboard)

Enable people to move or duplicate items by issuing Copy and Paste commands.

[API ReferenceFocus](/documentation/swiftui/focus)

Identify and control which visible object responds to user interaction.

[API ReferenceSystem events](/documentation/swiftui/system-events)

React to system events, like opening a URL.

