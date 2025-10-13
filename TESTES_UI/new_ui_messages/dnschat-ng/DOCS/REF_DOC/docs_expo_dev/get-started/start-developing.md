# Start developing

[Edit](https://github.com/expo/expo/edit/main/docs/pages/get-started/start-
developing.mdx)

Copy

Make your first change to an Expo project and see it live on your device.

[Edit](https://github.com/expo/expo/edit/main/docs/pages/get-started/start-
developing.mdx)

Copy

* * *

1

## Start a development server

To start the development server, run the following command:

Terminal

Copy

`- ``npx expo start`

2

## Open the app on your device

After running the command above, you will see a QR code in your terminal. Scan
this QR code to open the app on your device.

If you're using an Android Emulator or iOS Simulator, you can press `a` or `i`
respectively to open the app.

Having problems?

Make sure you are on the same Wi-Fi network on your computer and your device.

If it still doesn't work, it may be due to the router configuration — this is
common for public networks. You can work around this by choosing the Tunnel
connection type when starting the development server, then scanning the QR
code again.

Terminal

Copy

`- ``npx expo start --tunnel`

> Using the Tunnel connection type will make the app reloads considerably
> slower than on LAN or Local, so it's best to avoid tunnel when possible. You
> may want to install and use an emulator or simulator to speed up development
> if Tunnel is required to access your machine from another device on your
> network.

3

## Make your first change

Open the app/(tabs)/index.tsx file in your code editor and make a change.

app/(tabs)/index.tsx

17| 17|  }  
---|---|---  
18| 18|  >  
19| 19|  <ThemedView style={styles.titleContainer}>  
20| |  <ThemedText type="title">Welcome!</ThemedText>  
| 20|  <ThemedText type="title">Hello World!</ThemedText>  
21| 21|  <HelloWave />  
22| 22|  </ThemedView>  
23| 23|  <ThemedView style={styles.stepContainer}>  
  
Changes not showing up on your device?

Expo Go is configured by default to automatically reload the app whenever a
file is changed, but let's make sure to go over the steps to enable it in case
somehow things aren't working.

  * Make sure you have the [development mode enabled in Expo CLI](/workflow/development-mode#development-mode).

  * Close the Expo app and reopen it.

  * Once the app is open again, shake your device to reveal the developer menu. If you are using an emulator, press `Ctrl` \+ `M` for Android or `Cmd ⌘` \+ `D` for iOS.

  * If you see Enable Fast Refresh, press it. If you see Disable Fast Refresh, dismiss the developer menu. Now try making another change.

![Developer menu in Expo Go app.](/static/images/get-started/developer-
menu.png)

* * *

## File structure

Below, you can get familiar with the default project's file structure:

Files

app

assets

components

constants

hooks

scripts

app.json

package.json

tsconfig.json

### app

Contains the app's navigation, which is file-based. The file structure of the
app directory determines the app's navigation.

The app has two routes defined by two files: app/(tabs)/index.tsx and
app/(tabs)/explore.tsx. The layout file in app/(tabs)/_layout.tsx sets up the
tab navigator.

## Features

The default project template has the following features:

Default project

File-based routing

Android, iOS, and web support

Images

Light and dark modes

Animations

![Two tabs in an Expo app](/static/images/get-started/navigation.png)

### File-based routing

The app has two screens: app/(tabs)/index.tsx and app/(tabs)/explore.tsx. The
layout file in app/(tabs)/_layout.tsx sets up the tab navigator.

[Learn More](/router/introduction)

