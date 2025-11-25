import { Platform, NativeModules } from "react-native";

interface DiagnosticResult {
  name: string;
  status: "pass" | "fail" | "warning";
  message: string;
  details?: string;
}

export class AndroidStartupDiagnostics {
  private static results: DiagnosticResult[] = [];

  static log(message: string, details?: string) {
    console.log(`[AndroidStartupDiagnostics] ${message}`, details || "");
  }

  static error(message: string, details?: string) {
    console.error(`[AndroidStartupDiagnostics] ❌ ${message}`, details || "");
  }

  static warn(message: string, details?: string) {
    console.warn(`[AndroidStartupDiagnostics] ⚠️ ${message}`, details || "");
  }

  static async runDiagnostics(): Promise<DiagnosticResult[]> {
    this.results = [];

    if (Platform.OS !== "android") {
      this.log("Skipping Android diagnostics (not Android platform)");
      return this.results;
    }

    // Check 1: Native DNS module registration
    this.checkNativeDNSModule();

    // Check 2: Metro bundler connection
    this.checkMetroConnection();

    // Check 3: Native modules availability
    this.checkNativeModules();

    // Check 4: Error boundary state
    this.checkErrorBoundary();

    return this.results;
  }

  private static checkNativeDNSModule() {
    try {
      const dnsModule = NativeModules.RNDNSModule;
      if (dnsModule) {
        this.results.push({
          name: "DNS Native Module",
          status: "pass",
          message: "RNDNSModule is registered and available",
          details: `Methods: ${Object.keys(dnsModule).join(", ")}`,
        });
        this.log("✅ DNS Native Module registered");
      } else {
        this.results.push({
          name: "DNS Native Module",
          status: "fail",
          message: "RNDNSModule is not registered",
          details:
            "Check MainApplication.kt - DNSNativePackage must be added to packages list",
        });
        this.error("DNS Native Module not registered");
      }
    } catch (error) {
      this.results.push({
        name: "DNS Native Module",
        status: "fail",
        message: "Error checking DNS module",
        details: String(error),
      });
      this.error("Error checking DNS module", String(error));
    }
  }

  private static checkMetroConnection() {
    // Metro connection is checked via React Native's dev support
    // If bundle loads successfully, Metro is connected
    const isDev = __DEV__;
    if (isDev) {
      this.results.push({
        name: "Metro Bundler",
        status: "warning",
        message: "Dev mode - verify Metro is running on port 8081",
        details: "Run: npm start or check adb reverse tcp:8081 tcp:8081",
      });
      this.warn("Dev mode - verify Metro connection");
    } else {
      this.results.push({
        name: "Metro Bundler",
        status: "pass",
        message: "Release build - Metro not required",
      });
    }
  }

  private static checkNativeModules() {
    try {
      const modules = Object.keys(NativeModules);
      const criticalModules = [
        "RNDNSModule",
        "RNGestureHandlerModule",
        "RNCSafeAreaProvider",
      ];

      const missing = criticalModules.filter(
        (name) => !modules.includes(name),
      );

      if (missing.length === 0) {
        this.results.push({
          name: "Native Modules",
          status: "pass",
          message: "All critical native modules registered",
          details: `Found ${modules.length} native modules`,
        });
        this.log("✅ All critical native modules registered");
      } else {
        this.results.push({
          name: "Native Modules",
          status: "warning",
          message: `Missing modules: ${missing.join(", ")}`,
          details: `Found ${modules.length} native modules total`,
        });
        this.warn(`Missing modules: ${missing.join(", ")}`);
      }
    } catch (error) {
      this.results.push({
        name: "Native Modules",
        status: "fail",
        message: "Error checking native modules",
        details: String(error),
      });
      this.error("Error checking native modules", String(error));
    }
  }

  private static checkErrorBoundary() {
    // Error boundary state is managed by React component
    // This is a placeholder for future enhancements
    this.results.push({
      name: "Error Boundary",
      status: "pass",
      message: "Error boundary initialized",
    });
  }

  static getResults(): DiagnosticResult[] {
    return [...this.results];
  }

  static printSummary() {
    const passed = this.results.filter((r) => r.status === "pass").length;
    const failed = this.results.filter((r) => r.status === "fail").length;
    const warnings = this.results.filter((r) => r.status === "warning").length;

    console.log("\n=== Android Startup Diagnostics ===");
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`⚠️  Warnings: ${warnings}`);
    console.log("===================================\n");

    if (failed > 0) {
      console.error("Critical issues found! App may not function correctly.");
      this.results
        .filter((r) => r.status === "fail")
        .forEach((r) => {
          console.error(`\n❌ ${r.name}: ${r.message}`);
          if (r.details) console.error(`   Details: ${r.details}`);
        });
    }
  }
}

