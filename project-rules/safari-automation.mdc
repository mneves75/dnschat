---
description: Patterns and best practices for automating Safari browser interactions for web UI automation and testing
globs: "**/*.applescript, **/safari-*.js"
alwaysApply: false
---

# Safari Automation Guide

This guide captures hard-won lessons from automating Safari interactions, particularly for web UI automation and testing.

## Key Concepts

### Managing Safari Windows and Tabs

**Objective:** Reliably direct Safari to specific URLs in a predictable way, preferably using a single, consistent browser window and tab.

**Recommended Approach:**
```applescript
tell application "Safari"
  activate
  delay 0.2 -- Allow Safari to become the frontmost application
  if (count of windows) is 0 then
    -- No Safari windows are open, so create a new one.
    make new document with properties {URL:"http://example.com"}
  else
    -- Safari has windows open; use the frontmost one.
    tell front window
      set targetTab to missing value
      try
        -- Check if a tab for the target URL is already open
        set targetTab to (first tab whose URL starts with "http://example.com")
      end try
      
      if targetTab is not missing value then
        -- Reuse existing tab: refresh and make active
        set URL of targetTab to "http://example.com"
        set current tab to targetTab
      else
        -- No specific tab found: use current active tab
        set URL of current tab to "http://example.com"
      end if
    end tell
  end if
  delay 1 -- Pause to allow the page to begin loading
end tell
```

### JavaScript Execution in AppleScript

**String Escaping Strategies:**

1. **Using Escaped Quotes:**
   ```applescript
   do JavaScript "document.querySelector('[data-testid=\\'my-button\\']').click();"
   ```

2. **Using character id 39 for Complex Strings:**
   ```applescript
   set sQuote to character id 39
   set jsSelector to "[data-testid=" & sQuote & "my-button" & sQuote & "]"
   set jsCommand to "document.querySelector(" & sQuote & jsSelector & sQuote & ").click();"
   do JavaScript jsCommand in front document
   ```

3. **XPath for Robust Element Selection:**
   ```applescript
   -- Find button containing specific text
   set jsCommand to "document.evaluate(\"//button[.//text()='Connect']\", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.click();"
   do JavaScript jsCommand in front document
   ```

### Shadow DOM Interaction

**Accessing Elements within Shadow DOM:**
```javascript
// JavaScript to execute via AppleScript
function findInShadowDOM(selector) {
  // Helper function to search including shadow roots
  function searchShadowDOM(root, selector) {
    const el = root.querySelector(selector);
    if (el) return el;
    
    // Search in shadow roots
    const allElements = root.querySelectorAll('*');
    for (const element of allElements) {
      if (element.shadowRoot) {
        const found = searchShadowDOM(element.shadowRoot, selector);
        if (found) return found;
      }
    }
    return null;
  }
  
  return searchShadowDOM(document, selector);
}

// Usage example
const button = findInShadowDOM('button.my-shadow-button');
if (button) button.click();
```

### Timing and Synchronization

**Strategic vs Tactical Delays:**

1. **Strategic Delays (Critical):** After launching external processes
   - Use 5-10 second delays after starting web servers
   - Allows services to fully initialize before interaction

2. **Tactical Delays (Often Avoidable):** Within UI automation
   - Small delays (0.2-1s) between UI actions
   - Can often be removed if the application is responsive

**Verification Pattern:**
```applescript
-- Execute action
do JavaScript "document.querySelector('button').click();" in front document

-- Wait and verify result
delay 2
set pageText to do JavaScript "document.body.innerText" in front document
if pageText contains "Success" then
  -- Action completed successfully
else
  -- Handle failure case
end if
```

## Best Practices

1. **Always Activate Safari First**
   - Ensures Safari is frontmost before automation
   - Prevents interactions with wrong application

2. **Use Try Blocks for Resilience**
   ```applescript
   try
     -- Automation code here
   on error errMsg
     display dialog "Automation failed: " & errMsg
   end try
   ```

3. **Return Values for Debugging**
   ```applescript
   set elementFound to do JavaScript "return document.querySelector('.my-class') !== null;"
   if elementFound then
     -- Element exists, proceed
   end if
   ```

4. **Handle Dynamic Content**
   - Use XPath for text-based selection
   - Implement retry logic for async content
   - Consider Shadow DOM for component-based UIs

## Common Pitfalls

1. **Quote Escaping Issues**
   - AppleScript parsing errors (-2741) often indicate quote problems
   - Use `character id 39` technique for complex strings

2. **Timing Issues**
   - Insufficient delays after page loads
   - Not waiting for async operations to complete

3. **Shadow DOM Blindness**
   - Standard selectors won't find shadow DOM elements
   - Need specialized traversal functions

4. **Process Identification**
   - Apps may have different process names than expected
   - Use bundle identifiers when possible

## Integration with Other Tools

### Terminal Integration
```applescript
-- Example: Starting a web server before Safari automation
tell application "Terminal"
  activate
  do script "cd /path/to/project && npm start"
end tell
delay 5 -- Strategic delay for server startup

-- Then proceed with Safari automation
```

### Screenshot Capture
```applescript
-- Capture Safari window after automation
tell application "System Events"
  tell process "Safari"
    set frontWindow to window 1
    set {xPosition, yPosition} to position of frontWindow
    set {windowWidth, windowHeight} to size of frontWindow
  end tell
end tell

do shell script "screencapture -R" & xPosition & "," & yPosition & "," & windowWidth & "," & windowHeight & " ~/Desktop/safari-result.png"
```

This guide provides reusable patterns for Safari automation that can be adapted to various web testing and automation scenarios.