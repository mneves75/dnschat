# Redirects

[Edit](https://github.com/expo/expo/edit/main/docs/pages/router/reference/redirects.mdx)

Copy

Learn how to redirect URLs in Expo Router.

[Edit](https://github.com/expo/expo/edit/main/docs/pages/router/reference/redirects.mdx)

Copy

* * *

You can redirect a request to a different URL based on some in-app criteria.
Expo Router supports a number of different redirection patterns.

## Using `Redirect` component

You can immediately redirect from a particular screen by using the `Redirect`
component:

    
    
    import { View, Text } from 'react-native';
    import { Redirect } from 'expo-router';
    
    export default function Page() {
      const { user } = useAuth();
    
      if (!user) {
        return <Redirect href="/login" />;
      }
    
      return (
        <View>
          <Text>Welcome Back!</Text>
        </View>
      );
    }
    

## Using `useRouter` hook

You can also redirect imperatively with the `useRouter` hook:

    
    
    import { Text } from 'react-native';
    import { useRouter, useFocusEffect } from 'expo-router';
    
    function MyScreen() {
      const router = useRouter();
    
      useFocusEffect(() => {
        // Call the replace method to redirect to a new route without adding to the history.
        // We do this in a useFocusEffect to ensure the redirect happens every time the screen
        // is focused.
        router.replace('/profile/settings');
      });
    
      return <Text>My Screen</Text>;
    }
    

