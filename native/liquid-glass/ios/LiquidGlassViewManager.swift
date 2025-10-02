import Foundation
import UIKit

class LGContainerView: UIView {
  private let effectView = UIVisualEffectView(effect: UIBlurEffect(style: .systemMaterial))
  @objc var variant: NSString = "regular" { didSet { applyVariant() } }
  @objc var shape: NSString = "capsule" { didSet { setNeedsLayout() } }
  @objc var cornerRadius: NSNumber = 12 { didSet { setNeedsLayout() } }
  @objc var tintColor: NSString = "" { didSet { applyTint() } }
  @objc var isInteractive: Bool = false
  @objc var sensorAware: Bool = false
  @objc var enableContainer: Bool = true
  @objc var containerSpacing: NSNumber = 40

  override init(frame: CGRect) {
    super.init(frame: frame)
    backgroundColor = .clear
    addSubview(effectView)
    effectView.frame = bounds
    effectView.autoresizingMask = [.flexibleWidth, .flexibleHeight]
    layer.masksToBounds = true
    applyVariant(); applyTint()
  }

  required init?(coder: NSCoder) { fatalError("init(coder:) has not been implemented") }

  private func applyVariant() {
    let style: UIBlurEffect.Style
    switch String(variant) {
    case "prominent": style = .systemChromeMaterial
    case "interactive": style = .systemMaterial
    default: style = .systemThinMaterial
    }
    effectView.effect = UIBlurEffect(style: style)
  }

  private func applyTint() {
    let hex = String(tintColor)
    guard hex.count >= 6 else { effectView.backgroundColor = .clear; return }
    effectView.backgroundColor = Self.color(fromHex: hex).withAlphaComponent(0.08)
  }

  override func layoutSubviews() {
    super.layoutSubviews()
    switch String(shape) {
    case "capsule": layer.cornerRadius = min(bounds.width, bounds.height) / 2
    case "roundedRect": layer.cornerRadius = CGFloat(truncating: cornerRadius)
    default: layer.cornerRadius = 0
    }
  }

  static func color(fromHex hex: String) -> UIColor {
    var h = hex.replacingOccurrences(of: "#", with: "")
    if h.count == 6 { h += "FF" }
    var rgba: UInt64 = 0; Scanner(string: h).scanHexInt64(&rgba)
    let r = CGFloat((rgba >> 24) & 0xFF)/255.0
    let g = CGFloat((rgba >> 16) & 0xFF)/255.0
    let b = CGFloat((rgba >> 8) & 0xFF)/255.0
    let a = CGFloat(rgba & 0xFF)/255.0
    return UIColor(red: r, green: g, blue: b, alpha: a)
  }
}

@objc(LiquidGlassViewManager)
class LiquidGlassViewManager: RCTViewManager {
  override static func requiresMainQueueSetup() -> Bool { true }
  override func view() -> UIView! {
    if #available(iOS 17.0, *) {
      // TODO: Integrate with official Liquid Glass APIs when available
      return LGContainerView()
    } else {
      return LGContainerView()
    }
  }
}

