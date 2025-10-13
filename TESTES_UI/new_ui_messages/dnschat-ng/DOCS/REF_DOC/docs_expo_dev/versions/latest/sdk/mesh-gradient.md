# ![Expo MeshGradient icon](/static/images/packages/expo-mesh-
gradient.png)Expo MeshGradient

[GitHub](https://github.com/expo/expo/tree/sdk-54/packages/expo-mesh-
gradient)[Changelog](https://github.com/expo/expo/tree/sdk-54/packages/expo-
mesh-gradient/CHANGELOG.md)[npm](https://www.npmjs.com/package/expo-mesh-
gradient)

Ask AI

A module that exposes MeshGradient view from SwiftUI to React Native.

[GitHub](https://github.com/expo/expo/tree/sdk-54/packages/expo-mesh-
gradient)[Changelog](https://github.com/expo/expo/tree/sdk-54/packages/expo-
mesh-gradient/CHANGELOG.md)[npm](https://www.npmjs.com/package/expo-mesh-
gradient)

Ask AI

iOS

tvOS

Bundled version:

~0.4.7

Copy

* * *

## Installation

Terminal

Copy

`- ``npx expo install expo-mesh-gradient`

If you are installing this in an [existing React Native app](/bare/overview),
make sure to [install `expo`](/bare/installing-expo-modules) in your project.

## API

    
    
    import { MeshGradientView } from 'expo-mesh-gradient';
    
    function App() {
      return (
        <MeshGradientView
          style={{ flex: 1 }}
          columns={3}
          rows={3}
          colors={['red', 'purple', 'indigo', 'orange', 'white', 'blue', 'yellow', 'green', 'cyan']}
          points={[
            [0.0, 0.0],
            [0.5, 0.0],
            [1.0, 0.0],
            [0.0, 0.5],
            [0.5, 0.5],
            [1.0, 0.5],
            [0.0, 1.0],
            [0.5, 1.0],
            [1.0, 1.0],
          ]}
        />
      );
    }
    

## Component

### `MeshGradientView`

iOS

tvOS

Type:
`React.[Element](https://www.typescriptlang.org/docs/handbook/jsx.html#function-
component)<MeshGradientViewProps>`

MeshGradientViewProps

### `colors`

iOS

tvOS

Optional • Type: `[ColorValue[]](https://reactnative.dev/docs/colors)` •
Default: `[]`

An array of colors. Must contain `columns * rows` elements.

### `columns`

iOS

tvOS

Optional • Type: `number` • Default: `0`

Width of the mesh, i.e. the number of vertices per row.

### `ignoresSafeArea`

iOS

Optional • Type: `boolean` • Default: `true`

Whether to ignore safe areas when positioning the view.

### `mask`

iOS

Optional • Type: `boolean` • Default: `false`

Masks the gradient using the alpha channel of the given children views.

> Note: When this option is enabled, all user interactions (gestures) on
> children views are ignored.

### `points`

iOS

tvOS

Optional • Type: `number[][]` • Default: `[]`

An array of two-dimensional points on the mesh. Must contain `columns * rows`
elements.

### `resolution`

Android

Optional • Type: `{  x: number,  y: number }`

Specifies how many points to sample on the path between points.

### `rows`

iOS

tvOS

Optional • Type: `number` • Default: `0`

Height of the mesh, i.e. the number of vertices per column.

### `smoothsColors`

iOS

tvOS

Optional • Type: `boolean` • Default: `true`

Whether cubic (smooth) interpolation should be used for the colors in the mesh
rather than only for the shape of the mesh.

#### Inherited Props

  * `[ViewProps](https://reactnative.dev/docs/view#props)`

