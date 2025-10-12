# Jetpack Compose

[GitHub](https://github.com/expo/expo/tree/main/packages/expo-
ui)[Changelog](https://github.com/expo/expo/tree/main/packages/expo-
ui/CHANGELOG.md)[npm](https://www.npmjs.com/package/@expo/ui)

Ask AI

Jetpack Compose components for building native Android interfaces with
@expo/ui.

[GitHub](https://github.com/expo/expo/tree/main/packages/expo-
ui)[Changelog](https://github.com/expo/expo/tree/main/packages/expo-
ui/CHANGELOG.md)[npm](https://www.npmjs.com/package/@expo/ui)

Ask AI

Android

Bundled version:

~0.2.0-beta.6

Copy

* * *

> This library is currently in alpha and will frequently experience breaking
> changes. It is not available in the Expo Go app — use [development
> builds](/develop/development-builds/introduction) to try it out.

The Jetpack Compose components in `@expo/ui/jetpack-compose` allow you to
build fully native Android interfaces using Jetpack Compose from React Native.

## Installation

Terminal

Copy

`- ``npx expo install @expo/ui`

If you are installing this in an [existing React Native app](/bare/overview),
make sure to [install `expo`](/bare/installing-expo-modules) in your project.

## Components

### Button

Android

Code

![Button component on Android.](/static/images/expo-ui/button/android.png)

    
    
    import { Button } from '@expo/ui/jetpack-compose';
    
    <Button
      style={{ flex: 1 }}
      variant="default"
      onPress={() => {
        setEditingProfile(true);
      }}>
      Edit profile
    </Button>
    

_See also:[official Jetpack Compose
documentation](https://developer.android.com/develop/ui/compose/components/button)_

### CircularProgress

Android

Code

![CircularProgress component on Android.](/static/images/expo-
ui/circularprogress/android.png)

    
    
    import { CircularProgress } from '@expo/ui/jetpack-compose';
    
    <CircularProgress progress={0.5} style={{ width: 300 }} color="blue" elementColors={{ trackColor: '#cccccc' }} />
    

_See also:[official Jetpack Compose
documentation](https://developer.android.com/develop/ui/compose/components/progress)_

### ContextMenu

> Note: Also known as DropdownMenu.

Android

Code

![ContextMenu component on Android.](/static/images/expo-
ui/contextMenu/android.png)

    
    
    import { ContextMenu } from '@expo/ui/jetpack-compose';
    
    <ContextMenu style={{ width: 150, height: 50 }}>
      <ContextMenu.Items>
        <Button
          elementColors={{ containerColor: '#0000ff', contentColor: '#00ff00' }}
          onPress={() => console.log('Pressed1')}>
          Hello
        </Button>
        <Button
          variant="bordered"
          color="#ff0000"
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
        <Button variant="bordered" style={{ width: 150, height: 50 }}>
          Show Menu
        </Button>
      </ContextMenu.Trigger>
    </ContextMenu>
    

_See also:[official Jetpack Compose
documentation](https://developer.android.com/develop/ui/compose/components/menu)_

### Chip

Android

Code

![Chip component on Android.](/static/images/expo-ui/chip/android.png)

    
    
    import { Chip } from '@expo/ui/jetpack-compose';
    
    // Assist chip with icon
    <Chip
      variant="assist"
      label="Book"
      leadingIcon="filled.Add"
      onPress={() => console.log('Opening flight booking...')}
    />
    
    // Filter chip with selection
    <Chip
      variant="filter"
      label="Images"
      leadingIcon="filled.Star"
      selected={selectedFilters.includes('Images')}
      onPress={() => handleFilterToggle('Images')}
    />
    
    // Input chip with dismiss
    <Chip
      variant="input"
      label="Work"
      leadingIcon="filled.Create"
      onDismiss={() => handleInputDismiss('Work')}
    />
    
    // Suggestion chip
    <Chip
      variant="suggestion"
      label="Nearby"
      leadingIcon="filled.LocationOn"
      onPress={() => console.log('Searching nearby...')}
    />
    

_See also:[official Jetpack Compose
documentation](https://developer.android.com/develop/ui/compose/components/chip)_

### DateTimePicker (date)

Android

Code

![DateTimePicker component on Android.](/static/images/expo-
ui/datetimepicker/date/android.png)

    
    
    import { DateTimePicker } from '@expo/ui/jetpack-compose';
    
    <DateTimePicker
      onDateSelected={date => {
        setSelectedDate(date);
      }}
      displayedComponents='date'
      initialDate={selectedDate.toISOString()}
      variant='picker'
    />
    

_See also:[official Jetpack Compose
documentation](https://developer.android.com/develop/ui/compose/components/datepickers)_

### DateTimePicker (time)

Android

Code

![DateTimePicker \(time\) component on Android.](/static/images/expo-
ui/datetimepicker/time/android.png)

    
    
    import { DateTimePicker } from '@expo/ui/jetpack-compose';
    
    <DateTimePicker
      onDateSelected={date => {
        setSelectedDate(date);
      }}
      displayedComponents='hourAndMinute'
      initialDate={selectedDate.toISOString()}
      variant='picker'
    />
    

_See also:[official Jetpack Compose
documentation](https://developer.android.com/develop/ui/compose/components/time-
pickers)_

### LinearProgress

Android

Code

![LinearProgress component on Android.](/static/images/expo-
ui/linearprogress/android.png)

    
    
    import { LinearProgress } from '@expo/ui/jetpack-compose';
    
    <LinearProgress progress={0.5} style={{ width: 300 }} color="red" />
    

_See also:[official Jetpack Compose
documentation](https://developer.android.com/develop/ui/compose/components/progress)_

### Picker (radio)

Android

Code

![Picker component \(radio\) on Android.](/static/images/expo-
ui/radioPicker/android.png)

    
    
    import { Picker } from '@expo/ui/jetpack-compose';
    
    <Picker
      options={['$', '$$', '$$$', '$$$$']}
      selectedIndex={selectedIndex}
      onOptionSelected={({ nativeEvent: { index } }) => {
        setSelectedIndex(index);
      }}
      variant="radio"
    />
    

_See also:[official Jetpack Compose
documentation](https://developer.android.com/develop/ui/compose/components/radio-
button)_

### Picker (segmented)

Android

Code

![Picker component on Android.](/static/images/expo-
ui/segmentedPicker/android.png)

    
    
    import { Picker } from '@expo/ui/jetpack-compose';
    
    <Picker
      options={['$', '$$', '$$$', '$$$$']}
      selectedIndex={selectedIndex}
      onOptionSelected={({ nativeEvent: { index } }) => {
        setSelectedIndex(index);
      }}
      variant="segmented"
    />
    

_See also:[official Jetpack Compose
documentation](https://developer.android.com/develop/ui/compose/components/segmented-
button)_

### Slider

Android

Code

![Slider component on Android.](/static/images/expo-ui/slider/android.png)

    
    
    import { Slider } from '@expo/ui/jetpack-compose';
    
    <Slider
      style={{ minHeight: 60 }}
      value={value}
      onValueChange={(value) => {
        setValue(value);
      }}
    />
    

_See also:[official Jetpack Compose
documentation](https://developer.android.com/develop/ui/compose/components/slider)_

### Switch (toggle)

> Note: also known as Toggle.

Android

Code

![Switch component on Android.](/static/images/expo-ui/switch/android.png)

    
    
    import { Switch } from '@expo/ui/jetpack-compose';
    
    <Switch
      value={checked}
      onValueChange={checked => {
        setChecked(checked);
      }}
      color="#ff0000"
      label="Play music"
      variant="switch"
    />
    

_See also:[official Jetpack Compose
documentation](https://developer.android.com/develop/ui/compose/components/switch)_

### Switch (checkbox)

Android

Code

![Switch \(checkbox variant\) component on Android.](/static/images/expo-
ui/checkbox/android.png)

    
    
    import { Switch } from '@expo/ui/jetpack-compose';
    
    <Switch
      value={checked}
      onValueChange={checked => {
        setChecked(checked);
      }}
      label="Play music"
      color="#ff0000"
      variant="checkbox"
    />
    

_See also:[official Jetpack Compose
documentation](https://developer.android.com/develop/ui/compose/components/checkbox)_

### TextInput

Android

Code

![TextInput component on Android.](/static/images/expo-
ui/textinput/android.png)

    
    
    import { TextInput } from '@expo/ui/jetpack-compose';
    
    <TextInput autocorrection={false} defaultValue="A single line text input" onChangeText={setValue} />
    

_See also:[official Jetpack Compose
documentation](https://developer.android.com/develop/ui/compose/text/user-
input)_

## API

Full documentation is not yet available. Use TypeScript types to explore the
API.

    
    
    // Import from the Jetpack Compose package
    import { Button } from '@expo/ui/jetpack-compose';
    

