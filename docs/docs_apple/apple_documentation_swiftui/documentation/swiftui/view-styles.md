Collection

  * [ SwiftUI ](/documentation/swiftui)
  * View styles 

API Collection

# View styles

Apply built-in and custom appearances and behaviors to different types of
views.

## [Overview](/documentation/swiftui/view-styles#Overview)

SwiftUI defines built-in styles for certain kinds of views and automatically
selects the appropriate style for a particular presentation context. For
example, a [`Label`](/documentation/swiftui/label) might appear as an icon, a
string title, or both, depending on factors like the platform, whether the
view appears in a toolbar, and so on.

You can override the automatic style by using one of the style view modifiers.
These modifiers typically propagate throughout a container view, so that you
can wrap a view hierarchy in a style modifier to affect all the views of the
given type within the hierarchy.

Any of the style protocols that define a `makeBody(configuration:)` method,
like [`ToggleStyle`](/documentation/swiftui/togglestyle), also enable you to
define custom styles. Create a type that conforms to the corresponding style
protocol and implement its `makeBody(configuration:)` method. Then apply the
new style using a style view modifier exactly like a built-in style.

## [Topics](/documentation/swiftui/view-styles#topics)

### [Styling views with Liquid Glass](/documentation/swiftui/view-
styles#Styling-views-with-Liquid-Glass)

[Applying Liquid Glass to custom views](/documentation/swiftui/applying-
liquid-glass-to-custom-views)

Configure, combine, and morph views using Liquid Glass effects.

[Landmarks: Building an app with Liquid
Glass](/documentation/swiftui/landmarks-building-an-app-with-liquid-glass)

Enhance your app experience with system-provided and custom Liquid Glass.

[`func glassEffect(Glass, in: some Shape) -> some
View`](/documentation/swiftui/view/glasseffect\(_:in:\))

Applies the Liquid Glass effect to a view.

[`func interactive(Bool) ->
Glass`](/documentation/swiftui/glass/interactive\(_:\))

Returns a copy of the structure configured to be interactive.

[`struct GlassEffectContainer`](/documentation/swiftui/glasseffectcontainer)

A view that combines multiple Liquid Glass shapes into a single shape that can
morph individual shapes into one another.

[`struct GlassEffectTransition`](/documentation/swiftui/glasseffecttransition)

A structure that describes changes to apply when a glass effect is added or
removed from the view hierarchy.

[`struct GlassButtonStyle`](/documentation/swiftui/glassbuttonstyle)

A button style that applies glass border artwork based on the button’s
context.

[`struct
GlassProminentButtonStyle`](/documentation/swiftui/glassprominentbuttonstyle)

A button style that applies prominent glass border artwork based on the
button’s context.

[`struct
DefaultGlassEffectShape`](/documentation/swiftui/defaultglasseffectshape)

The default shape applied by glass effects, a capsule.

### [Styling buttons](/documentation/swiftui/view-styles#Styling-buttons)

[`func buttonStyle(_:)`](/documentation/swiftui/view/buttonstyle\(_:\))

Sets the style for buttons within this view to a button style with a custom
appearance and standard interaction behavior.

[`protocol ButtonStyle`](/documentation/swiftui/buttonstyle)

A type that applies standard interaction behavior and a custom appearance to
all buttons within a view hierarchy.

[`struct
ButtonStyleConfiguration`](/documentation/swiftui/buttonstyleconfiguration)

The properties of a button.

[`protocol PrimitiveButtonStyle`](/documentation/swiftui/primitivebuttonstyle)

A type that applies custom interaction behavior and a custom appearance to all
buttons within a view hierarchy.

[`struct
PrimitiveButtonStyleConfiguration`](/documentation/swiftui/primitivebuttonstyleconfiguration)

The properties of a button.

[`func signInWithAppleButtonStyle(SignInWithAppleButton.Style) -> some
View`](/documentation/swiftui/view/signinwithapplebuttonstyle\(_:\))

Sets the style used for displaying the control (see
`SignInWithAppleButton.Style`).

### [Styling pickers](/documentation/swiftui/view-styles#Styling-pickers)

[`func pickerStyle<S>(S) -> some
View`](/documentation/swiftui/view/pickerstyle\(_:\))

Sets the style for pickers within this view.

[`protocol PickerStyle`](/documentation/swiftui/pickerstyle)

A type that specifies the appearance and interaction of all pickers within a
view hierarchy.

[`func datePickerStyle<S>(S) -> some
View`](/documentation/swiftui/view/datepickerstyle\(_:\))

Sets the style for date pickers within this view.

[`protocol DatePickerStyle`](/documentation/swiftui/datepickerstyle)

A type that specifies the appearance and interaction of all date pickers
within a view hierarchy.

### [Styling menus](/documentation/swiftui/view-styles#Styling-menus)

[`func menuStyle<S>(S) -> some
View`](/documentation/swiftui/view/menustyle\(_:\))

Sets the style for menus within this view.

[`protocol MenuStyle`](/documentation/swiftui/menustyle)

A type that applies standard interaction behavior and a custom appearance to
all menus within a view hierarchy.

[`struct
MenuStyleConfiguration`](/documentation/swiftui/menustyleconfiguration)

A configuration of a menu.

### [Styling toggles](/documentation/swiftui/view-styles#Styling-toggles)

[`func toggleStyle<S>(S) -> some
View`](/documentation/swiftui/view/togglestyle\(_:\))

Sets the style for toggles in a view hierarchy.

[`protocol ToggleStyle`](/documentation/swiftui/togglestyle)

The appearance and behavior of a toggle.

[`struct
ToggleStyleConfiguration`](/documentation/swiftui/togglestyleconfiguration)

The properties of a toggle instance.

### [Styling indicators](/documentation/swiftui/view-styles#Styling-
indicators)

[`func gaugeStyle<S>(S) -> some
View`](/documentation/swiftui/view/gaugestyle\(_:\))

Sets the style for gauges within this view.

[`protocol GaugeStyle`](/documentation/swiftui/gaugestyle)

Defines the implementation of all gauge instances within a view hierarchy.

[`struct
GaugeStyleConfiguration`](/documentation/swiftui/gaugestyleconfiguration)

The properties of a gauge instance.

[`func progressViewStyle<S>(S) -> some
View`](/documentation/swiftui/view/progressviewstyle\(_:\))

Sets the style for progress views in this view.

[`protocol ProgressViewStyle`](/documentation/swiftui/progressviewstyle)

A type that applies standard interaction behavior to all progress views within
a view hierarchy.

[`struct
ProgressViewStyleConfiguration`](/documentation/swiftui/progressviewstyleconfiguration)

The properties of a progress view instance.

### [Styling views that display text](/documentation/swiftui/view-
styles#Styling-views-that-display-text)

[`func labelStyle<S>(S) -> some
View`](/documentation/swiftui/view/labelstyle\(_:\))

Sets the style for labels within this view.

[`protocol LabelStyle`](/documentation/swiftui/labelstyle)

A type that applies a custom appearance to all labels within a view.

[`struct
LabelStyleConfiguration`](/documentation/swiftui/labelstyleconfiguration)

The properties of a label.

[`func textFieldStyle<S>(S) -> some
View`](/documentation/swiftui/view/textfieldstyle\(_:\))

Sets the style for text fields within this view.

[`protocol TextFieldStyle`](/documentation/swiftui/textfieldstyle)

A specification for the appearance and interaction of a text field.

[`func textEditorStyle(some TextEditorStyle) -> some
View`](/documentation/swiftui/view/texteditorstyle\(_:\))

Sets the style for text editors within this view.

[`protocol TextEditorStyle`](/documentation/swiftui/texteditorstyle)

A specification for the appearance and interaction of a text editor.

[`struct
TextEditorStyleConfiguration`](/documentation/swiftui/texteditorstyleconfiguration)

The properties of a text editor.

### [Styling collection views](/documentation/swiftui/view-styles#Styling-
collection-views)

[`func listStyle<S>(S) -> some
View`](/documentation/swiftui/view/liststyle\(_:\))

Sets the style for lists within this view.

[`protocol ListStyle`](/documentation/swiftui/liststyle)

A protocol that describes the behavior and appearance of a list.

[`func tableStyle<S>(S) -> some
View`](/documentation/swiftui/view/tablestyle\(_:\))

Sets the style for tables within this view.

[`protocol TableStyle`](/documentation/swiftui/tablestyle)

A type that applies a custom appearance to all tables within a view.

[`struct
TableStyleConfiguration`](/documentation/swiftui/tablestyleconfiguration)

The properties of a table.

[`func disclosureGroupStyle<S>(S) -> some
View`](/documentation/swiftui/view/disclosuregroupstyle\(_:\))

Sets the style for disclosure groups within this view.

[`protocol DisclosureGroupStyle`](/documentation/swiftui/disclosuregroupstyle)

A type that specifies the appearance and interaction of disclosure groups
within a view hierarchy.

### [Styling navigation views](/documentation/swiftui/view-styles#Styling-
navigation-views)

[`func navigationSplitViewStyle<S>(S) -> some
View`](/documentation/swiftui/view/navigationsplitviewstyle\(_:\))

Sets the style for navigation split views within this view.

[`protocol
NavigationSplitViewStyle`](/documentation/swiftui/navigationsplitviewstyle)

A type that specifies the appearance and interaction of navigation split views
within a view hierarchy.

[`func tabViewStyle<S>(S) -> some
View`](/documentation/swiftui/view/tabviewstyle\(_:\))

Sets the style for the tab view within the current environment.

[`protocol TabViewStyle`](/documentation/swiftui/tabviewstyle)

A specification for the appearance and interaction of a tab view.

### [Styling groups](/documentation/swiftui/view-styles#Styling-groups)

[`func controlGroupStyle<S>(S) -> some
View`](/documentation/swiftui/view/controlgroupstyle\(_:\))

Sets the style for control groups within this view.

[`protocol ControlGroupStyle`](/documentation/swiftui/controlgroupstyle)

Defines the implementation of all control groups within a view hierarchy.

[`struct
ControlGroupStyleConfiguration`](/documentation/swiftui/controlgroupstyleconfiguration)

The properties of a control group.

[`func formStyle<S>(S) -> some
View`](/documentation/swiftui/view/formstyle\(_:\))

Sets the style for forms in a view hierarchy.

[`protocol FormStyle`](/documentation/swiftui/formstyle)

The appearance and behavior of a form.

[`struct
FormStyleConfiguration`](/documentation/swiftui/formstyleconfiguration)

The properties of a form instance.

[`func groupBoxStyle<S>(S) -> some
View`](/documentation/swiftui/view/groupboxstyle\(_:\))

Sets the style for group boxes within this view.

[`protocol GroupBoxStyle`](/documentation/swiftui/groupboxstyle)

A type that specifies the appearance and interaction of all group boxes within
a view hierarchy.

[`struct
GroupBoxStyleConfiguration`](/documentation/swiftui/groupboxstyleconfiguration)

The properties of a group box instance.

[`func indexViewStyle<S>(S) -> some
View`](/documentation/swiftui/view/indexviewstyle\(_:\))

Sets the style for the index view within the current environment.

[`protocol IndexViewStyle`](/documentation/swiftui/indexviewstyle)

Defines the implementation of all `IndexView` instances within a view
hierarchy.

[`func labeledContentStyle<S>(S) -> some
View`](/documentation/swiftui/view/labeledcontentstyle\(_:\))

Sets a style for labeled content.

[`protocol LabeledContentStyle`](/documentation/swiftui/labeledcontentstyle)

The appearance and behavior of a labeled content instance..

[`struct
LabeledContentStyleConfiguration`](/documentation/swiftui/labeledcontentstyleconfiguration)

The properties of a labeled content instance.

### [Styling windows from a view inside the
window](/documentation/swiftui/view-styles#Styling-windows-from-a-view-inside-
the-window)

[`func presentedWindowStyle<S>(S) -> some
View`](/documentation/swiftui/view/presentedwindowstyle\(_:\))

Sets the style for windows created by interacting with this view.

[`func presentedWindowToolbarStyle<S>(S) -> some
View`](/documentation/swiftui/view/presentedwindowtoolbarstyle\(_:\))

Sets the style for the toolbar in windows created by interacting with this
view.

### [Adding a glass background on views in
visionOS](/documentation/swiftui/view-styles#Adding-a-glass-background-on-
views-in-visionOS)

[`func glassBackgroundEffect(displayMode: GlassBackgroundDisplayMode) -> some
View`](/documentation/swiftui/view/glassbackgroundeffect\(displaymode:\))

Fills the view’s background with an automatic glass background effect and
container-relative rounded rectangle shape.

[`func glassBackgroundEffect<S>(in: S, displayMode:
GlassBackgroundDisplayMode) -> some
View`](/documentation/swiftui/view/glassbackgroundeffect\(in:displaymode:\))

Fills the view’s background with an automatic glass background effect and a
shape that you specify.

[`enum
GlassBackgroundDisplayMode`](/documentation/swiftui/glassbackgrounddisplaymode)

The display mode of a glass background.

[`protocol
GlassBackgroundEffect`](/documentation/swiftui/glassbackgroundeffect)

A specification for the appearance of a glass background.

[`struct
AutomaticGlassBackgroundEffect`](/documentation/swiftui/automaticglassbackgroundeffect)

The automatic glass background effect.

[`struct
GlassBackgroundEffectConfiguration`](/documentation/swiftui/glassbackgroundeffectconfiguration)

A configuration used to build a custom effect.

[`struct
FeatheredGlassBackgroundEffect`](/documentation/swiftui/featheredglassbackgroundeffect)

The feathered glass background effect.

[`struct
PlateGlassBackgroundEffect`](/documentation/swiftui/plateglassbackgroundeffect)

The plate glass background effect.

## [See Also](/documentation/swiftui/view-styles#see-also)

### [Views](/documentation/swiftui/view-styles#Views)

[API ReferenceView fundamentals](/documentation/swiftui/view-fundamentals)

Define the visual elements of your app using a hierarchy of views.

[API ReferenceView configuration](/documentation/swiftui/view-configuration)

Adjust the characteristics of views in a hierarchy.

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

