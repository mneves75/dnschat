Collection

  * [ SwiftUI ](/documentation/swiftui)
  * Navigation 

API Collection

# Navigation

Enable people to move between different parts of your app’s view hierarchy
within a scene.

## [Overview](/documentation/swiftui/navigation#Overview)

Use navigation containers to provide structure to your app’s user interface,
enabling people to easily move among the parts of your app.

For example, people can move forward and backward through a stack of views
using a [`NavigationStack`](/documentation/swiftui/navigationstack), or choose
which view to display from a tab bar using a
[`TabView`](/documentation/swiftui/tabview).

Configure navigation containers by adding view modifiers like
[`navigationSplitViewStyle(_:)`](/documentation/swiftui/view/navigationsplitviewstyle\(_:\))
to the container. Use other modifiers on the views inside the container to
affect the container’s behavior when showing that view. For example, you can
use [`navigationTitle(_:)`](/documentation/swiftui/view/navigationtitle\(_:\))
on a view to provide a toolbar title to display when showing that view.

## [Topics](/documentation/swiftui/navigation#topics)

### [Essentials](/documentation/swiftui/navigation#Essentials)

[Understanding the navigation stack](/documentation/swiftui/understanding-the-
composition-of-navigation-stack)

Learn about the navigation stack, links, and how to manage navigation types in
your app’s structure.

### [Presenting views in
columns](/documentation/swiftui/navigation#Presenting-views-in-columns)

[Bringing robust navigation structure to your SwiftUI
app](/documentation/swiftui/bringing-robust-navigation-structure-to-your-
swiftui-app)

Use navigation links, stacks, destinations, and paths to provide a streamlined
experience for all platforms, as well as behaviors such as deep linking and
state restoration.

[Migrating to new navigation types](/documentation/swiftui/migrating-to-new-
navigation-types)

Improve navigation behavior in your app by replacing navigation views with
navigation stacks and navigation split views.

[`struct NavigationSplitView`](/documentation/swiftui/navigationsplitview)

A view that presents views in two or three columns, where selections in
leading columns control presentations in subsequent columns.

[`func navigationSplitViewStyle<S>(S) -> some
View`](/documentation/swiftui/view/navigationsplitviewstyle\(_:\))

Sets the style for navigation split views within this view.

[`func navigationSplitViewColumnWidth(CGFloat) -> some
View`](/documentation/swiftui/view/navigationsplitviewcolumnwidth\(_:\))

Sets a fixed, preferred width for the column containing this view.

[`func navigationSplitViewColumnWidth(min: CGFloat?, ideal: CGFloat, max:
CGFloat?) -> some
View`](/documentation/swiftui/view/navigationsplitviewcolumnwidth\(min:ideal:max:\))

Sets a flexible, preferred width for the column containing this view.

[`struct
NavigationSplitViewVisibility`](/documentation/swiftui/navigationsplitviewvisibility)

The visibility of the leading columns in a navigation split view.

[`struct NavigationLink`](/documentation/swiftui/navigationlink)

A view that controls a navigation presentation.

### [Stacking views in one column](/documentation/swiftui/navigation#Stacking-
views-in-one-column)

[`struct NavigationStack`](/documentation/swiftui/navigationstack)

A view that displays a root view and enables you to present additional views
over the root view.

[`struct NavigationPath`](/documentation/swiftui/navigationpath)

A type-erased list of data representing the content of a navigation stack.

[`func navigationDestination<D, C>(for: D.Type, destination: (D) -> C) -> some
View`](/documentation/swiftui/view/navigationdestination\(for:destination:\))

Associates a destination view with a presented data type for use within a
navigation stack.

[`func navigationDestination<V>(isPresented: Binding<Bool>, destination: () ->
V) -> some
View`](/documentation/swiftui/view/navigationdestination\(ispresented:destination:\))

Associates a destination view with a binding that can be used to push the view
onto a [`NavigationStack`](/documentation/swiftui/navigationstack).

[`func navigationDestination<D, C>(item: Binding<Optional<D>>, destination:
(D) -> C) -> some
View`](/documentation/swiftui/view/navigationdestination\(item:destination:\))

Associates a destination view with a bound value for use within a navigation
stack or navigation split view

### [Managing column collapse](/documentation/swiftui/navigation#Managing-
column-collapse)

[`struct
NavigationSplitViewColumn`](/documentation/swiftui/navigationsplitviewcolumn)

A view that represents a column in a navigation split view.

### [Setting titles for navigation
content](/documentation/swiftui/navigation#Setting-titles-for-navigation-
content)

[`func
navigationTitle(_:)`](/documentation/swiftui/view/navigationtitle\(_:\))

Configures the view’s title for purposes of navigation, using a string
binding.

[`func
navigationSubtitle(_:)`](/documentation/swiftui/view/navigationsubtitle\(_:\))

Configures the view’s subtitle for purposes of navigation.

[`func
navigationDocument(_:)`](/documentation/swiftui/view/navigationdocument\(_:\))

Configures the view’s document for purposes of navigation.

[`func
navigationDocument(_:preview:)`](/documentation/swiftui/view/navigationdocument\(_:preview:\))

Configures the view’s document for purposes of navigation.

### [Configuring the navigation
bar](/documentation/swiftui/navigation#Configuring-the-navigation-bar)

[`func navigationBarBackButtonHidden(Bool) -> some
View`](/documentation/swiftui/view/navigationbarbackbuttonhidden\(_:\))

Hides the navigation bar back button for the view.

[`func navigationBarTitleDisplayMode(NavigationBarItem.TitleDisplayMode) ->
some View`](/documentation/swiftui/view/navigationbartitledisplaymode\(_:\))

Configures the title display mode for this view.

[`struct NavigationBarItem`](/documentation/swiftui/navigationbaritem)

A configuration for a navigation bar that represents a view at the top of a
navigation stack.

### [Configuring the sidebar](/documentation/swiftui/navigation#Configuring-
the-sidebar)

[`var sidebarRowSize:
SidebarRowSize`](/documentation/swiftui/environmentvalues/sidebarrowsize)

The current size of sidebar rows.

[`enum SidebarRowSize`](/documentation/swiftui/sidebarrowsize)

The standard sizes of sidebar rows.

### [Presenting views in tabs](/documentation/swiftui/navigation#Presenting-
views-in-tabs)

[Enhancing your app’s content with tab
navigation](/documentation/swiftui/enhancing-your-app-content-with-tab-
navigation)

Keep your app content front and center while providing quick access to
navigation using the tab bar.

[`struct TabView`](/documentation/swiftui/tabview)

A view that switches between multiple child views using interactive user
interface elements.

[`struct Tab`](/documentation/swiftui/tab)

The content for a tab and the tab’s associated tab item in a tab view.

[`struct TabRole`](/documentation/swiftui/tabrole)

A value that defines the purpose of the tab.

[`struct TabSection`](/documentation/swiftui/tabsection)

A container that you can use to add hierarchy within a tab view.

[`func tabViewStyle<S>(S) -> some
View`](/documentation/swiftui/view/tabviewstyle\(_:\))

Sets the style for the tab view within the current environment.

### [Configuring a tab bar](/documentation/swiftui/navigation#Configuring-a-
tab-bar)

[`func tabViewSidebarHeader<Content>(content: () -> Content) -> some
View`](/documentation/swiftui/view/tabviewsidebarheader\(content:\))

Adds a custom header to the sidebar of a tab view.

[`func tabViewSidebarFooter<Content>(content: () -> Content) -> some
View`](/documentation/swiftui/view/tabviewsidebarfooter\(content:\))

Adds a custom footer to the sidebar of a tab view.

[`func tabViewSidebarBottomBar<Content>(content: () -> Content) -> some
View`](/documentation/swiftui/view/tabviewsidebarbottombar\(content:\))

Adds a custom bottom bar to the sidebar of a tab view.

[`struct
AdaptableTabBarPlacement`](/documentation/swiftui/adaptabletabbarplacement)

A placement for tabs in a tab view using the adaptable sidebar style.

[`var tabBarPlacement:
TabBarPlacement?`](/documentation/swiftui/environmentvalues/tabbarplacement)

The current placement of the tab bar.

[`struct TabBarPlacement`](/documentation/swiftui/tabbarplacement)

A placement for tabs in a tab view.

[`var isTabBarShowingSections:
Bool`](/documentation/swiftui/environmentvalues/istabbarshowingsections)

A Boolean value that determines whether a tab view shows the expanded contents
of a tab section.

[`struct
TabBarMinimizeBehavior`](/documentation/swiftui/tabbarminimizebehavior)

[`enum
TabViewBottomAccessoryPlacement`](/documentation/swiftui/tabviewbottomaccessoryplacement)

A placement of the bottom accessory in a tab view. You can use this to adjust
the content of the accessory view based on the placement.

### [Configuring a tab](/documentation/swiftui/navigation#Configuring-a-tab)

[`func sectionActions<Content>(content: () -> Content) -> some
View`](/documentation/swiftui/view/sectionactions\(content:\))

Adds custom actions to a section.

[`struct TabPlacement`](/documentation/swiftui/tabplacement)

A place that a tab can appear.

[`struct TabContentBuilder`](/documentation/swiftui/tabcontentbuilder)

A result builder that constructs tabs for a tab view that supports
programmatic selection. This builder requires that all tabs in the tab view
have the same selection type.

[`protocol TabContent`](/documentation/swiftui/tabcontent)

A type that provides content for programmatically selectable tabs in a tab
view.

[`struct AnyTabContent`](/documentation/swiftui/anytabcontent)

Type erased tab content.

### [Enabling tab customization](/documentation/swiftui/navigation#Enabling-
tab-customization)

[`func tabViewCustomization(Binding<TabViewCustomization>?) -> some
View`](/documentation/swiftui/view/tabviewcustomization\(_:\))

Specifies the customizations to apply to the sidebar representation of the tab
view.

[`struct TabViewCustomization`](/documentation/swiftui/tabviewcustomization)

The customizations a person makes to an adaptable sidebar tab view.

[`struct
TabCustomizationBehavior`](/documentation/swiftui/tabcustomizationbehavior)

The customization behavior of customizable tab view content.

### [Displaying views in multiple
panes](/documentation/swiftui/navigation#Displaying-views-in-multiple-panes)

[`struct HSplitView`](/documentation/swiftui/hsplitview)

A layout container that arranges its children in a horizontal line and allows
the user to resize them using dividers placed between them.

[`struct VSplitView`](/documentation/swiftui/vsplitview)

A layout container that arranges its children in a vertical line and allows
the user to resize them using dividers placed between them.

### [Deprecated Types](/documentation/swiftui/navigation#Deprecated-Types)

[`struct NavigationView`](/documentation/swiftui/navigationview)

A view for presenting a stack of views that represents a visible path in a
navigation hierarchy.

Deprecated

[`func tabItem<V>(() -> V) -> some
View`](/documentation/swiftui/view/tabitem\(_:\))

Sets the tab bar item associated with this view.

Deprecated

## [See Also](/documentation/swiftui/navigation#see-also)

### [App structure](/documentation/swiftui/navigation#App-structure)

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

[API ReferenceModal presentations](/documentation/swiftui/modal-presentations)

Present content in a separate view that offers focused interaction.

[API ReferenceToolbars](/documentation/swiftui/toolbars)

Provide immediate access to frequently used commands and controls.

[API ReferenceSearch](/documentation/swiftui/search)

Enable people to search for text or other content within your app.

[API ReferenceApp extensions](/documentation/swiftui/app-extensions)

Extend your app’s basic functionality to other parts of the system, like by
adding a Widget.

