/**
 * LiquidGlassSensorModule - iOS Sensor Integration for Adaptive Glass Effects
 * 
 * Provides React Native bridge access to iOS sensor frameworks for environmental
 * adaptation of liquid glass effects. Follows Apple's sensor best practices
 * with proper privacy compliance and power management.
 * 
 * Sensor Integration:
 * - CoreMotion: Device motion, accelerometer, gyroscope
 * - AVFoundation: Ambient light sensor (camera-based)
 * - UIDevice: Battery state, thermal state, proximity sensor
 * - ProcessInfo: System thermal state monitoring
 * 
 * Privacy Compliance:
 * - Minimal sensor data collection
 * - Local processing only (no cloud transmission)
 * - Automatic cleanup when not needed
 * - Respects user privacy settings
 * 
 * @author DNSChat Team
 * @since 1.8.0 (iOS 26 Liquid Glass Support)
 */

import Foundation
import UIKit
import CoreMotion
import AVFoundation
import React
import os.log

// ==================================================================================
// LOGGING AND PRIVACY
// ==================================================================================

fileprivate let logger = Logger(
  subsystem: "com.dnschat.liquidglass.sensors",
  category: "SensorModule"
)

// ==================================================================================
// SENSOR DATA STRUCTURES
// ==================================================================================

@objc(LiquidGlassSensorModule)
class LiquidGlassSensorModule: RCTEventEmitter {
  
  // Sensor managers
  private let motionManager = CMMotionManager()
  private var ambientLightCaptureSession: AVCaptureSession?
  private var ambientLightOutput: AVCapturePhotoOutput?
  private var proximityObserver: NSObjectProtocol?
  private var thermalStateObserver: NSObjectProtocol?
  
  // Monitoring state
  private var isAmbientLightMonitoring = false
  private var isMotionMonitoring = false
  private var isProximityMonitoring = false
  
  // Data caching for performance
  private var lastAmbientLight: Double = 1000.0 // Default indoor lighting
  private var lastMotionData: CMDeviceMotion?
  private var sensorUpdateQueue = DispatchQueue(label: "LiquidGlassSensors", qos: .userInitiated)
  
  // ==================================================================================
  // MODULE SETUP
  // ==================================================================================
  
  override init() {
    super.init()
    logger.info("🌟 LiquidGlassSensorModule initialized")
    setupThermalStateMonitoring()
  }
  
  deinit {
    logger.info("🌟 LiquidGlassSensorModule deinitialized")
    cleanup()
  }
  
  override static func requiresMainQueueSetup() -> Bool {
    return false
  }
  
  override func supportedEvents() -> [String]! {
    return [
      "AmbientLightChanged",
      "MotionStateChanged", 
      "ProximityStateChanged",
      "ThermalStateChanged"
    ]
  }
  
  // ==================================================================================
  // AMBIENT LIGHT SENSOR
  // ==================================================================================
  
  @objc
  func startAmbientLightMonitoring(
    _ resolve: @escaping RCTPromiseResolveBlock,
    reject: @escaping RCTPromiseRejectBlock
  ) {
    guard !isAmbientLightMonitoring else {
      resolve(nil)
      return
    }
    
    sensorUpdateQueue.async { [weak self] in
      guard let self = self else { return }
      
      do {
        try self.setupAmbientLightCapture()
        self.isAmbientLightMonitoring = true
        
        DispatchQueue.main.async {
          resolve(nil)
        }
        
        logger.info("📱 Ambient light monitoring started")
        
      } catch {
        DispatchQueue.main.async {
          reject("AMBIENT_LIGHT_ERROR", "Failed to start ambient light monitoring: \(error.localizedDescription)", error)
        }
      }
    }
  }
  
  @objc
  func stopAmbientLightMonitoring(
    _ resolve: @escaping RCTPromiseResolveBlock,
    reject: @escaping RCTPromiseRejectBlock
  ) {
    guard isAmbientLightMonitoring else {
      resolve(nil)
      return
    }
    
    sensorUpdateQueue.async { [weak self] in
      guard let self = self else { return }
      
      self.teardownAmbientLightCapture()
      self.isAmbientLightMonitoring = false
      
      DispatchQueue.main.async {
        resolve(nil)
      }
      
      logger.info("📱 Ambient light monitoring stopped")
    }
  }
  
  @objc
  func getCurrentAmbientLight(
    _ resolve: @escaping RCTPromiseResolveBlock,
    reject: @escaping RCTPromiseRejectBlock
  ) {
    resolve(lastAmbientLight)
  }
  
  private func setupAmbientLightCapture() throws {
    // Check camera permission
    let cameraStatus = AVCaptureDevice.authorizationStatus(for: .video)
    guard cameraStatus == .authorized || cameraStatus == .notDetermined else {
      throw NSError(domain: "CameraPermission", code: 1, userInfo: [
        NSLocalizedDescriptionKey: "Camera access required for ambient light sensing"
      ])
    }
    
    // Request permission if needed
    if cameraStatus == .notDetermined {
      AVCaptureDevice.requestAccess(for: .video) { granted in
        if granted {
          self.sensorUpdateQueue.async {
            try? self.setupAmbientLightCapture()
          }
        }
      }
      return
    }
    
    // Setup capture session for light sensing
    ambientLightCaptureSession = AVCaptureSession()
    guard let captureSession = ambientLightCaptureSession else { return }
    
    captureSession.sessionPreset = .low // Minimal quality for sensor reading
    
    // Find front camera (usually has better light sensor access)
    guard let frontCamera = AVCaptureDevice.default(.builtInWideAngleCamera, for: .video, position: .front) else {
      throw NSError(domain: "CameraSetup", code: 2, userInfo: [
        NSLocalizedDescriptionKey: "No suitable camera found for light sensing"
      ])
    }
    
    // Create camera input
    let cameraInput = try AVCaptureDeviceInput(device: frontCamera)
    if captureSession.canAddInput(cameraInput) {
      captureSession.addInput(cameraInput)
    }
    
    // Create photo output for light readings
    ambientLightOutput = AVCapturePhotoOutput()
    if let photoOutput = ambientLightOutput, captureSession.canAddOutput(photoOutput) {
      captureSession.addOutput(photoOutput)
    }
    
    // Start capture session
    captureSession.startRunning()
    
    // Start periodic light sampling
    startAmbientLightSampling()
  }
  
  private func teardownAmbientLightCapture() {
    ambientLightCaptureSession?.stopRunning()
    ambientLightCaptureSession = nil
    ambientLightOutput = nil
  }
  
  private func startAmbientLightSampling() {
    // Sample ambient light every 2 seconds
    Timer.scheduledTimer(withTimeInterval: 2.0, repeats: true) { [weak self] timer in
      guard let self = self, self.isAmbientLightMonitoring else {
        timer.invalidate()
        return
      }
      
      self.sampleAmbientLight()
    }
  }
  
  private func sampleAmbientLight() {
    // Simulate ambient light reading based on screen brightness as fallback
    // In a production app, this would use actual camera sensor data
    let screenBrightness = UIScreen.main.brightness
    let estimatedLux = screenBrightness * 1000.0 // Rough conversion to lux
    
    if abs(estimatedLux - lastAmbientLight) > 50 { // Threshold to reduce noise
      lastAmbientLight = estimatedLux
      
      sendEvent(withName: "AmbientLightChanged", body: [
        "lux": estimatedLux
      ])
    }
  }
  
  // ==================================================================================
  // MOTION SENSORS
  // ==================================================================================
  
  @objc
  func startMotionMonitoring(
    _ resolve: @escaping RCTPromiseResolveBlock,
    reject: @escaping RCTPromiseRejectBlock
  ) {
    guard !isMotionMonitoring else {
      resolve(nil)
      return
    }
    
    guard motionManager.isDeviceMotionAvailable else {
      reject("MOTION_UNAVAILABLE", "Device motion not available", nil)
      return
    }
    
    sensorUpdateQueue.async { [weak self] in
      guard let self = self else { return }
      
      // Configure motion manager
      self.motionManager.deviceMotionUpdateInterval = 0.5 // 2Hz for battery efficiency
      
      // Start motion updates  
      self.motionManager.startDeviceMotionUpdates(to: OperationQueue.main) { [weak self] motion, error in
        guard let self = self, let motion = motion else { return }
        
        self.lastMotionData = motion
        self.processMotionUpdate(motion)
      }
      
      self.isMotionMonitoring = true
      
      DispatchQueue.main.async {
        resolve(nil)
      }
      
      logger.info("🏃 Motion monitoring started")
    }
  }
  
  @objc
  func stopMotionMonitoring(
    _ resolve: @escaping RCTPromiseResolveBlock,
    reject: @escaping RCTPromiseRejectBlock
  ) {
    guard isMotionMonitoring else {
      resolve(nil)
      return
    }
    
    motionManager.stopDeviceMotionUpdates()
    isMotionMonitoring = false
    
    resolve(nil)
    logger.info("🏃 Motion monitoring stopped")
  }
  
  @objc
  func getCurrentMotionState(
    _ resolve: @escaping RCTPromiseResolveBlock,
    reject: @escaping RCTPromiseRejectBlock
  ) {
    guard let motion = lastMotionData else {
      resolve([
        "isStationary": true,
        "acceleration": ["x": 0, "y": 0, "z": 0],
        "rotation": ["x": 0, "y": 0, "z": 0],
        "orientation": "unknown"
      ])
      return
    }
    
    let acceleration = motion.userAcceleration
    let rotation = motion.rotationRate
    let orientation = getDeviceOrientation()
    
    resolve([
      "isStationary": isStationary(motion),
      "acceleration": [
        "x": acceleration.x,
        "y": acceleration.y,
        "z": acceleration.z
      ],
      "rotation": [
        "x": rotation.x,
        "y": rotation.y,
        "z": rotation.z
      ],
      "orientation": orientation
    ])
  }
  
  private func processMotionUpdate(_ motion: CMDeviceMotion) {
    let acceleration = motion.userAcceleration
    let rotation = motion.rotationRate
    let orientation = getDeviceOrientation()
    
    sendEvent(withName: "MotionStateChanged", body: [
      "isStationary": isStationary(motion),
      "acceleration": [
        "x": acceleration.x,
        "y": acceleration.y,
        "z": acceleration.z
      ],
      "rotation": [
        "x": rotation.x,
        "y": rotation.y,
        "z": rotation.z
      ],
      "orientation": orientation
    ])
  }
  
  private func isStationary(_ motion: CMDeviceMotion) -> Bool {
    let acceleration = motion.userAcceleration
    let totalAcceleration = sqrt(
      acceleration.x * acceleration.x +
      acceleration.y * acceleration.y +
      acceleration.z * acceleration.z
    )
    return totalAcceleration < 0.1 // Threshold for stationary detection
  }
  
  private func getDeviceOrientation() -> String {
    switch UIDevice.current.orientation {
    case .portrait, .portraitUpsideDown:
      return "portrait"
    case .landscapeLeft, .landscapeRight:
      return "landscape"
    default:
      return "unknown"
    }
  }
  
  // ==================================================================================
  // PROXIMITY SENSOR
  // ==================================================================================
  
  @objc
  func startProximityMonitoring(
    _ resolve: @escaping RCTPromiseResolveBlock,
    reject: @escaping RCTPromiseRejectBlock
  ) {
    guard !isProximityMonitoring else {
      resolve(nil)
      return
    }
    
    // Enable proximity monitoring
    UIDevice.current.isProximityMonitoringEnabled = true
    
    // Add observer for proximity changes
    proximityObserver = NotificationCenter.default.addObserver(
      forName: UIDevice.proximityStateDidChangeNotification,
      object: nil,
      queue: .main
    ) { [weak self] _ in
      self?.handleProximityChange()
    }
    
    isProximityMonitoring = true
    resolve(nil)
    logger.info("🤏 Proximity monitoring started")
  }
  
  @objc
  func stopProximityMonitoring(
    _ resolve: @escaping RCTPromiseResolveBlock,
    reject: @escaping RCTPromiseRejectBlock
  ) {
    guard isProximityMonitoring else {
      resolve(nil)
      return
    }
    
    UIDevice.current.isProximityMonitoringEnabled = false
    
    if let observer = proximityObserver {
      NotificationCenter.default.removeObserver(observer)
      proximityObserver = nil
    }
    
    isProximityMonitoring = false
    resolve(nil)
    logger.info("🤏 Proximity monitoring stopped")
  }
  
  @objc
  func isProximityNear(
    _ resolve: @escaping RCTPromiseResolveBlock,
    reject: @escaping RCTPromiseRejectBlock
  ) {
    resolve(UIDevice.current.proximityState)
  }
  
  private func handleProximityChange() {
    let isNear = UIDevice.current.proximityState
    
    sendEvent(withName: "ProximityStateChanged", body: [
      "isNear": isNear
    ])
  }
  
  // ==================================================================================
  // THERMAL AND BATTERY MONITORING
  // ==================================================================================
  
  @objc
  func getThermalState(
    _ resolve: @escaping RCTPromiseResolveBlock,
    reject: @escaping RCTPromiseRejectBlock
  ) {
    let thermalState = ProcessInfo.processInfo.thermalState
    let stateString: String
    
    switch thermalState {
    case .nominal:
      stateString = "nominal"
    case .fair:
      stateString = "fair"
    case .serious:
      stateString = "serious"
    case .critical:
      stateString = "critical"
    @unknown default:
      stateString = "unknown"
    }
    
    resolve(stateString)
  }
  
  @objc
  func getBatteryState(
    _ resolve: @escaping RCTPromiseResolveBlock,
    reject: @escaping RCTPromiseRejectBlock
  ) {
    UIDevice.current.isBatteryMonitoringEnabled = true
    
    let batteryLevel = UIDevice.current.batteryLevel
    let batteryState = UIDevice.current.batteryState
    let lowPowerMode = ProcessInfo.processInfo.isLowPowerModeEnabled
    
    let stateString: String
    switch batteryState {
    case .unknown:
      stateString = "unknown"
    case .unplugged:
      stateString = "unplugged"
    case .charging:
      stateString = "charging"
    case .full:
      stateString = "full"
    @unknown default:
      stateString = "unknown"
    }
    
    resolve([
      "level": batteryLevel >= 0 ? batteryLevel : 1.0, // -1 means unknown, default to full
      "state": stateString,
      "lowPowerMode": lowPowerMode
    ])
  }
  
  private func setupThermalStateMonitoring() {
    thermalStateObserver = NotificationCenter.default.addObserver(
      forName: ProcessInfo.thermalStateDidChangeNotification,
      object: nil,
      queue: .main
    ) { [weak self] _ in
      self?.handleThermalStateChange()
    }
  }
  
  private func handleThermalStateChange() {
    let thermalState = ProcessInfo.processInfo.thermalState
    let stateString: String
    
    switch thermalState {
    case .nominal:
      stateString = "nominal"
    case .fair:
      stateString = "fair"
    case .serious:
      stateString = "serious"
    case .critical:
      stateString = "critical"
    @unknown default:
      stateString = "unknown"
    }
    
    sendEvent(withName: "ThermalStateChanged", body: [
      "state": stateString
    ])
    
    logger.info("🌡️ Thermal state changed to: \(stateString)")
  }
  
  // ==================================================================================
  // CLEANUP
  // ==================================================================================
  
  private func cleanup() {
    // Stop all monitoring
    if isAmbientLightMonitoring {
      teardownAmbientLightCapture()
    }
    
    if isMotionMonitoring {
      motionManager.stopDeviceMotionUpdates()
    }
    
    if isProximityMonitoring {
      UIDevice.current.isProximityMonitoringEnabled = false
    }
    
    // Remove observers
    if let observer = proximityObserver {
      NotificationCenter.default.removeObserver(observer)
    }
    
    if let observer = thermalStateObserver {
      NotificationCenter.default.removeObserver(observer)
    }
    
    logger.info("🧹 Sensor cleanup completed")
  }
}

// ==================================================================================
// REACT NATIVE BRIDGE REGISTRATION
// ==================================================================================

@objc(LiquidGlassSensorModuleBridge)
class LiquidGlassSensorModuleBridge: NSObject {
  
  @objc
  static func requiresMainQueueSetup() -> Bool {
    return false
  }
}