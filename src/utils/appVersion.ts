import Constants from "expo-constants";
import { Platform } from "react-native";

const packageJson = require("../../package.json") as { version?: string };

const getConfiguredBuildVersion = (): string | null => {
  const config = Constants.expoConfig;
  const iosBuild = config?.ios?.buildNumber ?? null;
  const androidBuild =
    typeof config?.android?.versionCode === "number"
      ? String(config.android.versionCode)
      : null;

  if (Platform.OS === "ios") return iosBuild;
  if (Platform.OS === "android") return androidBuild;
  return iosBuild ?? androidBuild;
};

export const getAppVersionInfo = (): {
  appVersion: string;
  buildVersion: string | null;
  displayVersion: string;
} => {
  const packageVersion =
    typeof packageJson.version === "string" ? packageJson.version : "0.0.0";
  const appVersion =
    Constants["nativeAppVersion"] ?? Constants.expoConfig?.version ?? packageVersion;
  const buildVersion = Constants["nativeBuildVersion"] ?? getConfiguredBuildVersion();
  const displayVersion = buildVersion ? `${appVersion} (${buildVersion})` : appVersion;

  return {
    appVersion,
    buildVersion,
    displayVersion,
  };
};
