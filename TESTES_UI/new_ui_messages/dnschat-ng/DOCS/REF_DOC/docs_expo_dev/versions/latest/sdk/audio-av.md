# ![Expo Audio \(expo-av\) icon](/static/images/packages/expo-av.png)Expo
Audio (expo-av)

[GitHub](https://github.com/expo/expo/tree/sdk-54/packages/expo-
av)[Changelog](https://github.com/expo/expo/tree/sdk-54/packages/expo-
av/CHANGELOG.md)[npm](https://www.npmjs.com/package/expo-av)

Ask AI

A library that provides an API to implement audio playback and recording in
apps.

[GitHub](https://github.com/expo/expo/tree/sdk-54/packages/expo-
av)[Changelog](https://github.com/expo/expo/tree/sdk-54/packages/expo-
av/CHANGELOG.md)[npm](https://www.npmjs.com/package/expo-av)

Ask AI

Android

iOS

tvOS

Web

Bundled version:

~16.0.7

Copy

* * *

> Deprecated: The `Audio` component from `expo-av`, which is documented on
> this page, has now been deprecated and replaced by an improved version in
> `expo-audio`. [Learn about `expo-audio`](/versions/latest/sdk/audio).

`Audio` from `expo-av` allows you to implement audio playback and recording in
your app.

Note that audio automatically stops if headphones/bluetooth audio devices are
disconnected.

See the [playlist example app](https://github.com/expo/playlist-example) for
an example on the media playback API, and the [recording example
app](https://github.com/expo/audio-recording-example) for an example of the
recording API.

## Installation

Terminal

Copy

`- ``npx expo install expo-av`

If you are installing this in an [existing React Native app](/bare/overview),
make sure to [install `expo`](/bare/installing-expo-modules) in your project.

## Usage

### Playing sounds

Playing sounds

Copy

Open in Snack

    
    
    import { useEffect, useState } from 'react';
    import { View, StyleSheet, Button } from 'react-native';
    import { Audio } from 'expo-av';
    
    export default function App() {
      const [sound, setSound] = useState();
    
      async function playSound() {
        console.log('Loading Sound');
        const { sound } = await Audio.Sound.createAsync( require('./assets/Hello.mp3')
        );
        setSound(sound);
    
        console.log('Playing Sound');
        await sound.playAsync();
      }
    
      useEffect(() => {
        return sound
          ? () => {
              console.log('Unloading Sound');
              sound.unloadAsync();
            }
          : undefined;
      }, [sound]);
    
      return (
        <View style={styles.container}>
          <Button title="Play Sound" onPress={playSound} />
        </View>
      );
    }
    
    const styles = StyleSheet.create({
      container: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: '#ecf0f1',
        padding: 10,
      },
    });
    

### Recording sounds

Recording sounds

Copy

Open in Snack

    
    
    import { useState } from 'react';
    import { View, StyleSheet, Button } from 'react-native';
    import { Audio } from 'expo-av';
    
    export default function App() {
      const [recording, setRecording] = useState();
      const [permissionResponse, requestPermission] = Audio.usePermissions();
    
      async function startRecording() {
        try {
          if (permissionResponse.status !== 'granted') {
            console.log('Requesting permission..');
            await requestPermission();
          }
          await Audio.setAudioModeAsync({
            allowsRecordingIOS: true,
            playsInSilentModeIOS: true,
          });
    
          console.log('Starting recording..');
          const { recording } = await Audio.Recording.createAsync( Audio.RecordingOptionsPresets.HIGH_QUALITY
          );
          setRecording(recording);
          console.log('Recording started');
        } catch (err) {
          console.error('Failed to start recording', err);
        }
      }
    
      async function stopRecording() {
        console.log('Stopping recording..');
        setRecording(undefined);
        await recording.stopAndUnloadAsync();
        await Audio.setAudioModeAsync(
          {
            allowsRecordingIOS: false,
          }
        );
        const uri = recording.getURI();
        console.log('Recording stopped and stored at', uri);
      }
    
      return (
        <View style={styles.container}>
          <Button
            title={recording ? 'Stop Recording' : 'Start Recording'}
            onPress={recording ? stopRecording : startRecording}
          />
        </View>
      );
    }
    
    const styles = StyleSheet.create({
      container: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: '#ecf0f1',
        padding: 10,
      },
    });
    

### Playing or recording audio in background

iOS

On iOS, audio playback and recording in background is only available in
standalone apps, and it requires some extra configuration. On iOS, each
background feature requires a special key in `UIBackgroundModes` array in your
Info.plist file. In standalone apps this array is empty by default, so to use
background features you will need to add appropriate keys to your app.json
configuration.

See an example of app.json that enables audio playback in background:

    
    
    {
      "expo": {
        ...
        "ios": {
          ...
          "infoPlist": {
            ...
            "UIBackgroundModes": [
              "audio"
            ]
          }
        }
      }
    }
    

### Notes on web usage

  * A MediaRecorder issue on Chrome produces WebM files missing the duration metadata. [See the open Chromium issue](https://bugs.chromium.org/p/chromium/issues/detail?id=642012).
  * MediaRecorder encoding options and other configurations are inconsistent across browsers, utilizing a Polyfill such as [kbumsik/opus-media-recorder](https://github.com/kbumsik/opus-media-recorder) or [ai/audio-recorder-polyfill](https://github.com/ai/audio-recorder-polyfill) in your application will improve your experience. Any options passed to `prepareToRecordAsync` will be passed directly to the MediaRecorder API and as such the polyfill.
  * Web browsers require sites to be served securely for them to listen to a mic. See [MediaDevices `getUserMedia()` security](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia#security) for more details.

## API

    
    
    import { Audio } from 'expo-av';
    

## Constants

### `Audio.RecordingOptionsPresets`

Android

iOS

tvOS

Web

Type: `Record<string, RecordingOptions>`

Constant which contains definitions of the two preset examples of
`RecordingOptions`, as implemented in the Audio SDK.

#### `HIGH_QUALITY`

    
    
    RecordingOptionsPresets.HIGH_QUALITY = {
      isMeteringEnabled: true,
      android: {
        extension: '.m4a',
        outputFormat: AndroidOutputFormat.MPEG_4,
        audioEncoder: AndroidAudioEncoder.AAC,
        sampleRate: 44100,
        numberOfChannels: 2,
        bitRate: 128000,
      },
      ios: {
        extension: '.m4a',
        outputFormat: IOSOutputFormat.MPEG4AAC,
        audioQuality: IOSAudioQuality.MAX,
        sampleRate: 44100,
        numberOfChannels: 2,
        bitRate: 128000,
        linearPCMBitDepth: 16,
        linearPCMIsBigEndian: false,
        linearPCMIsFloat: false,
      },
      web: {
        mimeType: 'audio/webm',
        bitsPerSecond: 128000,
      },
    };
    

#### `LOW_QUALITY`

    
    
    RecordingOptionsPresets.LOW_QUALITY = {
      isMeteringEnabled: true,
      android: {
        extension: '.3gp',
        outputFormat: AndroidOutputFormat.THREE_GPP,
        audioEncoder: AndroidAudioEncoder.AMR_NB,
        sampleRate: 44100,
        numberOfChannels: 2,
        bitRate: 128000,
      },
      ios: {
        extension: '.caf',
        audioQuality: IOSAudioQuality.MIN,
        sampleRate: 44100,
        numberOfChannels: 2,
        bitRate: 128000,
        linearPCMBitDepth: 16,
        linearPCMIsBigEndian: false,
        linearPCMIsFloat: false,
      },
      web: {
        mimeType: 'audio/webm',
        bitsPerSecond: 128000,
      },
    };
    

## Hooks

### `usePermissions(options)`

Android

iOS

tvOS

Web

Parameter| Type  
---|---  
options(optional)| `PermissionHookOptions<object>`  
  
  

Check or request permissions to record audio. This uses both
`requestPermissionAsync` and `getPermissionsAsync` to interact with the
permissions.

Returns:

`[null | PermissionResponse, RequestPermissionMethod<PermissionResponse>, GetPermissionMethod<PermissionResponse>]`

Example

    
    
    const [permissionResponse, requestPermission] = Audio.usePermissions();
    

## Classes

### `Recording`

Android

iOS

> Warning: Experimental for web.

This class represents an audio recording. After creating an instance of this
class, `prepareToRecordAsync` must be called in order to record audio. Once
recording is finished, call `stopAndUnloadAsync`. Note that only one recorder
is allowed to exist in the state between `prepareToRecordAsync` and
`stopAndUnloadAsync` at any given time.

Note that your experience must request audio recording permissions in order
for recording to function. See the [`Permissions` module](/guides/permissions)
for more details.

Additionally, audio recording is [not supported in the iOS
Simulator](/workflow/ios-simulator#limitations).

Returns

A newly constructed instance of `Audio.Recording`.

Example

    
    
    const recording = new Audio.Recording();
    try {
      await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      await recording.startAsync();
      // You are now recording!
    } catch (error) {
      // An error occurred!
    }
    

Recording Methods

### `createAsync(options, onRecordingStatusUpdate,
progressUpdateIntervalMillis)`

Android

iOS

tvOS

Web

Parameter| Type| Description  
---|---|---  
options(optional)| `RecordingOptions`| Options for the recording, including
sample rate, bitrate, channels, format, encoder, and extension. If no options
are passed to, the recorder will be created with options
`Audio.RecordingOptionsPresets.LOW_QUALITY`. See below for details on
`RecordingOptions`.Default:`RecordingOptionsPresets.LOW_QUALITY`  
onRecordingStatusUpdate(optional)| `null | (status: RecordingStatus) => void`| A function taking a single parameter `status` (a dictionary, described in `getStatusAsync`).Default:`null`  
progressUpdateIntervalMillis(optional)| `null | number`| The interval between calls of `onRecordingStatusUpdate`. This value defaults to 500 milliseconds.Default:`null`  
  
  

Creates and starts a recording using the given options, with optional
`onRecordingStatusUpdate` and `progressUpdateIntervalMillis`.

    
    
    const { recording, status } = await Audio.Recording.createAsync(
      options,
      onRecordingStatusUpdate,
      progressUpdateIntervalMillis
    );
    
    // Which is equivalent to the following:
    const recording = new Audio.Recording();
    await recording.prepareToRecordAsync(options);
    recording.setOnRecordingStatusUpdate(onRecordingStatusUpdate);
    await recording.startAsync();
    

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<RecordingObject>`

A `Promise` that is rejected if creation failed, or fulfilled with the
following dictionary if creation succeeded.

Example

    
    
    try {
      const { recording: recordingObject, status } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      // You are now recording!
    } catch (error) {
      // An error occurred!
    }
    

> Deprecated Use `createNewLoadedSoundAsync()` instead.

### `createNewLoadedSound(initialStatus, onPlaybackStatusUpdate)`

Android

iOS

tvOS

Web

Parameter| Type  
---|---  
initialStatus(optional)|
`[AVPlaybackStatusToSet](/versions/latest/sdk/av#avplaybackstatustoset)`  
onPlaybackStatusUpdate(optional)| `null | (status: [AVPlaybackStatus](/versions/latest/sdk/av#avplaybackstatus)) => void`  
  
  

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<SoundObject>`

### `createNewLoadedSoundAsync(initialStatus, onPlaybackStatusUpdate)`

Android

iOS

tvOS

Web

Parameter| Type| Description  
---|---|---  
initialStatus(optional)|
`[AVPlaybackStatusToSet](/versions/latest/sdk/av#avplaybackstatustoset)`| The
initial intended `PlaybackStatusToSet` of the sound, whose values will
override the default initial playback status. This value defaults to `{}` if
no parameter is passed. See the [AV documentation](/versions/latest/sdk/av)
for details on `PlaybackStatusToSet` and the default initial playback
status.Default:`{}`  
onPlaybackStatusUpdate(optional)| `null | (status: [AVPlaybackStatus](/versions/latest/sdk/av#avplaybackstatus)) => void`| A function taking a single parameter `PlaybackStatus`. This value defaults to `null` if no parameter is passed. See the [AV documentation](/versions/latest/sdk/av) for details on the functionality provided by `onPlaybackStatusUpdate`Default:`null`  
  
  

Creates and loads a new `Sound` object to play back the `Recording`. Note that
this will only succeed once the `Recording` is done recording and
`stopAndUnloadAsync()` has been called.

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<SoundObject>`

A `Promise` that is rejected if creation failed, or fulfilled with the
`SoundObject`.

### `getAvailableInputs()`

Android

iOS

tvOS

Web

Returns a list of available recording inputs. This method can only be called
if the `Recording` has been prepared.

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<RecordingInput[]>`

A `Promise` that is fulfilled with an array of `RecordingInput` objects.

### `getCurrentInput()`

Android

iOS

tvOS

Web

Returns the currently-selected recording input. This method can only be called
if the `Recording` has been prepared.

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<RecordingInput>`

A `Promise` that is fulfilled with a `RecordingInput` object.

### `getStatusAsync()`

Android

iOS

tvOS

Web

Gets the `status` of the `Recording`.

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<RecordingStatus>`

A `Promise` that is resolved with the `RecordingStatus` object.

### `getURI()`

Android

iOS

tvOS

Web

Gets the local URI of the `Recording`. Note that this will only succeed once
the `Recording` is prepared to record. On web, this will not return the URI
until the recording is finished.

Returns:

`null | string`

A `string` with the local URI of the `Recording`, or `null` if the `Recording`
is not prepared to record (or, on Web, if the recording has not finished).

### `pauseAsync()`

Android

iOS

tvOS

Web

Pauses recording. This method can only be called if the `Recording` has been
prepared.

> This is only available on Android API version 24 and later.

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<RecordingStatus>`

A `Promise` that is fulfilled when recording has paused, or rejects if
recording could not be paused. If the Android API version is less than 24, the
`Promise` will reject. The promise is resolved with the `RecordingStatus` of
the recording.

### `prepareToRecordAsync(options)`

Android

iOS

tvOS

Web

Parameter| Type| Description  
---|---|---  
options(optional)| `RecordingOptions`| `RecordingOptions` for the recording,
including sample rate, bitrate, channels, format, encoder, and extension. If
no options are passed to `prepareToRecordAsync()`, the recorder will be
created with options
`Audio.RecordingOptionsPresets.LOW_QUALITY`.Default:`RecordingOptionsPresets.LOW_QUALITY`  
  
  

Loads the recorder into memory and prepares it for recording. This must be
called before calling `startAsync()`. This method can only be called if the
`Recording` instance has never yet been prepared.

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<RecordingStatus>`

A `Promise` that is fulfilled when the recorder is loaded and prepared, or
rejects if this failed. If another `Recording` exists in your experience that
is currently prepared to record, the `Promise` will reject. If the
`RecordingOptions` provided are invalid, the `Promise` will also reject. The
promise is resolved with the `RecordingStatus` of the recording.

### `setInput(inputUid)`

Android

iOS

tvOS

Web

Parameter| Type| Description  
---|---|---  
inputUid| `string`| The uid of a `RecordingInput`.  
  
  

Sets the current recording input.

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<void>`

A `Promise` that is resolved if successful or rejected if not.

### `setOnRecordingStatusUpdate(onRecordingStatusUpdate)`

Android

iOS

tvOS

Web

Parameter| Type| Description  
---|---|---  
onRecordingStatusUpdate| `null | (status: RecordingStatus) => void`| A function taking a single parameter `RecordingStatus`.  
  
  

Sets a function to be called regularly with the `RecordingStatus` of the
`Recording`.

`onRecordingStatusUpdate` will be called when another call to the API for this
recording completes (such as `prepareToRecordAsync()`, `startAsync()`,
`getStatusAsync()`, or `stopAndUnloadAsync()`), and will also be called at
regular intervals while the recording can record. Call
`setProgressUpdateInterval()` to modify the interval with which
`onRecordingStatusUpdate` is called while the recording can record.

Returns:

`void`

### `setProgressUpdateInterval(progressUpdateIntervalMillis)`

Android

iOS

tvOS

Web

Parameter| Type| Description  
---|---|---  
progressUpdateIntervalMillis| `number`| The new interval between calls of
`onRecordingStatusUpdate`.  
  
  

Sets the interval with which `onRecordingStatusUpdate` is called while the
recording can record. See `setOnRecordingStatusUpdate` for details. This value
defaults to 500 milliseconds.

Returns:

`void`

### `startAsync()`

Android

iOS

tvOS

Web

Begins recording. This method can only be called if the `Recording` has been
prepared.

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<RecordingStatus>`

A `Promise` that is fulfilled when recording has begun, or rejects if
recording could not be started. The promise is resolved with the
`RecordingStatus` of the recording.

### `stopAndUnloadAsync()`

Android

iOS

tvOS

Web

Stops the recording and deallocates the recorder from memory. This reverts the
`Recording` instance to an unprepared state, and another `Recording` instance
must be created in order to record again. This method can only be called if
the `Recording` has been prepared.

> On Android this method may fail with `E_AUDIO_NODATA` when called too soon
> after `startAsync` and no audio data has been recorded yet. In that case the
> recorded file will be invalid and should be discarded.

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<RecordingStatus>`

A `Promise` that is fulfilled when recording has stopped, or rejects if
recording could not be stopped. The promise is resolved with the
`RecordingStatus` of the recording.

### `Sound`

Android

iOS

tvOS

Web

Type: Class implements `[Playback](/versions/latest/sdk/av#playback)`

This class represents a sound corresponding to an Asset or URL.

Returns

A newly constructed instance of `Audio.Sound`.

Example

    
    
    const sound = new Audio.Sound();
    try {
      await sound.loadAsync(require('./assets/sounds/hello.mp3'));
      await sound.playAsync();
      // Your sound is playing!
    
      // Don't forget to unload the sound from memory
      // when you are done using the Sound object
      await sound.unloadAsync();
    } catch (error) {
      // An error occurred!
    }
    

> Method not described below and the rest of the API for `Audio.Sound` is the
> same as the imperative playback API for `Video`. See the [AV
> documentation](/versions/latest/sdk/av) for further information.

Sound Methods

> Deprecated Use `Sound.createAsync()` instead

### `create(source, initialStatus, onPlaybackStatusUpdate, downloadFirst)`

Android

iOS

tvOS

Web

Parameter| Type  
---|---  
source| `[AVPlaybackSource](/versions/latest/sdk/av#avplaybacksource)`  
initialStatus(optional)|
`[AVPlaybackStatusToSet](/versions/latest/sdk/av#avplaybackstatustoset)`  
onPlaybackStatusUpdate(optional)| `null | (status: [AVPlaybackStatus](/versions/latest/sdk/av#avplaybackstatus)) => void`  
downloadFirst(optional)| `boolean`  
  
  

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<SoundObject>`

### `createAsync(source, initialStatus, onPlaybackStatusUpdate,
downloadFirst)`

Android

iOS

tvOS

Web

Parameter| Type| Description  
---|---|---  
source| `[AVPlaybackSource](/versions/latest/sdk/av#avplaybacksource)`| The
source of the sound. See the [AV
documentation](/versions/latest/sdk/av#playback-api) for details on the
possible `source` values.  
initialStatus(optional)|
`[AVPlaybackStatusToSet](/versions/latest/sdk/av#avplaybackstatustoset)`| The
initial intended `PlaybackStatusToSet` of the sound, whose values will
override the default initial playback status. This value defaults to `{}` if
no parameter is passed. See the [AV documentation](/versions/latest/sdk/av)
for details on `PlaybackStatusToSet` and the default initial playback
status.Default:`{}`  
onPlaybackStatusUpdate(optional)| `null | (status: [AVPlaybackStatus](/versions/latest/sdk/av#avplaybackstatus)) => void`| A function taking a single parameter `PlaybackStatus`. This value defaults to `null` if no parameter is passed. See the [AV documentation](/versions/latest/sdk/av) for details on the functionality provided by `onPlaybackStatusUpdate`Default:`null`  
downloadFirst(optional)| `boolean`| If set to true, the system will attempt to
download the resource to the device before loading. This value defaults to
`true`. Note that at the moment, this will only work for `source`s of the form
`require('path/to/file')` or `Asset` objects.Default:`true`  
  
  

Creates and loads a sound from source.

    
    
    const { sound } = await Audio.Sound.createAsync(
      source,
      initialStatus,
      onPlaybackStatusUpdate,
      downloadFirst
    );
    
    // Which is equivalent to the following:
    const sound = new Audio.Sound();
    sound.setOnPlaybackStatusUpdate(onPlaybackStatusUpdate);
    await sound.loadAsync(source, initialStatus, downloadFirst);
    

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<SoundObject>`

A `Promise` that is rejected if creation failed, or fulfilled with the
`SoundObject` if creation succeeded.

Example

    
    
    try {
      const { sound: soundObject, status } = await Audio.Sound.createAsync(
        require('./assets/sounds/hello.mp3'),
        { shouldPlay: true }
      );
      // Your sound is playing!
    } catch (error) {
      // An error occurred!
    }
    

### `setOnAudioSampleReceived(callback)`

Android

iOS

tvOS

Web

Parameter| Type| Description  
---|---|---  
callback|
`[AudioSampleCallback](/versions/latest/sdk/av#avplaybackstatustoset)`| A
function taking the `AudioSampleCallback` as parameter.  
  
  

Sets a function to be called during playback, receiving the audio sample as
parameter.

Returns:

`void`

### `setOnMetadataUpdate(onMetadataUpdate)`

iOS

Parameter| Type| Description  
---|---|---  
onMetadataUpdate| `(metadata:
[AVMetadata](/versions/latest/sdk/av#avmetadata)) => void`| A function taking
a single object of type `AVMetadata` as a parameter.  
  
  

Sets a function to be called whenever the metadata of the sound object
changes, if one is set.

Returns:

`void`

### `setOnPlaybackStatusUpdate(onPlaybackStatusUpdate)`

Android

iOS

tvOS

Web

Parameter| Type| Description  
---|---|---  
onPlaybackStatusUpdate| `null | (status: [AVPlaybackStatus](/versions/latest/sdk/av#avplaybackstatus)) => void`| A function taking a single parameter `AVPlaybackStatus`.  
  
  

Sets a function to be called regularly with the `AVPlaybackStatus` of the
playback object.

`onPlaybackStatusUpdate` will be called whenever a call to the API for this
playback object completes (such as `setStatusAsync()`, `getStatusAsync()`, or
`unloadAsync()`), nd will also be called at regular intervals while the media
is in the loaded state.

Set `progressUpdateIntervalMillis` via `setStatusAsync()` or
`setProgressUpdateIntervalAsync()` to modify the interval with which
`onPlaybackStatusUpdate` is called while loaded.

Returns:

`void`

## Methods

### `Audio.getPermissionsAsync()`

Android

iOS

Checks user's permissions for audio recording.

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<PermissionResponse>`

A promise that resolves to an object of type `PermissionResponse`.

### `Audio.requestPermissionsAsync()`

Android

iOS

Asks the user to grant permissions for audio recording.

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<PermissionResponse>`

A promise that resolves to an object of type `PermissionResponse`.

### `Audio.setAudioModeAsync(partialMode)`

Android

iOS

tvOS

Web

Parameter| Type  
---|---  
partialMode| `[Partial](https://www.typescriptlang.org/docs/handbook/utility-
types.html#partialtype)<AudioMode>`  
  
  

We provide this API to customize the audio experience on iOS and Android.

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<void>`

A `Promise` that will reject if the audio mode could not be enabled for the
device.

### `Audio.setIsEnabledAsync(value)`

Android

iOS

tvOS

Web

Parameter| Type| Description  
---|---|---  
value| `boolean`| `true` enables Audio, and `false` disables it.  
  
  

Audio is enabled by default, but if you want to write your own Audio API in a
bare workflow app, you might want to disable the Audio API.

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<void>`

A `Promise` that will reject if audio playback could not be enabled for the
device.

## Types

### `AudioChannel`

Android

iOS

tvOS

Web

Property| Type| Description  
---|---|---  
frames| `number[]`| All samples for this specific Audio Channel in PCM Buffer
format (-1 to 1).  
  
### `AudioMode`

Android

iOS

tvOS

Web

Property| Type| Description  
---|---|---  
allowsRecordingIOS(optional)| `boolean`| A boolean selecting if recording is
enabled on iOS.

> When this flag is set to `true`, playback may be routed to the phone
> earpiece instead of to the speaker. Set it back to `false` after stopping
> recording to reenable playback through the speaker.

Default:`false`  
interruptionModeAndroid| `InterruptionModeAndroid`| An enum selecting how your
experience's audio should interact with the audio from other apps on Android.  
interruptionModeIOS| `InterruptionModeIOS`| An enum selecting how your
experience's audio should interact with the audio from other apps on iOS.  
playsInSilentModeIOS(optional)| `boolean`| A boolean selecting if your
experience's audio should play in silent mode on iOS.Default:`false`  
playThroughEarpieceAndroid(optional)| `boolean`| A boolean selecting if the
audio is routed to earpiece on Android.Default:`false`  
shouldDuckAndroid(optional)| `boolean`| A boolean selecting if your
experience's audio should automatically be lowered in volume ("duck") if audio
from another app interrupts your experience. If `false`, audio from other apps
will pause your audio.Default:`true`  
staysActiveInBackground(optional)| `boolean`| A boolean selecting if the audio
session (playback or recording) should stay active even when the app goes into
background.

> This is not available in Expo Go for iOS, it will only work in standalone
> apps. To enable it for standalone apps, follow the instructions below to add
> `UIBackgroundModes` to your app configuration.

Default:`false`  
  
### `AudioSample`

Android

iOS

tvOS

Web

Object passed to the `onAudioSampleReceived` function. Represents a single
sample from an audio source. The sample contains all frames (PCM Buffer
values) for each channel of the audio, so if the audio is _stereo_
(interleaved), there will be two channels, one for left and one for right
audio.

Property| Type| Description  
---|---|---  
channels| `AudioChannel[]`| An array representing the data from each channel
in PCM Buffer format. Array elements are objects in the following format: `{
frames: number[] }`, where each frame is a number in PCM Buffer format (`-1`
to `1` range).  
timestamp| `number`| A number representing the timestamp of the current sample
in seconds, relative to the audio track's timeline.

> Known issue: When using the `ExoPlayer` Android implementation, the
> timestamp is always `-1`.  
  
### `AudioSampleCallback`

Android

iOS

tvOS

Web

Type: `null` or `object` shaped as below:

#### `(sample) => `void``

Parameter| Type| Description  
---|---|---  
sample[(index
signature)](https://www.typescriptlang.org/docs/handbook/2/objects.html#index-
signatures)| `AudioSample`| -  
  
### `PermissionHookOptions`

Android

iOS

tvOS

Web

Literal Type: `union`

Acceptable values are: `PermissionHookBehavior` | `Options`

### `PermissionResponse`

Android

iOS

tvOS

Web

An object obtained by permissions get and request functions.

Property| Type| Description  
---|---|---  
canAskAgain| `boolean`| Indicates if user can be asked again for specific
permission. If not, one should be directed to the Settings app in order to
enable/disable the permission.  
expires| `PermissionExpiration`| Determines time when the permission expires.  
granted| `boolean`| A convenience boolean that indicates if the permission is
granted.  
status| `PermissionStatus`| Determines the status of the permission.  
  
### `RecordingInput`

Android

iOS

Property| Type| Description  
---|---|---  
name| `string`| -  
type| `string`| -  
uid| `string`| -  
  
### `RecordingObject`

Android

iOS

Property| Type| Description  
---|---|---  
recording| `Recording`| The newly created and started `Recording` object.  
status| `RecordingStatus`| The `RecordingStatus` of the `Recording` object.
See the [AV documentation](/versions/latest/sdk/av) for further information.  
  
### `RecordingOptions`

Android

iOS

tvOS

Web

The recording extension, sample rate, bitrate, channels, format, encoder, etc.
which can be customized by passing options to `prepareToRecordAsync()`.

We provide the following preset options for convenience, as used in the
example above. See below for the definitions of these presets.

  * `Audio.RecordingOptionsPresets.HIGH_QUALITY`
  * `Audio.RecordingOptionsPresets.LOW_QUALITY`

We also provide the ability to define your own custom recording options, but
we recommend you use the presets, as not all combinations of options will
allow you to successfully `prepareToRecordAsync()`. You will have to test your
custom options on iOS and Android to make sure it's working. In the future, we
will enumerate all possible valid combinations, but at this time, our goal is
to make the basic use-case easy (with presets) and the advanced use-case
possible (by exposing all the functionality available on all supported
platforms).

Property| Type| Description  
---|---|---  
android| `RecordingOptionsAndroid`| Recording options for the Android
platform.  
ios| `RecordingOptionsIOS`| Recording options for the iOS platform.  
isMeteringEnabled(optional)| `boolean`| A boolean that determines whether
audio level information will be part of the status object under the "metering"
key.  
keepAudioActiveHint(optional)| `boolean`| A boolean that hints to keep the
audio active after `prepareToRecordAsync` completes. Setting this value can
improve the speed at which the recording starts. Only set this value to `true`
when you call `startAsync` immediately after `prepareToRecordAsync`. This
value is automatically set when using `Audio.recording.createAsync()`.  
web| `RecordingOptionsWeb`| Recording options for the Web platform.  
  
### `RecordingOptionsAndroid`

Android

Property| Type| Description  
---|---|---  
audioEncoder| `AndroidAudioEncoder | number`| The desired audio encoder. See the `AndroidAudioEncoder` enum for all valid values.  
bitRate(optional)| `number`| The desired bit rate. Note that
`prepareToRecordAsync()` may perform additional checks on the parameter to
make sure whether the specified bit rate is applicable, and sometimes the
passed bitRate will be clipped internally to ensure the audio recording can
proceed smoothly based on the capabilities of the platform.Example`128000`  
extension| `string`| The desired file extension. Example valid values are
`.3gp` and `.m4a`. For more information, see the [Android
docs](https://developer.android.com/guide/topics/media/media-formats) for
supported output formats.  
maxFileSize(optional)| `number`| The desired maximum file size in bytes, after
which the recording will stop (but `stopAndUnloadAsync()` must still be called
after this point).Example`65536`  
numberOfChannels(optional)| `number`| The desired number of channels. Note
that `prepareToRecordAsync()` may perform additional checks on the parameter
to make sure whether the specified number of audio channels are
applicable.Example`1`, `2`  
outputFormat| `AndroidOutputFormat | number`| The desired file format. See the `AndroidOutputFormat` enum for all valid values.  
sampleRate(optional)| `number`| The desired sample rate. Note that the
sampling rate depends on the format for the audio recording, as well as the
capabilities of the platform. For instance, the sampling rate supported by AAC
audio coding standard ranges from 8 to 96 kHz, the sampling rate supported by
AMRNB is 8kHz, and the sampling rate supported by AMRWB is 16kHz. Please
consult with the related audio coding standard for the supported audio
sampling rate.Example44100  
  
### `RecordingOptionsIOS`

iOS

Property| Type| Description  
---|---|---  
audioQuality| `IOSAudioQuality | number`| The desired audio quality. See the `IOSAudioQuality` enum for all valid values.  
bitDepthHint(optional)| `number`| The desired bit depth hint.Example`16`  
bitRate| `number`| The desired bit rate.Example`128000`  
bitRateStrategy(optional)| `number`| The desired bit rate strategy. See the
next section for an enumeration of all valid values of `bitRateStrategy`.  
extension| `string`| The desired file extension.Example`'.caf'`  
linearPCMBitDepth(optional)| `number`| The desired PCM bit depth.Example`16`  
linearPCMIsBigEndian(optional)| `boolean`| A boolean describing if the PCM
data should be formatted in big endian.  
linearPCMIsFloat(optional)| `boolean`| A boolean describing if the PCM data
should be encoded in floating point or integral values.  
numberOfChannels| `number`| The desired number of channels.Example`1`, `2`  
outputFormat(optional)| `string | IOSOutputFormat | number`| The desired file format. See the `IOSOutputFormat` enum for all valid values.  
sampleRate| `number`| The desired sample rate.Example`44100`  
  
### `RecordingOptionsWeb`

Android

iOS

tvOS

Web

Property| Type| Description  
---|---|---  
bitsPerSecond(optional)| `number`| -  
mimeType(optional)| `string`| -  
  
### `RecordingStatus`

Android

iOS

tvOS

Web

Property| Type| Description  
---|---|---  
canRecord| `boolean`| Only for: AndroidiOS  
A boolean describing if the `Recording` can initiate the recording.  
durationMillis| `number`| Only for: AndroidiOS  
The current duration of the recorded audio or the final duration is the
recording has been stopped.  
isDoneRecording| `boolean`| Only for: AndroidiOS  
A boolean describing if the `Recording` has been stopped.  
isRecording| `boolean`| Only for: AndroidiOS  
A boolean describing if the `Recording` is currently recording.  
mediaServicesDidReset(optional)| `boolean`| Only for: iOS  
A boolean indicating whether media services were reset during recording. This
may occur if the active input ceases to be available during recording. For
example: airpods are the active input and they run out of batteries during
recording.  
metering(optional)| `number`| Only for: AndroidiOS  
A number that's the most recent reading of the loudness in dB. The value
ranges from `–160` dBFS, indicating minimum power, to `0` dBFS, indicating
maximum power. Present or not based on Recording options. See
`RecordingOptions` for more information.  
uri(optional)| `string | null`| -  
  
### `SoundObject`

Android

iOS

tvOS

Web

Property| Type| Description  
---|---|---  
sound| `Sound`| The newly created and loaded `Sound` object.  
status| `[AVPlaybackStatus](/versions/latest/sdk/av#avplaybackstatus)`| The
`PlaybackStatus` of the `Sound` object. See the [AV
documentation](/versions/latest/sdk/av) for further information.  
  
## Enums

### `AndroidAudioEncoder`

Android

Defines the audio encoding.

#### `DEFAULT`

`AndroidAudioEncoder.DEFAULT ＝ 0`

#### `AMR_NB`

`AndroidAudioEncoder.AMR_NB ＝ 1`

AMR (Narrowband) audio codec.

#### `AMR_WB`

`AndroidAudioEncoder.AMR_WB ＝ 2`

AMR (Wideband) audio codec.

#### `AAC`

`AndroidAudioEncoder.AAC ＝ 3`

AAC Low Complexity (AAC-LC) audio codec.

#### `HE_AAC`

`AndroidAudioEncoder.HE_AAC ＝ 4`

High Efficiency AAC (HE-AAC) audio codec.

#### `AAC_ELD`

`AndroidAudioEncoder.AAC_ELD ＝ 5`

Enhanced Low Delay AAC (AAC-ELD) audio codec.

### `AndroidOutputFormat`

Android

Defines the output format.

#### `DEFAULT`

`AndroidOutputFormat.DEFAULT ＝ 0`

#### `THREE_GPP`

`AndroidOutputFormat.THREE_GPP ＝ 1`

3GPP media file format.

#### `MPEG_4`

`AndroidOutputFormat.MPEG_4 ＝ 2`

MPEG4 media file format.

#### `AMR_NB`

`AndroidOutputFormat.AMR_NB ＝ 3`

AMR NB file format.

#### `AMR_WB`

`AndroidOutputFormat.AMR_WB ＝ 4`

AMR WB file format.

#### `AAC_ADIF`

`AndroidOutputFormat.AAC_ADIF ＝ 5`

#### `AAC_ADTS`

`AndroidOutputFormat.AAC_ADTS ＝ 6`

AAC ADTS file format.

#### `RTP_AVP`

`AndroidOutputFormat.RTP_AVP ＝ 7`

#### `MPEG2TS`

`AndroidOutputFormat.MPEG2TS ＝ 8`

H.264/AAC data encapsulated in MPEG2/TS.

#### `WEBM`

`AndroidOutputFormat.WEBM ＝ 9`

VP8/VORBIS data in a WEBM container.

### `InterruptionModeAndroid`

Android

#### `DoNotMix`

`InterruptionModeAndroid.DoNotMix ＝ 1`

If this option is set, your experience's audio interrupts audio from other
apps.

#### `DuckOthers`

`InterruptionModeAndroid.DuckOthers ＝ 2`

This is the default option. If this option is set, your experience's audio
lowers the volume ("ducks") of audio from other apps while your audio plays.

### `InterruptionModeIOS`

iOS

#### `MixWithOthers`

`InterruptionModeIOS.MixWithOthers ＝ 0`

This is the default option. If this option is set, your experience's audio is
mixed with audio playing in background apps.

#### `DoNotMix`

`InterruptionModeIOS.DoNotMix ＝ 1`

If this option is set, your experience's audio interrupts audio from other
apps.

#### `DuckOthers`

`InterruptionModeIOS.DuckOthers ＝ 2`

If this option is set, your experience's audio lowers the volume ("ducks") of
audio from other apps while your audio plays.

### `IOSAudioQuality`

iOS

#### `MIN`

`IOSAudioQuality.MIN ＝ 0`

#### `LOW`

`IOSAudioQuality.LOW ＝ 32`

#### `MEDIUM`

`IOSAudioQuality.MEDIUM ＝ 64`

#### `HIGH`

`IOSAudioQuality.HIGH ＝ 96`

#### `MAX`

`IOSAudioQuality.MAX ＝ 127`

### `IOSBitRateStrategy`

iOS

#### `CONSTANT`

`IOSBitRateStrategy.CONSTANT ＝ 0`

#### `LONG_TERM_AVERAGE`

`IOSBitRateStrategy.LONG_TERM_AVERAGE ＝ 1`

#### `VARIABLE_CONSTRAINED`

`IOSBitRateStrategy.VARIABLE_CONSTRAINED ＝ 2`

#### `VARIABLE`

`IOSBitRateStrategy.VARIABLE ＝ 3`

### `IOSOutputFormat`

iOS

> Note: Not all of the iOS formats included in this list of constants are
> currently supported by iOS, in spite of appearing in the Apple source code.
> For an accurate list of formats supported by iOS, see [Core Audio
> Codecs](https://developer.apple.com/library/content/documentation/MusicAudio/Conceptual/CoreAudioOverview/CoreAudioEssentials/CoreAudioEssentials.html)
> and [iPhone Audio File
> Formats](https://developer.apple.com/library/content/documentation/MusicAudio/Conceptual/CoreAudioOverview/CoreAudioEssentials/CoreAudioEssentials.html).

#### `MPEGLAYER1`

`IOSOutputFormat.MPEGLAYER1 ＝ ".mp1"`

#### `MPEGLAYER2`

`IOSOutputFormat.MPEGLAYER2 ＝ ".mp2"`

#### `MPEGLAYER3`

`IOSOutputFormat.MPEGLAYER3 ＝ ".mp3"`

#### `MPEG4AAC`

`IOSOutputFormat.MPEG4AAC ＝ "aac "`

#### `MPEG4AAC_ELD`

`IOSOutputFormat.MPEG4AAC_ELD ＝ "aace"`

#### `MPEG4AAC_ELD_SBR`

`IOSOutputFormat.MPEG4AAC_ELD_SBR ＝ "aacf"`

#### `MPEG4AAC_ELD_V2`

`IOSOutputFormat.MPEG4AAC_ELD_V2 ＝ "aacg"`

#### `MPEG4AAC_HE`

`IOSOutputFormat.MPEG4AAC_HE ＝ "aach"`

#### `MPEG4AAC_LD`

`IOSOutputFormat.MPEG4AAC_LD ＝ "aacl"`

#### `MPEG4AAC_HE_V2`

`IOSOutputFormat.MPEG4AAC_HE_V2 ＝ "aacp"`

#### `MPEG4AAC_SPATIAL`

`IOSOutputFormat.MPEG4AAC_SPATIAL ＝ "aacs"`

#### `AC3`

`IOSOutputFormat.AC3 ＝ "ac-3"`

#### `AES3`

`IOSOutputFormat.AES3 ＝ "aes3"`

#### `APPLELOSSLESS`

`IOSOutputFormat.APPLELOSSLESS ＝ "alac"`

#### `ALAW`

`IOSOutputFormat.ALAW ＝ "alaw"`

#### `AUDIBLE`

`IOSOutputFormat.AUDIBLE ＝ "AUDB"`

#### `60958AC3`

`IOSOutputFormat.60958AC3 ＝ "cac3"`

#### `MPEG4CELP`

`IOSOutputFormat.MPEG4CELP ＝ "celp"`

#### `ENHANCEDAC3`

`IOSOutputFormat.ENHANCEDAC3 ＝ "ec-3"`

#### `MPEG4HVXC`

`IOSOutputFormat.MPEG4HVXC ＝ "hvxc"`

#### `ILBC`

`IOSOutputFormat.ILBC ＝ "ilbc"`

#### `APPLEIMA4`

`IOSOutputFormat.APPLEIMA4 ＝ "ima4"`

#### `LINEARPCM`

`IOSOutputFormat.LINEARPCM ＝ "lpcm"`

#### `MACE3`

`IOSOutputFormat.MACE3 ＝ "MAC3"`

#### `MACE6`

`IOSOutputFormat.MACE6 ＝ "MAC6"`

#### `AMR`

`IOSOutputFormat.AMR ＝ "samr"`

#### `AMR_WB`

`IOSOutputFormat.AMR_WB ＝ "sawb"`

#### `DVIINTELIMA`

`IOSOutputFormat.DVIINTELIMA ＝ 1836253201`

#### `MICROSOFTGSM`

`IOSOutputFormat.MICROSOFTGSM ＝ 1836253233`

#### `QUALCOMM`

`IOSOutputFormat.QUALCOMM ＝ "Qclp"`

#### `QDESIGN2`

`IOSOutputFormat.QDESIGN2 ＝ "QDM2"`

#### `QDESIGN`

`IOSOutputFormat.QDESIGN ＝ "QDMC"`

#### `MPEG4TWINVQ`

`IOSOutputFormat.MPEG4TWINVQ ＝ "twvq"`

#### `ULAW`

`IOSOutputFormat.ULAW ＝ "ulaw"`

### `PermissionStatus`

Android

iOS

tvOS

Web

#### `DENIED`

`PermissionStatus.DENIED ＝ "denied"`

User has denied the permission.

#### `GRANTED`

`PermissionStatus.GRANTED ＝ "granted"`

User has granted the permission.

#### `UNDETERMINED`

`PermissionStatus.UNDETERMINED ＝ "undetermined"`

User hasn't granted or denied the permission yet.

### `PitchCorrectionQuality`

Android

iOS

tvOS

Web

Check [official Apple
documentation](https://developer.apple.com/documentation/avfoundation/audio_settings/time_pitch_algorithm_settings)
for more information.

#### `High`

`PitchCorrectionQuality.High ＝ number`

Equivalent to `AVAudioTimePitchAlgorithmSpectral`.

#### `Low`

`PitchCorrectionQuality.Low ＝ number`

Equivalent to `AVAudioTimePitchAlgorithmLowQualityZeroLatency`.

#### `Medium`

`PitchCorrectionQuality.Medium ＝ number`

Equivalent to `AVAudioTimePitchAlgorithmTimeDomain`.

## Unified API

The rest of the API on the `Sound.Audio` is the same as the API for `Video`
component `ref`. See the [AV documentation](/versions/latest/sdk/av#playback)
for more information.

