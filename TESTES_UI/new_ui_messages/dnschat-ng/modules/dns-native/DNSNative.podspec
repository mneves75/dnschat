require "json"

# Read package.json from current directory
package_json_path = File.join(__dir__, "package.json")
package = JSON.parse(File.read(package_json_path))

Pod::Spec.new do |s|
  s.name         = "DNSNative"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.description  = "Native DNS TXT query module for React Native"
  s.homepage     = package["homepage"]
  s.license      = package["license"]
  s.authors      = package["author"]

  s.platforms    = { :ios => "16.0" }
  s.source       = { :git => "https://github.com/mneves75/dnschat.git", :tag => "#{s.version}" }

  s.source_files = "ios/*.{h,m,mm,swift}"
  s.requires_arc = true
  s.swift_version = "5.9"

  # Dependencies
  s.dependency "React-Core"

  # Network framework
  s.frameworks = "Network"

  # Deployment target aligned with modern iOS (16.0+)
  s.ios.deployment_target = "16.0"
end
