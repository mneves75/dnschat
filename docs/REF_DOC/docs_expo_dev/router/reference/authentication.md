# Authentication in Expo Router

[Edit](https://github.com/expo/expo/edit/main/docs/pages/router/advanced/authentication.mdx)

Copy

How to implement authentication and protect routes with Expo Router.

[Edit](https://github.com/expo/expo/edit/main/docs/pages/router/advanced/authentication.mdx)

Copy

* * *

> Note: This guide requires SDK 53. For the previous version of this guide see
> [Authentication (redirects)](/router/advanced/authentication-rewrites).

With Expo Router, all routes are always defined and accessible. You can use
runtime logic to redirect users away from specific screens depending on
whether they are authenticated. There are two different techniques for
authenticating users within routes. This guide provides an example that
demonstrates the functionality of standard native apps.

## Using Protected Routes

[Protected routes](/router/advanced/protected) allow you to prevent users from
accessing certain routes using client-side navigation. If a user tries to
navigate to a protected screen, or if a screen becomes protected while it is
active, they will be redirected to the anchor route (usually the index screen)
or the first available screen in the stack. Consider the following project
structure that has a `/sign-in` route that is always accessible and a `(app)`
group that requires authentication:

`app`

`_layout.tsx``Controls what is protected`

`sign-in.tsx``Always accessible `

`(app)`

`_layout.tsx``Requires authorization `

`index.tsx``Should be protected by the (app)/_layout`

1

To follow the above example, set up a [React Context
provider](https://react.dev/reference/react/createContext) that can expose an
authentication session to the entire app. You can implement your custom
authentication session provider or use the one from the Example authentication
context below.

Example authentication context

This provider uses a mock implementation. You can replace it with your own
[authentication provider](/guides/authentication).

ctx.tsx

Copy

    
    
    import { use, createContext, type PropsWithChildren } from 'react';
    
    import { useStorageState } from './useStorageState';
    
    const AuthContext = createContext<{
      signIn: () => void;
      signOut: () => void;
      session?: string | null;
      isLoading: boolean;
    }>({
      signIn: () => null,
      signOut: () => null,
      session: null,
      isLoading: false,
    });
    
    // Use this hook to access the user info.
    export function useSession() {
      const value = use(AuthContext);
      if (!value) {
        throw new Error('useSession must be wrapped in a <SessionProvider />');
      }
    
      return value;
    }
    
    export function SessionProvider({ children }: PropsWithChildren) {
      const [[isLoading, session], setSession] = useStorageState('session');
    
      return (
        <AuthContext
          value={{
            signIn: () => {
              // Perform sign-in logic here
              setSession('xxx');
            },
            signOut: () => {
              setSession(null);
            },
            session,
            isLoading,
          }}>
          {children}
        </AuthContext>
      );
    }
    

The following code snippet is a basic hook that persists tokens securely on
native with [`expo-secure-store`](/versions/latest/sdk/securestore) and in
local storage on web.

useStorageState.ts

Copy

    
    
    import  { useEffect, useCallback, useReducer } from 'react';
    import * as SecureStore from 'expo-secure-store';
    import { Platform } from 'react-native';
    
    type UseStateHook<T> = [[boolean, T | null], (value: T | null) => void];
    
    function useAsyncState<T>(
      initialValue: [boolean, T | null] = [true, null],
    ): UseStateHook<T> {
      return useReducer(
        (state: [boolean, T | null], action: T | null = null): [boolean, T | null] => [false, action],
        initialValue
      ) as UseStateHook<T>;
    }
    
    export async function setStorageItemAsync(key: string, value: string | null) {
      if (Platform.OS === 'web') {
        try {
          if (value === null) {
            localStorage.removeItem(key);
          } else {
            localStorage.setItem(key, value);
          }
        } catch (e) {
          console.error('Local storage is unavailable:', e);
        }
      } else {
        if (value == null) {
          await SecureStore.deleteItemAsync(key);
        } else {
          await SecureStore.setItemAsync(key, value);
        }
      }
    }
    
    export function useStorageState(key: string): UseStateHook<string> {
      // Public
      const [state, setState] = useAsyncState<string>();
    
      // Get
      useEffect(() => {
        if (Platform.OS === 'web') {
          try {
            if (typeof localStorage !== 'undefined') {
              setState(localStorage.getItem(key));
            }
          } catch (e) {
            console.error('Local storage is unavailable:', e);
          }
        } else {
          SecureStore.getItemAsync(key).then(value => {
            setState(value);
          });
        }
      }, [key]);
    
      // Set
      const setValue = useCallback(
        (value: string | null) => {
          setState(value);
          setStorageItemAsync(key, value);
        },
        [key]
      );
    
      return [state, setValue];
    }
    

2

Create a SplashScreenController to manage the splash screen. Authentication
loading is asynchronous, so keep the splash screen visible until
authentication loads.

splash.tsx

Copy

    
    
    import { SplashScreen } from 'expo-router';
    import { useSession } from './ctx';
    
    export function SplashScreenController() {
      const { isLoading } = useSession();
    
      if (!isLoading) {
        SplashScreen.hideAsync();
      }
    
      return null;
    }
    

3

Add the `SessionProvider` to your root layout. This gives your entire app
access to the authentication context. Ensure the `SplashScreenController` is
inside the `SessionProvider`.

app/_layout.tsx

Copy

    
    
    import { Stack } from 'expo-router';
    
    import { SessionProvider } from '../ctx';
    import { SplashScreenController } from '../splash';
    
    export default function Root() {
      // Set up the auth context and render your layout inside of it.
      return (
        <SessionProvider>
          <SplashScreenController />
          <RootNavigator />
        </SessionProvider>
      );
    }
    
    // Create a new component that can access the SessionProvider context later.
    function RootNavigator() {
      return <Stack />;
    }
    

4

Create the `/sign-in` screen. This screen toggles authentication using
`signIn()`. Since this screen is outside the `(app)` group, the group's layout
and authentication check do not run when rendering this screen. This lets
logged-out users access this screen.

app/sign-in.tsx

Copy

    
    
    import { router } from 'expo-router';
    import { Text, View } from 'react-native';
    
    import { useSession } from '../ctx';
    
    export default function SignIn() {
      const { signIn } = useSession();
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text
            onPress={() => {
              signIn();
              // Navigate after signing in. You may want to tweak this to ensure sign-in is successful before navigating.
              router.replace('/');
            }}>
            Sign In
          </Text>
        </View>
      );
    }
    

5

Now modify the `RootNavigator` to protect routes based on your
`SessionProvider`.

app/_layout.tsx

Copy

    
    
    // All import statements remain the same except you need to import `useSession` from your `ctx.tsx` file.
    import { SessionProvider } from '../ctx';
    
    // All of the above code remains unchanged. Update the `RootNavigator` to protect routes based on your `SessionProvider` below.
    
    function RootNavigator() {
      const { session } = useSession();
    
      return (
        <Stack>
          <Stack.Protected guard={!!session}>
            <Stack.Screen name="(app)" />
          </Stack.Protected>
    
          <Stack.Protected guard={!session}>
            <Stack.Screen name="sign-in" />
          </Stack.Protected>
        </Stack>
      );
    }
    

6

Implement an authenticated screen that lets users sign out.

app/(app)/index.tsx

Copy

    
    
    import { Text, View } from 'react-native';
    
    import { useSession } from '../../ctx';
    
    export default function Index() {
      const { signOut } = useSession();
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text
            onPress={() => {
              // The `app/(app)/_layout.tsx` redirects to the sign-in screen.
              signOut();
            }}>
            Sign Out
          </Text>
        </View>
      );
    }
    

7

Create the app/(app)/_layout.tsx:

app/(app)/_layout.tsx

Copy

    
    
    import { Stack } from 'expo-router';
    
    export default function AppLayout() {
      // This renders the navigation stack for all authenticated app routes.
      return <Stack />;
    }
    

You now have an app that will present the splash screen until the initial
authentication state has loaded and will redirects to the sign-in screen if
the user is not authenticated. If a user visits a deep link to any routes with
the authentication check, they'll be redirected to the sign-in screen.

## Modals and per-route authentication

Another common pattern is to render a sign-in modal over the top of the app.
This enables you to dismiss and partially preserve deep links when the
authentication is complete. However, this pattern requires routes to be
rendered in the background as these routes require handling data loading
without authentication.

`app`

`_layout.tsx``Declares global session context`

`(app)`

`_layout.tsx`

`sign-in.tsx``Modal presented over the root`

`(root)`

`_layout.tsx``Protects child routes`

`index.tsx``Requires authorization `

app/(app)/_layout.tsx

Copy

    
    
    import { Stack } from 'expo-router';
    
    export const unstable_settings = {
      initialRouteName: '(root)',
    };
    
    export default function AppLayout() {
      return (
        <Stack>
          <Stack.Screen name="(root)" />
          <Stack.Screen
            name="sign-in"
            options={{
              presentation: 'modal',
            }}
          />
        </Stack>
      );
    }
    

## More information

For more information, read the [Protected routes
documentation](/router/advanced/protected) to learn more about patterns.

[![How to use Protected Routes in Expo Router V5 and higher for smooth
authentication](https://i3.ytimg.com/vi/XCTaMu0qnFY/maxresdefault.jpg)How to
use Protected Routes in Expo Router V5 and higher for smooth
authenticationLearn how to use Protected Routes in Expo Router V5 and higher
to create an authentication
flow.](https://www.youtube.com/watch?v=XCTaMu0qnFY)

## Middleware

Traditionally, websites may leverage some form of server-side redirection to
protect routes. Expo Router on the web currently only supports build-time
static generation and has no support for custom middleware or serving. This
can be added in the future to provide a more optimal web experience. In the
meantime, authentication can be implemented by using client-side redirects and
a loading state.

