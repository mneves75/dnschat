Collection

  * [ SwiftUI ](/documentation/swiftui)
  * Custom layout 

API Collection

# Custom layout

Place views in custom arrangements and create animated transitions between
layout types.

## [Overview](/documentation/swiftui/custom-layout#Overview)

You can create complex view layouts using the built-in layout containers and
layout view modifiers that SwiftUI provides. However, if you need behavior
that you can’t achieve with the built-in layout tools, create a custom layout
container type using the [`Layout`](/documentation/swiftui/layout) protocol. A
container that you define asks for the sizes of all its subviews, and then
indicates where to place the subviews within its own bounds.

You can also create animated transitions among layout types that conform to
the [`Layout`](/documentation/swiftui/layout) procotol, including both built-
in and custom layouts.

For design guidance, see [Layout](/design/Human-Interface-Guidelines/layout)
in the Human Interface Guidelines.

## [Topics](/documentation/swiftui/custom-layout#topics)

### [Creating a custom layout container](/documentation/swiftui/custom-
layout#Creating-a-custom-layout-container)

[Composing custom layouts with
SwiftUI](/documentation/swiftui/composing_custom_layouts_with_swiftui)

Arrange views in your app’s interface using layout tools that SwiftUI
provides.

[`protocol Layout`](/documentation/swiftui/layout)

A type that defines the geometry of a collection of views.

[`struct LayoutSubview`](/documentation/swiftui/layoutsubview)

A proxy that represents one subview of a layout.

[`struct LayoutSubviews`](/documentation/swiftui/layoutsubviews)

A collection of proxy values that represent the subviews of a layout view.

### [Configuring a custom layout](/documentation/swiftui/custom-
layout#Configuring-a-custom-layout)

[`struct LayoutProperties`](/documentation/swiftui/layoutproperties)

Layout-specific properties of a layout container.

[`struct ProposedViewSize`](/documentation/swiftui/proposedviewsize)

A proposal for the size of a view.

[`struct ViewSpacing`](/documentation/swiftui/viewspacing)

A collection of the geometric spacing preferences of a view.

### [Associating values with views in a custom
layout](/documentation/swiftui/custom-layout#Associating-values-with-views-in-
a-custom-layout)

[`func layoutValue<K>(key: K.Type, value: K.Value) -> some
View`](/documentation/swiftui/view/layoutvalue\(key:value:\))

Associates a value with a custom layout property.

[`protocol LayoutValueKey`](/documentation/swiftui/layoutvaluekey)

A key for accessing a layout value of a layout container’s subviews.

### [Transitioning between layout types](/documentation/swiftui/custom-
layout#Transitioning-between-layout-types)

[`struct AnyLayout`](/documentation/swiftui/anylayout)

A type-erased instance of the layout protocol.

[`struct HStackLayout`](/documentation/swiftui/hstacklayout)

A horizontal container that you can use in conditional layouts.

[`struct VStackLayout`](/documentation/swiftui/vstacklayout)

A vertical container that you can use in conditional layouts.

[`struct ZStackLayout`](/documentation/swiftui/zstacklayout)

An overlaying container that you can use in conditional layouts.

[`struct GridLayout`](/documentation/swiftui/gridlayout)

A grid that you can use in conditional layouts.

## [See Also](/documentation/swiftui/custom-layout#see-also)

### [View layout](/documentation/swiftui/custom-layout#View-layout)

[API ReferenceLayout fundamentals](/documentation/swiftui/layout-fundamentals)

Arrange views inside built-in layout containers like stacks and grids.

[API ReferenceLayout adjustments](/documentation/swiftui/layout-adjustments)

Make fine adjustments to alignment, spacing, padding, and other layout
parameters.

[API ReferenceLists](/documentation/swiftui/lists)

Display a structured, scrollable column of information.

[API ReferenceTables](/documentation/swiftui/tables)

Display selectable, sortable data arranged in rows and columns.

[API ReferenceView groupings](/documentation/swiftui/view-groupings)

Present views in different kinds of purpose-driven containers, like forms or
control groups.

[API ReferenceScroll views](/documentation/swiftui/scroll-views)

Enable people to scroll to content that doesn’t fit in the current display.

