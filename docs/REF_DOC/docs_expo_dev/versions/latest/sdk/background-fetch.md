# Expo BackgroundFetch

[GitHub](https://github.com/expo/expo/tree/sdk-54/packages/expo-background-
fetch)[Changelog](https://github.com/expo/expo/tree/sdk-54/packages/expo-
background-fetch/CHANGELOG.md)[npm](https://www.npmjs.com/package/expo-
background-fetch)

Ask AI

A library that provides API for performing background fetch tasks.

[GitHub](https://github.com/expo/expo/tree/sdk-54/packages/expo-background-
fetch)[Changelog](https://github.com/expo/expo/tree/sdk-54/packages/expo-
background-fetch/CHANGELOG.md)[npm](https://www.npmjs.com/package/expo-
background-fetch)

Ask AI

Android

iOS

Bundled version:

~14.0.7

Copy

* * *

> Deprecated: The `expo-background-fetch` library is being replaced by a new
> version in [`expo-background-task`](/versions/latest/sdk/background-task).
> `expo-background-fetch` is not receiving patches and will be removed in an
> upcoming release.

`expo-background-fetch` provides an API to perform [background
fetch](https://developer.apple.com/documentation/uikit/core_app/managing_your_app_s_life_cycle/preparing_your_app_to_run_in_the_background/updating_your_app_with_background_app_refresh)
tasks, allowing you to run specific code periodically in the background to
update your app. This module uses [TaskManager](/versions/latest/sdk/task-
manager) Native API under the hood.

#### Known issues

iOS

`BackgroundFetch` only works when the app is backgrounded, not if the app was
terminated or upon device reboot. You can check out [the relevant GitHub
issue](https://github.com/expo/expo/issues/3582) for more details.

On iOS the `BackgroundFetch` library requires you to use a [development
build](/develop/development-builds/introduction) since Background Fetch is not
enabled in the iOS Expo Go app.

## Installation

Terminal

Copy

`- ``npx expo install expo-background-fetch`

If you are installing this in an [existing React Native app](/bare/overview),
make sure to [install `expo`](/bare/installing-expo-modules) in your project.

## Configuration

iOS

To be able to run background fetch tasks on iOS, you need to add the `fetch`
value to the `UIBackgroundModes` array in your app's Info.plist file. This is
required for background fetch to work properly.

If you're using [CNG](/workflow/continuous-native-generation), the required
`UIBackgroundModes` configuration will be applied automatically by prebuild.

Configure UIBackgroundModes manually on iOS

If you're not using Continuous Native Generation ([CNG](/workflow/continuous-
native-generation)) or you're using a native ios project manually, then you'll
need to add the following to your Expo.plist file:

ios/project-name/Supporting/Expo.plist

Copy

    
    
    <key>UIBackgroundModes</key>
    <array>
      <string>fetch</string>
    </array>
    

## Usage

Below is an example that demonstrates how to use `expo-background-fetch`.

Background Fetch Usage

Copy

Open in Snack

    
    
    import { useState, useEffect } from 'react';
    import { StyleSheet, Text, View, Button } from 'react-native';
    import * as BackgroundFetch from 'expo-background-fetch';
    import * as TaskManager from 'expo-task-manager';
    
    const BACKGROUND_FETCH_TASK = 'background-fetch';
    
    // 1. Define the task by providing a name and the function that should be executed
    // Note: This needs to be called in the global scope (e.g outside of your React components)
    TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
      const now = Date.now();
    
      console.log(`Got background fetch call at date: ${new Date(now).toISOString()}`);
    
      // Be sure to return the successful result type!
      return BackgroundFetch.BackgroundFetchResult.NewData;
    });
    
    // 2. Register the task at some point in your app by providing the same name,
    // and some configuration options for how the background fetch should behave
    // Note: This does NOT need to be in the global scope and CAN be used in your React components!
    async function registerBackgroundFetchAsync() {
      return BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
        minimumInterval: 60 * 15, // 15 minutes
        stopOnTerminate: false, // android only,
        startOnBoot: true, // android only
      });
    }
    
    // 3. (Optional) Unregister tasks by specifying the task name
    // This will cancel any future background fetch calls that match the given name
    // Note: This does NOT need to be in the global scope and CAN be used in your React components!
    async function unregisterBackgroundFetchAsync() {
      return BackgroundFetch.unregisterTaskAsync(BACKGROUND_FETCH_TASK);
    }
    
    export default function BackgroundFetchScreen() {
      const [isRegistered, setIsRegistered] = useState(false);
      const [status, setStatus] = useState(null);
    
      useEffect(() => {
        checkStatusAsync();
      }, []);
    
      const checkStatusAsync = async () => {
        const status = await BackgroundFetch.getStatusAsync();
        const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_FETCH_TASK);
        setStatus(status);
        setIsRegistered(isRegistered);
      };
    
      const toggleFetchTask = async () => {
        if (isRegistered) {
          await unregisterBackgroundFetchAsync();
        } else {
          await registerBackgroundFetchAsync();
        }
    
        checkStatusAsync();
      };
    
      return (
        <View style={styles.screen}>
          <View style={styles.textContainer}>
            <Text>
              Background fetch status:{' '}
              <Text style={styles.boldText}>
                {status && BackgroundFetch.BackgroundFetchStatus[status]}
              </Text>
            </Text>
            <Text>
              Background fetch task name:{' '}
              <Text style={styles.boldText}>
                {isRegistered ? BACKGROUND_FETCH_TASK : 'Not registered yet!'}
              </Text>
            </Text>
          </View>
          <View style={styles.textContainer}></View>
          <Button
            title={isRegistered ? 'Unregister BackgroundFetch task' : 'Register BackgroundFetch task'}
            onPress={toggleFetchTask}
          />
        </View>
      );
    }
    
    const styles = StyleSheet.create({
      screen: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      },
      textContainer: {
        margin: 10,
      },
      boldText: {
        fontWeight: 'bold',
      },
    });
    

## Triggering background fetches

Background fetches can be difficult to test because they can happen
inconsistently. Fortunately, you can trigger background fetches manually when
developing your apps.

For iOS, you can use the `Instruments` app on macOS to manually trigger
background fetches:

  1. Open the Instruments app. The Instruments app can be searched through Spotlight (⌘ + Space) or opened from `/Applications/Xcode.app/Contents/Applications/Instruments.app`
  2. Select `Time Profiler`
  3. Select your device / simulator and pick the `Expo Go` app
  4. Press the `Record` button in the top left corner
  5. Navigate to the `Document` Menu and select `Simulate Background Fetch - Expo Go`:

![Xcode Menu with Simulate Background Fetch option](/static/images/simulate-
background-fetch-instruments.png)

For Android, you can set the `minimumInterval` option of your task to a small
number and background your application like so:

    
    
    async function registerBackgroundFetchAsync() {
      return BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
        minimumInterval: 1 * 60, // task will fire 1 minute after app is backgrounded
      });
    }
    

## API

    
    
    import * as BackgroundFetch from 'expo-background-fetch';
    

## Methods

> Deprecated Use [`getStatusAsync()`](/versions/latest/sdk/background-
> task#backgroundtaskgetstatusasync) from `expo-background-task` instead. The
> `expo-background-fetch` package has been deprecated.

### `BackgroundFetch.getStatusAsync()`

Android

iOS

Gets a status of background fetch.

Returns:

`[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<BackgroundFetchStatus | null>`

Returns a promise which fulfils with one of `BackgroundFetchStatus` enum
values.

> Deprecated Use [`registerTaskAsync()`](/versions/latest/sdk/background-
> task#backgroundtaskregistertaskasynctaskname-options) from `expo-background-
> task` instead. The `expo-background-fetch` package has been deprecated.

### `BackgroundFetch.registerTaskAsync(taskName, options)`

Android

iOS

Parameter| Type| Description  
---|---|---  
taskName| `string`| Name of the task to register. The task needs to be defined
first - see [`TaskManager.defineTask`](/versions/latest/sdk/task-
manager#taskmanagerdefinetaskttaskname-taskexecutor) for more details.  
options(optional)| `BackgroundFetchOptions`| An object containing the
background fetch options.Default:`{}`  
  
  

Registers background fetch task with given name. Registered tasks are saved in
persistent storage and restored once the app is initialized.

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<void>`

Example

    
    
    import * as BackgroundFetch from 'expo-background-fetch';
    import * as TaskManager from 'expo-task-manager';
    
    TaskManager.defineTask(YOUR_TASK_NAME, () => {
      try {
        const receivedNewData = // do your background fetch here
        return receivedNewData ? BackgroundFetch.BackgroundFetchResult.NewData : BackgroundFetch.BackgroundFetchResult.NoData;
      } catch (error) {
        return BackgroundFetch.BackgroundFetchResult.Failed;
      }
    });
    

> Deprecated Use the [`registerTaskAsync()`](/versions/latest/sdk/background-
> task#backgroundtaskregistertaskasynctaskname-options) method from expo-
> background-task package, and specify
> [`BackgroundTaskOptions`](/versions/latest/sdk/background-
> task#backgroundtaskoptions) argument instead, when setting task interval
> time.

### `BackgroundFetch.setMinimumIntervalAsync(minimumInterval)`

Android

iOS

Parameter| Type| Description  
---|---|---  
minimumInterval| `number`| Number of seconds that must elapse before another
background fetch can be called.  
  
  

Sets the minimum number of seconds that must elapse before another background
fetch can be initiated. This value is advisory only and does not indicate the
exact amount of time expected between fetch operations.

> This method doesn't take any effect on Android. It is a global value which
> means that it can overwrite settings from another application opened through
> Expo Go.

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<void>`

A promise which fulfils once the minimum interval is set.

> Deprecated Use [`unregisterTaskAsync()`](/versions/latest/sdk/background-
> task#backgroundtaskunregistertaskasynctaskname) from `expo-background-task`
> instead. The `expo-background-fetch` package has been deprecated.

### `BackgroundFetch.unregisterTaskAsync(taskName)`

Android

iOS

Parameter| Type| Description  
---|---|---  
taskName| `string`| Name of the task to unregister.  
  
  

Unregisters background fetch task, so the application will no longer be
executing this task.

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<void>`

A promise which fulfils when the task is fully unregistered.

## Interfaces

### `BackgroundFetchOptions`

Android

iOS

Property| Type| Description  
---|---|---  
minimumInterval(optional)| `number`| Inexact interval in seconds between
subsequent repeats of the background fetch alarm. The final interval may
differ from the specified one to minimize wakeups and battery usage.

  * On Android it defaults to 10 minutes,
  * On iOS it calls `BackgroundFetch.setMinimumIntervalAsync` behind the scenes and the default value is the smallest fetch interval supported by the system (10-15 minutes). Background fetch task receives no data, but your task should return a value that best describes the results of your background fetch work.

  
startOnBoot(optional)| `boolean`| Only for: Android  
Whether to restart background fetch events when the device has finished
booting.Default:`false`  
stopOnTerminate(optional)| `boolean`| Only for: Android  
Whether to stop receiving background fetch events after user terminates the
app.Default:`true`  
  
## Enums

### `BackgroundFetchResult`

Android

iOS

This return value is to let iOS know what the result of your background fetch
was, so the platform can better schedule future background fetches. Also, your
app has up to 30 seconds to perform the task, otherwise your app will be
terminated and future background fetches may be delayed.

#### `NoData`

`BackgroundFetchResult.NoData ＝ 1`

There was no new data to download.

#### `NewData`

`BackgroundFetchResult.NewData ＝ 2`

New data was successfully downloaded.

#### `Failed`

`BackgroundFetchResult.Failed ＝ 3`

An attempt to download data was made but that attempt failed.

### `BackgroundFetchStatus`

Android

iOS

#### `Denied`

`BackgroundFetchStatus.Denied ＝ 1`

The user explicitly disabled background behavior for this app or for the whole
system.

#### `Restricted`

`BackgroundFetchStatus.Restricted ＝ 2`

Background updates are unavailable and the user cannot enable them again. This
status can occur when, for example, parental controls are in effect for the
current user.

#### `Available`

`BackgroundFetchStatus.Available ＝ 3`

Background updates are available for the app.

## Permissions

### Android

On Android, this module might listen when the device is starting up. It's
necessary to continue working on tasks started with `startOnBoot`. It also
keeps devices "awake" that are going idle and asleep fast, to improve
reliability of the tasks. Because of this both the `RECEIVE_BOOT_COMPLETED`
and `WAKE_LOCK` permissions are added automatically.

Android Permission| Description  
---|---  
`RECEIVE_BOOT_COMPLETED`| Allows an application to receive the
Intent.ACTION_BOOT_COMPLETED that is broadcast after the system finishes
booting.

> Allows an application to receive the
> `[Intent.ACTION_BOOT_COMPLETED](https://developer.android.com/reference/android/content/Intent#ACTION_BOOT_COMPLETED)`
> that is broadcast after the system finishes booting. If you don't request
> this permission, you will not receive the broadcast at that time. Though
> holding this permission does not have any security implications, it can have
> a negative impact on the user experience by increasing the amount of time it
> takes the system to start and allowing applications to have themselves
> running without the user being aware of them. As such, you must explicitly
> declare your use of this facility to make that visible to the user.  
  
`WAKE_LOCK`| Allows using PowerManager WakeLocks to keep processor from
sleeping or screen from dimming.

