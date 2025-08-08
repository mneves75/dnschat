Before you can share an iOS build on TestFlight you need three pillars in place: an Apple Developer Program membership, a properly signed archive, and an App Store Connect record for your app. Once those pieces are ready, Xcode (or CLI tools like Transporter and EAS Submit) let you upload the build, and TestFlight handles distribution to up to 100 internal and 2 000 external testers after a quick compliance review. Below is a step-by-step roadmap that covers certificates, archiving, upload paths, tester management, and common pitfalls.

1  Prerequisites

1.1 Apple Developer Program

You (or your team) must have a paid Developer account; only the Account Holder or an Admin can request distribution certificates and upload builds.  ￼

1.2 Certificates & Profiles

Xcode’s automatic signing will generate a Distribution certificate and an App Store provisioning profile tied to your explicit bundle ID, but you can also create them manually in Certificates, Identifiers & Profiles if you prefer granular control.  ￼

1.3 Xcode & SDK Target

As of April 29 2024 Apple requires builds to be produced with Xcode 15 or later and target iOS 17 SDKs.  ￼

⸻

2  Create (or Update) the App Record in App Store Connect
	1.	Log in to App Store Connect and choose My Apps → + New App (or pick an existing record).
	2.	Reserve your Bundle ID, set the SKU, platform (iOS), and default language.
	3.	Fill in basic metadata now—or later—because TestFlight only needs the bundle ID to link the upload.  ￼

⸻

3  Archive & Sign the Build in Xcode
	1.	Bump version and build number in the General → Identity tab.
	2.	Select Any iOS Device (arm64), then Product → Archive.
	3.	In Organizer, Xcode will sign the archive with your distribution cert; choose Distribute App → App Store Connect → Upload. Xcode validates entitlements and encryption export compliance on the way up.  ￼

Tip: If you need to automate uploads in CI, use xcrun altool or Transporter instead of the GUI.  ￼

⸻

4  Alternative Upload Paths

Tool	When to use	Docs
Transporter (Mac app)	Drag-and-drop .ipa archives; no Xcode required on CI machines	￼ ￼
xcrun altool	Scriptable CLI validation & upload from any macOS runner	￼
EAS Submit	React Native / Expo pipelines; pairs with EAS Build	￼
Xcode Cloud	Apple-hosted CI; automatically uploads fresh builds to TestFlight	￼

All routes converge on the same place: App Store Connect → TestFlight → Builds.

⸻

5  Configure the Build in TestFlight
	1.	Select the uploaded build; complete Export Compliance, Content Rights, and Age Rating questions.
	2.	(Optional) Add release notes testers will see in the TestFlight app.
	3.	Mark the build as Internal (instant) or External (requires Apple beta review, often < 24 h).  ￼

⸻

6  Invite Testers

Tester Type	Limit	How to add	Review Needed?
Internal	100 per app	App Store Connect → Users & Access or TestFlight “Internal Testing” tab	No review; build is live as soon as you toggle distribution
External	2 000 per app	Create groups, paste emails or share public link	Apple reviews first build for each version

Testers install TestFlight from the App Store and accept the invite link or redeem code. They can send feedback (screenshots, logs) that appears back in App Store Connect.

⸻

7  Iterate & Expire
	•	Each build is valid for 90 days; push a new build any time via the same archive-upload flow.  ￼
	•	You may keep up to 100 concurrent builds in TestFlight; expire old builds manually to conserve slots.  ￼

⸻a

8  Troubleshooting Checklist

Symptom	Likely Cause	Fix
“ITMS-90161: Invalid provisioning profile type”	Using development profile for distribution	Ensure App Store profile selected in Signing & Capabilities
Build stuck in “Processing” > 30 min	Unmet SDK requirement or missing privacy usage string	Check App Privacy section and SDK version in Xcode 15+
Testers get “this build is no longer available”	90-day expiry reached	Upload a new build, increment build number
External testers never see invite	Forgot to submit build for external testing review	In TestFlight tab, click Submit for Review


⸻

9  Automation & CI Tips
	•	Add xcodebuild -exportArchive and xcrun altool steps to GitHub Actions or Bitrise to generate and upload .ipa nightly.  ￼
	•	Use EAS Submit with Expo projects: eas submit --platform ios --profile production.  ￼
	•	Xcode Cloud can attach TestFlight release notes automatically after tests pass.  ￼

⸻

You’re Live on TestFlight!

With a signed archive, an App Store Connect record, and one successful upload, you can roll out beta builds in minutes and iterate until your app is App Store-ready. Happy testing! 🚀