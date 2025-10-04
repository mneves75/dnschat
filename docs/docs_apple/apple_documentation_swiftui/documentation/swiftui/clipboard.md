Collection

  * [ SwiftUI ](/documentation/swiftui)
  * Clipboard 

API Collection

# Clipboard

Enable people to move or duplicate items by issuing Copy and Paste commands.

## [Overview](/documentation/swiftui/clipboard#Overview)

When people issue standard Copy and Cut commands, they expect to move items to
the system’s Clipboard, from which they can paste the items into another place
in the same app or into another app. Your app can participate in this activity
if you add view modifiers that indicate how to respond to the standard
commands.

In your copy and paste modifiers, provide or accept types that conform to the
[`Transferable`](/documentation/CoreTransferable/Transferable) protocol, or
that inherit from the
[`NSItemProvider`](/documentation/Foundation/NSItemProvider) class. When
possible, prefer using transferable items.

## [Topics](/documentation/swiftui/clipboard#topics)

### [Copying transferable items](/documentation/swiftui/clipboard#Copying-
transferable-items)

[`func copyable<T>(@autoclosure () -> [T]) -> some
View`](/documentation/swiftui/view/copyable\(_:\))

Specifies a list of items to copy in response to the system’s Copy command.

[`func cuttable<T>(for: T.Type, action: () -> [T]) -> some
View`](/documentation/swiftui/view/cuttable\(for:action:\))

Specifies an action that moves items to the Clipboard in response to the
system’s Cut command.

[`func pasteDestination<T>(for: T.Type, action: ([T]) -> Void, validator:
([T]) -> [T]) -> some
View`](/documentation/swiftui/view/pastedestination\(for:action:validator:\))

Specifies an action that adds validated items to a view in response to the
system’s Paste command.

### [Copying items using item
providers](/documentation/swiftui/clipboard#Copying-items-using-item-
providers)

[`func onCopyCommand(perform: (() -> [NSItemProvider])?) -> some
View`](/documentation/swiftui/view/oncopycommand\(perform:\))

Adds an action to perform in response to the system’s Copy command.

[`func onCutCommand(perform: (() -> [NSItemProvider])?) -> some
View`](/documentation/swiftui/view/oncutcommand\(perform:\))

Adds an action to perform in response to the system’s Cut command.

[`func
onPasteCommand(of:perform:)`](/documentation/swiftui/view/onpastecommand\(of:perform:\))

Adds an action to perform in response to the system’s Paste command.

[`func
onPasteCommand(of:validator:perform:)`](/documentation/swiftui/view/onpastecommand\(of:validator:perform:\))

Adds an action to perform in response to the system’s Paste command with items
that you validate.

## [See Also](/documentation/swiftui/clipboard#see-also)

### [Event handling](/documentation/swiftui/clipboard#Event-handling)

[API ReferenceGestures](/documentation/swiftui/gestures)

Define interactions from taps, clicks, and swipes to fine-grained gestures.

[API ReferenceInput events](/documentation/swiftui/input-events)

Respond to input from a hardware device, like a keyboard or a Touch Bar.

[API ReferenceDrag and drop](/documentation/swiftui/drag-and-drop)

Enable people to move or duplicate items by dragging them from one location to
another.

[API ReferenceFocus](/documentation/swiftui/focus)

Identify and control which visible object responds to user interaction.

[API ReferenceSystem events](/documentation/swiftui/system-events)

React to system events, like opening a URL.

