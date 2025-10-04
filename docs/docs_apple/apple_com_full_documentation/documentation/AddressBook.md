Framework

# Address Book

Access the centralized database for storing users’ contacts.

iOS 2.0+iPadOS 2.0+Mac Catalyst 14.0+macOS 10.2+

## [Overview](/documentation/AddressBook#overview)

The Address Book is a centralized database containing contacts and their
personal information. Users enter personal information about themselves and
their friends only once, instead of entering it repeatedly whenever the
information is used. Apps that support the AddressBook framework share this
contact information with other apps, including Apple’s Mail and Messages.

Important

Do not use the AddressBook framework in macOS 10.11 and later. Use the APIs
defined in the [Contacts](/documentation/Contacts) framework instead.

## [Topics](/documentation/AddressBook#topics)

### [Essentials](/documentation/AddressBook#Essentials)

[`class ABAddressBook`](/documentation/addressbook/abaddressbook)

The main object you use to access the Address Book database.

### [Data Types](/documentation/AddressBook#Data-Types)

[`class ABPerson`](/documentation/addressbook/abperson)

An object that encapsulates all information about a person in the Address Book
database.

[`class ABGroup`](/documentation/addressbook/abgroup)

An object that represents a group of records in the Address Book database.

[`class ABMultiValue`](/documentation/addressbook/abmultivalue)

An immutable representation of a property that might have multiple values.

[`class ABMutableMultiValue`](/documentation/addressbook/abmutablemultivalue)

A mutable representation of a property that might have multiple values.

[`protocol ABImageClient`](/documentation/addressbook/abimageclient)

Methods for responding to a request to load images associated with a contact.

[`class ABRecord`](/documentation/addressbook/abrecord)

An abstract class that defines the common properties for all Address Book
records.

### [Pickers](/documentation/AddressBook#Pickers)

[`class ABPeoplePickerView`](/documentation/addressbook/abpeoplepickerview)

An object you use to customize the behavior of people-picker views in an app’s
user interface.

[`class ABPersonView`](/documentation/addressbook/abpersonview)

An object that provides a view for displaying and editing contacts.

### [Search Elements](/documentation/AddressBook#Search-Elements)

[`class ABSearchElement`](/documentation/addressbook/absearchelement)

An object you use to specify a search query for records in the Address Book
database.

[`class ABSearchElementRef`](/documentation/addressbook/absearchelementref)

A reference to an ABSearchElement object.

### [Action Plug-In](/documentation/AddressBook#Action-Plug-In)

[API ReferenceABActionDelegate](/documentation/addressbook/abactiondelegate)

Implement an Address Book action plug-in to support the display of rollover
menus on top of custom items.

### [C Interfaces](/documentation/AddressBook#C-Interfaces)

[API ReferenceC Types](/documentation/addressbook/c-types)

Identify the C types that correspond to Address Book objects.

[API ReferenceAddressBook Functions](/documentation/addressbook/addressbook-
functions)

Find the C functions and function-like macros you use to manipulate Address
Book data.

[API ReferenceAddress Book Constants](/documentation/addressbook/address-book-
constants)

Get the constants you use to specify Address Book information.

[API ReferenceAddressBook
Enumerations](/documentation/addressbook/addressbook-enumerations)

Get the enumerations you use to specify Address Book information.

[API ReferenceAddressBook Data Types](/documentation/addressbook/addressbook-
data-types)

Get the data types you use to specify Address Book information.

### [Deprecated symbols](/documentation/AddressBook#Deprecated-symbols)

[API ReferenceDeprecated symbols](/documentation/addressbook/deprecated-
symbols)

Review unsupported symbols and their replacements.

