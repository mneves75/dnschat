# SwiftUI

[GitHub](https://github.com/expo/expo/tree/main/packages/expo-
ui)[Changelog](https://github.com/expo/expo/tree/main/packages/expo-
ui/CHANGELOG.md)[npm](https://www.npmjs.com/package/@expo/ui)

Ask AI

SwiftUI components for building native iOS interfaces with @expo/ui.

[GitHub](https://github.com/expo/expo/tree/main/packages/expo-
ui)[Changelog](https://github.com/expo/expo/tree/main/packages/expo-
ui/CHANGELOG.md)[npm](https://www.npmjs.com/package/@expo/ui)

Ask AI

iOS

tvOS

Bundled version:

~0.2.0-beta.6

Copy

* * *

> This library is currently in beta and subject to breaking changes. It is not
> available in the Expo Go app — use [development
> builds](/develop/development-builds/introduction) to try it out.

The SwiftUI components in `@expo/ui/swift-ui` allow you to build fully native
iOS interfaces using SwiftUI from React Native.

[Expo UI guide for Swift UILearn about the basics of `@expo/ui/swift-
ui`](/guides/expo-ui-swift-ui)

## Installation

Terminal

Copy

`- ``npx expo install @expo/ui`

If you are installing this in an [existing React Native app](/bare/overview),
make sure to [install `expo`](/bare/installing-expo-modules) in your project.

## Components

### BottomSheet

iOS

Code

![BottomSheet component on iOS.](/static/images/expo-ui/bottomsheet/ios.png)

    
    
    import { BottomSheet, Host, Text } from '@expo/ui/swift-ui';
    import { useWindowDimensions } from 'react-native';
    
    const { width } = useWindowDimensions();
    
    <Host style={{ position: 'absolute', width }}>
      <BottomSheet isOpened={isOpened} onIsOpenedChange={e => setIsOpened(e)}>
        <Text>Hello, world!</Text>
      </BottomSheet>
    </Host>
    

_See also:[official SwiftUI
documentation](https://developer.apple.com/documentation/swiftui/view/sheet\(ispresented:ondismiss:content:\))_

### Button

> The borderless variant is not available on Apple TV.

iOS

Code

![Button component on iOS.](/static/images/expo-ui/button/ios.png)

    
    
    import { Button, Host } from '@expo/ui/swift-ui';
    
    <Host style={{ flex: 1 }}>
      <Button
        variant="default"
        onPress={() => {
          setEditingProfile(true);
        }}>
        Edit profile
      </Button>
    </Host>
    

_See also:[official SwiftUI
documentation](https://developer.apple.com/documentation/swiftui/button)_

### CircularProgress

iOS

Code

![CircularProgress component on iOS.](/static/images/expo-
ui/circularprogress/ios.png)

    
    
    import { CircularProgress, Host } from '@expo/ui/swift-ui';
    
    <Host style={{ width: 300 }}>
      <CircularProgress progress={0.5} color="blue" />
    </Host>
    

_See also:[official SwiftUI
documentation](https://developer.apple.com/documentation/swiftui/progressview)_

### ColorPicker

> This component is not available on Apple TV.

iOS

Code

![ColorPicker component on iOS.](/static/images/expo-ui/colorpicker/ios.png)

    
    
    import { ColorPicker, Host } from '@expo/ui/swift-ui';
    
    <Host style={{ width: 400, height: 200 }}>
      <ColorPicker
        label="Select a color"
        selection={color}
        onValueChanged={setColor}
      />
    </Host>
    

_See also:[official SwiftUI
documentation](https://developer.apple.com/documentation/swiftui/colorpicker)_

### ContextMenu

> Note: Also known as DropdownMenu.

iOS

Code

![ContextMenu component on iOS.](/static/images/expo-ui/contextMenu/ios.png)

    
    
    import { ContextMenu, Host } from '@expo/ui/swift-ui';
    
    <Host style={{ width: 150, height: 50 }}>
      <ContextMenu>
        <ContextMenu.Items>
          <Button
            systemImage="person.crop.circle.badge.xmark"
            onPress={() => console.log('Pressed1')}>
            Hello
          </Button>
          <Button
            variant="bordered"
            systemImage="heart"
            onPress={() => console.log('Pressed2')}>
            Love it
          </Button>
          <Picker
            label="Doggos"
            options={['very', 'veery', 'veeery', 'much']}
            variant="menu"
            selectedIndex={selectedIndex}
            onOptionSelected={({ nativeEvent: { index } }) => setSelectedIndex(index)}
          />
        </ContextMenu.Items>
        <ContextMenu.Trigger>
          <Button variant="bordered">
            Show Menu
          </Button>
        </ContextMenu.Trigger>
      </ContextMenu>
    </Host>
    

_See also:[official SwiftUI
documentation](https://developer.apple.com/documentation/swiftui/view/contextmenu\(menuitems:\))_

### DateTimePicker (date)

> This component is not available on Apple TV.

iOS

Code

![DateTimePicker \(date\) component on iOS.](/static/images/expo-
ui/datetimepicker/date/ios.png)

    
    
    import { DateTimePicker, Host } from '@expo/ui/swift-ui';
    
    <Host matchContents>
      <DateTimePicker
        onDateSelected={date => {
          setSelectedDate(date);
        }}
        displayedComponents='date'
        initialDate={selectedDate.toISOString()}
        variant='wheel'
      />
    </Host>
    

_See also:[official SwiftUI
documentation](https://developer.apple.com/documentation/swiftui/datepicker)_

### DateTimePicker (time)

> This component is not available on Apple TV.

iOS

Code

![DateTimePicker \(time\) component on iOS.](/static/images/expo-
ui/datetimepicker/time/ios.png)

    
    
    import { DateTimePicker, Host } from '@expo/ui/swift-ui';
    
    <Host matchContents>
      <DateTimePicker
        onDateSelected={date => {
          setSelectedDate(date);
        }}
        displayedComponents='hourAndMinute'
        initialDate={selectedDate.toISOString()}
        variant='wheel'
      />
    </Host>
    

_See also:[official SwiftUI
documentation](https://developer.apple.com/documentation/swiftui/datepicker)_

### Gauge

> This component is not available on Apple TV.

iOS

Code

![Gauge component on iOS.](/static/images/expo-ui/gauge/ios.png)

    
    
    import { Gauge, Host } from "@expo/ui/swift-ui";
    
    <Host matchContents>
      <Gauge
        max={{ value: 1, label: '1' }}
        min={{ value: 0, label: '0' }}
        current={{ value: 0.5 }}
        color={[
          PlatformColor('systemRed'),
          PlatformColor('systemOrange'),
          PlatformColor('systemYellow'),
          PlatformColor('systemGreen'),
        ]}
        type="circularCapacity"
      />
    </Host>
    

_See also:[official SwiftUI
documentation](https://developer.apple.com/documentation/swiftui/gauge)_

### Host

A component that allows you to put the other `@expo/ui/swift-ui` components in
React Native. It acts like [`<svg>`](https://developer.mozilla.org/en-
US/docs/Web/SVG/Reference/Element/svg) for DOM,
[`<Canvas>`](https://shopify.github.io/react-native-
skia/docs/canvas/overview/) for [`react-native-
skia`](https://shopify.github.io/react-native-skia/), which underlying uses
[`UIHostingController`](https://developer.apple.com/documentation/swiftui/uihostingcontroller)
to render the SwiftUI views in UIKit.

Since the `Host` component is a React Native
[`View`](https://reactnative.dev/docs/view), you can pass the
[`style`](https://reactnative.dev/docs/style) prop to it or `matchContents`
prop to make the `Host` component match the contents' size.

Wrapping Button in Host

Copy

    
    
    import { Button, Host } from '@expo/ui/swift-ui';
    
    function Example() {
      return (
        <Host matchContents>
          <Button
            onPress={() => {
              console.log('Pressed');
            }}>
            Click
          </Button>
        </Host>
      );
    }
    

Host with flexbox and VStack

Copy

    
    
    import { Button, Host, VStack, Text } from '@expo/ui/swift-ui';
    
    function Example() {
      return (
        <Host style={{ flex: 1 }}>
          <VStack spacing={8}>
            <Text>Hello, world!</Text>
            <Button
              onPress={() => {
                console.log('Pressed');
              }}>
              Click
            </Button>
          </VStack>
        </Host>
      );
    }
    

### LinearProgress

iOS

Code

![LinearProgress component on iOS.](/static/images/expo-
ui/linearprogress/ios.png)

    
    
    import { LinearProgress, Host } from '@expo/ui/swift-ui';
    
    <Host style={{ width: 300 }}>
      <LinearProgress progress={0.5} color="red" />
    </Host>
    

_See also:[official SwiftUI
documentation](https://developer.apple.com/documentation/swiftui/progressview)_

### List

iOS

Code

![List component on iOS.](/static/images/expo-ui/list/ios.png)

    
    
    import { Host, List } from '@expo/ui/swift-ui';
    
    <Host style={{ flex: 1 }}>
      <List
        scrollEnabled={false}
        editModeEnabled={editModeEnabled}
        onSelectionChange={(items) => alert(`indexes of selected items: ${items.join(', ')}`)}
        moveEnabled={moveEnabled}
        onMoveItem={(from, to) => alert(`moved item at index ${from} to index ${to}`)}
        onDeleteItem={(item) => alert(`deleted item at index: ${item}`)}
        listStyle='automatic'
        deleteEnabled={deleteEnabled}
        selectEnabled={selectEnabled}>
        {data.map((item, index) => (
          <LabelPrimitive key={index} title={item.text} systemImage={item.systemImage} color={color} />
        ))}
      </List>
    </Host>
    

_See also:[official SwiftUI
documentation](https://developer.apple.com/documentation/swiftui/list)_

### Picker (segmented)

iOS

Code

![Picker component on iOS.](/static/images/expo-ui/segmentedPicker/ios.png)

    
    
    import { Host, Picker } from '@expo/ui/swift-ui';
    
    <Host matchContents>
      <Picker
        options={['$', '$$', '$$$', '$$$$']}
        selectedIndex={selectedIndex}
        onOptionSelected={({ nativeEvent: { index } }) => {
          setSelectedIndex(index);
        }}
        variant="segmented"
      />
    </Host>
    

_See also:[official SwiftUI
documentation](https://developer.apple.com/documentation/swiftui/picker#Styling-
pickers)_

### Picker (wheel)

> The wheel variant is not available on Apple TV.

iOS

Code

![Picker component on iOS.](/static/images/expo-ui/menuPicker/ios.png)

    
    
    import { Host, Picker } from '@expo/ui/swift-ui';
    
    <Host style={{ height: 100 }}>
      <Picker
        options={['$', '$$', '$$$', '$$$$']}
        selectedIndex={selectedIndex}
        onOptionSelected={({ nativeEvent: { index } }) => {
          setSelectedIndex(index);
        }}
        variant="wheel"
      />
    </Host>
    

_See also:[official SwiftUI
documentation](https://developer.apple.com/documentation/swiftui/pickerstyle/wheel)_

### Slider

> This component is not available on Apple TV.

iOS

Code

![Slider component on iOS.](/static/images/expo-ui/slider/ios.png)

    
    
    import { Host, Slider } from '@expo/ui/swift-ui';
    
    <Host style={{ minHeight: 60 }}>
      <Slider
        value={value}
        onValueChange={(value) => {
          setValue(value);
        }}
      />
    </Host>
    

_See also:[official SwiftUI
documentation](https://developer.apple.com/documentation/swiftui/slider)_

### Switch (toggle)

> Note: Also known as Toggle.

iOS

Code

![Switch component on iOS.](/static/images/expo-ui/switch/ios.png)

    
    
    import { Host, Switch } from '@expo/ui/swift-ui';
    
    <Host matchContents>
      <Switch
        checked={checked}
        onValueChange={checked => {
          setChecked(checked);
        }}
        color="#ff0000"
        label="Play music"
        variant="switch"
      />
    </Host>
    

_See also:[official SwiftUI
documentation](https://developer.apple.com/documentation/swiftui/toggle)_

### Switch (checkbox)

iOS

Code

![Picker component on iOS.](/static/images/expo-ui/checkbox/ios.png)

    
    
    import { Host, Switch } from '@expo/ui/swift-ui';
    
    <Host matchContents>
      <Switch
        checked={checked}
        onValueChange={checked => {
          setChecked(checked);
        }}
        label="Play music"
        variant="checkbox"
      />
    </Host>
    

_See also:[official SwiftUI
documentation](https://developer.apple.com/documentation/swiftui/toggle)_

### TextField

iOS

Code

![TextField component on iOS.](/static/images/expo-ui/textinput/ios.png)

    
    
    import { Host, TextField } from '@expo/ui/swift-ui';
    
    <Host matchContents>
      <TextField autocorrection={false} defaultValue="A single line text input" onChangeText={setValue} />
    </Host>
    

_See also:[official SwiftUI
documentation](https://developer.apple.com/documentation/swiftui/textfield)_

### More

Expo UI is still in active development. We continue to add more functionality
and may change the API. Some examples in the docs may not be up to date. If
you want to see the latest changes, check the
[examples](https://github.com/expo/expo/tree/main/apps/native-component-
list/src/screens/UI).

## API

Full documentation is not yet available. Use TypeScript types to explore the
API.

    
    
    // Import from the SwiftUI package
    import { BottomSheet } from '@expo/ui/swift-ui';
    

