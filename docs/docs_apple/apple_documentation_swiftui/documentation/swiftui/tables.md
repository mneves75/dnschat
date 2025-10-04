Collection

  * [ SwiftUI ](/documentation/swiftui)
  * Tables 

API Collection

# Tables

Display selectable, sortable data arranged in rows and columns.

## [Overview](/documentation/swiftui/tables#Overview)

Use a table to display multiple values across a collection of elements. Each
element in the collection appears in a different row of the table, while each
value for a given element appears in a different column. Narrow displays may
adapt to show only the first column of the table.

When you create a table, you provide a collection of elements, and then tell
the table how to find the needed value for each column. In simple cases,
SwiftUI infers the element for each row, but you can also specify the row
elements explicitly in more complex scenarios. With a small amount of
additional configuration, you can also make the items in the table selectable,
and the columns sortable.

Like a [`List`](/documentation/swiftui/list), a table includes implicit
vertical scrolling that you can configure using the view modifiers described
in [Scroll views](/documentation/swiftui/scroll-views). For design guidance,
see [Lists and tables](/design/Human-Interface-Guidelines/lists-and-tables) in
the Human Interface Guidelines.

## [Topics](/documentation/swiftui/tables#topics)

### [Creating a table](/documentation/swiftui/tables#Creating-a-table)

[Building a Great Mac App with
SwiftUI](/documentation/swiftui/building_a_great_mac_app_with_swiftui)

Create engaging SwiftUI Mac apps by incorporating side bars, tables, toolbars,
and several other popular user interface elements.

[`struct Table`](/documentation/swiftui/table)

A container that presents rows of data arranged in one or more columns,
optionally providing the ability to select one or more members.

[`func tableStyle<S>(S) -> some
View`](/documentation/swiftui/view/tablestyle\(_:\))

Sets the style for tables within this view.

### [Creating columns](/documentation/swiftui/tables#Creating-columns)

[`struct TableColumn`](/documentation/swiftui/tablecolumn)

A column that displays a view for each row in a table.

[`protocol TableColumnContent`](/documentation/swiftui/tablecolumncontent)

A type used to represent columns within a table.

[`struct TableColumnAlignment`](/documentation/swiftui/tablecolumnalignment)

Describes the alignment of the content of a table column.

[`struct TableColumnBuilder`](/documentation/swiftui/tablecolumnbuilder)

A result builder that creates table column content from closures.

[`struct TableColumnForEach`](/documentation/swiftui/tablecolumnforeach)

A structure that computes columns on demand from an underlying collection of
identified data.

### [Customizing columns](/documentation/swiftui/tables#Customizing-columns)

[`func tableColumnHeaders(Visibility) -> some
View`](/documentation/swiftui/view/tablecolumnheaders\(_:\))

Controls the visibility of a `Table`’s column header views.

[`struct
TableColumnCustomization`](/documentation/swiftui/tablecolumncustomization)

A representation of the state of the columns in a table.

[`struct
TableColumnCustomizationBehavior`](/documentation/swiftui/tablecolumncustomizationbehavior)

A set of customization behaviors of a column that a table can offer to a user.

### [Creating rows](/documentation/swiftui/tables#Creating-rows)

[`struct TableRow`](/documentation/swiftui/tablerow)

A row that represents a data value in a table.

[`protocol TableRowContent`](/documentation/swiftui/tablerowcontent)

A type used to represent table rows.

[`struct TableHeaderRowContent`](/documentation/swiftui/tableheaderrowcontent)

A table row that displays a single view instead of columned content.

[`struct TupleTableRowContent`](/documentation/swiftui/tupletablerowcontent)

A type of table column content that creates table rows created from a Swift
tuple of table rows.

[`struct TableForEachContent`](/documentation/swiftui/tableforeachcontent)

A type of table row content that creates table rows created by iterating over
a collection.

[`struct EmptyTableRowContent`](/documentation/swiftui/emptytablerowcontent)

A table row content that doesn’t produce any rows.

[`protocol
DynamicTableRowContent`](/documentation/swiftui/dynamictablerowcontent)

A type of table row content that generates table rows from an underlying
collection of data.

[`struct TableRowBuilder`](/documentation/swiftui/tablerowbuilder)

A result builder that creates table row content from closures.

### [Adding progressive disclosure](/documentation/swiftui/tables#Adding-
progressive-disclosure)

[`struct DisclosureTableRow`](/documentation/swiftui/disclosuretablerow)

A kind of table row that shows or hides additional rows based on the state of
a disclosure control.

[`struct
TableOutlineGroupContent`](/documentation/swiftui/tableoutlinegroupcontent)

An opaque table row type created by a table’s hierarchical initializers.

## [See Also](/documentation/swiftui/tables#see-also)

### [View layout](/documentation/swiftui/tables#View-layout)

[API ReferenceLayout fundamentals](/documentation/swiftui/layout-fundamentals)

Arrange views inside built-in layout containers like stacks and grids.

[API ReferenceLayout adjustments](/documentation/swiftui/layout-adjustments)

Make fine adjustments to alignment, spacing, padding, and other layout
parameters.

[API ReferenceCustom layout](/documentation/swiftui/custom-layout)

Place views in custom arrangements and create animated transitions between
layout types.

[API ReferenceLists](/documentation/swiftui/lists)

Display a structured, scrollable column of information.

[API ReferenceView groupings](/documentation/swiftui/view-groupings)

Present views in different kinds of purpose-driven containers, like forms or
control groups.

[API ReferenceScroll views](/documentation/swiftui/scroll-views)

Enable people to scroll to content that doesn’t fit in the current display.

