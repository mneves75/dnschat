Framework

# Account & Organizational Data Sharing

Provide people with the ability to authorize your apps and websites that
access information about them on Apple REST services, like Roster API.

AccountOrganizationalDataSharing 1.0+

## [Overview](/documentation/AccountOrganizationalDataSharing#Overview)

With [OAuth 2.0](https://datatracker.ietf.org/doc/html/rfc6749), Account &
Organizational Data Sharing gives your users a safe way to authorize your apps
and websites to access information about them on Apple services, for example
[Roster API](/documentation/RosterAPI).

## [Topics](/documentation/AccountOrganizationalDataSharing#topics)

### [Generating
tokens](/documentation/AccountOrganizationalDataSharing#Generating-tokens)

[Creating a client
secret](/documentation/accountorganizationaldatasharing/creating-a-client-
secret)

Generate a signed token to identify your client application.

[`Fetch Apple's public key for verifying token
signature`](/documentation/accountorganizationaldatasharing/fetch-
apple's-public-key-for-verifying-token-signature)

Retrieve the public key associated with the cryptographic identity Apple uses
to sign the token.

[`Generate and validate
tokens`](/documentation/accountorganizationaldatasharing/generate-and-
validate-tokens)

Validate an authorization grant code delivered to your app to obtain tokens,
or validate an existing refresh token.

### [Using and revoking
tokens](/documentation/AccountOrganizationalDataSharing#Using-and-revoking-
tokens)

[`Request an
authorization`](/documentation/accountorganizationaldatasharing/request-an-
authorization)

Request a user authorization to Account & Organizational Data Sharing apps and
web services.

[`Revoke tokens`](/documentation/accountorganizationaldatasharing/revoke-
tokens)

Invalidate the tokens and associated user authorizations for someone when they
are no longer associated with your app.

### [Common objects](/documentation/AccountOrganizationalDataSharing#Common-
objects)

[`object JWKSet`](/documentation/accountorganizationaldatasharing/jwkset)

A set of JSON web keys.

[`object
TokenResponse`](/documentation/accountorganizationaldatasharing/tokenresponse)

The response token object returned on a successful request.

[`object
ErrorResponse`](/documentation/accountorganizationaldatasharing/errorresponse)

The error object returned after an unsuccessful request.

