# Account Data Transfer | Apple Developer Documentation

> Source: https://developer.apple.com/documentation/AccountDataTransfer
> Fetched: 2025-08-31T18:31:12.882Z

## [Overview](https://developer.apple.com/documentation/AccountDataTransfer#Overview)

Use the Account Data Transfer web API to request and download App Store information and app-install activity data about your app’s users. The data available relates to a user’s use of Apple’s App Store and includes information such as previous transactions and downloads.

To access the data, you need to acquire an access token with the `appstore-user-profile` read-only scope, and at least one of these scopes:

- `appstore-info-readonly`
- `app-install-activity-readonly`

You also need to supply the query parameter `consent_mode`, with the value `auth3p`, in your call to [`Request an authorization`](https://developer.apple.com/documentation/AccountOrganizationalDataSharing/Request-an-authorization).

To get permission for your App ID or Services ID to request these scopes, follow the instructions at [Account & Organizational Data Sharing](https://developer.apple.com/help/account/service-configurations/share-account-and-organizational-data).

### [Set required HTTP headers](https://developer.apple.com/documentation/AccountDataTransfer#Set-required-HTTP-headers)

When you make requests for someone’s App Store information and app-install activity, using any of the endpoints listed below, set the following HTTP headers:

`Authorization`

Set the value to `Bearer <ACCESS_TOKEN>` to assert that your app is authorized to fetch data with the `appstore-info-readonly` scope or `app-install-activity-readonly` scope.

`X-Apple-Transaction-Id`

Set the value to a UUID that uniquely identifies the request. If you need to contact Apple to get support, quote the UUID of the request for which you need help.

### [Submit a request](https://developer.apple.com/documentation/AccountDataTransfer#Submit-a-request)

Make an HTTP `POST` request to the [`Submit request`](https://developer.apple.com/documentation/accountdatatransfer/submit-request) endpoint, requesting the `app-store` data type. To make a one-time request, set the `mode` key to `ONE_TIME`. To make recurring requests, use one of the following values:

`DAILY_30`

One recurring request every day for 30 days

`WEEKLY_180`

One recurring request every week for 180 days

The Apple server returns a request ID, which you use when you get the request status, request download URLs, or cancel the request. For recurring requests, the Apple server returns a request ID, along with the parent ID that identifies the series of recurring requests.

The response from the server also contains a `statusCheckDelay`, which is the number of seconds you need to wait before checking the status of the request. You can cancel a request before this time by making a `POST` request to the [`Cancel request`](https://developer.apple.com/documentation/accountdatatransfer/cancel-request) endpoint.

If you submit a recurring request and don’t resubmit the recurring instances, for example, you request a `DAILY_30` recurrence and don’t resubmit the request each subsequent day, the recurring request expires and you need to submit another request.

### [Find the request status](https://developer.apple.com/documentation/AccountDataTransfer#Find-the-request-status)

The data corresponding to the request you submitted isn’t available immediately. After the status-check delay expires, make a `GET` request to [`Get one-time request status`](https://developer.apple.com/documentation/accountdatatransfer/get-one-time-request-status) or [`Get recurring request status`](https://developer.apple.com/documentation/accountdatatransfer/get-recurring-request-status), including the request identifier in the path.

If the job status is `completed` or `completed_with_error`, the data associated with the request is ready to download.

### [Transfer data](https://developer.apple.com/documentation/AccountDataTransfer#Transfer-data)

Get the download URLs for a completed request by making a `GET` request to [`Get one-time request download URLs`](https://developer.apple.com/documentation/accountdatatransfer/get-one-time-request-download-urls) or [`Get recurring request download URLs`](https://developer.apple.com/documentation/accountdatatransfer/get-recurring-request-download-urls), including the request identifier in the path.

The response contains a list of URLs to which you make `GET` requests, to retrieve the person’s data.

Download URLs are available for 3 days after the download request completes. The URLs you receive are valid for 15 minutes after you request them.

For information on the content and terms used in the files you download, see [Data and Privacy](https://privacy.apple.com/file-guides/transfer/accountdata).

### [Resubmit recurring requests](https://developer.apple.com/documentation/AccountDataTransfer#Resubmit-recurring-requests)

Enqueue the next instance of a recurring request by making a `POST` request to the [`Resubmit request`](https://developer.apple.com/documentation/accountdatatransfer/resubmit-request) endpoint, passing the parent request identifier and the request identifier of the most recent instance.

The server’s response contains the request identifier of the new request, and a delay to wait before you can check the new request’s status.
