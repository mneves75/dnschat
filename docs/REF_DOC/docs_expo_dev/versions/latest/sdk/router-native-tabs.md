# Expo Router native tabs

[GitHub](https://github.com/expo/expo/tree/sdk-54/packages/expo-
router)[Changelog](https://github.com/expo/expo/tree/sdk-54/packages/expo-
router/CHANGELOG.md)[npm](https://www.npmjs.com/package/expo-router)

Ask AI

An Expo Router submodule that provides native tabs layout.

[GitHub](https://github.com/expo/expo/tree/sdk-54/packages/expo-
router)[Changelog](https://github.com/expo/expo/tree/sdk-54/packages/expo-
router/CHANGELOG.md)[npm](https://www.npmjs.com/package/expo-router)

Ask AI

Android

iOS

tvOS

Web

Bundled version:

~6.0.10

Copy

* * *

> Native tabs is an experimental feature available in SDK 54 and above, and
> its API is subject to change.

`expo-router/unstable-native-tabs` is a submodule of `expo-router` and exports
components to build tab layouts using platform-native system tabs.

> See the [Expo Router](/versions/latest/sdk/router) reference for more
> information about the file-based routing library for native and web app.

## Installation

To use `expo-router/unstable-native-tabs` in your project, you need to install
`expo-router` in your project. Follow the instructions from Expo Router's
installation guide:

[Install Expo RouterLearn how to install Expo Router in your
project.](/router/installation)

## Configuration in app config

If you are using the [default](/more/create-expo#--template) template to
create a new project, `expo-router`'s [config plugin](/config-
plugins/introduction) is already configured in your app config.

### Example app.json with config plugin

app.json

Copy

    
    
    {
      "expo": {
        "plugins": ["expo-router"]
      }
    }
    

## Usage

To learn how to use native tabs, with Expo Router, read the native tabs guide:

[Native tabsLearn how to use native tabs in your Expo Router
app.](/router/advanced/native-tabs)

## API

    
    
    import { NativeTabs, Icon, Label, Badge, VectorIcon } from 'expo-router/unstable-native-tabs';
    

## Components

### `Badge`

Android

iOS

tvOS

Web

Type:
`React.[Element](https://www.typescriptlang.org/docs/handbook/jsx.html#function-
component)<BadgeProps>`

BadgeProps

### `children`

Android

iOS

tvOS

Web

Optional • Type: `string`

The text to display as the badge for the tab. If not provided, the badge will
not be displayed.

### `hidden`

Android

iOS

tvOS

Web

Optional • Type: `boolean` • Default: `false`

If true, the badge will be hidden.

### `selectedBackgroundColor`

Android

iOS

tvOS

Web

Optional • Type: `[ColorValue](https://reactnative.dev/docs/colors)`

### `Icon`

Android

iOS

Type:
`React.[Element](https://www.typescriptlang.org/docs/handbook/jsx.html#function-
component)<IconProps>`

Renders an icon for the tab.

IconProps

### `selectedColor`

Android

iOS

Optional • Type: `[ColorValue](https://reactnative.dev/docs/colors)`

### `Label`

Android

iOS

tvOS

Web

Type:
`React.[Element](https://www.typescriptlang.org/docs/handbook/jsx.html#function-
component)<LabelProps>`

LabelProps

### `children`

Android

iOS

tvOS

Web

Optional • Type: `string`

The text to display as the label for the tab.

### `hidden`

Android

iOS

tvOS

Web

Optional • Type: `boolean` • Default: `false`

If true, the label will be hidden.

### `selectedStyle`

Android

iOS

tvOS

Web

Optional • Type: `NativeTabsLabelStyle`

### `NativeTabs`

Android

iOS

tvOS

Web

Type:
`React.[Element](https://www.typescriptlang.org/docs/handbook/jsx.html#function-
component)<NativeTabsProps>`

The component used to create native tabs layout.

Example

    
    
    // In _layout file
    import { NativeTabs } from 'expo-router/unstable-native-tabs';
    
    export default function Layout() {
      return (
        <NativeTabs>
          <NativeTabs.Trigger name="home" />
          <NativeTabs.Trigger name="settings" />
        </NativeTabs>
      );
    }
    

NativeTabsProps

### `backBehavior`

Android

Optional • Literal type: `string`

The behavior when navigating back with the back button.

Acceptable values are: `'history'` | `'none'` | `'initialRoute'`

### `backgroundColor`

Android

iOS

tvOS

Web

Optional • Literal type: `union`

The background color of the tab bar.

Acceptable values are: `null` | `[ColorValue](https://reactnative.dev/docs/colors)`

### `badgeBackgroundColor`

Android

iOS

tvOS

Web

Optional • Type: `[ColorValue](https://reactnative.dev/docs/colors)`

The background color of every badge in the tab bar.

### `badgeTextColor`

Android

Web

Optional • Type: `[ColorValue](https://reactnative.dev/docs/colors)`

The color of the badge text.

### `blurEffect`

iOS

Optional • Literal type: `string`

The blur effect applied to the tab bar.

Acceptable values are: `'none'` | `'systemDefault'` | `'extraLight'` | `'light'` | `'dark'` | `'regular'` | `'prominent'` | `'systemUltraThinMaterial'` | `'systemThinMaterial'` | `'systemMaterial'` | `'systemThickMaterial'` | `'systemChromeMaterial'` | `'systemUltraThinMaterialLight'` | `'systemThinMaterialLight'` | `'systemMaterialLight'` | `'systemThickMaterialLight'` | `'systemChromeMaterialLight'` | `'systemUltraThinMaterialDark'` | `'systemThinMaterialDark'` | `'systemMaterialDark'` | `'systemThickMaterialDark'` | `'systemChromeMaterialDark'`

### `disableIndicator`

Android

Optional • Type: `boolean`

Disables the active indicator for the tab bar.

### `disableTransparentOnScrollEdge`

iOS

Optional • Type: `boolean`

When set to `true`, the tab bar will not become transparent when scrolled to
the edge.

### `iconColor`

Android

iOS

tvOS

Web

Optional • Type: `[ColorValue](https://reactnative.dev/docs/colors)`

The color of every tab icon in the tab bar.

### `indicatorColor`

Android

Web

Optional • Type: `[ColorValue](https://reactnative.dev/docs/colors)`

The color of the tab indicator.

### `labelStyle`

Android

iOS

tvOS

Web

Optional • Type: `NativeTabsLabelStyle`

The style of the every tab label in the tab bar.

### `labelVisibilityMode`

Android

Optional • Literal type: `string`

The visibility mode of the tab item label.

> See: [Material Components documentation](https://github.com/material-
> components/material-components-
> android/blob/master/docs/components/BottomNavigation.md#making-navigation-
> bar-accessible)

Acceptable values are: `'auto'` | `'selected'` | `'labeled'` | `'unlabeled'`

### `minimizeBehavior`

iOS 26+

Optional • Literal type: `string` • Default: `automatic`

Specifies the minimize behavior for the tab bar.

Available starting from iOS 26.

The following values are currently supported:

  * `automatic` \- resolves to the system default minimize behavior
  * `never` \- the tab bar does not minimize
  * `onScrollDown` \- the tab bar minimizes when scrolling down and expands when scrolling back up
  * `onScrollUp` \- the tab bar minimizes when scrolling up and expands when scrolling back down

> See: The supported values correspond to the official [UIKit
> documentation](https://developer.apple.com/documentation/uikit/uitabbarcontroller/minimizebehavior).

Acceptable values are: `'automatic'` | `'never'` | `'onScrollDown'` | `'onScrollUp'`

### `rippleColor`

Android

Optional • Type: `[ColorValue](https://reactnative.dev/docs/colors)`

The color of the ripple effect when the tab is pressed.

### `shadowColor`

iOS

Optional • Type: `[ColorValue](https://reactnative.dev/docs/colors)`

The color of the shadow.

> See: [Apple
> documentation](https://developer.apple.com/documentation/uikit/uibarappearance/shadowcolor)

### `tintColor`

Android

iOS

tvOS

Web

Optional • Type: `[ColorValue](https://reactnative.dev/docs/colors)`

The tint color of the tab icon.

Can be overridden by icon color and label color for each tab individually.

### `titlePositionAdjustment`

iOS

Optional • Type: `{  horizontal: number,  vertical: number }`

> See: [Apple
> documentation](https://developer.apple.com/documentation/uikit/uitabbaritem/titlepositionadjustment)

#### Inherited Props

  * `PropsWithChildren`

### `NativeTabsTriggerTabBar`

Android

iOS

tvOS

Web

Type:
`React.[Element](https://www.typescriptlang.org/docs/handbook/jsx.html#function-
component)<NativeTabsTriggerTabBarProps>`

The component used to customize the style of the tab bar, when given trigger
is selected.

Prefer this to global changes of tab bar styles, directly in the page.

> Note: You can use the alias `NativeTabs.Trigger.TabBar` for this component.

Example

    
    
    <NativeTabs
     backgroundColor="black"
    >
     <NativeTabs.Trigger name="page">
       <NativeTabs.Trigger.TabBar
         backgroundColor="white"
       />
       <Label>Page</Label>
     </NativeTabs.Trigger>
    </NativeTabs>
    

NativeTabsTriggerTabBarProps

### `backgroundColor`

Android

iOS

tvOS

Web

Optional • Type: `[ColorValue](https://reactnative.dev/docs/colors)`

The background color of the tab bar, when the tab is selected

### `badgeBackgroundColor`

iOS

Web

Optional • Type: `[ColorValue](https://reactnative.dev/docs/colors)`

The background color of every badge in the tab bar.

### `badgeTextColor`

Web

Optional • Type: `[ColorValue](https://reactnative.dev/docs/colors)`

The color of the badge text.

### `blurEffect`

iOS

Optional • Literal type: `string`

The blur effect applied to the tab bar, when the tab is selected

Acceptable values are: `'none'` | `'systemDefault'` | `'extraLight'` | `'light'` | `'dark'` | `'regular'` | `'prominent'` | `'systemUltraThinMaterial'` | `'systemThinMaterial'` | `'systemMaterial'` | `'systemThickMaterial'` | `'systemChromeMaterial'` | `'systemUltraThinMaterialLight'` | `'systemThinMaterialLight'` | `'systemMaterialLight'` | `'systemThickMaterialLight'` | `'systemChromeMaterialLight'` | `'systemUltraThinMaterialDark'` | `'systemThinMaterialDark'` | `'systemMaterialDark'` | `'systemThickMaterialDark'` | `'systemChromeMaterialDark'`

### `disableTransparentOnScrollEdge`

iOS

Optional • Type: `boolean`

When set to `true`, the tab bar will not become transparent when scrolled to
the edge.

### `iconColor`

iOS

Optional • Type: `[ColorValue](https://reactnative.dev/docs/colors)`

The color of every tab icon, when the tab is selected

### `indicatorColor`

Web

Optional • Type: `[ColorValue](https://reactnative.dev/docs/colors)`

The color of the tab indicator.

### `labelStyle`

iOS

Web

Optional • Type: `NativeTabsLabelStyle`

The style of the every tab label in the tab bar.

### `shadowColor`

iOS

Optional • Type: `[ColorValue](https://reactnative.dev/docs/colors)`

The color of the shadow when the tab is selected.

> See: [Apple
> documentation](https://developer.apple.com/documentation/uikit/uibarappearance/shadowcolor)

### `NativeTabTrigger`

Android

iOS

tvOS

Web

Type:
`React.[Element](https://www.typescriptlang.org/docs/handbook/jsx.html#function-
component)<NativeTabTriggerProps>`

The component used to customize the native tab options both in the _layout
file and from the tab screen.

When used in the _layout file, you need to provide a `name` prop. When used in
the tab screen, the `name` prop takes no effect.

Example

    
    
    // In _layout file
    import { NativeTabs } from 'expo-router/unstable-native-tabs';
    
    export default function Layout() {
      return (
        <NativeTabs>
          <NativeTabs.Trigger name="home" />
          <NativeTabs.Trigger name="settings" />
        </NativeTabs>
      );
    }
    

Example

    
    
    // In a tab screen
    import { NativeTabs } from 'expo-router/unstable-native-tabs';
    
    export default function HomeScreen() {
      return (
        <View>
          <NativeTabs.Trigger>
            <Label>Home</Label>
          </NativeTabs.Trigger>
          <Text>This is home screen!</Text>
        </View>
      );
    }
    

> Note: You can use the alias `NativeTabs.Trigger` for this component.

NativeTabTriggerProps

### `children`

Android

iOS

tvOS

Web

Optional • Type: `[ReactNode](https://reactnative.dev/docs/react-node)`

The children of the trigger.

Use `Icon`, `Label`, and `Badge` components to customize the tab.

### `disablePopToTop`

iOS

Optional • Type: `boolean` • Default: `false`

If true, the tab will not pop stack to the root when selected again.

### `disableScrollToTop`

iOS

Optional • Type: `boolean` • Default: `false`

If true, the tab will not scroll to the top when selected again.

### `hidden`

Android

iOS

tvOS

Web

Optional • Type: `boolean`

If true, the tab will be hidden from the tab bar.

> Note: Marking a tab as `hidden` means it cannot be navigated to in any way.

### `name`

Android

iOS

tvOS

Web

Optional • Type: `string`

The name of the route.

This is required when used inside a Layout component.

When used in a route it has no effect.

### `options`

Android

iOS

tvOS

Web

Optional • Type: `NativeTabOptions`

The options for the trigger.

Use `Icon`, `Label`, and `Badge` components as children to customize the tab,
rather then raw options.

### `role`

iOS

Optional • Literal type: `string`

System-provided tab bar item with predefined icon and title

Uses Apple's built-in tab bar items (e.g., bookmarks, contacts, downloads)
with standard iOS styling and localized titles. Custom `icon` or
`selectedIcon` properties will override the system icon, but the system-
defined title cannot be customized.

> See:
> [https://developer.apple.com/documentation/uikit/uitabbaritem/systemitem|UITabBarItem.SystemItem](https://developer.apple.com/documentation/uikit/uitabbaritem/systemitem%7CUITabBarItem.SystemItem)

Acceptable values are: `'search'` | `'history'` | `'bookmarks'` | `'contacts'` | `'downloads'` | `'favorites'` | `'featured'` | `'more'` | `'mostRecent'` | `'mostViewed'` | `'recents'` | `'topRated'`

### `VectorIcon`

Android

iOS

tvOS

Web

Type:
`React.[Element](https://www.typescriptlang.org/docs/handbook/jsx.html#function-
component)<VectorIconProps<NameT>>`

Helper component which can be used to load vector icons for `NativeTabs`.

Example

    
    
    import { NativeTabs, VectorIcon } from 'expo-router';
    import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
    
    export default Layout(){
      return (
        <NativeTabs>
          <NativeTabs.Trigger name="index">
            <Icon src={<VectorIcon family={MaterialCommunityIcons} name="home" />} />
          </NativeTabs.Trigger>
        </NativeTabs>
      );
    }
    

VectorIconProps

### `family`

Android

iOS

tvOS

Web

Type: `{  getImageSource: (name: NameT, size: number, color: [ColorValue](https://reactnative.dev/docs/colors)) => [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<null | ImageSourcePropType> }`

The family of the vector icon.

Example

    
    
    import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
    

### `name`

Android

iOS

tvOS

Web

Type: `NameT`

The name of the vector icon.

## Interfaces

### `NamedIconCombination`

Android

iOS

tvOS

Web

Property| Type| Description  
---|---|---  
drawable(optional)| `string`| Only for: Android  
The name of the drawable resource to use as an icon.  
sf(optional)| `SFSymbols6_0 | {  default: SFSymbols6_0 | undefined,  selected: SFSymbols6_0 }`| Only for: iOS  
The name of the SF Symbol to use as an icon. The value can be provided in two
ways:

  * As a string with the SF Symbol name
  * As an object specifying the default and selected states

Example

    
    
    <Icon sf="magnifyingglass" />
    

Example

    
    
    <Icon sf={{ default: "house", selected: "house.fill" }} />
      
  
src(optional)| `undefined`| -  
  
### `NativeTabOptions`

Android

iOS

tvOS

Web

Extends: `DefaultRouterOptions`

Property| Type| Description  
---|---|---  
backgroundColor(optional)|
`[ColorValue](https://reactnative.dev/docs/colors)`| The color of the
background when the tab is selected.  
badgeBackgroundColor(optional)|
`[ColorValue](https://reactnative.dev/docs/colors)`| The color of all the
badges when the tab is selected.  
badgeTextColor(optional)| `[ColorValue](https://reactnative.dev/docs/colors)`|
Only for: AndroidWeb  
The color of the badge text.  
badgeValue(optional)| `string`| Only for: AndroidiOS  
Specifies content of tab bar item badge. On Android, the value is interpreted
in the following order:

  * If the string can be parsed to integer, displays the value as a number
  * Otherwise if the string is empty, displays "small dot" badge
  * Otherwise, displays the value as a text

On iOS, badge is displayed as regular string.  
blurEffect(optional)| `'none' | 'systemDefault' | 'extraLight' | 'light' | 'dark' | 'regular' | 'prominent' | 'systemUltraThinMaterial' | 'systemThinMaterial' | 'systemMaterial' | 'systemThickMaterial' | 'systemChromeMaterial' | 'systemUltraThinMaterialLight' | 'systemThinMaterialLight' | 'systemMaterialLight' | 'systemThickMaterialLight' | 'systemChromeMaterialLight' | 'systemUltraThinMaterialDark' | 'systemThinMaterialDark' | 'systemMaterialDark' | 'systemThickMaterialDark' | 'systemChromeMaterialDark'`| Only for: iOS  
The blur effect to apply when the tab is selected.  
disableTransparentOnScrollEdge(optional)| `boolean`| Only for: iOS  
When set to `true`, the tab bar will not become transparent when scrolled to
the edge.  
icon(optional)| `SymbolOrImageSource`| Only for: AndroidiOS  
The icon to display in the tab bar.  
iconColor(optional)| `[ColorValue](https://reactnative.dev/docs/colors)`| The
color of the icon when the tab is selected. On iOS 26+ you can change the icon
color in the scroll edge state.  
indicatorColor(optional)| `[ColorValue](https://reactnative.dev/docs/colors)`|
Only for: AndroidWeb  
The color of the tab indicator.  
labelStyle(optional)| `NativeTabsLabelStyle`| The style of all the tab labels,
when the tab is selected  
role(optional)| `'search' | 'history' | 'bookmarks' | 'contacts' | 'downloads' | 'favorites' | 'featured' | 'more' | 'mostRecent' | 'mostViewed' | 'recents' | 'topRated'`| Only for: iOS  
System-provided tab bar item with predefined icon and title Uses Apple's
built-in tab bar items (e.g., bookmarks, contacts, downloads) with standard
iOS styling and localized titles. Custom `icon` or `selectedIcon` properties
will override the system icon, but the system-defined title cannot be
customized.

> See:
> [https://developer.apple.com/documentation/uikit/uitabbaritem/systemitem|UITabBarItem.SystemItem](https://developer.apple.com/documentation/uikit/uitabbaritem/systemitem%7CUITabBarItem.SystemItem)  
  
selectedBadgeBackgroundColor(optional)|
`[ColorValue](https://reactnative.dev/docs/colors)`| The color of the badge
when the tab is selected.  
selectedIcon(optional)| `SymbolOrImageSource`| Only for: iOS  
The icon to display when the tab is selected.  
selectedIconColor(optional)|
`[ColorValue](https://reactnative.dev/docs/colors)`| The color of the icon
when the tab is selected.  
selectedLabelStyle(optional)| `NativeTabsLabelStyle`| The style of the tab
label when the tab is selected.  
selectedTitlePositionAdjustment(optional)| `{  horizontal: number,  vertical:
number }`| Only for: iOS  
The position adjustment for the label when the tab is selected.  
shadowColor(optional)| `[ColorValue](https://reactnative.dev/docs/colors)`|
Only for: iOS  
The color of the shadow when the tab is selected.

> See: [Apple
> documentation](https://developer.apple.com/documentation/uikit/uibarappearance/shadowcolor)  
  
title(optional)| `string`| Only for: AndroidiOS  
Title of the tab screen, displayed in the tab bar item.  
titlePositionAdjustment(optional)| `{  horizontal: number,  vertical: number
}`| Only for: iOS  
The position adjustment for all the labels when the tab is selected.  
  
### `NativeTabsActiveStyleType`

Android

Web

Property| Type| Description  
---|---|---  
color(optional)| `[ColorValue](https://reactnative.dev/docs/colors)`| Only
for: AndroidWeb  
-  
fontSize(optional)| `number`| Only for: AndroidWeb  
-  
iconColor(optional)| `[ColorValue](https://reactnative.dev/docs/colors)`| Only
for: Android  
-  
indicatorColor(optional)| `[ColorValue](https://reactnative.dev/docs/colors)`|
Only for: AndroidWeb  
-  
  
### `NativeTabsLabelStyle`

Android

iOS

tvOS

Web

Property| Type| Description  
---|---|---  
color(optional)| `[ColorValue](https://reactnative.dev/docs/colors)`| The
color of the tab label.  
fontFamily(optional)| `string`| The font family of the tab label.  
fontSize(optional)| `number`| The font size of the tab label.  
fontStyle(optional)| `'italic' | 'normal'`| The font style of the tab label.  
fontWeight(optional)| `NumericFontWeight | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900'`| The font weight of the tab label.  
  
### `SourceIconCombination`

Android

iOS

tvOS

Web

Property| Type| Description  
---|---|---  
drawable(optional)| `undefined`| -  
sf(optional)| `undefined`| -  
src(optional)| `ReactElement | ImageSourcePropType | {  default: ReactElement<unknown, string | JSXElementConstructor<any>> | ImageSourcePropType | undefined,  selected: ReactElement<unknown, string | JSXElementConstructor<any>> | ImageSourcePropType }`| Only for: AndroidiOS  
The image source to use as an icon. The value can be provided in two ways:

  * As an image source
  * As an object specifying the default and selected states

Example

    
    
    <Icon src={require('./path/to/icon.png')} />
    

Example

    
    
    <Icon src={{ default: require('./path/to/icon.png'), selected: require('./path/to/icon-selected.png') }} />
      
  
## Types

### `SymbolOrImageSource`

Android

iOS

tvOS

Web

Type: `object` shaped as below:

Property| Type| Description  
---|---|---  
drawable(optional)| `string`| Only for: Android  
The name of the drawable resource to use as an icon.  
sf(optional)| `[SFSymbol](https://github.com/nandorojo/sf-symbols-
typescript)`| Only for: iOS  
The name of the SF Symbol to use as an icon.  
  
Or `object` shaped as below:

Property| Type| Description  
---|---|---  
src(optional)| `ImageSourcePropType | [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<ImageSourcePropType | null>`| The image source to use as an icon.

