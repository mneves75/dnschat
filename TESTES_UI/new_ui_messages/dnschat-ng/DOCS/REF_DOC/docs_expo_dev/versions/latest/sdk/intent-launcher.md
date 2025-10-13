# Expo IntentLauncher

[GitHub](https://github.com/expo/expo/tree/sdk-54/packages/expo-intent-
launcher)[Changelog](https://github.com/expo/expo/tree/sdk-54/packages/expo-
intent-launcher/CHANGELOG.md)[npm](https://www.npmjs.com/package/expo-intent-
launcher)

Ask AI

A library that provides an API to launch Android intents.

[GitHub](https://github.com/expo/expo/tree/sdk-54/packages/expo-intent-
launcher)[Changelog](https://github.com/expo/expo/tree/sdk-54/packages/expo-
intent-launcher/CHANGELOG.md)[npm](https://www.npmjs.com/package/expo-intent-
launcher)

Ask AI

Android

Bundled version:

~13.0.7

Copy

* * *

`expo-intent-launcher` provides a way to launch Android intents. For example,
you can use this API to open a specific settings screen.

## Installation

Terminal

Copy

`- ``npx expo install expo-intent-launcher`

If you are installing this in an [existing React Native app](/bare/overview),
make sure to [install `expo`](/bare/installing-expo-modules) in your project.

## Usage

    
    
    import { startActivityAsync, ActivityAction } from 'expo-intent-launcher';
    
    // Open location settings
    startActivityAsync(ActivityAction.LOCATION_SOURCE_SETTINGS);
    

## API

    
    
    import * as IntentLauncher from 'expo-intent-launcher';
    

## Methods

### `IntentLauncher.getApplicationIconAsync(packageName)`

Android

Parameter| Type| Description  
---|---|---  
packageName| `string`| The package name of the target application. For
example, `com.google.android.gm` for Gmail.  
  
  

Returns the icon of the specified application as a base64-encoded PNG image
string. The returned string is prefixed with `data:image/png;base64,` and can
be used directly in an `expo-image`'s
[`Image.source`](/versions/latest/sdk/image#source) prop.

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<string>`

A promise that resolves to the base64-encoded PNG icon of the specified
application, or an empty string if the icon could not be retrieved.

### `IntentLauncher.openApplication(packageName)`

Android

Parameter| Type| Description  
---|---|---  
packageName| `string`| For example: `com.google.android.gm` for Gmail.  
  
  

Opens an application by its package name.

Returns:

`void`

### `IntentLauncher.startActivityAsync(activityAction, params)`

Android

Parameter| Type| Description  
---|---|---  
activityAction| `string`| The action to be performed, for example,
`IntentLauncher.ActivityAction.WIRELESS_SETTINGS`. There are a few pre-defined
constants you can use for this parameter. You can find them at [`expo-intent-
launcher/src/IntentLauncher.ts`](https://github.com/expo/expo/blob/main/packages/expo-
intent-launcher/src/IntentLauncher.ts).  
params(optional)| `IntentLauncherParams`| An object of intent
parameters.Default:`{}`  
  
  

Starts the specified activity. The method will return a promise which resolves
when the user returns to the app.

Returns:

`[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<IntentLauncherResult>`

A promise which fulfils with `IntentLauncherResult` object.

## Interfaces

### `IntentLauncherParams`

Android

Property| Type| Description  
---|---|---  
category(optional)| `string`| Category provides more details about the action
the intent performs. See
[`Intent.addCategory`](https://developer.android.com/reference/android/content/Intent#addCategory\(java.lang.String\)).  
className(optional)| `string`| Class name of the ComponentName.  
data(optional)| `string`| A URI specifying the data that the intent should
operate upon. (_Note:_ Android requires the URI scheme to be lowercase, unlike
the formal RFC.)  
extra(optional)| `Record<string, any>`| A map specifying additional key-value
pairs which are passed with the intent as `extras`. The keys must include a
package prefix, for example the app `com.android.contacts` would use names
like `com.android.contacts.ShowAll`.  
flags(optional)| `number`| Bitmask of flags to be used. See
[`Intent.setFlags`](https://developer.android.com/reference/android/content/Intent#setFlags\(int\))
for more details.  
packageName(optional)| `string`| Package name used as an identifier of
ComponentName. Set this only if you want to explicitly set the component to
handle the intent.  
type(optional)| `string`| A string specifying the MIME type of the data
represented by the data parameter. Ignore this argument to allow Android to
infer the correct MIME type.  
  
### `IntentLauncherResult`

Android

Property| Type| Description  
---|---|---  
data(optional)| `string`| Optional data URI that can be returned by the
activity.  
extra(optional)| `object`| Optional extras object that can be returned by the
activity.  
resultCode| `ResultCode`| Result code returned by the activity.  
  
## Enums

### `ActivityAction`

Android

Constants are from the source code of [Settings
provider](https://developer.android.com/reference/android/provider/Settings).

#### `ACCESSIBILITY_COLOR_CONTRAST_SETTINGS`

`ActivityAction.ACCESSIBILITY_COLOR_CONTRAST_SETTINGS ＝
"android.settings.ACCESSIBILITY_COLOR_CONTRAST_SETTINGS"`

#### `ACCESSIBILITY_COLOR_MOTION_SETTINGS`

`ActivityAction.ACCESSIBILITY_COLOR_MOTION_SETTINGS ＝
"android.settings.ACCESSIBILITY_COLOR_MOTION_SETTINGS"`

#### `ACCESSIBILITY_DETAILS_SETTINGS`

`ActivityAction.ACCESSIBILITY_DETAILS_SETTINGS ＝
"android.settings.ACCESSIBILITY_DETAILS_SETTINGS"`

#### `ACCESSIBILITY_SETTINGS`

`ActivityAction.ACCESSIBILITY_SETTINGS ＝
"android.settings.ACCESSIBILITY_SETTINGS"`

#### `ACCESSIBILITY_SETTINGS_FOR_SUW`

`ActivityAction.ACCESSIBILITY_SETTINGS_FOR_SUW ＝
"android.settings.ACCESSIBILITY_SETTINGS_FOR_SUW"`

#### `ACCESSIBILITY_SHORTCUT_SETTINGS`

`ActivityAction.ACCESSIBILITY_SHORTCUT_SETTINGS ＝
"android.settings.ACCESSIBILITY_SHORTCUT_SETTINGS"`

#### `ACCOUNT_SYNC_SETTINGS`

`ActivityAction.ACCOUNT_SYNC_SETTINGS ＝
"android.settings.ACCOUNT_SYNC_SETTINGS"`

#### `APP_NOTIFICATION_REDACTION`

`ActivityAction.APP_NOTIFICATION_REDACTION ＝
"android.settings.ACTION_APP_NOTIFICATION_REDACTION"`

#### `CONDITION_PROVIDER_SETTINGS`

`ActivityAction.CONDITION_PROVIDER_SETTINGS ＝
"android.settings.ACTION_CONDITION_PROVIDER_SETTINGS"`

#### `MEDIA_CONTROLS_SETTINGS`

`ActivityAction.MEDIA_CONTROLS_SETTINGS ＝
"android.settings.ACTION_MEDIA_CONTROLS_SETTINGS"`

#### `NOTIFICATION_LISTENER_SETTINGS`

`ActivityAction.NOTIFICATION_LISTENER_SETTINGS ＝
"android.settings.ACTION_NOTIFICATION_LISTENER_SETTINGS"`

#### `OTHER_SOUND_SETTINGS`

`ActivityAction.OTHER_SOUND_SETTINGS ＝
"android.settings.ACTION_OTHER_SOUND_SETTINGS"`

#### `POWER_MENU_SETTINGS`

`ActivityAction.POWER_MENU_SETTINGS ＝
"android.settings.ACTION_POWER_MENU_SETTINGS"`

#### `PRINT_SETTINGS`

`ActivityAction.PRINT_SETTINGS ＝ "android.settings.ACTION_PRINT_SETTINGS"`

#### `MANAGE_OVERLAY_PERMISSION`

`ActivityAction.MANAGE_OVERLAY_PERMISSION ＝
"android.settings.action.MANAGE_OVERLAY_PERMISSION"`

#### `MANAGE_WRITE_SETTINGS`

`ActivityAction.MANAGE_WRITE_SETTINGS ＝
"android.settings.action.MANAGE_WRITE_SETTINGS"`

#### `ONE_HANDED_SETTINGS`

`ActivityAction.ONE_HANDED_SETTINGS ＝
"android.settings.action.ONE_HANDED_SETTINGS"`

#### `ADAPTIVE_BRIGHTNESS_SETTINGS`

`ActivityAction.ADAPTIVE_BRIGHTNESS_SETTINGS ＝
"android.settings.ADAPTIVE_BRIGHTNESS_SETTINGS"`

#### `ADD_ACCOUNT_SETTINGS`

`ActivityAction.ADD_ACCOUNT_SETTINGS ＝
"android.settings.ADD_ACCOUNT_SETTINGS"`

#### `ADVANCED_MEMORY_PROTECTION_SETTINGS`

`ActivityAction.ADVANCED_MEMORY_PROTECTION_SETTINGS ＝
"android.settings.ADVANCED_MEMORY_PROTECTION_SETTINGS"`

#### `AIRPLANE_MODE_SETTINGS`

`ActivityAction.AIRPLANE_MODE_SETTINGS ＝
"android.settings.AIRPLANE_MODE_SETTINGS"`

#### `ALL_APPS_NOTIFICATION_SETTINGS`

`ActivityAction.ALL_APPS_NOTIFICATION_SETTINGS ＝
"android.settings.ALL_APPS_NOTIFICATION_SETTINGS"`

#### `ALL_APPS_NOTIFICATION_SETTINGS_FOR_REVIEW`

`ActivityAction.ALL_APPS_NOTIFICATION_SETTINGS_FOR_REVIEW ＝
"android.settings.ALL_APPS_NOTIFICATION_SETTINGS_FOR_REVIEW"`

#### `APN_SETTINGS`

`ActivityAction.APN_SETTINGS ＝ "android.settings.APN_SETTINGS"`

#### `APP_LOCALE_SETTINGS`

`ActivityAction.APP_LOCALE_SETTINGS ＝ "android.settings.APP_LOCALE_SETTINGS"`

#### `APP_MEMORY_USAGE`

`ActivityAction.APP_MEMORY_USAGE ＝ "android.settings.APP_MEMORY_USAGE"`

#### `APP_NOTIFICATION_BUBBLE_SETTINGS`

`ActivityAction.APP_NOTIFICATION_BUBBLE_SETTINGS ＝
"android.settings.APP_NOTIFICATION_BUBBLE_SETTINGS"`

#### `APP_NOTIFICATION_SETTINGS`

`ActivityAction.APP_NOTIFICATION_SETTINGS ＝
"android.settings.APP_NOTIFICATION_SETTINGS"`

#### `APP_OPEN_BY_DEFAULT_SETTINGS`

`ActivityAction.APP_OPEN_BY_DEFAULT_SETTINGS ＝
"android.settings.APP_OPEN_BY_DEFAULT_SETTINGS"`

#### `APPLICATION_DETAILS_SETTINGS`

`ActivityAction.APPLICATION_DETAILS_SETTINGS ＝
"android.settings.APPLICATION_DETAILS_SETTINGS"`

#### `APPLICATION_DEVELOPMENT_SETTINGS`

`ActivityAction.APPLICATION_DEVELOPMENT_SETTINGS ＝
"android.settings.APPLICATION_DEVELOPMENT_SETTINGS"`

#### `APPLICATION_SETTINGS`

`ActivityAction.APPLICATION_SETTINGS ＝
"android.settings.APPLICATION_SETTINGS"`

#### `AUDIO_STREAM_DIALOG`

`ActivityAction.AUDIO_STREAM_DIALOG ＝ "android.settings.AUDIO_STREAM_DIALOG"`

#### `AUTO_ROTATE_SETTINGS`

`ActivityAction.AUTO_ROTATE_SETTINGS ＝
"android.settings.AUTO_ROTATE_SETTINGS"`

#### `AUTOMATIC_ZEN_RULE_SETTINGS`

`ActivityAction.AUTOMATIC_ZEN_RULE_SETTINGS ＝
"android.settings.AUTOMATIC_ZEN_RULE_SETTINGS"`

#### `BATTERY_SAVER_SETTINGS`

`ActivityAction.BATTERY_SAVER_SETTINGS ＝
"android.settings.BATTERY_SAVER_SETTINGS"`

#### `BIOMETRIC_ENROLL`

`ActivityAction.BIOMETRIC_ENROLL ＝ "android.settings.BIOMETRIC_ENROLL"`

#### `BLUETOOTH_DASHBOARD_SETTINGS`

`ActivityAction.BLUETOOTH_DASHBOARD_SETTINGS ＝
"android.settings.BLUETOOTH_DASHBOARD_SETTINGS"`

#### `BLUETOOTH_LE_AUDIO_QR_CODE_SCANNER`

`ActivityAction.BLUETOOTH_LE_AUDIO_QR_CODE_SCANNER ＝
"android.settings.BLUETOOTH_LE_AUDIO_QR_CODE_SCANNER"`

#### `BLUETOOTH_PAIRING_SETTINGS`

`ActivityAction.BLUETOOTH_PAIRING_SETTINGS ＝
"android.settings.BLUETOOTH_PAIRING_SETTINGS"`

#### `BLUETOOTH_SETTINGS`

`ActivityAction.BLUETOOTH_SETTINGS ＝ "android.settings.BLUETOOTH_SETTINGS"`

#### `BLUTOOTH_FIND_BROADCASTS_ACTIVITY`

`ActivityAction.BLUTOOTH_FIND_BROADCASTS_ACTIVITY ＝
"android.settings.BLUTOOTH_FIND_BROADCASTS_ACTIVITY"`

#### `BUGREPORT_HANDLER_SETTINGS`

`ActivityAction.BUGREPORT_HANDLER_SETTINGS ＝
"android.settings.BUGREPORT_HANDLER_SETTINGS"`

#### `CAPTIONING_SETTINGS`

`ActivityAction.CAPTIONING_SETTINGS ＝ "android.settings.CAPTIONING_SETTINGS"`

#### `CAST_SETTINGS`

`ActivityAction.CAST_SETTINGS ＝ "android.settings.CAST_SETTINGS"`

#### `CELLULAR_NETWORK_SECURITY`

`ActivityAction.CELLULAR_NETWORK_SECURITY ＝
"android.settings.CELLULAR_NETWORK_SECURITY"`

#### `CHANNEL_NOTIFICATION_SETTINGS`

`ActivityAction.CHANNEL_NOTIFICATION_SETTINGS ＝
"android.settings.CHANNEL_NOTIFICATION_SETTINGS"`

#### `COLOR_INVERSION_SETTINGS`

`ActivityAction.COLOR_INVERSION_SETTINGS ＝
"android.settings.COLOR_INVERSION_SETTINGS"`

#### `COMBINED_BIOMETRICS_SETTINGS`

`ActivityAction.COMBINED_BIOMETRICS_SETTINGS ＝
"android.settings.COMBINED_BIOMETRICS_SETTINGS"`

#### `COMMUNAL_SETTINGS`

`ActivityAction.COMMUNAL_SETTINGS ＝ "android.settings.COMMUNAL_SETTINGS"`

#### `CONVERSATION_SETTINGS`

`ActivityAction.CONVERSATION_SETTINGS ＝
"android.settings.CONVERSATION_SETTINGS"`

#### `CREDENTIAL_PROVIDER`

`ActivityAction.CREDENTIAL_PROVIDER ＝ "android.settings.CREDENTIAL_PROVIDER"`

#### `DARK_THEME_SETTINGS`

`ActivityAction.DARK_THEME_SETTINGS ＝ "android.settings.DARK_THEME_SETTINGS"`

#### `DATA_ROAMING_SETTINGS`

`ActivityAction.DATA_ROAMING_SETTINGS ＝
"android.settings.DATA_ROAMING_SETTINGS"`

#### `DATA_SAVER_SETTINGS`

`ActivityAction.DATA_SAVER_SETTINGS ＝ "android.settings.DATA_SAVER_SETTINGS"`

#### `DATA_USAGE_SETTINGS`

`ActivityAction.DATA_USAGE_SETTINGS ＝ "android.settings.DATA_USAGE_SETTINGS"`

#### `DATE_SETTINGS`

`ActivityAction.DATE_SETTINGS ＝ "android.settings.DATE_SETTINGS"`

#### `DEVELOPMENT_START_DSU_LOADER`

`ActivityAction.DEVELOPMENT_START_DSU_LOADER ＝
"android.settings.development.START_DSU_LOADER"`

#### `DEVICE_INFO_SETTINGS`

`ActivityAction.DEVICE_INFO_SETTINGS ＝
"android.settings.DEVICE_INFO_SETTINGS"`

#### `DEVICE_NAME`

`ActivityAction.DEVICE_NAME ＝ "android.settings.DEVICE_NAME"`

#### `DISPLAY_SETTINGS`

`ActivityAction.DISPLAY_SETTINGS ＝ "android.settings.DISPLAY_SETTINGS"`

#### `DREAM_SETTINGS`

`ActivityAction.DREAM_SETTINGS ＝ "android.settings.DREAM_SETTINGS"`

#### `ENTERPRISE_PRIVACY_SETTINGS`

`ActivityAction.ENTERPRISE_PRIVACY_SETTINGS ＝
"android.settings.ENTERPRISE_PRIVACY_SETTINGS"`

#### `FACE_ENROLL`

`ActivityAction.FACE_ENROLL ＝ "android.settings.FACE_ENROLL"`

#### `FACE_SETTINGS`

`ActivityAction.FACE_SETTINGS ＝ "android.settings.FACE_SETTINGS"`

#### `FINGERPRINT_ENROLL`

`ActivityAction.FINGERPRINT_ENROLL ＝ "android.settings.FINGERPRINT_ENROLL"`

#### `FINGERPRINT_SETTINGS`

`ActivityAction.FINGERPRINT_SETTINGS ＝
"android.settings.FINGERPRINT_SETTINGS"`

#### `FINGERPRINT_SETTINGS_V2`

`ActivityAction.FINGERPRINT_SETTINGS_V2 ＝
"android.settings.FINGERPRINT_SETTINGS_V2"`

#### `FINGERPRINT_SETUP`

`ActivityAction.FINGERPRINT_SETUP ＝ "android.settings.FINGERPRINT_SETUP"`

#### `FIRST_DAY_OF_WEEK_SETTINGS`

`ActivityAction.FIRST_DAY_OF_WEEK_SETTINGS ＝
"android.settings.FIRST_DAY_OF_WEEK_SETTINGS"`

#### `HARD_KEYBOARD_LAYOUT_PICKER_SETTINGS`

`ActivityAction.HARD_KEYBOARD_LAYOUT_PICKER_SETTINGS ＝
"android.settings.HARD_KEYBOARD_LAYOUT_PICKER_SETTINGS"`

#### `HARD_KEYBOARD_SETTINGS`

`ActivityAction.HARD_KEYBOARD_SETTINGS ＝
"android.settings.HARD_KEYBOARD_SETTINGS"`

#### `HEARING_DEVICES_PAIRING_SETTINGS`

`ActivityAction.HEARING_DEVICES_PAIRING_SETTINGS ＝
"android.settings.HEARING_DEVICES_PAIRING_SETTINGS"`

#### `HEARING_DEVICES_SETTINGS`

`ActivityAction.HEARING_DEVICES_SETTINGS ＝
"android.settings.HEARING_DEVICES_SETTINGS"`

#### `HOME_SETTINGS`

`ActivityAction.HOME_SETTINGS ＝ "android.settings.HOME_SETTINGS"`

#### `IGNORE_BACKGROUND_DATA_RESTRICTIONS_SETTINGS`

`ActivityAction.IGNORE_BACKGROUND_DATA_RESTRICTIONS_SETTINGS ＝
"android.settings.IGNORE_BACKGROUND_DATA_RESTRICTIONS_SETTINGS"`

#### `IGNORE_BATTERY_OPTIMIZATION_SETTINGS`

`ActivityAction.IGNORE_BATTERY_OPTIMIZATION_SETTINGS ＝
"android.settings.IGNORE_BATTERY_OPTIMIZATION_SETTINGS"`

#### `INPUT_METHOD_SETTINGS`

`ActivityAction.INPUT_METHOD_SETTINGS ＝
"android.settings.INPUT_METHOD_SETTINGS"`

#### `INPUT_METHOD_SUBTYPE_SETTINGS`

`ActivityAction.INPUT_METHOD_SUBTYPE_SETTINGS ＝
"android.settings.INPUT_METHOD_SUBTYPE_SETTINGS"`

#### `INTERNAL_STORAGE_SETTINGS`

`ActivityAction.INTERNAL_STORAGE_SETTINGS ＝
"android.settings.INTERNAL_STORAGE_SETTINGS"`

#### `LANGUAGE_SETTINGS`

`ActivityAction.LANGUAGE_SETTINGS ＝ "android.settings.LANGUAGE_SETTINGS"`

#### `LICENSE`

`ActivityAction.LICENSE ＝ "android.settings.LICENSE"`

#### `LOCALE_SETTINGS`

`ActivityAction.LOCALE_SETTINGS ＝ "android.settings.LOCALE_SETTINGS"`

#### `LOCATION_SCANNING_SETTINGS`

`ActivityAction.LOCATION_SCANNING_SETTINGS ＝
"android.settings.LOCATION_SCANNING_SETTINGS"`

#### `LOCATION_SOURCE_SETTINGS`

`ActivityAction.LOCATION_SOURCE_SETTINGS ＝
"android.settings.LOCATION_SOURCE_SETTINGS"`

#### `LOCK_SCREEN_SETTINGS`

`ActivityAction.LOCK_SCREEN_SETTINGS ＝
"android.settings.LOCK_SCREEN_SETTINGS"`

#### `MANAGE_ADAPTIVE_NOTIFICATIONS`

`ActivityAction.MANAGE_ADAPTIVE_NOTIFICATIONS ＝
"android.settings.MANAGE_ADAPTIVE_NOTIFICATIONS"`

#### `MANAGE_ALL_APPLICATIONS_SETTINGS`

`ActivityAction.MANAGE_ALL_APPLICATIONS_SETTINGS ＝
"android.settings.MANAGE_ALL_APPLICATIONS_SETTINGS"`

#### `MANAGE_ALL_FILES_ACCESS_PERMISSION`

`ActivityAction.MANAGE_ALL_FILES_ACCESS_PERMISSION ＝
"android.settings.MANAGE_ALL_FILES_ACCESS_PERMISSION"`

#### `MANAGE_ALL_SIM_PROFILES_SETTINGS`

`ActivityAction.MANAGE_ALL_SIM_PROFILES_SETTINGS ＝
"android.settings.MANAGE_ALL_SIM_PROFILES_SETTINGS"`

#### `MANAGE_APP_ALL_FILES_ACCESS_PERMISSION`

`ActivityAction.MANAGE_APP_ALL_FILES_ACCESS_PERMISSION ＝
"android.settings.MANAGE_APP_ALL_FILES_ACCESS_PERMISSION"`

#### `MANAGE_APP_LONG_RUNNING_JOBS`

`ActivityAction.MANAGE_APP_LONG_RUNNING_JOBS ＝
"android.settings.MANAGE_APP_LONG_RUNNING_JOBS"`

#### `MANAGE_APP_OVERLAY_PERMISSION`

`ActivityAction.MANAGE_APP_OVERLAY_PERMISSION ＝
"android.settings.MANAGE_APP_OVERLAY_PERMISSION"`

#### `MANAGE_APP_USE_FULL_SCREEN_INTENT`

`ActivityAction.MANAGE_APP_USE_FULL_SCREEN_INTENT ＝
"android.settings.MANAGE_APP_USE_FULL_SCREEN_INTENT"`

#### `MANAGE_APPLICATIONS_SETTINGS`

`ActivityAction.MANAGE_APPLICATIONS_SETTINGS ＝
"android.settings.MANAGE_APPLICATIONS_SETTINGS"`

#### `MANAGE_CLONED_APPS_SETTINGS`

`ActivityAction.MANAGE_CLONED_APPS_SETTINGS ＝
"android.settings.MANAGE_CLONED_APPS_SETTINGS"`

#### `MANAGE_CROSS_PROFILE_ACCESS`

`ActivityAction.MANAGE_CROSS_PROFILE_ACCESS ＝
"android.settings.MANAGE_CROSS_PROFILE_ACCESS"`

#### `MANAGE_DEFAULT_APPS_SETTINGS`

`ActivityAction.MANAGE_DEFAULT_APPS_SETTINGS ＝
"android.settings.MANAGE_DEFAULT_APPS_SETTINGS"`

#### `MANAGE_DOMAIN_URLS`

`ActivityAction.MANAGE_DOMAIN_URLS ＝ "android.settings.MANAGE_DOMAIN_URLS"`

#### `MANAGE_UNKNOWN_APP_SOURCES`

`ActivityAction.MANAGE_UNKNOWN_APP_SOURCES ＝
"android.settings.MANAGE_UNKNOWN_APP_SOURCES"`

#### `MANAGE_USER_ASPECT_RATIO_SETTINGS`

`ActivityAction.MANAGE_USER_ASPECT_RATIO_SETTINGS ＝
"android.settings.MANAGE_USER_ASPECT_RATIO_SETTINGS"`

#### `MANAGED_PROFILE_SETTINGS`

`ActivityAction.MANAGED_PROFILE_SETTINGS ＝
"android.settings.MANAGED_PROFILE_SETTINGS"`

#### `MEDIA_BROADCAST_DIALOG`

`ActivityAction.MEDIA_BROADCAST_DIALOG ＝
"android.settings.MEDIA_BROADCAST_DIALOG"`

#### `MEMORY_CARD_SETTINGS`

`ActivityAction.MEMORY_CARD_SETTINGS ＝
"android.settings.MEMORY_CARD_SETTINGS"`

#### `MMS_MESSAGE_SETTING`

`ActivityAction.MMS_MESSAGE_SETTING ＝ "android.settings.MMS_MESSAGE_SETTING"`

#### `MOBILE_DATA_USAGE`

`ActivityAction.MOBILE_DATA_USAGE ＝ "android.settings.MOBILE_DATA_USAGE"`

#### `MOBILE_NETWORK_LIST`

`ActivityAction.MOBILE_NETWORK_LIST ＝ "android.settings.MOBILE_NETWORK_LIST"`

#### `MODULE_LICENSES`

`ActivityAction.MODULE_LICENSES ＝ "android.settings.MODULE_LICENSES"`

#### `NETWORK_OPERATOR_SETTINGS`

`ActivityAction.NETWORK_OPERATOR_SETTINGS ＝
"android.settings.NETWORK_OPERATOR_SETTINGS"`

#### `NETWORK_PROVIDER_SETTINGS`

`ActivityAction.NETWORK_PROVIDER_SETTINGS ＝
"android.settings.NETWORK_PROVIDER_SETTINGS"`

#### `NFC_SETTINGS`

`ActivityAction.NFC_SETTINGS ＝ "android.settings.NFC_SETTINGS"`

#### `NIGHT_DISPLAY_SETTINGS`

`ActivityAction.NIGHT_DISPLAY_SETTINGS ＝
"android.settings.NIGHT_DISPLAY_SETTINGS"`

#### `NOTIFICATION_ASSISTANT_SETTINGS`

`ActivityAction.NOTIFICATION_ASSISTANT_SETTINGS ＝
"android.settings.NOTIFICATION_ASSISTANT_SETTINGS"`

#### `NOTIFICATION_HISTORY`

`ActivityAction.NOTIFICATION_HISTORY ＝
"android.settings.NOTIFICATION_HISTORY"`

#### `NOTIFICATION_LISTENER_DETAIL_SETTINGS`

`ActivityAction.NOTIFICATION_LISTENER_DETAIL_SETTINGS ＝
"android.settings.NOTIFICATION_LISTENER_DETAIL_SETTINGS"`

#### `NOTIFICATION_POLICY_ACCESS_DETAIL_SETTINGS`

`ActivityAction.NOTIFICATION_POLICY_ACCESS_DETAIL_SETTINGS ＝
"android.settings.NOTIFICATION_POLICY_ACCESS_DETAIL_SETTINGS"`

#### `NOTIFICATION_POLICY_ACCESS_SETTINGS`

`ActivityAction.NOTIFICATION_POLICY_ACCESS_SETTINGS ＝
"android.settings.NOTIFICATION_POLICY_ACCESS_SETTINGS"`

#### `NOTIFICATION_SETTINGS`

`ActivityAction.NOTIFICATION_SETTINGS ＝
"android.settings.NOTIFICATION_SETTINGS"`

#### `PANEL_INTERNET_CONNECTIVITY`

`ActivityAction.PANEL_INTERNET_CONNECTIVITY ＝
"android.settings.panel.action.INTERNET_CONNECTIVITY"`

#### `PANEL_NFC`

`ActivityAction.PANEL_NFC ＝ "android.settings.panel.action.NFC"`

#### `PANEL_VOLUME`

`ActivityAction.PANEL_VOLUME ＝ "android.settings.panel.action.VOLUME"`

#### `PANEL_WIFI`

`ActivityAction.PANEL_WIFI ＝ "android.settings.panel.action.WIFI"`

#### `PICTURE_IN_PICTURE_SETTINGS`

`ActivityAction.PICTURE_IN_PICTURE_SETTINGS ＝
"android.settings.PICTURE_IN_PICTURE_SETTINGS"`

#### `PREMIUM_SMS_SETTINGS`

`ActivityAction.PREMIUM_SMS_SETTINGS ＝
"android.settings.PREMIUM_SMS_SETTINGS"`

#### `PRIVACY_ADVANCED_SETTINGS`

`ActivityAction.PRIVACY_ADVANCED_SETTINGS ＝
"android.settings.PRIVACY_ADVANCED_SETTINGS"`

#### `PRIVACY_CONTROLS`

`ActivityAction.PRIVACY_CONTROLS ＝ "android.settings.PRIVACY_CONTROLS"`

#### `PRIVACY_SETTINGS`

`ActivityAction.PRIVACY_SETTINGS ＝ "android.settings.PRIVACY_SETTINGS"`

#### `PROCESS_WIFI_EASY_CONNECT_URI`

`ActivityAction.PROCESS_WIFI_EASY_CONNECT_URI ＝
"android.settings.PROCESS_WIFI_EASY_CONNECT_URI"`

#### `REDUCE_BRIGHT_COLORS_SETTINGS`

`ActivityAction.REDUCE_BRIGHT_COLORS_SETTINGS ＝
"android.settings.REDUCE_BRIGHT_COLORS_SETTINGS"`

#### `REGIONAL_PREFERENCES_SETTINGS`

`ActivityAction.REGIONAL_PREFERENCES_SETTINGS ＝
"android.settings.REGIONAL_PREFERENCES_SETTINGS"`

#### `REMOTE_AUTHENTICATOR_ENROLL`

`ActivityAction.REMOTE_AUTHENTICATOR_ENROLL ＝
"android.settings.REMOTE_AUTHENTICATOR_ENROLL"`

#### `REQUEST_ENABLE_CONTENT_CAPTURE`

`ActivityAction.REQUEST_ENABLE_CONTENT_CAPTURE ＝
"android.settings.REQUEST_ENABLE_CONTENT_CAPTURE"`

#### `REQUEST_IGNORE_BATTERY_OPTIMIZATIONS`

`ActivityAction.REQUEST_IGNORE_BATTERY_OPTIMIZATIONS ＝
"android.settings.REQUEST_IGNORE_BATTERY_OPTIMIZATIONS"`

#### `REQUEST_MANAGE_MEDIA`

`ActivityAction.REQUEST_MANAGE_MEDIA ＝
"android.settings.REQUEST_MANAGE_MEDIA"`

#### `REQUEST_MEDIA_ROUTING_CONTROL`

`ActivityAction.REQUEST_MEDIA_ROUTING_CONTROL ＝
"android.settings.REQUEST_MEDIA_ROUTING_CONTROL"`

#### `REQUEST_SCHEDULE_EXACT_ALARM`

`ActivityAction.REQUEST_SCHEDULE_EXACT_ALARM ＝
"android.settings.REQUEST_SCHEDULE_EXACT_ALARM"`

#### `REQUEST_SET_AUTOFILL_SERVICE`

`ActivityAction.REQUEST_SET_AUTOFILL_SERVICE ＝
"android.settings.REQUEST_SET_AUTOFILL_SERVICE"`

#### `SATELLITE_SETTING`

`ActivityAction.SATELLITE_SETTING ＝ "android.settings.SATELLITE_SETTING"`

#### `SCREEN_TIMEOUT_SETTINGS`

`ActivityAction.SCREEN_TIMEOUT_SETTINGS ＝
"android.settings.SCREEN_TIMEOUT_SETTINGS"`

#### `SECURITY_SETTINGS`

`ActivityAction.SECURITY_SETTINGS ＝ "android.settings.SECURITY_SETTINGS"`

#### `SETTINGS`

`ActivityAction.SETTINGS ＝ "android.settings.SETTINGS"`

#### `SETTINGS_EMBED_DEEP_LINK_ACTIVITY`

`ActivityAction.SETTINGS_EMBED_DEEP_LINK_ACTIVITY ＝
"android.settings.SETTINGS_EMBED_DEEP_LINK_ACTIVITY"`

#### `SHOW_ADMIN_SUPPORT_DETAILS`

`ActivityAction.SHOW_ADMIN_SUPPORT_DETAILS ＝
"android.settings.SHOW_ADMIN_SUPPORT_DETAILS"`

#### `SHOW_MANUAL`

`ActivityAction.SHOW_MANUAL ＝ "android.settings.SHOW_MANUAL"`

#### `SHOW_REGULATORY_INFO`

`ActivityAction.SHOW_REGULATORY_INFO ＝
"android.settings.SHOW_REGULATORY_INFO"`

#### `SHOW_REMOTE_BUGREPORT_DIALOG`

`ActivityAction.SHOW_REMOTE_BUGREPORT_DIALOG ＝
"android.settings.SHOW_REMOTE_BUGREPORT_DIALOG"`

#### `SHOW_RESTRICTED_SETTING_DIALOG`

`ActivityAction.SHOW_RESTRICTED_SETTING_DIALOG ＝
"android.settings.SHOW_RESTRICTED_SETTING_DIALOG"`

#### `SIM_PREFERENCE_SETTINGS`

`ActivityAction.SIM_PREFERENCE_SETTINGS ＝
"android.settings.SIM_PREFERENCE_SETTINGS"`

#### `SOUND_SETTINGS`

`ActivityAction.SOUND_SETTINGS ＝ "android.settings.SOUND_SETTINGS"`

#### `SPA_SEARCH_LANDING`

`ActivityAction.SPA_SEARCH_LANDING ＝ "android.settings.SPA_SEARCH_LANDING"`

#### `STORAGE_MANAGER_SETTINGS`

`ActivityAction.STORAGE_MANAGER_SETTINGS ＝
"android.settings.STORAGE_MANAGER_SETTINGS"`

#### `SYNC_SETTINGS`

`ActivityAction.SYNC_SETTINGS ＝ "android.settings.SYNC_SETTINGS"`

#### `TEMPERATURE_UNIT_SETTINGS`

`ActivityAction.TEMPERATURE_UNIT_SETTINGS ＝
"android.settings.TEMPERATURE_UNIT_SETTINGS"`

#### `TETHER_PROVISIONING_UI`

`ActivityAction.TETHER_PROVISIONING_UI ＝
"android.settings.TETHER_PROVISIONING_UI"`

#### `TETHER_SETTINGS`

`ActivityAction.TETHER_SETTINGS ＝ "android.settings.TETHER_SETTINGS"`

#### `TETHER_UNSUPPORTED_CARRIER_UI`

`ActivityAction.TETHER_UNSUPPORTED_CARRIER_UI ＝
"android.settings.TETHER_UNSUPPORTED_CARRIER_UI"`

#### `TEXT_READING_SETTINGS`

`ActivityAction.TEXT_READING_SETTINGS ＝
"android.settings.TEXT_READING_SETTINGS"`

#### `TURN_SCREEN_ON_SETTINGS`

`ActivityAction.TURN_SCREEN_ON_SETTINGS ＝
"android.settings.TURN_SCREEN_ON_SETTINGS"`

#### `USAGE_ACCESS_SETTINGS`

`ActivityAction.USAGE_ACCESS_SETTINGS ＝
"android.settings.USAGE_ACCESS_SETTINGS"`

#### `USER_DICTIONARY_INSERT`

`ActivityAction.USER_DICTIONARY_INSERT ＝
"android.settings.USER_DICTIONARY_INSERT"`

#### `USER_DICTIONARY_SETTINGS`

`ActivityAction.USER_DICTIONARY_SETTINGS ＝
"android.settings.USER_DICTIONARY_SETTINGS"`

#### `USER_SETTINGS`

`ActivityAction.USER_SETTINGS ＝ "android.settings.USER_SETTINGS"`

#### `VIEW_ADVANCED_POWER_USAGE_DETAIL`

`ActivityAction.VIEW_ADVANCED_POWER_USAGE_DETAIL ＝
"android.settings.VIEW_ADVANCED_POWER_USAGE_DETAIL"`

#### `VOICE_CONTROL_AIRPLANE_MODE`

`ActivityAction.VOICE_CONTROL_AIRPLANE_MODE ＝
"android.settings.VOICE_CONTROL_AIRPLANE_MODE"`

#### `VOICE_CONTROL_BATTERY_SAVER_MODE`

`ActivityAction.VOICE_CONTROL_BATTERY_SAVER_MODE ＝
"android.settings.VOICE_CONTROL_BATTERY_SAVER_MODE"`

#### `VOICE_CONTROL_DO_NOT_DISTURB_MODE`

`ActivityAction.VOICE_CONTROL_DO_NOT_DISTURB_MODE ＝
"android.settings.VOICE_CONTROL_DO_NOT_DISTURB_MODE"`

#### `VOICE_INPUT_SETTINGS`

`ActivityAction.VOICE_INPUT_SETTINGS ＝
"android.settings.VOICE_INPUT_SETTINGS"`

#### `VPN_SETTINGS`

`ActivityAction.VPN_SETTINGS ＝ "android.settings.VPN_SETTINGS"`

#### `VR_LISTENER_SETTINGS`

`ActivityAction.VR_LISTENER_SETTINGS ＝
"android.settings.VR_LISTENER_SETTINGS"`

#### `WALLPAPER_SETTINGS`

`ActivityAction.WALLPAPER_SETTINGS ＝ "android.settings.WALLPAPER_SETTINGS"`

#### `WEBVIEW_SETTINGS`

`ActivityAction.WEBVIEW_SETTINGS ＝ "android.settings.WEBVIEW_SETTINGS"`

#### `WIFI_ADD_NETWORKS`

`ActivityAction.WIFI_ADD_NETWORKS ＝ "android.settings.WIFI_ADD_NETWORKS"`

#### `WIFI_CALLING_SETTINGS`

`ActivityAction.WIFI_CALLING_SETTINGS ＝
"android.settings.WIFI_CALLING_SETTINGS"`

#### `WIFI_DETAILS_SETTINGS`

`ActivityAction.WIFI_DETAILS_SETTINGS ＝
"android.settings.WIFI_DETAILS_SETTINGS"`

#### `WIFI_DPP_CONFIGURATOR_AUTH_QR_CODE_GENERATOR`

`ActivityAction.WIFI_DPP_CONFIGURATOR_AUTH_QR_CODE_GENERATOR ＝
"android.settings.WIFI_DPP_CONFIGURATOR_AUTH_QR_CODE_GENERATOR"`

#### `WIFI_DPP_CONFIGURATOR_QR_CODE_GENERATOR`

`ActivityAction.WIFI_DPP_CONFIGURATOR_QR_CODE_GENERATOR ＝
"android.settings.WIFI_DPP_CONFIGURATOR_QR_CODE_GENERATOR"`

#### `WIFI_DPP_CONFIGURATOR_QR_CODE_SCANNER`

`ActivityAction.WIFI_DPP_CONFIGURATOR_QR_CODE_SCANNER ＝
"android.settings.WIFI_DPP_CONFIGURATOR_QR_CODE_SCANNER"`

#### `WIFI_DPP_ENROLLEE_QR_CODE_SCANNER`

`ActivityAction.WIFI_DPP_ENROLLEE_QR_CODE_SCANNER ＝
"android.settings.WIFI_DPP_ENROLLEE_QR_CODE_SCANNER"`

#### `WIFI_IP_SETTINGS`

`ActivityAction.WIFI_IP_SETTINGS ＝ "android.settings.WIFI_IP_SETTINGS"`

#### `WIFI_SAVED_NETWORK_SETTINGS`

`ActivityAction.WIFI_SAVED_NETWORK_SETTINGS ＝
"android.settings.WIFI_SAVED_NETWORK_SETTINGS"`

#### `WIFI_SCANNING_SETTINGS`

`ActivityAction.WIFI_SCANNING_SETTINGS ＝
"android.settings.WIFI_SCANNING_SETTINGS"`

#### `WIFI_SETTINGS`

`ActivityAction.WIFI_SETTINGS ＝ "android.settings.WIFI_SETTINGS"`

#### `WIRELESS_SETTINGS`

`ActivityAction.WIRELESS_SETTINGS ＝ "android.settings.WIRELESS_SETTINGS"`

#### `ZEN_MODE_AUTOMATION_SETTINGS`

`ActivityAction.ZEN_MODE_AUTOMATION_SETTINGS ＝
"android.settings.ZEN_MODE_AUTOMATION_SETTINGS"`

#### `ZEN_MODE_EVENT_RULE_SETTINGS`

`ActivityAction.ZEN_MODE_EVENT_RULE_SETTINGS ＝
"android.settings.ZEN_MODE_EVENT_RULE_SETTINGS"`

#### `ZEN_MODE_PRIORITY_SETTINGS`

`ActivityAction.ZEN_MODE_PRIORITY_SETTINGS ＝
"android.settings.ZEN_MODE_PRIORITY_SETTINGS"`

#### `ZEN_MODE_SCHEDULE_RULE_SETTINGS`

`ActivityAction.ZEN_MODE_SCHEDULE_RULE_SETTINGS ＝
"android.settings.ZEN_MODE_SCHEDULE_RULE_SETTINGS"`

#### `ZEN_MODE_SETTINGS`

`ActivityAction.ZEN_MODE_SETTINGS ＝ "android.settings.ZEN_MODE_SETTINGS"`

#### `ACCESSIBILITY_COLOR_SPACE_SETTINGS`

`ActivityAction.ACCESSIBILITY_COLOR_SPACE_SETTINGS ＝
"com.android.settings.ACCESSIBILITY_COLOR_SPACE_SETTINGS"`

#### `FACTORY_RESET`

`ActivityAction.FACTORY_RESET ＝ "com.android.settings.action.FACTORY_RESET"`

#### `IA_SETTINGS`

`ActivityAction.IA_SETTINGS ＝ "com.android.settings.action.IA_SETTINGS"`

#### `OPEN_PRIVATE_SPACE_SETTINGS`

`ActivityAction.OPEN_PRIVATE_SPACE_SETTINGS ＝
"com.android.settings.action.OPEN_PRIVATE_SPACE_SETTINGS"`

#### `SUGGESTION_STATE_PROVIDER`

`ActivityAction.SUGGESTION_STATE_PROVIDER ＝
"com.android.settings.action.SUGGESTION_STATE_PROVIDER"`

#### `SUPPORT_SETTINGS`

`ActivityAction.SUPPORT_SETTINGS ＝
"com.android.settings.action.SUPPORT_SETTINGS"`

#### `ADVANCED_CONNECTED_DEVICE_SETTINGS`

`ActivityAction.ADVANCED_CONNECTED_DEVICE_SETTINGS ＝
"com.android.settings.ADVANCED_CONNECTED_DEVICE_SETTINGS"`

#### `APP_STORAGE_SETTINGS`

`ActivityAction.APP_STORAGE_SETTINGS ＝
"com.android.settings.APP_STORAGE_SETTINGS"`

#### `BACKUP_SETTINGS`

`ActivityAction.BACKUP_SETTINGS ＝ "com.android.settings.BACKUP_SETTINGS"`

#### `BATTERY_SAVER_SCHEDULE_SETTINGS`

`ActivityAction.BATTERY_SAVER_SCHEDULE_SETTINGS ＝
"com.android.settings.BATTERY_SAVER_SCHEDULE_SETTINGS"`

#### `BATTERY_POWER_USAGE_ADVANCED`

`ActivityAction.BATTERY_POWER_USAGE_ADVANCED ＝
"com.android.settings.battery.action.POWER_USAGE_ADVANCED"`

#### `BIOMETRIC_SETTINGS_PROVIDER`

`ActivityAction.BIOMETRIC_SETTINGS_PROVIDER ＝
"com.android.settings.biometrics.BIOMETRIC_SETTINGS_PROVIDER"`

#### `BLUETOOTH_AUDIO_SHARING_SETTINGS`

`ActivityAction.BLUETOOTH_AUDIO_SHARING_SETTINGS ＝
"com.android.settings.BLUETOOTH_AUDIO_SHARING_SETTINGS"`

#### `BLUETOOTH_DEVICE_DETAIL_SETTINGS`

`ActivityAction.BLUETOOTH_DEVICE_DETAIL_SETTINGS ＝
"com.android.settings.BLUETOOTH_DEVICE_DETAIL_SETTINGS"`

#### `BUTTON_NAVIGATION_SETTINGS`

`ActivityAction.BUTTON_NAVIGATION_SETTINGS ＝
"com.android.settings.BUTTON_NAVIGATION_SETTINGS"`

#### `GESTURE_NAVIGATION_SETTINGS`

`ActivityAction.GESTURE_NAVIGATION_SETTINGS ＝
"com.android.settings.GESTURE_NAVIGATION_SETTINGS"`

#### `MONITORING_CERT_INFO`

`ActivityAction.MONITORING_CERT_INFO ＝
"com.android.settings.MONITORING_CERT_INFO"`

#### `MORE_SECURITY_PRIVACY_SETTINGS`

`ActivityAction.MORE_SECURITY_PRIVACY_SETTINGS ＝
"com.android.settings.MORE_SECURITY_PRIVACY_SETTINGS"`

#### `NAVIGATION_MODE_SETTINGS`

`ActivityAction.NAVIGATION_MODE_SETTINGS ＝
"com.android.settings.NAVIGATION_MODE_SETTINGS"`

#### `PREVIOUSLY_CONNECTED_DEVICE`

`ActivityAction.PREVIOUSLY_CONNECTED_DEVICE ＝
"com.android.settings.PREVIOUSLY_CONNECTED_DEVICE"`

#### `SEARCH_RESULT_TRAMPOLINE`

`ActivityAction.SEARCH_RESULT_TRAMPOLINE ＝
"com.android.settings.SEARCH_RESULT_TRAMPOLINE"`

#### `SECURITY_ADVANCED_SETTINGS`

`ActivityAction.SECURITY_ADVANCED_SETTINGS ＝
"com.android.settings.security.SECURITY_ADVANCED_SETTINGS"`

#### `SETUP_LOCK_SCREEN`

`ActivityAction.SETUP_LOCK_SCREEN ＝ "com.android.settings.SETUP_LOCK_SCREEN"`

#### `SIM_SUB_INFO_SETTINGS`

`ActivityAction.SIM_SUB_INFO_SETTINGS ＝
"com.android.settings.sim.SIM_SUB_INFO_SETTINGS"`

#### `STYLUS_USI_DETAILS_SETTINGS`

`ActivityAction.STYLUS_USI_DETAILS_SETTINGS ＝
"com.android.settings.STYLUS_USI_DETAILS_SETTINGS"`

#### `TRUSTED_CREDENTIALS`

`ActivityAction.TRUSTED_CREDENTIALS ＝
"com.android.settings.TRUSTED_CREDENTIALS"`

#### `TRUSTED_CREDENTIALS_USER`

`ActivityAction.TRUSTED_CREDENTIALS_USER ＝
"com.android.settings.TRUSTED_CREDENTIALS_USER"`

#### `TTS_SETTINGS`

`ActivityAction.TTS_SETTINGS ＝ "com.android.settings.TTS_SETTINGS"`

#### `WIFI_DIALOG`

`ActivityAction.WIFI_DIALOG ＝ "com.android.settings.WIFI_DIALOG"`

#### `WIFI_TETHER_SETTINGS`

`ActivityAction.WIFI_TETHER_SETTINGS ＝
"com.android.settings.WIFI_TETHER_SETTINGS"`

#### `WIFI_NETWORK_REQUEST`

`ActivityAction.WIFI_NETWORK_REQUEST ＝
"com.android.settings.wifi.action.NETWORK_REQUEST"`

### `ResultCode`

Android

#### `Success`

`ResultCode.Success ＝ -1`

Indicates that the activity operation succeeded.

#### `Canceled`

`ResultCode.Canceled ＝ 0`

Means that the activity was canceled, for example, by tapping on the back
button.

#### `FirstUser`

`ResultCode.FirstUser ＝ 1`

First custom, user-defined value that can be returned by the activity.

