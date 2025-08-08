require "json"

package = JSON.parse(File.read(File.join(__dir__, "../../../package.json")))

Pod::Spec.new do |s|
  s.name         = "DNSNative"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.description  = "Native DNS TXT query module for React Native"
  s.homepage     = package["homepage"]
  s.license      = package["license"]
  s.authors      = package["author"]

  s.platforms    = { :ios => "12.0" }
  s.source       = { :git => "https://github.com/mneves75/dnschat.git", :tag => "#{s.version}" }

  s.source_files = "*.{h,m,mm,swift}"
  s.requires_arc = true
  s.swift_version = "5.9"

  # Dependencies
  s.dependency "React-Core"
  
  # Network framework
  s.frameworks = "Network"
  
  # Deployment target
  s.ios.deployment_target = "12.0"
end