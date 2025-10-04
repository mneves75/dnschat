Collection

  * [ SwiftUI ](/documentation/swiftui)
  * Drawing and graphics 

API Collection

# Drawing and graphics

Enhance your views with graphical effects and customized drawings.

## [Overview](/documentation/swiftui/drawing-and-graphics#Overview)

You create rich, dynamic user interfaces with the built-in views and
[Shapes](/documentation/swiftui/shapes) that SwiftUI provides. To enhance any
view, you can apply many of the graphical effects typically associated with a
graphics context, like setting colors, adding masks, and creating composites.

When you need the flexibility of immediate mode drawing in a graphics context,
use a [`Canvas`](/documentation/swiftui/canvas) view. This can be particularly
helpful when you want to draw an extremely large number of dynamic shapes —
for example, to create particle effects.

For design guidance, see [Materials](/design/Human-Interface-
Guidelines/materials) and [Color](/design/Human-Interface-Guidelines/color) in
the Human Interface Guidelines.

## [Topics](/documentation/swiftui/drawing-and-graphics#topics)

### [Immediate mode drawing](/documentation/swiftui/drawing-and-
graphics#Immediate-mode-drawing)

[Add Rich Graphics to Your SwiftUI
App](/documentation/swiftui/add_rich_graphics_to_your_swiftui_app)

Make your apps stand out by adding background materials, vibrancy, custom
graphics, and animations.

[`struct Canvas`](/documentation/swiftui/canvas)

A view type that supports immediate mode drawing.

[`struct GraphicsContext`](/documentation/swiftui/graphicscontext)

An immediate mode drawing destination, and its current state.

### [Setting a color](/documentation/swiftui/drawing-and-graphics#Setting-a-
color)

[`func tint(_:)`](/documentation/swiftui/view/tint\(_:\))

Sets the tint color within this view.

[`struct Color`](/documentation/swiftui/color)

A representation of a color that adapts to a given context.

### [Styling content](/documentation/swiftui/drawing-and-graphics#Styling-
content)

[`func border<S>(S, width: CGFloat) -> some
View`](/documentation/swiftui/view/border\(_:width:\))

Adds a border to this view with the specified style and width.

[`func foregroundStyle<S>(S) -> some
View`](/documentation/swiftui/view/foregroundstyle\(_:\))

Sets a view’s foreground elements to use a given style.

[`func foregroundStyle<S1, S2>(S1, S2) -> some
View`](/documentation/swiftui/view/foregroundstyle\(_:_:\))

Sets the primary and secondary levels of the foreground style in the child
view.

[`func foregroundStyle<S1, S2, S3>(S1, S2, S3) -> some
View`](/documentation/swiftui/view/foregroundstyle\(_:_:_:\))

Sets the primary, secondary, and tertiary levels of the foreground style.

[`func backgroundStyle<S>(S) -> some
View`](/documentation/swiftui/view/backgroundstyle\(_:\))

Sets the specified style to render backgrounds within the view.

[`var backgroundStyle:
AnyShapeStyle?`](/documentation/swiftui/environmentvalues/backgroundstyle)

An optional style that overrides the default system background style when set.

[`protocol ShapeStyle`](/documentation/swiftui/shapestyle)

A color or pattern to use when rendering a shape.

[`struct AnyShapeStyle`](/documentation/swiftui/anyshapestyle)

A type-erased ShapeStyle value.

[`struct Gradient`](/documentation/swiftui/gradient)

A color gradient represented as an array of color stops, each having a
parametric location value.

[`struct MeshGradient`](/documentation/swiftui/meshgradient)

A two-dimensional gradient defined by a 2D grid of positioned colors.

[`struct AnyGradient`](/documentation/swiftui/anygradient)

A color gradient.

[`struct ShadowStyle`](/documentation/swiftui/shadowstyle)

A style to use when rendering shadows.

[`struct Glass`](/documentation/swiftui/glass)

A structure that defines the configuration of the Liquid Glass material.

### [Transforming colors](/documentation/swiftui/drawing-and-
graphics#Transforming-colors)

[`func brightness(Double) -> some
View`](/documentation/swiftui/view/brightness\(_:\))

Brightens this view by the specified amount.

[`func contrast(Double) -> some
View`](/documentation/swiftui/view/contrast\(_:\))

Sets the contrast and separation between similar colors in this view.

[`func colorInvert() -> some
View`](/documentation/swiftui/view/colorinvert\(\))

Inverts the colors in this view.

[`func colorMultiply(Color) -> some
View`](/documentation/swiftui/view/colormultiply\(_:\))

Adds a color multiplication effect to this view.

[`func saturation(Double) -> some
View`](/documentation/swiftui/view/saturation\(_:\))

Adjusts the color saturation of this view.

[`func grayscale(Double) -> some
View`](/documentation/swiftui/view/grayscale\(_:\))

Adds a grayscale effect to this view.

[`func hueRotation(Angle) -> some
View`](/documentation/swiftui/view/huerotation\(_:\))

Applies a hue rotation effect to this view.

[`func luminanceToAlpha() -> some
View`](/documentation/swiftui/view/luminancetoalpha\(\))

Adds a luminance to alpha effect to this view.

[`func materialActiveAppearance(MaterialActiveAppearance) -> some
View`](/documentation/swiftui/view/materialactiveappearance\(_:\))

Sets an explicit active appearance for materials in this view.

[`var materialActiveAppearance:
MaterialActiveAppearance`](/documentation/swiftui/environmentvalues/materialactiveappearance)

The behavior materials should use for their active state, defaulting to
`automatic`.

[`struct
MaterialActiveAppearance`](/documentation/swiftui/materialactiveappearance)

The behavior for how materials appear active and inactive.

### [Scaling, rotating, or transforming a
view](/documentation/swiftui/drawing-and-graphics#Scaling-rotating-or-
transforming-a-view)

[`func scaledToFill() -> some
View`](/documentation/swiftui/view/scaledtofill\(\))

Scales this view to fill its parent.

[`func scaledToFit() -> some
View`](/documentation/swiftui/view/scaledtofit\(\))

Scales this view to fit its parent.

[`func
scaleEffect(_:anchor:)`](/documentation/swiftui/view/scaleeffect\(_:anchor:\))

Scales this view’s rendered output by the given amount in both the horizontal
and vertical directions, relative to an anchor point.

[`func scaleEffect(x: CGFloat, y: CGFloat, anchor: UnitPoint) -> some
View`](/documentation/swiftui/view/scaleeffect\(x:y:anchor:\))

Scales this view’s rendered output by the given horizontal and vertical
amounts, relative to an anchor point.

[`func scaleEffect(x: CGFloat, y: CGFloat, z: CGFloat, anchor: UnitPoint3D) ->
some View`](/documentation/swiftui/view/scaleeffect\(x:y:z:anchor:\))

Scales this view by the specified horizontal, vertical, and depth factors,
relative to an anchor point.

[`func
aspectRatio(_:contentMode:)`](/documentation/swiftui/view/aspectratio\(_:contentmode:\))

Constrains this view’s dimensions to the specified aspect ratio.

[`func rotationEffect(Angle, anchor: UnitPoint) -> some
View`](/documentation/swiftui/view/rotationeffect\(_:anchor:\))

Rotates a view’s rendered output in two dimensions around the specified point.

[`func rotation3DEffect(Angle, axis: (x: CGFloat, y: CGFloat, z: CGFloat),
anchor: UnitPoint, anchorZ: CGFloat, perspective: CGFloat) -> some
View`](/documentation/swiftui/view/rotation3deffect\(_:axis:anchor:anchorz:perspective:\))

Renders a view’s content as if it’s rotated in three dimensions around the
specified axis.

[`func perspectiveRotationEffect(Angle, axis: (x: CGFloat, y: CGFloat, z:
CGFloat), anchor: UnitPoint, anchorZ: CGFloat, perspective: CGFloat) -> some
View`](/documentation/swiftui/view/perspectiverotationeffect\(_:axis:anchor:anchorz:perspective:\))

Renders a view’s content as if it’s rotated in three dimensions around the
specified axis.

[`func rotation3DEffect(Rotation3D, anchor: UnitPoint3D) -> some
View`](/documentation/swiftui/view/rotation3deffect\(_:anchor:\))

Rotates the view’s content by the specified 3D rotation value.

[`func
rotation3DEffect(_:axis:anchor:)`](/documentation/swiftui/view/rotation3deffect\(_:axis:anchor:\))

Rotates the view’s content by an angle about an axis that you specify as a
tuple of elements.

[`func transformEffect(CGAffineTransform) -> some
View`](/documentation/swiftui/view/transformeffect\(_:\))

Applies an affine transformation to this view’s rendered output.

[`func transform3DEffect(AffineTransform3D) -> some
View`](/documentation/swiftui/view/transform3deffect\(_:\))

Applies a 3D transformation to this view’s rendered output.

[`func projectionEffect(ProjectionTransform) -> some
View`](/documentation/swiftui/view/projectioneffect\(_:\))

Applies a projection transformation to this view’s rendered output.

[`struct ProjectionTransform`](/documentation/swiftui/projectiontransform)

[`enum ContentMode`](/documentation/swiftui/contentmode)

Constants that define how a view’s content fills the available space.

### [Masking and clipping](/documentation/swiftui/drawing-and-
graphics#Masking-and-clipping)

[`func mask<Mask>(alignment: Alignment, () -> Mask) -> some
View`](/documentation/swiftui/view/mask\(alignment:_:\))

Masks this view using the alpha channel of the given view.

[`func clipped(antialiased: Bool) -> some
View`](/documentation/swiftui/view/clipped\(antialiased:\))

Clips this view to its bounding rectangular frame.

[`func clipShape<S>(S, style: FillStyle) -> some
View`](/documentation/swiftui/view/clipshape\(_:style:\))

Sets a clipping shape for this view.

### [Applying blur and shadows](/documentation/swiftui/drawing-and-
graphics#Applying-blur-and-shadows)

[`func blur(radius: CGFloat, opaque: Bool) -> some
View`](/documentation/swiftui/view/blur\(radius:opaque:\))

Applies a Gaussian blur to this view.

[`func shadow(color: Color, radius: CGFloat, x: CGFloat, y: CGFloat) -> some
View`](/documentation/swiftui/view/shadow\(color:radius:x:y:\))

Adds a shadow to this view.

[`struct ColorMatrix`](/documentation/swiftui/colormatrix)

A matrix to use in an RGBA color transformation.

### [Applying effects based on geometry](/documentation/swiftui/drawing-and-
graphics#Applying-effects-based-on-geometry)

[`func visualEffect((EmptyVisualEffect, GeometryProxy) -> some VisualEffect)
-> some View`](/documentation/swiftui/view/visualeffect\(_:\))

Applies effects to this view, while providing access to layout information
through a geometry proxy.

[`func visualEffect3D((EmptyVisualEffect, GeometryProxy3D) -> some
VisualEffect) -> some View`](/documentation/swiftui/view/visualeffect3d\(_:\))

Applies effects to this view, while providing access to layout information
through a 3D geometry proxy.

[`protocol VisualEffect`](/documentation/swiftui/visualeffect)

Visual Effects change the visual appearance of a view without changing its
ancestors or descendents.

[`struct EmptyVisualEffect`](/documentation/swiftui/emptyvisualeffect)

The base visual effect that you apply additional effect to.

### [Compositing views](/documentation/swiftui/drawing-and-
graphics#Compositing-views)

[`func blendMode(BlendMode) -> some
View`](/documentation/swiftui/view/blendmode\(_:\))

Sets the blend mode for compositing this view with overlapping views.

[`func compositingGroup() -> some
View`](/documentation/swiftui/view/compositinggroup\(\))

Wraps this view in a compositing group.

[`func drawingGroup(opaque: Bool, colorMode: ColorRenderingMode) -> some
View`](/documentation/swiftui/view/drawinggroup\(opaque:colormode:\))

Composites this view’s contents into an offscreen image before final display.

[`enum BlendMode`](/documentation/swiftui/blendmode)

Modes for compositing a view with overlapping content.

[`enum ColorRenderingMode`](/documentation/swiftui/colorrenderingmode)

The set of possible working color spaces for color-compositing operations.

[`protocol CompositorContent`](/documentation/swiftui/compositorcontent)

[`struct
CompositorContentBuilder`](/documentation/swiftui/compositorcontentbuilder)

A result builder for composing a collection of
[`CompositorContent`](/documentation/swiftui/compositorcontent) elements.

[`struct AnyCompositorContent`](/documentation/swiftui/anycompositorcontent)

Type erased compositor content.

### [Measuring a view](/documentation/swiftui/drawing-and-graphics#Measuring-
a-view)

[`struct GeometryReader`](/documentation/swiftui/geometryreader)

A container view that defines its content as a function of its own size and
coordinate space.

[`struct GeometryReader3D`](/documentation/swiftui/geometryreader3d)

A container view that defines its content as a function of its own size and
coordinate space.

[`struct GeometryProxy`](/documentation/swiftui/geometryproxy)

A proxy for access to the size and coordinate space (for anchor resolution) of
the container view.

[`struct GeometryProxy3D`](/documentation/swiftui/geometryproxy3d)

A proxy for access to the size and coordinate space of the container view.

[`func coordinateSpace(NamedCoordinateSpace) -> some
View`](/documentation/swiftui/view/coordinatespace\(_:\))

Assigns a name to the view’s coordinate space, so other code can operate on
dimensions like points and sizes relative to the named space.

[`enum CoordinateSpace`](/documentation/swiftui/coordinatespace)

A resolved coordinate space created by the coordinate space protocol.

[`protocol
CoordinateSpaceProtocol`](/documentation/swiftui/coordinatespaceprotocol)

A frame of reference within the layout system.

[`struct PhysicalMetric`](/documentation/swiftui/physicalmetric)

Provides access to a value in points that corresponds to the specified
physical measurement.

[`struct
PhysicalMetricsConverter`](/documentation/swiftui/physicalmetricsconverter)

A physical metrics converter provides conversion between point values and
their extent in 3D space, in the form of physical length measurements.

### [Responding to a geometry change](/documentation/swiftui/drawing-and-
graphics#Responding-to-a-geometry-change)

[`func
onGeometryChange(for:of:action:)`](/documentation/swiftui/view/ongeometrychange\(for:of:action:\))

Adds an action to be performed when a value, created from a geometry proxy,
changes.

### [Accessing Metal shaders](/documentation/swiftui/drawing-and-
graphics#Accessing-Metal-shaders)

[`func colorEffect(Shader, isEnabled: Bool) -> some
View`](/documentation/swiftui/view/coloreffect\(_:isenabled:\))

Returns a new view that applies `shader` to `self` as a filter effect on the
color of each pixel.

[`func distortionEffect(Shader, maxSampleOffset: CGSize, isEnabled: Bool) ->
some
View`](/documentation/swiftui/view/distortioneffect\(_:maxsampleoffset:isenabled:\))

Returns a new view that applies `shader` to `self` as a geometric distortion
effect on the location of each pixel.

[`func layerEffect(Shader, maxSampleOffset: CGSize, isEnabled: Bool) -> some
View`](/documentation/swiftui/view/layereffect\(_:maxsampleoffset:isenabled:\))

Returns a new view that applies `shader` to `self` as a filter on the raster
layer created from `self`.

[`struct Shader`](/documentation/swiftui/shader)

A reference to a function in a Metal shader library, along with its bound
uniform argument values.

[`struct ShaderFunction`](/documentation/swiftui/shaderfunction)

A reference to a function in a Metal shader library.

[`struct ShaderLibrary`](/documentation/swiftui/shaderlibrary)

A Metal shader library.

### [Accessing geometric constructs](/documentation/swiftui/drawing-and-
graphics#Accessing-geometric-constructs)

[`enum Axis`](/documentation/swiftui/axis)

The horizontal or vertical dimension in a 2D coordinate system.

[`struct Angle`](/documentation/swiftui/angle)

A geometric angle whose value you access in either radians or degrees.

[`struct UnitPoint`](/documentation/swiftui/unitpoint)

A normalized 2D point in a view’s coordinate space.

[`struct UnitPoint3D`](/documentation/swiftui/unitpoint3d)

A normalized 3D point in a view’s coordinate space.

[`struct Anchor`](/documentation/swiftui/anchor)

An opaque value derived from an anchor source and a particular view.

[`protocol DepthAlignmentID`](/documentation/swiftui/depthalignmentid)

[`struct Alignment3D`](/documentation/swiftui/alignment3d)

An alignment in all three axes.

[`struct
GeometryProxyCoordinateSpace3D`](/documentation/swiftui/geometryproxycoordinatespace3d)

A representation of a `GeometryProxy3D` which can be used for
`CoordinateSpace3D` based conversions.

## [See Also](/documentation/swiftui/drawing-and-graphics#see-also)

### [Views](/documentation/swiftui/drawing-and-graphics#Views)

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

[API ReferenceShapes](/documentation/swiftui/shapes)

Trace and fill built-in and custom shapes with a color, gradient, or other
pattern.

