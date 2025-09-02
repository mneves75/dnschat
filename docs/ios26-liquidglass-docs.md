<!--
Downloaded via https://llm.codes by @steipete on August 31, 2025 at 03:28 PM
Source URL: https://developer.apple.com/documentation/technologyoverviews/adopting-liquid-glass
Total pages processed: 30
URLs filtered: Yes
Content de-duplicated: Yes
Availability strings filtered: Yes
Code blocks only: No
-->

# https://developer.apple.com/documentation/technologyoverviews/adopting-liquid-glass

- Technology Overviews
- App design and UI
- Liquid Glass
- Adopting Liquid Glass

# Adopting Liquid Glass

Find out how to bring the new material to your app.

## Overview

If you have an existing app, adopting Liquid Glass doesn’t mean reinventing your app from the ground up. Start by building your app in the latest version of Xcode to see the changes. As you review your app, use the following sections to understand the scope of changes and learn how you can adopt these best practices in your interface.

---

#### See your app with Liquid Glass

If your app uses standard components from SwiftUI, UIKit, or AppKit, your interface picks up the latest look and feel on the latest platform releases for iOS, iPadOS, macOS, tvOS, and watchOS. In Xcode, build your app with the latest SDKs, and run it on the latest platform releases to see the changes in your interface.

## Visual refresh

Interfaces across Apple platforms feature a new dynamic material called Liquid Glass, which combines the optical properties of glass with a sense of fluidity. This material forms a distinct functional layer for controls and navigation elements. It affects how the interface looks, feels, and moves, adapting in response to a variety of factors to help bring focus to the underlying content.

**Leverage system frameworks to adopt Liquid Glass automatically.** In system frameworks, standard components like bars, sheets, popovers, and controls automatically adopt this material. System frameworks also dynamically adapt these components in response to factors like element overlap and focus state. Take advantage of this material with minimal code by using standard components from SwiftUI, UIKit, and AppKit.

**Reduce your use of custom backgrounds in controls and navigation elements.** Any custom backgrounds and appearances you use in these elements might overlay or interfere with Liquid Glass or other effects that the system provides, such as the scroll edge effect. Make sure to check any custom backgrounds in elements like split views, tab bars, and toolbars. Prefer to remove custom effects and let the system determine the background appearance, especially for the following elements:

`NavigationStack`

`NavigationSplitView`

`titleBar`

`toolbar(content:)`

`UINavigationBar`

`UITabBar`

`UIToolbar`

`UISplitViewController`

`NSToolbar`

`NSSplitView`

**Test your interface with accessibility settings.** Translucency and fluid morphing animations contribute to the look and feel of Liquid Glass, but can adapt to people’s needs. For example, people might turn on accessibility settings that reduce transparency or motion in the interface, which can remove or modify certain effects. If you use standard components from system frameworks, this experience adapts automatically. Ensure your custom elements and animations provide a good fallback experience when these settings are on as well.

**Avoid overusing Liquid Glass effects.** If you apply Liquid Glass effects to a custom control, do so sparingly. Liquid Glass seeks to bring attention to the underlying content, and overusing this material in multiple custom controls can provide a subpar user experience by distracting from that content. Limit these effects to the most important functional elements in your app. To learn more, read Applying Liquid Glass to custom views.

`glassEffect(_:in:)`

`UIGlassEffect`

`NSGlassEffectView`

## App icons

App icons take on a design that’s dynamic and expressive. Updates to the icon grid result in a standardized iconography that’s visually consistent across devices and concentric with hardware and other elements across the system. App icons now contain layers, which dynamically respond to lighting and other visual effects the system provides. iOS, iPadOS, and macOS all now offer default (light), dark, clear, and tinted appearance variants, empowering people to personalize the look and feel of their Home Screen.

**Reimagine your app icon for Liquid Glass.** Apply key design principles to help your app icon shine:

- Provide a visually consistent, optically balanced design across the platforms your app supports.

- Consider a simplified design comprised of solid, filled, overlapping semi-transparent shapes.

- Let the system handle applying masking, blurring, and other visual effects, rather than factoring them into your design.

**Design using layers.** The system automatically applies effects like reflection, refraction, shadow, blur, and highlights to your icon layers. Determine which elements of your design make sense as foreground, middle, and background elements, then define separate layers for them. You can perform this task in the design app of your choice.

**Compose and preview in Icon Composer.** Drag and drop app icon layers that you export from your design app directly into the Icon Composer app. Icon Composer lets you add a background, create layer groupings, adjust layer attributes like opacity, and preview your design with system effects and appearances. Icon Composer is available in the latest version of Xcode and for download from Apple Design Resources. To learn more, read Creating your app icon using Icon Composer.

**Preview against the updated grids.** The system applies masking to produce your final icon shape — rounded rectangle for iOS, iPadOS, and macOS, and circular for watchOS. Keep elements centered to avoid clipping. Irregularly shaped icons receive a system-provided background. See how your app icon looks with the updated grids to determine whether you need to make adjustments. Download these grids from Apple Design Resources.

## Controls

Controls have a refreshed look across platforms, and come to life when a person interacts with them. For controls like sliders and toggles, the knob transforms into Liquid Glass during interaction, and buttons fluidly morph into menus and popovers. The shape of the hardware informs the curvature of controls, so many controls adopt rounder forms to elegantly nestle into the corners of windows and displays. Controls also feature an option for an extra-large size, allowing more space for labels and accents.

Play

Slider

Segmented control

**Review updates to control appearance and dimensions.** If you use standard controls from system frameworks, your app adopts changes to shapes and sizes automatically when you rebuild your app with the latest version of Xcode. Review changes to the following controls and any others and make sure they continue to look at home with the rest of your interface:

`Button`

`Toggle`

`Slider`

`Stepper`

`Picker`

`TextField`

`UIButton`

`UISwitch`

`UISlider`

`UIStepper`

`UISegmentedControl`

`UITextField`

`NSButton`

`NSSwitch`

`NSSlider`

`NSStepper`

`NSSegmentedControl`

`NSTextField`

**Review your use of color in controls.** Be judicious with your use of color in controls and navigation so they stay legible and keep the focus on your content. If you do apply color to these elements, leverage system colors to automatically adapt to light and dark contexts.

**Check for crowding or overlapping of controls.** Allow Liquid Glass room to move and breathe, and avoid overcrowding or layering elements on top of each other.

## Navigation

Liquid Glass applies to the topmost layer of the interface, where you define your navigation. Key navigation elements like tab bars and sidebars float in this Liquid Glass layer to help people focus on the underlying content.

Before

After

**Establish a clear navigation hierarchy.** It’s more important than ever for your app to have a clear and consistent navigation structure that’s distinct from the content you provide. Ensure that you clearly separate your content from navigation elements, like tab bars and sidebars, to establish a distinct functional layer above the content layer.

**Consider adapting your tab bar into a sidebar automatically.** If your app uses a tab-based navigation, you can allow the tab bar to adapt into a sidebar depending on the context by using the following APIs:

`sidebarAdaptable`

`UITabBarController.Mode.tabSidebar`

**Consider using split views to build sidebar layouts with an inspector panel.** Split views are optimized to create a consistent and familiar experience for sidebar and inspector layouts across platforms. You can use the following standard system APIs for split views to build these types of layouts with minimal code:

`inspector(isPresented:content:)`

`UISplitViewController.Column.inspector`

`NSSplitViewController`

`init(inspectorWithViewController:)`

**Check content safe areas for sidebars and inspectors.** If you have these types of components in your app’s navigation structure, audit the safe area compatibility of content next to the sidebar and inspector to help make sure underlying content is peeking through appropriately.

**Extend content beneath sidebars and inspectors.** A background extension effect creates a sense of extending a background under a sidebar or inspector, without actually scrolling or placing content under it. A background extension effect mirrors the adjacent content to give the impression of stretching it under the sidebar, and applies a blur to maintain legibility of the sidebar or inspector. This effect is perfect for creating a full, edge-to-edge content experience in apps that use split views, such as for hero images on product pages.

`backgroundExtensionEffect()`

`UIBackgroundExtensionView`

`NSBackgroundExtensionView`

**Choose whether to automatically minimize your tab bar in iOS.** Tab bars can help elevate the underlying content by receding when a person scrolls up or down. You can opt into this behavior and configure the tab bar to minimize when a person scrolls down or up. The tab bar expands when a person scrolls in the opposite direction.

TabView {
// ...
}
.tabBarMinimizeBehavior(.onScrollDown)

tabBarMinimizeBehavior = .onScrollDown

## Menus and toolbars

Menus have a refreshed look across platforms. They adopt Liquid Glass, and menu items for common actions use icons to help people quickly scan and identify those actions. New to iPadOS, apps also have a menu bar for faster access to common commands.

**Adopt standard icons in menu items.** For menu items that perform standard actions like Cut, Copy, and Paste, the system uses the menu item’s selector to determine which icon to apply. To adopt icons in those menu items with minimal code, make sure to use standard selectors.

**Match top menu actions to swipe actions.** For consistency and predictability, make sure the actions you surface at the top of your contextual menu match the swipe actions you provide for the same item.

Toolbars take on a Liquid Glass appearance, and provide a grouping mechanism for toolbar items, letting you choose which actions to display together.

**Determine which toolbar items to group together.** Group items that perform similar actions or affect the same part of the interface, and maintain consistent groupings and placement across platforms.

You can create a fixed spacer to separate items that share a background using these APIs:

`fixed`

`ToolbarSpacer`

`fixedSpace(_:)`

`space`

**Find icons to represent common actions.** Consider representing common actions in toolbars with standard icons instead of text. This approach helps declutter the interface and increase the ease of use for common actions. For consistency, don’t mix text and icons across items that share a background.

**Provide an accessibility label for every icon.** Regardless of what you show in the interface, always specify an accessibility label for each icon. This way, people who prefer a text label can opt into this information by turning on accessibility features like VoiceOver or Voice Control.

**Audit toolbar customizations.** Review anything custom you do to display items in your toolbars, like your use of fixed spacers or custom items, as these can appear inconsistent with system behavior.

**Check how you hide toolbar items.** If you see an empty toolbar item without any content, your app might be hiding the view in the toolbar item instead of the item itself. Instead, hide the entire toolbar item, using these APIs:

`hidden(_:)`

`isHidden`

## Windows and modals

Windows adopt rounder corners to fit controls and navigation elements. In iPadOS, apps show window controls and support continuous window resizing. Instead of transitioning between specific preset sizes, windows resize fluidly down to a minimum size.

**Support arbitrary window sizes.** Allow people to resize their window to the width and height that works for them, and adjust your content accordingly.

**Use split views to allow fluid resizing of columns.** To support continuous window resizing, split views automatically reflow content for every size using beautiful, fluid transitions. Make sure to use standard system APIs for split views to get these animations with minimal code:

**Use layout guides and safe areas.** Make sure you specify safe areas for your content so the system can automatically adjust the window controls and title bar in relation to your content.

Modal views like sheets and action sheets adopt Liquid Glass. Sheets feature an increased corner radius, and half sheets are inset from the edge of the display to allow content to peek through from beneath them. When a half sheet expands to full height, it transitions to a more opaque appearance to help maintain focus on the task.

**Check the content around the edges of sheets.** Inside the sheet, check for content and controls that might appear too close to rounder sheet corners. Outside the sheet, check that any content peeking through between the inset sheet and display edge looks as you expect.

**Audit the backgrounds of sheets and popovers.** Check whether you add a visual effect view to your popover’s content view, and remove those custom background views to provide a consistent experience with other sheets across the system.

An action sheet originates from the element that initiates the action, instead of from the bottom edge of the display. When active, an action sheet also lets people interact with other parts of the interface.

**Specify the source of an action sheet.** Position an action sheet’s anchor next to the control it originates from. Make sure to set the source view or item to indicate where to originate the action sheet and create the inline appearance.

`confirmationDialog(_:isPresented:titleVisibility:presenting:actions:)`

`sourceView`

`sourceItem`

`beginSheetModal(for:completionHandler:)`

## Organization and layout

Style updates to list-based layouts help you organize and showcase your content so it can shine through the Liquid Glass layer. To give content room to breathe, organizational components like lists, tables, and forms have a larger row height and padding. Sections have an increased corner radius to match the curvature of controls across the system.

**Check capitalization in section headers.** Lists, tables, and forms optimize for legibility by adopting title-style capitalization for section headers. This means section headers no longer render entirely in capital letters regardless of the capitalization you provide. Make sure to update your section headers to title-style capitalization to match your app’s text to this systemwide convention.

**Adopt forms to take advantage of layout metrics across platform.** Use SwiftUI forms with the grouped form style to automatically update your form layouts.

## Search

Platform conventions for location and behavior of search optimize the experience for each device and use case. To provide an engaging search experience in your app, review these search design conventions.

**Check the keyboard layout when activating your search interface.** In iOS, when a person taps a search field to give it focus, it slides upwards as the keyboard appears. Test this experience in your app to make sure the search field moves consistently with other apps and system experiences.

**Use semantic search tabs.** If your app’s search appears as part of a tab bar, make sure to use the standard system APIs for indicating which tab is the search tab. The system automatically separates the search tab from other tabs and places it at the trailing end to make your search experience consistent with other apps and help people find content faster.

Tab(role: .search) {
// ...
}

UISearchTab { \_ in
// ...
}

## Platform considerations

Liquid Glass can have a distinct appearance and behavior across different platforms, contexts, and input methods. Test your app across devices to understand how the material looks and feels across platforms.

**In watchOS, adopt standard button styles and toolbar APIs.** Liquid Glass changes are minimal in watchOS, so they appear automatically when you open your app on the latest release even if you don’t build against the latest SDK. However, to make sure your app picks up this appearance, adopt standard toolbar APIs and button styles from watchOS 10.

**Combine custom Liquid Glass effects to improve rendering performance.** If you apply these effects to custom elements, make sure to combine them using a `GlassEffectContainer`, which helps optimize performance while fluidly morphing Liquid Glass shapes into each other.

**Performance test your app across platforms.** It’s a good idea to regularly assess and improve your app’s performance, and building your app with the latest SDKs provides an opportunity to check in. Profile your app to gather information about its current performance and find any opportunities for improving the user experience. To learn more, read Improving your app’s performance.

To update and ship your app with the latest SDKs while keeping your app as it looks when built against previous versions of the SDKs, you can add the `UIDesignRequiresCompatibility` key to your information property list.

- Adopting Liquid Glass
- Overview
- Visual refresh
- App icons
- Controls
- Navigation
- Menus and toolbars
- Windows and modals
- Organization and layout
- Search
- Platform considerations

---

# https://developer.apple.com/documentation/technologyoverviews

# Technology Overviews

Learn about the wide range of technologies you use to develop software for Apple platforms.

## Overview

Whether you’re new to Apple platforms or you’ve been working with them for years, finding the technology you need is an important first step. With so many technologies available to you, it’s sometimes difficult to know where to start. The following topics offer a high-level view of the technologies available to you, and guidance about which technologies you might choose to solve particular problems.

## Get started

Start your exploration with the foundational technologies you use to build your app or game, and make your interface shine by adopting Liquid Glass.

![

App design and UI](https://developer.apple.com/documentation/technologyoverviews/app-design-and-ui)

![

Games](https://developer.apple.com/documentation/technologyoverviews/games)

## Discover Apple technologies

Explore the technologies you use to build your app’s unique experience. Whether you’re buiding core features like your app’s data model, accessing device-specific hardware, making your app more intelligent, or adopting features unique to Apple devices, Apple frameworks help you do so easily and efficiently.

![

Data management](https://developer.apple.com/documentation/technologyoverviews/data-management)

![

Core experiences](https://developer.apple.com/documentation/technologyoverviews/core-experiences)

![An illustration of the Apple Intelligence logo hovering above a grid of colorful squares.

Apple Intelligence and machine learning](https://developer.apple.com/documentation/technologyoverviews/ai-machine-learning)

![An illustration of multicolor audio waves.

Audio and video](https://developer.apple.com/documentation/technologyoverviews/audio-and-video)

## Explore the Apple Developer Documentation

Consult the Apple Developer Documentation for in-depth information about individual technologies. The developer documentation includes API reference, articles, sample code, and tutorials to help you learn how to use a given technology. It also offers guidance about the best way to solve specific challenges.

---

# https://developer.apple.com/documentation/technologyoverviews/app-design-and-ui

Collection

- Technology Overviews
- App design and UI

# App design and UI

Choose a programming approach to build your app, create your app’s interface, and implement the fundamental behaviors that your app requires.

At the start of every new project, you need to choose an app-builder technology to use for your initial code. App-builder technologies define the programming approach you take for your app’s interface, event-handling code, and other behaviors. You can choose one of these programming approaches for your app, or combine the approaches.

Each platform defines the overall look for views and controls, and your app-builder technology determines how you create and manage your interface. Build your interface with standard views and controls, a mixture of standard and custom views, or entirely custom content.

## SwiftUI apps

SwiftUI is the best option when you’re learning to program for Apple platforms, or when you want to create a new app. With SwiftUI, you build your app’s interface and content using a declarative programming model. With this model, you describe the behaviors and appearance you want, and SwiftUI creates and manages the interface for you. Changes are data driven, so when you update variables that affect the state of a view, SwiftUI refreshes your interface for you.

Use SwiftUI to build apps for iOS, iPadOS, macOS, tvOS, visionOS, and watchOS and the Swift programming language.

- Build apps and widgets using a declarative programming model and data-driven changes.

- Build your interface, and incorporate features like custom drawing and text editing.

- See live previews of your interface as you write the code for your views.

- Incorporate existing UIKit or AppKit views and view controllers into your interface.

To learn more, read SwiftUI apps.

## UIKit and AppKit apps

UIKit and AppKit offer a more traditional, object-oriented approach to building apps. These frameworks provide a library of objects that you assemble and customize to achieve the behavior you want. For example, you assemble your interface from standard and custom views and place the logic for managing view interactions in custom controller objects. Each object manages its own behavior, and your custom code defines the overall behavior of your app.

Use UIKit to build apps for iOS, iPadOS, tvOS, visionOS, and Mac Catalyst. Use AppKit to build apps for macOS. Build your app using either Swift or the Objective-C programming language.

- Build apps using a library of objects and a model-view-controller architecture.

- Build your interface, and incorporate features like custom drawing and rich-text editing.

- Assemble your app’s view hierarchies using Xcode’s visual editor.

- Adopt SwiftUI views incrementally in your view hierarchies.

To learn more, read UIKit and AppKit apps.

## Interface fundamentals

No matter which app-builder technology you choose, most of the components you use to build your interface are the same. Before you build your interface, learn about the different components available to you, and learn how different platforms use those components. You can also learn about other technologies that impact the design of your interface and how you display content.

- Learn about the windows, views, and other visual elements available to you.

- Explore the design approaches for each platform, and learn how to make your app stand out.

- Manage app-related assets, and learn how to load them locally or from a remote server.

- Support common features like internationalization, accessibility, undo and redo, and the pasteboard.

To learn more, read Interface fundamentals.

## Liquid Glass

Interfaces across Apple platforms feature a new dynamic material called Liquid Glass, which combines the optical properties of glass with a sense of fluidity. Learn how to leverage Liquid Glass to make sure your interface looks right at home on Apple platforms.

- Embrace the visual refresh for materials, controls, and app icons.

- Provide a universal navigation and search experience across platforms.

- Ensure your interface’s organization and layout looks consistent with other apps and system experiences.

- Adopt best practices for windows, modals, menus, and toolbars.

- Test your app to provide a great experience across platforms.

To learn more, read Liquid Glass.

---

# https://developer.apple.com/documentation/technologyoverviews/liquid-glass

Collection

- Technology Overviews
- App design and UI
- Liquid Glass

# Liquid Glass

Learn how to design and develop beautiful interfaces that leverage Liquid Glass.

## Introduction to Liquid Glass

Interfaces across Apple platforms feature a new dynamic material called Liquid Glass, which combines the optical properties of glass with a sense of fluidity. Learn how to adopt this material and embrace the design principles of Apple platforms to create beautiful interfaces that establish hierarchy, create harmony, and maintain consistency across devices and platforms.

Standard components from SwiftUI, UIKit, and AppKit like controls and navigation elements pick up the appearance and behavior of this material automatically. You can also implement these effects in custom interface elements.

## Adopting Liquid Glass

If you have an existing app, adopting Liquid Glass doesn’t mean reinventing your app from the ground up. Start by building your app in the latest version of Xcode to see the changes. Then, follow best practices in your interface to help your app look right at home on Apple platforms.

- Embrace the visual refresh for materials, controls, and app icons.

- Provide a universal navigation and search experience across platforms.

- Ensure your interface’s organization and layout looks consistent with other apps and system experiences.

- Adopt best practices for windows, modals, menus, and toolbars.

- Test your app to ensure it provides a great experience across platforms.

To learn more, read Adopting Liquid Glass.

## Sample code

The Landmarks app showcases how to create a beautiful and engaging user experience using SwiftUI and Liquid Glass. Explore how the Landmarks app implements the look and feel of the Liquid Glass material throughout its interface.

- Configure an app icon with Icon Composer.

- Create an edge-to-edge content experience with the background extension effect.

- Enhance the edge-to-edge content experience by extending horizontal scroll views under a sidebar or inspector.

- Make your interface adaptable to changing window sizes.

- Explore search conventions across platforms.

- Apply Liquid Glass effects to custom interface elements and animations.

To learn more, see Landmarks: Building an app with Liquid Glass.

## Design principles

The Human Interface Guidelines contains guidance and best practices that can help you design a great experience for any Apple platform. Browse the HIG to discover more about adapting your interface for Liquid Glass.

- Define a layout and choose a navigation structure that puts the most important content in focus.

- Reimagine your app icon with simple, bold layers that offer dimensionality and consistency across devices.

- Be judicious with your use of color in controls and navigation so they stay legible and allow your content to infuse them and shine through.

- Ensure interface elements fit in with software and hardware design across devices.

- Adopt standard iconography and predictable action placement across platforms.

To learn more, read the Human Interface Guidelines.

## Videos

![

Meet Liquid Glass](https://developer.apple.com/videos/play/wwdc2025/219)

![

Get to know the new design system](https://developer.apple.com/videos/play/wwdc2025/356)

![

Build a SwiftUI app with the new design](https://developer.apple.com/videos/play/wwdc2025/323)

![

Build a UIKit app with the new design](https://developer.apple.com/videos/play/wwdc2025/284)

![

Build an AppKit app with the new design](https://developer.apple.com/videos/play/wwdc2025/310)

---

# https://developer.apple.com/documentation/technologyoverviews/app-design-and-ui)

---

# https://developer.apple.com/documentation/technologyoverviews/liquid-glass)

---

# https://developer.apple.com/documentation/technologyoverviews/games)

---

# https://developer.apple.com/documentation/technologyoverviews/data-management)

---

# https://developer.apple.com/documentation/technologyoverviews/core-experiences)

---

# https://developer.apple.com/documentation/technologyoverviews/ai-machine-learning)

---

# https://developer.apple.com/documentation/technologyoverviews/audio-and-video)

---

# https://developer.apple.com/documentation/technologyoverviews/swiftui

- Technology Overviews
- App design and UI
- SwiftUI apps

# SwiftUI apps

Build your app for all Apple platforms using the Swift programming language and a modern approach.

SwiftUI is the best choice for creating new apps, the preferred choice for visionOS apps, and required for watchOS apps. Its declarative programming model and approach to interface construction makes it easier to create and maintain your app’s interface on multiple platforms simultaneously.

## Assemble your app’s core content

When someone launches your app, your app needs to initialize itself, prepare its interface, check in with the system, begin its main event loop, and start handling events as quickly as possible. When you build your app using SwiftUI, you initialize your app’s custom data and SwiftUI handles the rest.

The main entry point for a SwiftUI app is the `App` structure. You use this structure to initialize your app’s global data structures. You also use it to declare one or more scenes, where each scene corresponds to part of your app’s interface code. You specify your app’s scenes in the `body` property of the app structure. All new Xcode projects contain an initial scene you can modify, and you can add more scenes as needed to support preference panes, tool palettes, alert panels, and other types of content.

Each of your app’s scenes contains a part of your interface. An app with a single main window can use a `WindowGroup` scene to display that window’s contents. If your app manages documents, you use a `DocumentGroup` scene to specify contents of the document windows. Each scene contains the views you want to display in a particular window. At launch time, SwiftUI chooses an appropriate scene and displays it.

... (truncated for brevity)
