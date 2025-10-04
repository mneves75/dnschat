Framework

# AccessorySetupKit

Enable privacy-preserving discovery and configuration of accessories.

iOS 18.0+iPadOS 18.0+

## [Overview](/documentation/AccessorySetupKit#Overview)

Use AccessorySetupKit to discover and configure Bluetooth or Wi-Fi accessories
with images and names provided by the app. Allow seamless, privacy-preserving
user consent and control for Bluetooth, Wi-Fi, and Local Network permissions.
AccessorySetupKit apps can access enhanced accessory controls including
accessory pairing removal and renaming.

To use AccessorySetupKit with [Wi-Fi Aware](/documentation/WiFiAware), specify
Wi-Fi Aware properties in a
[`ASDiscoveryDescriptor`](/documentation/accessorysetupkit/asdiscoverydescriptor)
prior to beginning accessory discovery.

Important

AccessorySetupKit is available for iOS and iPadOS. In watchOS 26 and later, if
someone sets up an accessory with your iOS app by using AccessorySetupKit, a
companion watchOS app can also use CoreBluetooth to communicate with the new
accessory and any other accessories.

## [Topics](/documentation/AccessorySetupKit#topics)

### [Essentials](/documentation/AccessorySetupKit#Essentials)

[Setting up and authorizing a Bluetooth
accessory](/documentation/accessorysetupkit/setting-up-and-authorizing-a-
bluetooth-accessory)

Discover, select, and set up a specific Bluetooth accessory without requesting
permission to use Bluetooth.

[Discovering and configuring
accessories](/documentation/accessorysetupkit/discovering-and-configuring-
accessories)

Detect nearby accessories and facilitate their setup.

[`class
ASAccessorySession`](/documentation/accessorysetupkit/asaccessorysession)

A class to coordinate accessory discovery.

### [Accessory discovery](/documentation/AccessorySetupKit#Accessory-
discovery)

[`class ASAccessoryEvent`](/documentation/accessorysetupkit/asaccessoryevent)

Properties of an event encountered during accessory discovery.

[`enum
ASAccessoryEventType`](/documentation/accessorysetupkit/asaccessoryeventtype)

An enumeration of the types of events encountered during accessory discovery

[`class
ASDiscoveryDescriptor`](/documentation/accessorysetupkit/asdiscoverydescriptor)

Descriptive traits used to discover accessories.

### [Accessory description](/documentation/AccessorySetupKit#Accessory-
description)

[`class ASAccessory`](/documentation/accessorysetupkit/asaccessory)

An accessory discovered by the accessory session.

[`enum
AccessoryState`](/documentation/accessorysetupkit/asaccessory/accessorystate)

An enumeration of possible authorization states of an accessory.

### [Displaying picker items](/documentation/AccessorySetupKit#Displaying-
picker-items)

[`class
ASPickerDisplayItem`](/documentation/accessorysetupkit/aspickerdisplayitem)

An accessory as presented by the discovery picker.

[`class
ASMigrationDisplayItem`](/documentation/accessorysetupkit/asmigrationdisplayitem)

A previously-discovered accessory as presented by the discovery picker, for
use when migrating it to AccessorySetupKit.

### [Information property list
keys](/documentation/AccessorySetupKit#Information-property-list-keys)

[`NSAccessorySetupSupports`](/documentation/BundleResources/Information-
Property-List/NSAccessorySetupSupports)

An array of strings that indicates the wireless technologies AccessorySetupKit
uses when discovering and configuring accessories.

[`NSAccessorySetupBluetoothCompanyIdentifiers`](/documentation/BundleResources/Information-
Property-List/NSAccessorySetupBluetoothCompanyIdentifiers)

An array of strings that represent the Bluetooth company identifiers for
accessories that your app configures.

[`NSAccessorySetupBluetoothNames`](/documentation/BundleResources/Information-
Property-List/NSAccessorySetupBluetoothNames)

An array of strings that represent the Bluetooth device names or substrings
for accessories that your app configures.

[`NSAccessorySetupBluetoothServices`](/documentation/BundleResources/Information-
Property-List/NSAccessorySetupBluetoothServices)

An array of strings that represent the hexadecimal values of Bluetooth SIG-
defined services or custom services for accessories your app configures.

### [Errors](/documentation/AccessorySetupKit#Errors)

[`struct ASError`](/documentation/accessorysetupkit/aserror)

An error encountered during accessory discovery.

[`let ASErrorDomain: String`](/documentation/accessorysetupkit/aserrordomain)

NSError domain for AccessorySetupKit errors.

[`enum Code`](/documentation/accessorysetupkit/aserror/code)

Codes that describe errors encountered during accessory discovery.

### [Classes](/documentation/AccessorySetupKit#Classes)

[`class
ASDiscoveredAccessory`](/documentation/accessorysetupkit/asdiscoveredaccessory)Beta

[`class
ASDiscoveredDisplayItem`](/documentation/accessorysetupkit/asdiscovereddisplayitem)Beta

