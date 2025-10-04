Framework

# AlarmKit

Schedule prominent alarms and countdowns to help people manage their time.

iOS 26.0+iPadOS 26.0+

## [Overview](/documentation/AlarmKit#Overview)

Use `AlarmKit` to create custom alarms and timers in your app. `AlarmKit`
provides a framework for managing alarms with customizable schedules and UI.
It supports one-time and repeating alarms, with the option for countdown
durations and snooze functionality. `AlarmKit` handles alarm authorization and
provides UI for both templated and widget presentations. It supports
traditional alarms, timers, or both, and provides methods to schedule, pause,
resume, and cancel alarms.

## [Topics](/documentation/AlarmKit#topics)

### [Alarm management](/documentation/AlarmKit#Alarm-management)

[Scheduling an alarm with AlarmKit](/documentation/alarmkit/scheduling-an-
alarm-with-alarmkit)

Create prominent alerts at specified dates for your iOS app.

[`class AlarmManager`](/documentation/alarmkit/alarmmanager)

An object that exposes functions to work with alarms: scheduling, snoozing,
cancelling.

[`struct Alarm`](/documentation/alarmkit/alarm)

An object that describes an alarm that can alert once or on a repeating
schedule.

### [Buttons](/documentation/AlarmKit#Buttons)

[`struct AlarmButton`](/documentation/alarmkit/alarmbutton)

A structure that defines the appearance of buttons.

### [Views](/documentation/AlarmKit#Views)

[`struct AlarmPresentation`](/documentation/alarmkit/alarmpresentation)

An object that describes the content required for the alarm UI.

[`struct
AlarmPresentationState`](/documentation/alarmkit/alarmpresentationstate)

An object that describes the mutable content of the alarm.

[`struct AlarmAttributes`](/documentation/alarmkit/alarmattributes)

An object that contains all information necessary for the alarm UI.

[`protocol AlarmMetadata`](/documentation/alarmkit/alarmmetadata)

A metadata object that contains information about an alarm.

