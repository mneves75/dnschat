# Right to left

Support right-to-left languages like Arabic and Hebrew by reversing your
interface as needed to match the reading direction of the related scripts.

When people choose a language for their device — or just your app or game —
they expect the interface to adapt in various ways (to learn more, see
[Localization](https://developer.apple.com/localization/)).

System-provided UI frameworks support right-to-left (RTL) by default, allowing
system-provided UI components to flip automatically in the RTL context. If you
use system-provided elements and standard layouts, you might not need to make
any changes to your app’s automatically reversed interface.

If you want to fine-tune your layout or enhance specific localizations to
adapt to different currencies, numerals, or mathematical symbols that can
occur in various locales in countries that use RTL languages, follow these
guidelines.

## [Text alignment](/design/human-interface-guidelines/right-to-left#Text-
alignment)

**Adjust text alignment to match the interface direction, if the system
doesn’t do so automatically.** For example, if you left-align text with
content in the left-to-right (LTR) context, right-align the text to match the
content’s mirrored position in the RTL context.

Left-aligned text in the LTR context

Right-aligned content in the RTL context

**Align a paragraph based on its language, not on the current context.** When
the alignment of a paragraph — defined as three or more lines of text —
doesn’t match its language, it can be difficult to read. For example, right-
aligning a paragraph that consists of LTR text can make the beginning of each
line difficult to see. To improve readability, continue aligning one- and two-
line text blocks to match the reading direction of the current context, but
align a paragraph to match its language.

A left-aligned paragraph in the RTL context

A right-aligned paragraph in the RTL context

**Use a consistent alignment for all text items in a list.** To ensure a
comfortable reading and scanning experience, reverse the alignment of all
items in a list, including items that are displayed in a different script.

Right-aligned content in the RTL context

Mixed alignment in the RTL content

## [Numbers and characters](/design/human-interface-guidelines/right-to-
left#Numbers-and-characters)

Different RTL languages can use different number systems. For example, Hebrew
text uses Western Arabic numerals, whereas Arabic text might use either
Western or Eastern Arabic numerals. The use of Western and Eastern Arabic
numerals varies among countries and regions and even among areas within the
same country or region.

If your app covers mathematical concepts or other number-centric topics, it’s
a good idea to identify the appropriate way to display such information in
each locale you support. In contrast, apps that don’t address number-related
topics can generally rely on system-provided number representations.

Western Arabic numerals

Eastern Arabic numerals

**Don’t reverse the order of numerals in a specific number.** Regardless of
the current language or the surrounding content, the digits in a specific
number — such as “541,” a phone number, or a credit card number — always
appear in the same order.

Latin

Hebrew

Arabic (Western Arabic numerals)

Arabic (Eastern Arabic numerals)

**Reverse the order of numerals that show progress or a counting direction;
never flip the numerals themselves.** Controls like progress bars, sliders,
and rating controls often include numerals to clarify their meaning. If you
use numerals in this way, be sure to reverse the order of the numerals to
match the direction of the flipped control. Also reverse a sequence of
numerals if you use the sequence to communicate a specific order.

Latin

Arabic (Eastern Arabic numerals)

Hebrew

Arabic (Western Arabic numerals)

## [Controls](/design/human-interface-guidelines/right-to-left#Controls)

**Flip controls that show progress from one value to another.** Because people
tend to view forward progress as moving in the same direction as the language
they read, it makes sense to flip controls like sliders and progress
indicators in the RTL context. When you do this, also be sure to reverse the
positions of the accompanying glyphs or images that depict the beginning and
ending values of the control.

A directional control in the LTR context

A directional control in the RTL context

**Flip controls that help people navigate or access items in a fixed order.**
For example, in the RTL context, a back button must point to the right so the
flow of screens matches the reading order of the RTL language. Similarly, next
or previous buttons that let people access items in an ordered list need to
flip in the RTL context to match the reading order.

**Preserve the direction of a control that refers to an actual direction or
points to an onscreen area.** For example, if you provide a control that means
“to the right,” it must always point right, regardless of the current context.

**Visually balance adjacent Latin and RTL scripts when necessary.** In
buttons, labels, and titles, Arabic or Hebrew text can appear too small when
next to uppercased Latin text, because Arabic and Hebrew don’t include
uppercase letters. To visually balance Arabic or Hebrew text with Latin text
that uses all capitals, it often works well to increase the RTL font size by
about 2 points.

Arabic and Hebrew text can look too small next to uppercased Latin text of the
same font size.

You can slightly increase the font size of Arabic and Hebrew text to visually
balance uppercased Latin text.

## [Images](/design/human-interface-guidelines/right-to-left#Images)

**Avoid flipping images like photographs, illustrations, and general
artwork.** Flipping an image often changes the image’s meaning; flipping a
copyrighted image could be a violation. If an image’s content is strongly
connected to reading direction, consider creating a new version of the image
instead of flipping the original.

**Reverse the positions of images when their order is meaningful.** For
example, if you display multiple images in a specific order like
chronological, alphabetical, or favorite, reverse their positions to preserve
the order’s meaning in the RTL context.

![An illustration showing a layout of text and images within a rounded
rectangle. A short bar representing text is left-aligned in the upper-left
corner. Below the bar is an area that contains four squares, including a blue
square with a placeholder image on the left side. From the left, a row of five
square areas at the bottom of the rectangle contain the following shapes:
heart, circle, star, square, and triangle.](https://docs-
assets.developer.apple.com/published/f8e833e7f73aa3f6ce268dd33f174862/image-
positions-ltr%402x.png)Items with meaningful positions in the LTR context

![An illustration showing a layout of text and images within a rounded
rectangle. A short bar representing text is right-aligned in the upper-right
corner. Below the bar is an area that contains four squares, including a blue
square with a placeholder image on the right side. From the right, a row of
five square areas at the bottom of the rectangle contain the following shapes:
heart, circle, star, square, and triangle.](https://docs-
assets.developer.apple.com/published/5071b9cf5e2c0a2395803018149eab87/image-
positions-rtl%402x.png)Items with meaningful positions in the RTL context

## [Interface icons](/design/human-interface-guidelines/right-to-
left#Interface-icons)

When you use [SF Symbols](/design/human-interface-guidelines/sf-symbols) to
supply interface icons for your app, you get variants for the RTL context and
localized symbols for Arabic and Hebrew, among other languages. If you create
custom symbols, you can specify their directionality. For developer guidance,
see [Creating custom symbol images for your
app](/documentation/UIKit/creating-custom-symbol-images-for-your-app).

![Three horizontal lines, stacked evenly on top of each other. Each line is
preceded by a bullet on left. The shape of a closed book with its spine on the
left. A rounded rectangle containing a left-aligned row of three dots. A
pencil is slanted at about forty-five degrees, with its point right of the
rightmost dot and its eraser extending out of the top-right corner of the
rectangle. A rounded rectangle with a black bar across the top that occupies
about a quarter of the rectangle's height. A left-aligned row of white dots is
in the left side of the bar. A rounded rectangle that contains a smaller,
solid-black rounded rectangle near the left side. Outside the rectangle and to
the right is a solid-black semicircle with a vertical straight edge that's
close to the vertical right side of the rectangle.](https://docs-
assets.developer.apple.com/published/eec2236f5595e04904c2b5494696ec1b/directional-
symbols-ltr%402x.png)LTR variants of directional symbols

![Three horizontal lines, stacked evenly on top of each other. Each line is
preceded by a bullet on right. The shape of a closed book with its spine on
the right. A rounded rectangle containing a right-aligned row of three dots. A
pencil is slanted at about forty-five degrees, with its point left of the
leftmost dot and its eraser extending out of the middle of the rectangle's
top. A rounded rectangle with a black bar across the top that occupies about a
quarter of the rectangle's height. A right-aligned row of white dots is in the
right side of the bar. A rounded rectangle that contains a smaller, solid-
black rounded rectangle near the right side. Outside the rectangle and to the
left is a solid-black semicircle with a vertical straight edge that's close to
the vertical left side of the rectangle.](https://docs-
assets.developer.apple.com/published/9f036ccf7a0ca74375f080c94feb77a3/directional-
symbols-rtl%402x.png)RTL variants of directional symbols

**Flip interface icons that represent text or reading direction.** For
example, if an interface icon uses left-aligned bars to represent text in the
LTR context, right-align the bars in the RTL context.

![A rounded rectangle that contains three horizontal left-aligned
lines.](https://docs-
assets.developer.apple.com/published/298befd594e841846cd466f60d2bea6a/doc-
plaintext-ltr%402x.png)LTR variant of a symbol that represents text

![A rounded rectangle that contains three horizontal right-aligned
lines.](https://docs-
assets.developer.apple.com/published/bfae7054f6aec52f1a63e31b6c0db79d/doc-
plaintext-rtl%402x.png)RTL variant of a symbol that represents text

**Consider creating a localized version of an interface icon that displays
text.** Some interface icons include letters or words to help communicate a
script-related concept, like font-size choice or a signature. If you have a
custom interface icon that needs to display actual text, consider creating a
localized version. For example, SF Symbols offers different versions of the
signature, rich-text, and I-beam pointer symbols for use with Latin, Hebrew,
and Arabic text, among others.

![A small X left-aligned above a horizontal line. A stylized signature begins
at the X and finishes at the right end of the line. A rounded rectangle
containing a capital letter A in the top-left corner and a stack of two
horizontal lines in the top-right corner. A placeholder image appears in the
bottom half of the rectangle. A large capital letter A to the left of a tall
I-beam cursor.](https://docs-
assets.developer.apple.com/published/431f27ff945804173931cfd38f595b2c/text-
icon-localized-latin%402x.png)Latin

![A small X right-aligned above a horizontal line. A stylized signature begins
at the X and finishes at the left end of the line. A rounded rectangle
containing the letter Alef in the top-right corner and a stack of two
horizontal lines in the top-left corner. A placeholder image appears in the
bottom half of the rectangle. A large letter Alef to the right of a tall
I-beam cursor.](https://docs-
assets.developer.apple.com/published/b457fc7b677ccbf085cd1ea1d8bc5601/text-
icon-localized-hebrew%402x.png)Hebrew

![A small X right-aligned above a horizontal line. A stylized signature begins
at the X and finishes at the left end of the line. A rounded rectangle
containing the letter Ain in the top-right corner and a stack of two
horizontal lines in the top-left corner. A placeholder image appears in the
bottom half of the rectangle. A large letter Dad to the right of a tall I-beam
cursor.](https://docs-
assets.developer.apple.com/published/7c91fa369eb21255aed0a545bcf9b62d/text-
icon-localized-arabic%402x.png)Arabic

If you have a custom interface icon that uses letters or words to communicate
a concept unrelated to reading or writing, consider designing an alternative
image that doesn’t use text.

**Flip an interface icon that shows forward or backward motion.** When
something moves in the same direction that people read, they typically
interpret that direction as forward; when something moves in the opposite
direction, people tend to interpret the direction as backward. An interface
icon that depicts an object moving forward or backward needs to flip in the
RTL context to preserve the meaning of the motion. For example, an icon that
represents a speaker typically shows sound waves emanating forward from the
speaker. In the LTR context, the sound waves come from the left, so in the RTL
context, the icon needs to flip to show the waves coming from the right.

![The outline of a speaker with three concentric curved lines emanating to the
right.](https://docs-
assets.developer.apple.com/published/d43d629eea61239a9268d6616551b48c/speaker-
wave-3-ltr%402x.png)LTR variant of a symbol that depicts forward motion

![The outline of a speaker with three concentric curved lines emanating to the
left.](https://docs-
assets.developer.apple.com/published/d10bb4c00b214c16a802183377134b59/speaker-
wave-3-rtl%402x.png)RTL variant of a symbol that depicts forward motion

**Don’t flip logos or universal signs and marks.** Displaying a flipped logo
confuses people and can have legal repercussions. Always display a logo in its
original form, even if it includes text. People expect universal symbols and
marks like the checkmark to have a consistent appearance, so avoid flipping
them.

![A rounded square that contains the black Apple TV logo, which consists of a
solid black apple to the left of the lowercase letters T and V.](https://docs-
assets.developer.apple.com/published/7c7eb6d19b63d77412c7754893c0f65c/appletv-
ltr%402x.png)A logo

![A checkmark.](https://docs-
assets.developer.apple.com/published/31cfb3b8b93a1747eddac562a979a9cb/checkmark-
ltr%402x.png)A universal symbol or mark

**In general, avoid flipping interface icons that depict real-world objects.**
Unless you use the object to indicate directionality, it’s best to avoid
flipping an icon that represents a familiar item. For example, clocks work the
same everywhere, so a traditional clock interface icon needs to look the same
regardless of language direction. Some interface icons might seem to reference
language or reading direction because they represent items that are slanted
for right-handed use. However, most people are right-handed, so flipping an
icon that shows a right-handed tool isn’t necessary and might be confusing.

![A black disk with two white lines in the nine o'clock
position.](https://docs-
assets.developer.apple.com/published/2d167db99027c9f44270a86a273f225f/clock-
fill-ltr%402x.png)

![A pencil with an eraser, slanted at about forty-five degrees with the point
in the bottom-left.](https://docs-
assets.developer.apple.com/published/6597719e77e19638bb265cd6c58f9a8a/pencil-
ltr%402x.png)

![The silhouette of a game controller with a white plus sign on the left and
two white buttons on the right.](https://docs-
assets.developer.apple.com/published/c3f51c228de248bf096aae7164836eab/gamecontroller-
fill-ltr%402x.png)

**Before merely flipping a complex custom interface icon, consider its
individual components and the overall visual balance.** In some cases, a
component — like a badge, slash, or magnifying glass — needs to adhere to a
visual design language regardless of localization. For example, SF Symbols
maintains visual consistency by using the same backslash to represent the
prohibition or negation of a symbol’s meaning in both LTR and RTL versions.

![A silhouette of a speaker pointing right with a backslash on top of
it.](https://docs-
assets.developer.apple.com/published/0557fd6fd8fc1b2c347cd869baa6ae0e/speaker-
slash-fill-ltr%402x.png)LTR variant of a symbol that includes a backslash

![A silhouette of a speaker pointing left with a backslash on top of
it.](https://docs-
assets.developer.apple.com/published/42dc822fc59ebc4c8d02d6e6c7fa0959/speaker-
slash-fill-rtl%402x.png)RTL variant of a symbol that includes a backslash

In other cases, you might need to flip a component (or its position) to ensure
the localized version of the icon still makes sense. For example, if a badge
represents the actual UI that people see in your app, it needs to flip if your
UI flips. Alternatively, if a badge modifies the meaning of an interface icon,
consider whether flipping the badge preserves both the modified meaning and
the overall visual balance of the icon. In the images shown below, the badge
doesn’t depict an object in the UI, but keeping it in the top-right corner
visually unbalances the cart.

![A silhouette of a wheeled shopping cart that faces right. A white plus sign
inside a black disk is in the top-right corner.](https://docs-
assets.developer.apple.com/published/faa9849953c7b1b1470db91ed25125d0/cart-
fill-badge-plus-ltr%402x.png)

![A checkmark in a circle to indicate a correct example.](https://docs-
assets.developer.apple.com/published/88662da92338267bb64cd2275c84e484/checkmark%402x.png)

![A silhouette of a wheeled shopping cart that faces left. A white plus sign
inside a black disk is in the top-right corner.](https://docs-
assets.developer.apple.com/published/c065f8369e681461bc34ea590b80994b/cart-
fill-badge-rtl-unbalanced%402x.png)

![An X in a circle to indicate an incorrect example.](https://docs-
assets.developer.apple.com/published/209f6f0fc8ad99d9bf59e12d82d06584/crossout%402x.png)

![A silhouette of a wheeled shopping cart that faces left. A white plus sign
inside a black disk is in the top-left corner.](https://docs-
assets.developer.apple.com/published/97251e1850265c3b1d654d1e4631ca74/cart-
fill-badge-plus-rtl%402x.png)

![A checkmark in a circle to indicate a correct example.](https://docs-
assets.developer.apple.com/published/88662da92338267bb64cd2275c84e484/checkmark%402x.png)

If your custom interface icon includes a component that can imply handedness,
like a tool, consider preserving the orientation of the tool while flipping
the base image if necessary.

![A rounded rectangle that contains a black dot in the top-right corner. The
outline of a magnifying glass that contains a stack of two left-aligned lines
is on top of the rectangle and to the left of the dot, slanted at about 135
degrees.](https://docs-
assets.developer.apple.com/published/0c8dd8148be262162bb75a017e2ae197/mail-
and-text-magnifyingglass-ltr%402x.png)LTR variant of a symbol that depicts a
tool

![A rounded rectangle that contains a black dot in the top-left corner. The
outline of a magnifying glass that contains a stack of two rightt-aligned
lines is on top of the rectangle and to the right of the dot, slanted at about
135 degrees.](https://docs-
assets.developer.apple.com/published/f3ca739120456691b67e55d150596716/mail-
and-text-magnifyingglass-rtl%402x.png)RTL variant of a symbol that depicts a
tool

## [Platform considerations](/design/human-interface-guidelines/right-to-
left#Platform-considerations)

 _No additional considerations for iOS, iPadOS, macOS, tvOS, visionOS, or
watchOS._

## [Resources](/design/human-interface-guidelines/right-to-left#Resources)

#### [Related](/design/human-interface-guidelines/right-to-left#Related)

[Layout](/design/human-interface-guidelines/layout)

[Inclusion](/design/human-interface-guidelines/inclusion)

[SF Symbols](/design/human-interface-guidelines/sf-symbols)

#### [Developer documentation](/design/human-interface-guidelines/right-to-
left#Developer-documentation)

[Localization](https://developer.apple.com/localization/)

[Preparing views for localization](/documentation/SwiftUI/Preparing-views-for-
localization) — SwiftUI

#### [Videos](/design/human-interface-guidelines/right-to-left#Videos)

[![](https://devimages-cdn.apple.com/wwdc-
services/images/3055294D-836B-4513-B7B0-0BC5666246B0/4498DDBC-5903-48A6-85EB-47BCACA39DFB/9915_wide_250x141_1x.jpg)
Enhance your app’s multilingual experience
](https://developer.apple.com/videos/play/wwdc2025/222)

[![](https://devimages-cdn.apple.com/wwdc-
services/images/124/7F5167EA-F6A3-4605-83FF-
FF75E802969C/6527_wide_250x141_1x.jpg) Design for Arabic
](https://developer.apple.com/videos/play/wwdc2022/10034)

