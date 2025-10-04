Collection

  * [ SwiftUI ](/documentation/swiftui)
  * Menus and commands 

API Collection

# Menus and commands

Provide space-efficient, context-dependent access to commands and controls.

## [Overview](/documentation/swiftui/menus-and-commands#Overview)

Use a menu to provide people with easy access to common commands. You can add
items to a macOS or iPadOS app’s menu bar using the
[`commands(content:)`](/documentation/swiftui/scene/commands\(content:\))
scene modifier, or create context menus that people reveal near their current
task using the
[`contextMenu(menuItems:)`](/documentation/swiftui/view/contextmenu\(menuitems:\))
view modifier.

Create submenus by nesting [`Menu`](/documentation/swiftui/menu) instances
inside others. Use a [`Divider`](/documentation/swiftui/divider) view to
create a separator between menu elements.

For design guidance, see [Menus](/design/Human-Interface-Guidelines/menus) in
the Human Interface Guidelines.

## [Topics](/documentation/swiftui/menus-and-commands#topics)

### [Building a menu bar](/documentation/swiftui/menus-and-commands#Building-
a-menu-bar)

[Building and customizing the menu bar with
SwiftUI](/documentation/swiftui/building-and-customizing-the-menu-bar-with-
swiftui)

Provide a seamless, cross-platform user experience by building a native menu
bar for iPadOS and macOS.

### [Creating a menu](/documentation/swiftui/menus-and-commands#Creating-a-
menu)

[Populating SwiftUI menus with adaptive
controls](/documentation/swiftui/populating-swiftui-menus-with-adaptive-
controls)

Improve your app by populating menus with controls and organizing your content
intuitively.

[`struct Menu`](/documentation/swiftui/menu)

A control for presenting a menu of actions.

[`func menuStyle<S>(S) -> some
View`](/documentation/swiftui/view/menustyle\(_:\))

Sets the style for menus within this view.

### [Creating context menus](/documentation/swiftui/menus-and-
commands#Creating-context-menus)

[`func contextMenu<MenuItems>(menuItems: () -> MenuItems) -> some
View`](/documentation/swiftui/view/contextmenu\(menuitems:\))

Adds a context menu to a view.

[`func contextMenu<M, P>(menuItems: () -> M, preview: () -> P) -> some
View`](/documentation/swiftui/view/contextmenu\(menuitems:preview:\))

Adds a context menu with a custom preview to a view.

[`func contextMenu<I, M>(forSelectionType: I.Type, menu: (Set<I>) -> M,
primaryAction: ((Set<I>) -> Void)?) -> some
View`](/documentation/swiftui/view/contextmenu\(forselectiontype:menu:primaryaction:\))

Adds an item-based context menu to a view.

### [Defining commands](/documentation/swiftui/menus-and-commands#Defining-
commands)

[`func commands<Content>(content: () -> Content) -> some
Scene`](/documentation/swiftui/scene/commands\(content:\))

Adds commands to the scene.

[`func commandsRemoved() -> some
Scene`](/documentation/swiftui/scene/commandsremoved\(\))

Removes all commands defined by the modified scene.

[`func commandsReplaced<Content>(content: () -> Content) -> some
Scene`](/documentation/swiftui/scene/commandsreplaced\(content:\))

Replaces all commands defined by the modified scene with the commands from the
builder.

[`protocol Commands`](/documentation/swiftui/commands)

Conforming types represent a group of related commands that can be exposed to
the user via the main menu on macOS and key commands on iOS.

[`struct CommandMenu`](/documentation/swiftui/commandmenu)

Command menus are stand-alone, top-level containers for controls that perform
related, app-specific commands.

[`struct CommandGroup`](/documentation/swiftui/commandgroup)

Groups of controls that you can add to existing command menus.

[`struct CommandsBuilder`](/documentation/swiftui/commandsbuilder)

Constructs command sets from multi-expression closures. Like `ViewBuilder`, it
supports up to ten expressions in the closure body.

[`struct CommandGroupPlacement`](/documentation/swiftui/commandgroupplacement)

The standard locations that you can place new command groups relative to.

### [Getting built-in command groups](/documentation/swiftui/menus-and-
commands#Getting-built-in-command-groups)

[`struct SidebarCommands`](/documentation/swiftui/sidebarcommands)

A built-in set of commands for manipulating window sidebars.

[`struct TextEditingCommands`](/documentation/swiftui/texteditingcommands)

A built-in group of commands for searching, editing, and transforming
selections of text.

[`struct
TextFormattingCommands`](/documentation/swiftui/textformattingcommands)

A built-in set of commands for transforming the styles applied to selections
of text.

[`struct ToolbarCommands`](/documentation/swiftui/toolbarcommands)

A built-in set of commands for manipulating window toolbars.

[`struct
ImportFromDevicesCommands`](/documentation/swiftui/importfromdevicescommands)

A built-in set of commands that enables importing content from nearby devices.

[`struct InspectorCommands`](/documentation/swiftui/inspectorcommands)

A built-in set of commands for manipulating inspectors.

[`struct EmptyCommands`](/documentation/swiftui/emptycommands)

An empty group of commands.

### [Showing a menu indicator](/documentation/swiftui/menus-and-
commands#Showing-a-menu-indicator)

[`func menuIndicator(Visibility) -> some
View`](/documentation/swiftui/view/menuindicator\(_:\))

Sets the menu indicator visibility for controls within this view.

[`var menuIndicatorVisibility:
Visibility`](/documentation/swiftui/environmentvalues/menuindicatorvisibility)

The menu indicator visibility to apply to controls within a view.

### [Configuring menu dismissal](/documentation/swiftui/menus-and-
commands#Configuring-menu-dismissal)

[`func menuActionDismissBehavior(MenuActionDismissBehavior) -> some
View`](/documentation/swiftui/view/menuactiondismissbehavior\(_:\))

Tells a menu whether to dismiss after performing an action.

[`struct
MenuActionDismissBehavior`](/documentation/swiftui/menuactiondismissbehavior)

The set of menu dismissal behavior options.

### [Setting a preferred order](/documentation/swiftui/menus-and-
commands#Setting-a-preferred-order)

[`func menuOrder(MenuOrder) -> some
View`](/documentation/swiftui/view/menuorder\(_:\))

Sets the preferred order of items for menus presented from this view.

[`var menuOrder:
MenuOrder`](/documentation/swiftui/environmentvalues/menuorder)

The preferred order of items for menus presented from this view.

[`struct MenuOrder`](/documentation/swiftui/menuorder)

The order in which a menu presents its content.

### [Deprecated types](/documentation/swiftui/menus-and-commands#Deprecated-
types)

[`struct MenuButton`](/documentation/swiftui/menubutton)

A button that displays a menu containing a list of choices when pressed.

Deprecated

[`typealias PullDownButton`](/documentation/swiftui/pulldownbutton)Deprecated

[`struct ContextMenu`](/documentation/swiftui/contextmenu)

A container for views that you present as menu items in a context menu.

Deprecated

## [See Also](/documentation/swiftui/menus-and-commands#see-also)

### [Views](/documentation/swiftui/menus-and-commands#Views)

[API ReferenceView fundamentals](/documentation/swiftui/view-fundamentals)

Define the visual elements of your app using a hierarchy of views.

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

[API ReferenceShapes](/documentation/swiftui/shapes)

Trace and fill built-in and custom shapes with a color, gradient, or other
pattern.

[API ReferenceDrawing and graphics](/documentation/swiftui/drawing-and-
graphics)

Enhance your views with graphical effects and customized drawings.

