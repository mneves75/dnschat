# Deploy your first Expo Router and React app

[Edit](https://github.com/expo/expo/edit/main/docs/pages/eas/hosting/get-
started.mdx)

Copy

Learn how to deploy your Expo Router and React apps to EAS Hosting.

[Edit](https://github.com/expo/expo/edit/main/docs/pages/eas/hosting/get-
started.mdx)

Copy

* * *

EAS Hosting is a react hosting service that allows you to deploy an exported
Expo web build to a preview or production URL.

This guide will walk you through the process of creating your first web
deployment.

[![Watch: Deploy your Expo Router web
project](https://i3.ytimg.com/vi/NaKsfWciJLo/maxresdefault.jpg)Watch: Deploy
your Expo Router web project](https://www.youtube.com/watch?v=NaKsfWciJLo)

## Why EAS Hosting

Historically, traditional website hosting services were recommended for
deploying Expo Router and React apps. However, this approach doesn't address
the unique challenges of dealing with native apps. Here are some key
limitations:

  * Version synchronization: During the app store publishing process, you may need to deploy new versions of your servers.

  * Request routing complexity: Different versions of your native app may require routing to specific server versions. This can create additional complexity when handling requests.

  * Platform-specific analysis: When running native apps, you need enhanced observability for platform-specific metrics.

The introduction of EAS Hosting aims to address these limitations.

## Prerequisites

An Expo user account

EAS Hosting is available to anyone with an Expo account, regardless of whether
you pay for EAS or use the Free plan. You can sign up at
[expo.dev/signup](https://expo.dev/signup).

Paid subscribers can create more deployments, have more bandwidth, storage,
requests, and may set up a custom domain. Learn more about different plans and
benefits at [EAS pricing](https://expo.dev/pricing#host).

An Expo Router web project

Don't have a project yet? No problem. It's quick and easy to create a "Hello
world" app that you can use with this guide.

Run the following command to create a new project:

Terminal

Copy

`- ``npx create-expo-app@latest my-app`

1

## Install the latest EAS CLI

EAS CLI is the command line app you will use to interact with EAS services
from your terminal. To install it, run the command:

Terminal

Copy

`- ``npm install --global eas-cli`

You can also use the above command to check if a new version of EAS CLI is
available. We encourage you to always stay up to date with the latest version.

> We recommend using `npm` instead of `yarn` for global package installations.
> You may alternatively use `npx eas-cli@latest`. Remember to use that instead
> of `eas` whenever it's called for in the documentation.

2

## Log in to your Expo account

If you are already signed in to an Expo account using Expo CLI, you can skip
the steps described in this section. If you are not, run the following command
to log in:

Terminal

Copy

`- ``eas login`

You can check whether you are logged in by running `eas whoami`.

3

## Prepare your project

For your app config file's
[`expo.web.output`](/versions/latest/config/app#output), decide whether to set
it to either `single`, `static`, or `server`.

  * `single`: Exports your Expo app to a single-page app with only one `index.html` output
  * `static`: Exports your Expo app to a [statically generated web app](/router/reference/static-rendering)
  * `server`: Supports [server functions](/guides/server-components#react-server-functions) and [API routes](/router/reference/api-routes) as well as static pages for your app

> Don't worry if you're not sure which output mode you need, you can always
> change this value later and re-deploy.

4

### Export your app

You need to export your web project into a dist directory. To do this, run:

Terminal

Copy

`- ``npx expo export --platform web`

> Remember to re-run this command every time before deploying.

5

### Deploy your app

Now publish your website to EAS Hosting:

Terminal

Copy

`- ``eas deploy`

The first time you run this command, it will:

  1. Prompt you to connect an EAS project if you haven't done so yet
  2. Ask you to choose a preview subdomain name

> A preview subdomain name is a prefix used for the preview URL of your app.
> For example, if you choose `my-app` as your preview subdomain name, your
> preview URL would look something like this: `https://my-app--
> or1170q9ix.expo.app/`, and your production URL would be: `https://my-
> app.expo.app/`.

Once your deployment is complete, the CLI will output a preview URL for where
your deployed app is accessible, as well as a link to the deployment details
on the EAS Dashboard.

