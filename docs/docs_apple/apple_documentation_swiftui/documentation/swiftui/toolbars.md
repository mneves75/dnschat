Collection

  * [ SwiftUI ](/documentation/swiftui)
  * Toolbars 

API Collection

# Toolbars

Provide immediate access to frequently used commands and controls.

## [Overview](/documentation/swiftui/toolbars#Overview)

The system might present toolbars above or below your app’s content, depending
on the platform and the context.

Add items to a toolbar by applying the
[`toolbar(content:)`](/documentation/swiftui/view/toolbar\(content:\)) view
modifier to a view in your app. You can also configure the toolbar using view
modifiers. For example, you can set the visibility of a toolbar with the
[`toolbar(_:for:)`](/documentation/swiftui/view/toolbar\(_:for:\)) modifier.

For design guidance, see [Toolbars](/design/Human-Interface-
Guidelines/toolbars) in the Human Interface Guidelines.

## [Topics](/documentation/swiftui/toolbars#topics)

### [Populating a toolbar](/documentation/swiftui/toolbars#Populating-a-
toolbar)

[`func toolbar(content:)`](/documentation/swiftui/view/toolbar\(content:\))

Populates the toolbar or navigation bar with the specified items.

[`struct ToolbarItem`](/documentation/swiftui/toolbaritem)

A model that represents an item which can be placed in the toolbar or
navigation bar.

[`struct ToolbarItemGroup`](/documentation/swiftui/toolbaritemgroup)

A model that represents a group of `ToolbarItem`s which can be placed in the
toolbar or navigation bar.

[`struct ToolbarItemPlacement`](/documentation/swiftui/toolbaritemplacement)

A structure that defines the placement of a toolbar item.

[`protocol ToolbarContent`](/documentation/swiftui/toolbarcontent)

Conforming types represent items that can be placed in various locations in a
toolbar.

[`struct ToolbarContentBuilder`](/documentation/swiftui/toolbarcontentbuilder)

Constructs a toolbar item set from multi-expression closures.

[`struct ToolbarSpacer`](/documentation/swiftui/toolbarspacer)

A standard space item in toolbars.

[`struct DefaultToolbarItem`](/documentation/swiftui/defaulttoolbaritem)

A toolbar item that represents a system component.

### [Populating a customizable
toolbar](/documentation/swiftui/toolbars#Populating-a-customizable-toolbar)

[`func toolbar<Content>(id: String, content: () -> Content) -> some
View`](/documentation/swiftui/view/toolbar\(id:content:\))

Populates the toolbar or navigation bar with the specified items, allowing for
user customization.

[`protocol
CustomizableToolbarContent`](/documentation/swiftui/customizabletoolbarcontent)

Conforming types represent items that can be placed in various locations in a
customizable toolbar.

[`struct
ToolbarCustomizationBehavior`](/documentation/swiftui/toolbarcustomizationbehavior)

The customization behavior of customizable toolbar content.

[`struct
ToolbarCustomizationOptions`](/documentation/swiftui/toolbarcustomizationoptions)

Options that influence the default customization behavior of customizable
toolbar content.

[`struct SearchToolbarBehavior`](/documentation/swiftui/searchtoolbarbehavior)

The behavior of a search field in a toolbar.

### [Removing default items](/documentation/swiftui/toolbars#Removing-default-
items)

[`func toolbar(removing: ToolbarDefaultItemKind?) -> some
View`](/documentation/swiftui/view/toolbar\(removing:\))

Remove a toolbar item present by default

[`struct
ToolbarDefaultItemKind`](/documentation/swiftui/toolbardefaultitemkind)

A kind of toolbar item a `View` adds by default.

### [Setting toolbar visibility](/documentation/swiftui/toolbars#Setting-
toolbar-visibility)

[`func toolbar(Visibility, for: ToolbarPlacement...) -> some
View`](/documentation/swiftui/view/toolbar\(_:for:\))

Specifies the visibility of a bar managed by SwiftUI.

[`func toolbarVisibility(Visibility, for: ToolbarPlacement...) -> some
View`](/documentation/swiftui/view/toolbarvisibility\(_:for:\))

Specifies the visibility of a bar managed by SwiftUI.

[`func toolbarBackgroundVisibility(Visibility, for: ToolbarPlacement...) ->
some View`](/documentation/swiftui/view/toolbarbackgroundvisibility\(_:for:\))

Specifies the preferred visibility of backgrounds on a bar managed by SwiftUI.

[`struct ToolbarPlacement`](/documentation/swiftui/toolbarplacement)

The placement of a toolbar.

[`struct
ContentToolbarPlacement`](/documentation/swiftui/contenttoolbarplacement)

### [Specifying the role of toolbar
content](/documentation/swiftui/toolbars#Specifying-the-role-of-toolbar-
content)

[`func toolbarRole(ToolbarRole) -> some
View`](/documentation/swiftui/view/toolbarrole\(_:\))

Configures the semantic role for the content populating the toolbar.

[`struct ToolbarRole`](/documentation/swiftui/toolbarrole)

The purpose of content that populates the toolbar.

### [Styling a toolbar](/documentation/swiftui/toolbars#Styling-a-toolbar)

[`func
toolbarBackground(_:for:)`](/documentation/swiftui/view/toolbarbackground\(_:for:\))

Specifies the preferred shape style of the background of a bar managed by
SwiftUI.

[`func toolbarColorScheme(ColorScheme?, for: ToolbarPlacement...) -> some
View`](/documentation/swiftui/view/toolbarcolorscheme\(_:for:\))

Specifies the preferred color scheme of a bar managed by SwiftUI.

[`func toolbarForegroundStyle<S>(S, for: ToolbarPlacement...) -> some
View`](/documentation/swiftui/view/toolbarforegroundstyle\(_:for:\))

Specifies the preferred foreground style of bars managed by SwiftUI.

[`func windowToolbarStyle<S>(S) -> some
Scene`](/documentation/swiftui/scene/windowtoolbarstyle\(_:\))

Sets the style for the toolbar defined within this scene.

[`protocol WindowToolbarStyle`](/documentation/swiftui/windowtoolbarstyle)

A specification for the appearance and behavior of a window’s toolbar.

[`var toolbarLabelStyle:
ToolbarLabelStyle?`](/documentation/swiftui/environmentvalues/toolbarlabelstyle)

The label style to apply to controls within a toolbar.

[`struct ToolbarLabelStyle`](/documentation/swiftui/toolbarlabelstyle)

The label style of a toolbar.

[`struct SpacerSizing`](/documentation/swiftui/spacersizing)

A type which defines how spacers should size themselves.

### [Configuring the toolbar title display
mode](/documentation/swiftui/toolbars#Configuring-the-toolbar-title-display-
mode)

[`func toolbarTitleDisplayMode(ToolbarTitleDisplayMode) -> some
View`](/documentation/swiftui/view/toolbartitledisplaymode\(_:\))

Configures the toolbar title display mode for this view.

[`struct
ToolbarTitleDisplayMode`](/documentation/swiftui/toolbartitledisplaymode)

A type that defines the behavior of title of a toolbar.

### [Setting the toolbar title menu](/documentation/swiftui/toolbars#Setting-
the-toolbar-title-menu)

[`func toolbarTitleMenu<C>(content: () -> C) -> some
View`](/documentation/swiftui/view/toolbartitlemenu\(content:\))

Configure the title menu of a toolbar.

[`struct ToolbarTitleMenu`](/documentation/swiftui/toolbartitlemenu)

The title menu of a toolbar.

### [Creating an ornament](/documentation/swiftui/toolbars#Creating-an-
ornament)

[`func
ornament(visibility:attachmentAnchor:contentAlignment:ornament:)`](/documentation/swiftui/view/ornament\(visibility:attachmentanchor:contentalignment:ornament:\))

Presents an ornament.

[`struct
OrnamentAttachmentAnchor`](/documentation/swiftui/ornamentattachmentanchor)

An attachment anchor for an ornament.

## [See Also](/documentation/swiftui/toolbars#see-also)

### [App structure](/documentation/swiftui/toolbars#App-structure)

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

[API ReferenceSearch](/documentation/swiftui/search)

Enable people to search for text or other content within your app.

[API ReferenceApp extensions](/documentation/swiftui/app-extensions)

Extend your app’s basic functionality to other parts of the system, like by
adding a Widget.

