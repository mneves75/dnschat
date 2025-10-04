# Expo BackgroundTask

[GitHub](https://github.com/expo/expo/tree/sdk-54/packages/expo-background-
task)[Changelog](https://github.com/expo/expo/tree/sdk-54/packages/expo-
background-task/CHANGELOG.md)[npm](https://www.npmjs.com/package/expo-
background-task)

Ask AI

A library that provides an API for running background tasks.

[GitHub](https://github.com/expo/expo/tree/sdk-54/packages/expo-background-
task)[Changelog](https://github.com/expo/expo/tree/sdk-54/packages/expo-
background-task/CHANGELOG.md)[npm](https://www.npmjs.com/package/expo-
background-task)

Ask AI

Android

iOS

tvOS

Bundled version:

~1.0.8

Copy

* * *

`expo-background-task` provides an API to run deferrable background tasks in a
way that optimizes battery and power consumption on the end user's device.
This module uses the
[`WorkManager`](https://developer.android.com/topic/libraries/architecture/workmanager)
API on Android and the
[`BGTaskScheduler`](https://developer.apple.com/documentation/backgroundtasks/bgtaskscheduler)
API on iOS to schedule tasks. It also uses the [`expo-task-
manager`](/versions/latest/sdk/task-manager) Native API to run JavaScript
tasks.

[![Watch: Expo Background Task Deep
Dive](https://i3.ytimg.com/vi/4lFus7TvayI/maxresdefault.jpg)Watch: Expo
Background Task Deep Dive](https://www.youtube.com/watch?v=4lFus7TvayI)

## Background tasks

A background task is a deferrable unit of work that is performed in the
background, outside your app's lifecycle. This is useful for tasks that need
to be executed when the app is inactive, such as syncing data with a server,
fetching new content, or even checking if there are any [`expo-
updates`](/versions/latest/sdk/updates).

### When are background tasks run?

The Expo Background Task API leverages each platform to execute tasks at the
most optimal time for both the user and the device when the app is in the
background.

This means that the task may not run immediately after it is scheduled, but it
will run at some point in the future if the system decides so. You can specify
a minimum interval in minutes for the task to run. The task will execute
sometime after the interval has passed, provided the specified conditions are
met.

A background task will only run if the battery has enough charge (or the
device is plugged into power) and the network is available. Without these
conditions, the task won't execute. The exact behavior will vary depending on
the operating system.

### When will they be stopped?

Background tasks are managed by platform APIs and system constraints. Knowing
when tasks stop helps plan their use effectively.

  * Background tasks are stopped if the user kills the app. Tasks resume when the app is restarted.
  * If the system stops the app or the device reboots, background tasks will resume, and the app will be restarted.

On Android, removing an app from the recent apps list doesn't completely stop
it, whereas on iOS, swiping it away in the app switcher fully terminates it.

> On Android, behavior varies by device vendor. For example, some
> implementations treat removing an app from the recent apps list as killing
> it. Read more about these differences here: <https://dontkillmyapp.com>.

## Platform differences

### Android

Android

On Android, the
[`WorkManager`](https://developer.android.com/topic/libraries/architecture/workmanager)
API allows specifying a minimum interval for a task to run (minimum 15
minutes). The task will execute sometime after the interval has passed,
provided the specified conditions are met.

### iOS

iOS

On iOS, the
[`BGTaskScheduler`](https://developer.apple.com/documentation/backgroundtasks/bgtaskscheduler)
API decides the best time to launch your background task. The system will
consider the battery level, the network availability, and the user's usage
patterns to determine when to run the task. You can still specify a minimum
interval for the task to run, but the system may choose to run the task at a
later time.

## Known limitations

### iOS

iOS

The [`Background
Tasks`](https://developer.apple.com/documentation/backgroundtasks) API is
unavailable on iOS simulators. It is only available when running on a physical
device.

## Installation

Terminal

Copy

`- ``npx expo install expo-background-task`

If you are installing this in an [existing React Native app](/bare/overview),
make sure to [install `expo`](/bare/installing-expo-modules) in your project.

## Configuration

iOS

To be able to run background tasks on iOS, you need to add the `processing`
value to the `UIBackgroundModes` array in your app's Info.plist file. This is
required for background fetch to work properly.

If you're using [CNG](/workflow/continuous-native-generation), the required
`UIBackgroundModes` configuration will be applied automatically by prebuild.

Configure UIBackgroundModes manually on iOS

If you're not using Continuous Native Generation ([CNG](/workflow/continuous-
native-generation)), then you'll need to add the following to your Info.plist
file:

ios/project-name/Supporting/Info.plist

Copy

    
    
    <key>UIBackgroundModes</key>
      <array>
        <string>processing</string>
      </array>
    </key>
    

## Usage

Below is an example that demonstrates how to use `expo-background-task`.

App.tsx

Copy

    
    
    import * as BackgroundTask from 'expo-background-task';
    import * as TaskManager from 'expo-task-manager';
    import { useEffect, useState } from 'react';
    import { StyleSheet, Text, View, Button } from 'react-native';
    
    const BACKGROUND_TASK_IDENTIFIER = 'background-task';
    
    // Register and create the task so that it is available also when the background task screen
    // (a React component defined later in this example) is not visible.
    // Note: This needs to be called in the global scope, not in a React component.
    TaskManager.defineTask(BACKGROUND_TASK_IDENTIFIER, async () => {
      try {
        const now = Date.now();
        console.log(`Got background task call at date: ${new Date(now).toISOString()}`);
      } catch (error) {
        console.error('Failed to execute the background task:', error);
        return BackgroundTask.BackgroundTaskResult.Failed;
      }
      return BackgroundTask.BackgroundTaskResult.Success;
    });
    
    // 2. Register the task at some point in your app by providing the same name
    // Note: This does NOT need to be in the global scope and CAN be used in your React components!
    async function registerBackgroundTaskAsync() {
      return BackgroundTask.registerTaskAsync(BACKGROUND_TASK_IDENTIFIER);
    }
    
    // 3. (Optional) Unregister tasks by specifying the task name
    // This will cancel any future background task calls that match the given name
    // Note: This does NOT need to be in the global scope and CAN be used in your React components!
    async function unregisterBackgroundTaskAsync() {
      return BackgroundTask.unregisterTaskAsync(BACKGROUND_TASK_IDENTIFIER);
    }
    
    export default function BackgroundTaskScreen() {
      const [isRegistered, setIsRegistered] = useState<boolean>(false);
      const [status, setStatus] = useState<BackgroundTask.BackgroundTaskStatus | null>(null);
    
      useEffect(() => {
        updateAsync();
      }, []);
    
      const updateAsync = async () => {
        const status = await BackgroundTask.getStatusAsync();
        setStatus(status);
        const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_TASK_IDENTIFIER);
        setIsRegistered(isRegistered);
      };
    
      const toggle = async () => {
        if (!isRegistered) {
          await registerBackgroundTaskAsync();
        } else {
          await unregisterBackgroundTaskAsync();
        }
        await updateAsync();
      };
    
      return (
        <View style={styles.screen}>
          <View style={styles.textContainer}>
            <Text>
              Background Task Service Availability:{' '}
              <Text style={styles.boldText}>
                {status ? BackgroundTask.BackgroundTaskStatus[status] : null}
              </Text>
            </Text>
          </View>
          <Button
            disabled={status === BackgroundTask.BackgroundTaskStatus.Restricted}
            title={isRegistered ? 'Cancel Background Task' : 'Schedule Background Task'}
            onPress={toggle}
          />
          <Button title="Check Background Task Status" onPress={updateAsync} />
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
    

## Multiple background tasks

Since the Background Tasks API on iOS and the WorkManager API on Android limit
the number of tasks that can be scheduled for a single app, Expo Background
Task uses a single worker on both platforms. While you can define multiple
JavaScript background tasks, they will all run through this single worker.

The last registered background task determines the minimum interval for
execution.

## Testing background tasks

Background tasks can be tested using the
[`triggerTaskWorkerForTestingAsync`](/versions/latest/sdk/background-
task#backgroundtasktriggertaskworkerfortestingasync) method. This method will
run all registered tasks directly on Android and invoke the `BGTaskScheduler`
on iOS. This is useful for testing the behavior of your background tasks
without having to wait for the system to trigger them.

This method is only available in development mode. It will not work in
production builds.

    
    
    import * as BackgroundTask from 'expo-background-task';
    import { Button } from 'react-native';
    
    function App() {
      const triggerTask = async () => {
        await BackgroundTask.triggerTaskWorkerForTestingAsync();
      };
    
      return <Button title="Trigger Background Task" onPress={triggerTask} />;
    }
    

## Inspecting background tasks

Android

To troubleshoot or debug issues with background tasks on Android, use the
`adb` tool included with the Android SDK to inspect scheduled tasks:

Terminal

Copy

`- ``adb shell dumpsys jobscheduler | grep -A 40 -m 1 -E "JOB #.* <package-name>"`

The output from this command will show you the scheduled tasks for your app,
including their status, constraints, and other information. Look for the `JOB`
line to find the ID of the job and other details in the output:

    
    
    JOB #u0a453/275: 216a359 <package-name>/androidx.work.impl.background.systemjob.SystemJobService
      u0a453 tag=*job*/<package-name>/androidx.work.impl.background.systemjob.SystemJobService#275
      Source: uid=u0a453 user=0 pkg=<package-name>
      ...
      Required constraints: TIMING_DELAY CONNECTIVITY UID_NOT_RESTRICTED [0x90100000]
      Preferred constraints:
      Dynamic constraints:
      Satisfied constraints: CONNECTIVITY DEVICE_NOT_DOZING BACKGROUND_NOT_RESTRICTED TARE_WEALTH WITHIN_QUOTA UID_NOT_RESTRICTED [0x1b500000]
      Unsatisfied constraints: TIMING_DELAY [0x80000000]
      ...
      Enqueue time: -8m12s280ms
      Run time: earliest=+6m47s715ms, latest=none, original latest=none
      Restricted due to: none.
      Ready: false (job=false user=true !restricted=true !pending=true !active=true !backingup=true comp=true)
    

The first line contains the Job ID (275). The `Run time: earliest` value
indicates the earliest time the task may start, while `enqueue time` shows how
long ago the task was scheduled.

To force a task to run, use the `adb shell am broadcast` command. Move your
app to the background before running this command, as the task will not run if
the app is in the foreground.

Terminal

Copy

`- ``adb shell cmd jobscheduler run -f <package-name> <JOB_ID>`

Where `JOB_ID` would be the identifier of the job you want to run that you
found in the previous step.

## Troubleshooting background tasks

iOS

iOS does not have a tool similar to `adb` for inspecting background tasks. To
test background tasks on iOS, use the built-in
[`triggerTaskWorkerForTestingAsync`](/versions/latest/sdk/background-
task#backgroundtasktriggertaskworkerfortestingasync) method. This method
simulates the system triggering the task.

You can trigger this method from your app in debug mode (it does not work in
production builds) to test the behavior of your background tasks without
waiting for the system. If your background task configuration is incorrect,
you will see the error description in the Xcode console:

    
    
    No task request with identifier com.expo.modules.backgroundtask.processing has been scheduled
    

The above error tells you that you need to run prebuild to apply the changes
to your app's configuration.

This error also means you must run prebuild to apply your background task
configuration to the app. Additionally, ensure you have defined and registered
a background task as shown in [this example](/versions/latest/sdk/background-
task#usage).

## API

    
    
    import * as BackgroundTask from 'expo-background-task';
    

## Methods

### `BackgroundTask.getStatusAsync()`

Android

iOS

tvOS

Returns the status for the Background Task API. On web, it always returns
`BackgroundTaskStatus.Restricted`, while on native platforms it returns
`BackgroundTaskStatus.Available`.

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<BackgroundTaskStatus>`

A BackgroundTaskStatus enum value or `null` if not available.

### `BackgroundTask.registerTaskAsync(taskName, options)`

Android

iOS

tvOS

Parameter| Type| Description  
---|---|---  
taskName| `string`| Name of the task to register. The task needs to be defined
first - see [`TaskManager.defineTask`](/versions/latest/sdk/task-
manager#taskmanagerdefinetasktaskname-taskexecutor) for more details.  
options(optional)| `BackgroundTaskOptions`| An object containing the
background task options.Default:`{}`  
  
  

Registers a background task with the given name. Registered tasks are saved in
persistent storage and restored once the app is initialized.

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<void>`

Example

    
    
    import * as TaskManager from 'expo-task-manager';
    
    // Register the task outside of the component
    TaskManager.defineTask(BACKGROUND_TASK_IDENTIFIER, () => {
      try {
        await AsyncStorage.setItem(LAST_TASK_DATE_KEY, Date.now().toString());
      } catch (error) {
        console.error('Failed to save the last fetch date', error);
        return BackgroundTaskResult.Failed;
      }
      return BackgroundTaskResult.Success;
    });
    

You can now use the `registerTaskAsync` function to register the task:

    
    
    BackgroundTask.registerTaskAsync(BACKGROUND_TASK_IDENTIFIER, {});
    

### `BackgroundTask.triggerTaskWorkerForTestingAsync()`

Android

iOS

tvOS

When in debug mode this function will trigger running the background tasks.
This function will only work for apps built in debug mode. This method is only
available in development mode. It will not work in production builds.

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<boolean>`

A promise which fulfils when the task is triggered.

### `BackgroundTask.unregisterTaskAsync(taskName)`

Android

iOS

tvOS

Parameter| Type| Description  
---|---|---  
taskName| `string`| Name of the task to unregister.  
  
  

Unregisters a background task, so the application will no longer be executing
this task.

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<void>`

A promise which fulfils when the task is fully unregistered.

## Types

### `BackgroundTaskOptions`

Android

iOS

tvOS

Options for registering a background task

Property| Type| Description  
---|---|---  
minimumInterval(optional)| `number`| Inexact interval in minutes between
subsequent repeats of the background tasks. The final interval may differ from
the specified one to minimize wakeups and battery usage.

  * Defaults to once every 12 hours (The minimum interval is 15 minutes)
  * The system controls the background task execution interval and treats the specified value as a minimum delay. Tasks won't run exactly on schedule. On iOS, short intervals are often ignored—the system typically runs background tasks during specific windows, such as overnight.

  
  
## Enums

### `BackgroundTaskResult`

Android

iOS

tvOS

Return value for background tasks.

#### `Success`

`BackgroundTaskResult.Success ＝ 1`

The task finished successfully.

#### `Failed`

`BackgroundTaskResult.Failed ＝ 2`

The task failed.

### `BackgroundTaskStatus`

Android

iOS

tvOS

Availability status for background tasks

#### `Restricted`

`BackgroundTaskStatus.Restricted ＝ 1`

Background tasks are unavailable.

#### `Available`

`BackgroundTaskStatus.Available ＝ 2`

Background tasks are available for the app.

