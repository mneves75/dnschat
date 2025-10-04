On this page

# ImageBackground

A common feature request from developers familiar with the web is `background-
image`. To handle this use case, you can use the `<ImageBackground>`
component, which has the same props as `<Image>`, and add whatever children to
it you would like to layer on top of it.

You might not want to use `<ImageBackground>` in some cases, since the
implementation is basic. Refer to `<ImageBackground>`'s [source
code](https://github.com/facebook/react-native/blob/main/packages/react-
native/Libraries/Image/ImageBackground.js) for more insight, and create your
own custom component when needed.

Note that you must specify some width and height style attributes.

## Example​

* * *

# Reference

## Props​

### [Image Props](/docs/image#props)​

Inherits [Image Props](/docs/image#props).

* * *

### `imageStyle`​

Type  
---  
[Image Style](/docs/image-style-props)  
  
* * *

### `imageRef`​

Allows to set a reference to the inner `Image` component

Type  
---  
[Ref](https://react.dev/learn/manipulating-the-dom-with-refs)  
  
* * *

### `style`​

Type  
---  
[View Style](/docs/view-style-props)  
  
[Edit page for next release](https://github.com/facebook/react-native-
website/edit/main/docs/imagebackground.md)[Edit page for current
release](https://github.com/facebook/react-native-
website/edit/main/website/versioned_docs/version-0.81/imagebackground.md)

Last updated on **Aug 12, 2025**

[
PreviousImage](/docs/image)[NextKeyboardAvoidingView](/docs/keyboardavoidingview)

  * Example
  * Props
    * Image Props
    * `imageStyle`
    * `imageRef`
    * `style`

