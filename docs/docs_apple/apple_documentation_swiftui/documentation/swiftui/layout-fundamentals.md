Collection

  * [ SwiftUI ](/documentation/swiftui)
  * Layout fundamentals 

API Collection

# Layout fundamentals

Arrange views inside built-in layout containers like stacks and grids.

## [Overview](/documentation/swiftui/layout-fundamentals#Overview)

Use layout containers to arrange the elements of your user interface. Stacks
and grids update and adjust the positions of the subviews they contain in
response to changes in content or interface dimensions. You can nest layout
containers inside other layout containers to any depth to achieve complex
layout effects.

To finetune the position, alignment, and other elements of a layout that you
build with layout container views, see [Layout
adjustments](/documentation/swiftui/layout-adjustments). To define custom
layout containers, see [Custom layout](/documentation/swiftui/custom-layout).
For design guidance, see [Layout](/design/Human-Interface-Guidelines/layout)
in the Human Interface Guidelines.

## [Topics](/documentation/swiftui/layout-fundamentals#topics)

### [Choosing a layout](/documentation/swiftui/layout-fundamentals#Choosing-a-
layout)

[Picking container views for your content](/documentation/swiftui/picking-
container-views-for-your-content)

Build flexible user interfaces by using stacks, grids, lists, and forms.

### [Statically arranging views in one
dimension](/documentation/swiftui/layout-fundamentals#Statically-arranging-
views-in-one-dimension)

[Building layouts with stack views](/documentation/swiftui/building-layouts-
with-stack-views)

Compose complex layouts from primitive container views.

[`struct HStack`](/documentation/swiftui/hstack)

A view that arranges its subviews in a horizontal line.

[`struct VStack`](/documentation/swiftui/vstack)

A view that arranges its subviews in a vertical line.

### [Dynamically arranging views in one
dimension](/documentation/swiftui/layout-fundamentals#Dynamically-arranging-
views-in-one-dimension)

[Grouping data with lazy stack views](/documentation/swiftui/grouping-data-
with-lazy-stack-views)

Split content into logical sections inside lazy stack views.

[Creating performant scrollable stacks](/documentation/swiftui/creating-
performant-scrollable-stacks)

Display large numbers of repeated views efficiently with scroll views, stack
views, and lazy stacks.

[`struct LazyHStack`](/documentation/swiftui/lazyhstack)

A view that arranges its children in a line that grows horizontally, creating
items only as needed.

[`struct LazyVStack`](/documentation/swiftui/lazyvstack)

A view that arranges its children in a line that grows vertically, creating
items only as needed.

[`struct PinnedScrollableViews`](/documentation/swiftui/pinnedscrollableviews)

A set of view types that may be pinned to the bounds of a scroll view.

### [Statically arranging views in two
dimensions](/documentation/swiftui/layout-fundamentals#Statically-arranging-
views-in-two-dimensions)

[`struct Grid`](/documentation/swiftui/grid)

A container view that arranges other views in a two dimensional layout.

[`struct GridRow`](/documentation/swiftui/gridrow)

A horizontal row in a two dimensional grid container.

[`func gridCellColumns(Int) -> some
View`](/documentation/swiftui/view/gridcellcolumns\(_:\))

Tells a view that acts as a cell in a grid to span the specified number of
columns.

[`func gridCellAnchor(UnitPoint) -> some
View`](/documentation/swiftui/view/gridcellanchor\(_:\))

Specifies a custom alignment anchor for a view that acts as a grid cell.

[`func gridCellUnsizedAxes(Axis.Set) -> some
View`](/documentation/swiftui/view/gridcellunsizedaxes\(_:\))

Asks grid layouts not to offer the view extra size in the specified axes.

[`func gridColumnAlignment(HorizontalAlignment) -> some
View`](/documentation/swiftui/view/gridcolumnalignment\(_:\))

Overrides the default horizontal alignment of the grid column that the view
appears in.

### [Dynamically arranging views in two
dimensions](/documentation/swiftui/layout-fundamentals#Dynamically-arranging-
views-in-two-dimensions)

[`struct LazyHGrid`](/documentation/swiftui/lazyhgrid)

A container view that arranges its child views in a grid that grows
horizontally, creating items only as needed.

[`struct LazyVGrid`](/documentation/swiftui/lazyvgrid)

A container view that arranges its child views in a grid that grows
vertically, creating items only as needed.

[`struct GridItem`](/documentation/swiftui/griditem)

A description of a row or a column in a lazy grid.

### [Layering views](/documentation/swiftui/layout-fundamentals#Layering-
views)

[Adding a background to your view](/documentation/swiftui/adding-a-background-
to-your-view)

Compose a background behind your view and extend it beyond the safe area
insets.

[`struct ZStack`](/documentation/swiftui/zstack)

A view that overlays its subviews, aligning them in both axes.

[`func zIndex(Double) -> some View`](/documentation/swiftui/view/zindex\(_:\))

Controls the display order of overlapping views.

[`func background<V>(alignment: Alignment, content: () -> V) -> some
View`](/documentation/swiftui/view/background\(alignment:content:\))

Layers the views that you specify behind this view.

[`func background<S>(S, ignoresSafeAreaEdges: Edge.Set) -> some
View`](/documentation/swiftui/view/background\(_:ignoressafeareaedges:\))

Sets the view’s background to a style.

[`func background(ignoresSafeAreaEdges: Edge.Set) -> some
View`](/documentation/swiftui/view/background\(ignoressafeareaedges:\))

Sets the view’s background to the default background style.

[`func
background(_:in:fillStyle:)`](/documentation/swiftui/view/background\(_:in:fillstyle:\))

Sets the view’s background to an insettable shape filled with a style.

[`func
background(in:fillStyle:)`](/documentation/swiftui/view/background\(in:fillstyle:\))

Sets the view’s background to an insettable shape filled with the default
background style.

[`func overlay<V>(alignment: Alignment, content: () -> V) -> some
View`](/documentation/swiftui/view/overlay\(alignment:content:\))

Layers the views that you specify in front of this view.

[`func overlay<S>(S, ignoresSafeAreaEdges: Edge.Set) -> some
View`](/documentation/swiftui/view/overlay\(_:ignoressafeareaedges:\))

Layers the specified style in front of this view.

[`func overlay<S, T>(S, in: T, fillStyle: FillStyle) -> some
View`](/documentation/swiftui/view/overlay\(_:in:fillstyle:\))

Layers a shape that you specify in front of this view.

[`var backgroundMaterial:
Material?`](/documentation/swiftui/environmentvalues/backgroundmaterial)

The material underneath the current view.

[`func containerBackground<S>(S, for: ContainerBackgroundPlacement) -> some
View`](/documentation/swiftui/view/containerbackground\(_:for:\))

Sets the container background of the enclosing container using a view.

[`func containerBackground<V>(for: ContainerBackgroundPlacement, alignment:
Alignment, content: () -> V) -> some
View`](/documentation/swiftui/view/containerbackground\(for:alignment:content:\))

Sets the container background of the enclosing container using a view.

[`struct
ContainerBackgroundPlacement`](/documentation/swiftui/containerbackgroundplacement)

The placement of a container background.

### [Automatically choosing the layout that
fits](/documentation/swiftui/layout-fundamentals#Automatically-choosing-the-
layout-that-fits)

[`struct ViewThatFits`](/documentation/swiftui/viewthatfits)

A view that adapts to the available space by providing the first child view
that fits.

### [Separators](/documentation/swiftui/layout-fundamentals#Separators)

[`struct Spacer`](/documentation/swiftui/spacer)

A flexible space that expands along the major axis of its containing stack
layout, or on both axes if not contained in a stack.

[`struct Divider`](/documentation/swiftui/divider)

A visual element that can be used to separate other content.

## [See Also](/documentation/swiftui/layout-fundamentals#see-also)

### [View layout](/documentation/swiftui/layout-fundamentals#View-layout)

[API ReferenceLayout adjustments](/documentation/swiftui/layout-adjustments)

Make fine adjustments to alignment, spacing, padding, and other layout
parameters.

[API ReferenceCustom layout](/documentation/swiftui/custom-layout)

Place views in custom arrangements and create animated transitions between
layout types.

[API ReferenceLists](/documentation/swiftui/lists)

Display a structured, scrollable column of information.

[API ReferenceTables](/documentation/swiftui/tables)

Display selectable, sortable data arranged in rows and columns.

[API ReferenceView groupings](/documentation/swiftui/view-groupings)

Present views in different kinds of purpose-driven containers, like forms or
control groups.

[API ReferenceScroll views](/documentation/swiftui/scroll-views)

Enable people to scroll to content that doesn’t fit in the current display.

