Collection

  * [ SwiftUI ](/documentation/swiftui)
  * Scenes 

API Collection

# Scenes

Declare the user interface groupings that make up the parts of your app.

## [Overview](/documentation/swiftui/scenes#Overview)

A scene represents a part of your app’s user interface that has a life cycle
that the system manages. An [`App`](/documentation/swiftui/app) instance
presents the scenes it contains, while each
[`Scene`](/documentation/swiftui/scene) acts as the root element of a
[`View`](/documentation/swiftui/view) hierarchy.

The system presents scenes in different ways depending on the type of scene,
the platform, and the context. A scene might fill the entire display, part of
the display, a window, a tab in a window, or something else. In some cases,
your app might also be able to display more than one instance of the scene at
a time, like when a user simultaneously opens multiple windows based on a
single [`WindowGroup`](/documentation/swiftui/windowgroup) declaration in your
app. For more information about the primary built-in scene types, see
[Windows](/documentation/swiftui/windows) and
[Documents](/documentation/swiftui/documents).

You configure scenes using modifiers, similar to how you configure views. For
example, you can adjust the appearance of the window that contains a scene —
if the scene happens to appear in a window — using the
[`windowStyle(_:)`](/documentation/swiftui/scene/windowstyle\(_:\)) modifier.
Similarly, you can add menu commands that become available when the scene is
in the foreground on certain platforms using the
[`commands(content:)`](/documentation/swiftui/scene/commands\(content:\))
modifier.

## [Topics](/documentation/swiftui/scenes#topics)

### [Creating scenes](/documentation/swiftui/scenes#Creating-scenes)

[`protocol Scene`](/documentation/swiftui/scene)

A part of an app’s user interface with a life cycle managed by the system.

[`struct SceneBuilder`](/documentation/swiftui/scenebuilder)

A result builder for composing a collection of scenes into a single composite
scene.

### [Monitoring scene life cycle](/documentation/swiftui/scenes#Monitoring-
scene-life-cycle)

[`var scenePhase:
ScenePhase`](/documentation/swiftui/environmentvalues/scenephase)

The current phase of the scene.

[`enum ScenePhase`](/documentation/swiftui/scenephase)

An indication of a scene’s operational state.

### [Managing a settings window](/documentation/swiftui/scenes#Managing-a-
settings-window)

[`struct Settings`](/documentation/swiftui/settings)

A scene that presents an interface for viewing and modifying an app’s
settings.

[`struct SettingsLink`](/documentation/swiftui/settingslink)

A view that opens the Settings scene defined by an app.

[`struct OpenSettingsAction`](/documentation/swiftui/opensettingsaction)

An action that presents the settings scene for an app.

[`var openSettings:
OpenSettingsAction`](/documentation/swiftui/environmentvalues/opensettings)

A Settings presentation action stored in a view’s environment.

### [Building a menu bar](/documentation/swiftui/scenes#Building-a-menu-bar)

[Building and customizing the menu bar with
SwiftUI](/documentation/swiftui/building-and-customizing-the-menu-bar-with-
swiftui)

Provide a seamless, cross-platform user experience by building a native menu
bar for iPadOS and macOS.

### [Creating a menu bar extra](/documentation/swiftui/scenes#Creating-a-menu-
bar-extra)

[`struct MenuBarExtra`](/documentation/swiftui/menubarextra)

A scene that renders itself as a persistent control in the system menu bar.

[`func menuBarExtraStyle<S>(S) -> some
Scene`](/documentation/swiftui/scene/menubarextrastyle\(_:\))

Sets the style for menu bar extra created by this scene.

[`protocol MenuBarExtraStyle`](/documentation/swiftui/menubarextrastyle)

A specification for the appearance and behavior of a menu bar extra scene.

### [Creating watch notifications](/documentation/swiftui/scenes#Creating-
watch-notifications)

[`struct WKNotificationScene`](/documentation/swiftui/wknotificationscene)

A scene which appears in response to receiving the specified category of
remote or local notifications.

## [See Also](/documentation/swiftui/scenes#see-also)

### [App structure](/documentation/swiftui/scenes#App-structure)

[API ReferenceApp organization](/documentation/swiftui/app-organization)

Define the entry point and top-level structure of your app.

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

[API ReferenceApp extensions](/documentation/swiftui/app-extensions)

Extend your app’s basic functionality to other parts of the system, like by
adding a Widget.

