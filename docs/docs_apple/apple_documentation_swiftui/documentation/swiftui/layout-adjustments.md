Collection

  * [ SwiftUI ](/documentation/swiftui)
  * Layout adjustments 

API Collection

# Layout adjustments

Make fine adjustments to alignment, spacing, padding, and other layout
parameters.

## [Overview](/documentation/swiftui/layout-adjustments#Overview)

Layout containers like stacks and grids provide a great starting point for
arranging views in your app’s user interface. When you need to make fine
adjustments, use layout view modifiers. You can adjust or constrain the size,
position, and alignment of a view. You can also add padding around a view, and
indicate how the view interacts with system-defined safe areas.

To get started with a basic layout, see [Layout
fundamentals](/documentation/swiftui/layout-fundamentals). For design
guidance, see [Layout](/design/Human-Interface-Guidelines/layout) in the Human
Interface Guidelines.

## [Topics](/documentation/swiftui/layout-adjustments#topics)

### [Finetuning a layout](/documentation/swiftui/layout-
adjustments#Finetuning-a-layout)

[Laying out a simple view](/documentation/swiftui/laying-out-a-simple-view)

Create a view layout by adjusting the size of views.

[Inspecting view layout](/documentation/swiftui/inspecting-view-layout)

Determine the position and extent of a view using Xcode previews or by adding
temporary borders.

### [Adding padding around a view](/documentation/swiftui/layout-
adjustments#Adding-padding-around-a-view)

[`func padding(_:)`](/documentation/swiftui/view/padding\(_:\))

Adds a different padding amount to each edge of this view.

[`func padding(Edge.Set, CGFloat?) -> some
View`](/documentation/swiftui/view/padding\(_:_:\))

Adds an equal padding amount to specific edges of this view.

[`func padding3D(_:)`](/documentation/swiftui/view/padding3d\(_:\))

Pads this view using the edge insets you specify.

[`func padding3D(Edge3D.Set, CGFloat?) -> some
View`](/documentation/swiftui/view/padding3d\(_:_:\))

Pads this view using the edge insets you specify.

[`func scenePadding(Edge.Set) -> some
View`](/documentation/swiftui/view/scenepadding\(_:\))

Adds padding to the specified edges of this view using an amount that’s
appropriate for the current scene.

[`func scenePadding(ScenePadding, edges: Edge.Set) -> some
View`](/documentation/swiftui/view/scenepadding\(_:edges:\))

Adds a specified kind of padding to the specified edges of this view using an
amount that’s appropriate for the current scene.

[`struct ScenePadding`](/documentation/swiftui/scenepadding)

The padding used to space a view from its containing scene.

### [Influencing a view’s size](/documentation/swiftui/layout-
adjustments#Influencing-a-views-size)

[`func frame(width: CGFloat?, height: CGFloat?, alignment: Alignment) -> some
View`](/documentation/swiftui/view/frame\(width:height:alignment:\))

Positions this view within an invisible frame with the specified size.

[`func frame(depth: CGFloat?, alignment: DepthAlignment) -> some
View`](/documentation/swiftui/view/frame\(depth:alignment:\))

Positions this view within an invisible frame with the specified depth.

[`func frame(minWidth: CGFloat?, idealWidth: CGFloat?, maxWidth: CGFloat?,
minHeight: CGFloat?, idealHeight: CGFloat?, maxHeight: CGFloat?, alignment:
Alignment) -> some
View`](/documentation/swiftui/view/frame\(minwidth:idealwidth:maxwidth:minheight:idealheight:maxheight:alignment:\))

Positions this view within an invisible frame having the specified size
constraints.

[`func frame(minDepth: CGFloat?, idealDepth: CGFloat?, maxDepth: CGFloat?,
alignment: DepthAlignment) -> some
View`](/documentation/swiftui/view/frame\(mindepth:idealdepth:maxdepth:alignment:\))

Positions this view within an invisible frame having the specified depth
constraints.

[`func containerRelativeFrame(Axis.Set, alignment: Alignment) -> some
View`](/documentation/swiftui/view/containerrelativeframe\(_:alignment:\))

Positions this view within an invisible frame with a size relative to the
nearest container.

[`func containerRelativeFrame(Axis.Set, alignment: Alignment, (CGFloat, Axis)
-> CGFloat) -> some
View`](/documentation/swiftui/view/containerrelativeframe\(_:alignment:_:\))

Positions this view within an invisible frame with a size relative to the
nearest container.

[`func containerRelativeFrame(Axis.Set, count: Int, span: Int, spacing:
CGFloat, alignment: Alignment) -> some
View`](/documentation/swiftui/view/containerrelativeframe\(_:count:span:spacing:alignment:\))

Positions this view within an invisible frame with a size relative to the
nearest container.

[`func fixedSize() -> some View`](/documentation/swiftui/view/fixedsize\(\))

Fixes this view at its ideal size.

[`func fixedSize(horizontal: Bool, vertical: Bool) -> some
View`](/documentation/swiftui/view/fixedsize\(horizontal:vertical:\))

Fixes this view at its ideal size in the specified dimensions.

[`func layoutPriority(Double) -> some
View`](/documentation/swiftui/view/layoutpriority\(_:\))

Sets the priority by which a parent layout should apportion space to this
child.

### [Adjusting a view’s position](/documentation/swiftui/layout-
adjustments#Adjusting-a-views-position)

[Making fine adjustments to a view’s position](/documentation/swiftui/making-
fine-adjustments-to-a-view-s-position)

Shift the position of a view by applying the offset or position modifier.

[`func position(CGPoint) -> some
View`](/documentation/swiftui/view/position\(_:\))

Positions the center of this view at the specified point in its parent’s
coordinate space.

[`func position(x: CGFloat, y: CGFloat) -> some
View`](/documentation/swiftui/view/position\(x:y:\))

Positions the center of this view at the specified coordinates in its parent’s
coordinate space.

[`func offset(CGSize) -> some View`](/documentation/swiftui/view/offset\(_:\))

Offset this view by the horizontal and vertical amount specified in the offset
parameter.

[`func offset(x: CGFloat, y: CGFloat) -> some
View`](/documentation/swiftui/view/offset\(x:y:\))

Offset this view by the specified horizontal and vertical distances.

[`func offset(z: CGFloat) -> some
View`](/documentation/swiftui/view/offset\(z:\))

Brings a view forward in Z by the provided distance in points.

### [Aligning views](/documentation/swiftui/layout-adjustments#Aligning-views)

[Aligning views within a stack](/documentation/swiftui/aligning-views-within-
a-stack)

Position views inside a stack using alignment guides.

[Aligning views across stacks](/documentation/swiftui/aligning-views-across-
stacks)

Create a custom alignment and use it to align views across multiple stacks.

[`func
alignmentGuide(_:computeValue:)`](/documentation/swiftui/view/alignmentguide\(_:computevalue:\))

Sets the view’s horizontal alignment.

[`struct Alignment`](/documentation/swiftui/alignment)

An alignment in both axes.

[`struct HorizontalAlignment`](/documentation/swiftui/horizontalalignment)

An alignment position along the horizontal axis.

[`struct VerticalAlignment`](/documentation/swiftui/verticalalignment)

An alignment position along the vertical axis.

[`struct DepthAlignment`](/documentation/swiftui/depthalignment)

An alignment position along the depth axis.

[`protocol AlignmentID`](/documentation/swiftui/alignmentid)

A type that you use to create custom alignment guides.

[`struct ViewDimensions`](/documentation/swiftui/viewdimensions)

A view’s size and alignment guides in its own coordinate space.

[`struct ViewDimensions3D`](/documentation/swiftui/viewdimensions3d)

A view’s 3D size and alignment guides in its own coordinate space.

[`struct SpatialContainer`](/documentation/swiftui/spatialcontainer)

A layout container that aligns overlapping content in 3D space.

### [Setting margins](/documentation/swiftui/layout-adjustments#Setting-
margins)

[`func contentMargins(CGFloat, for: ContentMarginPlacement) -> some
View`](/documentation/swiftui/view/contentmargins\(_:for:\))

Configures the content margin for a provided placement.

[`func
contentMargins(_:_:for:)`](/documentation/swiftui/view/contentmargins\(_:_:for:\))

Configures the content margin for a provided placement.

[`struct
ContentMarginPlacement`](/documentation/swiftui/contentmarginplacement)

The placement of margins.

### [Staying in the safe areas](/documentation/swiftui/layout-
adjustments#Staying-in-the-safe-areas)

[`func ignoresSafeArea(SafeAreaRegions, edges: Edge.Set) -> some
View`](/documentation/swiftui/view/ignoressafearea\(_:edges:\))

Expands the safe area of a view.

[`func
safeAreaInset(edge:alignment:spacing:content:)`](/documentation/swiftui/view/safeareainset\(edge:alignment:spacing:content:\))

Shows the specified content beside the modified view.

[`func
safeAreaPadding(_:)`](/documentation/swiftui/view/safeareapadding\(_:\))

Adds the provided insets into the safe area of this view.

[`func safeAreaPadding(Edge.Set, CGFloat?) -> some
View`](/documentation/swiftui/view/safeareapadding\(_:_:\))

Adds the provided insets into the safe area of this view.

[`struct SafeAreaRegions`](/documentation/swiftui/safearearegions)

A set of symbolic safe area regions.

### [Setting a layout direction](/documentation/swiftui/layout-
adjustments#Setting-a-layout-direction)

[`func layoutDirectionBehavior(LayoutDirectionBehavior) -> some
View`](/documentation/swiftui/view/layoutdirectionbehavior\(_:\))

Sets the behavior of this view for different layout directions.

[`enum
LayoutDirectionBehavior`](/documentation/swiftui/layoutdirectionbehavior)

A description of what should happen when the layout direction changes.

[`var layoutDirection:
LayoutDirection`](/documentation/swiftui/environmentvalues/layoutdirection)

The layout direction associated with the current environment.

[`enum LayoutDirection`](/documentation/swiftui/layoutdirection)

A direction in which SwiftUI can lay out content.

[`struct
LayoutRotationUnaryLayout`](/documentation/swiftui/layoutrotationunarylayout)

### [Reacting to interface characteristics](/documentation/swiftui/layout-
adjustments#Reacting-to-interface-characteristics)

[`var isLuminanceReduced:
Bool`](/documentation/swiftui/environmentvalues/isluminancereduced)

A Boolean value that indicates whether the display or environment currently
requires reduced luminance.

[`var displayScale:
CGFloat`](/documentation/swiftui/environmentvalues/displayscale)

The display scale of this environment.

[`var pixelLength:
CGFloat`](/documentation/swiftui/environmentvalues/pixellength)

The size of a pixel on the screen.

[`var horizontalSizeClass:
UserInterfaceSizeClass?`](/documentation/swiftui/environmentvalues/horizontalsizeclass)

The horizontal size class of this environment.

[`var verticalSizeClass:
UserInterfaceSizeClass?`](/documentation/swiftui/environmentvalues/verticalsizeclass)

The vertical size class of this environment.

[`enum UserInterfaceSizeClass`](/documentation/swiftui/userinterfacesizeclass)

A set of values that indicate the visual size available to the view.

### [Accessing edges, regions, and layouts](/documentation/swiftui/layout-
adjustments#Accessing-edges-regions-and-layouts)

[`enum Edge`](/documentation/swiftui/edge)

An enumeration to indicate one edge of a rectangle.

[`enum Edge3D`](/documentation/swiftui/edge3d)

An edge or face of a 3D volume.

[`enum HorizontalEdge`](/documentation/swiftui/horizontaledge)

An edge on the horizontal axis.

[`enum VerticalEdge`](/documentation/swiftui/verticaledge)

An edge on the vertical axis.

[`struct EdgeInsets`](/documentation/swiftui/edgeinsets)

The inset distances for the sides of a rectangle.

[`struct EdgeInsets3D`](/documentation/swiftui/edgeinsets3d)

The inset distances for the faces of a 3D volume.

## [See Also](/documentation/swiftui/layout-adjustments#see-also)

### [View layout](/documentation/swiftui/layout-adjustments#View-layout)

[API ReferenceLayout fundamentals](/documentation/swiftui/layout-fundamentals)

Arrange views inside built-in layout containers like stacks and grids.

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

