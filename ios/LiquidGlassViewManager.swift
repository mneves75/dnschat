import Foundation
import UIKit

class LiquidGlassContainerView: UIView {
  private var effectView: UIVisualEffectView? = nil
  private var contentView: UIView!
  private var isUsingNativeGlass: Bool = false
  private let overlayView = UIView()
  private var feedback: UISelectionFeedbackGenerator? = nil
  
  @objc var variant: NSString = "regular" { didSet { applyVariant() } }
  @objc var shape: NSString = "capsule" { didSet { applyShape() } }
  @objc var cornerRadius: NSNumber = 12 { didSet { applyShape() } }
  @objc var tintColor: NSString = "" { didSet { applyTint() } }
  @objc var isInteractive: Bool = false
  @objc var sensorAware: Bool = false
  @objc var enableContainer: Bool = true
  @objc var containerSpacing: NSNumber = 40

  override init(frame: CGRect) {
    super.init(frame: frame)
    self.backgroundColor = .clear

    if #available(iOS 26.0, *) {
      // Prefer official iOS 26 glass effect when available
      let initial = Self.mapVariantToGlassStyle(String(variant))
      let vev = UIVisualEffectView(effect: UIGlassEffect(style: initial))
      self.effectView = vev
      self.contentView = vev
      self.isUsingNativeGlass = true
    } else if let glass = Self.makeNativeGlassViewIfAvailable() {
      // Dynamic fallback
      isUsingNativeGlass = true
      contentView = glass
    } else {
      let blur = UIVisualEffectView(effect: UIBlurEffect(style: .systemMaterial))
      self.effectView = blur
      contentView = blur
    }

    contentView.frame = self.bounds
    contentView.autoresizingMask = [.flexibleWidth, .flexibleHeight]
    self.addSubview(contentView)

    // Optional background extension effect on iOS 26 when enabled
    if #available(iOS 26.0, *), enableContainer {
      if let bgeClass = NSClassFromString("UIBackgroundExtensionView") as? UIView.Type {
        let bgExt = bgeClass.init(frame: self.bounds)
        bgExt.autoresizingMask = [.flexibleWidth, .flexibleHeight]
        self.insertSubview(bgExt, belowSubview: contentView)
      }
    }
    overlayView.backgroundColor = .clear
    overlayView.isUserInteractionEnabled = false
    overlayView.frame = self.bounds
    overlayView.autoresizingMask = [.flexibleWidth, .flexibleHeight]
    self.addSubview(overlayView)
    self.layer.masksToBounds = true
    applyVariant()
    applyShape()
    applyTint()
  }

  required init?(coder: NSCoder) { fatalError("init(coder:) has not been implemented") }

  private func applyVariant() {
    if #available(iOS 26.0, *), isUsingNativeGlass, let blur = effectView {
      let style = Self.mapVariantToGlassStyle(String(variant))
      blur.effect = UIGlassEffect(style: style)
      return
    }

    if isUsingNativeGlass {
      // Dynamic configuration via KVC if a native glass view exists
      let v = String(variant)
      contentView.setValue(v, forKey: "style")
    }

    if let blur = effectView {
      let style: UIBlurEffect.Style
      switch String(variant) {
      case "prominent": style = .systemChromeMaterial
      case "interactive": style = .systemMaterial
      default: style = .systemThinMaterial
      }
      blur.effect = UIBlurEffect(style: style)
    }
  }

  private func applyShape() {
    let shapeStr = String(shape)
    switch shapeStr {
    case "capsule":
      self.layer.cornerRadius = min(self.bounds.height, self.bounds.width) / 2
    case "roundedRect":
      self.layer.cornerRadius = CGFloat(truncating: cornerRadius)
    default:
      self.layer.cornerRadius = 0
    }
  }

  private func applyTint() {
    let hex = String(tintColor)
    guard hex.count >= 6 else { return }
    let c = Self.color(fromHex: hex)
    // Subtle tint overlay
    overlayView.backgroundColor = c.withAlphaComponent(0.08)
  }

  override func layoutSubviews() {
    super.layoutSubviews()
    applyShape()
  }

  override func didMoveToWindow() {
    super.didMoveToWindow()
    if isInteractive {
      enableHaptics()
      addInteractionGestures()
    }
  }

  private func enableHaptics() {
    feedback = UISelectionFeedbackGenerator()
    feedback?.prepare()
  }

  private func addInteractionGestures() {
    let tap = UILongPressGestureRecognizer(target: self, action: #selector(handlePress(_:)))
    tap.minimumPressDuration = 0
    tap.cancelsTouchesInView = false
    self.addGestureRecognizer(tap)
  }

  @objc private func handlePress(_ gr: UILongPressGestureRecognizer) {
    switch gr.state {
    case .began:
      feedback?.selectionChanged()
      animateOverlay(alpha: 0.16)
    case .changed:
      break
    default:
      animateOverlay(alpha: 0.08)
    }
  }

  private func animateOverlay(alpha: CGFloat) {
    UIView.animate(withDuration: 0.18, delay: 0, options: [.curveEaseInOut]) {
      self.overlayView.alpha = alpha
    }
  }

  // MARK: - iOS 26 Glass Integration (Dynamic)
  private static func makeNativeGlassViewIfAvailable() -> UIView? {
    if #available(iOS 26.0, *) {
      let candidates = ["UIGlassEffectView", "UIGlassView", "_UIGlassEffectView"]
      for name in candidates {
        if let cls = NSClassFromString(name) as? UIView.Type {
          return cls.init(frame: .zero)
        }
      }
    }
    return nil
  }

  @available(iOS 26.0, *)
  private static func mapVariantToGlassStyle(_ v: String) -> UIGlassEffect.Style {
    switch v {
    case "prominent": return .prominent
    case "interactive": return .interactive
    default: return .systemMaterial
    }
  }

  static func color(fromHex hex: String) -> UIColor {
    var h = hex.trimmingCharacters(in: .whitespacesAndNewlines).replacingOccurrences(of: "#", with: "")
    if h.count == 6 { h.append("FF") }
    var rgba: UInt64 = 0
    Scanner(string: h).scanHexInt64(&rgba)
    let r = CGFloat((rgba >> 24) & 0xFF) / 255.0
    let g = CGFloat((rgba >> 16) & 0xFF) / 255.0
    let b = CGFloat((rgba >> 8) & 0xFF) / 255.0
    let a = CGFloat(rgba & 0xFF) / 255.0
    return UIColor(red: r, green: g, blue: b, alpha: a)
  }
}

@objc(LiquidGlassViewManager)
class LiquidGlassViewManager: RCTViewManager {
  override static func requiresMainQueueSetup() -> Bool { true }
  override func view() -> UIView! {
    if #available(iOS 26.0, *) {
      // Placeholder for iOS 26 native Liquid Glass integration
      // Use existing container until official APIs are wired
      return LiquidGlassContainerView()
    } else {
      return LiquidGlassContainerView()
    }
  }
}
