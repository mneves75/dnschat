  * [ Accelerate ](/documentation/accelerate)
  * Adding a bokeh effect to images 

Sample Code

# Adding a bokeh effect to images

Simulate a bokeh effect by applying dilation.

[ Download ](https://docs-
assets.developer.apple.com/published/91872ae2b1fd/AddingABokehEffectToImages.zip)

macOS 13.3+Xcode 14.0+

## [Overview](/documentation/Accelerate/adding-a-bokeh-effect-to-
images#Overview)

This sample app creates a bokeh effect, where parts of an image that are out
of focus adopt the shape of the lens’s aperture. The app dynamically generates
a polygon-shaped kernel — also known as a _structuring element_ — and applies
a morphology operation to an image based on that kernel. The following sample
shows a photograph after the app has applied dilation with a triangular
kernel:

Kernels are 1D or 2D matrices of values that the morphology operation
subtracts from a corresponding pixel value in the image. The final value of
each transformed pixel is either the lightest result (for dilation) or darkest
result (for erosion) of each subtraction.

The following formula shows how a dilation operation calculates the value for
the pixel at the center of the grid. The operation subtracts each of the nine
kernel values from the image’s corresponding pixel and returns the maximum
value.

### [Generate the structuring element](/documentation/Accelerate/adding-a-
bokeh-effect-to-images#Generate-the-structuring-element)

The
`MorphologyTransformer.makeBokehStructuringElement(ofRadius:atAngle:withSides:)`
method returns a
[`vImage.StructuringElement`](/documentation/accelerate/vimage/structuringelement)
structure. Within that structure, the `diaphragmBladeCount` variable defines
the number of sides. For example, to create a hexagon-shaped bokeh effect, the
sample app calls the
`MorphologyTransformer.makeBokehStructuringElement(ofRadius:atAngle:withSides:)`
method with the number of sides set to `6`.

    
    
    /// The number of edges on the bokeh polygon.
    @Published var diaphragmBladeCount = 6.0 {
        didSet {
            Task(priority: .userInitiated) {
                await applyBokeh()
            }
        }
    }
    
    
    
    let bokeh = Self.makeBokehStructuringElement(ofRadius: Int(bokehRadius),
                                                 atAngle: angle,
                                                 withSides: Int(diaphragmBladeCount))
    

On return, `bokeh` contains the following values:

### [Apply the dilation](/documentation/Accelerate/adding-a-bokeh-effect-to-
images#Apply-the-dilation)

To optimize the dilation operations, the sample app calls the planar
morphology function,
[`applyMorphology(operation:destination:)`](/documentation/accelerate/vimage/pixelbuffer/applymorphology\(operation:destination:\)-1aqer),
concurrently on the three planar pixel buffers that represent the individual
red, green, and blue channels.

To learn more about improving your app’s performance by converting image
buffer formats from interleaved to planar, see [Optimizing image-processing
performance](/documentation/accelerate/optimizing-image-processing-
performance).

The following code calls the three functions inside a
[`withtaskgroup(of:returning:isolation:body:)`](/documentation/Swift/withTaskGroup\(of:returning:isolation:body:\))
closure:

    
    
    /// Apply dilation to the red channel.
    group.addTask(priority: .userInitiated) { [self] in
        sourceRedBuffer.applyMorphology(operation: .dilate(structuringElement: bokeh),
                                        destination: destinationRedBuffer)
    }
    
    
    /// Apply dilation to the green channel.
    group.addTask(priority: .userInitiated) { [self] in
        sourceGreenBuffer.applyMorphology(operation: .dilate(structuringElement: bokeh),
                                          destination: destinationGreenBuffer)
    }
    
    
    /// Apply dilation to the blue channel.
    group.addTask(priority: .userInitiated) { [self] in
        sourceBlueBuffer.applyMorphology(operation: .dilate(structuringElement: bokeh),
                                         destination: destinationBlueBuffer)
    }
    

On return, the destination buffer contains the dilation result:

## [See Also](/documentation/Accelerate/adding-a-bokeh-effect-to-images#see-
also)

### [Convolution and Morphology](/documentation/Accelerate/adding-a-bokeh-
effect-to-images#Convolution-and-Morphology)

[Blurring an image](/documentation/accelerate/blurring-an-image)

Filter an image by convolving it with custom and high-speed kernels.

[API ReferenceConvolution](/documentation/accelerate/convolution)

Apply a convolution kernel to an image.

[API ReferenceMorphology](/documentation/accelerate/morphology)

Dilate and erode images.

