# Send us your feedback and report bugs

Developer feedback is vital to making the Apple ecosystem even better. With
Feedback Assistant available on iPhone, iPad, Mac, and the web, it’s easy to
report issues you encounter and request enhancements to APIs, tools, and
services.

![A MacBook Pro, iPad, and iPhone side by side, each featuring a different
screen from Feedback Assistant](/bug-reporting/images/lockup-overview-
large_2x.png)

##  ![](/bug-reporting/images/start.svg) Getting started

Feedback from our developer community helps us address issues, refine
features, and update documentation. Please let us know when you encounter an
issue with Apple software or hardware, have an SDK feature request, find code-
level bugs and problems with Apple-provided APIs, or notice errors or
omissions in developer documentation.

**Start your feedback as soon as you can.** When you send new feedback, the
Feedback Assistant app automatically collects time-sensitive information
that’s important in helping diagnose the issue. If you use the Feedback
Assistant website, you can [collect this information manually](/bug-
reporting/profiles-and-logs/). Once this is done, you can upload the
information directly to [Feedback
Assistant](https://feedbackassistant.apple.com/). If you plan to send feedback
later or through the website, make note of key information, such as the date
and time the issue happened, and collect any files or logs as soon as the
issue occurs. You can start feedback on one device, save it, then switch to a
different device to add more details and submit later.

**File reports against beta software early.** Beta software can sometimes
introduce changes to APIs or new issues in your app that need to be addressed.
If you encounter an issue during the beta release cycle, submit feedback right
away to increase the likelihood that the issue will be addressed by the public
release.

**Submit feedback for every issue.** Even if you think an issue is obvious and
are sure others have reported it, you should still submit feedback. The more
feedback we receive about an issue, the better we understand how many people
are impacted by it.

##  ![](/bug-reporting/images/app-on-devices.svg) Using the Feedback Assistant
app

The Feedback Assistant app offers several helpful features:

**Automatic on-device diagnostics.** There’s no need to manually collect and
attach a sysdiagnose (diagnostic information from various parts of the
operating system and all recent crash logs) for each issue. With your
permission, Feedback Assistant can execute area-specific diagnostics, allowing
you to send information beyond the scope of a sysdiagnose.

**Remote filing.** With Feedback Assistant on iPhone and iPad, you can submit
feedback about your connected Apple TV, HomePod, or Apple Watch, with support
for collecting device diagnostics directly on those devices.

**Detailed forms.** Provide detailed information by answering specific,
conditional questions through a simple filing process.

### Opening the app

**iPhone and iPad.** On beta versions of iOS and iPadOS, the app is available
by default on the Home Screen. On publicly released versions of iOS and
iPadOS, you can enable the app by installing a beta profile. The app can also
be launched via the <applefeedback://> URL scheme.

**Mac.** The app is included in the CoreServices folder in all versions of
macOS, and can be launched via the <applefeedback://> URL scheme or by
searching for Feedback Assistant in Spotlight. You can also open a Finder
window and select Go to Folder from the Go menu, then enter this path:
/System/Library/CoreServices/Applications.

##  ![](/bug-reporting/images/write.svg) Writing your feedback

**Select an appropriate starting topic.** There are several places in Feedback
Assistant to start your feedback.

  * Developer Technologies & SDKs: Select this topic for feedback related to a specific framework or API, then select the specific technology (for example, CoreBluetooth) and OS (for example, iOS).
  * Developer Tools & Resources: Select this topic for feedback related to Xcode, App Store Connect, or other developer tools and resources, then select the specific tool or resource (for example, Reality Composer Pro).
  * Relevant OS (iOS & iPadOS, macOS, tvOS, watchOS, or HomePod): Select the relevant OS for feedback related to general use of a system, then select the specific area (for example, Messages).

**File one issue per report.** To ensure accurate processing, make sure your
report only addresses one issue or request. Reports that discuss multiple
issues aren’t actionable and may be returned for resubmission as separate
reports.

**Title.** Your report title should be concise, while clearly describing the
issue and any factors that could influence the issue you’ve encountered.
Summarize and include key details, such as technology, platform, and version.
For example, “Calendar events on iOS 15.2 beta are missing after creating a
quick event” provides more actionable detail than “Calendar events are
missing.” If the issue is related to your app, make sure to also include your
app’s name and version.

**Description.** Your report should include instructions on how to reproduce
the issue, with detailed descriptions of each step. For instance, you could
write:

  1. Click Quick Event in the Calendar app.
  2. Fill out an event with any title.
  3. Press Return.

Actual results: The event appears in the right place in my calendar, but then
disappears.

Expected results: The event should appear and stay on my calendar.

After you fill in the steps and expected results, consider any additional
factors that could influence the problem. For example, are you signed into
iCloud? Do you have any Accessibility settings turned on? Can you reproduce
the issue elsewhere in the operating system? The more information you include,
the more effectively we can diagnose the issue.

##  ![](/bug-reporting/images/attachments.svg) Including attachments

**Sysdiagnose.** Since the Feedback Assistant app automatically attaches a
sysdiagnose for each issue, we recommend submitting reports directly from the
app on your iPhone, iPad, or Mac. A sysdiagnose contains valuable information
about the state of your system and all recent crash logs, and should be
included with all reports, even if you think one is not needed. Alternatively,
you can use the website to manually upload [relevant files](https://it-
training.apple.com/tutorials/support/sup075/#) and folders as compressed ZIP
files. You may be asked to supply additional files after your report has been
reviewed.

**Debug profiles and logs.** You may be asked to install a debug profile so
you can provide extra reporting and logging details to further diagnose your
report. Debug profiles can capture specific details about a technology or
framework to help us diagnose the problem. To install a debug profile,
download it to your device from the [Profiles and Logs page](/bug-
reporting/profiles-and-logs/). Then follow the instructions to capture the
requested information, and make sure to include any related logs to expedite
the investigation.

**Mac System Information Report.** When you encounter crashes, kernel panics,
hardware bugs, or printing issues, you must include a [Mac System Information
Report](https://support.apple.com/guide/mac-help/get-system-information-about-
your-mac-syspr35536/mac) with your feedback.

**Builds and sample code.** If the problem appears in your app, consider
recreating it in a smaller project so it’s easier to demonstrate. This helps
narrow down the specific bug you’re dealing with and is one of the easiest
ways for us to identify the problem. If you can’t produce a full project that
complies, code examples are also helpful.

**Screenshots or screen recordings.** If an issue appears in a user interface,
make sure to include visuals with your feedback. A screenshot or screen
recording of the reproduced bug can provide valuable clues and details you may
not have thought to include in the description field.

##  ![](/bug-reporting/images/team.svg) Collaborating with your team

We recommend submitting feedback from your [team inbox in Feedback
Assistant](https://support.apple.com/guide/feedback-assistant/manage-team-
feedback-fba9b3f1b328/mac), where you can view all reports filed by your team,
reply to comments, and send new messages to Apple. The assignee of a team
report will receive a notification if there’s a request from Apple and can
download any attachments or close the report at their discretion. By default,
a report is assigned to the team member who submitted it. However, it can be
reassigned to any other team member.

Reports from your team inbox belong to the organization rather than the people
who submitted them. If an assignee leaves the organization, the report stays
with the team. In addition to your team inbox, you also have a personal inbox
for separate submissions. You can move reports from your personal inbox to
your team inbox at any time.

##  ![](/bug-reporting/images/submit.svg) What to expect after submission

Your feedback will be assigned a Feedback Assistant ID, which you can use to
check for updates or resolutions on feedback you’ve filed. We may also email
you asking for additional information or files to investigate the issue. While
we can’t reply to every submission, we review each one and monitor the amount
of feedback submitted so we can better understand the scope of the problem.

Please note, as an issue is being worked on, we can’t provide intermediate
status updates until a fix is available in a beta software update for
everyone, or a different resolution has been identified after completing the
investigation of the issue.

###  Understanding feedback status

**Recent Similar Reports.** Find out how many similar reports have been
grouped with your report within the last year. This status will be set to
None, Less than 10, or More than 10. As we refine our understanding of your
feedback and as more feedback is received from others, this value may change.
Any reports created in the last year are considered recent, since as reports
age they’re often less reproducible and less likely to be similar to new
reports, even if the symptoms seem similar.

**Open.** The report is being investigated by Apple. It may also have been
returned to you with a request for additional information to continue the
investigation.

**Potential Fix Identified – For a Future OS Update.** A potential fix for the
reported issue may appear in a future OS update, which will usually be
released within the next year. This resolution also includes the platform
version and build number when it becomes available in a beta release.

Your report may be grouped with similar reports that initially seem to have
the same root cause. However, similar reports may have multiple causes. If you
find that the fix doesn’t fully resolve your report even though it resolves
similar reports, file a new report.

**Investigation Complete – Change Required by a Third Party.** The reported
issue requires changes in non-Apple software, hardware, or services in order
to be resolved.

**Investigation Complete – Works as Designed.** The report describes behavior
that occurs as designed.

**Investigation Complete - Unable to Diagnose with Current Information.** The
reported issue requires additional information to continue the investigation.
You may need to supply additional log files, steps to reproduce, or other
clarifying details.

**Closed.** You’ve marked your report as closed. You can mark a report as
closed at any time if you’re no longer experiencing the issue. If you
encounter the same issue after closing your report, submit a new report.

##  ![](/bug-reporting/images/workaround.svg) Working around known issues

If you continue to experience an issue with Apple software or services after
filing a report with Feedback Assistant, workarounds may be available while
the issue is being investigated. To determine whether a solve or workaround
exists, start by checking the following resources:

**Release notes.** Review the latest release notes for recent software updates
to verify if an issue from a previous update has been resolved or if there’s a
workaround. The latest release notes can be found in your Feedback Assistant
inbox or on the [Software Releases page](/news/releases/).

**Forums.** Check if the issue you’re experiencing has been discussed and
resolved on the [Apple Developer Forums](/forums/).

**Code-level support.** Members of the Apple Developer Program or Apple
Developer Enterprise Program can ask for code-level support on the forums, or
by filling out the Code-Level Support Request form. Be sure to include the
information you provided in your Feedback Assistant report, along with any
pertinent files or logs. Your Feedback Assistant ID can also be helpful in
diagnosing your issue, and we encourage you to include it as well. Incidents
are assigned to technical support engineers who can investigate any possible
workarounds.

##  ![](/bug-reporting/images/inactive.svg) Removing data from inactive
reports

As part of our commitment to privacy and in accordance with the European
Union’s General Data Protection Regulation (GDPR), we’ve removed developer
data from certain reports as of late fall 2018.

**Data removed from inactive issues.** Developer data is removed from issues
that have been closed for at least five years, haven’t been updated for 60
days, and aren’t duplicates of other issues. Developer-originated sysdiagnoses
and related attachments will be deleted, and any reference to the developer
who submitted the original feedback will be redacted. In addition, these
issues will no longer be displayed.

**Duplicate issues will remain available for a limited time.** If an issue is
marked as a duplicate, developer data will be removed once the original bug
has been closed for five years and hasn’t been updated for 60 days. Until
then, you can continue to follow the state of the original issue until it’s
closed, and engineering can still reach out to you until the issue is
resolved.

##  ![](/bug-reporting/images/bugs.svg) Related programs

### Apple Security Bounty

If you believe you’ve discovered a security or privacy vulnerability that
affects Apple devices, software, services, or web servers, please report it to
the Apple security team. We welcome reports from anyone, including security
experts, developers, and customers. All reports are reviewed and evaluated for
a payout.

[Learn more](/security-bounty/)

### Apple Beta Software Program

The Apple Beta Software Program collects feedback on prerelease Apple
software. As a member of the Apple Beta Software Program, you’ll be able to
enroll your devices to access the public betas, try out the latest features,
and provide feedback directly to Apple using the Feedback Assistant app.

[Learn more](https://beta.apple.com/sp/betaprogram/welcome/)

##  ![](/bug-reporting/images/resources.svg) Resources

  * [Feedback Assistant User Guide](https://support.apple.com/guide/feedback-assistant/welcome/mac/)
  * [Profiles and Logs](/bug-reporting/profiles-and-logs/)
  * [Downloads and release notes](/news/releases/)
  * [Developer Technical Support](/support/technical/)
  * [Developer Forums](/forums/)

