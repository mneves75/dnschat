  * [ Xcode ](/documentation/xcode)
  * [ Source Editor ](/documentation/xcode/source-editor)
  * Running code snippets using the playground macro 

Article

# Running code snippets using the playground macro

Add playgrounds to your code that run and display results in the canvas.

## [Overview](/documentation/Xcode/running-code-snippets-using-the-playground-
macro#Overview)

You can explore and experiment with your code using playgrounds that you add
directly to your Swift files. Xcode immediately shows the results of running
the playgrounds in the canvas. Xcode can also generate playgrounds for you
about symbols or selections in your code.

Tip

Previews that you add to SwiftUI files also appear in the canvas. For
information on adding previews, see [Previewing your app’s interface in
Xcode](/documentation/xcode/previewing-your-apps-interface-in-xcode).

### [Add playgrounds to your Swift files](/documentation/Xcode/running-code-
snippets-using-the-playground-macro#Add-playgrounds-to-your-Swift-files)

You can add one or more playgrounds to a Swift file. First, import the
Playgrounds framework in your Swift file. Then wrap the code snippet that you
want to run in the `#Playground` macro, for example:

    
    
    import MapKit
    import Playgrounds
    
    
    #Playground {
        // Golden Gate Park
        let latitude = 37.768552
        let longitude = -122.481616
        let location = CLLocationCoordinate2D(latitude: latitude, longitude: longitude)
    }
    

If the canvas isn’t open, choose Editor > Canvas to display the canvas. Then
click the Resume button to run the playground and see the results in the
canvas.

### [View the results in the canvas](/documentation/Xcode/running-code-
snippets-using-the-playground-macro#View-the-results-in-the-canvas)

In the canvas, use the controls under each line of code to see the details.
For example, click the disclosure triangle under a variable name to show or
hide its value.

If a line of code contains a viewable object — such as an image, color, or
location — Xcode displays it in the canvas. To collapse the view, toggle the
eye button to off. For example, if a line of code prints a value, Xcode
displays that value. If a line of code sets a `CLLocationCoordinate2D`
variable, Xcode displays the location on a map.

### [Navigate between multiple playgrounds and
previews](/documentation/Xcode/running-code-snippets-using-the-playground-
macro#Navigate-between-multiple-playgrounds-and-previews)

If you add multiple playgrounds, you can switch between them, and any previews
that you add to the same file, using the tabs that appear at the top of the
canvas. When you click a tab, Xcode runs that playground or preview and shows
the results in the canvas. Playground tabs have a beaker icon and previews
have an eye icon in front of the name.

### [Generate playgrounds from your code](/documentation/Xcode/running-code-
snippets-using-the-playground-macro#Generate-playgrounds-from-your-code)

To quickly add a playground, let the coding assistant generate one for you
from a selection in your code.

In the source editor, select a symbol and click the coding assistant icon that
appears, or Control-click a symbol and choose Show Coding Tools > Show Coding
Tools from the pop-up menu. In the coding tools popover that appears, click
Generate a Playground to add a playground.

Xcode shows the results of the playground, and for SwiftUI files, the
previews, in the canvas area. If the canvas isn’t open, choose Editor > Canvas
to show it, then click Resume.

The coding tools communicate with the same large language model to generate
the playground that the coding assistant uses to write code. For more
information, see [Writing code with intelligence in
Xcode](/documentation/xcode/writing-code-with-intelligence-in-xcode).

## [See Also](/documentation/Xcode/running-code-snippets-using-the-playground-
macro#see-also)

### [Source file creation, organization, and
editing](/documentation/Xcode/running-code-snippets-using-the-playground-
macro#Source-file-creation-organization-and-editing)

[Editing source files in Xcode](/documentation/xcode/creating-organizing-and-
editing-source-files)

Edit source files in Xcode and add Quick Help comments to improve your
project’s maintainability.

