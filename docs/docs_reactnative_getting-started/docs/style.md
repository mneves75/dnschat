On this page

# Style

With React Native, you style your application using JavaScript. All of the
core components accept a prop named `style`. The style names and
[values](/docs/colors) usually match how CSS works on the web, except names
are written using camel casing, e.g. `backgroundColor` rather than
`background-color`.

The `style` prop can be a plain old JavaScript object. That's what we usually
use for example code. You can also pass an array of styles - the last style in
the array has precedence, so you can use this to inherit styles.

As a component grows in complexity, it is often cleaner to use
`StyleSheet.create` to define several styles in one place. Here's an example:

One common pattern is to make your component accept a `style` prop which in
turn is used to style subcomponents. You can use this to make styles "cascade"
the way they do in CSS.

There are a lot more ways to customize the text style. Check out the [Text
component reference](/docs/text) for a complete list.

Now you can make your text beautiful. The next step in becoming a style expert
is to [learn how to control component size](/docs/height-and-width).

## Known issues​

  * [react-native#29308](https://github.com/facebook/react-native/issues/29308#issuecomment-792864162): In some cases React Native does not match how CSS works on the web, for example the touch area never extends past the parent view bounds and on Android negative margin is not supported.

[Edit page for next release](https://github.com/facebook/react-native-
website/edit/main/docs/style.md)[Edit page for current
release](https://github.com/facebook/react-native-
website/edit/main/website/versioned_docs/version-0.81/style.md)

Last updated on **Aug 12, 2025**

[ PreviousUpgrading to new versions](/docs/upgrading)[NextHeight and
Width](/docs/height-and-width)

  * Known issues

