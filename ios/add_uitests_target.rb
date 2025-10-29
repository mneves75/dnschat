#!/usr/bin/env ruby
# Script to add DNSChatUITests target to Xcode project
require 'xcodeproj'

project_path = 'DNSChat.xcodeproj'
project = Xcodeproj::Project.open(project_path)

# Find the main app target
main_target = project.targets.find { |t| t.name == 'DNSChat' }
unless main_target
  puts "Error: Could not find DNSChat target"
  exit 1
end

# Check if UITests target already exists
existing_target = project.targets.find { |t| t.name == 'DNSChatUITests' }
if existing_target
  puts "DNSChatUITests target already exists"
  exit 0
end

# Create UITests target
ui_tests_target = project.new_target(:ui_test_bundle, 'DNSChatUITests', :ios, '16.0')

# Set the product name
ui_tests_target.product_name = 'DNSChatUITests'

# Set build settings
ui_tests_target.build_configurations.each do |config|
  config.build_settings['PRODUCT_BUNDLE_IDENTIFIER'] = 'org.mvneves.dnschat.DNSChatUITests'
  config.build_settings['CODE_SIGN_STYLE'] = 'Automatic'
  config.build_settings['CURRENT_PROJECT_VERSION'] = '1'
  config.build_settings['GENERATE_INFOPLIST_FILE'] = 'NO'
  config.build_settings['INFOPLIST_FILE'] = 'DNSChatUITests/Info.plist'
  config.build_settings['MARKETING_VERSION'] = '1.0'
  config.build_settings['SWIFT_EMIT_LOC_STRINGS'] = 'NO'
  config.build_settings['SWIFT_VERSION'] = '5.0'
  config.build_settings['TARGETED_DEVICE_FAMILY'] = '1,2'
  config.build_settings['TEST_TARGET_NAME'] = 'DNSChat'
  config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = '16.0'
end

# Add the test files to the project
ui_tests_group = project.main_group.find_subpath('DNSChatUITests', true)
ui_tests_group.set_source_tree('SOURCE_ROOT')

# Add test files
test_file = ui_tests_group.new_file('DNSChatUITests/DNSChatUITests.swift')
info_plist = ui_tests_group.new_file('DNSChatUITests/Info.plist')

# Add the .swift file to the target's build phases
ui_tests_target.source_build_phase.add_file_reference(test_file)

# Create a dependency on the main target
ui_tests_target.add_dependency(main_target)

# Save the project
project.save

puts "Successfully added DNSChatUITests target to #{project_path}"
puts "Next steps:"
puts "1. Open #{project_path} in Xcode"
puts "2. Select the DNSChat scheme"
puts "3. Edit scheme -> Test -> Add DNSChatUITests"
puts "4. Run: fastlane snapshot"
