  * [ HealthKit ](/documentation/healthkit)
  * Logging symptoms associated with a medication 

Sample Code

# Logging symptoms associated with a medication

Fetch medications and dose events from the HealthKit store, and create symptom
samples to associate with them.

[ Download ](https://docs-
assets.developer.apple.com/published/dbe02a347c0c/LoggingSymptomsAssociatedWithAMedication.zip)

iOS 26.0+iPadOS 26.0+Xcode 26.0+

## [Overview](/documentation/HealthKit/logging-symptoms-associated-with-a-
medication#Overview)

Note

This sample code project is associated with WWDC25 session 321: [Meet the
HealthKit Medications API](https://developer.apple.com/wwdc25/321/).

### [Configure the sample code project](/documentation/HealthKit/logging-
symptoms-associated-with-a-medication#Configure-the-sample-code-project)

Before you run the sample code project:

  1. Open the sample with the latest version of Xcode.

  2. Set the developer team for the project target to let Xcode automatically manage the provisioning profile. For more information, see [Set the bundle ID](/documentation/Xcode/preparing-your-app-for-distribution) and [Assign the project to a team](/documentation/Xcode/preparing-your-app-for-distribution).

To play with the sample app:

  1. Launch the Health app on your iPhone, select the Browse tab, and tap Medications.

  2. In the Medications view, add Acetaminophen 500 mg Oral Capsule, Carbinoxamine Maleate Biphasic Release Oral Capsule (10 mg), or Ciprofloxacin Injection 200 mg/20 mL as a sample medication. The sample app associates symptoms with these three medications using their RxNorm codes by mapping the codes to their symptoms in the `SideEffects` dictionary in `SideEffects.swift`.

  3. For each medication, log a dose as _taken_ in the As Needed Medications section. The sample app forms a predicate to only look for doses marked as `taken`.

  4. Build and run the sample app on the iPhone to see the medication list after providing authorization. Tap a medication to see the most-recent dose event and associated symptoms. When tapping a medication, an additional authorization sheet prompts for authorization to access symptoms data.

  5. To add more medications in the Health app and view them in the sample app, add their RxNorm codes to the `SideEffects` dictionary, along with their associated symptoms. For instance, for piroxicam, the RxNorm code is 105929, and the symptoms can be headache, loss of appetite, and nausea. To view the symptoms, modify `SideEffects` by adding the following code:

    
    
    "105929": [SymptomModel(name: "Headache", categoryID: .headache),
    			SymptomModel(name: "Diarrhea", categoryID: .diarrhea),
    			SymptomModel(name: "Nausea", categoryID: .nausea)]
    

  6. Log doses for medications over time, and observe them in the Charts tab of the sample app.

## [See Also](/documentation/HealthKit/logging-symptoms-associated-with-a-
medication#see-also)

### [Health data](/documentation/HealthKit/logging-symptoms-associated-with-a-
medication#Health-data)

[Saving data to HealthKit](/documentation/healthkit/saving-data-to-healthkit)

Create and share HealthKit samples.

[Reading data from HealthKit](/documentation/healthkit/reading-data-from-
healthkit)

Use queries to request sample data from HealthKit.

[`class HKHealthStore`](/documentation/healthkit/hkhealthstore)

The access point for all data managed by HealthKit.

[Creating a Mobility Health App](/documentation/healthkit/creating-a-mobility-
health-app)

Create a health app that allows a clinical care team to send and receive
mobility data.

[API ReferenceData types](/documentation/healthkit/data-types)

Specify the kind of data used in HealthKit.

[API ReferenceSamples](/documentation/healthkit/samples)

Create and save health and fitness samples.

[API ReferenceQueries](/documentation/healthkit/queries)

Query health and fitness data.

[Visualizing HealthKit State of Mind in
visionOS](/documentation/healthkit/visualizing-healthkit-state-of-mind-in-
visionos)

Incorporate HealthKit State of Mind into your app and visualize the data in
visionOS.

