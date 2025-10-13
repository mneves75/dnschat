# EAS Update

[Edit](https://github.com/expo/expo/edit/main/docs/pages/eas-
update/introduction.mdx)

Copy

An introduction to EAS Update which is a hosted service for projects using the
expo-updates library.

[Edit](https://github.com/expo/expo/edit/main/docs/pages/eas-
update/introduction.mdx)

Copy

* * *

EAS Update is a hosted service that serves updates for projects using the
[`expo-updates`](/versions/latest/sdk/updates) library.

EAS Update makes fixing small bugs and pushing quick fixes a snap in between
app store submissions. It accomplishes this by enabling an app to update its
own non-native pieces (such as JS, styling, and images) over-the-air.

All apps that include the `expo-updates` library have the ability to receive
updates.

  * To start using EAS Update, continue to the [Getting Started](/eas-update/getting-started) guide.
  * For a complete tutorial of using EAS Update with other EAS services, refer to the [EAS Tutorial](/tutorial/eas/introduction).

## JS API for update management

![Updates JS API](/static/images/eas-update/frontpage/critical-update.png)

The updates [JavaScript API](/versions/latest/sdk/updates) includes a React
hook called `useUpdates()`. This hook provides detailed information about the
currently running update and any new updates that are available or have been
downloaded. In addition, you can view any errors that were encountered during
the update process to help you debug any issues while the app is attempting to
update.

The API also provides methods such as `checkForUpdateAsync()` and
`fetchUpdateAsync()` which allows you to control when your app checks for and
downloads updates.

## Insight tracking

![Website dashboard deployment insights](/static/images/eas-
update/frontpage/insights.png)

You'll get a [deployments
dashboard](https://expo.dev/accounts/%5Baccount%5D/projects/%5Bproject%5D/deployments)
that helps visualize which updates are being sent to builds. Updates work in
concert with [insights](/eas-insights/introduction) to provide data on the
adoption rates of your updates with your users.

## Republish for reverting mistakes

![Republishing button on an update](/static/images/eas-
update/frontpage/republish.png)

If an update isn't performing as expected, you can [republish](/eas-
update/eas-cli#republish-a-previous-update-within-a-branch) a previous, stable
version on top of the problematic one, much like a new "commit" in version
control systems.

## Get started

[Get started with EAS UpdateLearn how to get started with the setup required
to configure and use EAS Update in your project.](/eas-update/getting-started)
[Publish an updateLearn how to publish an update to a specific branch with EAS
Update.](/eas-update/getting-started#publish-an-update) [Preview updatesView
your teammate's changes with EAS Update.](/eas-update/develop-faster) [Use
GitHub ActionsPublish an update and preview with a QR code after a
commit.](/eas-update/github-actions) [Migrate from CodePushLearn how to
migrate from CodePush to EAS Update.](/eas-update/codepush)

