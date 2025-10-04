  * [ TranslationUIProvider ](/documentation/translationuiprovider)
  * Preparing your app to be the default translation app 

Article

# Preparing your app to be the default translation app

Configure your app so people can set it as the default translation app on
their device.

## [Overview](/documentation/TranslationUIProvider/Preparing-your-app-to-be-
the-default-translation-app#Overview)

In iOS and iPadOS 18.4 and later, a person can select an app other than
Translate to handle text translation.

If your app provides translation service and you want it to optionally become
the default translation app, you need to add an entitlement, access key, app
extension, and a UI.

### [Add the Default Translation App entitlement to your
project](/documentation/TranslationUIProvider/Preparing-your-app-to-be-the-
default-translation-app#Add-the-Default-Translation-App-entitlement-to-your-
project)

Add the `com.apple.developer.translation-app` entitlement to the
`.entitlements` file in your app’s Xcode project. For instructions on how to
add this entitlement, see
[`Translation`](/documentation/BundleResources/Entitlements/com.apple.developer.translation-
app).

### [Add the translation provider network access key to your app’s
Info.plist](/documentation/TranslationUIProvider/Preparing-your-app-to-be-the-
default-translation-app#Add-the-translation-provider-network-access-key-to-
your-apps-Infoplist)

If your app needs to access the network in order to provide its translation
services, you need to add the `com.apple.developer.translation-ui-
provider.network-access` key to your app’s `Info.plist`.

To do this, perform these steps:

  1. Select your app’s `Info.plist` file in the Xcode file navigator.

  2. Add a new key and name it `com.apple.developer.translation-ui-provider.network-access`.

  3. Set the key type to Boolean.

  4. Set the key’s value to `true`.

### [Add a TranslationUIProviderExtension in your
app](/documentation/TranslationUIProvider/Preparing-your-app-to-be-the-
default-translation-app#Add-a-TranslationUIProviderExtension-in-your-app)

In the Xcode navigator, in your app’s target list, click the plus (+) and
search for Translation. Click next and follow the prompts to add the app
extension for Translation to your project.

### [Provide a translation UI to your
app](/documentation/TranslationUIProvider/Preparing-your-app-to-be-the-
default-translation-app#Provide-a-translation-UI-to-your-app)

The following example shows a typical workflow an app might adopt to present
the translation UI to a person using their app:

    
    
    import SwiftUI
    import TranslationUIProvider
    
    
    @main
    class MyTranslationExtension: TranslationUIProviderExtension {
    
    
        var body: some TranslationUIProviderExtensionScene {
            TranslationUIProviderSelectedTextScene { context in
                MyTranslationView(context: context)
            }
        }
    }
    
    
    struct MyTranslationView: View {
        @State var context: TranslationUIProviderContext
        @State var translated: String = ""
    
    
        init(context c: TranslationUIProviderContext) {
            context = c
        }
    
    
        var body: some View {
            VStack(alignment: .leading) {
                Text(context.inputText ?? "")
                Text(translated)
                Button(action: translate) {
                    Label("Translate", systemImage: "globe")
                }
                Button(action: replaceText) {
                    Text("Replace With Translation")
                }
                .disabled(!context.allowsReplacement)
            }
        }
    
    
        // Perform the translation, leaving the UI visible.
        private func translate() {
            if let toTranslate = context.inputText, !toTranslate.characters.isEmpty {
                // Call your own, custom translation API.
                translated = String(toTranslate.characters.reversed())
            }
        }
    
    
        // Send the translation result back to the source text field, and exit.
        private func replaceText() {
            context.finish(replacingWithTranslation: AttributedString(translated))
        }
    }
    
    
    

