  * [ Accelerate ](/documentation/accelerate)
  * [ BNNS ](/documentation/accelerate/bnns-library)
  * Supporting real-time ML inference on the CPU 

Sample Code

# Supporting real-time ML inference on the CPU

Add real-time digital signal processing to apps like Logic Pro X and
GarageBand with the BNNS Graph API.

[ Download ](https://docs-
assets.developer.apple.com/published/a39fb3b0a5f6/SupportingRealTimeMLInferenceOnTheCPU.zip)

macOS 26.0+Xcode 26.0+

## [Overview](/documentation/Accelerate/supporting-real-time-ml-inference-on-
the-cpu#Overview)

Note

This sample code project is associated with WWDC25 session 276: [What’s new in
BNNSGraph](https://developer.apple.com/videos/play/wwdc2025/276).

## [See Also](/documentation/Accelerate/supporting-real-time-ml-inference-on-
the-cpu#see-also)

### [Building graphs in Swift](/documentation/Accelerate/supporting-real-time-
ml-inference-on-the-cpu#Building-graphs-in-Swift)

[`static func makeContext(options: BNNSGraph.CompileOptions, (inout
BNNSGraph.Builder) -> [any BNNSGraph.TensorDescriptor]) throws ->
BNNSGraph.Context`](/documentation/accelerate/bnnsgraph/makecontext\(options:_:\))

Returns a new context that wraps a graph object that the given closure
defines.

[`struct Builder`](/documentation/accelerate/bnnsgraph/builder)

A structure thats provides a closure you can use to define the arguments and
operations of a BNNS Graph.

[`struct Tensor`](/documentation/accelerate/bnnsgraph/builder/tensor)

A structure that represents an abstract handle to a tensor that you use within
a `BNNSGraph.makeContext` closure.

