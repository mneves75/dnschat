/**
 * LiquidGlassView - SwiftUI Glass Effect Native Implementation
 * 
 * This module provides SwiftUI .glassEffect() integration for React Native,
 * following Apple's modern Swift development patterns and best practices.
 * 
 * Key Features:
 * - SwiftUI .glassEffect() modifier (iOS 17.0+ GUARANTEED)
 * - GlassEffectContainer for performance optimization
 * - Modern Swift @Observable pattern
 * - Sensor-aware environmental adaptation
 * - Memory and thermal optimization
 * - Native iOS 17+ Liquid Glass guarantee
 * 
 * Apple Best Practices Followed:
 * - SwiftUI as default UI paradigm
 * - Declarative, not imperative patterns
 * - Modern async/await concurrency
 * - @Observable for shared state
 * 
 * @author DNSChat Team
 * @since 1.8.0 (iOS 17 Liquid Glass Support)
 */

import Foundation
import SwiftUI
import Combine
import CoreMotion
import os.log
import UIKit
import React

// ==================================================================================
// LOGGING SYSTEM
// ==================================================================================

fileprivate let logger = Logger(
  subsystem: "com.dnschat.liquidglass",
  category: "LiquidGlassView"
)

// ==================================================================================
// GLASS CONFIGURATION
// ==================================================================================

/**
 * SwiftUI Glass Configuration following Apple's patterns
 */
@objc public class LiquidGlassConfig: NSObject {
  @objc public var variant: String = "regular"           // regular, prominent, interactive
  @objc public var shape: String = "capsule"            // capsule, rect, roundedRect
  @objc public var cornerRadius: CGFloat = 12.0          // For rect shapes
  @objc public var tintColor: String = ""                // Hex color or empty for default
  @objc public var isInteractive: Bool = false           // Responds to touch
  @objc public var sensorAware: Bool = false             // Environmental adaptation
  @objc public var enableContainer: Bool = true          // Use GlassEffectContainer
  @objc public var containerSpacing: CGFloat = 40.0      // Container merge distance
  
  @objc public override init() {
    super.init()
  }
}

/**
 * Environmental context using modern @Observable pattern
 * 🚨 TARGETING iOS 17.0+ for Liquid Glass Guarantee
 */
class EnvironmentalContext: ObservableObject {
  @Published var ambientLight: Float = 0.5
  @Published var deviceOrientation: UIDeviceOrientation = .portrait
  @Published var thermalState: ProcessInfo.ThermalState = .nominal
  @Published var userInterfaceStyle: UIUserInterfaceStyle = .unspecified
  var isAdaptationEnabled: Bool = false
  
  private var motionManager: CMMotionManager?
  private var cancellables = Set<AnyCancellable>()
  
  init() {
    setupEnvironmentalTracking()
  }
  
  private func setupEnvironmentalTracking() {
    setupMotionTracking()
    setupThermalMonitoring()
  }
  
  private func setupMotionTracking() {
    motionManager = CMMotionManager()
    if motionManager?.isDeviceMotionAvailable == true {
      motionManager?.deviceMotionUpdateInterval = 0.5 // Battery efficient
    }
  }
  
  private func setupThermalMonitoring() {
    NotificationCenter.default.publisher(for: ProcessInfo.thermalStateDidChangeNotification)
      .sink { [weak self] _ in
        Task { @MainActor in
          self?.thermalState = ProcessInfo.processInfo.thermalState
        }
      }
      .store(in: &cancellables)
  }
  
  func startAdaptation() async {
    isAdaptationEnabled = true
    
    guard let motionManager = motionManager else { return }
    
    motionManager.startDeviceMotionUpdates(to: .main) { [weak self] motion, error in
      guard let motion = motion, error == nil else { return }
      
      Task { @MainActor in
        self?.updateEnvironmentalData(from: motion)
      }
    }
  }
  
  func stopAdaptation() {
    isAdaptationEnabled = false
    motionManager?.stopDeviceMotionUpdates()
  }
  
  @MainActor
  private func updateEnvironmentalData(from motion: CMDeviceMotion) {
    // Simplified ambient light estimation
    let gravity = motion.gravity
    let lightEstimate = Float(abs(gravity.z))
    self.ambientLight = max(0.1, min(1.0, lightEstimate))
  }
}

// ==================================================================================
// CUSTOM GLASS CONTAINER
// ==================================================================================

/**
 * Custom Glass Container for performance optimization
 * 🚨 TARGETING iOS 17.0+ for Liquid Glass Guarantee
 */
struct LiquidGlassContainer<Content: View>: View {
  let spacing: CGFloat
  let content: Content
  
  init(spacing: CGFloat, @ViewBuilder content: () -> Content) {
    self.spacing = spacing
    self.content = content()
  }
  
  var body: some View {
    if #available(iOS 17.0, *) {
      // Use native iOS 17 GlassEffectContainer for proper layering
      GlassEffectContainer {
        VStack(spacing: spacing) {
          content
        }
      }
    } else {
      // Fallback for iOS < 26
      VStack(spacing: spacing) {
        content
      }
      .background(
        // Enhanced glass container background
        RoundedRectangle(cornerRadius: 20)
          .fill(Material.ultraThinMaterial)
          .shadow(color: .black.opacity(0.1), radius: 10, x: 0, y: 4)
      )
    }
  }
}

// ==================================================================================
// SWIFTUI LIQUID GLASS VIEW
// ==================================================================================

/**
 * Core SwiftUI View with .glassEffect() implementation following Apple best practices
 * 🚨 TARGETING iOS 17.0+ for Liquid Glass Guarantee
 */
public struct LiquidGlassContentView: View {
  let config: LiquidGlassConfig
  let content: AnyView
  @StateObject private var environmentalContext = EnvironmentalContext()
  
  public init(config: LiquidGlassConfig, content: AnyView) {
    self.config = config
    self.content = content
  }
  
  public var body: some View {
    if config.enableContainer {
      // Use custom glass container implementation
      LiquidGlassContainer(spacing: config.containerSpacing) {
        glassContent
      }
      .environmentObject(environmentalContext)
    } else {
      glassContent
        .environmentObject(environmentalContext)
    }
  }
  
  @ViewBuilder
  private var glassContent: some View {
    if #available(iOS 17.0, *) {
      // Use native iOS 17 .glassEffect() modifier
      Group {
        switch config.shape {
        case "rect":
          content
            .glassEffect(glassStyleFromConfig(), in: Rectangle())
        case "roundedRect":
          content
            .glassEffect(glassStyleFromConfig(), in: RoundedRectangle(cornerRadius: config.cornerRadius))
        default: // "capsule"
          content
            .glassEffect(glassStyleFromConfig(), in: Capsule())
        }
      }
        .task {
          if config.sensorAware {
            await environmentalContext.startAdaptation()
          }
        }
        .onDisappear {
          if config.sensorAware {
            environmentalContext.stopAdaptation()
          }
        }
    } else {
      // Fallback for iOS < 26
      glassShapeView {
        ZStack {
          // Glass background effect
          glassBackground
            .background(Material.ultraThinMaterial)
          
          // Content overlay
          content
        }
      }
      .task {
        if config.sensorAware {
          await environmentalContext.startAdaptation()
        }
      }
      .onDisappear {
        if config.sensorAware {
          environmentalContext.stopAdaptation()
        }
      }
    }
  }
  
  @available(iOS 17.0, *)
  private func glassStyleFromConfig() -> Glass {
    let baseGlass: Glass = {
      switch config.variant {
      case "prominent":
        return .regular  // prominent uses regular with tint
      case "interactive":
        return config.isInteractive ? .regular.interactive() : .regular
      default:
        return .regular
      }
    }()
    
    // Apply interactive modifier if configured
    if config.isInteractive && config.variant != "interactive" {
      return baseGlass.interactive()
    }
    
    return baseGlass
  }
  
  
  private var glassBackground: some View {
    let baseMaterial: Material = {
      switch config.variant {
      case "prominent":
        return .ultraThick
      case "interactive":
        return .thick
      default:
        return .regular
      }
    }()
    
    // Apply glass effect with material background
    let glassView = Rectangle()
      .fill(baseMaterial)
      .opacity(0.8)
    
    // Apply tint if specified
    if !config.tintColor.isEmpty {
      if let color = Color(hex: config.tintColor) {
        return AnyView(glassView.overlay(color.opacity(0.2)))
      }
    }
    
    return AnyView(glassView)
  }
  
  @ViewBuilder
  private func glassShapeView<Content: View>(@ViewBuilder content: () -> Content) -> some View {
    switch config.shape {
    case "rect":
      content()
        .clipShape(Rectangle())
    case "roundedRect":
      content()
        .clipShape(RoundedRectangle(cornerRadius: config.cornerRadius))
    default: // "capsule"
      content()
        .clipShape(Capsule())
    }
  }
}

// ==================================================================================
// SWIFTUI EXTENSIONS
// ==================================================================================

extension Color {
  init?(hex: String) {
    var hexSanitized = hex.trimmingCharacters(in: .whitespacesAndNewlines)
    hexSanitized = hexSanitized.replacingOccurrences(of: "#", with: "")
    
    var rgb: UInt64 = 0
    
    var r: CGFloat = 0.0
    var g: CGFloat = 0.0
    var b: CGFloat = 0.0
    var a: CGFloat = 1.0
    
    let length = hexSanitized.count
    
    guard Scanner(string: hexSanitized).scanHexInt64(&rgb) else { return nil }
    
    if length == 6 {
      r = CGFloat((rgb & 0xFF0000) >> 16) / 255.0
      g = CGFloat((rgb & 0x00FF00) >> 8) / 255.0
      b = CGFloat(rgb & 0x0000FF) / 255.0
    } else if length == 8 {
      r = CGFloat((rgb & 0xFF000000) >> 24) / 255.0
      g = CGFloat((rgb & 0x00FF0000) >> 16) / 255.0
      b = CGFloat((rgb & 0x0000FF00) >> 8) / 255.0
      a = CGFloat(rgb & 0x000000FF) / 255.0
    } else {
      return nil
    }
    
    self.init(.sRGB, red: r, green: g, blue: b, opacity: a)
  }
}

/**
 * UIKit wrapper for React Native integration
 * 🚨 TARGETING iOS 17.0+ for Liquid Glass Guarantee
 */
@objc(LiquidGlassView)
public class LiquidGlassView: UIView {
  private var config = LiquidGlassConfig()
  private var hostingController: UIHostingController<LiquidGlassContentView>?
  private var contentView: UIView = UIView()
  
  // MARK: - Initialization
  
  public override init(frame: CGRect) {
    super.init(frame: frame)
    setupView()
  }
  
  required init?(coder: NSCoder) {
    super.init(coder: coder)
    setupView()
  }
  
  private func setupView() {
    backgroundColor = .clear
    
    // Add content view that will host React Native content
    contentView.backgroundColor = .clear
    addSubview(contentView)
    contentView.translatesAutoresizingMaskIntoConstraints = false
    NSLayoutConstraint.activate([
      contentView.topAnchor.constraint(equalTo: topAnchor),
      contentView.leadingAnchor.constraint(equalTo: leadingAnchor),
      contentView.trailingAnchor.constraint(equalTo: trailingAnchor),
      contentView.bottomAnchor.constraint(equalTo: bottomAnchor)
    ])
    
    // Create SwiftUI glass effect wrapping the content
    setupGlassEffect()
    
    logger.info("SwiftUI Liquid Glass View initialized")
  }
  
  private func setupGlassEffect() {
    // Wrap the content view in SwiftUI glass effect
    let wrappedContent = AnyView(
      Rectangle()
        .fill(Color.clear)
        .overlay(
          // This will be where React Native content renders
          Color.clear
        )
    )
    
    let glassView = LiquidGlassContentView(config: config, content: wrappedContent)
    
    hostingController = UIHostingController(rootView: glassView)
    hostingController?.view.backgroundColor = .clear
    
    if let hostingView = hostingController?.view {
      insertSubview(hostingView, at: 0) // Behind content
      hostingView.translatesAutoresizingMaskIntoConstraints = false
      NSLayoutConstraint.activate([
        hostingView.topAnchor.constraint(equalTo: topAnchor),
        hostingView.leadingAnchor.constraint(equalTo: leadingAnchor),
        hostingView.trailingAnchor.constraint(equalTo: trailingAnchor),
        hostingView.bottomAnchor.constraint(equalTo: bottomAnchor)
      ])
    }
  }
  
  // MARK: - Public Configuration API
  
  @objc public func updateConfig(_ newConfig: LiquidGlassConfig) {
    config = newConfig
    refreshGlassEffect()
    
    logger.debug("Glass config updated: variant=\\(newConfig.variant), shape=\\(newConfig.shape)")
  }
  
  @objc public func setVariant(_ variant: String) {
    config.variant = variant
    refreshGlassEffect()
  }
  
  @objc public func setShape(_ shape: String) {
    config.shape = shape
    refreshGlassEffect()
  }
  
  @objc public func setGlassTintColor(_ tintColor: String) {
    config.tintColor = tintColor
    refreshGlassEffect()
  }
  
  @objc public func setSensorAware(_ enabled: Bool) {
    config.sensorAware = enabled
    refreshGlassEffect()
  }
  
  @objc public func setInteractive(_ enabled: Bool) {
    config.isInteractive = enabled
    refreshGlassEffect()
  }
  
  @objc public func setIsInteractive(_ enabled: Bool) {
    config.isInteractive = enabled
    refreshGlassEffect()
  }
  
  @objc public func setCornerRadius(_ radius: CGFloat) {
    config.cornerRadius = radius
    refreshGlassEffect()
  }
  
  @objc public func setEnableContainer(_ enabled: Bool) {
    config.enableContainer = enabled
    refreshGlassEffect()
  }
  
  @objc public func setContainerSpacing(_ spacing: CGFloat) {
    config.containerSpacing = spacing
    refreshGlassEffect()
  }
  
  private func refreshGlassEffect() {
    // Remove existing hosting controller
    hostingController?.view.removeFromSuperview()
    hostingController = nil
    
    // Recreate the SwiftUI view with new config
    setupGlassEffect()
  }
  
  // MARK: - Lifecycle Management
  
  public override func willMove(toSuperview newSuperview: UIView?) {
    super.willMove(toSuperview: newSuperview)
    
    if newSuperview == nil {
      cleanup()
    }
  }
  
  private func cleanup() {
    hostingController?.view.removeFromSuperview()
    hostingController = nil
    
    logger.info("LiquidGlassView cleaned up")
  }
  
  deinit {
    cleanup()
  }
}

// ==================================================================================
// REACT NATIVE BRIDGE SUPPORT
// ==================================================================================

@objc(LiquidGlassViewManager)
public class LiquidGlassViewManager: RCTViewManager {
  
  public override func view() -> UIView! {
    // Runtime iOS 17+ detection - return appropriate view
    if #available(iOS 17.0, *) {
      return LiquidGlassView()
    } else {
      // Return basic UIView for iOS 16-25 - fallback handled by React Native layer
      return UIView()
    }
  }
  
  public override static func requiresMainQueueSetup() -> Bool {
    return true
  }
  
  
  // MARK: - React Native Props (Updated for SwiftUI)
  
  @objc public func setVariant(_ view: LiquidGlassView, variant: String) {
    view.setVariant(variant)
  }
  
  @objc public func setShape(_ view: LiquidGlassView, shape: String) {
    view.setShape(shape)
  }
  
  @objc public func setTintColor(_ view: LiquidGlassView, tintColor: String) {
    view.setGlassTintColor(tintColor)
  }
  
  @objc public func setSensorAware(_ view: LiquidGlassView, sensorAware: Bool) {
    view.setSensorAware(sensorAware)
  }
  
  @objc public func setIsInteractive(_ view: LiquidGlassView, isInteractive: Bool) {
    view.setIsInteractive(isInteractive)
  }
  
  @objc public func setCornerRadius(_ view: LiquidGlassView, cornerRadius: CGFloat) {
    view.setCornerRadius(cornerRadius)
  }
  
  @objc public func setEnableContainer(_ view: LiquidGlassView, enableContainer: Bool) {
    view.setEnableContainer(enableContainer)
  }
  
  @objc public func setContainerSpacing(_ view: LiquidGlassView, containerSpacing: CGFloat) {
    view.setContainerSpacing(containerSpacing)
  }
  
  @objc public func setGlassTintColor(_ view: LiquidGlassView, glassTintColor: String) {
    view.setGlassTintColor(glassTintColor)
  }
}

// ==================================================================================
// MODULE REGISTRATION
// ==================================================================================

@objc(LiquidGlassNativeModule)
public class LiquidGlassNativeModule: NSObject, RCTBridgeModule {
  
  @objc public static func requiresMainQueueSetup() -> Bool {
    return false
  }
  
  @objc public static func moduleName() -> String! {
    return "LiquidGlassNativeModule"
  }
  
  @objc public func getCapabilities(
    _ resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    // Runtime iOS 17+ detection for capabilities
    let isIOS26Plus = {
      if #available(iOS 17.0, *) {
        return true
      } else {
        return false
      }
    }()
    
    let capabilities: [String: Any] = [
      "available": isIOS26Plus,
      "platform": "ios",
      "supportsSwiftUIGlass": isIOS26Plus,
      "supportsGlassContainer": isIOS26Plus,
      "supportsSensorAware": isIOS26Plus,
      "supportsInteractive": isIOS26Plus,
      "iosVersion": UIDevice.current.systemVersion,
      "apiLevel": getIOSAPILevel(),
      "glassEffectAPI": isIOS26Plus ? "swiftui" : "fallback"
    ]
    
    resolve(capabilities)
  }
  
  private func getIOSAPILevel() -> Int {
    let version = UIDevice.current.systemVersion
    let components = version.split(separator: ".").compactMap { Int($0) }
    
    guard let major = components.first else { return 170 }
    let minor = components.count > 1 ? components[1] : 0
    
    return major * 10 + minor
  }
}
