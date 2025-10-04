[See what’s new in security](/videos/privacy-security/)

# Security

Apple devices, platforms, and services provide world-class security and
privacy to our users, with powerful APIs for you to leverage in your own apps.

![](/security/images/security-mbp14-iphone15-large_2x.png)

## Authentication

### Face ID and Touch ID

These secure ways to unlock, authenticate, and pay let users quickly access
your app with just a glance or a touch of their finger. The Secure Enclave, a
hardware-based security processor isolated from the rest of the system,
encrypts and protects the user’s data.

[Learn
more](/documentation/localauthentication/logging_a_user_into_your_app_with_face_id_or_touch_id/)

### Apple Pay

Apple Pay provides an easy and secure way to pay using Face ID or Touch ID, or
by double-clicking Apple Watch. Users can quickly provide their payment,
shipping, and contact information to check out. And because you don’t receive
any credit or debit card numbers, you don't need to handle sensitive data when
customers use Apple Pay.

[Learn more](/apple-pay/)

### Sign in with Apple

Your users can easily sign in to your apps and websites using their Apple
Account. Instead of filling out forms, verifying email addresses, and choosing
new passwords, they can use Sign in with Apple to set up an account and start
using your app right away.

[Learn more](/sign-in-with-apple/)

### Automatic strong passwords

Password AutoFill simplifies login and account creation tasks for iOS and
iPadOS apps, as well as websites. With just a few taps, your users can create
and save unique, strong passwords or log in to an existing account. They don’t
even need to know their password — the system handles everything.

[Learn more](/documentation/security/password_autofill/)

### Passkeys

Based on industry standards for account authentication, passkeys replace
passwords with cryptographic key pairs, making them easier to use and far more
secure. Adopt passkeys to give people a simple, secure way to sign in to your
apps and websites across platforms — with no passwords required.

[Learn more](/passkeys/)

## Making secure connections

A range of APIs on Apple platforms enables your apps to employ secure network
connections and to benefit from OS-level security policies.

### App Transport Security (ATS)

ATS establishes best-practice policies for secure network communications using
Apple platforms, employing Transport Layer Security (TLS) version 1.2, forward
secrecy, and strong cryptography.

  * [NSAppTransportSecurity](/documentation/bundleresources/information_property_list/nsapptransportsecurity/)

### Secure Transport API

Use Apple’s secure transport API to employ current versions of the Secure
Sockets Layer (SSL), Transport Layer Security (TLS), and Datagram Transport
Layer Security (DTLS) cryptographic protocols for network communications.

  * [Secure Transport Reference](/documentation/security/secure_transport/)

### Supported algorithms

Starting with iOS 10 and macOS 10.12, the RC4 cipher suite is disabled by
default. In addition, Apple recommends that your servers use certificates
signed with the SHA-2 cryptographic function.

  * [What’s New in Security](/videos/play/wwdc2016/706/)

### DeviceCheck and the App Attest API

Protect against security threats to your iOS, iPadOS, and tvOS apps and reduce
fraudulent use of your services by managing device states and asserting app
integrity. The DeviceCheck services provide information that you can integrate
into an overall antifraud strategy for your app and risk assessment for a
given device.

Using the DeviceCheck service, a token on your server can set and query two
binary digits of data per device — for example, to flag a device you‘ve
determined to be fraudulent — while maintaining user privacy. And with App
Attest, you can generate a special cryptographic key on a device running iOS
14, iPadOS 14, and tvOS 15 or later, and use that key to validate the
integrity of your app before your server provides access to sensitive data.

  * [DeviceCheck Framework](/documentation/devicecheck/)

### Certificate Trust APIs and Certificate Transparency

Strong encryption for your network connections is not enough. To help ensure
your app is connecting to the right server, employ Apple’s Certificate Trust
APIs and Certificate Transparency.

  * [Certificate, Key, and Trust Services](/documentation/security/certificate_key_and_trust_services/)
  * [Certificate Transparency website](https://www.certificate-transparency.org/)
  * [iOS trusted root certificates](https://support.apple.com/en-us/HT204132/)

## Protecting user data

Apple platforms provide a variety of features for protecting user data.

### Purpose strings

Purpose strings let you statically declare the sensitive data and resources
your app employs.

  * [API guidance for using purpose strings](/documentation/uikit/protecting_the_user_s_privacy/requesting_access_to_protected_resources/)
  * [Information Property List Key Reference](/library/archive/documentation/General/Reference/InfoPlistKeyReference/Articles/CocoaKeys.html)

### Copying and pasting sensitive data

Take advantage of privacy options when allowing users to copy and paste
sensitive data in your apps on iPhone or iPad.

  * [UIPasteboard Class Reference](/documentation/uikit/uipasteboard/)

### Keychain and iCloud Keychain

Keychain and iCloud Keychain provide a secure repository for sensitive user
data, such as certificates, keys, passwords, and notes.

  * [Keychain Services](/documentation/security/keychain_services/)
  * [Configuring Keychain Sharing](/documentation/security/keychain_services/keychain_items/sharing_access_to_keychain_items_among_a_collection_of_apps/)

### App sandboxing

Protect Mac systems and users by limiting the privileges of an app to its
intended functionality, increasing the difficulty for malicious software to
compromise users’ systems.

  * [App Sandbox](/documentation/security/app_sandbox/)

## Executing code securely

Apple platforms protect users with secure code execution. Xcode, Apple’s
integrated development environment (IDE), directly provides code signing for
iOS, iPadOS, macOS, tvOS, and watchOS apps that you distribute on the App
Store.

### Sign your apps with Developer ID

Gatekeeper on macOS helps protect users from downloading and installing
malicious software distributed outside the Mac App Store by checking for a
Developer ID certificate.

  * [Developer ID and Gatekeeper](/developer-id/)
  * [Code Signing Guide](/library/archive/documentation/Security/Conceptual/CodeSigningGuide/Introduction/Introduction.html)
  * [macOS Code Signing In Depth](/library/archive/technotes/tn2206/_index.html)

### Notarize your apps

If distributing your Mac app outside of the Mac App Store, sign and upload
your app to Apple to be notarized to certify your app is genuine and to
perform a security check.

  * [Notarizing macOS Software Before Distribution](/documentation/security/notarizing_macos_software_before_distribution/)
  * [Xcode Help: Distribute outside the Mac App Store](/documentation/xcode/)

## Cryptographic interfaces

Apple platforms offer a comprehensive set of low-level APIs for developing
cryptographic solutions within your apps.

### Apple CryptoKit

Perform cryptographic operations securely and efficiently in your app.

  * [CryptoKit](/documentation/cryptokit/)

### Common Crypto library

The Common Crypto library supports symmetric encryption, hash-based message
authentication codes, and digests.

  * [Cryptographic Services Guide](/library/archive/documentation/Security/Conceptual/cryptoservices/Introduction/Introduction.html)
  * [Common Crypto on Apple Open Source](https://opensource.apple.com/source/CommonCrypto/)

### SecKey API for asymmetric keys

SecKey provides a unified asymmetric key API across Apple platforms.

  * [Certificate, Key, and Trust Services: Keys](/documentation/security/certificate_key_and_trust_services/keys/)

### CryptoTokenKit for smart card support

The CryptoTokenKit framework provides first-class access for working with
smart cards and other cryptographic devices in macOS.

  * [CryptoTokenKit](/documentation/cryptotokenkit/)

## Security fundamentals and resources

These resources provide background information and support for security on
Apple platforms.

### Guides

  * [Apple Platform Security](https://support.apple.com/guide/security/welcome/1/web/)
  * [Apple Product Security](https://support.apple.com/en-us/HT201220/)

### Programs

  * [Apple Security Research Device Program](/programs/security-research-device/)
  * [Apple Security Bounty](/security-bounty/)
  * [Apple Root Certificate Program](https://www.apple.com/certificateauthority/ca_program.html)

## corecrypto

Both the Security framework and Common Crypto rely on the corecrypto library
to provide implementations of low-level cryptographic primitives. This is also
the library submitted for validation of compliance with U.S. Federal
Information Processing Standards (FIPS) 140-2/-3. Visit [ Apple Platform
Certifications](https://support.apple.com/guide/certifications/welcome/web)
for up-to-date information on corecrypto validations. Although corecrypto does
not directly provide programming interfaces for developers and should not be
used by iOS, iPadOS, or macOS apps, the source code is available to allow for
verification of its security characteristics and correct functioning.

[Download corecrypto source (2024 OS Releases)]()

