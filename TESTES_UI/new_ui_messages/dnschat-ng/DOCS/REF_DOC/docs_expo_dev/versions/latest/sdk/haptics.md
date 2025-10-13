# ![Expo Haptics icon](/static/images/packages/expo-haptics.png)Expo Haptics

[GitHub](https://github.com/expo/expo/tree/sdk-54/packages/expo-
haptics)[Changelog](https://github.com/expo/expo/tree/sdk-54/packages/expo-
haptics/CHANGELOG.md)[npm](https://www.npmjs.com/package/expo-haptics)

Ask AI

A library that provides access to the system's vibration effects on Android,
the haptics engine on iOS, and the Web Vibration API on web.

[GitHub](https://github.com/expo/expo/tree/sdk-54/packages/expo-
haptics)[Changelog](https://github.com/expo/expo/tree/sdk-54/packages/expo-
haptics/CHANGELOG.md)[npm](https://www.npmjs.com/package/expo-haptics)

Ask AI

Android

iOS

Web

Bundled version:

~15.0.7

Copy

* * *

`expo-haptics` provides haptic (touch) feedback for:

  * Android devices using Vibrator system service.
  * iOS 10+ devices using the Taptic Engine.
  * Web platforms using the Web Vibration API.

On iOS, the Taptic engine will do nothing if any of the following conditions
are true on a user's device:

  * Low Power Mode is enabled. This can be detected with [`expo-battery`](/versions/latest/sdk/battery).
  * User disabled the Taptic Engine in settings.
  * iOS Camera is active (to prevent destabilization).
  * iOS dictation is active (to not disturb the microphone input).

On web, the library uses the Web Vibration API. Note the following:

  * The API must be supported by the browser (check [browser compatibility](https://caniuse.com/vibration))
  * The device must have vibration hardware
  * The user must grant permission to use vibration (usually automatic)
  * Some browsers may ignore vibration in certain contexts (for example, background tabs)

## Installation

Terminal

Copy

`- ``npx expo install expo-haptics`

If you are installing this in an [existing React Native app](/bare/overview),
make sure to [install `expo`](/bare/installing-expo-modules) in your project.

## Configuration

On Android, this library requires permission to control vibration on the
device. The `VIBRATE` permission is added automatically.

## Usage

Haptics usage

Copy

Open in Snack

    
    
    import { StyleSheet, View, Text, Button } from 'react-native';
    import * as Haptics from 'expo-haptics';
    
    export default function App() {
      return (
        <View style={styles.container}>
          <Text style={styles.text}>Haptics.selectionAsync</Text>
          <View style={styles.buttonContainer}>
            <Button title="Selection" onPress={() => Haptics.selectionAsync()} />
          </View>
          <Text style={styles.text}>Haptics.notificationAsync</Text>
          <View style={styles.buttonContainer}>
            <Button
              title="Success"
              onPress={
                () =>
                  Haptics.notificationAsync(
                    Haptics.NotificationFeedbackType.Success
                  )
              }
            />
            <Button
              title="Error"
              onPress={
                () =>
                  Haptics.notificationAsync(
                    Haptics.NotificationFeedbackType.Error
                  )
              }
            />
            <Button
              title="Warning"
              onPress={
                () =>
                  Haptics.notificationAsync(
                    Haptics.NotificationFeedbackType.Warning
                  )
              }
            />
          </View>
          <Text style={styles.text}>Haptics.impactAsync</Text>
          <View style={styles.buttonContainer}>
            <Button
              title="Light"
              onPress={
                () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
              }
            />
            <Button
              title="Medium"
              onPress={
                () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
              }
            />
            <Button
              title="Heavy"
              onPress={
                () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
              }
            />
            <Button
              title="Rigid"
              onPress={
                () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid)
              }
            />
            <Button
              title="Soft"
              onPress={
                () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft)
              }
            />
          </View>
        </View>
      );
    }
    
    const styles = StyleSheet.create({
      container: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 16,
      },
      buttonContainer: {
        flexDirection: 'row',
        alignItems: 'stretch',
        marginTop: 10,
        marginBottom: 30,
        justifyContent: 'space-between',
      },
    });
    

## API

    
    
    import * as Haptics from 'expo-haptics';
    

## Methods

### `Haptics.impactAsync(style)`

Android

iOS

Web

Parameter| Type| Description  
---|---|---  
style(optional)| `ImpactFeedbackStyle`| A collision indicator that on Android
is simulated using
[`Vibrator`](https://developer.android.com/reference/android/os/Vibrator) and
on iOS, it is directly mapped to
[`UIImpactFeedbackStyle`](https://developer.apple.com/documentation/uikit/uiimpactfeedbackgenerator/feedbackstyle).
You can use one of `Haptics.ImpactFeedbackStyle.{Light, Medium, Heavy, Rigid,
Soft}`.Default:`ImpactFeedbackStyle.Medium`  
  
  

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<void>`

A `Promise` which fulfills once native size haptics functionality is
triggered.

> See: Android's `Vibrator` API is not recommended for implementing haptics
> feedback. Instead, you should use `performAndroidHapticsAsync`, which is
> similar to iOS haptic feedback and does not require `VIBRATE` permission.

### `Haptics.notificationAsync(type)`

Android

iOS

Web

Parameter| Type| Description  
---|---|---  
type(optional)| `NotificationFeedbackType`| A notification feedback type that
on Android is simulated using
[`Vibrator`](https://developer.android.com/reference/android/os/Vibrator) and
iOS is directly mapped to
[`UINotificationFeedbackType`](https://developer.apple.com/documentation/uikit/uinotificationfeedbacktype).
You can use one of `Haptics.NotificationFeedbackType.{Success, Warning,
Error}`.Default:`NotificationFeedbackType.Success`  
  
  

The kind of notification response used in the feedback.

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<void>`

A `Promise` which fulfills once native size haptics functionality is
triggered.

### `Haptics.performAndroidHapticsAsync(type)`

Android

Parameter| Type  
---|---  
type| `AndroidHaptics`  
  
  

Use the device haptics engine to provide physical feedback to the user.

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<void>`

### `Haptics.selectionAsync()`

Android

iOS

Web

Used to let a user know when a selection change has been registered.

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<void>`

A `Promise` which fulfills once native size haptics functionality is
triggered.

## Enums

### `AndroidHaptics`

Android

#### `Clock_Tick`

`AndroidHaptics.Clock_Tick ＝ "clock-tick"`

The user has pressed either an hour or minute tick of a Clock.

#### `Confirm`

`AndroidHaptics.Confirm ＝ "confirm"`

A haptic effect to signal the confirmation or successful completion of a user
interaction.

#### `Context_Click`

`AndroidHaptics.Context_Click ＝ "context-click"`

The user has performed a context click on an object.

#### `Drag_Start`

`AndroidHaptics.Drag_Start ＝ "drag-start"`

The user has started a drag-and-drop gesture. The drag target has just been
"picked up".

#### `Gesture_End`

`AndroidHaptics.Gesture_End ＝ "gesture-end"`

The user has finished a gesture (for example, on the soft keyboard).

#### `Gesture_Start`

`AndroidHaptics.Gesture_Start ＝ "gesture-start"`

The user has started a gesture (for example, on the soft keyboard).

#### `Keyboard_Press`

`AndroidHaptics.Keyboard_Press ＝ "keyboard-press"`

The user has pressed a virtual or software keyboard key.

#### `Keyboard_Release`

`AndroidHaptics.Keyboard_Release ＝ "keyboard-release"`

The user has released a virtual keyboard key.

#### `Keyboard_Tap`

`AndroidHaptics.Keyboard_Tap ＝ "keyboard-tap"`

The user has pressed a soft keyboard key.

#### `Long_Press`

`AndroidHaptics.Long_Press ＝ "long-press"`

The user has performed a long press on an object that results in an action
being performed.

#### `No_Haptics`

`AndroidHaptics.No_Haptics ＝ "no-haptics"`

No haptic feedback should be performed.

#### `Reject`

`AndroidHaptics.Reject ＝ "reject"`

A haptic effect to signal the rejection or failure of a user interaction.

#### `Segment_Frequent_Tick`

`AndroidHaptics.Segment_Frequent_Tick ＝ "segment-frequent-tick"`

The user is switching between a series of many potential choices. For example,
minutes on a clock face or individual percentages. This constant is expected
to be very soft, so as not to be uncomfortable when performed a lot in quick
succession. If the device can't make a suitably soft vibration, then it may
not make any vibration.

#### `Segment_Tick`

`AndroidHaptics.Segment_Tick ＝ "segment-tick"`

The user is switching between a series of potential choices. For example,
items in a list or discrete points on a slider.

#### `Text_Handle_Move`

`AndroidHaptics.Text_Handle_Move ＝ "text-handle-move"`

The user has performed a selection/insertion handle move on text field.

#### `Toggle_Off`

`AndroidHaptics.Toggle_Off ＝ "toggle-off"`

The user has toggled a switch or button into the off position.

#### `Toggle_On`

`AndroidHaptics.Toggle_On ＝ "toggle-on"`

The user has toggled a switch or button into the on position.

#### `Virtual_Key`

`AndroidHaptics.Virtual_Key ＝ "virtual-key"`

The user has pressed on a virtual on-screen key.

#### `Virtual_Key_Release`

`AndroidHaptics.Virtual_Key_Release ＝ "virtual-key-release"`

The user has released a virtual key.

### `ImpactFeedbackStyle`

Android

iOS

Web

The mass of the objects in the collision simulated by a
`UIImpactFeedbackGenerator` object
[`UINotificationFeedbackStyle`](https://developer.apple.com/documentation/uikit/uiimpactfeedbackgenerator/feedbackstyle).

#### `Heavy`

`ImpactFeedbackStyle.Heavy ＝ "heavy"`

A collision between large, heavy user interface elements.

#### `Light`

`ImpactFeedbackStyle.Light ＝ "light"`

A collision between small, light user interface elements.

#### `Medium`

`ImpactFeedbackStyle.Medium ＝ "medium"`

A collision between moderately sized user interface elements.

#### `Rigid`

`ImpactFeedbackStyle.Rigid ＝ "rigid"`

A collision between user interface elements that are rigid, exhibiting a small
amount of compression or elasticity.

#### `Soft`

`ImpactFeedbackStyle.Soft ＝ "soft"`

A collision between user interface elements that are soft, exhibiting a large
amount of compression or elasticity.

### `NotificationFeedbackType`

Android

iOS

Web

The type of notification feedback generated by a
`UINotificationFeedbackGenerator` object.
[`UINotificationFeedbackType`](https://developer.apple.com/documentation/uikit/uinotificationfeedbackgenerator/feedbacktype).

#### `Error`

`NotificationFeedbackType.Error ＝ "error"`

A notification feedback type indicating that a task has failed.

#### `Success`

`NotificationFeedbackType.Success ＝ "success"`

A notification feedback type indicating that a task has completed
successfully.

#### `Warning`

`NotificationFeedbackType.Warning ＝ "warning"`

A notification feedback type indicating that a task has produced a warning.

