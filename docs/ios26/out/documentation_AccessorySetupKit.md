# AccessorySetupKit | Apple Developer Documentation

> Source: https://developer.apple.com/documentation/AccessorySetupKit
> Fetched: 2025-08-31T18:31:09.715Z

## [Overview](https://developer.apple.com/documentation/AccessorySetupKit#Overview)

Use AccessorySetupKit to discover and configure Bluetooth or Wi-Fi accessories with images and names provided by the app. Allow seamless, privacy-preserving user consent and control for Bluetooth, Wi-Fi, and Local Network permissions. AccessorySetupKit apps can access enhanced accessory controls including accessory pairing removal and renaming.

To use AccessorySetupKit with [Wi-Fi Aware](https://developer.apple.com/documentation/WiFiAware), specify Wi-Fi Aware properties in a [`ASDiscoveryDescriptor`](https://developer.apple.com/documentation/accessorysetupkit/asdiscoverydescriptor) prior to beginning accessory discovery.

## [Topics](https://developer.apple.com/documentation/AccessorySetupKit#topics)

### [Essentials](https://developer.apple.com/documentation/AccessorySetupKit#Essentials)

[Setting up and authorizing a Bluetooth accessory](https://developer.apple.com/documentation/accessorysetupkit/setting-up-and-authorizing-a-bluetooth-accessory)

Discover, select, and set up a specific Bluetooth accessory without requesting permission to use Bluetooth.

[Discovering and configuring accessories](https://developer.apple.com/documentation/accessorysetupkit/discovering-and-configuring-accessories)

Detect nearby accessories and facilitate their setup.

[`class ASAccessorySession`](https://developer.apple.com/documentation/accessorysetupkit/asaccessorysession)

A class to coordinate accessory discovery.

### [Accessory discovery](https://developer.apple.com/documentation/AccessorySetupKit#Accessory-discovery)

[`class ASAccessoryEvent`](https://developer.apple.com/documentation/accessorysetupkit/asaccessoryevent)

Properties of an event encountered during accessory discovery.

[`enum ASAccessoryEventType`](https://developer.apple.com/documentation/accessorysetupkit/asaccessoryeventtype)

An enumeration of the types of events encountered during accessory discovery

[`class ASDiscoveryDescriptor`](https://developer.apple.com/documentation/accessorysetupkit/asdiscoverydescriptor)

Descriptive traits used to discover accessories.

### [Accessory description](https://developer.apple.com/documentation/AccessorySetupKit#Accessory-description)

[`class ASAccessory`](https://developer.apple.com/documentation/accessorysetupkit/asaccessory)

An accessory discovered by the accessory session.

[`enum AccessoryState`](https://developer.apple.com/documentation/accessorysetupkit/asaccessory/accessorystate)

An enumeration of possible authorization states of an accessory.

### [Displaying picker items](https://developer.apple.com/documentation/AccessorySetupKit#Displaying-picker-items)

[`class ASPickerDisplayItem`](https://developer.apple.com/documentation/accessorysetupkit/aspickerdisplayitem)

An accessory as presented by the discovery picker.

[`class ASMigrationDisplayItem`](https://developer.apple.com/documentation/accessorysetupkit/asmigrationdisplayitem)

A previously-discovered accessory as presented by the discovery picker, for use when migrating it to AccessorySetupKit.

### [Information property list keys](https://developer.apple.com/documentation/AccessorySetupKit#Information-property-list-keys)

[`NSAccessorySetupSupports`](https://developer.apple.com/documentation/BundleResources/Information-Property-List/NSAccessorySetupSupports)

An array of strings that indicates the wireless technologies AccessorySetupKit uses when discovering and configuring accessories.

[`NSAccessorySetupBluetoothCompanyIdentifiers`](https://developer.apple.com/documentation/BundleResources/Information-Property-List/NSAccessorySetupBluetoothCompanyIdentifiers)

An array of strings that represent the Bluetooth company identifiers for accessories that your app configures.

[`NSAccessorySetupBluetoothNames`](https://developer.apple.com/documentation/BundleResources/Information-Property-List/NSAccessorySetupBluetoothNames)

An array of strings that represent the Bluetooth device names or substrings for accessories that your app configures.

[`NSAccessorySetupBluetoothServices`](https://developer.apple.com/documentation/BundleResources/Information-Property-List/NSAccessorySetupBluetoothServices)

An array of strings that represent the hexadecimal values of Bluetooth SIG-defined services or custom services for accessories your app configures.

### [Errors](https://developer.apple.com/documentation/AccessorySetupKit#Errors)

[`struct ASError`](https://developer.apple.com/documentation/accessorysetupkit/aserror)

An error encountered during accessory discovery.

[`let ASErrorDomain: String`](https://developer.apple.com/documentation/accessorysetupkit/aserrordomain)

NSError domain for AccessorySetupKit errors.

[`enum Code`](https://developer.apple.com/documentation/accessorysetupkit/aserror/code)

Codes that describe errors encountered during accessory discovery.
