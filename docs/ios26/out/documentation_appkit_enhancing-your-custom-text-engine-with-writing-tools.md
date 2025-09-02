# Enhancing your custom text engine with Writing Tools | Apple Developer Documentation

> Source: https://developer.apple.com/documentation/appkit/enhancing-your-custom-text-engine-with-writing-tools
> Fetched: 2025-08-31T18:32:18.004Z

## [Overview](https://developer.apple.com/documentation/appkit/enhancing-your-custom-text-engine-with-writing-tools#Overview)

The systems provide easy-to-use and highly capable APIs for text editing, such as [`NSTextView`](https://developer.apple.com/documentation/AppKit/NSTextView), [`UITextView`](https://developer.apple.com/documentation/UIKit/UITextView), and SwiftUI [`TextEditor`](https://developer.apple.com/documentation/SwiftUI/TextEditor). These APIs handle text rendering, text input, and user interactions, support multiple languages, and provide many features like spell checking and Writing Tools. Apps generally use these APIs to implement text editing.

In some cases, apps may desire to build a custom text editing experience by implementing a custom text engine and integrating the editor with system-provided features, such as Writing Tools. The sample app demonstrates how to implement a basic [`NSTextInputClient`](https://developer.apple.com/documentation/AppKit/NSTextInputClient) view with Writing Tools support.

### [Configure the sample code project](https://developer.apple.com/documentation/appkit/enhancing-your-custom-text-engine-with-writing-tools#Configure-the-sample-code-project)

To configure the sample code project, do the following in Xcode:

1.  Open the sample with the latest version of Xcode.
2.  Set the developer team to let Xcode automatically manage the provisioning profile. For more information, see [Set the bundle ID](https://developer.apple.com/documentation/Xcode/preparing-your-app-for-distribution) and [Assign the project to a team](https://developer.apple.com/documentation/Xcode/preparing-your-app-for-distribution).
