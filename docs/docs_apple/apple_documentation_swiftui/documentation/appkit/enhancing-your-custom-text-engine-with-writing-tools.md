  * [ AppKit ](/documentation/appkit)
  * [ Writing Tools ](/documentation/appkit/writing-tools)
  * Enhancing your custom text engine with Writing Tools 

Sample Code

# Enhancing your custom text engine with Writing Tools

Add Writing Tools support to your custom text engine to enhance the text
editing experience.

[ Download ](https://docs-
assets.developer.apple.com/published/8f654c44de7e/EnhancingYourCustomTextEngineWithWritingTools.zip)

macOS 15.4+Xcode 16.4+

## [Overview](/documentation/AppKit/enhancing-your-custom-text-engine-with-
writing-tools#Overview)

The systems provide easy-to-use and highly capable APIs for text editing, such
as [`NSTextView`](/documentation/AppKit/NSTextView),
[`UITextView`](/documentation/UIKit/UITextView), and SwiftUI
[`TextEditor`](/documentation/SwiftUI/TextEditor). These APIs handle text
rendering, text input, and user interactions, support multiple languages, and
provide many features like spell checking and Writing Tools. Apps generally
use these APIs to implement text editing.

In some cases, apps may desire to build a custom text editing experience by
implementing a custom text engine and integrating the editor with system-
provided features, such as Writing Tools. The sample app demonstrates how to
implement a basic
[`NSTextInputClient`](/documentation/AppKit/NSTextInputClient) view with
Writing Tools support.

Note

This sample code project is associated with WWDC25 session 265: [Dive deeper
into Writing Tools](https://developer.apple.com/wwdc25/265/).

### [Configure the sample code project](/documentation/AppKit/enhancing-your-
custom-text-engine-with-writing-tools#Configure-the-sample-code-project)

To configure the sample code project, do the following in Xcode:

  1. Open the sample with the latest version of Xcode.

  2. Set the developer team to let Xcode automatically manage the provisioning profile. For more information, see [Set the bundle ID](/documentation/Xcode/preparing-your-app-for-distribution) and [Assign the project to a team](/documentation/Xcode/preparing-your-app-for-distribution).

## [See Also](/documentation/AppKit/enhancing-your-custom-text-engine-with-
writing-tools#see-also)

### [Writing Tools for custom views](/documentation/AppKit/enhancing-your-
custom-text-engine-with-writing-tools#Writing-Tools-for-custom-views)

[Supporting Writing Tools via the
pasteboard](/documentation/appkit/supporting-writing-tools-via-the-pasteboard)

Adopt a simplified version of the Writing Tools experience in a custom view
using the pasteboard and macOS services.

[Adding Writing Tools support to a custom AppKit
view](/documentation/appkit/adding-writing-tools-support-to-a-custom-nsview)

Integrate Writing Tools support, including support for inline replacement
animations, to your custom text views on macOS.

[`class
NSWritingToolsCoordinator`](/documentation/appkit/nswritingtoolscoordinator)

An object that manages interactions between Writing Tools and your custom text
view.

[`protocol
Delegate`](/documentation/appkit/nswritingtoolscoordinator/delegate-
swift.protocol)

An interface that you use to manage interactions between Writing Tools and
your custom text view.

[`class Context`](/documentation/appkit/nswritingtoolscoordinator/context)

A data object that you use to share your custom view’s text with Writing
Tools.

[`class
AnimationParameters`](/documentation/appkit/nswritingtoolscoordinator/animationparameters)

An object you use to configure additional tasks or animations to run alongside
the Writing Tools animations.

