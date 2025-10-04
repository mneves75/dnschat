On this page

# AppRegistry

### Project with Native Code Required

If you are using the managed Expo workflow there is only ever one entry
component registered with `AppRegistry` and it is handled automatically (or
through
[registerRootComponent](https://docs.expo.dev/versions/latest/sdk/register-
root-component/)). You do not need to use this API.

`AppRegistry` is the JS entry point to running all React Native apps. App root
components should register themselves with `AppRegistry.registerComponent`,
then the native system can load the bundle for the app and then actually run
the app when it's ready by invoking `AppRegistry.runApplication`.

tsx

    
    
    import {Text, AppRegistry} from 'react-native';  
      
    const App = () => (  
      <View>  
        <Text>App1</Text>  
      </View>  
    );  
      
    AppRegistry.registerComponent('Appname', () => App);  
    

To "stop" an application when a view should be destroyed, call
`AppRegistry.unmountApplicationComponentAtRootTag` with the tag that was
passed into `runApplication`. These should always be used as a pair.

`AppRegistry` should be required early in the `require` sequence to make sure
the JS execution environment is setup before other modules are required.

* * *

# Reference

## Methods​

### `getAppKeys()`​

tsx

    
    
    static getAppKeys(): string[];  
    

Returns an array of strings.

* * *

### `getRegistry()`​

tsx

    
    
    static getRegistry(): {sections: string[]; runnables: Runnable[]};  
    

Returns a [Registry](/docs/appregistry#registry) object.

* * *

### `getRunnable()`​

tsx

    
    
    static getRunnable(appKey: string): : Runnable | undefined;  
    

Returns a [Runnable](/docs/appregistry#runnable) object.

**Parameters:**

Name| Type  
---|---  
appKey Required| string  
  
* * *

### `getSectionKeys()`​

tsx

    
    
    static getSectionKeys(): string[];  
    

Returns an array of strings.

* * *

### `getSections()`​

tsx

    
    
    static getSections(): Record<string, Runnable>;  
    

Returns a [Runnables](/docs/appregistry#runnables) object.

* * *

### `registerCancellableHeadlessTask()`​

tsx

    
    
    static registerCancellableHeadlessTask(  
      taskKey: string,  
      taskProvider: TaskProvider,  
      taskCancelProvider: TaskCancelProvider,  
    );  
    

Register a headless task which can be cancelled. A headless task is a bit of
code that runs without a UI.

**Parameters:**

Name| Type| Description  
---|---|---  
taskKey  
Required| string| The native id for this task instance that was used when
startHeadlessTask was called.  
taskProvider  
Required| [TaskProvider](/docs/appregistry#taskprovider)| A promise returning
function that takes some data passed from the native side as the only
argument. When the promise is resolved or rejected the native side is notified
of this event and it may decide to destroy the JS context.  
taskCancelProvider  
Required| [TaskCancelProvider](/docs/appregistry#taskcancelprovider)| a void
returning function that takes no arguments; when a cancellation is requested,
the function being executed by taskProvider should wrap up and return ASAP.  
  
* * *

### `registerComponent()`​

tsx

    
    
    static registerComponent(  
      appKey: string,  
      getComponentFunc: ComponentProvider,  
      section?: boolean,  
    ): string;  
    

**Parameters:**

Name| Type  
---|---  
appKey Required| string  
componentProvider Required| ComponentProvider  
section| boolean  
  
* * *

### `registerConfig()`​

tsx

    
    
    static registerConfig(config: AppConfig[]);  
    

**Parameters:**

Name| Type  
---|---  
config Required| [AppConfig](/docs/appregistry#appconfig)[]  
  
* * *

### `registerHeadlessTask()`​

tsx

    
    
    static registerHeadlessTask(  
      taskKey: string,  
      taskProvider: TaskProvider,  
    );  
    

Register a headless task. A headless task is a bit of code that runs without a
UI.

This is a way to run tasks in JavaScript while your app is in the background.
It can be used, for example, to sync fresh data, handle push notifications, or
play music.

**Parameters:**

Name| Type| Description  
---|---|---  
taskKey Required| string| The native id for this task instance that was used
when startHeadlessTask was called.  
taskProvider Required| [TaskProvider](/docs/appregistry#taskprovider)| A
promise returning function that takes some data passed from the native side as
the only argument. When the promise is resolved or rejected the native side is
notified of this event and it may decide to destroy the JS context.  
  
* * *

### `registerRunnable()`​

tsx

    
    
    static registerRunnable(appKey: string, func: Runnable): string;  
    

**Parameters:**

Name| Type  
---|---  
appKey Required| string  
run Required| function  
  
* * *

### `registerSection()`​

tsx

    
    
    static registerSection(  
      appKey: string,  
      component: ComponentProvider,  
    );  
    

**Parameters:**

Name| Type  
---|---  
appKey Required| string  
component Required| ComponentProvider  
  
* * *

### `runApplication()`​

tsx

    
    
    static runApplication(appKey: string, appParameters: any): void;  
    

Loads the JavaScript bundle and runs the app.

**Parameters:**

Name| Type  
---|---  
appKey Required| string  
appParameters Required| any  
  
* * *

### `setComponentProviderInstrumentationHook()`​

tsx

    
    
    static setComponentProviderInstrumentationHook(  
      hook: ComponentProviderInstrumentationHook,  
    );  
    

**Parameters:**

Name| Type  
---|---  
hook Required| function  
  
A valid `hook` function accepts the following as arguments:

Name| Type  
---|---  
component Required| ComponentProvider  
scopedPerformanceLogger Required| IPerformanceLogger  
  
The function must also return a React Component.

* * *

### `setWrapperComponentProvider()`​

tsx

    
    
    static setWrapperComponentProvider(  
      provider: WrapperComponentProvider,  
    );  
    

**Parameters:**

Name| Type  
---|---  
provider Required| ComponentProvider  
  
* * *

### `startHeadlessTask()`​

tsx

    
    
    static startHeadlessTask(  
      taskId: number,  
      taskKey: string,  
      data: any,  
    );  
    

Only called from native code. Starts a headless task.

**Parameters:**

Name| Type| Description  
---|---|---  
taskId Required| number| The native id for this task instance to keep track of
its execution.  
taskKey Required| string| The key for the task to start.  
data Required| any| The data to pass to the task.  
  
* * *

### `unmountApplicationComponentAtRootTag()`​

tsx

    
    
    static unmountApplicationComponentAtRootTag(rootTag: number);  
    

Stops an application when a view should be destroyed.

**Parameters:**

Name| Type  
---|---  
rootTag Required| number  
  
## Type Definitions​

### AppConfig​

Application configuration for the `registerConfig` method.

Type  
---  
object  
  
**Properties:**

Name| Type  
---|---  
appKey Required| string  
component| ComponentProvider  
run| function  
section| boolean  
  
> **Note:** Every config is expected to set either `component` or `run`
> function.

### Registry​

Type  
---  
object  
  
**Properties:**

Name| Type  
---|---  
runnables| array of [Runnables](/docs/appregistry#runnable)  
sections| array of strings  
  
### Runnable​

Type  
---  
object  
  
**Properties:**

Name| Type  
---|---  
component| ComponentProvider  
run| function  
  
### Runnables​

An object with key of `appKey` and value of type of
[`Runnable`](/docs/appregistry#runnable).

Type  
---  
object  
  
### Task​

A `Task` is a function that accepts any data as argument and returns a Promise
that resolves to `undefined`.

Type  
---  
function  
  
### TaskCanceller​

A `TaskCanceller` is a function that accepts no argument and returns void.

Type  
---  
function  
  
### TaskCancelProvider​

A valid `TaskCancelProvider` is a function that returns a
[`TaskCanceller`](/docs/appregistry#taskcanceller).

Type  
---  
function  
  
### TaskProvider​

A valid `TaskProvider` is a function that returns a
[`Task`](/docs/appregistry#task).

Type  
---  
function  
  
[Edit page for next release](https://github.com/facebook/react-native-
website/edit/main/docs/appregistry.md)[Edit page for current
release](https://github.com/facebook/react-native-
website/edit/main/website/versioned_docs/version-0.81/appregistry.md)

Last updated on **Aug 12, 2025**

[ PreviousAppearance](/docs/appearance)[NextAppState](/docs/appstate)

  * Methods
    * `getAppKeys()`
    * `getRegistry()`
    * `getRunnable()`
    * `getSectionKeys()`
    * `getSections()`
    * `registerCancellableHeadlessTask()`
    * `registerComponent()`
    * `registerConfig()`
    * `registerHeadlessTask()`
    * `registerRunnable()`
    * `registerSection()`
    * `runApplication()`
    * `setComponentProviderInstrumentationHook()`
    * `setWrapperComponentProvider()`
    * `startHeadlessTask()`
    * `unmountApplicationComponentAtRootTag()`
  * Type Definitions
    * AppConfig
    * Registry
    * Runnable
    * Runnables
    * Task
    * TaskCanceller
    * TaskCancelProvider
    * TaskProvider

