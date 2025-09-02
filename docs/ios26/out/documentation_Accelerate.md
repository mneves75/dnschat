# Accelerate | Apple Developer Documentation

> Source: https://developer.apple.com/documentation/Accelerate
> Fetched: 2025-08-31T18:31:06.092Z

Framework

## Accelerate

Make large-scale mathematical computations and image calculations, optimized for high performance and low energy consumption.

iOS 4.0+iPadOS 4.0+Mac Catalyst 13.1+macOS 10.3+tvOS 9.0+visionOS 1.0+watchOS 2.0+

## [Overview](https://developer.apple.com/documentation/Accelerate#overview)

Accelerate provides high-performance, energy-efficient computation on the CPU by leveraging its vector-processing capability. The following Accelerate libraries abstract that capability so that code written for them executes appropriate instructions for the processor available at runtime:

[BNNS](https://developer.apple.com/documentation/accelerate/bnns-library)

Subroutines for constructing and running neural networks for both training and inference.

[vImage](https://developer.apple.com/documentation/accelerate/vimage-library)

A wide range of image-processing functions, including Core Graphics and Core Video interoperation, format conversion, and image manipulation.

[vDSP](https://developer.apple.com/documentation/accelerate/vdsp-library)

Digital signal processing functions, including 1D and 2D fast Fourier transforms, biquadratic filtering, vector and matrix arithmetic, convolution, and type conversion.

[vForce](https://developer.apple.com/documentation/accelerate/vforce-library)

Functions for performing arithmetic and transcendental functions on vectors.

[Sparse Solvers](https://developer.apple.com/documentation/accelerate/sparse-solvers-library), [BLAS](https://developer.apple.com/documentation/accelerate/blas-library), and LAPACK

Libraries for performing linear algebra on sparse and dense matrices.

Although not part of the Accelerate framework, the following libraries are closely related:

[Apple Archive](https://developer.apple.com/documentation/AppleArchive)

A framework for performing multithreaded lossless compression of directories, files, and data.

[Compression](https://developer.apple.com/documentation/Compression)

Algorithms for lossless data compression that support LZFSE, LZ4, LZMA, and ZLIB algorithms.

[simd](https://developer.apple.com/documentation/accelerate/simd-library)

A module for performing computations on small vectors and matrices.

[Spatial](https://developer.apple.com/documentation/Spatial)

Spatial is a lightweight 3D mathematical library that provides a simple API for working with 3D primitives.
