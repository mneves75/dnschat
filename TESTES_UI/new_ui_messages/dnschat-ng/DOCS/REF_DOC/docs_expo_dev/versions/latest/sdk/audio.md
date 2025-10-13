# ![Expo Audio \(expo-audio\) icon](/static/images/packages/expo-av.png)Expo
Audio (expo-audio)

[GitHub](https://github.com/expo/expo/tree/sdk-54/packages/expo-
audio)[Changelog](https://github.com/expo/expo/tree/sdk-54/packages/expo-
audio/CHANGELOG.md)[npm](https://www.npmjs.com/package/expo-audio)

Ask AI

A library that provides an API to implement audio playback and recording in
apps.

[GitHub](https://github.com/expo/expo/tree/sdk-54/packages/expo-
audio)[Changelog](https://github.com/expo/expo/tree/sdk-54/packages/expo-
audio/CHANGELOG.md)[npm](https://www.npmjs.com/package/expo-audio)

Ask AI

Android

iOS

tvOS

Web

Bundled version:

~1.0.13

Copy

* * *

`expo-audio` is a cross-platform audio library for accessing the native audio
capabilities of the device.

Note that audio automatically stops if headphones/bluetooth audio devices are
disconnected.

## Installation

Terminal

Copy

`- ``npx expo install expo-audio`

If you are installing this in an [existing React Native app](/bare/overview),
make sure to [install `expo`](/bare/installing-expo-modules) in your project.

## Configuration in app config

You can configure `expo-audio` using its built-in [config plugin](/config-
plugins/introduction) if you use config plugins in your project ([EAS
Build](/build/introduction) or `npx expo run:[android|ios]`). The plugin
allows you to configure various properties that cannot be set at runtime and
require building a new app binary to take effect. If your app does not use EAS
Build, then you'll need to manually configure the package.

### Example app.json with config plugin

app.json

Copy

    
    
    {
      "expo": {
        "plugins": [
          [
            "expo-audio",
            {
              "microphonePermission": "Allow $(PRODUCT_NAME) to access your microphone."
            }
          ]
        ]
      }
    }
    

### Configurable properties

Name| Default| Description  
---|---|---  
`microphonePermission`| `"Allow $(PRODUCT_NAME) to access your microphone"`|
Only for: iOS  
A string to set the `NSMicrophoneUsageDescription` permission message.  
  
## Usage

### Playing sounds

Playing sounds

Copy

Open in Snack

    
    
    import { View, StyleSheet, Button } from 'react-native';
    import { useAudioPlayer } from 'expo-audio';
    
    const audioSource = require('./assets/Hello.mp3');
    
    export default function App() {
      const player = useAudioPlayer(audioSource);
    
      return (
        <View style={styles.container}>
          <Button title="Play Sound" onPress={() => player.play()} />
          <Button
            title="Replay Sound"
            onPress={() => {
              player.seekTo(0);
              player.play();
            }}
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
    

> Note: If you're migrating from [`expo-av`](/versions/latest/sdk/av), you'll
> notice that `expo-audio` doesn't automatically reset the playback position
> when audio finishes. After [`play()`](/versions/latest/sdk/audio#play), the
> player stays paused at the end of the sound. To play it again, call
> [`seekTo(seconds)`](/versions/latest/sdk/audio#seektoseconds) to reset the
> position — as shown in the example above.

### Recording sounds

Recording sounds

Copy

Open in Snack

    
    
    import { useState, useEffect } from 'react';
    import { View, StyleSheet, Button } from 'react-native';
    import {
      useAudioRecorder,
      AudioModule,
      RecordingPresets,
      setAudioModeAsync,
      useAudioRecorderState,
    } from 'expo-audio';
    
    export default function App() {
      const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
      const recorderState = useAudioRecorderState(audioRecorder);
    
      const record = async () => {
        await audioRecorder.prepareToRecordAsync();
        audioRecorder.record();
      };
    
      const stopRecording = async () => {
        // The recording will be available on `audioRecorder.uri`.
        await audioRecorder.stop();
      };
    
      useEffect(() => {
        (async () => {
          const status = await AudioModule.requestRecordingPermissionsAsync();
          if (!status.granted) {
            Alert.alert('Permission to access microphone was denied');
          }
    
          setAudioModeAsync({
            playsInSilentMode: true,
            allowsRecording: true,
          });
        })();
      }, []);
    
      return (
        <View style={styles.container}>
          <Button
            title={recorderState.isRecording ? 'Stop Recording' : 'Start Recording'}
            onPress={recorderState.isRecording ? stopRecording : record}
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
    

### Using the AudioPlayer directly

In most cases, the
[`useAudioPlayer`](/versions/latest/sdk/audio#useaudioplayersource-options)
hook should be used to create a `AudioPlayer` instance. It manages the
player's lifecycle and ensures that it is properly disposed of when the
component is unmounted. However, in some advanced use cases, it might be
necessary to create a `AudioPlayer` that does not get automatically destroyed
when the component is unmounted. In those cases, the `AudioPlayer` can be
created using the
[`createAudioPlayer`](/versions/latest/sdk/audio#audiocreateaudioplayersource-
updateinterval) function. You need to be aware of the risks that come with
this approach, as it is your responsibility to call the
[`release()`](/versions/latest/sdk/expo#release) method when the player is no
longer needed. If not handled properly, this approach may lead to memory
leaks.

    
    
    import { createAudioPlayer } from 'expo-audio';
    const player = createAudioPlayer(audioSource);
    

### Notes on web usage

  * A MediaRecorder issue on Chrome produces WebM files missing the duration metadata. [See the open Chromium issue](https://bugs.chromium.org/p/chromium/issues/detail?id=642012).
  * MediaRecorder encoding options and other configurations are inconsistent across browsers, utilizing a Polyfill such as [kbumsik/opus-media-recorder](https://github.com/kbumsik/opus-media-recorder) or [ai/audio-recorder-polyfill](https://github.com/ai/audio-recorder-polyfill) in your application will improve your experience. Any options passed to `prepareToRecordAsync` will be passed directly to the MediaRecorder API and as such the polyfill.
  * Web browsers require sites to be served securely for them to listen to a mic. See [MediaDevices `getUserMedia()` security](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia#security) for more details.

## API

    
    
    import { useAudioPlayer, useAudioRecorder } from 'expo-audio';
    

## Constants

### `Audio.RecordingPresets`

Android

iOS

tvOS

Web

Type: `Record<string, RecordingOptions>`

Constant which contains definitions of the two preset examples of
`RecordingOptions`, as implemented in the Audio SDK.

#### `HIGH_QUALITY`

    
    
    RecordingPresets.HIGH_QUALITY = {
     extension: '.m4a',
      sampleRate: 44100,
      numberOfChannels: 2,
      bitRate: 128000,
      android: {
        outputFormat: 'mpeg4',
        audioEncoder: 'aac',
      },
      ios: {
        outputFormat: IOSOutputFormat.MPEG4AAC,
        audioQuality: AudioQuality.MAX,
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

    
    
    RecordingPresets.LOW_QUALITY = {
      extension: '.m4a',
      sampleRate: 44100,
      numberOfChannels: 2,
      bitRate: 64000,
      android: {
        extension: '.3gp',
        outputFormat: '3gp',
        audioEncoder: 'amr_nb',
      },
      ios: {
        audioQuality: AudioQuality.MIN,
        outputFormat: IOSOutputFormat.MPEG4AAC,
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

### `useAudioPlayer(source, options)`

Android

iOS

tvOS

Web

Parameter| Type| Description  
---|---|---  
source(optional)| `AudioSource`| The audio source to load. Can be a local
asset via `require()`, a remote URL, or null for no initial
source.Default:`null`  
options(optional)| `AudioPlayerOptions`| Audio player configuration
options.Default:`{}`  
  
  

Creates an `AudioPlayer` instance that automatically releases when the
component unmounts.

This hook manages the player's lifecycle and ensures it's properly disposed
when no longer needed. The player will start loading the audio source
immediately upon creation.

Returns:

`AudioPlayer`

An `AudioPlayer` instance that's automatically managed by the component
lifecycle.

Example

    
    
    import { useAudioPlayer } from 'expo-audio';
    
    function MyComponent() {
      const player = useAudioPlayer(require('./sound.mp3'));
    
      return (
        <Button title="Play" onPress={() => player.play()} />
      );
    }
    

Example

    
    
    import { useAudioPlayer } from 'expo-audio';
    
    function MyComponent() {
      const player = useAudioPlayer('https://example.com/audio.mp3', {
        updateInterval: 1000,
        downloadFirst: true,
      });
    
      return (
        <Button title="Play" onPress={() => player.play()} />
      );
    }
    

### `useAudioPlayerStatus(player)`

Android

iOS

tvOS

Web

Parameter| Type| Description  
---|---|---  
player| `AudioPlayer`| The `AudioPlayer` instance to monitor.  
  
  

Hook that provides real-time playback status updates for an `AudioPlayer`.

This hook automatically subscribes to playback status changes and returns the
current status. The status includes information about playback state, current
time, duration, loading state, and more.

Returns:

`AudioStatus`

The current `AudioStatus` object containing playback information.

Example

    
    
    import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
    
    function PlayerComponent() {
      const player = useAudioPlayer(require('./sound.mp3'));
      const status = useAudioPlayerStatus(player);
    
      return (
        <View>
          <Text>Playing: {status.playing ? 'Yes' : 'No'}</Text>
          <Text>Current Time: {status.currentTime}s</Text>
          <Text>Duration: {status.duration}s</Text>
        </View>
      );
    }
    

### `useAudioRecorder(options, statusListener)`

Android

iOS

tvOS

Web

Parameter| Type| Description  
---|---|---  
options| `RecordingOptions`| Recording configuration options including format,
quality, sample rate, etc.  
statusListener(optional)| `(status: RecordingStatus) => void`| Optional
callback function that receives recording status updates.  
  
  

Hook that creates an `AudioRecorder` instance for recording audio.

This hook manages the recorder's lifecycle and ensures it's properly disposed
when no longer needed. The recorder is automatically prepared with the
provided options and can be used to record audio.

Returns:

`AudioRecorder`

An `AudioRecorder` instance that's automatically managed by the component
lifecycle.

Example

    
    
    import { useAudioRecorder, RecordingPresets } from 'expo-audio';
    
    function RecorderComponent() {
      const recorder = useAudioRecorder(
        RecordingPresets.HIGH_QUALITY,
        (status) => console.log('Recording status:', status)
      );
    
      const startRecording = async () => {
        await recorder.prepareToRecordAsync();
        recorder.record();
      };
    
      return (
        <Button title="Start Recording" onPress={startRecording} />
      );
    }
    

### `useAudioRecorderState(recorder, interval)`

Android

iOS

tvOS

Web

Parameter| Type| Description  
---|---|---  
recorder| `AudioRecorder`| The `AudioRecorder` instance to monitor.  
interval(optional)| `number`| How often (in milliseconds) to poll the
recorder's status. Defaults to 500ms.Default:`500`  
  
  

Hook that provides real-time recording state updates for an `AudioRecorder`.

This hook polls the recorder's status at regular intervals and returns the
current recording state. Use this when you need to monitor the recording
status without setting up a status listener.

Returns:

`RecorderState`

The current `RecorderState` containing recording information.

Example

    
    
    import { useAudioRecorder, useAudioRecorderState, RecordingPresets } from 'expo-audio';
    
    function RecorderStatusComponent() {
      const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
      const state = useAudioRecorderState(recorder);
    
      return (
        <View>
          <Text>Recording: {state.isRecording ? 'Yes' : 'No'}</Text>
          <Text>Duration: {Math.round(state.durationMillis / 1000)}s</Text>
          <Text>Can Record: {state.canRecord ? 'Yes' : 'No'}</Text>
        </View>
      );
    }
    

### `useAudioSampleListener(player, listener)`

Android

iOS

tvOS

Web

Parameter| Type| Description  
---|---|---  
player| `AudioPlayer`| The `AudioPlayer` instance to sample audio from.  
listener| `(data: AudioSample) => void`| Function called with each audio
sample containing waveform data.  
  
  

Hook that sets up audio sampling for an `AudioPlayer` and calls a listener
with audio data.

This hook enables audio sampling on the player (if supported) and subscribes
to audio sample updates. Audio sampling provides real-time access to audio
waveform data for visualization or analysis.

> Note: Audio sampling requires `RECORD_AUDIO` permission on Android and is
> not supported on all platforms.

Returns:

`void`

Example

    
    
    import { useAudioPlayer, useAudioSampleListener } from 'expo-audio';
    
    function AudioVisualizerComponent() {
      const player = useAudioPlayer(require('./music.mp3'));
    
      useAudioSampleListener(player, (sample) => {
        // Use sample.channels array for audio visualization
        console.log('Audio sample:', sample.channels[0].frames);
      });
    
      return <AudioWaveform player={player} />;
    }
    

## Classes

### `AudioPlayer`

Android

iOS

tvOS

Web

Type: Class extends
`[SharedObject](/versions/v54.0.0/sdk/expo#sharedobjecttype)<AudioEvents>`

AudioPlayer Properties

### `currentTime`

Android

iOS

tvOS

Web

Type: `number`

The current position through the audio item in seconds.

### `duration`

Android

iOS

tvOS

Web

Type: `number`

The total duration of the audio in seconds.

### `id`

Android

iOS

tvOS

Web

Type: `number`

Unique identifier for the player object.

### `isAudioSamplingSupported`

Android

iOS

tvOS

Web

Type: `boolean`

Boolean value indicating whether audio sampling is supported on the platform.

### `isBuffering`

Android

iOS

tvOS

Web

Type: `boolean`

Boolean value indicating whether the player is buffering.

### `isLoaded`

Android

iOS

tvOS

Web

Type: `boolean`

Boolean value indicating whether the player is finished loading.

### `loop`

Android

iOS

tvOS

Web

Type: `boolean`

Boolean value indicating whether the player is currently looping.

### `muted`

Android

iOS

tvOS

Web

Type: `boolean`

Boolean value indicating whether the player is currently muted.

### `paused`

Android

iOS

tvOS

Web

Type: `boolean`

Boolean value indicating whether the player is currently paused.

### `playbackRate`

Android

iOS

tvOS

Web

Type: `number`

The current playback rate of the audio.

### `playing`

Android

iOS

tvOS

Web

Type: `boolean`

Boolean value indicating whether the player is currently playing.

### `shouldCorrectPitch`

Android

iOS

tvOS

Web

Type: `boolean`

A boolean describing if we are correcting the pitch for a changed rate.

### `volume`

Android

iOS

tvOS

Web

Type: `number`

The current volume of the audio.

AudioPlayer Methods

### `pause()`

Android

iOS

tvOS

Web

Pauses the player.

Returns:

`void`

### `play()`

Android

iOS

tvOS

Web

Start playing audio.

Returns:

`void`

### `remove()`

Android

iOS

tvOS

Web

Remove the player from memory to free up resources.

Returns:

`void`

### `replace(source)`

Android

iOS

tvOS

Web

Parameter| Type  
---|---  
source| `AudioSource`  
  
  

Replaces the current audio source with a new one.

Returns:

`void`

### `seekTo(seconds, toleranceMillisBefore, toleranceMillisAfter)`

Android

iOS

tvOS

Web

Parameter| Type| Description  
---|---|---  
seconds| `number`| The number of seconds to seek by.  
toleranceMillisBefore(optional)| `number`| The tolerance allowed before the
requested seek time, in milliseconds. iOS only.  
toleranceMillisAfter(optional)| `number`| The tolerance allowed after the
requested seek time, in milliseconds. iOS only.  
  
  

Seeks the playback by the given number of seconds.

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<void>`

### `setPlaybackRate(rate, pitchCorrectionQuality)`

Android

iOS

tvOS

Web

Parameter| Type| Description  
---|---|---  
rate| `number`| The playback rate of the audio.  
pitchCorrectionQuality(optional)| `PitchCorrectionQuality`| The quality of the
pitch correction.  
  
  

Sets the current playback rate of the audio.

Returns:

`void`

### `AudioRecorder`

Android

iOS

tvOS

Web

Type: Class extends
`[SharedObject](/versions/v54.0.0/sdk/expo#sharedobjecttype)<RecordingEvents>`

AudioRecorder Properties

### `currentTime`

Android

iOS

tvOS

Web

Type: `number`

The current length of the recording, in seconds.

### `id`

Android

iOS

tvOS

Web

Type: `number`

Unique identifier for the recorder object.

### `isRecording`

Android

iOS

tvOS

Web

Type: `boolean`

Boolean value indicating whether the recording is in progress.

### `uri`

Android

iOS

tvOS

Web

Literal type: `union`

The uri of the recording.

Acceptable values are: `null` | `string`

AudioRecorder Methods

### `getAvailableInputs()`

Android

iOS

tvOS

Web

Returns a list of available recording inputs. This method can only be called
if the `Recording` has been prepared.

Returns:

`RecordingInput[]`

A `Promise` that is fulfilled with an array of `RecordingInput` objects.

### `getCurrentInput()`

Android

iOS

tvOS

Web

Returns the currently-selected recording input. This method can only be called
if the `Recording` has been prepared.

Returns:

`RecordingInput`

A `Promise` that is fulfilled with a `RecordingInput` object.

### `getStatus()`

Android

iOS

tvOS

Web

Status of the current recording.

Returns:

`RecorderState`

### `pause()`

Android

iOS

tvOS

Web

Pause the recording.

Returns:

`void`

### `prepareToRecordAsync(options)`

Android

iOS

tvOS

Web

Parameter| Type  
---|---  
options(optional)|
`[Partial](https://www.typescriptlang.org/docs/handbook/utility-
types.html#partialtype)<RecordingOptions>`  
  
  

Prepares the recording for recording.

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<void>`

### `record(options)`

Android

iOS

tvOS

Web

Parameter| Type| Description  
---|---|---  
options(optional)| `RecordingStartOptions`| Optional recording configuration
options.  
  
  

Starts the recording.

Returns:

`void`

> Deprecated Use `record({ forDuration: seconds })` instead.

### `recordForDuration(seconds)`

Android

iOS

tvOS

Web

Parameter| Type| Description  
---|---|---  
seconds| `number`| The time in seconds to stop recording at.  
  
  

Stops the recording once the specified time has elapsed.

Returns:

`void`

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

`void`

A `Promise` that is resolved if successful or rejected if not.

> Deprecated Use `record({ atTime: seconds })` instead.

### `startRecordingAtTime(seconds)`

Android

iOS

tvOS

Web

Parameter| Type| Description  
---|---|---  
seconds| `number`| The time in seconds to start recording at.  
  
  

Starts the recording at the given time.

Returns:

`void`

### `stop()`

Android

iOS

tvOS

Web

Stop the recording.

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<void>`

## Methods

### `Audio.createAudioPlayer(source, options)`

Android

iOS

tvOS

Web

Parameter| Type| Description  
---|---|---  
source(optional)| `AudioSource`| The audio source to load.Default:`null`  
options(optional)| `AudioPlayerOptions`| Audio player configuration
options.Default:`{}`  
  
  

Creates an instance of an `AudioPlayer` that doesn't release automatically.

> For most use cases you should use the `useAudioPlayer` hook instead. See the
> Using the `AudioPlayer` directly section for more details.

Returns:

`AudioPlayer`

### `Audio.getRecordingPermissionsAsync()`

Android

iOS

tvOS

Web

Checks the current status of recording permissions without requesting them.

This function returns the current permission status for microphone access
without triggering a permission request dialog. Use this to check permissions
before deciding whether to call `requestRecordingPermissionsAsync()`.

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<PermissionResponse>`

A Promise that resolves to a `PermissionResponse` object containing the
current permission status.

Example

    
    
    import { getRecordingPermissionsAsync, requestRecordingPermissionsAsync } from 'expo-audio';
    
    const ensureRecordingPermissions = async () => {
      const { status } = await getRecordingPermissionsAsync();
    
      if (status !== 'granted') {
        // Permission not granted, request it
        const { granted } = await requestRecordingPermissionsAsync();
        return granted;
      }
    
      return true; // Already granted
    };
    

### `Audio.requestRecordingPermissionsAsync()`

Android

iOS

tvOS

Web

Requests permission to record audio from the microphone.

This function prompts the user for microphone access permission, which is
required for audio recording functionality. On iOS, this will show the system
permission dialog. On Android, this requests the `RECORD_AUDIO` permission.

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<PermissionResponse>`

A Promise that resolves to a `PermissionResponse` object containing the
permission status.

Example

    
    
    import { requestRecordingPermissionsAsync } from 'expo-audio';
    
    const checkPermissions = async () => {
      const { status, granted } = await requestRecordingPermissionsAsync();
    
      if (granted) {
        console.log('Recording permission granted');
      } else {
        console.log('Recording permission denied:', status);
      }
    };
    

### `Audio.setAudioModeAsync(mode)`

Android

iOS

tvOS

Web

Parameter| Type| Description  
---|---|---  
mode| `[Partial](https://www.typescriptlang.org/docs/handbook/utility-
types.html#partialtype)<AudioMode>`| Partial audio mode configuration object.
Only specified properties will be updated.  
  
  

Configures the global audio behavior and session settings.

This function allows you to control how your app's audio interacts with other
apps, background playback behavior, audio routing, and interruption handling.

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<void>`

A Promise that resolves when the audio mode has been applied.

Example

    
    
    import { setAudioModeAsync } from 'expo-audio';
    
    // Configure audio for background playback
    await setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: true,
      interruptionModeAndroid: 'duckOthers',
      interruptionMode: 'mixWithOthers'
    });
    
    // Configure audio for recording
    await setAudioModeAsync({
      allowsRecording: true,
      playsInSilentMode: false
    });
    

### `Audio.setIsAudioActiveAsync(active)`

Android

iOS

tvOS

Web

Parameter| Type| Description  
---|---|---  
active| `boolean`| Whether audio should be active (`true`) or disabled
(`false`).  
  
  

Enables or disables the audio subsystem globally.

When set to `false`, this will pause all audio playback and prevent new audio
from playing. This is useful for implementing app-wide audio controls or
responding to system events.

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<void>`

A Promise that resolves when the audio state has been updated.

Example

    
    
    import { setIsAudioActiveAsync } from 'expo-audio';
    
    // Disable all audio when app goes to background
    const handleAppStateChange = async (nextAppState) => {
      if (nextAppState === 'background') {
        await setIsAudioActiveAsync(false);
      } else if (nextAppState === 'active') {
        await setIsAudioActiveAsync(true);
      }
    };
    

## Event Subscriptions

### `Audio.useAudioSampleListener(player, listener)`

Android

iOS

tvOS

Web

Parameter| Type| Description  
---|---|---  
player| `AudioPlayer`| The `AudioPlayer` instance to sample audio from.  
listener| `(data: AudioSample) => void`| Function called with each audio
sample containing waveform data.  
  
  

Hook that sets up audio sampling for an `AudioPlayer` and calls a listener
with audio data.

This hook enables audio sampling on the player (if supported) and subscribes
to audio sample updates. Audio sampling provides real-time access to audio
waveform data for visualization or analysis.

> Note: Audio sampling requires `RECORD_AUDIO` permission on Android and is
> not supported on all platforms.

Returns:

`void`

Example

    
    
    import { useAudioPlayer, useAudioSampleListener } from 'expo-audio';
    
    function AudioVisualizerComponent() {
      const player = useAudioPlayer(require('./music.mp3'));
    
      useAudioSampleListener(player, (sample) => {
        // Use sample.channels array for audio visualization
        console.log('Audio sample:', sample.channels[0].frames);
      });
    
      return <AudioWaveform player={player} />;
    }
    

## Types

### `AndroidAudioEncoder`

Android

Literal Type: `string`

Audio encoder options for Android recording.

Specifies the audio codec used to encode recorded audio on Android. Different
encoders offer different quality, compression, and compatibility trade-offs.

Acceptable values are: `'default'` | `'amr_nb'` | `'amr_wb'` | `'aac'` | `'he_aac'` | `'aac_eld'`

### `AndroidOutputFormat`

Android

Literal Type: `string`

Audio output format options for Android recording.

Specifies the container format for recorded audio files on Android. Different
formats have different compatibility and compression characteristics.

Acceptable values are: `'default'` | `'3gp'` | `'mpeg4'` | `'amrnb'` | `'amrwb'` | `'aac_adts'` | `'mpeg2ts'` | `'webm'`

### `AudioEvents`

Android

iOS

tvOS

Web

Event types that an `AudioPlayer` can emit.

These events allow you to listen for changes in playback state and receive
real-time audio data. Use `player.addListener()` to subscribe to these events.

Property| Type| Description  
---|---|---  
audioSampleUpdate| `(data: AudioSample) => void`| Fired when audio sampling is
enabled and new sample data is available.  
playbackStatusUpdate| `(status: AudioStatus) => void`| Fired when the player's
status changes (play/pause/seek/load and so on.).  
  
> Deprecated Use `AudioPlayerOptions` instead. Options for audio loading
> behavior.

### `AudioLoadOptions`

Android

iOS

tvOS

Web

Type: `AudioPlayerOptions`

### `AudioMode`

Android

iOS

tvOS

Web

Property| Type| Description  
---|---|---  
allowsRecording(optional)| `boolean`| Only for: iOS  
Whether the audio session allows recording.Default:`false`  
interruptionMode| `InterruptionMode`| Only for: iOS  
Determines how the audio session interacts with other sessions.  
interruptionModeAndroid| `InterruptionModeAndroid`| Only for: Android  
Determines how the audio session interacts with other sessions on Android.  
playsInSilentMode| `boolean`| Only for: iOS  
Determines if audio playback is allowed when the device is in silent mode.  
shouldPlayInBackground(optional)| `boolean`| Whether the audio session stays
active when the app moves to the background.Default:`false`  
shouldRouteThroughEarpiece| `boolean`| Only for: Android  
Whether the audio should route through the earpiece.  
  
### `AudioPlayerOptions`

Android

iOS

tvOS

Web

Options for configuring audio player behavior.

Property| Type| Description  
---|---|---  
crossOrigin(optional)| `'anonymous' | 'use-credentials'`| Only for: Web  
Determines the [cross origin policy](https://developer.mozilla.org/en-
US/docs/Web/HTML/Reference/Attributes/crossorigin) used by the underlying
native view on web. If `undefined` (default), does not use CORS at all. If set
to `'anonymous'`, the audio will be loaded with CORS enabled. Note that some
audio may not play if CORS is enabled, depending on the CDN settings. If you
encounter issues, consider adjusting the `crossOrigin`
property.Default:`undefined`  
downloadFirst(optional)| `boolean`| Only for: AndroidiOSWeb  
If set to `true`, the system will attempt to download the resource to the
device before loading. This value defaults to `false`. Works with:

  * Local assets from `require('path/to/file')`
  * Remote HTTP/HTTPS URLs
  * Asset objects

When enabled, this ensures the audio file is fully downloaded before playback
begins. This can improve playback performance and reduce buffering, especially
for users managing multiple audio players simultaneously. On Android and iOS,
this will download the audio file to the device's tmp directory before
playback begins. The system will purge the file at its discretion. On web,
this will download the audio file to the user's device memory and make it
available for the user to play. The system will usually purge the file from
memory after a reload or on memory pressure. On web, CORS restrictions apply
to the blob url, so you need to make sure the server returns the `Access-
Control-Allow-Origin` header.  
updateInterval(optional)| `number`| Only for: AndroidiOSWeb  
How often (in milliseconds) to emit playback status updates.Default:`500`  
  
### `AudioSample`

Android

iOS

tvOS

Web

Represents a single audio sample containing waveform data from all audio
channels.

Audio samples are provided in real-time when audio sampling is enabled on an
`AudioPlayer`. Each sample contains the raw PCM audio data for all channels
(mono has 1 channel, stereo has 2). This data can be used for audio
visualization, analysis, or processing.

Property| Type| Description  
---|---|---  
channels| `AudioSampleChannel[]`| Array of audio channels, each containing PCM
frame data. Stereo audio will have 2 channels (left/right).  
timestamp| `number`| Timestamp of this sample relative to the audio track's
timeline, in seconds.  
  
### `AudioSampleChannel`

Android

iOS

tvOS

Web

Represents audio data for a single channel (for example, left or right in
stereo audio).

Contains the raw PCM (Pulse Code Modulation) audio frames for this channel.
Frame values are normalized between -1.0 and 1.0, where 0 represents silence.

Property| Type| Description  
---|---|---  
frames| `number[]`| Array of PCM audio frame values, each between -1.0 and
1.0.  
  
### `AudioSource`

Android

iOS

tvOS

Web

Type: `string` or `number` or `null` or `object` shaped as below:

Property| Type| Description  
---|---|---  
assetId(optional)| `number`| The asset ID of a local audio asset, acquired
with the `require` function. This property is exclusive with the `uri`
property. When both are present, the `assetId` will be ignored.  
headers(optional)| `Record<string, string>`| An object representing the HTTP
headers to send along with the request for a remote audio source. On web
requires the `Access-Control-Allow-Origin` header returned by the server to
include the current domain.  
uri(optional)| `string`| A string representing the resource identifier for the
audio, which could be an HTTPS address, a local file path, or the name of a
static audio file resource.  
  
### `AudioStatus`

Android

iOS

tvOS

Web

Comprehensive status information for an `AudioPlayer`.

This object contains all the current state information about audio playback,
including playback position, duration, loading state, and playback settings.
Used by `useAudioPlayerStatus()` to provide real-time status updates.

Property| Type| Description  
---|---|---  
currentTime| `number`| Current playback position in seconds.  
didJustFinish| `boolean`| Whether the audio just finished playing.  
duration| `number`| Total duration of the audio in seconds, or 0 if not yet
determined.  
id| `number`| Unique identifier for the player instance.  
isBuffering| `boolean`| Whether the player is currently buffering data.  
isLoaded| `boolean`| Whether the audio has finished loading and is ready to
play.  
loop| `boolean`| Whether the audio is set to loop when it reaches the end.  
mute| `boolean`| Whether the player is currently muted.  
playbackRate| `number`| Current playback rate (1.0 = normal speed).  
playbackState| `string`| String representation of the player's internal
playback state.  
playing| `boolean`| Whether the audio is currently playing.  
reasonForWaitingToPlay| `string`| Reason why the player is waiting to play (if
applicable).  
shouldCorrectPitch| `boolean`| Whether pitch correction is enabled for rate
changes.  
timeControlStatus| `string`| String representation of the player's time
control status (playing/paused/waiting).  
  
### `BitRateStrategy`

Android

iOS

tvOS

Web

Literal Type: `string`

Bit rate strategies for audio encoding.

Determines how the encoder manages bit rate during recording, affecting file
size consistency and quality characteristics.

Acceptable values are: `'constant'` | `'longTermAverage'` | `'variableConstrained'` | `'variable'`

### `InterruptionMode`

iOS

Literal Type: `string`

Audio interruption behavior modes for iOS.

Controls how your app's audio interacts with other apps' audio when
interruptions occur. This affects what happens when phone calls,
notifications, or other apps play audio.

Acceptable values are: `'mixWithOthers'` | `'doNotMix'` | `'duckOthers'`

### `InterruptionModeAndroid`

Android

Literal Type: `string`

Audio interruption behavior modes for Android.

Controls how your app's audio interacts with other apps' audio on Android.
Note that Android doesn't support 'mixWithOthers' mode; audio focus is more
strictly managed.

Acceptable values are: `'doNotMix'` | `'duckOthers'`

### `PermissionExpiration`

Android

iOS

tvOS

Web

Literal Type: `union`

Permission expiration time. Currently, all permissions are granted
permanently.

Acceptable values are: `'never'` | `number`

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
  
### `PitchCorrectionQuality`

iOS

Literal Type: `string`

Pitch correction quality settings for audio playback rate changes.

When changing playback rate, pitch correction can be applied to maintain the
original pitch. Different quality levels offer trade-offs between processing
power and audio quality.

Acceptable values are: `'low'` | `'medium'` | `'high'`

### `RecorderState`

Android

iOS

tvOS

Web

Current state information for an `AudioRecorder`.

This object contains detailed information about the recorder's current state,
including recording status, duration, and technical details. This is what you
get when calling `recorder.getStatus()` or using `useAudioRecorderState()`.

Property| Type| Description  
---|---|---  
canRecord| `boolean`| Whether the recorder is ready and able to record.  
durationMillis| `number`| Duration of the current recording in milliseconds.  
isRecording| `boolean`| Whether recording is currently in progress.  
mediaServicesDidReset| `boolean`| Whether the media services have been reset
(typically indicates a system interruption).  
metering(optional)| `number`| Current audio level/volume being recorded (if
metering is enabled).  
url| `string | null`| File URL where the recording will be saved, if available.  
  
### `RecordingEvents`

Android

iOS

tvOS

Web

Event types that an `AudioRecorder` can emit.

These events are used internally by `expo-audio` hooks to provide real-time
status updates. Use `useAudioRecorderState()` or the `statusListener`
parameter in `useAudioRecorder()` instead of subscribing directly.

Property| Type| Description  
---|---|---  
recordingStatusUpdate| `(status: RecordingStatus) => void`| Fired when the
recorder's status changes (start/stop/pause/error, and so on).  
  
### `RecordingInput`

Android

iOS

tvOS

Web

Represents an available audio input device for recording.

This type describes audio input sources like built-in microphones, external
microphones, or other audio input devices that can be used for recording. Each
input has an identifying information that can be used to select the preferred
recording source.

Property| Type| Description  
---|---|---  
name| `string`| Human-readable name of the audio input device.  
type| `string`| Type or category of the input device (for example, 'Built-in
Microphone', 'External Microphone').  
uid| `string`| Unique identifier for the input device, used to select the
input ('Built-in Microphone', 'External Microphone') for recording.  
  
### `RecordingOptions`

Android

iOS

tvOS

Web

Property| Type| Description  
---|---|---  
android| `RecordingOptionsAndroid`| Only for: Android  
Recording options for the Android platform.  
bitRate| `number`| The desired bit rate.Example`128000`  
extension| `string`| The desired file extension.Example`.caf`  
ios| `RecordingOptionsIos`| Only for: iOS  
Recording options for the iOS platform.  
isMeteringEnabled(optional)| `boolean`| A boolean that determines whether
audio level information will be part of the status object under the "metering"
key.  
numberOfChannels| `number`| The desired number of channels.Example`2`  
sampleRate| `number`| The desired sample rate.Example`44100`  
web(optional)| `RecordingOptionsWeb`| Only for: Web  
Recording options for the Web platform.  
  
### `RecordingOptionsAndroid`

Android

Recording configuration options specific to Android.

Android recording uses `MediaRecorder` with options for format, encoder, and
file constraints. These settings control the output format and quality
characteristics.

Property| Type| Description  
---|---|---  
audioEncoder| `AndroidAudioEncoder`| The desired audio encoder. See the
`AndroidAudioEncoder` enum for all valid values.  
extension(optional)| `string`| The desired file extension.Example`.caf`  
maxFileSize(optional)| `number`| The desired maximum file size in bytes, after
which the recording will stop (but `stopAndUnloadAsync()` must still be called
after this point).Example`65536`  
outputFormat| `AndroidOutputFormat`| The desired file format. See the
`AndroidOutputFormat` enum for all valid values.  
sampleRate(optional)| `number`| The desired sample rate.Example`44100`  
  
### `RecordingOptionsIos`

iOS

Recording configuration options specific to iOS.

iOS recording uses `AVAudioRecorder` with extensive format and quality
options. These settings provide fine-grained control over the recording
characteristics.

Property| Type| Description  
---|---|---  
audioQuality| `AudioQuality | number`| The desired audio quality. See the `AudioQuality` enum for all valid values.  
bitDepthHint(optional)| `number`| The desired bit depth hint.Example`16`  
bitRateStrategy(optional)| `number`| The desired bit rate strategy. See the
next section for an enumeration of all valid values of `bitRateStrategy`.  
extension(optional)| `string`| The desired file extension.Example`.caf`  
linearPCMBitDepth(optional)| `number`| The desired PCM bit depth.Example`16`  
linearPCMIsBigEndian(optional)| `boolean`| A boolean describing if the PCM
data should be formatted in big endian.  
linearPCMIsFloat(optional)| `boolean`| A boolean describing if the PCM data
should be encoded in floating point or integral values.  
outputFormat(optional)| `string | IOSOutputFormat | number`| The desired file format. See the `IOSOutputFormat` enum for all valid values.  
sampleRate(optional)| `number`| The desired sample rate.Example`44100`  
  
### `RecordingOptionsWeb`

Web

Recording options for the web.

Web recording uses the `MediaRecorder` API, which has different capabilities
compared to native platforms. These options map directly to `MediaRecorder`
settings.

Property| Type| Description  
---|---|---  
bitsPerSecond(optional)| `number`| Target bits per second for the recording.  
mimeType(optional)| `string`| MIME type for the recording (for example,
'audio/webm', 'audio/mp4').  
  
### `RecordingStartOptions`

Android

iOS

tvOS

Web

Options for controlling how audio recording is started.

Property| Type| Description  
---|---|---  
atTime(optional)| `number`| Only for: iOS  
The time in seconds to wait before starting the recording. If not provided,
recording starts immediately. Platform behavior:

  * Android: Ignored, recording starts immediately
  * iOS: Uses native AVAudioRecorder.record(atTime:) for precise timing.
  * Web: Ignored, recording starts immediately

> On iOS, the recording process starts immediately (you'll see status
> updates), but actual audio capture begins after the specified delay. This is
> not a countdown, since the recorder is active but silent during the delay
> period.  
  
forDuration(optional)| `number`| Only for: AndroidiOSWeb  
The duration in seconds after which recording should automatically stop. If
not provided, recording continues until manually stopped.  
  
### `RecordingStatus`

Android

iOS

tvOS

Web

Status information for recording operations from the event system.

This type represents the status data emitted by `recordingStatusUpdate`
events. It contains high-level information about the recording session and any
errors. Used internally by the event system. Most users should use
`useAudioRecorderState()` instead.

Property| Type| Description  
---|---|---  
error| `string | null`| Error message if an error occurred, `null` otherwise.  
hasError| `boolean`| Whether an error occurred during recording.  
id| `number`| Unique identifier for the recording session.  
isFinished| `boolean`| Whether the recording has finished (stopped).  
url| `string | null`| File URL of the completed recording, if available.  
  
## Enums

### `AudioQuality`

Android

iOS

tvOS

Web

Audio quality levels for recording.

Predefined quality levels that balance file size and audio fidelity. Higher
quality levels produce better sound but larger files and require more
processing power.

#### `MIN`

`AudioQuality.MIN ＝ 0`

Minimum quality: smallest file size, lowest fidelity.

#### `LOW`

`AudioQuality.LOW ＝ 32`

Low quality: good for voice recordings where file size matters.

#### `MEDIUM`

`AudioQuality.MEDIUM ＝ 64`

Medium quality: balanced option for most use cases.

#### `HIGH`

`AudioQuality.HIGH ＝ 96`

High quality: good fidelity, larger file size.

#### `MAX`

`AudioQuality.MAX ＝ 127`

Maximum quality: best fidelity, largest file size.

### `IOSOutputFormat`

iOS

Audio output format options for iOS recording.

Comprehensive enum of audio formats supported by iOS for recording. Each
format has different characteristics in terms of quality, file size, and
compatibility. Some formats like LINEARPCM offer the highest quality but
larger file sizes, while compressed formats like AAC provide good quality with
smaller files.

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

