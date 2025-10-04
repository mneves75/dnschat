# Expo Router UI

[GitHub](https://github.com/expo/expo/tree/sdk-54/packages/expo-
router)[Changelog](https://github.com/expo/expo/tree/sdk-54/packages/expo-
router/CHANGELOG.md)[npm](https://www.npmjs.com/package/expo-router)

Ask AI

An Expo Router submodule that provides headless tab components to create
custom tab layouts.

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

`expo-router/ui` is a submodule of `expo-router` library and exports
components and hooks to build custom tab layouts, rather than using the
default [React Navigation](https://reactnavigation.org/) navigators provided
by `expo-router`.

> See the [Expo Router](/versions/latest/sdk/router) reference for more
> information about the file-based routing library for native and web app.

## Installation

To use `expo-router/ui` in your project, you need to install `expo-router` in
your project. Follow the instructions from the Expo Router's installation
guide:

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

For information about using `expo-router/ui` in Custom tab layouts guide:

[Custom tab layouts](/router/advanced/custom-tabs)

## API

    
    
    import { Tabs, TabList, TabTrigger, TabSlot } from 'expo-router/ui';
    

## Components

### `TabContext`

Android

iOS

tvOS

Web

Type:
`React.[Element](https://www.typescriptlang.org/docs/handbook/jsx.html#function-
component)<ProviderProps<ExpoTabsNavigatorScreenOptions>>`

### `TabList`

Android

iOS

tvOS

Web

Type:
`React.[Element](https://www.typescriptlang.org/docs/handbook/jsx.html#function-
component)<TabListProps>`

Wrapper component for `TabTriggers`. `TabTriggers` within the `TabList` define
the tabs.

Example

    
    
    <Tabs>
     <TabSlot />
     <TabList>
      <TabTrigger name="home" href="/" />
     </TabList>
    </Tabs>
    

TabListProps

### `asChild`

Android

iOS

tvOS

Web

Optional • Type: `boolean`

Forward props to child component and removes the extra `<View>`. Useful for
custom wrappers.

#### Inherited Props

  * `[ViewProps](https://reactnative.dev/docs/view#props)`

### `Tabs`

Android

iOS

tvOS

Web

Type:
`React.[Element](https://www.typescriptlang.org/docs/handbook/jsx.html#function-
component)<TabsProps>`

Root component for the headless tabs.

> See: `useTabsWithChildren` for a hook version of this component.

Example

    
    
    <Tabs>
     <TabSlot />
     <TabList>
      <TabTrigger name="home" href="/" />
     </TabList>
    </Tabs>
    

TabsProps

### `asChild`

Android

iOS

tvOS

Web

Optional • Type: `boolean`

Forward props to child component and removes the extra `<View>`. Useful for
custom wrappers.

### `options`

Android

iOS

tvOS

Web

Optional • Type: `UseTabsOptions`

#### Inherited Props

  * `[ViewProps](https://reactnative.dev/docs/view#props)`

### `TabSlot`

Android

iOS

tvOS

Web

Type:
`React.[Element](https://www.typescriptlang.org/docs/handbook/jsx.html#function-
component)<TabSlotProps>`

Renders the current tab.

> See: `useTabSlot` for a hook version of this component.

Example

    
    
    <Tabs>
     <TabSlot />
     <TabList>
      <TabTrigger name="home" href="/" />
     </TabList>
    </Tabs>
    

TabSlotProps

### `detachInactiveScreens`

Android

iOS

tvOS

Web

Optional • Type: `boolean`

Remove inactive screens.

### `renderFn`

Android

iOS

tvOS

Web

Optional • Type: `defaultTabsSlotRender`

Override how the `Screen` component is rendered.

#### Inherited Props

  * `ComponentProps<ScreenContainer>`

### `TabTrigger`

Android

iOS

tvOS

Web

Type:
`React.[Element](https://www.typescriptlang.org/docs/handbook/jsx.html#function-
component)<TabTriggerProps>`

Creates a trigger to navigate to a tab. When used as child of `TabList`, its
functionality slightly changes since the `href` prop is required, and the
trigger also defines what routes are present in the `Tabs`.

When used outside of `TabList`, this component no longer requires an `href`.

Example

    
    
    <Tabs>
     <TabSlot />
     <TabList>
      <TabTrigger name="home" href="/" />
     </TabList>
    </Tabs>
    

TabTriggerProps

### `asChild`

Android

iOS

tvOS

Web

Optional • Type: `boolean`

Forward props to child component. Useful for custom wrappers.

### `href`

Android

iOS

tvOS

Web

Optional • Type: `[Href](/versions/v54.0.0/sdk/router#href-1)`

Name of tab. Required when used within a `TabList`.

### `name`

Android

iOS

tvOS

Web

Type: `string`

Name of tab. When used within a `TabList` this sets the name of the tab.
Otherwise, this references the name.

### `reset`

Android

iOS

tvOS

Web

Optional • Literal type: `union`

Resets the route when switching to a tab.

Acceptable values are: `SwitchToOptions[reset]` | `'onLongPress'`

#### Inherited Props

  * `PressablePropsWithoutFunctionChildren`

### `useTabSlot`

Android

iOS

tvOS

Web

Type:
`React.[Element](https://www.typescriptlang.org/docs/handbook/jsx.html#function-
component)<TabSlotProps>`

Returns a `ReactElement` of the current tab.

Example

    
    
    function MyTabSlot() {
      const slot = useTabSlot();
    
      return slot;
    }
    

## Hooks

### `useTabSlot(namedParameters)`

Android

iOS

tvOS

Web

Parameter| Type  
---|---  
namedParameters(optional)| `TabSlotProps`  
  
  

Returns a `ReactElement` of the current tab.

Returns:

`[Element](https://www.typescriptlang.org/docs/handbook/jsx.html#function-
component)`

Example

    
    
    function MyTabSlot() {
      const slot = useTabSlot();
    
      return slot;
    }
    

### `useTabsWithChildren(options)`

Android

iOS

tvOS

Web

Parameter| Type  
---|---  
options| `UseTabsWithChildrenOptions`  
  
  

Hook version of `Tabs`. The returned NavigationContent component should be
rendered. Using the hook requires using the `<TabList />` and `<TabTrigger />`
components exported from Expo Router.

The `useTabsWithTriggers()` hook can be used for custom components.

> See: `Tabs` for the component version of this hook.

Example

    
    
    export function MyTabs({ children }) {
     const { NavigationContent } = useTabsWithChildren({ children })
    
     return <NavigationContent />
    }
    

### `useTabsWithTriggers(options)`

Android

iOS

tvOS

Web

Parameter| Type  
---|---  
options| `UseTabsWithTriggersOptions`  
  
  

Alternative hook version of `Tabs` that uses explicit triggers instead of
`children`.

Returns:

`TabsContextValue`

> See: `Tabs` for the component version of this hook.

Example

    
    
    export function MyTabs({ children }) {
      const { NavigationContent } = useTabsWithChildren({ triggers: [] })
    
      return <NavigationContent />
    }
    

### `useTabTrigger(options)`

Android

iOS

tvOS

Web

Parameter| Type  
---|---  
options| `TabTriggerProps`  
  
  

Utility hook creating custom `TabTrigger`.

Returns:

`UseTabTriggerResult`

## Types

### `ExpoTabsNavigationProp`

Android

iOS

tvOS

Web

Type: `NavigationProp<ParamList, RouteName,
[NavigatorID](https://reactnavigation.org/docs/custom-navigators/#type-
checking-navigators),
[TabNavigationState](https://reactnavigation.org/docs/custom-navigators/#type-
checking-navigators)<ParamListBase>, ExpoTabsScreenOptions,
TabNavigationEventMap>`

### `ExpoTabsNavigatorOptions`

Android

iOS

tvOS

Web

Literal Type: `union`

Acceptable values are: `[DefaultNavigatorOptions](https://reactnavigation.org/docs/custom-navigators/#type-checking-navigators)<ParamListBase, string | undefined, [TabNavigationState](https://reactnavigation.org/docs/custom-navigators/#type-checking-navigators)<ParamListBase>, ExpoTabsScreenOptions, TabNavigationEventMap, ExpoTabsNavigationProp<ParamListBase>>` | `[Omit](https://www.typescriptlang.org/docs/handbook/utility-types.html#omittype-keys)<[TabRouterOptions](https://reactnavigation.org/docs/custom-navigators/#type-checking-navigators), 'initialRouteName'>` | `ExpoTabsNavigatorScreenOptions`

### `ExpoTabsNavigatorScreenOptions`

Android

iOS

tvOS

Web

Property| Type| Description  
---|---|---  
detachInactiveScreens(optional)| `boolean`| -  
freezeOnBlur(optional)| `boolean`| -  
lazy(optional)| `boolean`| -  
unmountOnBlur(optional)| `boolean`| -  
  
### `ExpoTabsResetValue`

Android

iOS

tvOS

Web

Literal Type: `string`

Acceptable values are: `'always'` | `'onFocus'` | `'never'`

### `ExpoTabsScreenOptions`

Android

iOS

tvOS

Web

Type: `[Pick](https://www.typescriptlang.org/docs/handbook/utility-types.html#picktype-keys)<BottomTabNavigationOptions, 'title' | 'lazy' | 'freezeOnBlur'>` extended by:

Property| Type| Description  
---|---|---  
action| `NavigationAction`| -  
params(optional)| `object`| -  
title| `string`| -  
  
### `SwitchToOptions`

Android

iOS

tvOS

Web

Options for `switchTab` function.

Property| Type| Description  
---|---|---  
reset(optional)| `ExpoTabsResetValue`| Navigate and reset the history.  
  
### `TabNavigationEventMap`

Android

iOS

tvOS

Web

Property| Type| Description  
---|---|---  
tabLongPress| `{  data: undefined }`| Event which fires on long press on the
tab in the tab bar.  
tabPress| `{  canPreventDefault: true,  data: undefined }`| Event which fires
on tapping on the tab in the tab bar.  
  
### `TabsContextValue`

Android

iOS

tvOS

Web

Type: `ReturnType<useNavigationBuilder>`

The React Navigation custom navigator.

> See: [`useNavigationBuilder`](https://reactnavigation.org/docs/custom-
> navigators/#usenavigationbuilder) hook from React Navigation for more
> information.

### `TabsSlotRenderOptions`

Android

iOS

tvOS

Web

Options provided to the `UseTabSlotOptions`.

Property| Type| Description  
---|---|---  
detachInactiveScreens| `boolean`| Should the screen be unloaded when inactive.  
index| `number`| Index of screen.  
isFocused| `boolean`| Whether the screen is focused.  
loaded| `boolean`| Whether the screen has been loaded.  
  
### `TabTriggerOptions`

Android

iOS

tvOS

Web

Property| Type| Description  
---|---|---  
href| `[Href](/versions/v54.0.0/sdk/router#href-1)`| -  
name| `string`| -  
  
### `Trigger`

Android

iOS

tvOS

Web

Type: extended by:

Property| Type| Description  
---|---|---  
isFocused| `boolean`| -  
resolvedHref| `string`| -  
route| `[number]`| -  
  
### `UseTabsOptions`

Android

iOS

tvOS

Web

Options to provide to the Tab Router.

Type: `[Omit](https://www.typescriptlang.org/docs/handbook/utility-
types.html#omittype-
keys)<[DefaultNavigatorOptions](https://reactnavigation.org/docs/custom-
navigators/#type-checking-navigators)<ParamListBase, any,
[TabNavigationState](https://reactnavigation.org/docs/custom-navigators/#type-
checking-navigators)<any>, ExpoTabsScreenOptions, TabNavigationEventMap, any>,
'children'>` extended by:

Property| Type| Description  
---|---|---  
backBehavior(optional)| `TabRouterOptions[backBehavior]`| -  
  
### `UseTabsWithChildrenOptions`

Android

iOS

tvOS

Web

Type: `PropsWithChildren<UseTabsOptions>`

### `UseTabsWithTriggersOptions`

Android

iOS

tvOS

Web

Type: `UseTabsOptions` extended by:

Property| Type| Description  
---|---|---  
triggers| `ScreenTrigger[]`| -  
  
### `UseTabTriggerResult`

Android

iOS

tvOS

Web

Property| Type| Description  
---|---|---  
getTrigger| `(name: string) => Trigger | undefined`| -  
switchTab| `(name: string, options: SwitchToOptions) => void`| -  
trigger(optional)| `Trigger`| -  
triggerProps| `TriggerProps`| -

