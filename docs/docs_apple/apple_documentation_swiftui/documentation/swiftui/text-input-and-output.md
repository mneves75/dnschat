Collection

  * [ SwiftUI ](/documentation/swiftui)
  * Text input and output 

API Collection

# Text input and output

Display formatted text and get text input from the user.

## [Overview](/documentation/swiftui/text-input-and-output#Overview)

To display read-only text, or read-only text paired with an image, use the
built-in [`Text`](/documentation/swiftui/text) or
[`Label`](/documentation/swiftui/label) views, respectively. When you need to
collect text input from the user, use an appropriate text input view, like
[`TextField`](/documentation/swiftui/textfield) or
[`TextEditor`](/documentation/swiftui/texteditor).

You add view modifiers to control the text’s font, selectability, alignment,
layout direction, and so on. These modifiers also affect other views that
display text, like the labels on controls, even if you don’t define an
explicit [`Text`](/documentation/swiftui/text) view.

For design guidance, see [Typography](/design/Human-Interface-
Guidelines/typography) in the Human Interface Guidelines.

## [Topics](/documentation/swiftui/text-input-and-output#topics)

### [Displaying text](/documentation/swiftui/text-input-and-output#Displaying-
text)

[`struct Text`](/documentation/swiftui/text)

A view that displays one or more lines of read-only text.

[`struct Label`](/documentation/swiftui/label)

A standard label for user interface items, consisting of an icon with a title.

[`func labelStyle<S>(S) -> some
View`](/documentation/swiftui/view/labelstyle\(_:\))

Sets the style for labels within this view.

### [Getting text input](/documentation/swiftui/text-input-and-output#Getting-
text-input)

[Building rich SwiftUI text experiences](/documentation/swiftui/building-rich-
swiftui-text-experiences)

Build an editor for formatted text using SwiftUI text editor views and
attributed strings.

[`struct TextField`](/documentation/swiftui/textfield)

A control that displays an editable text interface.

[`func textFieldStyle<S>(S) -> some
View`](/documentation/swiftui/view/textfieldstyle\(_:\))

Sets the style for text fields within this view.

[`struct SecureField`](/documentation/swiftui/securefield)

A control into which people securely enter private text.

[`struct TextEditor`](/documentation/swiftui/texteditor)

A view that can display and edit long-form text.

### [Selecting text](/documentation/swiftui/text-input-and-output#Selecting-
text)

[`func textSelection<S>(S) -> some
View`](/documentation/swiftui/view/textselection\(_:\))

Controls whether people can select text within this view.

[`protocol TextSelectability`](/documentation/swiftui/textselectability)

A type that describes the ability to select text.

[`struct TextSelection`](/documentation/swiftui/textselection)

Represents a selection of text.

[`func textSelectionAffinity(TextSelectionAffinity) -> some
View`](/documentation/swiftui/view/textselectionaffinity\(_:\))

Sets the direction of a selection or cursor relative to a text character.

[`var textSelectionAffinity:
TextSelectionAffinity`](/documentation/swiftui/environmentvalues/textselectionaffinity)

A representation of the direction or association of a selection or cursor
relative to a text character. This concept becomes much more prominent when
dealing with bidirectional text (text that contains both LTR and RTL scripts,
like English and Arabic combined).

[`enum TextSelectionAffinity`](/documentation/swiftui/textselectionaffinity)

A representation of the direction or association of a selection or cursor
relative to a text character. This concept becomes much more prominent when
dealing with bidirectional text (text that contains both LTR and RTL scripts,
like English and Arabic combined).

[`struct
AttributedTextSelection`](/documentation/swiftui/attributedtextselection)

Represents a selection of attributed text.

### [Setting a font](/documentation/swiftui/text-input-and-output#Setting-a-
font)

[Applying custom fonts to text](/documentation/swiftui/applying-custom-fonts-
to-text)

Add and use a font in your app that scales with Dynamic Type.

[`func font(Font?) -> some View`](/documentation/swiftui/view/font\(_:\))

Sets the default font for text in this view.

[`func fontDesign(Font.Design?) -> some
View`](/documentation/swiftui/view/fontdesign\(_:\))

Sets the font design of the text in this view.

[`func fontWeight(Font.Weight?) -> some
View`](/documentation/swiftui/view/fontweight\(_:\))

Sets the font weight of the text in this view.

[`func fontWidth(Font.Width?) -> some
View`](/documentation/swiftui/view/fontwidth\(_:\))

Sets the font width of the text in this view.

[`var font: Font?`](/documentation/swiftui/environmentvalues/font)

The default font of this environment.

[`struct Font`](/documentation/swiftui/font)

An environment-dependent font.

### [Adjusting text size](/documentation/swiftui/text-input-and-
output#Adjusting-text-size)

[`func textScale(Text.Scale, isEnabled: Bool) -> some
View`](/documentation/swiftui/view/textscale\(_:isenabled:\))

Applies a text scale to text in the view.

[`func
dynamicTypeSize(_:)`](/documentation/swiftui/view/dynamictypesize\(_:\))

Sets the Dynamic Type size within the view to the given value.

[`var dynamicTypeSize:
DynamicTypeSize`](/documentation/swiftui/environmentvalues/dynamictypesize)

The current Dynamic Type size.

[`enum DynamicTypeSize`](/documentation/swiftui/dynamictypesize)

A Dynamic Type size, which specifies how large scalable content should be.

[`struct ScaledMetric`](/documentation/swiftui/scaledmetric)

A dynamic property that scales a numeric value.

[`protocol
TextVariantPreference`](/documentation/swiftui/textvariantpreference)

A protocol for controlling the size variant of text views.

[`struct FixedTextVariant`](/documentation/swiftui/fixedtextvariant)

The default text variant preference that chooses the largest available
variant.

[`struct
SizeDependentTextVariant`](/documentation/swiftui/sizedependenttextvariant)

The size dependent variant preference allows the text to take the available
space into account when choosing the variant to display.

### [Controlling text style](/documentation/swiftui/text-input-and-
output#Controlling-text-style)

[`func bold(Bool) -> some View`](/documentation/swiftui/view/bold\(_:\))

Applies a bold font weight to the text in this view.

[`func italic(Bool) -> some View`](/documentation/swiftui/view/italic\(_:\))

Applies italics to the text in this view.

[`func underline(Bool, pattern: Text.LineStyle.Pattern, color: Color?) -> some
View`](/documentation/swiftui/view/underline\(_:pattern:color:\))

Applies an underline to the text in this view.

[`func strikethrough(Bool, pattern: Text.LineStyle.Pattern, color: Color?) ->
some View`](/documentation/swiftui/view/strikethrough\(_:pattern:color:\))

Applies a strikethrough to the text in this view.

[`func textCase(Text.Case?) -> some
View`](/documentation/swiftui/view/textcase\(_:\))

Sets a transform for the case of the text contained in this view when
displayed.

[`var textCase:
Text.Case?`](/documentation/swiftui/environmentvalues/textcase)

A stylistic override to transform the case of `Text` when displayed, using the
environment’s locale.

[`func monospaced(Bool) -> some
View`](/documentation/swiftui/view/monospaced\(_:\))

Modifies the fonts of all child views to use the fixed-width variant of the
current font, if possible.

[`func monospacedDigit() -> some
View`](/documentation/swiftui/view/monospaceddigit\(\))

Modifies the fonts of all child views to use fixed-width digits, if possible,
while leaving other characters proportionally spaced.

[`protocol
AttributedTextFormattingDefinition`](/documentation/swiftui/attributedtextformattingdefinition)

A protocol for defining how text can be styled in a view.

[`protocol
AttributedTextValueConstraint`](/documentation/swiftui/attributedtextvalueconstraint)

A protocol for defining a constraint on the value of a certain attribute.

[`enum
AttributedTextFormatting`](/documentation/swiftui/attributedtextformatting)

A namespace for types related to attributed text formatting definitions.

### [Managing text layout](/documentation/swiftui/text-input-and-
output#Managing-text-layout)

[`func truncationMode(Text.TruncationMode) -> some
View`](/documentation/swiftui/view/truncationmode\(_:\))

Sets the truncation mode for lines of text that are too long to fit in the
available space.

[`var truncationMode:
Text.TruncationMode`](/documentation/swiftui/environmentvalues/truncationmode)

A value that indicates how the layout truncates the last line of text to fit
into the available space.

[`func allowsTightening(Bool) -> some
View`](/documentation/swiftui/view/allowstightening\(_:\))

Sets whether text in this view can compress the space between characters when
necessary to fit text in a line.

[`var allowsTightening:
Bool`](/documentation/swiftui/environmentvalues/allowstightening)

A Boolean value that indicates whether inter-character spacing should tighten
to fit the text into the available space.

[`func minimumScaleFactor(CGFloat) -> some
View`](/documentation/swiftui/view/minimumscalefactor\(_:\))

Sets the minimum amount that text in this view scales down to fit in the
available space.

[`var minimumScaleFactor:
CGFloat`](/documentation/swiftui/environmentvalues/minimumscalefactor)

The minimum permissible proportion to shrink the font size to fit the text
into the available space.

[`func baselineOffset(CGFloat) -> some
View`](/documentation/swiftui/view/baselineoffset\(_:\))

Sets the vertical offset for the text relative to its baseline in this view.

[`func kerning(CGFloat) -> some
View`](/documentation/swiftui/view/kerning\(_:\))

Sets the spacing, or kerning, between characters for the text in this view.

[`func tracking(CGFloat) -> some
View`](/documentation/swiftui/view/tracking\(_:\))

Sets the tracking for the text in this view.

[`func flipsForRightToLeftLayoutDirection(Bool) -> some
View`](/documentation/swiftui/view/flipsforrighttoleftlayoutdirection\(_:\))

Sets whether this view mirrors its contents horizontally when the layout
direction is right-to-left.

[`enum TextAlignment`](/documentation/swiftui/textalignment)

An alignment position for text along the horizontal axis.

### [Rendering text](/documentation/swiftui/text-input-and-output#Rendering-
text)

[Creating visual effects with SwiftUI](/documentation/swiftui/creating-visual-
effects-with-swiftui)

Add scroll effects, rich color treatments, custom transitions, and advanced
effects using shaders and a text renderer.

[`protocol TextAttribute`](/documentation/swiftui/textattribute)

A value that you can attach to text views and that text renderers can query.

[`func textRenderer<T>(T) -> some
View`](/documentation/swiftui/view/textrenderer\(_:\))

Returns a new view such that any text views within it will use `renderer` to
draw themselves.

[`protocol TextRenderer`](/documentation/swiftui/textrenderer)

A value that can replace the default text view rendering behavior.

[`struct TextProxy`](/documentation/swiftui/textproxy)

A proxy for a text view that custom text renderers use.

### [Limiting line count for multiline text](/documentation/swiftui/text-
input-and-output#Limiting-line-count-for-multiline-text)

[`func lineLimit(_:)`](/documentation/swiftui/view/linelimit\(_:\))

Sets to a closed range the number of lines that text can occupy in this view.

[`func lineLimit(Int, reservesSpace: Bool) -> some
View`](/documentation/swiftui/view/linelimit\(_:reservesspace:\))

Sets a limit for the number of lines text can occupy in this view.

[`var lineLimit: Int?`](/documentation/swiftui/environmentvalues/linelimit)

The maximum number of lines that text can occupy in a view.

### [Formatting multiline text](/documentation/swiftui/text-input-and-
output#Formatting-multiline-text)

[`func lineSpacing(CGFloat) -> some
View`](/documentation/swiftui/view/linespacing\(_:\))

Sets the amount of space between lines of text in this view.

[`var lineSpacing:
CGFloat`](/documentation/swiftui/environmentvalues/linespacing)

The distance in points between the bottom of one line fragment and the top of
the next.

[`func multilineTextAlignment(TextAlignment) -> some
View`](/documentation/swiftui/view/multilinetextalignment\(_:\))

Sets the alignment of a text view that contains multiple lines of text.

[`var multilineTextAlignment:
TextAlignment`](/documentation/swiftui/environmentvalues/multilinetextalignment)

An environment value that indicates how a text view aligns its lines when the
content wraps or contains newlines.

### [Formatting date and time](/documentation/swiftui/text-input-and-
output#Formatting-date-and-time)

[`enum SystemFormatStyle`](/documentation/swiftui/systemformatstyle)

A namespace for format styles that implement designs used across Apple’s
platformes.

[`struct TimeDataSource`](/documentation/swiftui/timedatasource)

A source of time related data.

### [Managing text entry](/documentation/swiftui/text-input-and-
output#Managing-text-entry)

[`func autocorrectionDisabled(Bool) -> some
View`](/documentation/swiftui/view/autocorrectiondisabled\(_:\))

Sets whether to disable autocorrection for this view.

[`var autocorrectionDisabled:
Bool`](/documentation/swiftui/environmentvalues/autocorrectiondisabled)

A Boolean value that determines whether the view hierarchy has auto-correction
enabled.

[`func keyboardType(UIKeyboardType) -> some
View`](/documentation/swiftui/view/keyboardtype\(_:\))

Sets the keyboard type for this view.

[`func scrollDismissesKeyboard(ScrollDismissesKeyboardMode) -> some
View`](/documentation/swiftui/view/scrolldismisseskeyboard\(_:\))

Configures the behavior in which scrollable content interacts with the
software keyboard.

[`func
textContentType(_:)`](/documentation/swiftui/view/textcontenttype\(_:\))

Sets the text content type for this view, which the system uses to offer
suggestions while the user enters text on macOS.

[`func textInputAutocapitalization(TextInputAutocapitalization?) -> some
View`](/documentation/swiftui/view/textinputautocapitalization\(_:\))

Sets how often the shift key in the keyboard is automatically enabled.

[`struct
TextInputAutocapitalization`](/documentation/swiftui/textinputautocapitalization)

The kind of autocapitalization behavior applied during text input.

[`func textInputCompletion(String) -> some
View`](/documentation/swiftui/view/textinputcompletion\(_:\))

Associates a fully formed string with the value of this view when used as a
text input suggestion

[`func textInputSuggestions<S>(() -> S) -> some
View`](/documentation/swiftui/view/textinputsuggestions\(_:\))

Configures the text input suggestions for this view.

[`func textInputSuggestions<Data, Content>(Data, content: (Data.Element) ->
Content) -> some
View`](/documentation/swiftui/view/textinputsuggestions\(_:content:\))

Configures the text input suggestions for this view.

[`func textInputSuggestions<Data, ID, Content>(Data, id: KeyPath<Data.Element,
ID>, content: (Data.Element) -> Content) -> some
View`](/documentation/swiftui/view/textinputsuggestions\(_:id:content:\))

Configures the text input suggestions for this view.

[`func textContentType(WKTextContentType?) -> some
View`](/documentation/swiftui/view/textcontenttype\(_:\)-4dqqb)

Sets the text content type for this view, which the system uses to offer
suggestions while the user enters text on a watchOS device.

[`func textContentType(NSTextContentType?) -> some
View`](/documentation/swiftui/view/textcontenttype\(_:\)-6fic1)

Sets the text content type for this view, which the system uses to offer
suggestions while the user enters text on macOS.

[`func textContentType(UITextContentType?) -> some
View`](/documentation/swiftui/view/textcontenttype\(_:\)-ufdv)

Sets the text content type for this view, which the system uses to offer
suggestions while the user enters text on an iOS or tvOS device.

[`struct
TextInputFormattingControlPlacement`](/documentation/swiftui/textinputformattingcontrolplacement)

A structure defining the system text formatting controls available on each
platform.

### [Dictating text](/documentation/swiftui/text-input-and-output#Dictating-
text)

[`func searchDictationBehavior(TextInputDictationBehavior) -> some
View`](/documentation/swiftui/view/searchdictationbehavior\(_:\))

Configures the dictation behavior for any search fields configured by the
searchable modifier.

[`struct
TextInputDictationActivation`](/documentation/swiftui/textinputdictationactivation)

[`struct
TextInputDictationBehavior`](/documentation/swiftui/textinputdictationbehavior)

### [Configuring the Writing Tools behavior](/documentation/swiftui/text-
input-and-output#Configuring-the-Writing-Tools-behavior)

[`func writingToolsBehavior(WritingToolsBehavior) -> some
View`](/documentation/swiftui/view/writingtoolsbehavior\(_:\))

Specifies the Writing Tools behavior for text and text input in the
environment.

[`struct WritingToolsBehavior`](/documentation/swiftui/writingtoolsbehavior)

The Writing Tools editing experience for text and text input.

### [Specifying text equivalents](/documentation/swiftui/text-input-and-
output#Specifying-text-equivalents)

[`func
typeSelectEquivalent(_:)`](/documentation/swiftui/view/typeselectequivalent\(_:\))

Sets an explicit type select equivalent text in a collection, such as a list
or table.

### [Localizing text](/documentation/swiftui/text-input-and-output#Localizing-
text)

[Preparing views for localization](/documentation/swiftui/preparing-views-for-
localization)

Specify hints and add strings to localize your SwiftUI views.

[`struct LocalizedStringKey`](/documentation/swiftui/localizedstringkey)

The key used to look up an entry in a strings file or strings dictionary file.

[`var locale: Locale`](/documentation/swiftui/environmentvalues/locale)

The current locale that views should use.

[`func
typesettingLanguage(_:isEnabled:)`](/documentation/swiftui/view/typesettinglanguage\(_:isenabled:\))

Specifies the language for typesetting.

[`struct TypesettingLanguage`](/documentation/swiftui/typesettinglanguage)

Defines how typesetting language is determined for text.

### [Deprecated types](/documentation/swiftui/text-input-and-
output#Deprecated-types)

[`enum ContentSizeCategory`](/documentation/swiftui/contentsizecategory)

The sizes that you can specify for content.

Deprecated

## [See Also](/documentation/swiftui/text-input-and-output#see-also)

### [Views](/documentation/swiftui/text-input-and-output#Views)

[API ReferenceView fundamentals](/documentation/swiftui/view-fundamentals)

Define the visual elements of your app using a hierarchy of views.

[API ReferenceView configuration](/documentation/swiftui/view-configuration)

Adjust the characteristics of views in a hierarchy.

[API ReferenceView styles](/documentation/swiftui/view-styles)

Apply built-in and custom appearances and behaviors to different types of
views.

[API ReferenceAnimations](/documentation/swiftui/animations)

Create smooth visual updates in response to state changes.

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

