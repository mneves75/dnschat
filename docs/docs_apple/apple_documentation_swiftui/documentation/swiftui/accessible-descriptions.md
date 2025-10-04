Collection

  * [ SwiftUI ](/documentation/swiftui)
  * Accessible descriptions 

API Collection

# Accessible descriptions

Describe interface elements to help people understand what they represent.

## [Overview](/documentation/swiftui/accessible-descriptions#Overview)

SwiftUI can often infer some information about your user interface elements,
but you can use accessibility modifiers to provide even more information for
users that need it.

For design guidance, see [Accessibility](/design/Human-Interface-
Guidelines/accessibility) in the Accessibility section of the Human Interface
Guidelines.

## [Topics](/documentation/swiftui/accessible-descriptions#topics)

### [Applying labels](/documentation/swiftui/accessible-descriptions#Applying-
labels)

[`func
accessibilityLabel(_:)`](/documentation/swiftui/view/accessibilitylabel\(_:\))

Adds a label to the view that describes its contents.

[`func
accessibilityLabel(_:isEnabled:)`](/documentation/swiftui/view/accessibilitylabel\(_:isenabled:\))

Adds a label to the view that describes its contents.

[`func accessibilityLabel<V>(content: (PlaceholderContentView<Self>) -> V) ->
some View`](/documentation/swiftui/view/accessibilitylabel\(content:\))

Adds a label to the view that describes its contents.

[`func
accessibilityInputLabels(_:)`](/documentation/swiftui/view/accessibilityinputlabels\(_:\))

Sets alternate input labels with which users identify a view.

[`func
accessibilityInputLabels(_:isEnabled:)`](/documentation/swiftui/view/accessibilityinputlabels\(_:isenabled:\))

Sets alternate input labels with which users identify a view.

[`func accessibilityLabeledPair<ID>(role: AccessibilityLabeledPairRole, id:
ID, in: Namespace.ID) -> some
View`](/documentation/swiftui/view/accessibilitylabeledpair\(role:id:in:\))

Pairs an accessibility element representing a label with the element for the
matching content.

[`enum
AccessibilityLabeledPairRole`](/documentation/swiftui/accessibilitylabeledpairrole)

The role of an accessibility element in a label / content pair.

### [Describing values](/documentation/swiftui/accessible-
descriptions#Describing-values)

[`func
accessibilityValue(_:)`](/documentation/swiftui/view/accessibilityvalue\(_:\))

Adds a textual description of the value that the view contains.

[`func
accessibilityValue(_:isEnabled:)`](/documentation/swiftui/view/accessibilityvalue\(_:isenabled:\))

Adds a textual description of the value that the view contains.

### [Describing content](/documentation/swiftui/accessible-
descriptions#Describing-content)

[`func accessibilityTextContentType(AccessibilityTextContentType) ->
ModifiedContent<Self,
AccessibilityAttachmentModifier>`](/documentation/swiftui/view/accessibilitytextcontenttype\(_:\))

Sets an accessibility text content type.

[`func accessibilityHeading(AccessibilityHeadingLevel) ->
ModifiedContent<Self,
AccessibilityAttachmentModifier>`](/documentation/swiftui/view/accessibilityheading\(_:\))

Sets the accessibility level of this heading.

[`enum
AccessibilityHeadingLevel`](/documentation/swiftui/accessibilityheadinglevel)

The hierarchy of a heading in relation other headings.

[`struct
AccessibilityTextContentType`](/documentation/swiftui/accessibilitytextcontenttype)

Textual context that assistive technologies can use to improve the
presentation of spoken text.

### [Describing charts](/documentation/swiftui/accessible-
descriptions#Describing-charts)

[`func accessibilityChartDescriptor<R>(R) -> some
View`](/documentation/swiftui/view/accessibilitychartdescriptor\(_:\))

Adds a descriptor to a View that represents a chart to make the chart’s
contents accessible to all users.

[`protocol
AXChartDescriptorRepresentable`](/documentation/swiftui/axchartdescriptorrepresentable)

A type to generate an `AXChartDescriptor` object that you use to provide
information about a chart and its data for an accessible experience in
VoiceOver or other assistive technologies.

### [Adding custom descriptions](/documentation/swiftui/accessible-
descriptions#Adding-custom-descriptions)

[`func
accessibilityCustomContent(_:_:importance:)`](/documentation/swiftui/view/accessibilitycustomcontent\(_:_:importance:\))

Add additional accessibility information to the view.

[`struct
AccessibilityCustomContentKey`](/documentation/swiftui/accessibilitycustomcontentkey)

Key used to specify the identifier and label associated with an entry of
additional accessibility information.

### [Assigning traits to content](/documentation/swiftui/accessible-
descriptions#Assigning-traits-to-content)

[`func accessibilityAddTraits(AccessibilityTraits) -> ModifiedContent<Self,
AccessibilityAttachmentModifier>`](/documentation/swiftui/view/accessibilityaddtraits\(_:\))

Adds the given traits to the view.

[`func accessibilityRemoveTraits(AccessibilityTraits) -> ModifiedContent<Self,
AccessibilityAttachmentModifier>`](/documentation/swiftui/view/accessibilityremovetraits\(_:\))

Removes the given traits from this view.

[`struct AccessibilityTraits`](/documentation/swiftui/accessibilitytraits)

A set of accessibility traits that describe how an element behaves.

### [Offering hints](/documentation/swiftui/accessible-descriptions#Offering-
hints)

[`func
accessibilityHint(_:)`](/documentation/swiftui/view/accessibilityhint\(_:\))

Communicates to the user what happens after performing the view’s action.

[`func
accessibilityHint(_:isEnabled:)`](/documentation/swiftui/view/accessibilityhint\(_:isenabled:\))

Communicates to the user what happens after performing the view’s action.

### [Configuring VoiceOver](/documentation/swiftui/accessible-
descriptions#Configuring-VoiceOver)

[`func speechAdjustedPitch(Double) -> some
View`](/documentation/swiftui/view/speechadjustedpitch\(_:\))

Raises or lowers the pitch of spoken text.

[`func speechAlwaysIncludesPunctuation(Bool) -> some
View`](/documentation/swiftui/view/speechalwaysincludespunctuation\(_:\))

Sets whether VoiceOver should always speak all punctuation in the text view.

[`func speechAnnouncementsQueued(Bool) -> some
View`](/documentation/swiftui/view/speechannouncementsqueued\(_:\))

Controls whether to queue pending announcements behind existing speech rather
than interrupting speech in progress.

[`func speechSpellsOutCharacters(Bool) -> some
View`](/documentation/swiftui/view/speechspellsoutcharacters\(_:\))

Sets whether VoiceOver should speak the contents of the text view character by
character.

## [See Also](/documentation/swiftui/accessible-descriptions#see-also)

### [Accessibility](/documentation/swiftui/accessible-
descriptions#Accessibility)

[API ReferenceAccessibility
fundamentals](/documentation/swiftui/accessibility-fundamentals)

Make your SwiftUI apps accessible to everyone, including people with
disabilities.

[API ReferenceAccessible appearance](/documentation/swiftui/accessible-
appearance)

Enhance the legibility of content in your app’s interface.

[API ReferenceAccessible controls](/documentation/swiftui/accessible-controls)

Improve access to actions that your app can undertake.

[API ReferenceAccessible navigation](/documentation/swiftui/accessible-
navigation)

Enable users to navigate to specific user interface elements using rotors.

