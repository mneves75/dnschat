Collection

  * [ SwiftUI ](/documentation/swiftui)
  * View groupings 

API Collection

# View groupings

Present views in different kinds of purpose-driven containers, like forms or
control groups.

## [Overview](/documentation/swiftui/view-groupings#Overview)

You can create groups of views that serve different purposes.

For example, a [`Group`](/documentation/swiftui/group) construct treats the
specified views as a unit without imposing any additional layout or appearance
characteristics. A [`Form`](/documentation/swiftui/form) presents a group of
elements with a platform-specific appearance that’s suitable for gathering
input from people.

For design guidance, see [Layout](/design/Human-Interface-Guidelines/layout)
in the Human Interface Guidelines.

## [Topics](/documentation/swiftui/view-groupings#topics)

### [Grouping views into a container](/documentation/swiftui/view-
groupings#Grouping-views-into-a-container)

[Creating custom container views](/documentation/swiftui/creating-custom-
container-views)

Access individual subviews to compose flexible container views.

[`struct Group`](/documentation/swiftui/group)

A type that collects multiple instances of a content type — like views,
scenes, or commands — into a single unit.

[`struct
GroupElementsOfContent`](/documentation/swiftui/groupelementsofcontent)

Transforms the subviews of a given view into a resulting content view.

[`struct
GroupSectionsOfContent`](/documentation/swiftui/groupsectionsofcontent)

Transforms the sections of a given view into a resulting content view.

### [Organizing views into sections](/documentation/swiftui/view-
groupings#Organizing-views-into-sections)

[`struct Section`](/documentation/swiftui/section)

A container view that you can use to add hierarchy within certain views.

[`struct SectionCollection`](/documentation/swiftui/sectioncollection)

An opaque collection representing the sections of view.

[`struct SectionConfiguration`](/documentation/swiftui/sectionconfiguration)

Specifies the contents of a section.

### [Iterating over dynamic data](/documentation/swiftui/view-
groupings#Iterating-over-dynamic-data)

[`struct ForEach`](/documentation/swiftui/foreach)

A structure that computes views on demand from an underlying collection of
identified data.

[`struct
ForEachSectionCollection`](/documentation/swiftui/foreachsectioncollection)

A collection which allows a view to be treated as a collection of its sections
in a for each loop.

[`struct
ForEachSubviewCollection`](/documentation/swiftui/foreachsubviewcollection)

A collection which allows a view to be treated as a collection of its subviews
in a for each loop.

[`protocol DynamicViewContent`](/documentation/swiftui/dynamicviewcontent)

A type of view that generates views from an underlying collection of data.

### [Accessing a container’s subviews](/documentation/swiftui/view-
groupings#Accessing-a-containers-subviews)

[`struct Subview`](/documentation/swiftui/subview)

An opaque value representing a subview of another view.

[`struct SubviewsCollection`](/documentation/swiftui/subviewscollection)

An opaque collection representing the subviews of view.

[`struct
SubviewsCollectionSlice`](/documentation/swiftui/subviewscollectionslice)

A slice of a SubviewsCollection.

[`func containerValue<V>(WritableKeyPath<ContainerValues, V>, V) -> some
View`](/documentation/swiftui/view/containervalue\(_:_:\))

Sets a particular container value of a view.

[`struct ContainerValues`](/documentation/swiftui/containervalues)

A collection of container values associated with a given view.

[`protocol ContainerValueKey`](/documentation/swiftui/containervaluekey)

A key for accessing container values.

### [Grouping views into a box](/documentation/swiftui/view-
groupings#Grouping-views-into-a-box)

[`struct GroupBox`](/documentation/swiftui/groupbox)

A stylized view, with an optional label, that visually collects a logical
grouping of content.

[`func groupBoxStyle<S>(S) -> some
View`](/documentation/swiftui/view/groupboxstyle\(_:\))

Sets the style for group boxes within this view.

### [Grouping inputs](/documentation/swiftui/view-groupings#Grouping-inputs)

[`struct Form`](/documentation/swiftui/form)

A container for grouping controls used for data entry, such as in settings or
inspectors.

[`func formStyle<S>(S) -> some
View`](/documentation/swiftui/view/formstyle\(_:\))

Sets the style for forms in a view hierarchy.

[`struct LabeledContent`](/documentation/swiftui/labeledcontent)

A container for attaching a label to a value-bearing view.

[`func labeledContentStyle<S>(S) -> some
View`](/documentation/swiftui/view/labeledcontentstyle\(_:\))

Sets a style for labeled content.

### [Presenting a group of controls](/documentation/swiftui/view-
groupings#Presenting-a-group-of-controls)

[`struct ControlGroup`](/documentation/swiftui/controlgroup)

A container view that displays semantically-related controls in a visually-
appropriate manner for the context

[`func controlGroupStyle<S>(S) -> some
View`](/documentation/swiftui/view/controlgroupstyle\(_:\))

Sets the style for control groups within this view.

## [See Also](/documentation/swiftui/view-groupings#see-also)

### [View layout](/documentation/swiftui/view-groupings#View-layout)

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

[API ReferenceTables](/documentation/swiftui/tables)

Display selectable, sortable data arranged in rows and columns.

[API ReferenceScroll views](/documentation/swiftui/scroll-views)

Enable people to scroll to content that doesn’t fit in the current display.

