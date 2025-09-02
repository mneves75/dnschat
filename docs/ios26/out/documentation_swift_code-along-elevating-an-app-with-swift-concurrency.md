# Code-along: Elevating an app with Swift concurrency | Apple Developer Documentation

> Source: https://developer.apple.com/documentation/swift/code-along-elevating-an-app-with-swift-concurrency
> Fetched: 2025-08-31T18:32:09.772Z

[Skip Navigation](#app-main)

- [Global Nav Open Menu](#ac-gn-menustate)[Global Nav Close Menu](#)
- [Apple Developer](https://developer.apple.com/)

[](https://developer.apple.com/search/)

- [Apple Developer](https://developer.apple.com/)
- [News](https://developer.apple.com/news/)
- [Discover](https://developer.apple.com/discover/)
- [Design](https://developer.apple.com/design/)
- [Develop](https://developer.apple.com/develop/)
- [Distribute](https://developer.apple.com/distribute/)
- [Support](https://developer.apple.com/support/)
- [Account](https://developer.apple.com/account/)
- [](https://developer.apple.com/search/)

[Documentation](https://developer.apple.com/documentation)

[Open Menu](#)

[](https://developer.apple.com/documentation/swift)

[

Initialization with Literals

](https://developer.apple.com/documentation/swift/initialization-with-literals)

###

Programming Tasks

[

Input and Output

](https://developer.apple.com/documentation/swift/input-and-output)

[

Debugging and Reflection

](https://developer.apple.com/documentation/swift/debugging-and-reflection)

[

Macros

](https://developer.apple.com/documentation/swift/macros)

[

Concurrency

](https://developer.apple.com/documentation/swift/concurrency)

###

Essentials

[

Code-along: Elevating an app with Swift concurrency

](https://developer.apple.com/documentation/swift/code-along-elevating-an-app-with-swift-concurrency)

Beta

[

Updating an app to use strict concurrency

](https://developer.apple.com/documentation/swift/updating-an-app-to-use-strict-concurrency)

[

Updating an App to Use Swift Concurrency

](https://developer.apple.com/documentation/swift/updating_an_app_to_use_swift_concurrency)

###

Tasks

[

Task

](https://developer.apple.com/documentation/swift/task)

[

TaskGroup

](https://developer.apple.com/documentation/swift/taskgroup)

[

func withTaskGroup<ChildTaskResult, GroupResult>(of: ChildTaskResult.Type, returning: GroupResult.Type, isolation: isolated (any Actor)?, body: (inout TaskGroup<ChildTaskResult>) async -> GroupResult) async -> GroupResult

](https://developer.apple.com/documentation/swift/withtaskgroup\(of:returning:isolation:body:\))

[

ThrowingTaskGroup

](https://developer.apple.com/documentation/swift/throwingtaskgroup)

[

func withThrowingTaskGroup<ChildTaskResult, GroupResult>(of: ChildTaskResult.Type, returning: GroupResult.Type, isolation: isolated (any Actor)?, body: (inout ThrowingTaskGroup<ChildTaskResult, any Error>) async throws -> GroupResult) async rethrows -> GroupResult

](https://developer.apple.com/documentation/swift/withthrowingtaskgroup\(of:returning:isolation:body:\))

[

TaskPriority

](https://developer.apple.com/documentation/swift/taskpriority)

[

DiscardingTaskGroup

](https://developer.apple.com/documentation/swift/discardingtaskgroup)

[

func withDiscardingTaskGroup<GroupResult>(returning: GroupResult.Type, isolation: isolated (any Actor)?, body: (inout DiscardingTaskGroup) async -> GroupResult) async -> GroupResult

](https://developer.apple.com/documentation/swift/withdiscardingtaskgroup\(returning:isolation:body:\))

[

ThrowingDiscardingTaskGroup

](https://developer.apple.com/documentation/swift/throwingdiscardingtaskgroup)

[

func withThrowingDiscardingTaskGroup<GroupResult>(returning: GroupResult.Type, isolation: isolated (any Actor)?, body: (inout ThrowingDiscardingTaskGroup<any Error>) async throws -> GroupResult) async throws -> GroupResult

](https://developer.apple.com/documentation/swift/withthrowingdiscardingtaskgroup\(returning:isolation:body:\))

[

UnsafeCurrentTask

](https://developer.apple.com/documentation/swift/unsafecurrenttask)

###

Asynchronous Sequences

[

AsyncSequence

](https://developer.apple.com/documentation/swift/asyncsequence)

[

AsyncStream

](https://developer.apple.com/documentation/swift/asyncstream)

[

AsyncThrowingStream

](https://developer.apple.com/documentation/swift/asyncthrowingstream)

###

Continuations

[

CheckedContinuation

](https://developer.apple.com/documentation/swift/checkedcontinuation)

121 items were found. Tab back to navigate through them.

Navigator is ready

- [Swift](https://developer.apple.com/documentation/swift)
- [Swift Standard Library](https://developer.apple.com/documentation/swift/swift-standard-library)
- [Concurrency](https://developer.apple.com/documentation/swift/concurrency)
- - [Swift Standard Library](https://developer.apple.com/documentation/swift/swift-standard-library)
  - [Concurrency](https://developer.apple.com/documentation/swift/concurrency)
- Code-along: Elevating an app with Swift concurrency Beta

Sample Code

## Code-along: Elevating an app with Swift concurrency

Code along with the WWDC presenter to elevate a SwiftUI app with Swift concurrency.

[Download](https://docs-assets.developer.apple.com/published/a6e7ae7448f9/CodeAlongElevatingAnAppWithSwiftConcurrency.zip)

iOS 26.0+BetaiPadOS 26.0+BetaXcode 26.0+Beta

## [Overview](https://developer.apple.com/documentation/swift/code-along-elevating-an-app-with-swift-concurrency#Overview)

### [Configure the sample code project](https://developer.apple.com/documentation/swift/code-along-elevating-an-app-with-swift-concurrency#Configure-the-sample-code-project)

To run this sample app, you need a physical iOS or iPadOS device.

## [See Also](https://developer.apple.com/documentation/swift/code-along-elevating-an-app-with-swift-concurrency#see-also)

### [Essentials](https://developer.apple.com/documentation/swift/code-along-elevating-an-app-with-swift-concurrency#Essentials)

[Updating an app to use strict concurrency](https://developer.apple.com/documentation/swift/updating-an-app-to-use-strict-concurrency)

Use this code to follow along with a guide to migrating your code to take advantage of the full concurrency protection that the Swift 6 language mode provides.

[Updating an App to Use Swift Concurrency](https://developer.apple.com/documentation/swift/updating_an_app_to_use_swift_concurrency)

Improve your app’s performance by refactoring your code to take advantage of asynchronous functions in Swift.

Beta Software

This documentation contains preliminary information about an API or technology in development. This information is subject to change, and software implemented according to this documentation should be tested with final operating system software.

[Learn more about using Apple's beta software](https://developer.apple.com/support/beta-software/)

Current page is Code-along: Elevating an app with Swift concurrency
