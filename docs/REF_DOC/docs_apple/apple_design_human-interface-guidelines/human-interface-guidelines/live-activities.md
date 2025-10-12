# Live Activities

A Live Activity displays up-to-date information from your app, allowing people
to view the progress of an activity, event, or task at a glance.

Live Activities provide frequent information updates that appear in glanceable
locations such as the Lock Screen, on iPhone in StandBy, and the Dynamic
Island. Starting in watchOS 11 and iOS 18, Live Activities also appear in the
Smart Stack on Apple Watch. For apps with frequent content and status updates
that go beyond the existing push notification system, Live Activities can be a
more flexible way to keep people updated about live events, activities, or
tasks over a couple of hours. In addition to frequently updating displayed
data, they offer a way for people to interact with the information.

For example, the Live Activity of a food delivery app might display the time
remaining until your order arrives; a sports app could provide live in-game
information for their Live Activity; and a workout app could show real time
fitness metrics and offer interactive controls to pause or cancel the workout.

In addition to appearing at the top of the notification list on the Lock
Screen, Live Activities appear in the following locations:

  * On devices that support the Dynamic Island, the system displays Live Activities in a persistent location around the TrueDepth camera.

  * On devices that don’t support the Dynamic Island, the system can display a Live Activity update in a banner that appears briefly at the top of the screen.

  * On iPhone in StandBy, a Live Activity fills the entire screen to offer glanceable information at a distance, or it takes up minimal space at the top of the screen to leave space for widgets.

  * On Apple Watch, when a Live Activity begins on a connected iPhone, the Smart Stack automatically appears with the Live Activity displayed at the top.

## [Best practices](/design/human-interface-guidelines/live-activities#Best-
practices)

**Offer a Live Activity for tasks and live events that have a defined
beginning and end.** People use Live Activities to track activities or ongoing
tasks of short and medium duration. Don’t offer a Live Activity for a task
that exceeds eight hours, and always end a Live Activity immediately after the
task completes or the event ends.

**Consider each Live Activity presentation.** Your Live Activity must support
all locations, devices, and their corresponding appearances. Because Live
Activities are a system-wide feature, carefully consider the amount of
information your Live Activity displays and create a layout that best supports
each of the places in the system where it appears.

**Prioritize important information to make it easy to understand at a quick
glance.** Your Live Activity doesn’t need to display everything. Think about
what information people find most useful and prioritize the size and scale of
it relative to other content you display. When a person wants to access more
information, they can a tap the Live Activity to view your app where you can
display more information if necessary.

**Don’t use a Live Activity to display ads or promotions**. Live Activities
help people stay informed about ongoing events and tasks, so it’s important to
display only information that’s related to those events and tasks.

**Avoid displaying sensitive information in a Live Activity.** A Live Activity
is visually prominent and could be viewed by casual observers. If people might
consider the information in your Live Activity to be sensitive or private,
display an innocuous summary and let people tap the Live Activity to access
the sensitive information in your app.

**Don’t add elements to your app that draw attention to the Dynamic Island.**
Your Live Activity appears in the Dynamic Island while your app isn’t in use,
and other items can appear in the Dynamic Island when your app is open.

### [Starting, updating, and ending a Live Activity](/design/human-interface-
guidelines/live-activities#Starting-updating-and-ending-a-Live-Activity)

**Start a Live Activity when people expect it.** In Settings, people can turn
off Live Activities for your app. To make it less likely for someone to turn
them off, avoid surprising people by starting a Live Activity they don’t
expect. If necessary, give people control over beginning and ending Live
Activities with buttons. However, it can make sense to automatically initiate
a Live Activity if a person starts a task or event. For example, ordering food
for delivery or making a rideshare request could automatically start a Live
Activity. Similarly, a sports app could offer a Live Activity that starts
automatically for every match of a person’s favorite team. On devices that run
iOS 17.2 and iPad OS 17.2 and later, the Live Activity can start with a remote
push notification while the app is in the background. If you automatically
start a Live Activity, display a button or toggle that represents this
behavior and allows people to adjust it to their preferences.

**Offer App Shortcuts that start your Live Activities.** App Shortcuts allow
you to expose app functionality to the system so people can access it in
various contexts. For example, an App Shortcut that starts your Live Activity
allows people to track events using the Action button on iPhone. For more
information on App Shortcuts, see [App Shortcuts](/design/human-interface-
guidelines/app-shortcuts).

**Update a Live Activity only when new content is available.** If the
underlying content or status doesn’t change, show the same content or status
until it changes.

**Alert people about Live Activity updates only if it’s essential to get their
attention.** Live Activity alerts light up the screen and by default play the
notification sound for explicit updates the user shouldn’t miss. They also
show the expanded presentation in the Dynamic Island or the Lock Screen
presentation as a banner on devices that don’t support the Dynamic Island.
Avoid alerting people too often or alerting them to updates that aren’t
crucial because a person might deactivate Live Activities for your app in
Settings. Additionally, don’t use push notifications alongside your Live
Activity to alert people about Live Activity updates.

**If you offer tracking of multiple events, consider cycling through events
instead of starting a new Live Activity for each event.** Cycling through
events makes it easier for people to keep track of multiple events. For
example, a sports app could offer to track all soccer matches that happen in
one evening. Instead of starting many Live Activities, the app could update a
single Live Activity with key events across all matches like goals,
substitutions, fouls, and the start and end of each half in a single dynamic
layout.

**Consider removing the Live Activity from the Lock Screen shortly after the
conclusion of your Live Activity.** In the Dynamic Island, the system
immediately removes a Live Activity when it ends. On the Lock Screen and in
the Smart Stack in watchOS, the system shows a Live Activity for up to four
hours after it ends. Depending on the duration of your Live Activity, showing
a summary in your Lock Screen presentation may only be relevant for a brief
time after it ends. For example, a rideshare app could end the Live Activity
when a ride completes and configure it to remain on the Lock Screen for 30
minutes — long enough for people to view the ride summary and leave a tip for
the driver. Consider choosing a custom removal time that’s proportional to the
duration of your Live Activity. In most cases, 15 to 30 minutes is adequate.

## [Design](/design/human-interface-guidelines/live-activities#Design)

**Create a Live Activity that matches your app’s visual aesthetic and
personality in both dark and light appearances.** Applying your app’s
personality and visual aesthetic makes it easier for people to recognize your
Live Activity. Aim to create a visual connection to your app with your Live
Activity design. For example, consider using your app icon for inspiration.

**If you use a logo mark as part of your brand in a Live Activity, display it
without a container.** Don’t use the entire app icon.

**Use a bold color for your Live Activity background.** If your app has a
recognizable key color people associate with it, use the key color for the
background of your Live Activity. This color creates a strong foundation for
your design that can make it more recognizable and distinguish it from other
Live Activities and notifications.

### [Creating Live Activity layouts](/design/human-interface-guidelines/live-
activities#Creating-Live-Activity-layouts)

**Don’t replicate notification layouts.** Create a unique layout that’s
specific to the information that appears in the Live Activity.

**Make your layout as compact as possible.** Adjust the size and placement of
elements in your Live Activity so they fit together. Create as compact of a
layout as possible that only uses as much space as you need to clearly display
its content.

**Dynamically change the height of your Live Activity.** When there is less
information to show, reduce the height of the Live Activity to only use the
space needed for the content. When more information becomes available,
increase the height to display additional content. For example, a rideshare
app might display a more compact Live Activity without additional details
while it locates a driver. The app’s height extends as more information is
available to display the estimated pickup time, driver details, and so on.
Similarly, a sports app could use a more compact layout during half time of a
soccer match when the teams rest. When the second half of the match starts,
the Live Activity could expand to display key moments like fouls, goals, and
so on.

**Adapt to different screen sizes and Live Activity presentations.** A Live
Activity scales to adapt to screen sizes of different devices. Ensure it looks
great on every device by supplying content at appropriate sizes. As you create
layouts and assets for various devices and scale factors, use the values
listed in [Specifications](/design/human-interface-guidelines/live-
activities#Specifications) as guidance, but note that the actual size on
screen may vary or change.

**When separating a block of content, place it in an inset shape or use a
thick line.** Don’t draw content all the way to the edge of the Dynamic
Island.

![An illustration that shows how a Live Activity draws content all the way to
the edge of the Dynamic Island to separate content.](https://docs-
assets.developer.apple.com/published/b5847471658c3f7df2b8e99496dcbf0a/live-
activities-separating-content-incorrect%402x.png)

![An X in a circle to indicate incorrect usage.](https://docs-
assets.developer.apple.com/published/209f6f0fc8ad99d9bf59e12d82d06584/crossout%402x.png)

![An illustration that shows how you can place content in an inset, rounded
shape to group it together.](https://docs-
assets.developer.apple.com/published/5d2611cfd66d7880ef1120efb23433d8/live-
activities-separating-content-pill%402x.png)

![A checkmark in a circle to indicate correct usage.](https://docs-
assets.developer.apple.com/published/88662da92338267bb64cd2275c84e484/checkmark%402x.png)

![An illustration that shows how you can use a line to separate a block of
content.](https://docs-
assets.developer.apple.com/published/70749f8051768c93460d3b3d261642fd/live-
activities-separating-content-separator%402x.png)

![A checkmark in a circle to indicate correct usage.](https://docs-
assets.developer.apple.com/published/88662da92338267bb64cd2275c84e484/checkmark%402x.png)

**Use consistent margins and concentric placement for your elements.** Use
even, matching margins between rounded shapes and the edges of the Live
Activity to ensure a harmonious fit. For example, when placing a rounded
rectangle near the corner of your Live Activity, make sure to match the
element’s corner radius to the outer corner radius of the Live Activity by
subtracting the margin. Use a SwiftUI container to apply the correct corner
radius. For developer guidance, see
[`ContainerRelativeShape`](/documentation/SwiftUI/ContainerRelativeShape).

![An illustration that shows a rounded shape in the Dynamic Island that uses
even margins and fits harmoniously into the edges of the Dynamic
Island.](https://docs-
assets.developer.apple.com/published/e7043c74cba9ac897df8ac0ef96263d3/live-
activities-rounded-shapes%402x.png)

**Avoid placing text and nonrounded shapes too close to the margins.** Don’t
place content in a way that intrudes into the rounded shape of the Live
Activity. Try to keep content compact and snug within a margin that is
concentric to the outer edge of the Live Activity.

![An illustration that shows how a Live Activity places an icon too far from
the edge of the Dynamic Island.](https://docs-
assets.developer.apple.com/published/c233ae11550a07c092b6199546d3abc5/live-
activities-content-incorrect-position%402x.png)

![An X in a circle to indicate incorrect usage.](https://docs-
assets.developer.apple.com/published/209f6f0fc8ad99d9bf59e12d82d06584/crossout%402x.png)

![An illustration that shows how a Live Activity places an icon close to the
edge of the Dynamic Island without poking into the rounded shape of the
Dynamic Island.](https://docs-
assets.developer.apple.com/published/e03c226074641c488624bff75e167fb6/live-
activities-content-correct-position%402x.png)

![A checkmark in a circle to indicate correct usage.](https://docs-
assets.developer.apple.com/published/88662da92338267bb64cd2275c84e484/checkmark%402x.png)

To help place nonrounded content correctly, you can blur elements and aim to
make the border of the resulting rounded, blurred shapes as concentric as
possible with even margins to make them fit best with the outer perimeter.

![An illustration that shows a Live Activity with blurred text that's too far
from the edge of the Dynamic Island.](https://docs-
assets.developer.apple.com/published/c14bd8fdb690390e8937e451417b1353/live-
activities-blur-content-incorrect-position%402x.png)

![An X in a circle to indicate incorrect usage.](https://docs-
assets.developer.apple.com/published/209f6f0fc8ad99d9bf59e12d82d06584/crossout%402x.png)

![An illustration that shows a Live Activity with blurred text that's close to
the edge of the Dynamic Island without poking into the rounded shape of the
Dynamic Island.](https://docs-
assets.developer.apple.com/published/9f31022de0db043f18cd61e20b4fded9/live-
activities-blur-content-correct-position%402x.png)

![A checkmark in a circle to indicate correct usage.](https://docs-
assets.developer.apple.com/published/88662da92338267bb64cd2275c84e484/checkmark%402x.png)

### [Adding transitions and animating content updates](/design/human-
interface-guidelines/live-activities#Adding-transitions-and-animating-content-
updates)

In addition to extending and contracting transitions, Live Activities use
system and custom animations with a maximum duration of two seconds. Note that
the system doesn’t perform animations on Always-On displays with reduced
luminance.

**Use animations to reinforce the information you’re communicating and to
bring attention to updates.** In addition to moving the position of elements
in your layout, you can animate elements in and out with the default content
replace transition, or create custom transitions using scale, opacity, and
movement. For example, a sports app could use a numeric content transition to
increase or decrease important numbers for a match or gently fade a timer in
and out when it reaches zero.

**Animate layout changes.** For some content updates — for example, when more
information becomes available, or when the Live Activity expands to the full
screen in StandBy — it can make sense to update the layout of your Live
Activity. When your Live Activity transitions to a new layout, animate
existing elements to their new positions rather than removing them and
animating them back in. This kind of update preserves as much of the existing
layout as possible during the transition.

**Try to avoid overlapping elements.** Sometimes, it’s best to animate out
certain elements and then re-animate them in at a new position to avoid
colliding with other parts of your transition. For example, when animating
items in lists, only animate the element that moves to a new position and use
a fade-in-and-out transitions for the other list items.

Note

For developer guidance, see [Displaying live data with Live
Activities](/documentation/ActivityKit/displaying-live-data-with-live-
activities).

### [Offering interactivity](/design/human-interface-guidelines/live-
activities#Offering-interactivity)

**Make sure tapping the Live Activity opens your app at the right location.**
Take people directly to details and actions related to the Live Activity —
don’t require them to navigate to the relevant screen. For developer guidance
on SwiftUI views that can deep link to specific screens in your app, see
[`Link`](/documentation/SwiftUI/Link) and
[`widgetURL(_:)`](/documentation/WidgetKit/DynamicIsland/widgetURL\(_:\)).

**Offer quick controls.** Starting with iOS 17 and iPadOS 17, the expanded
presentation in the Dynamic Island and the Lock Screen presentation can
include buttons or toggles to offer people a way to perform tasks directly
from the Live Activity. However, these elements can take up space that might
otherwise display useful information. As a result, it’s important that you
only include them if they are offering essential functionality that’s directly
related to your Live Activity. For example, the Live Activity of the Timer app
allows people to pause and cancel a timer. Similarly, a fitness app could
allow people to pause and resume an ongoing workout.

**Let people respond to event or progress updates.** Offer buttons or toggles
to allow people to respond to updated data. For example, a rideshare app could
show a button in its Live Activity that people tap to get in touch with the
driver while they are waiting for their ride to arrive.

## [The Lock Screen](/design/human-interface-guidelines/live-activities#The-
Lock-Screen)

On the Lock Screen, the system uses the Lock Screen presentation to display a
banner at the bottom of the screen. In this presentation, use a layout similar
to the expanded presentation.

![A screenshot of a Live Activity on the Lock Screen of iPhone that supports
the Dynamic Island.](https://docs-
assets.developer.apple.com/published/7859a0d79d91b03dc6bc6581c02b2ea2/live-
activity-lock-screen%402x.png)

On devices that don’t support the Dynamic Island, the system uses the Lock
Screen presentation of your Live Activity as a banner that briefly overlays
the Home Screen or another app. This overlay only happens when you alert
people about an update to your Live Activity with an alert configuration.

![A screenshot of a Live Activity that appears as a banner on the Home Screen
of iPhone without Dynamic Island support.](https://docs-
assets.developer.apple.com/published/d124eab5adf9b06af473c23e0d95a878/live-
activity-notch%402x.png)

**Carefully consider using a custom background color and opacity on the Lock
Screen.** If you set a background color or image for Live Activities that
appear on the Lock Screen, test colors to be sure they offer enough contrast —
especially tint colors on devices in Always-On with reduced luminance. Note
that you can’t choose a custom background color for Live Activity
presentations that appear in the Dynamic Island.

**Choose colors that work well on a personalized Lock Screen.** People
customize their Lock Screen with wallpapers, custom tint colors, and widgets.
To make a Live Activity fit a custom Lock Screen aesthetic while remaining
legible, apply custom tint colors and opacity sparingly.

**Make sure your design, assets, and colors look great and offer enough
contrast in Dark Mode and on an Always-On display.** By default, a Live
Activity on the Lock Screen uses a light background color in Light Mode and a
dark background color in Dark Mode. If you apply a custom background color to
your Lock Screen presentation, use a color that works well in both modes or
use a different color for each mode. Additionally, verify your Live Activity
design on an Always-On display with reduced luminance because the system
adapts colors as needed in this appearance. For guidance, see [Dark
Mode](/design/human-interface-guidelines/dark-mode) and [Always
On](/design/human-interface-guidelines/always-on); for developer guidance, see
[About asset
catalogs](https://help.apple.com/xcode/mac/current/#/dev10510b1f7).

**Verify the generated color of the dismiss button on the Lock Screen.** The
system automatically generates a matching dismiss button based on the
background and foreground colors of your Live Activity. Be sure to check that
the generated colors match your Live Activity design and adjust them if needed
using
[`activitySystemActionForegroundColor(_:)`](/documentation/SwiftUI/View/activitySystemActionForegroundColor\(_:\))

**Use standard margins to align with notifications.** The standard layout
margins are 14 points for Live Activities on the Lock Screen. In some cases,
such as for the placement of graphics or buttons, you might need to use
tighter margins, but avoid crowding the edges and creating a cluttered
appearance. For developer guidance, see
[`padding(_:_:)`](/documentation/SwiftUI/View/padding\(_:_:\)).

## [StandBy](/design/human-interface-guidelines/live-activities#StandBy)

![An image that shows the Lock Screen presentation of a Live Activity in
StandBy, scaled up by 2x, with a dotted border to indicate the 2x scaling of
the Live Activity.](https://docs-
assets.developer.apple.com/published/73a140c355d0380b7af165a69d41c7c4/live-
activity-standby-default-outline%402x.png)

When a person taps the minimal presentation on iPhone in StandBy, the system
scales the Lock Screen appearance by 2x to fill the entire screen. If you use
a custom background color for your Live Activity, the system automatically
extends it to the whole screen to create a seamless, full-screen design.

**Update your layout to take advantage of the larger presentation.** Display
additional information and make sure assets look great in the scaled-up
presentation.

**Consider removing a custom background color in StandBy.** Without a custom
background color, your Live Activity seamlessly blends with the device bezel
and achieves a softer look that integrates with a person’s surroundings.
Additionally, when you use the default background color, the system also
scales your Live Activity slightly larger because it no longer needs to
account for the margins around the TrueDepth camera.

**Use standard margins and avoid extending graphic elements to the edge of the
screen.** Without standard margins, content gets cut off as the Live Activity
extends, making it feel broken. To visually separate regions of your layout,
use a line or a container shape instead.

**Verify your design in Night Mode.** In Night Mode, the system automatically
applies a visual treatment to your Live Activity to give it a red tint. Be
sure to check that your Live Activity design uses colors that provide enough
contrast in Night Mode.

![A Live Activity, scaled to fill the screen on iPhone in
StandBy.](https://docs-
assets.developer.apple.com/published/8f43d2e5d435682129b53b4e07ef4f11/live-
activity-standby-night-mode%402x.png)

## [The Dynamic Island](/design/human-interface-guidelines/live-
activities#The-Dynamic-Island)

The Dynamic Island serves as a unified home for alerts and indicators of
ongoing activity. Design your layouts to feel at home within the shape and
background color of the Dynamic Island, while preserving your Live Activity’s
identity through use of color, iconography, and animation.

**Use color to express the character and identity of your app.** Live
Activities in the Dynamic Island use a black opaque background. Consider using
bold colors for text and objects to convey the personality and brand of your
app. Bold colors make your Live Activity recognizable at a glance, and make it
feel like a small, glanceable part of your app that stands out from other Live
Activities. Additionally, bold colors can help reinforce the relationship
between shapes, text, and icons in the Live Activity itself.

**Tint your Live Activity’s key line color so that it matches your content.**
When the background is dark — for example, in Dark Mode — a key line appears
around the Dynamic Island to distinguish it from other content. Choose a color
for this key line that’s consistent with the color of other elements in your
Live Activity.

**Ensure text is easy to read.** Use large, heavier–weight text — a medium
weight or higher. Avoid small text that’s hard to read.

![An illustration that shows text in the Dynamic Island that’s small and
difficult to read.](https://docs-
assets.developer.apple.com/published/2c94feab294c552685df2649d17f910a/live-
activities-text-incorrect-size%402x.png)

![An X in a circle to indicate incorrect usage.](https://docs-
assets.developer.apple.com/published/209f6f0fc8ad99d9bf59e12d82d06584/crossout%402x.png)

![An illustration that shows text in the Dynamic Island with heavier weights
and legible size.](https://docs-
assets.developer.apple.com/published/b549f930325203f779bd4a09dc3c94df/live-
activities-text-correct-size%402x.png)

![A checkmark in a circle to indicate correct usage.](https://docs-
assets.developer.apple.com/published/88662da92338267bb64cd2275c84e484/checkmark%402x.png)

**Use even margins that leave enough space between your content and the edge
of the Dynamic Island.** Apply an even margin to elements all the way around
the edge of the Dynamic Island, including the corners. This kind of margin
prevents elements from poking into the rounded edges and creating visual
tension.

![An illustration that shows content in the Dynamic Island with even
margins.](https://docs-
assets.developer.apple.com/published/458a49f159fbf003028540d37e2f360a/live-
activities-margins%402x.png)

**Animate Live Activity updates to change the shape of the Dynamic Island
dynamically.** Not only do animations bring a person’s attention to updated
information, they underline the active nature of your Live Activity in the
Dynamic Island.

### [Compact presentation](/design/human-interface-guidelines/live-
activities#Compact-presentation)

In the Dynamic Island, the system uses the _compact presentation_ when only
one Live Activity is active. The compact presentation consists of two separate
elements: one that displays on the leading side of the TrueDepth camera, and
one that displays on the trailing side. Even though the compact presentation
offers limited space, it displays up-to-date information about your app’s Live
Activity.

![An illustration that shows the compact leading and compact trailing views in
the Dynamic Island.](https://docs-
assets.developer.apple.com/published/5de0db1a358dfccca20d67ecf1e32876/type-
compact%402x.png)

**Communicate the most important information of your Live Activity.** Use the
compact presentation to show dynamic information. Display live, up-to-date
information that’s key to the Live Activity.

**Ensure unified information and design of the compact presentations in the
Dynamic Island.** The TrueDepth camera separates the compact leading and
compact trailing presentations of a Live Activity, but make sure the contents
of both read as a single piece of information. Using consistent color or
typography can help create a connection between leading and trailing
presentations.

**Keep information as narrow as possible and ensure content is snug against
the TrueDepth camera.** Try not to obscure key information in the status bar,
and maintain a balanced layout with similarly sized views in leading and
trailing presentations. Don’t place padding between content and the TrueDepth
camera. For example, use shortened units or less precise data to avoid
creating an appearance that’s too wide or unbalanced.

![An illustration that shows a compact presentation that appears unbalanced
and too wide because it uses padding around the true depth
camera.](https://docs-
assets.developer.apple.com/published/d276eb92e9fdd9ffe9622defaab7d13b/live-
activities-unbalanced-content%402x.png)

![An X in a circle to indicate incorrect usage.](https://docs-
assets.developer.apple.com/published/209f6f0fc8ad99d9bf59e12d82d06584/crossout%402x.png)

![An illustration that shows a compact presentation that’s snug around the
TrueDepth camera.](https://docs-
assets.developer.apple.com/published/d17bee1109f0915694020846fc12a908/live-
activities-balanced-content%402x.png)

![A checkmark in a circle to indicate correct usage.](https://docs-
assets.developer.apple.com/published/88662da92338267bb64cd2275c84e484/checkmark%402x.png)

**Link to the relevant scene in your app.** People tap a compact Live Activity
to open the app and get more details about the event or task. They don’t need
to view a generic scene in your app. Make sure to open the same scene in your
app when people tap the leading or trailing presentation.

### [Minimal presentation](/design/human-interface-guidelines/live-
activities#Minimal-presentation)

When multiple Live Activities are active, the system uses the _minimal
presentation_ to display two of them in the Dynamic Island. One Live Activity
appears attached to the Dynamic Island while the other appears detached.
Depending on its content size, the detached minimal Live Activity appears
circular or oval. As with a compact Live Activity, people tap a minimal Live
Activity to open the app to get more details about the event or task or touch
and hold it to use essential controls and view additional content in the
expanded presentation.

![An illustration that shows the minimal presentation in the Dynamic
Island.](https://docs-
assets.developer.apple.com/published/2c38a9a60566204bec5e3c335430544f/type-
minimal%402x.png)

**Ensure that your Live Activity is recognizable in the minimal
presentation.** If possible, display updated information instead of only
presenting a logo, but ensure that people are able to quickly recognize your
app. For example, the compact presentation for a Live Activity of the Timer
app displays the remaining time instead of using a static icon.

### [Expanded presentation](/design/human-interface-guidelines/live-
activities#Expanded-presentation)

When people touch and hold a Live Activity in a compact or minimal
presentation, the system displays the content in the _expanded presentation_.

![An illustration that shows the expanded view in the Dynamic
Island.](https://docs-
assets.developer.apple.com/published/267300864fe5ab09d171f4b6d1cb55d0/type-
expanded%402x.png)

**Maintain the relative placement of elements to create a coherent layout
between compact and expanded presentations.** The expanded presentation is an
enlarged version of the compact presentation. Ensure that information and
layouts expand predictably when the Live Activity transitions from compact to
expanded presentation.

**Use a shorter or a tall height for the expanded presentation.** If your
content requires a small amount of vertical screen space, choose a height for
the expanded presentation that clearly retains a capsule shape with continuous
curves at the leading and trailing sides. If your expanded presentation
requires more vertical screen space, use a height that’s rectangular with
rounded edges. Avoid an in-between height that’s harder to visually resolve
and less aesthetically pleasing.

![An illustration that shows a Live Activity in the expanded presentation with
a compact height and capsule shape that feels comfortable and is easy to
visually resolve.](https://docs-
assets.developer.apple.com/published/2243e4ad975cf4fba09a58b6e7570095/live-
activities-expanded-height-pill%402x.png)

![A checkmark in a circle to indicate correct usage.](https://docs-
assets.developer.apple.com/published/88662da92338267bb64cd2275c84e484/checkmark%402x.png)

![An illustration that shows a Live Activity in the expanded presentation with
an in-between height that's hard to visually resolve.](https://docs-
assets.developer.apple.com/published/6508f6e21873ae459c14c8ff5101eb69/live-
activities-expanded-height-middle-incorrect%402x.png)

![An X in a circle to indicate incorrect usage.](https://docs-
assets.developer.apple.com/published/209f6f0fc8ad99d9bf59e12d82d06584/crossout%402x.png)

![An illustration that shows a Live Activity in the expanded presentation with
a tall, rounded-rectangular shape that feels comfortable and is easy to
visually resolve.](https://docs-
assets.developer.apple.com/published/f1bfa965c7e9a96b92166b244fcacb63/live-
activities-expanded-height-tall%402x.png)

![A checkmark in a circle to indicate correct usage.](https://docs-
assets.developer.apple.com/published/88662da92338267bb64cd2275c84e484/checkmark%402x.png)

**Wrap content tightly around the TrueDepth camera.** Try to avoid leaving
space on the leading and trailing sides and below the TrueDepth camera.
Arranging content close to the TrueDepth camera uses space more efficiently,
and helps diminish the visual presence of the TrueDepth camera.

![An illustration that shows an expanded presentation of a Live Activity that
leaves empty space next to the TrueDepth camera.](https://docs-
assets.developer.apple.com/published/3ceb56a39bb02fabcb71982ff83b97bc/live-
activities-layout-incorrect%402x.png)

![An X in a circle to indicate incorrect usage.](https://docs-
assets.developer.apple.com/published/209f6f0fc8ad99d9bf59e12d82d06584/crossout%402x.png)

![An illustration that shows an expanded presentation of a Live Activity that
uses the space next to the TrueDepth camera.](https://docs-
assets.developer.apple.com/published/f7d14e4e62c0e135812a708a1926d11e/live-
activities-layout-correct%402x.png)

![A checkmark in a circle to indicate correct usage.](https://docs-
assets.developer.apple.com/published/88662da92338267bb64cd2275c84e484/checkmark%402x.png)

## [Platform considerations](/design/human-interface-guidelines/live-
activities#Platform-considerations)

 _No additional considerations for iOS or iPadOS. Not supported in macOS,
tvOS, or visionOS._

### [watchOS](/design/human-interface-guidelines/live-activities#watchOS)

Starting with watchOS 11, when a Live Activity begins on an iPhone with a
connected Apple Watch, the Smart Stack appears with the Live Activity at the
top. By default, the view displayed in the Smart Stack combines the leading
and trailing elements from the Live Activity’s compact presentation on iPhone.
For the best experience, create a custom layout specifically for your Live
Activity in the Smart Stack.

![An illustration that shows the compact presentation of a Live Activity in
the Dynamic Island on iPhone.](https://docs-
assets.developer.apple.com/published/b32098ed4f4662df69db1df7a9cb4522/live-
activities-ios-dynamic-island-default%402x.png)iPhone compact view

![An illustration that shows the automatically generated default presentation
of a Live Activity in a Smart Stack view, with the leading and trailing
elements from the iPhone compact view spaced apart in the lower
corners.](https://docs-
assets.developer.apple.com/published/1441a47a3ba447c6ccbfbd8ba8565bd5/live-
activity-watch-default-implementation%402x.png)Default Smart Stack view

![An illustration that shows a custom presentation of a Live Activity in a
Smart Stack view, with a balanced design that shows a graphical countdown
timer balanced with explanatory text.](https://docs-
assets.developer.apple.com/published/cd8ec7a71aab86b947906afbdd802f6b/live-
activity-watch-custom-implementation%402x.png)Custom Smart Stack view

If you have a watchOS app, when someone taps the Live Activity in the Smart
Stack, it opens the watchOS app directly. If you don’t have a watchOS app,
tapping opens a full-screen view with a button to hand off to your app on the
connected iPhone.

**Design a custom layout for your Live Activity in watchOS.** While the system
provides a default view automatically, a custom layout designed for Apple
Watch can provide more detailed information, and add interactive functionality
like a button or toggle. For developer guidance, see
[`ActivityFamily`](/documentation/WidgetKit/ActivityFamily).

**Show only what’s necessary to communicate significant states of the Live
Activity.** It’s important to use space in the Smart Stack as efficiently as
possible. Think of the most useful information that a Live Activity can
convey:

  * Progress, like the estimated arrival time of a delivery

  * Interactivity, like a stopwatch or timer

  * Significant changes, like when a sports score updates

**Use interactivity for simple, direct actions.** While the Live Activity view
on Apple Watch can contain a button or toggle, be considerate when adding
them. Interactive elements are best for activities that people activate only
once or temporarily pause and resume, like music, workouts, or apps that
access the microphone to record live audio.

**Use only one custom button or toggle per view.** Because space is extremely
limited, having multiple smaller or more tightly spaced controls increases the
likelihood of people accidentally tapping the wrong control.

**Prefer familiar layouts for your custom Live Activity views.** Templates
with the system default margins and recommended sizes for text are available
in [Apple Design Resources](https://developer.apple.com/design/resources/).
Adopting these defaults ensures that your Live Activity fits in with the
visual language of the Smart Stack and remains legible at a glance.

## [Specifications](/design/human-interface-guidelines/live-
activities#Specifications)

As you design your Live Activities, use the following values for guidance.

### [iOS Live Activity dimensions](/design/human-interface-guidelines/live-
activities#iOS-Live-Activity-dimensions)

All values listed in the tables below are in points.

Screen dimensions (portrait)| Compact leading| Compact trailing| Minimal
(width given as a range)| Expanded (height given as a range)| Lock Screen
(height given as a range)  
---|---|---|---|---|---  
430x932| 62.33x36.67| 62.33x36.67| 36.67–45x36.67| 408x84–160| 408x84–160  
393x852| 52.33x36.67| 52.33x36.67| 36.67–45x36.67| 371x84–160| 371x84–160  
  
The Dynamic Island uses a corner radius of 44 points, and its rounded corner
shape matches the TrueDepth camera.

Presentation type| Device| Dynamic Island width (points)  
---|---|---  
Compact or minimal| iPhone 17 Pro Max| 250  
| iPhone 17 Pro| 230  
| iPhone Air| 250  
| iPhone 17| 230  
| iPhone 16 Pro Max| 250  
| iPhone 16 Pro| 230  
| iPhone 16 Plus| 250  
| iPhone 16| 230  
| iPhone 15 Pro Max| 250  
| iPhone 15 Pro| 230  
| iPhone 15 Plus| 250  
| iPhone 15| 230  
| iPhone 14 Pro Max| 250  
| iPhone 14 Pro| 230  
Expanded| iPhone 17 Pro Max| 408  
| iPhone 17 Pro| 371  
| iPhone Air| 408  
| iPhone 17| 371  
| iPhone 16 Pro Max| 408  
| iPhone 16 Pro| 371  
| iPhone 16 Plus| 408  
| iPhone 16| 371  
| iPhone 15 Pro Max| 408  
| iPhone 15 Pro| 371  
| iPhone 15 Plus| 408  
| iPhone 15| 371  
| iPhone 14 Pro Max| 408  
| iPhone 14 Pro| 371  
  
### [iPadOS Live Activity dimensions](/design/human-interface-guidelines/live-
activities#iPadOS-Live-Activity-dimensions)

All values listed in the table below are in points.

Screen dimensions (portrait)| Lock Screen (height given as a range)  
---|---  
1366x1024| 500x84–160  
1194x834| 425x84–160  
1012x834| 425x84–160  
1080x810| 425x84–160  
1024x768| 425x84–160  
  
## [Resources](/design/human-interface-guidelines/live-activities#Resources)

#### [Developer documentation](/design/human-interface-guidelines/live-
activities#Developer-documentation)

[ActivityKit](/documentation/ActivityKit)

[SwiftUI](/documentation/SwiftUI)

[WidgetKit](/documentation/WidgetKit)

[Developing a WidgetKit strategy](/documentation/WidgetKit/Developing-a-
WidgetKit-strategy)

#### [Videos](/design/human-interface-guidelines/live-activities#Videos)

[![](https://devimages-cdn.apple.com/wwdc-
services/images/C03E6E6D-A32A-41D0-9E50-C3C6059820AA/F5E64E98-8296-44DA-89AE-814BAEA0A713/9220_wide_250x141_1x.jpg)
Design Live Activities for Apple Watch
](https://developer.apple.com/videos/play/wwdc2024/10098)

[![](https://devimages-cdn.apple.com/wwdc-
services/images/D35E0E85-CCB6-41A1-B227-7995ECD83ED5/73CFB4C1-8568-43E9-AECF-D679A7355B99/8255_wide_250x141_1x.jpg)
Design dynamic Live Activities
](https://developer.apple.com/videos/play/wwdc2023/10194)

[![](https://devimages-cdn.apple.com/wwdc-
services/images/D35E0E85-CCB6-41A1-B227-7995ECD83ED5/B13DB71E-9E8F-4A86-88B3-306C4E772627/8244_wide_250x141_1x.jpg)
Meet ActivityKit ](https://developer.apple.com/videos/play/wwdc2023/10184)

## [Change log](/design/human-interface-guidelines/live-activities#Change-log)

Date| Changes  
---|---  
June 10, 2024| Added guidance for Live Activities in watchOS.  
October 24, 2023| Expanded and updated guidance and added new artwork.  
June 5, 2023| Updated guidance to include features of iOS 17 and iPadOS 17.  
November 3, 2022| Updated artwork and specifications.  
September 23, 2022| New page.

