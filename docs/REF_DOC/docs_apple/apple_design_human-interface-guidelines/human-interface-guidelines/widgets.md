# Widgets

A widget elevates and displays a small amount of timely, relevant information
from your app or game so people can see it at a glance in additional contexts.

Widgets display content and offer specific functionality without requiring
people to open your app. People can use widgets to organize and personalize
their devices, quickly accessing the information and features they need.

The system can display widgets in different places depending on a person’s
device. In iOS and iPadOS, widgets appear on the Home Screen, in Today View,
and on the Lock Screen. In macOS, people can find widgets on the desktop and
in Notification Center. In watchOS, widgets appear in the Smart Stack when
people turn the Digital Crown.

People can access the widget gallery from the same places where widgets can
appear by going into edit mode — for example, by tapping Edit on the Home
Screen. The widget gallery contains a collection of widgets that people can
add to their device. People can also make changes to editable widgets in the
gallery, such as choosing a location in a Weather widget, or selecting a topic
in a News widget. In macOS, the gallery also includes iPhone widgets from
devices that use the same Apple Account. In watchOS, apps offer preconfigured
widgets that the system displays in the Smart Stack, which can include up to
10 widgets. People can pin widgets to a fixed position in the Smart Stack to
customize their experience.

In iOS and iPadOS, the widget gallery also supports widget stacks, including a
Smart Stack. A stack contains up to 10 same-size widgets; people view one
widget at a time by scrolling through the stack. In a Smart Stack, the stack
automatically rotates its widgets to display the widget that’s most likely to
be relevant in the current context. Smart Stacks aren’t available on the Lock
Screen on iPhone and iPad. A suggested widget doesn’t stay in the Smart Stack
unless people choose to keep it. For developer guidance, see [Increasing the
visibility of widgets in Smart Stacks](/documentation/WidgetKit/Widget-
Suggestions-In-Smart-Stacks).

Widgets come in different sizes, ranging from small accessory widgets on the
Lock Screen in iOS and iPadOS, to extra large widgets in iPadOS and macOS.

  * Small 
  * Medium 
  * Large 
  * Extra large 
  * Accessory circular 
  * Accessory rectangular 
  * Accessory inline 

![An image of the medium Calendar widget, which has the same height as the
small widget, but twice the width. On the left, the widget repeats the small
widget’s information, adding a birthday event; on the right the medium widget
adds information about tomorrow’s events.](https://docs-
assets.developer.apple.com/published/6e277b6fcaaf2547201de479d5a652fd/calendar-
medium%402x.png)

![An image of the large Calendar widget, which has the same width as the
medium widget, but a little more than twice the height. Like the medium
widget, the large widget displays information about today on the left and
information about tomorrow on the right. On both sides, the large version
includes relevant time-of-day indicators.](https://docs-
assets.developer.apple.com/published/1e7734fcd17bd79231a8101717ca1188/calendar-
large%402x.png)

![An image of the extra large Calendar widget, which is about twice the width
of the large widget and a little shorter. The widget displays information
about today and the following three days, including relevant time-of-day
indicators in all four columns. The today column is a little wider than the
columns for the other days.](https://docs-
assets.developer.apple.com/published/2fae89790e6249e72daea3d78285215a/calendar-
extra-large%402x.png)

![An image of the circular accessory Calendar widget, showing only the time
for the next event.](https://docs-
assets.developer.apple.com/published/6599a0305e2d88e6f349dca791bdef74/widget-
accessory-calendar-circular%402x.png)

![An image of the rectangular accessory Calendar widget. It displays the time
of two simultaneous events and their titles.](https://docs-
assets.developer.apple.com/published/26c43bbc5318b137cf5d972cb5376bb0/widget-
accessory-calendar-rectangular%402x.png)

![An image of an the inline accessory Calendar widget, showing the date and
the number of the next events.](https://docs-
assets.developer.apple.com/published/dd9851142906c56a6c45d292c6d61491/widget-
accessory-calendar-inline%402x.png)

The following table shows the available widget sizes for each platform:

Widget size| iPhone| iPad| Apple Watch| Mac  
---|---|---|---|---  
System small| Home Screen, Today View, and StandBy| Home Screen, Today View,
and Lock Screen| No| Desktop and Notification Center  
System medium| Home Screen and Today View| Home Screen and Today View| No|
Desktop and Notification Center  
System large| Home Screen and Today View| Home Screen and Today View| No|
Desktop and Notification Center  
System extra large| No| Home Screen and Today View| No| Desktop and
Notification Center  
Accessory circular| Lock Screen| Lock Screen| Watch complications and in the
Smart Stack| No  
Accessory corner| No| No| Watch complications| No  
Accessory rectangular| Lock Screen| Lock Screen| Watch complications and in
the Smart Stack| No  
Accessory inline| Lock Screen| Lock Screen| Watch complications| No  
  
## [Best practices](/design/human-interface-guidelines/widgets#Best-practices)

**Look for a simple idea that’s clearly related to your app’s main purpose.**
The first step in the design process is to choose a single idea for your
widget. Throughout the process, use that idea to help you include only the
most relevant content and functionality in the widget. For example, people who
use the Weather app are often most interested in the current high and low
temperatures and weather conditions, so the widget for Weather prioritizes
this information.

**In each size, display only the information that’s directly related to the
widget’s main purpose.** In larger widgets, you can display more data — or
more detailed visualizations of the data — but you don’t want to lose sight of
the widget’s primary purpose. For example, all Calendar widgets display a
person’s upcoming events. In each size, the widget remains centered on events
while expanding the range of information as the size increases.

**Offer your widget in multiple sizes when doing so adds value.** In general,
avoid simply expanding a smaller widget’s content to fill a larger area. It’s
more important to create one widget in the size that works best for the
content you want to display than it is to provide the widget in all sizes.

**Aim to create a widget that gives people quick access to the content they
want.** People appreciate widgets that display meaningful content and offer
useful actions and deep links to key areas of your app. When a widget merely
behaves like an app icon, it offers little additional value and people may be
less likely to keep it on their screens.

**Prefer dynamic information that changes throughout the day.** If a widget’s
content never appears to change, people may not keep it in a prominent
position. Although widgets don’t update from minute to minute, it’s important
to find ways to keep their content fresh to invite frequent viewing.

**Look for opportunities to surprise and delight.** For example, you might
design a unique visual treatment for your calendar widget to display on
meaningful occasions, like birthdays or holidays.

**Let people know when authentication adds value.** If your widget provides
additional functionality when someone is signed in to your app, make sure
people know that. For example, an app that shows upcoming reservations might
include a message like “Sign in to view reservations” when people are signed
out.

### [Updating widget content](/design/human-interface-
guidelines/widgets#Updating-widget-content)

To remain relevant and useful, widgets periodically refresh their information.
Widgets don’t support continuous, real-time updates, and the system may adjust
the limits for updates depending on various factors.

**Keep your widget up to date.** Finding the appropriate update frequency for
your widget depends on knowing how often the data changes, and estimating when
people need to see the new data. For example, a widget that helps people track
tides at a beach could provide useful information on an hourly basis, even
though tide conditions change constantly. If people are likely to check your
widget more frequently than you can update it, consider displaying text that
describes when the data was last updated. For developer guidance, see [Keeping
a widget up to date](/documentation/WidgetKit/Keeping-a-Widget-Up-To-Date).

**Use system functionality to refresh dates and times in your widget.** Widget
update frequency is limited, and you can preserve some of your update
opportunities by letting the system refresh date and time information.

**Encourage the system to display or elevate the position of your watchOS
widget in the Smart Stack.** Relevancy information helps the system show your
widget when people need it most. Relevance can be location-based or specific
to ongoing system actions, like a workout. For developer guidance, see
[`RelevantContext`](/documentation/RelevanceKit/RelevantContext).

**Show content quickly.** When you determine the update frequency that fits
with the data you display, you don’t need to hide stale data behind
placeholder content.

**Use animated transitions to bring attention to data updates.** By default,
many SwiftUI views animate content updates. Use standard and custom animations
with a duration of up to two seconds to let people know when new information
is available or when content displays differently.

**Offer Live Activities to show real-time updates.** Widgets don’t show real-
time information. If your app allows people to track the progress of a task or
event for a limited amount of time with frequent updates, consider offering
Live Activities in your app. Widgets and Live Activities use the same
underlying frameworks and share design similarities. As a result, it can be a
good idea to develop widgets and Live Activities in tandem and reuse code and
design components for both features. For design guidance on Live Activities,
see [Live Activities](/design/human-interface-guidelines/live-activities); for
developer guidance, see [ActivityKit](/documentation/ActivityKit).

### [Configuring widgets](/design/human-interface-
guidelines/widgets#Configuring-widgets)

In some cases, people need to edit a widget to ensure it displays the
information that’s most useful for them. For example, people choose a stock
symbol for a Stocks widget. In contrast, some widgets — like the Podcasts
widget — automatically display recent content, so people don’t need to
customize them.

**Make editable widgets easy for people to customize.** If your widget is
editable, avoid requiring too many settings or asking for information that
might be hard for people to find. You don’t have to design an editing-mode
user interface for your widget because the system automatically generates it
for you. For developer guidance, see [Making a configurable
widget](/documentation/WidgetKit/Making-a-Configurable-Widget).

### [Adding interactivity to widgets](/design/human-interface-
guidelines/widgets#Adding-interactivity-to-widgets)

People tap or click a widget to launch its corresponding app. In iOS, iPadOS,
macOS, and watchOS, widgets can also include buttons and toggles to offer
additional functionality without launching the app. For example, the Reminders
widget helps people mark a task as completed, and the widget of an app people
use to log their daily caffeine intake can include a button that increases the
caffeine total for the day.

![An image of the large Reminders widget with a toggle for each task. None of
the tasks is complete.](https://docs-
assets.developer.apple.com/published/034564a7fa3c044d03d59566149c1bff/reminders-
widget-large%402x.png)Incomplete tasks

![An image of the large Reminders widget with a toggle for each task. The
toggle for the first item in the list indicates that the task is
complete.](https://docs-
assets.developer.apple.com/published/75f28459dfaebcadf7f14aeb678cd18c/reminders-
widget-large-selected%402x.png)Completed tasks

**Offer simple, relevant functionality in a widget, reserving complex
functionality for your app.** Useful widgets offer an easy way to complete a
task or action that’s directly related to its content.

**Ensure that a widget interaction opens your app at the right location.**
When people interact with your widget in areas that aren’t buttons or toggles,
the interaction launches your app. Avoid making people navigate to the
relevant area in the app, and instead deep link to the place where you offer
details and actions that directly relate to the widget’s content. For example,
when people click or tap a medium Stocks widget, the Stocks app opens to a
page that displays information about the symbol.

![An image of a medium Stocks watchlist widget, listing three stock symbols.
Each row displays the symbol name on the left, a graph section in the middle,
and a current quote, including a value change, on the right.](https://docs-
assets.developer.apple.com/published/42abbc644ecc396a85587350f60145cd/multiple-
tap-targets%402x.png)

**Provide options for interaction while remaining glanceable and
uncluttered.** In iOS, iPadOS, macOS, and watchOS, widgets can offer multiple
deep links that open the app and can include controls that perform app
functions without launching the app. Multiple interaction targets — SwiftUI
links, buttons, and toggles — might make sense for your content, but avoid
creating app-like layouts in your widgets. Pay attention to the size of
targets and make sure people can tap or click them with confidence and without
accidentally performing unintended interactions. In watchOS, use a
confirmation prompt to avoid unintended interactions. Note that inline
accessory widgets offer only one tap target.

## [Interface design](/design/human-interface-guidelines/widgets#Interface-
design)

Widgets use vivid colors, rich images, and clear, crisp text that’s easy to
read at a glance. A unique, beautiful widget not only provides useful
information, it can encourage people to feature it on their devices.

**Help people recognize your widget by including design elements linked to
your brand’s identity.** Design elements like brand colors, typeface, and
stylized glyphs can make a widget instantly recognizable. Take care to keep
brand-related design elements from crowding out useful information or making
your widget look out of place in its context.

Note

When a widget appears in Notification Center in macOS or on the Home Screen in
iOS, the system displays the app name below it. In Today View, the Lock Screen
in iOS, and the iPadOS Home Screen, the app name doesn’t appear below a
widget.

**Consider carefully before displaying a logo, wordmark, or app icon in your
widget.** When you include brand-related design elements like colors and
fonts, people seldom need your logo or app icon to help them recognize your
widget. Also, the widget gallery displays your app name and icon when it lists
the various types and sizes of widgets you offer. In some widgets — for
example, those that display content from multiple sources — it may make sense
to include a small logo in the top-right corner to subtly identify the app
that provides the widget.

**Aim for a comfortable density of information.** When content appears sparse,
the widget can seem unnecessary; when content is too dense, the widget isn’t
glanceable. If you have lots of information to include, avoid letting your
widget become a collage of items that are difficult to parse. Seek ways to
curate the content so that people can grasp the essential parts instantly and
view relevant details at a longer look. You might also consider creating a
larger widget and looking for places where you can replace text with graphics
without losing clarity.

**Use color judiciously.** Beautiful colors draw the eye, but they’re best
when they don’t prevent people from absorbing a widget’s information at a
glance. Use color to enhance a widget’s appearance without competing with its
content. In your asset catalog, you can also specify the colors you want the
system to use as it generates your widget’s editing-mode user interface.

**Avoid mirroring your widget’s appearance within your app.** If your app
displays an element that looks like your widget but doesn’t behave like it,
people can be confused when the element responds differently when they
interact with it. Also, people may be less likely to try other ways to
interact with such an element in your app because they expect it to behave
like a widget.

### [Scaling content and using margins and padding](/design/human-interface-
guidelines/widgets#Scaling-content-and-using-margins-and-padding)

Widgets scale to adapt to the screen sizes of different devices and onscreen
areas. Ensure that your widget looks great on every device by supplying
content at appropriate sizes.

**Design content to look great in all situations by letting the system resize
or scale it as necessary.** In iOS, the system ensures that your widget looks
good on small devices by resizing the content you design for large devices. In
iPadOS, the system renders your widget at a large size before scaling it down
for display on the Home Screen. As you create design comprehensives for
various devices and scale factors, use the values listed in
[Specifications](/design/human-interface-guidelines/widgets#Specifications)
for guidance; for your production widget, use
[SwiftUI](/documentation/SwiftUI) to ensure flexibility.

**Coordinate the corner radius of your content with the corner radius of the
widget.** To ensure that your content looks good within a widget’s rounded
corners, use a SwiftUI container to apply the correct corner radius. For
developer guidance, see
[`ContainerRelativeShape`](/documentation/SwiftUI/ContainerRelativeShape).

Note

In iOS, widgets support Dynamic Type sizes from Large to AX5 when you use
[`Font`](/documentation/SwiftUI/Font) to choose a system font or
[custom(_:size:)](https://developer.apple.com/documentation/swiftui/font/custom\(_:size:\))
to choose a custom font. For more information about Dynamic Type sizes, see
[Specifications](/design/human-interface-guidelines/typography#Specifications)

**In general, use standard margins to ensure your content is comfortably
legible.** Use the standard margin width for widgets — 16 points for most
widgets — to avoid crowding the edges of widgets and creating a cluttered
appearance. For example, as you place graphics or buttons or you use
background shapes to create visual content groupings, you might need to use
tighter, custom margins. Setting tight margins of 11 points can work well for
those cases. Additionally, note that widgets use smaller margins on the
desktop on Mac and on the Lock Screen — including in StandBy. For developer
guidance, see [`padding(_:_:)`](/documentation/SwiftUI/View/padding\(_:_:\)).

### [Displaying text in widgets](/design/human-interface-
guidelines/widgets#Displaying-text-in-widgets)

**Consider using the system font, text styles, and SF Symbols.** Using the
system font helps your widget look at home on any platform, while making it
easier for you to display great-looking text in a variety of weights, styles,
and sizes. Use SF Symbols to align and scale symbols with text that uses the
system font. If you need to use a custom font, consider using it sparingly,
and be sure it’s easy for people to read at a glance. It often works well to
use a custom font for the large text in a widget and SF Pro for the smaller
text. For guidance, see [Typography](/design/human-interface-
guidelines/typography) and [SF Symbols](/design/human-interface-guidelines/sf-
symbols).

**Avoid using very small font sizes.** In general, display text using fonts at
11 points or larger. Text in a font that’s smaller than 11 points can be too
hard for many people to read.

**Always use text elements in a widget to ensure that your text scales well.**
In particular, don’t rasterize text — doing so prevents VoiceOver from
speaking your content.

### [Supporting different appearances and modes](/design/human-interface-
guidelines/widgets#Supporting-different-appearances-and-modes)

For every appearance, a unique, beautiful widget not only provides useful
information, it can encourage people to feature it on their devices. Depending
on the context in which they appear, widgets can look different. For example:

  * Color varies from vivid colors to tinted, monochrome colors.

  * Images vary from rich, full-color images, to monochrome images, to symbols and glyphs only.

For example, a small system widget appears as follows:

  * On the Home Screen of iPhone and iPad, the widget takes on a rich, full color appearance that supports light and dark appearances.

![An image of the small Stocks widget on the Home Screen, showing the price of
Apple stock.](https://docs-
assets.developer.apple.com/published/f0e9727895fa134635d78cfe45688444/stocks-
widget-default%402x.png)

  * On the Lock Screen of iPad, the widget takes on a vibrant appearance.

![An image of the small Stocks widget on the Lock Screen, showing the price of
Apple stock.](https://docs-
assets.developer.apple.com/published/8c1684a741460fa749c883851f17f3e9/stocks-
widget-lock-screen%402x.png)

  * On the Lock Screen of iPhone in StandBy, the widget appears scaled up in size, and uses the vibrant appearance. When the ambient light falls below a threshold, StandBy in Night mode renders widget content in a monochromatic red tint.

![An image of the Stocks widget on the Lock Screen in StandBy, showing the
price of Apple stock.](https://docs-
assets.developer.apple.com/published/5af7b763901bffa95c06ef5d22ae0a84/stocks-
widget-no-background%402x.png)StandBy

![An image of the Stocks widget on the Lock Screen in Night mode, showing the
price of Apple stock.](https://docs-
assets.developer.apple.com/published/a85982b04cbc33dce699e2ac0bd85edc/stocks-
widget-night-mode%402x.png)Night mode

  * In Notification Center in macOS, the widget uses rich, full colors and supports both light and dark appearances.

  * On the desktop on Mac, the widget uses rich, full colors when people interact with it. When people interact with apps instead, the widget uses vibrancy and a blurred background to recede.

  * Full color appearance 
  * Receded appearance 

![A screenshot of the desktop on Mac. It shows several widgets on its left
side that appear in full color: Weather, Stocks, Calendar, Photos, and Tips
widgets.](https://docs-
assets.developer.apple.com/published/1211d018910da1748f6ff9eb3496b665/mac-
widgets-desktop-full-color%402x.png)

![A screenshot of the desktop on Mac. It shows several widgets on its left
side that use a receded appearance: Weather, Stocks, Calendar, Photos, and
Tips widgets.](https://docs-
assets.developer.apple.com/published/4832337a1bca01a9b9df3d6f1e172968/mac-
widgets-desktop-receded%402x.png)

Similarly, a rectangular accessory widget appears as follows:

  * On the Lock Screen of iPhone and iPad, it takes on a vibrant appearance.

  * On Apple Watch, the widget can appear as a watch complication in both full-color and tinted appearances, and it can also appear in the Smart Stack.

  * iPhone Lock Screen 
  * Watch complication 
  * Smart Stack on Apple Watch 

![A a rectangular accessory Calendar widget on the Lock Screen of iPhone,
displaying a team meeting at 10 A.M. in a conference room.](https://docs-
assets.developer.apple.com/published/a038845ca8ae5a346da244a9423e4a73/calendar-
widget-rectangular-iphone%402x.png)

![A rectangular Calendar watch complication, displaying a team meeting at 10
A.M. in a conference room.](https://docs-
assets.developer.apple.com/published/61bc04d467630ba774014c709062194f/calendar-
widget-rectangular-watch-complication%402x.png)

![A Calendar widget in the Smart Stack on Apple Watch. It displays a team
meeting at 10 A.M. in a conference room.](https://docs-
assets.developer.apple.com/published/9371b09ded346fba89144f97531ae356/calendar-
widget-rectangular-watch-widget%402x.png)

The following table lists the available rendering modes for various types and
sizes of widgets. For developer guidance, see [Preparing widgets for
additional platforms, contexts, and
appearances](/documentation/WidgetKit/Preparing-widgets-for-additional-
contexts-and-appearances).

Widget size| Full color| Accented| Vibrant (receded in macOS)  
---|---|---|---  
System small| Yes| Yes| Yes  
System medium| Yes| Yes| Yes  
System large| Yes| Yes| Yes  
System extra large| Yes| Yes| Yes  
Accessory circular| Yes| Yes| Yes  
Accessory corner| Yes| Yes| No  
Accessory rectangular| Yes| Yes| Yes  
Accessory inline| Yes| Yes| Yes  
  
**Support Dark Mode.** Ideally, a widget looks great in both the light and
dark appearances. In general, avoid displaying dark text on a light background
for the dark appearance, or light text on a dark background for the light
appearance. When you use the semantic system colors for text and backgrounds,
the colors dynamically adapt to the current appearance. You can also support
different appearances by putting color variants in your asset catalog. For
guidance, see [Dark Mode](/design/human-interface-guidelines/dark-mode); for
developer guidance, see [Asset management](/documentation/Xcode/asset-
management) and [Supporting Dark Mode in your
interface](/documentation/UIKit/supporting-dark-mode-in-your-interface).

![An image of the small Notes widget. Below the yellow bar that contains the
app icon and name, the widget displays a single note in black text on a white
background.](https://docs-
assets.developer.apple.com/published/0fb7093d499f2152926c4f6143786f53/notes-
small-light%402x.png)

![An image of the small Notes widget. Below the yellow bar that contains the
app icon and name, the widget a single note in white text on a black
background.](https://docs-
assets.developer.apple.com/published/d6644cc54f9ab3bfcd3f689f3170fc76/notes-
small-dark%402x.png)

**Support StandBy and Night mode.** In StandBy, the system displays two small
system family widgets side-by-side, scaled up so they fill the Lock Screen.
Widgets that appear in StandBy typically don’t use rich images or color to
convey meaning but instead make use of the additional space by scaling up and
rearranging text so people can glance at the widget content from a greater
distance. To seamlessly blend with the black background, don’t use background
colors for your widget when it appears in StandBy.

  * Correct usage 
  * Incorrect usage 

![An image of iPhone in StandBy. It shows a Clock widget on the left that
displays the time as 9:41 a.m. and a Weather widget set to Cupertino with the
temperature at 70 degrees Fahrenheit on the right.](https://docs-
assets.developer.apple.com/published/b45b626f06315aa7ecee84d57851b3b8/removed-
background%402x.png)

![A checkmark in a circle to indicate correct usage.](https://docs-
assets.developer.apple.com/published/88662da92338267bb64cd2275c84e484/checkmark%402x.png)

![An image of iPhone in StandBy. It shows a Clock widget on the left that
displays the time as 9:41 a.m. and a Weather widget set to Cupertino with the
temperature at 70 degrees Fahrenheit on the right. The Watch widget appears
with the background removed and the Weather widget isn't optimized for
StandBy.](https://docs-
assets.developer.apple.com/published/a3770022b9c5348dca2ab246e1809da6/with-
background%402x.png)

![An X in a circle to indicate incorrect usage.](https://docs-
assets.developer.apple.com/published/209f6f0fc8ad99d9bf59e12d82d06584/crossout%402x.png)

In Night mode, the system applies a red tint to widgets.

![An image of iPhone in Night mode. It shows a Clock widget on the left that
displays the time as 9:41 a.m. and a Weather widget set to Cupertino with the
temperature at 70 degrees Fahrenheit on the right.](https://docs-
assets.developer.apple.com/published/5742993fb79cf715b9b0dbe799de708a/widgets-
night-mode%402x.png)

Night mode

**Adjust colors and images for the vibrant rendering mode.** The system
renders widgets on the Lock Screen and the desktop on Mac using a vibrant,
blurred appearance. The opacity of pixels within your image determines the
strength of the blurred material effect. Fully transparent pixels let the
background wallpaper pass through as–is. When creating assets for the vibrant
rendering mode, render content like images, numbers, or text at full opacity.
The brightness of pixels determines how vibrant they appear on the Lock
Screen: Brighter gray values provide more contrast, and darker values provide
less contrast. To establish hierarchy, use white or light gray for the most
prominent content and darker grayscale values for secondary elements.

To make sure images look great in the vibrant rendering mode:

  * Confirm that image content has sufficient contrast in grayscale.

  * Use opaque grayscale values, rather than opacities of white, to achieve the best vibrant material effect.

**Support both full color and vibrancy for widgets in macOS.** Widgets that
people place on the desktop on Mac use rich, full colors when people interact
with them; when people switch to using apps, widgets use a vibrant,
monochromatic rendering that appears to recede. Be sure to prepare your widget
to offer enough contrast to be glanceable and show its information when it
takes on the vibrant appearance. People can also place iPhone widgets on the
desktop on Mac, so you want to make sure your iPhone widgets support the
vibrant appearance in macOS.

## [Accented widgets](/design/human-interface-guidelines/widgets#Accented-
widgets)

In iOS 18 and later and iPadOS 18 and later, people can select a tint color on
the Home Screen. The system applies the selected tint color to widgets and app
icons on the Home Screen and in the Today View, similar to how the system
applies a tint color to complications on the watch face.

Widgets are fully tinted by default, but you can choose views to accent
instead. If a widget contains any accented views, only those views are tinted.
Consider using accented views to display important information. For developer
guidance, see
[`widgetAccentable(_:)`](/documentation/SwiftUI/View/widgetAccentable\(_:\))

**Use full color to highlight images.** In iOS and iPadOS, you can specify
images in a widget to render in full color. For example, you can make the
album artwork full color for a music app. Note that full-color images need to
have smaller dimensions than the size of the widget.

**Convey meaning without relying on specific colors to represent
information.** Someone may choose a color that changes the purpose of the
information you’re showing. In watchOS, the system may invert colors depending
on the watch face a person chooses.

## [Previews and placeholders](/design/human-interface-
guidelines/widgets#Previews-and-placeholders)

**Design a realistic preview to display in the widget gallery.** Highlighting
your widget’s capabilities — and clearly representing the experiences each
widget type or size can provide — helps people make an informed decision. You
can display real data in your widget preview, but if the data takes too long
to generate or load, display realistic simulated data instead.

**Design placeholder content that helps people recognize your widget.** An
installed widget displays placeholder content while its data loads. You can
create an effective placeholder appearance by combining static interface
components with semi-opaque shapes that stand in for dynamic content. For
example, you can use rectangles of different widths to suggest lines of text,
and circles or squares in place of glyphs and images.

![An image of a small Tips widget that displays placeholder content on top of
a yellow background. In the bottom half of the widget, three horizontal bars
in different shades of yellow represent lines of text.](https://docs-
assets.developer.apple.com/published/58159b6d0c63c30d5a93fe9842fbe93d/tips-
placeholder%402x.png)

![An image of a small Tips widget that displays actual data on top of a yellow
background. The horizontal bars in the placeholder widget are replaced by
three short lines of text in different shades of yellow.](https://docs-
assets.developer.apple.com/published/c346b25f7fc0ec1d084d3b9db6dce4ce/tips%402x.png)

**Write a succinct description of your widget.** The widget gallery displays
descriptions that help people understand what each widget does. It generally
works well to begin a description with an action verb — for example, “See the
current weather conditions and forecast for a location” or “Keep track of your
upcoming events and meetings.” Avoid including unnecessary phrases that
reference the widget itself, like “This widget shows…,” “Use this widget to…,”
or “Add this widget.” Use approachable language and [sentence-style
capitalization](https://support.apple.com/guide/applestyleguide/c-apsgb744e4a3/web#apdca93e113f1d64).

**Group your widget’s sizes together, and provide a single description.** If
your widget is available in multiple sizes, group the sizes together so people
don’t think each size is a different widget. Provide a single description of
your widget — regardless of how many sizes you offer — to avoid repetition and
to help people understand how each size provides a slightly different
perspective on the same content and functionality.

**Consider coloring the Add button.** After people choose your app in the
widget gallery, an Add button appears below the group of widgets you offer.
You can specify a color for this button to help remind people of your brand.

![An illustration that represents the widget gallery open to the small widget
for the Notes app. Below the widget is a page control showing that this is the
first page of three; below the page control is a button that uses the Notes
app’s yellow accent color.](https://docs-
assets.developer.apple.com/published/0676d2342d1dfc1b2e7101a6ba621063/add-
button-custom-color-1%402x.png)

![An illustration that represents the widget gallery open to the small widget
for the Weather app. Below the widget is a page control showing that this is
the first page of three; below the page control is a button that uses the
Weather app’s blue accent color.](https://docs-
assets.developer.apple.com/published/7f90fe184f20b46fd1afab61bd736592/add-
button-custom-color-2%402x.png)

## [Platform considerations](/design/human-interface-
guidelines/widgets#Platform-considerations)

 _No additional considerations for macOS. Not supported in tvOS or visionOS._

### [iOS, iPadOS](/design/human-interface-guidelines/widgets#iOS-iPadOS)

Widgets on the Lock Screen are functionally similar to watch complications and
follow design principles for [Complications](/design/human-interface-
guidelines/complications) in addition to design principles for widgets.
Provide useful information in your Lock Screen widget, and don’t treat it only
as an additional way for people to launch into your app. Additionally, the
vibrant rendering mode that widgets on the Lock Screen use is similar to the
accented rendering mode for watch complications because they both communicate
information without relying on color only. In many cases, a design for
complications also works well for widgets on the Lock Screen (and vice versa),
so consider creating them in tandem.

Your app can offer widgets on the Lock Screen in three different shapes: as
inline text that appears above the clock, and as circular and rectangular
shapes that appear below the clock.

![A partial screenshot of the Lock Screen on iPhone that shows three Weather
widgets below the time. From the left, the widgets are an inline text widget
and two circular widgets.](https://docs-
assets.developer.apple.com/published/a823acc4c31f5a7483d116321d45755b/weather-
widget-lock-screen%402x.png)

**Support Always-On display on iPhone.** Devices with Always-On display render
widgets on the Lock Screen with reduced luminance. Use levels of gray that
provide enough contrast in Always-On display, and make sure your content is
legible.

For developer guidance, see [Creating accessory widgets and watch
complications](/documentation/WidgetKit/Creating-accessory-widgets-and-watch-
complications),
[WidgetRenderingMode](https://developer.apple.com/documentation/widgetkit/WidgetRenderingMode),
and
[vibrant](https://developer.apple.com/documentation/widgetkit/WidgetRenderingMode/vibrant).

### [watchOS](/design/human-interface-guidelines/widgets#watchOS)

**Provide a colorful background that conveys meaning.** By default, widgets in
the Smart Stack use a black background. Consider using a custom color that
provides additional meaning. For example, the Stocks app uses a red background
for falling stock values and a green background if a stock’s value rises.

## [Specifications](/design/human-interface-guidelines/widgets#Specifications)

As you design your widgets, use the following values for guidance.

### [iOS widget dimensions](/design/human-interface-guidelines/widgets#iOS-
widget-dimensions)

Screen size (portrait, pt)| Small (pt)| Medium (pt)| Large (pt)| Circular
(pt)| Rectangular (pt)| Inline (pt)  
---|---|---|---|---|---|---  
430×932| 170x170| 364x170| 364x382| 76x76| 172x76| 257x26  
428x926| 170x170| 364x170| 364x382| 76x76| 172x76| 257x26  
414x896| 169x169| 360x169| 360x379| 76x76| 160x72| 248x26  
414x736| 159x159| 348x157| 348x357| 76x76| 170x76| 248x26  
393x852| 158x158| 338x158| 338x354| 72x72| 160x72| 234x26  
390x844| 158x158| 338x158| 338x354| 72x72| 160x72| 234x26  
375x812| 155x155| 329x155| 329x345| 72x72| 157x72| 225x26  
375x667| 148x148| 321x148| 321x324| 68x68| 153x68| 225x26  
360x780| 155x155| 329x155| 329x345| 72x72| 157x72| 225x26  
320x568| 141x141| 292x141| 292x311| N/A| N/A| N/A  
  
### [iPadOS widget dimensions](/design/human-interface-
guidelines/widgets#iPadOS-widget-dimensions)

Screen size (portrait, pt)| Target| Small (pt)| Medium (pt)| Large (pt)| Extra
large (pt)  
---|---|---|---|---|---  
768x1024| Canvas| 141x141| 305.5x141| 305.5x305.5| 634.5x305.5  
Device| 120x120| 260x120| 260x260| 540x260  
744x1133| Canvas| 141x141| 305.5x141| 305.5x305.5| 634.5x305.5  
Device| 120x120| 260x120| 260x260| 540x260  
810x1080| Canvas| 146x146| 320.5x146| 320.5x320.5| 669x320.5  
Device| 124x124| 272x124| 272x272| 568x272  
820x1180| Canvas| 155x155| 342x155| 342x342| 715.5x342  
Device| 136x136| 300x136| 300x300| 628x300  
834x1112| Canvas| 150x150| 327.5x150| 327.5x327.5| 682x327.5  
Device| 132x132| 288x132| 288x288| 600x288  
834x1194| Canvas| 155x155| 342x155| 342x342| 715.5x342  
Device| 136x136| 300x136| 300x300| 628x300  
954x1373 *| Canvas| 162x162| 350x162| 350x350| 726x350  
Device| 162x162| 350x162| 350x350| 726x350  
970x1389 *| Canvas| 162x162| 350x162| 350x350| 726x350  
Device| 162x162| 350x162| 350x350| 726x350  
1024x1366| Canvas| 170x170| 378.5x170| 378.5x378.5| 795x378.5  
Device| 160x160| 356x160| 356x356| 748x356  
1192x1590 *| Canvas| 188x188| 412x188| 412x412| 860x412  
Device| 188x188| 412x188| 412x412| 860x412  
  
* When Display Zoom is set to More Space.

### [watchOS widget dimensions](/design/human-interface-
guidelines/widgets#watchOS-widget-dimensions)

Apple Watch size| Size of a widget in the Smart Stack (pt)  
---|---  
40mm| 152x69.5  
41mm| 165x72.5  
44mm| 173x76.5  
45mm| 184x80.5  
49mm| 191x81.5  
  
## [Resources](/design/human-interface-guidelines/widgets#Resources)

#### [Related](/design/human-interface-guidelines/widgets#Related)

[Layout](/design/human-interface-guidelines/layout)

#### [Developer documentation](/design/human-interface-
guidelines/widgets#Developer-documentation)

[WidgetKit](/documentation/WidgetKit)

[Developing a WidgetKit strategy](/documentation/WidgetKit/Developing-a-
WidgetKit-strategy) — WidgetKit

#### [Videos](/design/human-interface-guidelines/widgets#Videos)

[![](https://devimages-cdn.apple.com/wwdc-
services/images/3055294D-836B-4513-B7B0-0BC5666246B0/126547AE-9E47-4E15-AC05-5C50AB08CBEE/9952_wide_250x141_1x.jpg)
What’s new in widgets ](https://developer.apple.com/videos/play/wwdc2025/278)

[![](https://devimages-cdn.apple.com/wwdc-
services/images/D35E0E85-CCB6-41A1-B227-7995ECD83ED5/5631C647-3158-42F6-A1D3-50566815A1BB/8056_wide_250x141_1x.jpg)
Bring widgets to life
](https://developer.apple.com/videos/play/wwdc2023/10028)

[![](https://devimages-cdn.apple.com/wwdc-
services/images/3055294D-836B-4513-B7B0-0BC5666246B0/4D354E1F-5016-49F7-9296-3D3722626480/9957_wide_250x141_1x.jpg)
Design widgets for visionOS
](https://developer.apple.com/videos/play/wwdc2025/255)

## [Change log](/design/human-interface-guidelines/widgets#Change-log)

Date| Changes  
---|---  
January 17, 2025| Corrected watchOS widget dimensions.  
June 10, 2024| Updated to include guidance for accented widgets in iOS 18 and
iPadOS 18.  
June 5, 2023| Updated guidance to include widgets in watchOS, widgets on the
iPad Lock Screen, and updates for iOS 17, iPadOS 17, and macOS 14.  
November 3, 2022| Added guidance for widgets on the iPhone Lock Screen and
updated design comprehensives for iPhone 14, iPhone 14 Pro, and iPhone 14 Pro
Max.

