---
description: Reusable AppleScript patterns for automated screenshot capture for documentation and testing
globs: "**/*.applescript, **/screenshot-*.js"
alwaysApply: false
---

# Screenshot Automation Guide

This guide provides reusable AppleScript patterns for taking automated screenshots of applications, particularly useful for documentation, testing, and visual verification.

## Core Concepts

### Application Identification

Applications can be identified through multiple methods:
- **Bundle ID**: Most reliable for packaged apps (e.g., `com.company.AppName`)
- **Process Name**: May differ from app name (e.g., "Electron" for dev builds)
- **Absolute Path**: Most reliable for development builds and non-standard locations

### Basic Screenshot Script

```applescript
-- Script to take an unattended screenshot of an app window
-- Set appPath to the full path of the application

try
    -- Set this to the full path of the application
    set appPath to "/Applications/YourApp.app"
    
    -- Generate timestamp for unique filename
    set currentDate to do shell script "date '+%Y-%m-%d_%H-%M-%S'"
    set desktopPath to (path to desktop folder as text)
    set posixDesktopPath to POSIX path of desktopPath
    set screenshotPath to posixDesktopPath & "app_screenshot_" & currentDate & ".png"
    
    -- Extract app name from path
    set appName to do shell script "basename " & quoted form of appPath & " .app"
    
    -- Check if app is running and get process name
    set isRunning to false
    set appProcessName to ""
    
    -- Try to identify by bundle ID first
    try
        set appBundleID to do shell script "mdls -name kMDItemCFBundleIdentifier -raw " & quoted form of appPath
        
        tell application "System Events"
            set allProcesses to every process
            repeat with currentProcess in allProcesses
                try
                    if bundle identifier of currentProcess is appBundleID then
                        set isRunning to true
                        set appProcessName to name of currentProcess
                        exit repeat
                    end if
                end try
            end repeat
        end tell
    on error
        -- Fallback to app name matching
        set appProcessName to appName
        tell application "System Events"
            if exists process appProcessName then
                set isRunning to true
            end if
        end tell
    end try
    
    -- Launch app if not running
    if not isRunning then
        do shell script "open " & quoted form of appPath
        delay 2 -- Wait for app to launch
        
        -- Identify the launched process
        tell application "System Events"
            set newProcesses to every process
            repeat with currentProcess in newProcesses
                try
                    set processName to name of currentProcess
                    if processName contains appName then
                        set appProcessName to processName
                        set isRunning to true
                        exit repeat
                    end if
                end try
            end repeat
        end tell
    end if
    
    -- Verify we have a valid process
    if appProcessName is "" or not isRunning then
        return "Could not determine process name for app at path: " & appPath
    end if
    
    -- Take the screenshot
    tell application "System Events"
        tell process appProcessName
            -- Bring to front
            try
                set frontmost to true
                delay 0.5 -- Allow time to come to front
            on error errMsg
                log "Note: Could not bring " & appProcessName & " to front: " & errMsg
            end try
            
            if (count of windows) > 0 then
                set appWindow to window 1
                set windowPosition to position of appWindow
                set windowSize to size of appWindow
                
                set windowX to item 1 of windowPosition
                set windowY to item 2 of windowPosition
                set windowWidth to item 1 of windowSize
                set windowHeight to item 2 of windowSize
                
                -- Validate dimensions
                if windowWidth is 0 or windowHeight is 0 then
                    return "Window has zero dimensions"
                end if
                
                delay 0.5 -- Final delay for window readiness
                set regionString to windowX & "," & windowY & "," & windowWidth & "," & windowHeight
                do shell script "screencapture -x -R" & regionString & " " & quoted form of screenshotPath
                
                return "Screenshot saved to: " & screenshotPath
            else
                return "No windows found for " & appProcessName
            end if
        end tell
    end tell
on error errMsg
    return "Error: " & errMsg
end try
```

## Advanced Patterns

### Multiple Window Screenshots

```applescript
-- Capture all windows of an application
tell application "System Events"
    tell process "YourAppName"
        set windowCount to count of windows
        repeat with i from 1 to windowCount
            set currentWindow to window i
            -- Get window bounds and capture
            -- ... (screenshot code here)
        end repeat
    end tell
end tell
```

### Screenshot with Specific Window State

```applescript
-- Prepare window before screenshot
tell application "System Events"
    tell process appProcessName
        -- Maximize window
        tell window 1
            set size to {1920, 1080}
            set position to {0, 0}
        end tell
        
        -- Wait for any animations
        delay 1
        
        -- Take screenshot
        -- ... (screenshot code here)
    end tell
end tell
```

### Integration with Screenshot Tools

For more advanced screenshot needs, consider using specialized tools:

1. **[Peekaboo](https://github.com/steipete/Peekaboo)** - Automated screenshot tool
   ```bash
   # Install Peekaboo
   brew install steipete/formulae/peekaboo
   
   # Use in AppleScript
   do shell script "peekaboo capture --app 'YourApp' --output ~/Desktop/screenshot.png"
   ```

2. **Built-in macOS screencapture**
   ```applescript
   -- Window screenshot with shadow
   do shell script "screencapture -w ~/Desktop/window.png"
   
   -- Interactive selection
   do shell script "screencapture -i ~/Desktop/selection.png"
   
   -- Full screen
   do shell script "screencapture ~/Desktop/fullscreen.png"
   ```

## Best Practices

### 1. Error Handling
Always wrap screenshot operations in try blocks:
```applescript
try
    -- Screenshot operations
on error errMsg number errNum
    log "Screenshot failed: " & errMsg & " (Error " & errNum & ")"
    -- Handle specific errors
end try
```

### 2. Timing Considerations
- Allow time for app launch (2-3 seconds)
- Brief delays after window focus (0.5 seconds)
- Longer delays for animation-heavy apps

### 3. Process Identification Strategy
```applescript
-- Robust process identification
on findProcess(appPath)
    -- Try bundle ID first
    -- Fall back to name matching
    -- Finally try path matching
    return processName
end findProcess
```

### 4. Screenshot Verification
```applescript
-- Verify screenshot was created
set fileExists to do shell script "[ -f " & quoted form of screenshotPath & " ] && echo 'true' || echo 'false'"
if fileExists is "true" then
    -- Get file size to ensure it's not empty
    set fileSize to do shell script "stat -f%z " & quoted form of screenshotPath
    if fileSize as integer > 0 then
        return "Screenshot successful"
    end if
end if
```

## Common Issues and Solutions

### Electron/Development Apps
Development builds often run under generic names:
```applescript
-- For Electron apps in development
set appProcessName to "Electron"
-- May need to identify by window title instead
tell application "System Events"
    tell process "Electron"
        set targetWindow to (first window whose title contains "YourAppName")
    end tell
end tell
```

### Permission Issues
Ensure Terminal/Script Editor has screen recording permissions:
- System Preferences � Security & Privacy � Privacy � Screen Recording

### Retina Display Handling
Screenshots on Retina displays are captured at native resolution:
```applescript
-- Scale awareness for Retina displays
set screenScale to do shell script "system_profiler SPDisplaysDataType | grep 'UI Looks like' | head -1 | grep -o '[0-9]*x[0-9]*' | cut -d'x' -f1"
-- Adjust coordinates if needed
```

## Integration Examples

### With CI/CD Systems
```bash
#!/bin/bash
# ci-screenshot.sh
osascript screenshot-script.applescript
# Upload to artifact storage
aws s3 cp ~/Desktop/app_screenshot_*.png s3://bucket/screenshots/
```

### With Testing Frameworks
```applescript
-- Return screenshot path for test verification
on takeTestScreenshot(testName)
    set screenshotPath to "/tmp/test_" & testName & ".png"
    -- Take screenshot
    return screenshotPath
end takeTestScreenshot
```

This guide provides patterns for reliable, automated screenshot capture that can be integrated into various workflows and tools.