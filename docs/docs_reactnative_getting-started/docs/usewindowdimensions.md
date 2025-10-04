On this page

# useWindowDimensions

tsx

    
    
    import {useWindowDimensions} from 'react-native';  
    

`useWindowDimensions` automatically updates all of its values when screen size
or font scale changes. You can get your application window's width and height
like so:

tsx

    
    
    const {height, width} = useWindowDimensions();  
    

## Example​

## Properties​

### `fontScale`​

tsx

    
    
    useWindowDimensions().fontScale;  
    

The scale of the font currently used. Some operating systems allow users to
scale their font sizes larger or smaller for reading comfort. This property
will let you know what is in effect.

* * *

### `height`​

tsx

    
    
    useWindowDimensions().height;  
    

The height in pixels of the window or screen your app occupies.

* * *

### `scale`​

tsx

    
    
    useWindowDimensions().scale;  
    

The pixel ratio of the device your app is running on. The values can be:

  * `1` which indicates that one point equals one pixel (usually PPI/DPI of 96, 76 on some platforms).
  * `2` or `3` which indicates a Retina or high DPI display.

* * *

### `width`​

tsx

    
    
    useWindowDimensions().width;  
    

The width in pixels of the window or screen your app occupies.

[Edit page for next release](https://github.com/facebook/react-native-
website/edit/main/docs/usewindowdimensions.md)[Edit page for current
release](https://github.com/facebook/react-native-
website/edit/main/website/versioned_docs/version-0.81/usewindowdimensions.md)

Last updated on **Aug 12, 2025**

[
PrevioususeColorScheme](/docs/usecolorscheme)[NextBackHandler](/docs/backhandler)

  * Example
  * Properties
    * `fontScale`
    * `height`
    * `scale`
    * `width`

