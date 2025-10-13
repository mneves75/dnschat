# Expo GlassEffect

[GitHub](https://github.com/expo/expo/tree/main/packages/expo-glass-
effect)[Changelog](https://github.com/expo/expo/tree/main/packages/expo-glass-
effect/CHANGELOG.md)[npm](https://www.npmjs.com/package/expo-glass-effect)

Ask AI

React components that render a liquid glass effect using iOS's native
UIVisualEffectView.

[GitHub](https://github.com/expo/expo/tree/main/packages/expo-glass-
effect)[Changelog](https://github.com/expo/expo/tree/main/packages/expo-glass-
effect/CHANGELOG.md)[npm](https://www.npmjs.com/package/expo-glass-effect)

Ask AI

iOS

Bundled version:

~0.1.4

Copy

* * *

> `GlassView` is only available on iOS 26 and above. It will fallback to
> regular `View` on unsupported platforms.

React components that render native iOS liquid glass effect using
[`UIVisualEffectView`](https://developer.apple.com/documentation/uikit/uivisualeffectview).
Supports customizable glass styles and tint color.

## Installation

Terminal

Copy

`- ``npx expo install expo-glass-effect`

If you are installing this in an [existing React Native app](/bare/overview),
make sure to [install `expo`](/bare/installing-expo-modules) in your project.

### Known issues

The `isInteractive` prop can only be set once on mount and cannot be changed
dynamically after the component has been rendered. If you need to toggle
interactive behavior, you must remount the component with a different `key`.

## Usage

### `GlassView`

The `GlassView` component renders the native iOS glass effect. It supports
different glass effect styles and can be customized with tint colors for
various aesthetic needs.

Basic GlassView usage

Copy

Open in Snack

    
    
    import { StyleSheet, View, Image } from 'react-native';
    import { GlassView } from 'expo-glass-effect';
    
    export default function App() {
      return (
        <View style={styles.container}>
          <Image
            style={styles.backgroundImage}
            source={{
              uri: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop',
            }}
          />
    
          {/* Basic Glass View */}
          <GlassView style={styles.glassView} />
    
          {/* Glass View with clear style */}
          <GlassView style={styles.tintedGlassView} glassEffectStyle="clear" />
        </View>
      );
    }
    
    const styles = StyleSheet.create({
      container: {
        flex: 1,
      },
      backgroundImage: {
        ...StyleSheet.absoluteFill,
        width: '100%',
        height: '100%',
      },
      glassView: {
        position: 'absolute',
        top: 100,
        left: 50,
        width: 200,
        height: 100,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
      },
      tintedGlassView: {
        position: 'absolute',
        top: 250,
        left: 50,
        width: 200,
        height: 100,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
      },
      text: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
        textAlign: 'center',
      },
    });
    

### `GlassContainer`

The `GlassContainer` component allows you to combine multiple glass views into
a combined effect.

GlassContainer example

Copy

Open in Snack

    
    
    import { StyleSheet, View, Image } from 'react-native';
    import { GlassView, GlassContainer } from 'expo-glass-effect';
    
    export default function GlassContainerDemo() {
      return (
        <View style={styles.container}>
          <Image
            style={styles.backgroundImage}
            source={{
              uri: 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=400&h=600&fit=crop',
            }}
          />
          <GlassContainer spacing={10} style={styles.containerStyle}>
            <GlassView style={styles.glass1} isInteractive />
            <GlassView style={styles.glass2} />
            <GlassView style={styles.glass3} />
          </GlassContainer>
        </View>
      );
    }
    
    const styles = StyleSheet.create({
      container: {
        flex: 1,
      },
      backgroundImage: {
        ...StyleSheet.absoluteFillObject,
        width: '100%',
        height: '100%',
      },
      containerStyle: {
        position: 'absolute',
        top: 200,
        left: 50,
        width: 250,
        height: 100,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
      },
      glass1: {
        width: 60,
        height: 60,
        borderRadius: 30,
      },
      glass2: {
        width: 50,
        height: 50,
        borderRadius: 25,
      },
      glass3: {
        width: 40,
        height: 40,
        borderRadius: 20,
      },
    });
    

### `isLiquidGlassAvailable`

The `isLiquidGlassAvailable` function let's you check, if the Liquid Glass
effect is available in the compiled application. It validates the system and
compiler versions, as well as the
[Info.plist](https://developer.apple.com/documentation/BundleResources/Information-
Property-List/UIDesignRequiresCompatibility) settings.

    
    
    import { isLiquidGlassAvailable } from 'expo-glass-effect';
    
    export default function CheckLiquidGlass() {
      return (
        <Text>
          {isLiquidGlassAvailable()
            ? 'Liquid Glass effect is available'
            : 'Liquid Glass effect is not available'}
        </Text>
      );
    }
    

## API

    
    
    import { GlassView, GlassContainer, isLiquidGlassAvailable } from 'expo-glass-effect';
    

## Components

### `GlassContainer`

iOS

Type:
`React.[Element](https://www.typescriptlang.org/docs/handbook/jsx.html#function-
component)<GlassContainerProps>`

GlassContainerProps

### `spacing`

iOS

Optional • Type: `number` • Default: `undefined`

The distance at which glass elements start affecting each other. Controls when
glass elements begin to merge together.

#### Inherited Props

  * `[ViewProps](https://reactnative.dev/docs/view#props)`

### `GlassView`

iOS

Type:
`React.[Element](https://www.typescriptlang.org/docs/handbook/jsx.html#function-
component)<GlassViewProps>`

GlassViewProps

### `glassEffectStyle`

iOS

Optional • Type: `GlassStyle` • Default: `'regular'`

Glass effect style to apply to the view.

### `isInteractive`

iOS

Optional • Type: `boolean` • Default: `false`

Whether the glass effect should be interactive.

### `tintColor`

iOS

Optional • Type: `string`

Tint color to apply to the glass effect.

#### Inherited Props

  * `[ViewProps](https://reactnative.dev/docs/view#props)`

## Methods

### `isLiquidGlassAvailable()`

iOS

Indicates whether the app is using the Liquid Glass design. The value will be
`true` when the Liquid Glass components are available in the app.

This only checks for component availability. The value may also be `true` if
the user has enabled accessibility settings that limit the Liquid Glass
effect. To check if the user has disabled the Liquid Glass effect via
accessibility settings, use
[`AccessibilityInfo.isReduceTransparencyEnabled()`](https://reactnative.dev/docs/accessibilityinfo#isreducetransparencyenabled-
ios).

Returns:

`boolean`

## Types

### `GlassStyle`

iOS

Literal Type: `string`

Acceptable values are: `'clear'` | `'regular'`

