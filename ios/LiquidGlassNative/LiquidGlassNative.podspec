# LiquidGlassNative.podspec
# 
# CocoaPods specification for the DNSChat Liquid Glass native module.
# Provides iOS 17 UIGlassEffect integration with graceful fallbacks.

require 'json'

package = JSON.parse(File.read(File.join(__dir__, '..', '..', 'package.json')))

Pod::Spec.new do |s|
  s.name             = 'LiquidGlassNative'
  s.version          = package['version']
  s.summary          = 'iOS 17 Liquid Glass effects for React Native'
  s.description      = <<-DESC
    Native iOS module providing direct access to iOS 17's UIGlassEffect API
    for React Native applications. Includes sensor-aware environmental adaptation,
    performance monitoring, and graceful fallbacks for older iOS versions.
  DESC

  s.homepage         = package['homepage']
  s.license          = package['license']
  s.author           = package['author']
  s.source           = { :git => 'https://github.com/mneves75/dnschat.git', :tag => s.version.to_s }

  # Platform requirements - Support iOS 16+ with runtime iOS 17+ detection
  s.platform         = :ios, '16.0'
  s.swift_version    = '5.9'

  # Source files
  s.source_files     = '*.{h,m,swift}'
  s.public_header_files = '*.h'

  # React Native dependencies
  s.dependency 'React-Core'
  s.dependency 'React'

  # iOS frameworks
  s.frameworks = 'UIKit', 'Foundation', 'CoreMotion', 'QuartzCore', 'OSLog'

  # iOS 17+ conditional framework
  s.weak_frameworks = 'UIKit' # UIGlassEffect will be weak-linked

  # Build settings for framework target - iOS 16+ compatible
  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
    'OTHER_SWIFT_FLAGS' => '-Xfrontend -enable-experimental-concurrency',
    'IPHONEOS_DEPLOYMENT_TARGET' => '16.0',
    'CLANG_ENABLE_MODULES' => 'YES'
  }

  # Compiler flags for iOS 17+ features
  s.compiler_flags = '-DRCT_NEW_ARCH_ENABLED=1'

end