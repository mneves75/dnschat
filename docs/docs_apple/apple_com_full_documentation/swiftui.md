# SwiftUI

SwiftUI helps you build great-looking apps across all Apple platforms with the
power of Swift — and surprisingly little code. You can bring even better
experiences to everyone, on any Apple device, using just one set of tools and
APIs.

![A MacBook Pro, iPad, and iPhone, each displaying the SwiftUI
interface.](/swiftui/images/hero-swiftui-s-dark_2x.jpg) ![A MacBook Pro, iPad,
and iPhone, each displaying the SwiftUI interface.](/swiftui/images/hero-
swiftui-s-light_2x.jpg)

## Get to know SwiftUI

Declarative syntax

### Write the results, not the instructions

SwiftUI uses a declarative syntax, so you can simply state what your user
interface should do. For example, you can write that you want a list of items
consisting of text fields, then describe alignment, font, and color for each
field. Your code is simpler and easier to read than ever before, saving you
time and maintenance.

    
    
    import SwiftUI
    
    struct AlbumDetail: View {
    	var album: Album
    
    	var body: some View {
    		List(album.songs) { song in 
    			HStack {
    				Image(album.cover)
    				VStack(alignment: .leading) {
    					Text(song.title)
    					Text(song.artist.name)
    						.foregroundStyle(.secondary)
    				}
    			}
    		}
    	}
    }

This declarative style even applies to complex concepts like animation. Easily
add animation to almost any control and choose a collection of ready-to-use
effects with only a few lines of code. At runtime, the system handles all of
the steps needed to create a smooth movement, even dealing with user
interaction and state changes mid-animation. With animation this easy, you’ll
be looking for new ways to make your app come alive.

[ ![](https://devimages-cdn.apple.com/wwdc-
services/images/C03E6E6D-A32A-41D0-9E50-C3C6059820AA/9278/9278_wide_900x506_2x.jpg)
**SwiftUI essentials** ](/videos/play/wwdc2024/10150/)

Easy integration

### Adopt SwiftUI at your own pace

SwiftUI is designed to work alongside UIKit and AppKit, so you can adopt it
incrementally in your existing apps. When it’s time to construct a new part of
your user interface or rebuild an existing one, you can use SwiftUI while
keeping the rest of your codebase the same. Alternatively, if you’re building
a new SwiftUI app and want to use an interface element that isn’t offered, you
can mix and match with UIKit and AppKit to get of the best of all worlds.

Xcode previews

### Iterate quickly and preview while you work

With Xcode previews, you can make changes to your app’s views in code, and see
the results of those changes quickly in the preview canvas. Add previews to
your SwiftUI views using the preview macro. Then configure how you want your
previews to display using Xcode’s preview canvas, or programmatically in code.
When you select the live or interactive preview option, your view appears and
interacts just like it would on a device or simulator. And in select mode, the
preview displays a snapshot of your view so you can interact with your view’s
UI elements in the canvas. Selecting a control in the preview highlights the
corresponding line of code in the source editor. Finally, you can adjust
device settings to control how a preview displays, including in Dark Mode,
landscape orientation, or different sized text.

[Learn more about Xcode](/xcode/)

### [Discover what’s new in SwiftUI Dive into the latest key features and
capabilities of the Swift language.
![](/assets/elements/icons/swiftui/swiftui-256x256_2x.png) ](/swiftui/whats-
new/)

### [New to SwiftUI development? Get started with our SwiftUI Pathway, an
easy-to-navigate collection of resources to get started.
![](/pathways/images/hero-pathways-b-small_2x.png) ](/swiftui/get-started/)

## Developer stories

[ ![](/articles/images/article-tide_2x.jpg) The rise of Tide Guide Find out
how Tucker Macdonald went deep with SwiftUI to build a world-class tide
tracker. Read more ](/news/?id=4r9b23wx)

[ ![](/articles/images/article-tiimo_2x.jpg) “Way more with less code” Learn
why the Tiimo team decided to rewrite their entire app in SwiftUI. Read more
](/articles/tiimo/)

[ ![](/articles/images/article-copilot-money-0_2x.jpg) Swift Charts pay off
for Copilot Money Discover how the team behind this personal finance app
developed an interest in Swift Charts. Read more ](/articles/copilot-money/)

### [Meet with Apple Sharpen your skills through in-person and online
activities around the world. Explore the schedule ](/events/view/upcoming-
events/)

[ ![](/assets/elements/icons/instruments/instruments-96x96_2x.png) Resources
Dive into SwiftUI tools, documentation, sample code, videos, and more. Explore
and download resources ](/swiftui/resources/)

## Explore more

Learn more about the Swift language, additional frameworks, and tools to help
you develop apps.

[ ![](/assets/elements/icons/swift/swift-64x64_2x.png) Swift ](/swift/) [
![](/assets/elements/icons/swiftdata/swiftdata-64x64_2x.png) SwiftData
](/documentation/swiftdata) [ ![](/assets/elements/icons/swift-testing/swift-
testing-64x64_2x.png) Swift Testing ](/documentation/testing) [
![](/assets/elements/icons/swift-charts/swift-charts-64x64_2x.png) Swift
Charts ](/documentation/charts) [ ![](/assets/elements/icons/swift-
playground/swift-playground-64x64_2x.png) Swift Playground
](/documentation/swift-playgrounds)

