# @react-native-community/netinfo

[GitHub](https://github.com/react-native-community/react-native-
netinfo)[npm](https://www.npmjs.com/package/@react-native-community/netinfo)

Ask AI

A cross-platform API that provides access to network information.

[GitHub](https://github.com/react-native-community/react-native-
netinfo)[npm](https://www.npmjs.com/package/@react-native-community/netinfo)

Ask AI

Android

iOS

tvOS

Web

Bundled version:

11.4.1

Copy

* * *

`@react-native-community/netinfo` allows you to get information about
connection type and connection quality.

## Installation

Terminal

Copy

`- ``npx expo install @react-native-community/netinfo`

If you are installing this in an [existing React Native app](/bare/overview),
make sure to [install `expo`](/bare/installing-expo-modules) in your project.
Then, follow the [installation instructions](https://github.com/react-native-
community/react-native-netinfo#getting-started) provided in the library's
README or documentation.

## API

To import this library, use:

    
    
    import NetInfo from '@react-native-community/netinfo';
    

If you want to grab information about the network connection just once, you
can use:

    
    
    NetInfo.fetch().then(state => {
      console.log('Connection type', state.type);
      console.log('Is connected?', state.isConnected);
    });
    

Or, if you'd rather subscribe to updates about the network state (which then
allows you to run code/perform actions anytime the network state changes) use:

    
    
    const unsubscribe = NetInfo.addEventListener(state => {
      console.log('Connection type', state.type);
      console.log('Is connected?', state.isConnected);
    });
    
    // To unsubscribe to these update, just use:
    unsubscribe();
    

## Accessing the SSID

To access the `ssid` property (available under `state.details.ssid`), there
are a few additional configuration steps:

  * Request location permissions with [`Location.requestForegroundPermissionsAsync()`](/versions/latest/sdk/location#locationrequestforegroundpermissionsasync) or [`Location.requestBackgroundPermissionsAsync()`](/versions/latest/sdk/location#locationrequestbackgroundpermissionsasync).

### iOS only

  * Add the `com.apple.developer.networking.wifi-info` entitlement to your app.json under `ios.entitlements`:

app.json

Copy

        
        "ios": {
            "entitlements": {
              "com.apple.developer.networking.wifi-info": true
            }
          }
        

  * Check the Access Wi-Fi Information box in your app's App Identifier, [which can be found here](https://developer.apple.com/account/resources/identifiers/list).

  * Rebuild your app with [`eas build --platform ios`](/build/setup#4-run-a-build) or [`npx expo run:ios`](/more/expo-cli#compiling).

## Learn more

[Visit official documentationGet full information on API and its
usage.](https://github.com/react-native-netinfo/react-native-netinfo)

