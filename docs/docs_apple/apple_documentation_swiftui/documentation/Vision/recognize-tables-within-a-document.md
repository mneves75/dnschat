  * [ Vision ](/documentation/vision)
  * Recognizing tables within a document 

Sample Code

# Recognizing tables within a document

Scan a document containing a contact table and extract the content within the
table in a formatted way.

[ Download ](https://docs-
assets.developer.apple.com/published/ac3602c841c7/RecognizingTablesWithinADocument.zip)

iOS 26.0+iPadOS 26.0+Xcode 26.0+

## [Overview](/documentation/Vision/recognize-tables-within-a-
document#Overview)

Note

This sample code project is associated with WWDC25 session 272: [Reading
documents using Vision](https://developer.apple.com/videos/play/wwdc2025/272).

### [Configure the sample code project](/documentation/Vision/recognize-
tables-within-a-document#Configure-the-sample-code-project)

Because this sample app requires camera access, you’ll need to build and run
this sample on a device. The first time you run this sample on device, you
need to grant the app access to the camera. In the sample project’s `assets`
folder, open the `sampleDocuments.png` file and use the rear camera on iPad or
iPhone. Optionally, if you have access to a printer, print this file and try
scanning it with your device.

## [See Also](/documentation/Vision/recognize-tables-within-a-document#see-
also)

### [Text detection](/documentation/Vision/recognize-tables-within-a-
document#Text-detection)

[Locating and displaying recognized text](/documentation/vision/locating-and-
displaying-recognized-text)

Perform text recognition on a photo using the Vision framework’s text-
recognition request.

[`struct
RecognizeDocumentsRequest`](/documentation/vision/recognizedocumentsrequest)

An image-analysis request to scan an image of a document and provide
information about its structure.

[`struct DocumentObservation`](/documentation/vision/documentobservation)

Information about the sections of content that an image-analysis request
detects in a document.

[`struct
DetectTextRectanglesRequest`](/documentation/vision/detecttextrectanglesrequest)

An image-analysis request that finds regions of visible text in an image.

[`struct RecognizeTextRequest`](/documentation/vision/recognizetextrequest)

An image-analysis request that recognizes text in an image.

