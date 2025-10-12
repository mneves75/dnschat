# ![Expo Localization icon](/static/images/packages/expo-localization.png)Expo
Localization

[GitHub](https://github.com/expo/expo/tree/sdk-54/packages/expo-
localization)[Changelog](https://github.com/expo/expo/tree/sdk-54/packages/expo-
localization/CHANGELOG.md)[npm](https://www.npmjs.com/package/expo-
localization)

Ask AI

A library that provides an interface for native user localization information.

[GitHub](https://github.com/expo/expo/tree/sdk-54/packages/expo-
localization)[Changelog](https://github.com/expo/expo/tree/sdk-54/packages/expo-
localization/CHANGELOG.md)[npm](https://www.npmjs.com/package/expo-
localization)

Ask AI

Android

iOS

tvOS

Web

Bundled version:

~17.0.7

Copy

* * *

`expo-localization` allows you to Localize your app, customizing the
experience for specific regions, languages, or cultures. It also provides
access to the locale data on the native device. Using a localization library
such as [`lingui-js`](https://lingui.dev/introduction),
[`react-i18next`](https://react.i18next.com/), [`react-
intl`](https://formatjs.io/docs/getting-started/installation/) or
[`i18n-js`](https://github.com/fnando/i18n-js) with `expo-localization` will
enable you to create a very accessible experience for users.

## Installation

Terminal

Copy

`- ``npx expo install expo-localization`

If you are installing this in an [existing React Native app](/bare/overview),
make sure to [install `expo`](/bare/installing-expo-modules) in your project.

## Configuration in app config

You can configure `expo-localization` using its built-in [config
plugin](/config-plugins/introduction) if you use config plugins in your
project ([EAS Build](/build/introduction) or `npx expo run:[android|ios]`).
The plugin allows you to configure various properties that cannot be set at
runtime and require building a new app binary to take effect.

### Example app.json with config plugin

app.json

Copy

    
    
    {
      "expo": {
        "plugins": ["expo-localization"]
      }
    }
    

## Usage

Find more information about using `expo-localization` and adding support for
right-to-left languages in the [Localization](/guides/localization) guide.

## API

    
    
    import { getLocales, getCalendars } from 'expo-localization';
    

### Behavior

You can use synchronous `getLocales()` and `getCalendars()` methods to get the
locale settings of the user device. On iOS, the results will remain the same
while the app is running.

On Android, the user can change locale preferences in Settings without
restarting apps. To keep the localization current, you can rerun the
`getLocales()` and `getCalendars()` methods every time the app returns to the
foreground. Use `AppState` to detect this.

## Hooks

### `useCalendars()`

Android

iOS

tvOS

Web

A hook providing a list of user's preferred calendars, returned as an array of
objects of type `Calendar`. Guaranteed to contain at least 1 element. For now
always returns a single element, but it's likely to return a user preference
list on some platforms in the future. If the OS settings change, the hook will
rerender with a new list of calendars.

Returns:

`Calendar[]`

Example

    
    
    [{
      "calendar": "gregory",
      "timeZone": "Europe/Warsaw",
      "uses24hourClock": true,
      "firstWeekday": 1
    }]
    

### `useLocales()`

Android

iOS

tvOS

Web

A hook providing a list of user's locales, returned as an array of objects of
type `Locale`. Guaranteed to contain at least 1 element. These are returned in
the order the user defines in their device settings. On the web currency and
measurements systems are not provided, instead returned as null. If needed,
you can infer them from the current region using a lookup table. If the OS
settings change, the hook will rerender with a new list of locales.

Returns:

`Locale[]`

Example

    
    
    [{
      "languageTag": "pl-PL",
      "languageCode": "pl",
      "textDirection": "ltr",
      "digitGroupingSeparator": " ",
      "decimalSeparator": ",",
      "measurementSystem": "metric",
      "currencyCode": "PLN",
      "currencySymbol": "zł",
      "regionCode": "PL",
      "temperatureUnit": "celsius"
    }]
    

## Methods

### `Localization.getCalendars()`

Android

iOS

tvOS

Web

List of user's preferred calendars, returned as an array of objects of type
`Calendar`. Guaranteed to contain at least 1 element. For now always returns a
single element, but it's likely to return a user preference list on some
platforms in the future.

Returns:

`Calendar[]`

Example

    
    
    [{
      "calendar": "gregory",
      "timeZone": "Europe/Warsaw",
      "uses24hourClock": true,
      "firstWeekday": 1
    }]
    

### `Localization.getLocales()`

Android

iOS

tvOS

Web

List of user's locales, returned as an array of objects of type `Locale`.
Guaranteed to contain at least 1 element. These are returned in the order the
user defines in their device settings. On the web currency and measurements
systems are not provided, instead returned as null. If needed, you can infer
them from the current region using a lookup table.

Returns:

`Locale[]`

Example

    
    
    [{
      "languageTag": "pl-PL",
      "languageCode": "pl",
      "textDirection": "ltr",
      "digitGroupingSeparator": " ",
      "decimalSeparator": ",",
      "measurementSystem": "metric",
      "currencyCode": "PLN",
      "currencySymbol": "zł",
      "regionCode": "PL",
      "temperatureUnit": "celsius"
    }]
    

## Types

### `Calendar`

Android

iOS

tvOS

Web

Property| Type| Description  
---|---|---  
calendar| `CalendarIdentifier | null`| The calendar identifier, one of [Unicode calendar types](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Locale/calendar). On Android is limited to one of device's [available calendar types](https://developer.android.com/reference/java/util/Calendar#getAvailableCalendarTypes\(\)). On iOS uses [calendar identifiers](https://developer.apple.com/documentation/foundation/calendar/identifier), but maps them to the corresponding Unicode types, will also never contain `'dangi'` or `'islamic-rgsa'` due to it not being implemented on iOS.  
firstWeekday| `Weekday | null`| The first day of the week. For most calendars Sunday is numbered `1`, with Saturday being number `7`. Can be null on some browsers that don't support the [weekInfo](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Locale/weekInfo) property in [Intl](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl) API.Example`1`, `7`.  
timeZone| `string | null`| Time zone for the calendar. Can be `null` on Web.Example`'America/Los_Angeles'`, `'Europe/Warsaw'`, `'GMT+1'`.  
uses24hourClock| `boolean | null`| True when current device settings use 24-hour time format. Can be null on some browsers that don't support the [hourCycle](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Locale/hourCycle) property in [Intl](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl) API.  
  
### `Locale`

Android

iOS

tvOS

Web

Property| Type| Description  
---|---|---  
currencyCode| `string | null`| Currency code for the locale. On iOS, it's the currency code from the `Region` setting under Language & Region, not for the current locale. On Android, it's the currency specifc to the locale in the list, as there are no separate settings for selecting a region. Is `null` on Web, use a table lookup based on region instead.Example`'USD'`, `'EUR'`, `'PLN'`.  
currencySymbol| `string | null`| Currency symbol for the currency specified by `currencyCode`.Example`'$'`, `'€'`, `'zł'`.  
decimalSeparator| `string | null`| Decimal separator used for formatting numbers with fractional parts.Example`'.'`, `','`.  
digitGroupingSeparator| `string | null`| Digit grouping separator used for formatting large numbers.Example`'.'`, `','`.  
languageCode| `string | null`| An [IETF BCP 47 language tag](https://en.wikipedia.org/wiki/IETF_language_tag) without the region code.Example`'en'`, `'es'`, `'pl'`.  
languageCurrencyCode| `string | null`| Currency code for the locale. On iOS, it's the currency code for the current locale in the list, not the device region. On Android, it's equal to `currencyCode`. Is `null` on Web. Prefer using `currencyCode` for any internalization purposes.Example`'USD'`, `'EUR'`, `'PLN'`.  
languageCurrencySymbol| `string | null`| Currency symbol for the currency specified by `languageCurrencyCode`. Prefer using `currencySymbol` for any internalization purposes.Example`'$'`, `'€'`, `'zł'`.  
languageRegionCode| `string | null`| The region code for the preferred language. When the language is not region-specific, it returns the same value as `regionCode`. When the language is region-specific, it returns the region code for the language (`en-CA` -> `CA`). Prefer using `regionCode` for any internalization purposes.Example`'US'`.  
languageScriptCode| `string | null`| An [ISO 15924](https://en.wikipedia.org/wiki/ISO_15924) 4-letter script code. On Android and Web, it may be `null` if none is defined.Example`'Latn'`, `'Hans'`, `'Hebr'`.  
languageTag| `string`| An [IETF BCP 47 language
tag](https://en.wikipedia.org/wiki/IETF_language_tag) with a region
code.Example`'en-US'`, `'es-419'`, `'pl-PL'`.  
measurementSystem| `'metric' | 'us' | 'uk' | null`| The measurement system used in the locale. Is `null` on Web, as user chosen measurement system is not exposed on the web and using locale to determine measurement systems is unreliable. Ask for user preferences if possible.  
regionCode| `string | null`| The region code for your device that comes from the Region setting under Language & Region on iOS, Region settings on Android and is parsed from locale on Web (can be `null` on Web).Example`'US'`.  
temperatureUnit| `'celsius' | 'fahrenheit' | null`| The temperature unit used in the locale. Returns `null` if the region code is unknown.  
textDirection| `'ltr' | 'rtl' | null`| Text direction for the locale. One of: `'ltr'`, `'rtl'`, but can also be `null` on some browsers without support for the [textInfo](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Locale/textInfo) property in [Intl](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl) API.  
  
## Enums

### `CalendarIdentifier`

Android

iOS

tvOS

Web

The calendar identifier, one of [Unicode calendar
types](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Locale/calendar).
Gregorian calendar is aliased and can be referred to as both
`CalendarIdentifier.GREGORIAN` and `CalendarIdentifier.GREGORY`.

#### `BUDDHIST`

`CalendarIdentifier.BUDDHIST ＝ "buddhist"`

Thai Buddhist calendar

#### `CHINESE`

`CalendarIdentifier.CHINESE ＝ "chinese"`

Traditional Chinese calendar

#### `COPTIC`

`CalendarIdentifier.COPTIC ＝ "coptic"`

Coptic calendar

#### `DANGI`

`CalendarIdentifier.DANGI ＝ "dangi"`

Traditional Korean calendar

#### `ETHIOAA`

`CalendarIdentifier.ETHIOAA ＝ "ethioaa"`

Ethiopic calendar, Amete Alem (epoch approx. 5493 B.C.E)

#### `ETHIOPIC`

`CalendarIdentifier.ETHIOPIC ＝ "ethiopic"`

Ethiopic calendar, Amete Mihret (epoch approx, 8 C.E.)

#### `GREGORIAN`

`CalendarIdentifier.GREGORIAN ＝ "gregory"`

Gregorian calendar (alias)

#### `GREGORY`

`CalendarIdentifier.GREGORY ＝ "gregory"`

Gregorian calendar

#### `HEBREW`

`CalendarIdentifier.HEBREW ＝ "hebrew"`

Traditional Hebrew calendar

#### `INDIAN`

`CalendarIdentifier.INDIAN ＝ "indian"`

Indian calendar

#### `ISLAMIC`

`CalendarIdentifier.ISLAMIC ＝ "islamic"`

Islamic calendar

#### `ISLAMIC_CIVIL`

`CalendarIdentifier.ISLAMIC_CIVIL ＝ "islamic-civil"`

Islamic calendar, tabular (intercalary years [2,5,7,10,13,16,18,21,24,26,29] -
civil epoch)

#### `ISLAMIC_RGSA`

`CalendarIdentifier.ISLAMIC_RGSA ＝ "islamic-rgsa"`

Islamic calendar, Saudi Arabia sighting

#### `ISLAMIC_TBLA`

`CalendarIdentifier.ISLAMIC_TBLA ＝ "islamic-tbla"`

Islamic calendar, tabular (intercalary years [2,5,7,10,13,16,18,21,24,26,29] -
astronomical epoch)

#### `ISLAMIC_UMALQURA`

`CalendarIdentifier.ISLAMIC_UMALQURA ＝ "islamic-umalqura"`

Islamic calendar, Umm al-Qura

#### `ISO8601`

`CalendarIdentifier.ISO8601 ＝ "iso8601"`

ISO calendar (Gregorian calendar using the ISO 8601 calendar week rules)

#### `JAPANESE`

`CalendarIdentifier.JAPANESE ＝ "japanese"`

Japanese imperial calendar

#### `PERSIAN`

`CalendarIdentifier.PERSIAN ＝ "persian"`

Persian calendar

#### `ROC`

`CalendarIdentifier.ROC ＝ "roc"`

Civil (algorithmic) Arabic calendar

### `Weekday`

Android

iOS

tvOS

Web

An enum mapping days of the week in Gregorian calendar to their index as
returned by the `firstWeekday` property.

#### `SUNDAY`

`Weekday.SUNDAY ＝ 1`

#### `MONDAY`

`Weekday.MONDAY ＝ 2`

#### `TUESDAY`

`Weekday.TUESDAY ＝ 3`

#### `WEDNESDAY`

`Weekday.WEDNESDAY ＝ 4`

#### `THURSDAY`

`Weekday.THURSDAY ＝ 5`

#### `FRIDAY`

`Weekday.FRIDAY ＝ 6`

#### `SATURDAY`

`Weekday.SATURDAY ＝ 7`

