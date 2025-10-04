Collection

  * [ SwiftUI ](/documentation/swiftui)
  * Preferences 

API Collection

# Preferences

Indicate configuration preferences from views to their container views.

## [Overview](/documentation/swiftui/preferences#Overview)

Whereas you use the environment to configure the subviews of a view, you use
preferences to send configuration information from subviews toward their
container. However, unlike configuration information that flows down a view
hierarchy from one container to many subviews, a single container needs to
reconcile potentially conflicting preferences flowing up from its many
subviews.

When you use the [`PreferenceKey`](/documentation/swiftui/preferencekey)
protocol to define a custom preference, you indicate how to merge preferences
from multiple subviews. You can then set a value for the preference on a view
using the
[`preference(key:value:)`](/documentation/swiftui/view/preference\(key:value:\))
view modifier. Many built-in modifiers, like
[`navigationTitle(_:)`](/documentation/swiftui/view/navigationtitle\(_:\)),
rely on preferences to send configuration information to their container.

## [Topics](/documentation/swiftui/preferences#topics)

### [Setting preferences](/documentation/swiftui/preferences#Setting-
preferences)

[`func preference<K>(key: K.Type, value: K.Value) -> some
View`](/documentation/swiftui/view/preference\(key:value:\))

Sets a value for the given preference.

[`func transformPreference<K>(K.Type, (inout K.Value) -> Void) -> some
View`](/documentation/swiftui/view/transformpreference\(_:_:\))

Applies a transformation to a preference value.

### [Creating custom preferences](/documentation/swiftui/preferences#Creating-
custom-preferences)

[`protocol PreferenceKey`](/documentation/swiftui/preferencekey)

A named value produced by a view.

### [Setting preferences based on
geometry](/documentation/swiftui/preferences#Setting-preferences-based-on-
geometry)

[`func anchorPreference<A, K>(key: K.Type, value: Anchor<A>.Source, transform:
(Anchor<A>) -> K.Value) -> some
View`](/documentation/swiftui/view/anchorpreference\(key:value:transform:\))

Sets a value for the specified preference key, the value is a function of a
geometry value tied to the current coordinate space, allowing readers of the
value to convert the geometry to their local coordinates.

[`func transformAnchorPreference<A, K>(key: K.Type, value: Anchor<A>.Source,
transform: (inout K.Value, Anchor<A>) -> Void) -> some
View`](/documentation/swiftui/view/transformanchorpreference\(key:value:transform:\))

Sets a value for the specified preference key, the value is a function of the
key’s current value and a geometry value tied to the current coordinate space,
allowing readers of the value to convert the geometry to their local
coordinates.

### [Responding to changes in
preferences](/documentation/swiftui/preferences#Responding-to-changes-in-
preferences)

[`func onPreferenceChange<K>(K.Type, perform: (K.Value) -> Void) -> some
View`](/documentation/swiftui/view/onpreferencechange\(_:perform:\))

Adds an action to perform when the specified preference key’s value changes.

### [Generating backgrounds and overlays from
preferences](/documentation/swiftui/preferences#Generating-backgrounds-and-
overlays-from-preferences)

[`func backgroundPreferenceValue<Key, T>(Key.Type, (Key.Value) -> T) -> some
View`](/documentation/swiftui/view/backgroundpreferencevalue\(_:_:\))

Reads the specified preference value from the view, using it to produce a
second view that is applied as the background of the original view.

[`func backgroundPreferenceValue<K, V>(K.Type, alignment: Alignment, (K.Value)
-> V) -> some
View`](/documentation/swiftui/view/backgroundpreferencevalue\(_:alignment:_:\))

Reads the specified preference value from the view, using it to produce a
second view that is applied as the background of the original view.

[`func overlayPreferenceValue<Key, T>(Key.Type, (Key.Value) -> T) -> some
View`](/documentation/swiftui/view/overlaypreferencevalue\(_:_:\))

Reads the specified preference value from the view, using it to produce a
second view that is applied as an overlay to the original view.

[`func overlayPreferenceValue<K, V>(K.Type, alignment: Alignment, (K.Value) ->
V) -> some
View`](/documentation/swiftui/view/overlaypreferencevalue\(_:alignment:_:\))

Reads the specified preference value from the view, using it to produce a
second view that is applied as an overlay to the original view.

## [See Also](/documentation/swiftui/preferences#see-also)

### [Data and storage](/documentation/swiftui/preferences#Data-and-storage)

[API ReferenceModel data](/documentation/swiftui/model-data)

Manage the data that your app uses to drive its interface.

[API ReferenceEnvironment values](/documentation/swiftui/environment-values)

Share data throughout a view hierarchy using the environment.

[API ReferencePersistent storage](/documentation/swiftui/persistent-storage)

Store data for use across sessions of your app.

