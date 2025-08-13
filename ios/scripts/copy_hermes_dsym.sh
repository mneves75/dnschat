#!/bin/bash

# Copy Hermes dSYM files to the build products directory
# This script ensures that Hermes debug symbols are included in the archive for App Store Connect

set -e

echo "🔧 Starting Hermes dSYM copy script..."

# Check if this is a Release build
if [[ "${CONFIGURATION}" == "Release" ]]; then
    echo "✅ Release build detected, copying Hermes dSYM files..."
    
    # Define source paths for Hermes dSYM files
    HERMES_FRAMEWORK_PATH="${PODS_ROOT}/hermes-engine/destroot/Library/Frameworks/universal/hermes.xcframework"
    
    # Find all dSYM files in the Hermes framework
    if [[ -d "${HERMES_FRAMEWORK_PATH}" ]]; then
        echo "🔍 Searching for Hermes dSYM files in: ${HERMES_FRAMEWORK_PATH}"
        
        # Find and copy dSYM files for the current architecture
        find "${HERMES_FRAMEWORK_PATH}" -name "*.dSYM" -type d | while read -r dsym_path; do
            dsym_name=$(basename "${dsym_path}")
            target_path="${BUILT_PRODUCTS_DIR}/${dsym_name}"
            
            echo "📦 Copying ${dsym_name} to ${target_path}"
            
            if [[ -d "${dsym_path}" ]]; then
                # Remove existing dSYM if it exists
                if [[ -d "${target_path}" ]]; then
                    rm -rf "${target_path}"
                fi
                
                # Copy the dSYM
                cp -R "${dsym_path}" "${target_path}"
                echo "✅ Successfully copied ${dsym_name}"
            else
                echo "⚠️ Warning: dSYM path does not exist: ${dsym_path}"
            fi
        done
        
        # Also check for embedded dSYM files in the xcframework
        echo "🔍 Checking for embedded dSYM files in architecture-specific folders..."
        
        # For iOS arm64 (device)
        IOS_ARM64_PATH="${HERMES_FRAMEWORK_PATH}/ios-arm64/hermes.framework.dSYM"
        if [[ -d "${IOS_ARM64_PATH}" ]]; then
            target_path="${BUILT_PRODUCTS_DIR}/hermes.framework.dSYM"
            echo "📦 Copying iOS ARM64 Hermes dSYM to ${target_path}"
            
            if [[ -d "${target_path}" ]]; then
                rm -rf "${target_path}"
            fi
            
            cp -R "${IOS_ARM64_PATH}" "${target_path}"
            echo "✅ Successfully copied iOS ARM64 Hermes dSYM"
        fi
        
        # For iOS simulator x86_64/arm64
        IOS_SIM_PATH="${HERMES_FRAMEWORK_PATH}/ios-arm64_x86_64-simulator/hermes.framework.dSYM"
        if [[ -d "${IOS_SIM_PATH}" && "${EFFECTIVE_PLATFORM_NAME}" == "-iphonesimulator" ]]; then
            target_path="${BUILT_PRODUCTS_DIR}/hermes.framework.dSYM"
            echo "📦 Copying iOS Simulator Hermes dSYM to ${target_path}"
            
            if [[ -d "${target_path}" ]]; then
                rm -rf "${target_path}"
            fi
            
            cp -R "${IOS_SIM_PATH}" "${target_path}"
            echo "✅ Successfully copied iOS Simulator Hermes dSYM"
        fi
        
    else
        echo "❌ Error: Hermes framework path not found: ${HERMES_FRAMEWORK_PATH}"
        echo "🔍 Checking alternative locations..."
        
        # Check in Pods build directory
        PODS_BUILD_HERMES="${PODS_CONFIGURATION_BUILD_DIR}/hermes-engine"
        if [[ -d "${PODS_BUILD_HERMES}" ]]; then
            echo "🔍 Found Hermes in Pods build directory: ${PODS_BUILD_HERMES}"
            find "${PODS_BUILD_HERMES}" -name "*.dSYM" -type d | while read -r dsym_path; do
                dsym_name=$(basename "${dsym_path}")
                target_path="${BUILT_PRODUCTS_DIR}/${dsym_name}"
                
                echo "📦 Copying ${dsym_name} from Pods build to ${target_path}"
                
                if [[ -d "${target_path}" ]]; then
                    rm -rf "${target_path}"
                fi
                
                cp -R "${dsym_path}" "${target_path}"
                echo "✅ Successfully copied ${dsym_name}"
            done
        fi
    fi
    
    echo "🎉 Hermes dSYM copy script completed!"
    
else
    echo "ℹ️ Debug build detected, skipping Hermes dSYM copy"
fi

echo "✅ Hermes dSYM copy script finished"