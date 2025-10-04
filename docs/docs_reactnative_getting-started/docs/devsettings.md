On this page

# DevSettings

The `DevSettings` module exposes methods for customizing settings for
developers in development.

* * *

# Reference

## Methods​

### `addMenuItem()`​

tsx

    
    
    static addMenuItem(title: string, handler: () => any);  
    

Add a custom menu item to the Dev Menu.

**Parameters:**

Name| Type  
---|---  
title Required| string  
handler Required| function  
  
**Example:**

tsx

    
    
    DevSettings.addMenuItem('Show Secret Dev Screen', () => {  
      Alert.alert('Showing secret dev screen!');  
    });  
    

* * *

### `reload()`​

tsx

    
    
    static reload(reason?: string): void;  
    

Reload the application. Can be invoked directly or on user interaction.

**Example:**

tsx

    
    
    <Button title="Reload" onPress={() => DevSettings.reload()} />  
    

[Edit page for next release](https://github.com/facebook/react-native-
website/edit/main/docs/devsettings.md)[Edit page for current
release](https://github.com/facebook/react-native-
website/edit/main/website/versioned_docs/version-0.81/devsettings.md)

Last updated on **Aug 12, 2025**

[ PreviousAppState](/docs/appstate)[NextDimensions](/docs/dimensions)

  * Methods
    * `addMenuItem()`
    * `reload()`

