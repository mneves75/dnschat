  * [ Authentication Services ](/documentation/authenticationservices)
  * Performing fast account creation with passkeys 

Sample Code

# Performing fast account creation with passkeys

Allow people to quickly create an account with passkeys and associated
domains.

[ Download ](https://docs-
assets.developer.apple.com/published/2a5d74be7e4e/PerformingFastAccountCreationWithPasskeys.zip)

iOS 26.0+iPadOS 26.0+Xcode 26.0+

## [Overview](/documentation/AuthenticationServices/performing-fast-account-
creation-with-passkeys#Overview)

Note

This sample code project is associated with WWDC25 session 279: [What’s new in
passkeys](https://developer.apple.com/videos/play/wwdc2025/279).

### [Configure the sample code
project](/documentation/AuthenticationServices/performing-fast-account-
creation-with-passkeys#Configure-the-sample-code-project)

To configure the sample code project, do the following:

  1. In Xcode, click the project’s target, then select your team from the Team pop-up menu in the Signing & Capabilities pane to let Xcode automatically manage your provisioning profile.

  2. Add the Associated Domains capability using the + Capability button in the same pane, and specify your domain with the `webcredentials` service.

  3. Ensure an `apple-app-site-association` (AASA) file is present on your domain in the `.well-known` directory, and that it contains an entry for this app’s App ID for the `webcredentials` service.

  4. In the `SignUpView.swift` file, replace all occurrences of `example.com` with the name of your domain.

## [See Also](/documentation/AuthenticationServices/performing-fast-account-
creation-with-passkeys#see-also)

### [Passkeys](/documentation/AuthenticationServices/performing-fast-account-
creation-with-passkeys#Passkeys)

[API ReferencePublic-Private Key
Authentication](/documentation/authenticationservices/public-private-key-
authentication)

Register and authenticate users with passkeys and security keys, without using
passwords.

[API ReferencePasskey use in web
browsers](/documentation/authenticationservices/passkey-use-in-web-browsers)

Register and authenticate website users by using passkeys.

[Connecting to a service with
passkeys](/documentation/authenticationservices/connecting-to-a-service-with-
passkeys)

Allow users to sign in to a service without typing a password.

