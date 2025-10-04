Framework

# Accelerate

Make large-scale mathematical computations and image calculations, optimized
for high performance and low energy consumption.

iOS 4.0+iPadOS 4.0+Mac Catalyst 13.1+macOS 10.3+tvOS 9.0+visionOS 1.0+watchOS
2.0+

## [Overview](/documentation/Accelerate#overview)

Accelerate provides high-performance, energy-efficient computation on the CPU
by leveraging its vector-processing capability. The following Accelerate
libraries abstract that capability so that code written for them executes
appropriate instructions for the processor available at runtime:

[BNNS](/documentation/accelerate/bnns-library)

    

Subroutines for constructing and running neural networks for both training and
inference.

[vImage](/documentation/accelerate/vimage-library)

    

A wide range of image-processing functions, including Core Graphics and Core
Video interoperation, format conversion, and image manipulation.

[vDSP](/documentation/accelerate/vdsp-library)

    

Digital signal processing functions, including 1D and 2D fast Fourier
transforms, biquadratic filtering, vector and matrix arithmetic, convolution,
and type conversion.

[vForce](/documentation/accelerate/vforce-library)

    

Functions for performing arithmetic and transcendental functions on vectors.

[Sparse Solvers](/documentation/accelerate/sparse-solvers-library),
[BLAS](/documentation/accelerate/blas-library), and LAPACK

    

Libraries for performing linear algebra on sparse and dense matrices.

Although not part of the Accelerate framework, the following libraries are
closely related:

[Apple Archive](/documentation/AppleArchive)

    

A framework for performing multithreaded lossless compression of directories,
files, and data.

[Compression](/documentation/Compression)

    

Algorithms for lossless data compression that support LZFSE, LZ4, LZMA, and
ZLIB algorithms.

[simd](/documentation/accelerate/simd-library)

    

A module for performing computations on small vectors and matrices.

[Spatial](/documentation/Spatial)

    

Spatial is a lightweight 3D mathematical library that provides a simple API
for working with 3D primitives.

## [Topics](/documentation/Accelerate#topics)

### [Neural Networks](/documentation/Accelerate#Neural-Networks)

[Training a neural network to recognize
digits](/documentation/accelerate/training-a-neural-network-to-recognize-
digits)

Build a simple neural network and train it to recognize randomly generated
numbers.

[API ReferenceBNNS](/documentation/accelerate/bnns-library)

Implement and run neural networks for training and inference.

### [Directories, Files, and Data
Archives](/documentation/Accelerate#Directories-Files-and-Data-Archives)

[Compressing single files](/documentation/accelerate/compressing-single-files)

Compress a single file and store the result on the file system.

[Decompressing single files](/documentation/accelerate/decompressing-single-
files)

Recreate a single file from a compressed file.

[Compressing file system directories](/documentation/accelerate/compressing-
file-system-directories)

Compress the contents of an entire directory and store the result on the file
system.

[Decompressing and extracting an archived
directory](/documentation/accelerate/decompressing-and-extracting-an-archived-
directory)

Recreate an entire file system directory from an archive file.

[Compressing and saving a string to the file
system](/documentation/accelerate/compressing-and-saving-a-string-to-the-file-
system)

Compress the contents of a Unicode string and store the result on the file
system.

[Decompressing and Parsing an Archived
String](/documentation/accelerate/decompressing-and-parsing-an-archived-
string)

Recreate a string from an archive file.

### [Compression](/documentation/Accelerate#Compression)

[Compressing and decompressing files with stream
compression](/documentation/accelerate/compressing-and-decompressing-files-
with-stream-compression)

Perform compression for all files and decompression for files with supported
extension types.

[Compressing and decompressing data with buffer
compression](/documentation/accelerate/compressing-and-decompressing-data-
with-buffer-compression)

Compress a string, write it to the file system, and decompress the same file
using buffer compression.

[Compressing and decompressing data with input and output
filters](/documentation/accelerate/compressing-and-decompressing-data-with-
input-and-output-filters)

Compress and decompress streamed or from-memory data, using input and output
filters.

### [Image Processing Essentials](/documentation/Accelerate#Image-Processing-
Essentials)

[Converting bitmap data between Core Graphics images and vImage
buffers](/documentation/accelerate/converting-bitmap-data-between-core-
graphics-images-and-vimage-buffers)

Pass image data between Core Graphics and vImage to create and manipulate
images.

[Creating and Populating Buffers from Core Graphics
Images](/documentation/accelerate/creating-and-populating-buffers-from-core-
graphics-images)

Initialize vImage buffers from Core Graphics images.

[Creating a Core Graphics Image from a vImage
Buffer](/documentation/accelerate/creating-a-core-graphics-image-from-a-
vimage-buffer)

Create displayable representations of vImage buffers.

[Building a Basic Image-Processing
Workflow](/documentation/accelerate/building-a-basic-image-processing-
workflow)

Resize an image with vImage.

[Applying geometric transforms to images](/documentation/accelerate/applying-
geometric-transforms-to-images)

Reflect, shear, rotate, and scale image buffers using vImage.

[Compositing images with alpha
blending](/documentation/accelerate/compositing-images-with-alpha-blending)

Combine two images by using alpha blending to create a single output.

[Compositing images with vImage blend
modes](/documentation/accelerate/compositing-images-with-vimage-blend-modes)

Combine two images by using blend modes to create a single output.

[Applying vImage operations to regions of
interest](/documentation/accelerate/applying-vimage-operations-to-regions-of-
interest)

Limit the effect of vImage operations to rectangular regions of interest.

[Optimizing image-processing
performance](/documentation/accelerate/optimizing-image-processing-
performance)

Improve your app’s performance by converting image buffer formats from
interleaved to planar.

[API ReferencevImage](/documentation/accelerate/vimage-library)

Manipulate large images using the CPU’s vector processor.

### [Signal Processing Essentials](/documentation/Accelerate#Signal-
Processing-Essentials)

[Controlling vDSP operations with
stride](/documentation/accelerate/controlling-vdsp-operations-with-stride)

Operate selectively on the elements of a vector at regular intervals.

[Using linear interpolation to construct new data
points](/documentation/accelerate/using-linear-interpolation-to-construct-new-
data-points)

Fill the gaps in arrays of numerical data using linear interpolation.

[Using vDSP for vector-based arithmetic](/documentation/accelerate/using-vdsp-
for-vector-based-arithmetic)

Increase the performance of common mathematical tasks with vDSP vector-vector
and vector-scalar operations.

[Resampling a signal with decimation](/documentation/accelerate/resampling-a-
signal-with-decimation)

Reduce the sample rate of a signal by specifying a decimation factor and
applying a custom antialiasing filter.

[API ReferencevDSP](/documentation/accelerate/vdsp-library)

Perform basic arithmetic operations and common digital signal processing (DSP)
routines on large vectors.

### [Fourier and Cosine Transforms](/documentation/Accelerate#Fourier-and-
Cosine-Transforms)

[Understanding data packing for Fourier
transforms](/documentation/accelerate/understanding-data-packing-for-fourier-
transforms)

Format source data for the vDSP Fourier functions, and interpret the results.

[Finding the component frequencies in a composite sine
wave](/documentation/accelerate/finding-the-component-frequencies-in-a-
composite-sine-wave)

Use 1D fast Fourier transform to compute the frequency components of a signal.

[Performing Fourier transforms on interleaved-complex
data](/documentation/accelerate/performing-fourier-transforms-on-interleaved-
complex-data)

Optimize discrete Fourier transform (DFT) performance with the vDSP
interleaved DFT routines.

[Reducing spectral leakage with windowing](/documentation/accelerate/reducing-
spectral-leakage-with-windowing)

Multiply signal data by window sequence values when performing transforms with
noninteger period signals.

[Signal extraction from noise](/documentation/accelerate/signal-extraction-
from-noise)

Use Accelerate’s discrete cosine transform to remove noise from a signal.

[Performing Fourier Transforms on Multiple
Signals](/documentation/accelerate/performing-fourier-transforms-on-multiple-
signals)

Use Accelerate’s multiple-signal fast Fourier transform (FFT) functions to
transform multiple signals with a single function call.

[Halftone descreening with 2D fast Fourier
transform](/documentation/accelerate/halftone-descreening-with-2d-fast-
fourier-transform)

Reduce or remove periodic artifacts from images.

[API ReferenceFast Fourier transforms](/documentation/accelerate/fast-fourier-
transforms)

Transform vectors and matrices of temporal and spatial domain complex values
to the frequency domain, and vice versa.

[API ReferenceDiscrete Fourier transforms](/documentation/accelerate/discrete-
fourier-transforms)

Transform vectors of temporal and spatial domain complex values to the
frequency domain, and vice versa.

[API ReferenceDiscrete Cosine transforms](/documentation/accelerate/discrete-
cosine-transforms)

Transform vectors of temporal and spatial domain real values to the frequency
domain, and vice versa.

### [Core Video Interoperation](/documentation/Accelerate#Core-Video-
Interoperation)

[Using vImage pixel buffers to generate video
effects](/documentation/accelerate/using-vimage-pixel-buffers-to-generate-
video-effects)

Render real-time video effects with the vImage Pixel Buffer.

[Integrating vImage pixel buffers into a Core Image
workflow](/documentation/accelerate/integrating-vimage-pixel-buffers-into-a-
core-image-workflow)

Share image data between Core Video pixel buffers and vImage buffers to
integrate vImage operations into a Core Image workflow.

[Applying vImage operations to video sample
buffers](/documentation/accelerate/applying-vimage-operations-to-video-sample-
buffers)

Use the vImage convert-any-to-any functionality to perform real-time image
processing of video frames streamed from your device’s camera.

[Improving the quality of quantized images with
dithering](/documentation/accelerate/improving-the-quality-of-quantized-
images-with-dithering)

Apply dithering to simulate colors that are unavailable in reduced bit depths.

[API ReferenceCore Video interoperability](/documentation/accelerate/core-
video-interoperability)

Pass image data between Core Video and vImage.

### [Vectors, Matrices, and Quaternions](/documentation/Accelerate#Vectors-
Matrices-and-Quaternions)

[Working with Vectors](/documentation/accelerate/working-with-vectors)

Use vectors to calculate geometric values, calculate dot products and cross
products, and interpolate between values.

[Working with Matrices](/documentation/accelerate/working-with-matrices)

Solve simultaneous equations and transform points in space.

[Working with Quaternions](/documentation/accelerate/working-with-quaternions)

Rotate points around the surface of a sphere, and interpolate between them.

[Rotating a cube by transforming its
vertices](/documentation/accelerate/rotating-a-cube-by-transforming-its-
vertices)

Rotate a cube through a series of keyframes using quaternion interpolation to
transition between them.

[API Referencesimd](/documentation/accelerate/simd-library)

Perform computations on small vectors and matrices.

[API ReferencevForce](/documentation/accelerate/vforce-library)

Perform transcendental and trigonometric functions on vectors of any length.

### [Audio Processing](/documentation/Accelerate#Audio-Processing)

[Visualizing sound as an audio
spectrogram](/documentation/accelerate/visualizing-sound-as-an-audio-
spectrogram)

Share image data between vDSP and vImage to visualize audio that a device
microphone captures.

[Applying biquadratic filters to a music
loop](/documentation/accelerate/applying-biquadratic-filters-to-a-music-loop)

Change the frequency response of an audio signal using a cascaded biquadratic
filter.

[Equalizing audio with discrete cosine transforms
(DCTs)](/documentation/accelerate/equalizing-audio-with-discrete-cosine-
transforms-dcts)

Change the frequency response of an audio signal by manipulating frequency-
domain data.

[API ReferenceBiquadratic IIR filters](/documentation/accelerate/biquadratic-
iir-filters)

Apply biquadratic filters to single-channel and multichannel data.

[API ReferenceDiscrete Cosine transforms](/documentation/accelerate/discrete-
cosine-transforms)

Transform vectors of temporal and spatial domain real values to the frequency
domain, and vice versa.

### [Conversion Between Image Formats](/documentation/Accelerate#Conversion-
Between-Image-Formats)

[Building a basic image conversion
workflow](/documentation/accelerate/building-a-basic-image-conversion-
workflow)

Learn the fundamentals of the convert-any-to-any function by converting a CMYK
image to an RGB image.

[Converting color images to grayscale](/documentation/accelerate/converting-
color-images-to-grayscale)

Convert an RGB image to grayscale using matrix multiplication.

[Applying color transforms to images with a multidimensional lookup
table](/documentation/accelerate/applying-color-transforms-to-images-with-a-
multidimensional-lookup-table)

Precompute translation values to optimize color space conversion and other
pointwise operations.

[Building a basic image conversion
workflow](/documentation/accelerate/building-a-basic-image-conversion-
workflow)

Learn the fundamentals of the convert-any-to-any function by converting a CMYK
image to an RGB image.

[Converting luminance and chrominance planes to an ARGB
image](/documentation/accelerate/converting-luminance-and-chrominance-planes-
to-an-argb-image)

Create a displayable ARGB image using the luminance and chrominance
information from your device’s camera.

[API ReferenceConversion](/documentation/accelerate/conversion)

Convert an image to a different format.

### [Image Resampling](/documentation/Accelerate#Image-Resampling)

[Resampling in vImage](/documentation/accelerate/resampling-in-vimage)

Learn how vImage resamples image data during geometric operations.

[Reducing artifacts with custom resampling
filters](/documentation/accelerate/reducing-artifacts-with-custom-resampling-
filters)

Implement custom linear interpolation to prevent the ringing effects
associated with scaling an image with the default Lanczos algorithm.

[API ReferenceImage shearing](/documentation/accelerate/image-shearing)

Shear images horizontally and vertically.

### [Convolution and Morphology](/documentation/Accelerate#Convolution-and-
Morphology)

[Blurring an image](/documentation/accelerate/blurring-an-image)

Filter an image by convolving it with custom and high-speed kernels.

[Adding a bokeh effect to images](/documentation/accelerate/adding-a-bokeh-
effect-to-images)

Simulate a bokeh effect by applying dilation.

[API ReferenceConvolution](/documentation/accelerate/convolution)

Apply a convolution kernel to an image.

[API ReferenceMorphology](/documentation/accelerate/morphology)

Dilate and erode images.

### [Color and Tone Adjustment](/documentation/Accelerate#Color-and-Tone-
Adjustment)

[Adjusting the brightness and contrast of an
image](/documentation/accelerate/adjusting-the-brightness-and-contrast-of-an-
image)

Use a gamma function to apply a linear or exponential curve.

[Adjusting saturation and applying tone
mapping](/documentation/accelerate/adjusting-saturation-and-applying-tone-
mapping)

Convert an RGB image to discrete luminance and chrominance channels, and apply
color and contrast treatments.

[Applying tone curve adjustments to
images](/documentation/accelerate/applying-tone-curve-adjustments-to-images)

Use the vImage library’s polynomial transform to apply tone curve adjustments
to images.

[Adjusting the hue of an image](/documentation/accelerate/adjusting-the-hue-
of-an-image)

Convert an image to L*a*b* color space and apply hue adjustment.

[Specifying histograms with vImage](/documentation/accelerate/specifying-
histograms-with-vimage)

Calculate the histogram of one image, and apply it to a second image.

[Enhancing image contrast with histogram
manipulation](/documentation/accelerate/enhancing-image-contrast-with-
histogram-manipulation)

Enhance and adjust the contrast of an image with histogram equalization and
contrast stretching.

[API ReferenceHistogram](/documentation/accelerate/histogram)

Calculate or manipulate an image’s histogram.

### [vImage / vDSP Interoperability](/documentation/Accelerate#vImage--vDSP-
Interoperability)

[Finding the sharpest image in a sequence of captured
images](/documentation/accelerate/finding-the-sharpest-image-in-a-sequence-of-
captured-images)

Share image data between vDSP and vImage to compute the sharpest image from a
bracketed photo sequence.

[Visualizing sound as an audio
spectrogram](/documentation/accelerate/visualizing-sound-as-an-audio-
spectrogram)

Share image data between vDSP and vImage to visualize audio that a device
microphone captures.

### [Sparse Matrices](/documentation/Accelerate#Sparse-Matrices)

[Creating sparse matrices](/documentation/accelerate/creating-sparse-matrices)

Create sparse matrices for factorization and solving systems.

[Solving systems using direct methods](/documentation/accelerate/solving-
systems-using-direct-methods)

Use direct methods to solve systems of equations where the coefficient matrix
is sparse.

[Solving systems using iterative methods](/documentation/accelerate/solving-
systems-using-iterative-methods)

Use iterative methods to solve systems of equations where the coefficient
matrix is sparse.

[Creating a sparse matrix from coordinate format
arrays](/documentation/accelerate/creating-a-sparse-matrix-from-coordinate-
format-arrays)

Use separate coordinate format arrays to create sparse matrices.

[API ReferenceSparse Solvers](/documentation/accelerate/sparse-solvers-
library)

Solve systems of equations where the coefficient matrix is sparse.

### [Arithmetic and Transcendental
Functions](/documentation/Accelerate#Arithmetic-and-Transcendental-Functions)

[API ReferencevecLib](/documentation/accelerate/veclib)

Perform computations on large vectors.

### [Linear Algebra](/documentation/Accelerate#Linear-Algebra)

[Solving systems of linear equations with
LAPACK](/documentation/accelerate/solving-systems-of-linear-equations-with-
lapack)

Select the optimal LAPACK routine to solve a system of linear equations.

[Finding an interpolating polynomial using the Vandermonde
method](/documentation/accelerate/finding-an-interpolating-polynomial-using-
the-vandermonde-method)

Use LAPACK to solve a linear system and find an interpolating polynomial to
construct new points between a series of known data points.

[Compressing an image using linear
algebra](/documentation/accelerate/compressing-an-image-using-linear-algebra)

Reduce the storage size of an image using singular value decomposition (SVD).

[API ReferenceBLAS](/documentation/accelerate/blas-library)

Perform common linear algebra operations with Apple’s implementation of the
Basic Linear Algebra Subprograms (BLAS).

### [Definite Integration](/documentation/Accelerate#Definite-Integration)

[API ReferenceQuadrature](/documentation/accelerate/quadrature)

Approximate the definite integral of a function over a finite or infinite
interval.

### [Macros](/documentation/Accelerate#Macros)

[API ReferenceMacros](/documentation/accelerate/macros)

