  * [ Xcode ](/documentation/xcode)
  * [ Distribution ](/documentation/xcode/distribution)
  * Testing a beta OS 

Article

# Testing a beta OS

Manage unintended differences in your app by testing beta operating-system
(OS) releases.

## [Overview](/documentation/xcode/testing-a-beta-os#Overview)

To catch API issues or incompatibilities, test your app on every released beta
version during the beta release cycle. Beta software can introduce new issues
in your app. To reduce the likelihood that these issues will impact your
customers, identify, report, and address them as early in the beta release
cycle as possible. As the beta release cycle progresses, and Apple promotes
the beta to Release Candidate, making changes without causing other
instabilities becomes more difficult, so report issues as soon as you identify
them.

### [Install the beta OS](/documentation/xcode/testing-a-beta-os#Install-the-
beta-OS)

To begin testing your app on a beta OS, download and install the beta OS on a
device you plan to use for testing. Test your app on the beta OS for each
platform on which your app is available: Mac, Apple TV, Apple Watch, iPhone or
iPad. To find the latest beta OS for each platform, and information about
preparing to install the beta OS, see [Using Apple Beta
Software](https://developer.apple.com/support/beta-software/).

### [Install your app](/documentation/xcode/testing-a-beta-os#Install-your-
app)

To find the problems that your users might experience on the new version of
the OS in your current app, install the current version of your app on your
test device, either from the [App Store](https://www.apple.com/app-store/) or
from [TestFlight](https://developer.apple.com/testflight/). Rebuilding your
app using the beta SDK might introduce further changes that your customers
don’t experience in the current version of your app.

### [Test for changes in API behavior](/documentation/xcode/testing-a-beta-
os#Test-for-changes-in-API-behavior)

The behavior of APIs in system frameworks that you use can change between
releases. To identify changes in behavior, thoroughly test your app by
exercising all code paths in your app. Test your app for each major OS version
it supports, on at least one device for each family of devices that your
customers use. Device families have the same architecture, screen resolution,
and hardware capabilities. At a minimum, test your iOS, iPadOS, tvOS,
visionOS, and watchOS apps using Simulator. However, Simulator provides
limited testing coverage and is not a substitute for physical hardware with
real memory and performance constraints.

If you don’t notice any issues or changes in API behavior, then you don’t need
to make any changes to your app, but you still need to test each beta OS
release. If you notice a change in the behavior in some part of your app, it
might be caused by a change in API behavior in the beta OS.

Once you identify a change in your app’s behavior, locate the portion of your
code that relates to that behavior. In this portion of code, identify the
system framework APIs involved, and then report the change in API behavior
using [Feedback Assistant](https://developer.apple.com/bug-reporting/). When
you submit your feedback, include a runnable Xcode project that reproduces the
problem, and provide a clear description of the issue with details about the
differences between the observed behavior and the expected behavior.

Remember to update your feedback for each subsequent beta release. Reporting
issues early and often throughout the beta release cycle provides the best
chance for issue resolution before the OS revision goes public.

### [Address changes in API behavior](/documentation/xcode/testing-a-beta-
os#Address-changes-in-API-behavior)

If your observed change in behavior results from a bug in your code, you can
directly address the issue. To debug the issue, rebuild your app using the
Xcode beta that contains the SDK for the beta OS you’re testing.

Rebuilding your app using a new SDK can cause further changes in API behavior,
so after rebuilding follow the same beta-testing procedure to identify and
report new changes. Additionally, rebuilding your app using a new SDK can
cause changes when your app runs on older operating systems. To avoid missing
issues that might occur on a unique device configuration, test on each device
configuration your customers may have whenever you rebuild your app with a new
SDK.

The [Developer Forums](https://developer.apple.com/forums/) are a great
resource to discuss potential workarounds and solutions for issues in your
code.

Important

Report all issues using Feedback Assistant. Discussing an issue on a Developer
Forum is helpful as a second step after you report the issue.

If you identify a change in API behavior that reproduces on the older, non-
beta OS, report the issue using [Feedback
Assistant](https://developer.apple.com/bug-reporting/). Mention all OS
versions that can reproduce the issue in your feedback, and also include a
runnable Xcode project that demonstrates the issue. If you require assistance
while investigating a workaround for the issue, [Submit a Developer Technical
Support Incident](https://developer.apple.com/support/technical/) to get help
from Apple’s Developer Technical Support Group (DTS).

## [See Also](/documentation/xcode/testing-a-beta-os#see-also)

### [Testing](/documentation/xcode/testing-a-beta-os#Testing)

[Testing a release build](/documentation/xcode/testing-a-release-build)

Run your app in simulated user environments to discover and identify
deployment errors.

