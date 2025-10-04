Collection

  * [ SwiftUI ](/documentation/swiftui)
  * Shapes 

API Collection

# Shapes

Trace and fill built-in and custom shapes with a color, gradient, or other
pattern.

## [Overview](/documentation/swiftui/shapes#Overview)

Draw shapes like circles and rectangles, as well as custom paths that define
shapes of your own design. Apply styles that include environment-aware colors,
rich gradients, and material effects to the foreground, background, and
outline of your shapes.

If you need the efficiency or flexibility of immediate mode drawing — for
example, to create particle effects — use a
[`Canvas`](/documentation/swiftui/canvas) view instead.

## [Topics](/documentation/swiftui/shapes#topics)

### [Creating rectangular shapes](/documentation/swiftui/shapes#Creating-
rectangular-shapes)

[`struct Rectangle`](/documentation/swiftui/rectangle)

A rectangular shape aligned inside the frame of the view containing it.

[`struct RoundedRectangle`](/documentation/swiftui/roundedrectangle)

A rectangular shape with rounded corners, aligned inside the frame of the view
containing it.

[`enum RoundedCornerStyle`](/documentation/swiftui/roundedcornerstyle)

Defines the shape of a rounded rectangle’s corners.

[`protocol
RoundedRectangularShape`](/documentation/swiftui/roundedrectangularshape)

A protocol of [`InsettableShape`](/documentation/swiftui/insettableshape) that
describes a rounded rectangular shape.

[`struct
RoundedRectangularShapeCorners`](/documentation/swiftui/roundedrectangularshapecorners)

A type describing the corner styles of a
[`RoundedRectangularShape`](/documentation/swiftui/roundedrectangularshape).

[`struct
UnevenRoundedRectangle`](/documentation/swiftui/unevenroundedrectangle)

A rectangular shape with rounded corners with different values, aligned inside
the frame of the view containing it.

[`struct RectangleCornerRadii`](/documentation/swiftui/rectanglecornerradii)

Describes the corner radius values of a rounded rectangle with uneven corners.

[`struct RectangleCornerInsets`](/documentation/swiftui/rectanglecornerinsets)

The inset sizes for the corners of a rectangle.

[`struct ConcentricRectangle`](/documentation/swiftui/concentricrectangle)

A shape that is replaced by a concentric version of the current container
shape. If the container shape is a rectangle derived shape with four corners,
this shape could choose to respect corners individually.

### [Creating circular shapes](/documentation/swiftui/shapes#Creating-
circular-shapes)

[`struct Circle`](/documentation/swiftui/circle)

A circle centered on the frame of the view containing it.

[`struct Ellipse`](/documentation/swiftui/ellipse)

An ellipse aligned inside the frame of the view containing it.

[`struct Capsule`](/documentation/swiftui/capsule)

A capsule shape aligned inside the frame of the view containing it.

### [Drawing custom shapes](/documentation/swiftui/shapes#Drawing-custom-
shapes)

[`struct Path`](/documentation/swiftui/path)

The outline of a 2D shape.

### [Defining shape behavior](/documentation/swiftui/shapes#Defining-shape-
behavior)

[`protocol ShapeView`](/documentation/swiftui/shapeview)

A view that provides a shape that you can use for drawing operations.

[`protocol Shape`](/documentation/swiftui/shape)

A 2D shape that you can use when drawing a view.

[`struct AnyShape`](/documentation/swiftui/anyshape)

A type-erased shape value.

[`enum ShapeRole`](/documentation/swiftui/shaperole)

Ways of styling a shape.

[`struct StrokeStyle`](/documentation/swiftui/strokestyle)

The characteristics of a stroke that traces a path.

[`struct StrokeShapeView`](/documentation/swiftui/strokeshapeview)

A shape provider that strokes its shape.

[`struct StrokeBorderShapeView`](/documentation/swiftui/strokebordershapeview)

A shape provider that strokes the border of its shape.

[`struct FillStyle`](/documentation/swiftui/fillstyle)

A style for rasterizing vector shapes.

[`struct FillShapeView`](/documentation/swiftui/fillshapeview)

A shape provider that fills its shape.

### [Transforming a shape](/documentation/swiftui/shapes#Transforming-a-shape)

[`struct ScaledShape`](/documentation/swiftui/scaledshape)

A shape with a scale transform applied to it.

[`struct RotatedShape`](/documentation/swiftui/rotatedshape)

A shape with a rotation transform applied to it.

[`struct OffsetShape`](/documentation/swiftui/offsetshape)

A shape with a translation offset transform applied to it.

[`struct TransformedShape`](/documentation/swiftui/transformedshape)

A shape with an affine transform applied to it.

### [Setting a container shape](/documentation/swiftui/shapes#Setting-a-
container-shape)

[`func containerShape(_:)`](/documentation/swiftui/view/containershape\(_:\))

Sets the container shape to use for any container relative shape or concentric
rectangle within this view.

[`protocol InsettableShape`](/documentation/swiftui/insettableshape)

A shape type that is able to inset itself to produce another shape.

[`struct
ContainerRelativeShape`](/documentation/swiftui/containerrelativeshape)

A shape that is replaced by an inset version of the current container shape.
If no container shape was defined, is replaced by a rectangle.

## [See Also](/documentation/swiftui/shapes#see-also)

### [Views](/documentation/swiftui/shapes#Views)

[API ReferenceView fundamentals](/documentation/swiftui/view-fundamentals)

Define the visual elements of your app using a hierarchy of views.

[API ReferenceView configuration](/documentation/swiftui/view-configuration)

Adjust the characteristics of views in a hierarchy.

[API ReferenceView styles](/documentation/swiftui/view-styles)

Apply built-in and custom appearances and behaviors to different types of
views.

[API ReferenceAnimations](/documentation/swiftui/animations)

Create smooth visual updates in response to state changes.

[API ReferenceText input and output](/documentation/swiftui/text-input-and-
output)

Display formatted text and get text input from the user.

[API ReferenceImages](/documentation/swiftui/images)

Add images and symbols to your app’s user interface.

[API ReferenceControls and indicators](/documentation/swiftui/controls-and-
indicators)

Display values and get user selections.

[API ReferenceMenus and commands](/documentation/swiftui/menus-and-commands)

Provide space-efficient, context-dependent access to commands and controls.

[API ReferenceDrawing and graphics](/documentation/swiftui/drawing-and-
graphics)

Enhance your views with graphical effects and customized drawings.

