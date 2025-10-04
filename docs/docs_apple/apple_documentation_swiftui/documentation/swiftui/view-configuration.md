Collection

  * [ SwiftUI ](/documentation/swiftui)
  * View configuration 

API Collection

# View configuration

Adjust the characteristics of views in a hierarchy.

## [Overview](/documentation/swiftui/view-configuration#Overview)

SwiftUI enables you to tune the appearance and behavior of views using view
modifiers.

Many modifiers apply to specific kinds of views or behaviors, but some apply
more generally. For example, you can conditionally hide any view by
dynamically setting its opacity, display contextual help when people hover
over a view, or request the light or dark appearance for a view.

## [Topics](/documentation/swiftui/view-configuration#topics)

### [Hiding views](/documentation/swiftui/view-configuration#Hiding-views)

[`func opacity(Double) -> some
View`](/documentation/swiftui/view/opacity\(_:\))

Sets the transparency of this view.

[`func hidden() -> some View`](/documentation/swiftui/view/hidden\(\))

Hides this view unconditionally.

### [Hiding system elements](/documentation/swiftui/view-configuration#Hiding-
system-elements)

[`func labelsHidden() -> some
View`](/documentation/swiftui/view/labelshidden\(\))

Hides the labels of any controls contained within this view.

[`func labelsVisibility(Visibility) -> some
View`](/documentation/swiftui/view/labelsvisibility\(_:\))

Controls the visibility of labels of any controls contained within this view.

[`var labelsVisibility:
Visibility`](/documentation/swiftui/environmentvalues/labelsvisibility)

The labels visibility set by
[`labelsVisibility(_:)`](/documentation/swiftui/view/labelsvisibility\(_:\)).

[`func menuIndicator(Visibility) -> some
View`](/documentation/swiftui/view/menuindicator\(_:\))

Sets the menu indicator visibility for controls within this view.

[`func statusBarHidden(Bool) -> some
View`](/documentation/swiftui/view/statusbarhidden\(_:\))

Sets the visibility of the status bar.

[`func persistentSystemOverlays(Visibility) -> some
View`](/documentation/swiftui/view/persistentsystemoverlays\(_:\))

Sets the preferred visibility of the non-transient system views overlaying the
app.

[`enum Visibility`](/documentation/swiftui/visibility)

The visibility of a UI element, chosen automatically based on the platform,
current context, and other factors.

### [Managing view interaction](/documentation/swiftui/view-
configuration#Managing-view-interaction)

[`func disabled(Bool) -> some
View`](/documentation/swiftui/view/disabled\(_:\))

Adds a condition that controls whether users can interact with this view.

[`var isEnabled: Bool`](/documentation/swiftui/environmentvalues/isenabled)

A Boolean value that indicates whether the view associated with this
environment allows user interaction.

[`func interactionActivityTrackingTag(String) -> some
View`](/documentation/swiftui/view/interactionactivitytrackingtag\(_:\))

Sets a tag that you use for tracking interactivity.

[`func invalidatableContent(Bool) -> some
View`](/documentation/swiftui/view/invalidatablecontent\(_:\))

Mark the receiver as their content might be invalidated.

### [Providing contextual help](/documentation/swiftui/view-
configuration#Providing-contextual-help)

[`func help(_:)`](/documentation/swiftui/view/help\(_:\))

Adds help text to a view using a text view that you provide.

### [Detecting and requesting the light or dark
appearance](/documentation/swiftui/view-configuration#Detecting-and-
requesting-the-light-or-dark-appearance)

[`func preferredColorScheme(ColorScheme?) -> some
View`](/documentation/swiftui/view/preferredcolorscheme\(_:\))

Sets the preferred color scheme for this presentation.

[`var colorScheme:
ColorScheme`](/documentation/swiftui/environmentvalues/colorscheme)

The color scheme of this environment.

[`enum ColorScheme`](/documentation/swiftui/colorscheme)

The possible color schemes, corresponding to the light and dark appearances.

### [Getting the color scheme contrast](/documentation/swiftui/view-
configuration#Getting-the-color-scheme-contrast)

[`var colorSchemeContrast:
ColorSchemeContrast`](/documentation/swiftui/environmentvalues/colorschemecontrast)

The contrast associated with the color scheme of this environment.

[`enum ColorSchemeContrast`](/documentation/swiftui/colorschemecontrast)

The contrast between the app’s foreground and background colors.

### [Configuring passthrough](/documentation/swiftui/view-
configuration#Configuring-passthrough)

[`func preferredSurroundingsEffect(SurroundingsEffect?) -> some
View`](/documentation/swiftui/view/preferredsurroundingseffect\(_:\))

Applies an effect to passthrough video.

[`struct SurroundingsEffect`](/documentation/swiftui/surroundingseffect)

Effects that the system can apply to passthrough video.

[`struct BreakthroughEffect`](/documentation/swiftui/breakthrougheffect)

### [Redacting private content](/documentation/swiftui/view-
configuration#Redacting-private-content)

[Designing your app for the Always On state](/documentation/watchOS-
Apps/designing-your-app-for-the-always-on-state)

Customize your watchOS app’s user interface for continuous display.

[`func privacySensitive(Bool) -> some
View`](/documentation/swiftui/view/privacysensitive\(_:\))

Marks the view as containing sensitive, private user data.

[`func redacted(reason: RedactionReasons) -> some
View`](/documentation/swiftui/view/redacted\(reason:\))

Adds a reason to apply a redaction to this view hierarchy.

[`func unredacted() -> some View`](/documentation/swiftui/view/unredacted\(\))

Removes any reason to apply a redaction to this view hierarchy.

[`var redactionReasons:
RedactionReasons`](/documentation/swiftui/environmentvalues/redactionreasons)

The current redaction reasons applied to the view hierarchy.

[`var isSceneCaptured:
Bool`](/documentation/swiftui/environmentvalues/isscenecaptured)

The current capture state.

[`struct RedactionReasons`](/documentation/swiftui/redactionreasons)

The reasons to apply a redaction to data displayed on screen.

## [See Also](/documentation/swiftui/view-configuration#see-also)

### [Views](/documentation/swiftui/view-configuration#Views)

[API ReferenceView fundamentals](/documentation/swiftui/view-fundamentals)

Define the visual elements of your app using a hierarchy of views.

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

