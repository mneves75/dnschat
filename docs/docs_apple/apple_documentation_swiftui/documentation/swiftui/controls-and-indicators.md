Collection

  * [ SwiftUI ](/documentation/swiftui)
  * Controls and indicators 

API Collection

# Controls and indicators

Display values and get user selections.

## [Overview](/documentation/swiftui/controls-and-indicators#Overview)

SwiftUI provides controls that enable user interaction specific to each
platform and context. For example, people can initiate events with buttons and
links, or choose among a set of discrete values with different kinds of
pickers. You can also display information to the user with indicators like
progress views and gauges.

Use these built-in controls and indicators when composing custom views, and
style them to match the needs of your app’s user interface. For design
guidance, see [Menus and actions](/design/Human-Interface-Guidelines/menus-
and-actions), [Selection and input](/design/Human-Interface-
Guidelines/selection-and-input), and [Status](/design/Human-Interface-
Guidelines/status) in the Human Interface Guidelines.

## [Topics](/documentation/swiftui/controls-and-indicators#topics)

### [Creating buttons](/documentation/swiftui/controls-and-
indicators#Creating-buttons)

[`struct Button`](/documentation/swiftui/button)

A control that initiates an action.

[`func buttonStyle(_:)`](/documentation/swiftui/view/buttonstyle\(_:\))

Sets the style for buttons within this view to a button style with a custom
appearance and standard interaction behavior.

[`func buttonBorderShape(ButtonBorderShape) -> some
View`](/documentation/swiftui/view/buttonbordershape\(_:\))

Sets the border shape for buttons in this view.

[`func buttonRepeatBehavior(ButtonRepeatBehavior) -> some
View`](/documentation/swiftui/view/buttonrepeatbehavior\(_:\))

Sets whether buttons in this view should repeatedly trigger their actions on
prolonged interactions.

[`var buttonRepeatBehavior:
ButtonRepeatBehavior`](/documentation/swiftui/environmentvalues/buttonrepeatbehavior)

Whether buttons with this associated environment should repeatedly trigger
their actions on prolonged interactions.

[`struct ButtonBorderShape`](/documentation/swiftui/buttonbordershape)

A shape used to draw a button’s border.

[`struct ButtonRole`](/documentation/swiftui/buttonrole)

A value that describes the purpose of a button.

[`struct ButtonRepeatBehavior`](/documentation/swiftui/buttonrepeatbehavior)

The options for controlling the repeatability of button actions.

[`struct ButtonSizing`](/documentation/swiftui/buttonsizing)

The sizing behavior of `Button`s and other button-like controls.

### [Creating special-purpose buttons](/documentation/swiftui/controls-and-
indicators#Creating-special-purpose-buttons)

[`struct EditButton`](/documentation/swiftui/editbutton)

A button that toggles the edit mode environment value.

[`struct PasteButton`](/documentation/swiftui/pastebutton)

A system button that reads items from the pasteboard and delivers it to a
closure.

[`struct RenameButton`](/documentation/swiftui/renamebutton)

A button that triggers a standard rename action.

### [Linking to other content](/documentation/swiftui/controls-and-
indicators#Linking-to-other-content)

[`struct Link`](/documentation/swiftui/link)

A control for navigating to a URL.

[`struct ShareLink`](/documentation/swiftui/sharelink)

A view that controls a sharing presentation.

[`struct SharePreview`](/documentation/swiftui/sharepreview)

A representation of a type to display in a share preview.

[`struct TextFieldLink`](/documentation/swiftui/textfieldlink)

A control that requests text input from the user when pressed.

[`struct HelpLink`](/documentation/swiftui/helplink)

A button with a standard appearance that opens app-specific help
documentation.

### [Getting numeric inputs](/documentation/swiftui/controls-and-
indicators#Getting-numeric-inputs)

[`struct Slider`](/documentation/swiftui/slider)

A control for selecting a value from a bounded linear range of values.

[`struct Stepper`](/documentation/swiftui/stepper)

A control that performs increment and decrement actions.

[`struct Toggle`](/documentation/swiftui/toggle)

A control that toggles between on and off states.

[`func toggleStyle<S>(S) -> some
View`](/documentation/swiftui/view/togglestyle\(_:\))

Sets the style for toggles in a view hierarchy.

### [Choosing from a set of options](/documentation/swiftui/controls-and-
indicators#Choosing-from-a-set-of-options)

[`struct Picker`](/documentation/swiftui/picker)

A control for selecting from a set of mutually exclusive values.

[`func pickerStyle<S>(S) -> some
View`](/documentation/swiftui/view/pickerstyle\(_:\))

Sets the style for pickers within this view.

[`func horizontalRadioGroupLayout() -> some
View`](/documentation/swiftui/view/horizontalradiogrouplayout\(\))

Sets the style for radio group style pickers within this view to be
horizontally positioned with the radio buttons inside the layout.

[`func defaultWheelPickerItemHeight(CGFloat) -> some
View`](/documentation/swiftui/view/defaultwheelpickeritemheight\(_:\))

Sets the default wheel-style picker item height.

[`var defaultWheelPickerItemHeight:
CGFloat`](/documentation/swiftui/environmentvalues/defaultwheelpickeritemheight)

The default height of an item in a wheel-style picker, such as a date picker.

[`func paletteSelectionEffect(PaletteSelectionEffect) -> some
View`](/documentation/swiftui/view/paletteselectioneffect\(_:\))

Specifies the selection effect to apply to a palette item.

[`struct
PaletteSelectionEffect`](/documentation/swiftui/paletteselectioneffect)

The selection effect to apply to a palette item.

### [Choosing dates](/documentation/swiftui/controls-and-indicators#Choosing-
dates)

[`struct DatePicker`](/documentation/swiftui/datepicker)

A control for selecting an absolute date.

[`func datePickerStyle<S>(S) -> some
View`](/documentation/swiftui/view/datepickerstyle\(_:\))

Sets the style for date pickers within this view.

[`struct MultiDatePicker`](/documentation/swiftui/multidatepicker)

A control for picking multiple dates.

[`var calendar: Calendar`](/documentation/swiftui/environmentvalues/calendar)

The current calendar that views should use when handling dates.

[`var timeZone: TimeZone`](/documentation/swiftui/environmentvalues/timezone)

The current time zone that views should use when handling dates.

### [Choosing a color](/documentation/swiftui/controls-and-
indicators#Choosing-a-color)

[`struct ColorPicker`](/documentation/swiftui/colorpicker)

A control used to select a color from the system color picker UI.

### [Indicating a value](/documentation/swiftui/controls-and-
indicators#Indicating-a-value)

[`struct Gauge`](/documentation/swiftui/gauge)

A view that shows a value within a range.

[`func gaugeStyle<S>(S) -> some
View`](/documentation/swiftui/view/gaugestyle\(_:\))

Sets the style for gauges within this view.

[`struct ProgressView`](/documentation/swiftui/progressview)

A view that shows the progress toward completion of a task.

[`func progressViewStyle<S>(S) -> some
View`](/documentation/swiftui/view/progressviewstyle\(_:\))

Sets the style for progress views in this view.

[`struct
DefaultDateProgressLabel`](/documentation/swiftui/defaultdateprogresslabel)

The default type of the current value label when used by a date-relative
progress view.

[`struct DefaultButtonLabel`](/documentation/swiftui/defaultbuttonlabel)

The default label to use for a button.

### [Indicating missing content](/documentation/swiftui/controls-and-
indicators#Indicating-missing-content)

[`struct
ContentUnavailableView`](/documentation/swiftui/contentunavailableview)

An interface, consisting of a label and additional content, that you display
when the content of your app is unavailable to users.

### [Providing haptic feedback](/documentation/swiftui/controls-and-
indicators#Providing-haptic-feedback)

[`func sensoryFeedback<T>(SensoryFeedback, trigger: T) -> some
View`](/documentation/swiftui/view/sensoryfeedback\(_:trigger:\))

Plays the specified `feedback` when the provided `trigger` value changes.

[`func
sensoryFeedback(trigger:_:)`](/documentation/swiftui/view/sensoryfeedback\(trigger:_:\))

Plays feedback when returned from the `feedback` closure after the provided
`trigger` value changes.

[`func sensoryFeedback<T>(SensoryFeedback, trigger: T, condition: (T, T) ->
Bool) -> some
View`](/documentation/swiftui/view/sensoryfeedback\(_:trigger:condition:\))

Plays the specified `feedback` when the provided `trigger` value changes and
the `condition` closure returns `true`.

[`struct SensoryFeedback`](/documentation/swiftui/sensoryfeedback)

Represents a type of haptic and/or audio feedback that can be played.

### [Sizing controls](/documentation/swiftui/controls-and-indicators#Sizing-
controls)

[`func controlSize(_:)`](/documentation/swiftui/view/controlsize\(_:\))

Sets the size for controls within this view.

[`var controlSize:
ControlSize`](/documentation/swiftui/environmentvalues/controlsize)

The size to apply to controls within a view.

[`enum ControlSize`](/documentation/swiftui/controlsize)

The size classes, like regular or small, that you can apply to controls within
a view.

## [See Also](/documentation/swiftui/controls-and-indicators#see-also)

### [Views](/documentation/swiftui/controls-and-indicators#Views)

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

[API ReferenceMenus and commands](/documentation/swiftui/menus-and-commands)

Provide space-efficient, context-dependent access to commands and controls.

[API ReferenceShapes](/documentation/swiftui/shapes)

Trace and fill built-in and custom shapes with a color, gradient, or other
pattern.

[API ReferenceDrawing and graphics](/documentation/swiftui/drawing-and-
graphics)

Enhance your views with graphical effects and customized drawings.

