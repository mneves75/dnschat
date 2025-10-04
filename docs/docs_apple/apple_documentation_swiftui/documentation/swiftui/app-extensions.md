Collection

  * [ SwiftUI ](/documentation/swiftui)
  * App extensions 

API Collection

# App extensions

Extend your app’s basic functionality to other parts of the system, like by
adding a Widget.

## [Overview](/documentation/swiftui/app-extensions#Overview)

Use SwiftUI along with [WidgetKit](/documentation/WidgetKit) to add widgets to
your app.

Widgets provide quick access to relevant content from your app. Define a
structure that conforms to the [`Widget`](/documentation/swiftui/widget)
protocol, and declare a view hierarchy for the widget. Configure the views
inside the widget as you do other SwiftUI views, using view modifiers,
including a few widget-specific modifiers.

For design guidance, see [Widgets](/design/Human-Interface-Guidelines/widgets)
in the Human Interface Guidelines.

## [Topics](/documentation/swiftui/app-extensions#topics)

### [Creating widgets](/documentation/swiftui/app-extensions#Creating-widgets)

[Building Widgets Using WidgetKit and
SwiftUI](/documentation/widgetkit/building_widgets_using_widgetkit_and_swiftui)

Create widgets to show your app’s content on the Home screen, with custom
intents for user-customizable settings.

[Creating a widget extension](/documentation/WidgetKit/Creating-a-Widget-
Extension)

Display your app’s content in a convenient, informative widget on various
devices.

[Keeping a widget up to date](/documentation/WidgetKit/Keeping-a-Widget-Up-To-
Date)

Plan your widget’s timeline to show timely, relevant information using dynamic
views, and update the timeline when things change.

[Making a configurable widget](/documentation/WidgetKit/Making-a-Configurable-
Widget)

Give people the option to customize their widgets by adding a custom app
intent to your project.

[`protocol Widget`](/documentation/swiftui/widget)

The configuration and content of a widget to display on the Home screen or in
Notification Center.

[`protocol WidgetBundle`](/documentation/swiftui/widgetbundle)

A container used to expose multiple widgets from a single widget extension.

[`struct
LimitedAvailabilityConfiguration`](/documentation/swiftui/limitedavailabilityconfiguration)

A type-erased widget configuration.

[`protocol WidgetConfiguration`](/documentation/swiftui/widgetconfiguration)

A type that describes a widget’s content.

[`struct
EmptyWidgetConfiguration`](/documentation/swiftui/emptywidgetconfiguration)

An empty widget configuration.

### [Composing control widgets](/documentation/swiftui/app-
extensions#Composing-control-widgets)

[`protocol ControlWidget`](/documentation/swiftui/controlwidget)

The configuration and content of a control widget to display in system spaces
such as Control Center, the Lock Screen, and the Action Button.

[`protocol
ControlWidgetConfiguration`](/documentation/swiftui/controlwidgetconfiguration)

A type that describes a control widget’s content.

[`struct
EmptyControlWidgetConfiguration`](/documentation/swiftui/emptycontrolwidgetconfiguration)

An empty control widget configuration.

[`struct
ControlWidgetConfigurationBuilder`](/documentation/swiftui/controlwidgetconfigurationbuilder)

A custom attribute that constructs a control widget’s body.

[`protocol
ControlWidgetTemplate`](/documentation/swiftui/controlwidgettemplate)

A type that describes a control widget’s content.

[`struct
EmptyControlWidgetTemplate`](/documentation/swiftui/emptycontrolwidgettemplate)

An empty control widget template.

[`struct
ControlWidgetTemplateBuilder`](/documentation/swiftui/controlwidgettemplatebuilder)

A custom attribute that constructs a control widget template’s body.

[`func
controlWidgetActionHint(_:)`](/documentation/swiftui/view/controlwidgetactionhint\(_:\))

The action hint of the control described by the modified label.

[`func
controlWidgetStatus(_:)`](/documentation/swiftui/view/controlwidgetstatus\(_:\))

The status of the control described by the modified label.

### [Labeling a widget](/documentation/swiftui/app-extensions#Labeling-a-
widget)

[`func widgetLabel(_:)`](/documentation/swiftui/view/widgetlabel\(_:\))

Returns a localized text label that displays additional content outside the
accessory family widget’s main SwiftUI view.

[`func widgetLabel<Label>(label: () -> Label) -> some
View`](/documentation/swiftui/view/widgetlabel\(label:\))

Creates a label for displaying additional content outside an accessory family
widget’s main SwiftUI view.

### [Styling a widget group](/documentation/swiftui/app-extensions#Styling-a-
widget-group)

[`func accessoryWidgetGroupStyle(AccessoryWidgetGroupStyle) -> some
View`](/documentation/swiftui/view/accessorywidgetgroupstyle\(_:\))

The view modifier that can be applied to `AccessoryWidgetGroup` to specify the
shape the three content views will be masked with. The value of `style` is set
to `.automatic`, which is `.circular` by default.

### [Controlling the accented group](/documentation/swiftui/app-
extensions#Controlling-the-accented-group)

[`func widgetAccentable(Bool) -> some
View`](/documentation/swiftui/view/widgetaccentable\(_:\))

Adds the view and all of its subviews to the accented group.

### [Managing placement in the Dynamic Island](/documentation/swiftui/app-
extensions#Managing-placement-in-the-Dynamic-Island)

[`func dynamicIsland(verticalPlacement:
DynamicIslandExpandedRegionVerticalPlacement) -> some
View`](/documentation/swiftui/view/dynamicisland\(verticalplacement:\))

Specifies the vertical placement for a view of an expanded Live Activity that
appears in the Dynamic Island.

## [See Also](/documentation/swiftui/app-extensions#see-also)

### [App structure](/documentation/swiftui/app-extensions#App-structure)

[API ReferenceApp organization](/documentation/swiftui/app-organization)

Define the entry point and top-level structure of your app.

[API ReferenceScenes](/documentation/swiftui/scenes)

Declare the user interface groupings that make up the parts of your app.

[API ReferenceWindows](/documentation/swiftui/windows)

Display user interface content in a window or a collection of windows.

[API ReferenceImmersive spaces](/documentation/swiftui/immersive-spaces)

Display unbounded content in a person’s surroundings.

[API ReferenceDocuments](/documentation/swiftui/documents)

Enable people to open and manage documents.

[API ReferenceNavigation](/documentation/swiftui/navigation)

Enable people to move between different parts of your app’s view hierarchy
within a scene.

[API ReferenceModal presentations](/documentation/swiftui/modal-presentations)

Present content in a separate view that offers focused interaction.

[API ReferenceToolbars](/documentation/swiftui/toolbars)

Provide immediate access to frequently used commands and controls.

[API ReferenceSearch](/documentation/swiftui/search)

Enable people to search for text or other content within your app.

