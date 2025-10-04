Collection

  * [ SwiftUI ](/documentation/swiftui)
  * Lists 

API Collection

# Lists

Display a structured, scrollable column of information.

## [Overview](/documentation/swiftui/lists#Overview)

Use a list to display a one-dimensional vertical collection of views.

The list is a complex container type that automatically provides scrolling
when it grows too large for the current display. You build a list by providing
it with individual views for the rows in the list, or by using a
[`ForEach`](/documentation/swiftui/foreach) to enumerate a group of rows. You
can also mix these strategies, blending any number of individual views and
`ForEach` constructs.

Use view modifiers to configure the appearance and behavior of a list and its
rows, headers, sections, and separators. For example, you can apply a style to
the list, add swipe gestures to individual rows, or make the list refreshable
with a pull-down gesture. You can also use the configuration associated with
[Scroll views](/documentation/swiftui/scroll-views) to control the list’s
implicit scrolling behavior.

For design guidance, see [Lists and tables](/design/Human-Interface-
Guidelines/lists-and-tables) in the Human Interface Guidelines.

## [Topics](/documentation/swiftui/lists#topics)

### [Creating a list](/documentation/swiftui/lists#Creating-a-list)

[Displaying data in lists](/documentation/swiftui/displaying-data-in-lists)

Visualize collections of data with platform-appropriate appearance.

[`struct List`](/documentation/swiftui/list)

A container that presents rows of data arranged in a single column, optionally
providing the ability to select one or more members.

[`func listStyle<S>(S) -> some
View`](/documentation/swiftui/view/liststyle\(_:\))

Sets the style for lists within this view.

### [Disclosing information
progressively](/documentation/swiftui/lists#Disclosing-information-
progressively)

[`struct OutlineGroup`](/documentation/swiftui/outlinegroup)

A structure that computes views and disclosure groups on demand from an
underlying collection of tree-structured, identified data.

[`struct DisclosureGroup`](/documentation/swiftui/disclosuregroup)

A view that shows or hides another content view, based on the state of a
disclosure control.

[`func disclosureGroupStyle<S>(S) -> some
View`](/documentation/swiftui/view/disclosuregroupstyle\(_:\))

Sets the style for disclosure groups within this view.

### [Configuring a list’s layout](/documentation/swiftui/lists#Configuring-a-
lists-layout)

[`func listRowInsets(EdgeInsets?) -> some
View`](/documentation/swiftui/view/listrowinsets\(_:\))

Applies an inset to the rows in a list.

[`var defaultMinListRowHeight:
CGFloat`](/documentation/swiftui/environmentvalues/defaultminlistrowheight)

The default minimum height of rows in a list.

[`var defaultMinListHeaderHeight:
CGFloat?`](/documentation/swiftui/environmentvalues/defaultminlistheaderheight)

The default minimum height of a header in a list.

[`func listRowSpacing(CGFloat?) -> some
View`](/documentation/swiftui/view/listrowspacing\(_:\))

Sets the vertical spacing between two adjacent rows in a List.

[`func
listSectionSpacing(_:)`](/documentation/swiftui/view/listsectionspacing\(_:\))

Sets the spacing between adjacent sections in a
[`List`](/documentation/swiftui/list) to a custom value.

[`struct ListSectionSpacing`](/documentation/swiftui/listsectionspacing)

The spacing options between two adjacent sections in a list.

[`func listSectionMargins(Edge.Set, CGFloat?) -> some
View`](/documentation/swiftui/view/listsectionmargins\(_:_:\))

Set the section margins for the specific edges.

### [Configuring rows](/documentation/swiftui/lists#Configuring-rows)

[`func listItemTint(_:)`](/documentation/swiftui/view/listitemtint\(_:\))

Sets a fixed tint color for content in a list.

[`struct ListItemTint`](/documentation/swiftui/listitemtint)

A tint effect configuration that you can apply to content in a list.

### [Configuring headers](/documentation/swiftui/lists#Configuring-headers)

[`func headerProminence(Prominence) -> some
View`](/documentation/swiftui/view/headerprominence\(_:\))

Sets the header prominence for this view.

[`var headerProminence:
Prominence`](/documentation/swiftui/environmentvalues/headerprominence)

The prominence to apply to section headers within a view.

[`enum Prominence`](/documentation/swiftui/prominence)

A type indicating the prominence of a view hierarchy.

### [Configuring separators](/documentation/swiftui/lists#Configuring-
separators)

[`func listRowSeparatorTint(Color?, edges: VerticalEdge.Set) -> some
View`](/documentation/swiftui/view/listrowseparatortint\(_:edges:\))

Sets the tint color associated with a row.

[`func listSectionSeparatorTint(Color?, edges: VerticalEdge.Set) -> some
View`](/documentation/swiftui/view/listsectionseparatortint\(_:edges:\))

Sets the tint color associated with a section.

[`func listRowSeparator(Visibility, edges: VerticalEdge.Set) -> some
View`](/documentation/swiftui/view/listrowseparator\(_:edges:\))

Sets the display mode for the separator associated with this specific row.

[`func listSectionSeparator(Visibility, edges: VerticalEdge.Set) -> some
View`](/documentation/swiftui/view/listsectionseparator\(_:edges:\))

Sets whether to hide the separator associated with a list section.

### [Configuring backgrounds](/documentation/swiftui/lists#Configuring-
backgrounds)

[`func listRowBackground<V>(V?) -> some
View`](/documentation/swiftui/view/listrowbackground\(_:\))

Places a custom background view behind a list row item.

[`func alternatingRowBackgrounds(AlternatingRowBackgroundBehavior) -> some
View`](/documentation/swiftui/view/alternatingrowbackgrounds\(_:\))

Overrides whether lists and tables in this view have alternating row
backgrounds.

[`struct
AlternatingRowBackgroundBehavior`](/documentation/swiftui/alternatingrowbackgroundbehavior)

The styling of views with respect to alternating row backgrounds.

[`var backgroundProminence:
BackgroundProminence`](/documentation/swiftui/environmentvalues/backgroundprominence)

The prominence of the background underneath views associated with this
environment.

[`struct BackgroundProminence`](/documentation/swiftui/backgroundprominence)

The prominence of backgrounds underneath other views.

### [Displaying a badge on a list
item](/documentation/swiftui/lists#Displaying-a-badge-on-a-list-item)

[`func badge(_:)`](/documentation/swiftui/view/badge\(_:\))

Generates a badge for the view from an integer value.

[`func badgeProminence(BadgeProminence) -> some
View`](/documentation/swiftui/view/badgeprominence\(_:\))

Specifies the prominence of badges created by this view.

[`var badgeProminence:
BadgeProminence`](/documentation/swiftui/environmentvalues/badgeprominence)

The prominence to apply to badges associated with this environment.

[`struct BadgeProminence`](/documentation/swiftui/badgeprominence)

The visual prominence of a badge.

### [Configuring interaction](/documentation/swiftui/lists#Configuring-
interaction)

[`func swipeActions<T>(edge: HorizontalEdge, allowsFullSwipe: Bool, content:
() -> T) -> some
View`](/documentation/swiftui/view/swipeactions\(edge:allowsfullswipe:content:\))

Adds custom swipe actions to a row in a list.

[`func selectionDisabled(Bool) -> some
View`](/documentation/swiftui/view/selectiondisabled\(_:\))

Adds a condition that controls whether users can select this view.

[`func listRowHoverEffect(HoverEffect?) -> some
View`](/documentation/swiftui/view/listrowhovereffect\(_:\))

Requests that the containing list row use the provided hover effect.

[`func listRowHoverEffectDisabled(Bool) -> some
View`](/documentation/swiftui/view/listrowhovereffectdisabled\(_:\))

Requests that the containing list row have its hover effect disabled.

### [Refreshing a list’s content](/documentation/swiftui/lists#Refreshing-a-
lists-content)

[`func refreshable(action: () async -> Void) -> some
View`](/documentation/swiftui/view/refreshable\(action:\))

Marks this view as refreshable.

[`var refresh:
RefreshAction?`](/documentation/swiftui/environmentvalues/refresh)

A refresh action stored in a view’s environment.

[`struct RefreshAction`](/documentation/swiftui/refreshaction)

An action that initiates a refresh operation.

### [Editing a list](/documentation/swiftui/lists#Editing-a-list)

[`func moveDisabled(Bool) -> some
View`](/documentation/swiftui/view/movedisabled\(_:\))

Adds a condition for whether the view’s view hierarchy is movable.

[`func deleteDisabled(Bool) -> some
View`](/documentation/swiftui/view/deletedisabled\(_:\))

Adds a condition for whether the view’s view hierarchy is deletable.

[`var editMode:
Binding<EditMode>?`](/documentation/swiftui/environmentvalues/editmode)

An indication of whether the user can edit the contents of a view associated
with this environment.

[`enum EditMode`](/documentation/swiftui/editmode)

A mode that indicates whether the user can edit a view’s content.

[`struct EditActions`](/documentation/swiftui/editactions)

A set of edit actions on a collection of data that a view can offer to a user.

[`struct
EditableCollectionContent`](/documentation/swiftui/editablecollectioncontent)

An opaque wrapper view that adds editing capabilities to a row in a list.

[`struct
IndexedIdentifierCollection`](/documentation/swiftui/indexedidentifiercollection)

A collection wrapper that iterates over the indices and identifiers of a
collection together.

### [Configuring a section index](/documentation/swiftui/lists#Configuring-a-
section-index)

[`func listSectionIndexVisibility(Visibility) -> some
View`](/documentation/swiftui/view/listsectionindexvisibility\(_:\))

Changes the visibility of the list section index.

[`func
sectionIndexLabel(_:)`](/documentation/swiftui/view/sectionindexlabel\(_:\))

Sets the label that is used in a section index to point to this section,
typically only a single character long.

## [See Also](/documentation/swiftui/lists#see-also)

### [View layout](/documentation/swiftui/lists#View-layout)

[API ReferenceLayout fundamentals](/documentation/swiftui/layout-fundamentals)

Arrange views inside built-in layout containers like stacks and grids.

[API ReferenceLayout adjustments](/documentation/swiftui/layout-adjustments)

Make fine adjustments to alignment, spacing, padding, and other layout
parameters.

[API ReferenceCustom layout](/documentation/swiftui/custom-layout)

Place views in custom arrangements and create animated transitions between
layout types.

[API ReferenceTables](/documentation/swiftui/tables)

Display selectable, sortable data arranged in rows and columns.

[API ReferenceView groupings](/documentation/swiftui/view-groupings)

Present views in different kinds of purpose-driven containers, like forms or
control groups.

[API ReferenceScroll views](/documentation/swiftui/scroll-views)

Enable people to scroll to content that doesn’t fit in the current display.

