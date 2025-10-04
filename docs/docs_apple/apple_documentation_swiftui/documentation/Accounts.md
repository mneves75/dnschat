Framework

# Accounts

Help users access and manage their external accounts from within your app,
without requiring them to enter login credentials.

iOS 5.0+iPadOS 5.0+Mac Catalyst 13.0+macOS 10.8+

Deprecated

The Accounts framework is deprecated. For new apps, instead of using Accounts,
contact the provider of the service you integrate with, to get access to their
SDK or documentation about managing accounts with their service.

## [Overview](/documentation/Accounts#overview)

The Accounts framework provides access to user accounts stored in the Accounts
database, which is managed by the system. An account stores the login
credentials of a particular service, such as LinkedIn, and you use those
credentials to authenticate with the service. When you integrate the Accounts
framework into your app, you don’t need to store account logins yourself.
Instead, the user grants your app access to use their account login
credentials, bypassing the need to type their username and password. If no
account for a particular service exists in the user’s Accounts database, you
can let them create and save an account from within your app.

## [Topics](/documentation/Accounts#topics)

### [Account Management](/documentation/Accounts#Account-Management)

[`class ACAccountStore`](/documentation/accounts/acaccountstore)

The object you use to request, manage, and store the user’s account
information.

[`class ACAccount`](/documentation/accounts/acaccount)

The information associated with one of the user’s accounts.

[`class ACAccountCredential`](/documentation/accounts/acaccountcredential)

A credential object that encapsulates the information needed to authenticate a
user.

### [Account Types](/documentation/Accounts#Account-Types)

[`class ACAccountType`](/documentation/accounts/acaccounttype)

An object that encapsulates information about all accounts of a particular
type.

### [Errors](/documentation/Accounts#Errors)

[`struct ACErrorCode`](/documentation/accounts/acerrorcode)

Codes for errors that may occur.

[`let ACErrorDomain: String`](/documentation/accounts/acerrordomain)

The error domain for the Accounts framework.

### [Deprecated](/documentation/Accounts#Deprecated)

[API ReferenceDeprecated Symbols](/documentation/accounts/deprecated-symbols)

Avoid using deprecated symbols in your apps.

