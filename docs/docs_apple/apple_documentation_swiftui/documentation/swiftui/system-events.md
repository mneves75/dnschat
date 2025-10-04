Collection

  * [ SwiftUI ](/documentation/swiftui)
  * System events 

API Collection

# System events

React to system events, like opening a URL.

## [Overview](/documentation/swiftui/system-events#Overview)

Specify view and scene modifiers to indicate how your app responds to certain
system events. For example, you can use the
[`onOpenURL(perform:)`](/documentation/swiftui/view/onopenurl\(perform:\))
view modifier to define an action to take when your app receives a universal
link, or use the
[`backgroundTask(_:action:)`](/documentation/swiftui/scene/backgroundtask\(_:action:\))
scene modifier to specify an asynchronous task to carry out in response to a
background task event, like the completion of a background URL session.

## [Topics](/documentation/swiftui/system-events#topics)

### [Sending and receiving user activities](/documentation/swiftui/system-
events#Sending-and-receiving-user-activities)

[Restoring Your App’s State with
SwiftUI](/documentation/swiftui/restoring_your_app_s_state_with_swiftui)

Provide app continuity for users by preserving their current activities.

[`func userActivity<P>(String, element: P?, (P, NSUserActivity) -> ()) -> some
View`](/documentation/swiftui/view/useractivity\(_:element:_:\))

Advertises a user activity type.

[`func userActivity(String, isActive: Bool, (NSUserActivity) -> ()) -> some
View`](/documentation/swiftui/view/useractivity\(_:isactive:_:\))

Advertises a user activity type.

[`func onContinueUserActivity(String, perform: (NSUserActivity) -> ()) -> some
View`](/documentation/swiftui/view/oncontinueuseractivity\(_:perform:\))

Registers a handler to invoke in response to a user activity that your app
receives.

### [Sending and receiving URLs](/documentation/swiftui/system-events#Sending-
and-receiving-URLs)

[`var openURL:
OpenURLAction`](/documentation/swiftui/environmentvalues/openurl)

An action that opens a URL.

[`struct OpenURLAction`](/documentation/swiftui/openurlaction)

An action that opens a URL.

[`func onOpenURL(perform: (URL) -> ()) -> some
View`](/documentation/swiftui/view/onopenurl\(perform:\))

Registers a handler to invoke in response to a URL that your app receives.

### [Handling external events](/documentation/swiftui/system-events#Handling-
external-events)

[`func handlesExternalEvents(matching: Set<String>) -> some
Scene`](/documentation/swiftui/scene/handlesexternalevents\(matching:\))

Specifies the external events for which SwiftUI opens a new instance of the
modified scene.

[`func handlesExternalEvents(preferring: Set<String>, allowing: Set<String>)
-> some
View`](/documentation/swiftui/view/handlesexternalevents\(preferring:allowing:\))

Specifies the external events that the view’s scene handles if the scene is
already open.

### [Handling background tasks](/documentation/swiftui/system-events#Handling-
background-tasks)

[`func backgroundTask<D, R>(BackgroundTask<D, R>, action: (D) async -> R) ->
some Scene`](/documentation/swiftui/scene/backgroundtask\(_:action:\))

Runs the specified action when the system provides a background task.

[`struct BackgroundTask`](/documentation/swiftui/backgroundtask)

The kinds of background tasks that your app or extension can handle.

[`struct SnapshotData`](/documentation/swiftui/snapshotdata)

The associated data of a snapshot background task.

[`struct SnapshotResponse`](/documentation/swiftui/snapshotresponse)

Your appplication’s response to a snapshot background task.

### [Importing and exporting transferable
items](/documentation/swiftui/system-events#Importing-and-exporting-
transferable-items)

[`func importableFromServices<T>(for: T.Type, action: ([T]) -> Bool) -> some
View`](/documentation/swiftui/view/importablefromservices\(for:action:\))

Enables importing items from services, such as Continuity Camera on macOS.

[`func exportableToServices<T>(@autoclosure () -> [T]) -> some
View`](/documentation/swiftui/view/exportabletoservices\(_:\))

Exports items for consumption by shortcuts, quick actions, and services.

[`func exportableToServices<T>(@autoclosure () -> [T], onEdit: ([T]) -> Bool)
-> some View`](/documentation/swiftui/view/exportabletoservices\(_:onedit:\))

Exports read-write items for consumption by shortcuts, quick actions, and
services.

### [Importing and exporting using item
providers](/documentation/swiftui/system-events#Importing-and-exporting-using-
item-providers)

[`func importsItemProviders([UTType], onImport: ([NSItemProvider]) -> Bool) ->
some View`](/documentation/swiftui/view/importsitemproviders\(_:onimport:\))

Enables importing item providers from services, such as Continuity Camera on
macOS.

[`func exportsItemProviders([UTType], onExport: () -> [NSItemProvider]) ->
some View`](/documentation/swiftui/view/exportsitemproviders\(_:onexport:\))

Exports a read-only item provider for consumption by shortcuts, quick actions,
and services.

[`func exportsItemProviders([UTType], onExport: () -> [NSItemProvider],
onEdit: ([NSItemProvider]) -> Bool) -> some
View`](/documentation/swiftui/view/exportsitemproviders\(_:onexport:onedit:\))

Exports a read-write item provider for consumption by shortcuts, quick
actions, and services.

## [See Also](/documentation/swiftui/system-events#see-also)

### [Event handling](/documentation/swiftui/system-events#Event-handling)

[API ReferenceGestures](/documentation/swiftui/gestures)

Define interactions from taps, clicks, and swipes to fine-grained gestures.

[API ReferenceInput events](/documentation/swiftui/input-events)

Respond to input from a hardware device, like a keyboard or a Touch Bar.

[API ReferenceClipboard](/documentation/swiftui/clipboard)

Enable people to move or duplicate items by issuing Copy and Paste commands.

[API ReferenceDrag and drop](/documentation/swiftui/drag-and-drop)

Enable people to move or duplicate items by dragging them from one location to
another.

[API ReferenceFocus](/documentation/swiftui/focus)

Identify and control which visible object responds to user interaction.

