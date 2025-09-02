# Account & Organizational Data Sharing | Apple Developer Documentation

> Source: https://developer.apple.com/documentation/AccountOrganizationalDataSharing
> Fetched: 2025-08-31T18:31:11.464Z

Framework

## Account & Organizational Data Sharing

Provide people with the ability to authorize your apps and websites that access information about them on Apple REST services, like Roster API.

AccountOrganizationalDataSharing 1.0+

## [Overview](https://developer.apple.com/documentation/AccountOrganizationalDataSharing#Overview)

With [OAuth 2.0](https://datatracker.ietf.org/doc/html/rfc6749), Account & Organizational Data Sharing gives your users a safe way to authorize your apps and websites to access information about them on Apple services, for example [Roster API](https://developer.apple.com/documentation/RosterAPI).

## [Topics](https://developer.apple.com/documentation/AccountOrganizationalDataSharing#topics)

### [Generating tokens](https://developer.apple.com/documentation/AccountOrganizationalDataSharing#Generating-tokens)

[Creating a client secret](https://developer.apple.com/documentation/accountorganizationaldatasharing/creating-a-client-secret)

Generate a signed token to identify your client application.

[`Fetch Apple's public key for verifying token signature`](https://developer.apple.com/documentation/accountorganizationaldatasharing/fetch-apple's-public-key-for-verifying-token-signature)

Retrieve the public key associated with the cryptographic identity Apple uses to sign the token.

[`Generate and validate tokens`](https://developer.apple.com/documentation/accountorganizationaldatasharing/generate-and-validate-tokens)

Validate an authorization grant code delivered to your app to obtain tokens, or validate an existing refresh token.

### [Using and revoking tokens](https://developer.apple.com/documentation/AccountOrganizationalDataSharing#Using-and-revoking-tokens)

[`Request an authorization`](https://developer.apple.com/documentation/accountorganizationaldatasharing/request-an-authorization)

Request a user authorization to Account & Organizational Data Sharing apps and web services.

[`Revoke tokens`](https://developer.apple.com/documentation/accountorganizationaldatasharing/revoke-tokens)

Invalidate the tokens and associated user authorizations for someone when they are no longer associated with your app.

### [Common objects](https://developer.apple.com/documentation/AccountOrganizationalDataSharing#Common-objects)

[`object JWKSet`](https://developer.apple.com/documentation/accountorganizationaldatasharing/jwkset)

A set of JSON web keys.

[`object TokenResponse`](https://developer.apple.com/documentation/accountorganizationaldatasharing/tokenresponse)

The response token object returned on a successful request.

[`object ErrorResponse`](https://developer.apple.com/documentation/accountorganizationaldatasharing/errorresponse)

The error object returned after an unsuccessful request.

Current page is Account & Organizational Data Sharing
