On this page

# Share

## Example​

  * TypeScript
  * JavaScript

# Reference

## Methods​

### `share()`​

tsx

    
    
    static share(content: ShareContent, options?: ShareOptions);  
    

Open a dialog to share text content.

In iOS, returns a Promise which will be invoked with an object containing
`action` and `activityType`. If the user dismissed the dialog, the Promise
will still be resolved with action being `Share.dismissedAction` and all the
other keys being undefined. Note that some share options will not appear or
work on the iOS simulator.

In Android, returns a Promise which will always be resolved with action being
`Share.sharedAction`.

**Properties:**

Name| Type| Description  
---|---|---  
content Required| object| `message` \- a message to share  
`url` \- a URL to share iOS  
`title` \- title of the message Android

* * *

At least one of `url` and `message` is required.  
options| object| `dialogTitle` Android  
`excludedActivityTypes` iOS  
`subject` \- a subject to share via email iOS  
`tintColor` iOS  
`anchor` \- the node to which the action sheet should be anchored (used for
iPad) iOS  
  
* * *

## Properties​

### `sharedAction`​

tsx

    
    
    static sharedAction: 'sharedAction';  
    

The content was successfully shared.

* * *

### `dismissedAction`

iOS

​

tsx

    
    
    static dismissedAction: 'dismissedAction';  
    

The dialog has been dismissed.

[Edit page for next release](https://github.com/facebook/react-native-
website/edit/main/docs/share.md)[Edit page for current
release](https://github.com/facebook/react-native-
website/edit/main/website/versioned_docs/version-0.81/share.md)

Last updated on **Aug 20, 2025**

[ PreviousRootTag](/docs/roottag)[NextStyleSheet](/docs/stylesheet)

  * Example
  * Methods
    * `share()`
  * Properties
    * `sharedAction`
    * `dismissedAction` iOS

