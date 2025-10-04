Collection

  * [ SwiftUI ](/documentation/swiftui)
  * Windows 

API Collection

# Windows

Display user interface content in a window or a collection of windows.

## [Overview](/documentation/swiftui/windows#Overview)

The most common way to present a view hierarchy in your app’s interface is
with a [`WindowGroup`](/documentation/swiftui/windowgroup), which produces a
platform-specific behavior and appearance.

On platforms that support it, people can open multiple windows from the group
simultaneously. Each window relies on the same root view definition, but
retains its own view state. On some platforms, you can also supplement your
app’s user interface with a single-instance window using the
[`Window`](/documentation/swiftui/window) scene type.

Configure windows using scene modifiers that you add to the window
declaration, like
[`windowStyle(_:)`](/documentation/swiftui/scene/windowstyle\(_:\)) or
[`defaultPosition(_:)`](/documentation/swiftui/scene/defaultposition\(_:\)).
You can also indicate how to configure new windows that you present from a
view hierarchy by adding the
[`presentedWindowStyle(_:)`](/documentation/swiftui/view/presentedwindowstyle\(_:\))
view modifier to a view in the hierarchy.

For design guidance, see [Windows](/design/Human-Interface-Guidelines/windows)
in the Human Interface Guidelines.

## [Topics](/documentation/swiftui/windows#topics)

### [Essentials](/documentation/swiftui/windows#Essentials)

[Customizing window styles and state-restoration behavior in
macOS](/documentation/swiftui/customizing-window-styles-and-state-restoration-
behavior-in-macos)

Configure how your app’s windows look and function in macOS to provide an
engaging and more coherent experience.

[Bringing multiple windows to your SwiftUI
app](/documentation/swiftui/bringing_multiple_windows_to_your_swiftui_app)

Compose rich views by reacting to state changes and customize your app’s scene
presentation and behavior on iPadOS and macOS.

### [Creating windows](/documentation/swiftui/windows#Creating-windows)

[`struct WindowGroup`](/documentation/swiftui/windowgroup)

A scene that presents a group of identically structured windows.

[`struct Window`](/documentation/swiftui/window)

A scene that presents its content in a single, unique window.

[`struct UtilityWindow`](/documentation/swiftui/utilitywindow)

A specialized window scene that provides secondary utility to the content of
the main scenes of an application.

[`protocol WindowStyle`](/documentation/swiftui/windowstyle)

A specification for the appearance and interaction of a window.

[`func windowStyle<S>(S) -> some
Scene`](/documentation/swiftui/scene/windowstyle\(_:\))

Sets the style for windows created by this scene.

### [Styling the associated toolbar](/documentation/swiftui/windows#Styling-
the-associated-toolbar)

[`func windowToolbarStyle<S>(S) -> some
Scene`](/documentation/swiftui/scene/windowtoolbarstyle\(_:\))

Sets the style for the toolbar defined within this scene.

[`func windowToolbarLabelStyle(Binding<ToolbarLabelStyle>) -> some
Scene`](/documentation/swiftui/scene/windowtoolbarlabelstyle\(_:\))

Sets the label style of items in a toolbar and enables user customization.

[`func windowToolbarLabelStyle(fixed: ToolbarLabelStyle) -> some
Scene`](/documentation/swiftui/scene/windowtoolbarlabelstyle\(fixed:\))

Sets the label style of items in a toolbar.

[`protocol WindowToolbarStyle`](/documentation/swiftui/windowtoolbarstyle)

A specification for the appearance and behavior of a window’s toolbar.

### [Opening windows](/documentation/swiftui/windows#Opening-windows)

[Presenting windows and spaces](/documentation/visionOS/presenting-windows-
and-spaces)

Open and close the scenes that make up your app’s interface.

[`var supportsMultipleWindows:
Bool`](/documentation/swiftui/environmentvalues/supportsmultiplewindows)

A Boolean value that indicates whether the current platform supports opening
multiple windows.

[`var openWindow:
OpenWindowAction`](/documentation/swiftui/environmentvalues/openwindow)

A window presentation action stored in a view’s environment.

[`struct OpenWindowAction`](/documentation/swiftui/openwindowaction)

An action that presents a window.

[`struct PushWindowAction`](/documentation/swiftui/pushwindowaction)

An action that opens the requested window in place of the window the action is
called from.

### [Closing windows](/documentation/swiftui/windows#Closing-windows)

[`var dismissWindow:
DismissWindowAction`](/documentation/swiftui/environmentvalues/dismisswindow)

A window dismissal action stored in a view’s environment.

[`struct DismissWindowAction`](/documentation/swiftui/dismisswindowaction)

An action that dismisses a window associated to a particular scene.

[`var dismiss:
DismissAction`](/documentation/swiftui/environmentvalues/dismiss)

An action that dismisses the current presentation.

[`struct DismissAction`](/documentation/swiftui/dismissaction)

An action that dismisses a presentation.

[`struct DismissBehavior`](/documentation/swiftui/dismissbehavior)

Programmatic window dismissal behaviors.

### [Sizing a window](/documentation/swiftui/windows#Sizing-a-window)

[Positioning and sizing windows](/documentation/visionOS/positioning-and-
sizing-windows)

Influence the initial geometry of windows that your app presents.

[`func defaultSize(_:)`](/documentation/swiftui/scene/defaultsize\(_:\))

Sets a default size for a window.

[`func defaultSize(width: CGFloat, height: CGFloat) -> some
Scene`](/documentation/swiftui/scene/defaultsize\(width:height:\))

Sets a default width and height for a window.

[`func defaultSize(width: CGFloat, height: CGFloat, depth: CGFloat) -> some
Scene`](/documentation/swiftui/scene/defaultsize\(width:height:depth:\))

Sets a default size for a volumetric window.

[`func defaultSize(Size3D, in: UnitLength) -> some
Scene`](/documentation/swiftui/scene/defaultsize\(_:in:\))

Sets a default size for a volumetric window.

[`func defaultSize(width: CGFloat, height: CGFloat, depth: CGFloat, in:
UnitLength) -> some
Scene`](/documentation/swiftui/scene/defaultsize\(width:height:depth:in:\))

Sets a default size for a volumetric window.

[`func windowResizability(WindowResizability) -> some
Scene`](/documentation/swiftui/scene/windowresizability\(_:\))

Sets the kind of resizability to use for a window.

[`struct WindowResizability`](/documentation/swiftui/windowresizability)

The resizability of a window.

[`func windowIdealSize(WindowIdealSize) -> some
Scene`](/documentation/swiftui/scene/windowidealsize\(_:\))

Specifies how windows derived form this scene should determine their size when
zooming.

[`struct WindowIdealSize`](/documentation/swiftui/windowidealsize)

A type which defines the size a window should use when zooming.

### [Positioning a window](/documentation/swiftui/windows#Positioning-a-
window)

[`func defaultPosition(UnitPoint) -> some
Scene`](/documentation/swiftui/scene/defaultposition\(_:\))

Sets a default position for a window.

[`struct WindowLevel`](/documentation/swiftui/windowlevel)

The level of a window.

[`func windowLevel(WindowLevel) -> some
Scene`](/documentation/swiftui/scene/windowlevel\(_:\))

Sets the window level of this scene.

[`struct WindowLayoutRoot`](/documentation/swiftui/windowlayoutroot)

A proxy which represents the root contents of a window.

[`struct WindowPlacement`](/documentation/swiftui/windowplacement)

A type which represents a preferred size and position for a window.

[`func defaultWindowPlacement((WindowLayoutRoot, WindowPlacementContext) ->
WindowPlacement) -> some
Scene`](/documentation/swiftui/scene/defaultwindowplacement\(_:\))

Defines a function used for determining the default placement of windows.

[`func windowIdealPlacement((WindowLayoutRoot, WindowPlacementContext) ->
WindowPlacement) -> some
Scene`](/documentation/swiftui/scene/windowidealplacement\(_:\))

Provides a function which determines a placement to use when windows of a
scene zoom.

[`struct
WindowPlacementContext`](/documentation/swiftui/windowplacementcontext)

A type which represents contextual information used for sizing and positioning
windows.

[`struct WindowProxy`](/documentation/swiftui/windowproxy)

The proxy for an open window in the app.

[`struct DisplayProxy`](/documentation/swiftui/displayproxy)

A type which provides information about display hardware.

### [Configuring window
visibility](/documentation/swiftui/windows#Configuring-window-visibility)

[`struct
WindowVisibilityToggle`](/documentation/swiftui/windowvisibilitytoggle)

A specialized button for toggling the visibility of a window.

[`func defaultLaunchBehavior(SceneLaunchBehavior) -> some
Scene`](/documentation/swiftui/scene/defaultlaunchbehavior\(_:\))

Sets the default launch behavior for this scene.

[`func restorationBehavior(SceneRestorationBehavior) -> some
Scene`](/documentation/swiftui/scene/restorationbehavior\(_:\))

Sets the restoration behavior for this scene.

[`struct SceneLaunchBehavior`](/documentation/swiftui/scenelaunchbehavior)

The launch behavior for a scene.

[`struct
SceneRestorationBehavior`](/documentation/swiftui/scenerestorationbehavior)

The restoration behavior for a scene.

[`func persistentSystemOverlays(Visibility) -> some
Scene`](/documentation/swiftui/scene/persistentsystemoverlays\(_:\))

Sets the preferred visibility of the non-transient system views overlaying the
app.

[`func windowToolbarFullScreenVisibility(WindowToolbarFullScreenVisibility) ->
some
View`](/documentation/swiftui/view/windowtoolbarfullscreenvisibility\(_:\))

Configures the visibility of the window toolbar when the window enters full
screen mode.

[`struct
WindowToolbarFullScreenVisibility`](/documentation/swiftui/windowtoolbarfullscreenvisibility)

The visibility of the window toolbar with respect to full screen mode.

### [Managing window behavior](/documentation/swiftui/windows#Managing-window-
behavior)

[`struct WindowManagerRole`](/documentation/swiftui/windowmanagerrole)

Options for defining how a scene’s windows behave when used within a managed
window context, such as full screen mode and Stage Manager.

[`func windowManagerRole(WindowManagerRole) -> some
Scene`](/documentation/swiftui/scene/windowmanagerrole\(_:\))

Configures the role for windows derived from `self` when participating in a
managed window context, such as full screen or Stage Manager.

[`struct
WindowInteractionBehavior`](/documentation/swiftui/windowinteractionbehavior)

Options for enabling and disabling window interaction behaviors.

[`func windowDismissBehavior(WindowInteractionBehavior) -> some
View`](/documentation/swiftui/view/windowdismissbehavior\(_:\))

Configures the dismiss functionality for the window enclosing `self`.

[`func windowFullScreenBehavior(WindowInteractionBehavior) -> some
View`](/documentation/swiftui/view/windowfullscreenbehavior\(_:\))

Configures the full screen functionality for the window enclosing `self`.

[`func windowMinimizeBehavior(WindowInteractionBehavior) -> some
View`](/documentation/swiftui/view/windowminimizebehavior\(_:\))

Configures the minimize functionality for the window enclosing `self`.

[`func windowResizeBehavior(WindowInteractionBehavior) -> some
View`](/documentation/swiftui/view/windowresizebehavior\(_:\))

Configures the resize functionality for the window enclosing `self`.

[`func windowBackgroundDragBehavior(WindowInteractionBehavior) -> some
Scene`](/documentation/swiftui/scene/windowbackgrounddragbehavior\(_:\))

Configures the behavior of dragging a window by its background.

### [Interacting with volumes](/documentation/swiftui/windows#Interacting-
with-volumes)

[`func onVolumeViewpointChange(updateStrategy: VolumeViewpointUpdateStrategy,
initial: Bool, (Viewpoint3D, Viewpoint3D) -> Void) -> some
View`](/documentation/swiftui/view/onvolumeviewpointchange\(updatestrategy:initial:_:\))

Adds an action to perform when the viewpoint of the volume changes.

[`func supportedVolumeViewpoints(SquareAzimuth.Set) -> some
View`](/documentation/swiftui/view/supportedvolumeviewpoints\(_:\))

Specifies which viewpoints are supported for the window bar and ornaments in a
volume.

[`struct
VolumeViewpointUpdateStrategy`](/documentation/swiftui/volumeviewpointupdatestrategy)

A type describing when the action provided to
[`onVolumeViewpointChange(updateStrategy:initial:_:)`](/documentation/swiftui/view/onvolumeviewpointchange\(updatestrategy:initial:_:\))
should be called.

[`struct Viewpoint3D`](/documentation/swiftui/viewpoint3d)

A type describing what direction something is being viewed from.

[`enum SquareAzimuth`](/documentation/swiftui/squareazimuth)

A type describing what direction something is being viewed from along the
horizontal plane and snapped to 4 directions.

[`struct
WorldAlignmentBehavior`](/documentation/swiftui/worldalignmentbehavior)

A type representing the world alignment behavior for a scene.

[`func volumeWorldAlignment(WorldAlignmentBehavior) -> some
Scene`](/documentation/swiftui/scene/volumeworldalignment\(_:\))

Specifies how a volume should be aligned when moved in the world.

[`struct WorldScalingBehavior`](/documentation/swiftui/worldscalingbehavior)

Specifies the scaling behavior a window should have within the world.

[`func defaultWorldScaling(WorldScalingBehavior) -> some
Scene`](/documentation/swiftui/scene/defaultworldscaling\(_:\))

Specify the world scaling behavior for the window.

[`struct
WorldScalingCompensation`](/documentation/swiftui/worldscalingcompensation)

Indicates whether returned metrics will take dynamic scaling into account.

[`var worldTrackingLimitations:
Set<WorldTrackingLimitation>`](/documentation/swiftui/environmentvalues/worldtrackinglimitations)

The current limitations of the device tracking the user’s surroundings.

[`struct
WorldTrackingLimitation`](/documentation/swiftui/worldtrackinglimitation)

A structure to represent limitations of tracking the user’s surroundings.

[`struct SurfaceSnappingInfo`](/documentation/swiftui/surfacesnappinginfo)

A type representing information about the window scenes snap state.

### [Deprecated Types](/documentation/swiftui/windows#Deprecated-Types)

[`enum ControlActiveState`](/documentation/swiftui/controlactivestate)

The active appearance expected of controls in a window.

Deprecated

## [See Also](/documentation/swiftui/windows#see-also)

### [App structure](/documentation/swiftui/windows#App-structure)

[API ReferenceApp organization](/documentation/swiftui/app-organization)

Define the entry point and top-level structure of your app.

[API ReferenceScenes](/documentation/swiftui/scenes)

Declare the user interface groupings that make up the parts of your app.

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

