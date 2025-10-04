# ![Expo BlurView icon](/static/images/packages/expo-blur.png)Expo BlurView

[GitHub](https://github.com/expo/expo/tree/sdk-54/packages/expo-
blur)[Changelog](https://github.com/expo/expo/tree/sdk-54/packages/expo-
blur/CHANGELOG.md)[npm](https://www.npmjs.com/package/expo-blur)

Ask AI

A React component that blurs everything underneath the view.

[GitHub](https://github.com/expo/expo/tree/sdk-54/packages/expo-
blur)[Changelog](https://github.com/expo/expo/tree/sdk-54/packages/expo-
blur/CHANGELOG.md)[npm](https://www.npmjs.com/package/expo-blur)

Ask AI

Android

iOS

tvOS

Web

Bundled version:

~15.0.7

Copy

* * *

A React component that blurs everything underneath the view. Common usage of
this is for navigation bars, tab bars, and modals.

> `BlurView` on Android is an experimental feature. To enable it use the
> [`experimentalBlurMethod`](/versions/latest/sdk/blur-
> view#experimentalblurmethod) prop.

#### Known issues

The blur effect does not update when `BlurView` is rendered before dynamic
content is rendered using, for example, `FlatList`. To fix this, make sure
that `BlurView` is rendered after the dynamic content component. For example:

    
    
    <View>
      <FlatList />
      <BlurView />
    </View>
    

## Installation

Terminal

Copy

`- ``npx expo install expo-blur`

If you are installing this in an [existing React Native app](/bare/overview),
make sure to [install `expo`](/bare/installing-expo-modules) in your project.

## Usage

Basic BlurView usage

Copy

Open in Snack

    
    
    import { Text, StyleSheet, View } from 'react-native';
    import { BlurView } from 'expo-blur';
    
    export default function App() {
      const text = 'Hello, my container is blurring contents underneath!';
      return (
        <View style={styles.container}>
          <View style={styles.background}>
            {[...Array(20).keys()].map(i => (
              <View
                key={`box-${i}`}
                style={[styles.box, i % 2 === 1 ? styles.boxOdd : styles.boxEven]}
              />
            ))}
          </View>
          <BlurView intensity={100} style={styles.blurContainer}>
            <Text style={styles.text}>{text}</Text>
          </BlurView>
          <BlurView intensity={80} tint="light" style={styles.blurContainer}>
            <Text style={styles.text}>{text}</Text>
          </BlurView>
          <BlurView intensity={90} tint="dark" style={styles.blurContainer}>
            <Text style={[styles.text, { color: '#fff' }]}>{text}</Text>
          </BlurView>
        </View>
      );
    }
    
    const styles = StyleSheet.create({
      container: {
        flex: 1,
      },
      blurContainer: {
        flex: 1,
        padding: 20,
        margin: 16,
        textAlign: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        borderRadius: 20,
      },
      background: {
        flex: 1,
        flexWrap: 'wrap',
        ...StyleSheet.absoluteFill,
      },
      box: {
        width: '25%',
        height: '20%',
      },
      boxEven: {
        backgroundColor: 'orangered',
      },
      boxOdd: {
        backgroundColor: 'gold',
      },
      text: {
        fontSize: 24,
        fontWeight: '600',
      },
    });
    

## API

    
    
    import { BlurView } from 'expo-blur';
    

## Component

### `BlurView`

Android

iOS

tvOS

Web

Type:
`React.[Component](https://react.dev/reference/react/Component)<BlurViewProps>`

BlurViewProps

### `blurReductionFactor`

Android

Optional • Type: `number` • Default: `4`

A number by which the blur intensity will be divided on Android.

When using experimental blur methods on Android, the perceived blur intensity
might differ from iOS at different intensity levels. This property can be used
to fine tune it on Android to match it more closely with iOS.

### `experimentalBlurMethod`

Android

Optional • Type: `ExperimentalBlurMethod` • Default: `'none'`

Blur method to use on Android.

> Currently, `BlurView` support is experimental on Android and may cause
> performance and graphical issues. It can be enabled by setting this
> property.

### `intensity`

Android

iOS

tvOS

Web

Optional • Type: `number` • Default: `50`

A number from `1` to `100` to control the intensity of the blur effect.

You can animate this property using `react-native-reanimated`.

### `tint`

Android

iOS

tvOS

Web

Optional • Type: `BlurTint` • Default: `'default'`

A tint mode which will be applied to the view.

#### Inherited Props

  * `[ViewProps](https://reactnative.dev/docs/view#props)`

## Types

### `BlurTint`

Android

iOS

tvOS

Web

Literal Type: `string`

Acceptable values are: `'light'` | `'dark'` | `'default'` | `'extraLight'` | `'regular'` | `'prominent'` | `'systemUltraThinMaterial'` | `'systemThinMaterial'` | `'systemMaterial'` | `'systemThickMaterial'` | `'systemChromeMaterial'` | `'systemUltraThinMaterialLight'` | `'systemThinMaterialLight'` | `'systemMaterialLight'` | `'systemThickMaterialLight'` | `'systemChromeMaterialLight'` | `'systemUltraThinMaterialDark'` | `'systemThinMaterialDark'` | `'systemMaterialDark'` | `'systemThickMaterialDark'` | `'systemChromeMaterialDark'`

### `ExperimentalBlurMethod`

Android

Literal Type: `string`

Blur method to use on Android.

  * `'none'` \- Falls back to a semi-transparent view instead of rendering a blur effect.

  * `'dimezisBlurView'` \- Uses a native blur view implementation based on [BlurView](https://github.com/Dimezis/BlurView) library. This method may lead to decreased performance.

Acceptable values are: `'none'` | `'dimezisBlurView'`

## Using `borderRadius` with `BlurView`

When using `BlurView` on Android and iOS, the `borderRadius` property is not
applied when provided explicitly. To fix this, you can use the `overflow:
'hidden'` style since `BlurView` inherits props from `<View>`. See
[Usage](/versions/latest/sdk/blur-view#usage) for an example.

