# Accounts | Apple Developer Documentation

> Source: https://developer.apple.com/documentation/Accounts
> Fetched: 2025-08-31T18:31:14.592Z

Framework

## Accounts

Help users access and manage their external accounts from within your app, without requiring them to enter login credentials.

iOS 5.0+iPadOS 5.0+Mac Catalyst 13.0+macOS 10.8+

## [Overview](https://developer.apple.com/documentation/Accounts#overview)

The Accounts framework provides access to user accounts stored in the Accounts database, which is managed by the system. An account stores the login credentials of a particular service, such as LinkedIn, and you use those credentials to authenticate with the service. When you integrate the Accounts framework into your app, you don’t need to store account logins yourself. Instead, the user grants your app access to use their account login credentials, bypassing the need to type their username and password. If no account for a particular service exists in the user’s Accounts database, you can let them create and save an account from within your app.

Current page is Accounts
