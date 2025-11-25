package org.mvneves.dnschat

import android.app.Application
import android.content.res.Configuration

import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactNativeHost
import com.facebook.react.ReactPackage
import com.facebook.react.ReactHost
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.load
import com.facebook.react.defaults.DefaultReactNativeHost
import com.facebook.react.soloader.OpenSourceMergedSoMapping
import com.facebook.soloader.SoLoader

import expo.modules.ApplicationLifecycleDispatcher
import expo.modules.ReactNativeHostWrapper
import expo.modules.adapters.react.ModuleRegistryAdapter
import expo.modules.core.interfaces.Package
import expo.modules.linking.ExpoLinkingPackage

import com.dnsnative.DNSNativePackage

class MainApplication : Application(), ReactApplication {
  
  companion object {
    private const val TAG = "MainApplication"
    
    // Key class names in stack trace that indicate DevLauncherController initialization conflict
    private const val DEV_LAUNCHER_CONTROLLER_CLASS = "DevLauncherController"
    private const val DEV_LAUNCHER_PACKAGE_DELEGATE_CLASS = "DevLauncherPackageDelegate"
    private const val DEV_LAUNCHER_INIT_MESSAGE = "DevelopmentClientController was initialized"
    
    /**
     * Determines if an IllegalStateException is caused by DevLauncherController
     * already being initialized (a known expo-dev-client limitation).
     * 
     * This is a defensive check that examines both the exception message and
     * stack trace elements to be robust against Expo SDK changes.
     * 
     * Performance: Checks stack trace elements directly (O(n) where n is stack depth)
     * instead of converting to string (O(n) string concatenation overhead).
     * 
     * @param exception The IllegalStateException to check
     * @return true if this is a DevLauncherController initialization conflict
     */
    private fun isDevLauncherInitializationException(exception: IllegalStateException): Boolean {
      // Fast path: Check exception message first (most common case)
      val message = exception.message
      if (message != null && message.contains(DEV_LAUNCHER_INIT_MESSAGE)) {
        return true
      }
      
      // Slow path: Check stack trace for DevLauncher-related classes
      // This is more expensive but necessary for robustness against SDK changes
      val stackTrace = exception.stackTrace
      for (element in stackTrace) {
        val className = element.className
        if (className.contains(DEV_LAUNCHER_CONTROLLER_CLASS) ||
            className.contains(DEV_LAUNCHER_PACKAGE_DELEGATE_CLASS)) {
          return true
        }
      }
      
      return false
    }
  }

  private val manualExpoPackages: List<Package> = listOf(ExpoLinkingPackage())

  @Suppress("DEPRECATION")
  override val reactNativeHost: ReactNativeHost = ReactNativeHostWrapper(
        this,
        object : DefaultReactNativeHost(this) {
          @Suppress("DEPRECATION")
          override fun getPackages(): List<ReactPackage> {
            val packages = PackageList(this).packages
            // Expo's autolinking should register every module, but Hermes was failing to
            // resolve ExpoLinking's native implementation on dev builds. Explicitly adding the
            // package ensures deep-link helpers stay available even if autolinking misses it.
            packages.add(ModuleRegistryAdapter(manualExpoPackages))
            // Register DNS native module (not auto-linked, requires explicit registration)
            packages.add(DNSNativePackage())
            return packages
          }

          @Suppress("DEPRECATION")
          override fun getJSMainModuleName(): String = ".expo/.virtual-metro-entry"

          @Suppress("DEPRECATION")
          override fun getUseDeveloperSupport(): Boolean = BuildConfig.DEBUG

          override val isNewArchEnabled: Boolean = BuildConfig.IS_NEW_ARCHITECTURE_ENABLED
          override val isHermesEnabled: Boolean = BuildConfig.IS_HERMES_ENABLED
      }
  )

  @Suppress("DEPRECATION")
  override val reactHost: ReactHost
    get() = ReactNativeHostWrapper.createReactHost(applicationContext, reactNativeHost)

  override fun onCreate() {
    super.onCreate()
    SoLoader.init(this, OpenSourceMergedSoMapping)
    if (BuildConfig.IS_NEW_ARCHITECTURE_ENABLED) {
      // If you opted-in for the New Architecture, we load the native entry point for this app.
      load()
    }
    
    // Initialize Expo modules lifecycle dispatcher
    // This must be wrapped in exception handling because expo-dev-launcher's
    // DevLauncherController can throw IllegalStateException if already initialized.
    // This happens when:
    // 1. App process is reused (Android can reuse processes between launches)
    // 2. Dev client hot reload restarts the Application without process termination
    // 3. Multiple initialization paths trigger lifecycle dispatchers
    // 
    // We only catch this specific exception in DEBUG builds to avoid masking
    // legitimate IllegalStateExceptions in production code.
    try {
      ApplicationLifecycleDispatcher.onApplicationCreate(this)
    } catch (e: IllegalStateException) {
      // Fast path: In production builds, always re-throw to avoid masking bugs
      if (!BuildConfig.DEBUG) {
        android.util.Log.e(
          TAG,
          "ApplicationLifecycleDispatcher failed in production build",
          e
        )
        throw e
      }
      
      // Slow path: Check if this is the DevLauncherController initialization conflict
      if (isDevLauncherInitializationException(e)) {
        // Safe to ignore: DevLauncherController is already initialized from previous run
        // This is a known limitation of expo-dev-client when Application.onCreate()
        // is called multiple times without process termination
        android.util.Log.w(
          TAG,
          "DevLauncherController already initialized (process reuse detected). " +
          "This is safe to ignore in dev builds. Continuing application startup..."
        )
      } else {
        // Re-throw: This is a different IllegalStateException that indicates a real problem
        android.util.Log.e(
          TAG,
          "ApplicationLifecycleDispatcher failed with unexpected IllegalStateException",
          e
        )
        throw e
      }
    }
  }

  override fun onConfigurationChanged(newConfig: Configuration) {
    super.onConfigurationChanged(newConfig)
    ApplicationLifecycleDispatcher.onConfigurationChanged(this, newConfig)
  }
}
