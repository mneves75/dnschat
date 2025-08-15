#!/usr/bin/env python3
"""
Convert All Original Screenshots to Apple App Store Compliant Format
Processes all screenshots in the iPhone Screenshots folder
"""

import os
from pathlib import Path
from PIL import Image

class AllOriginalsConverter:
    def __init__(self, input_dir, output_dir):
        self.input_dir = Path(input_dir)
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(exist_ok=True)
        
        # Apple App Store required dimensions for iPhone 6.9" displays (portrait only)
        self.dimensions = {
            "primary": {"width": 1290, "height": 2796, "name": "6.9_primary"},
            "alternative": {"width": 1320, "height": 2868, "name": "6.9_alternative"}
        }

    def get_all_screenshot_files(self):
        """Get all PNG files from the input directory"""
        png_files = list(self.input_dir.glob("*.PNG")) + list(self.input_dir.glob("*.png"))
        png_files.sort()  # Sort for consistent ordering
        return png_files

    def resize_and_fit_screenshot(self, image, target_width, target_height):
        """
        Resize screenshot to fit Apple's exact dimensions while maintaining aspect ratio
        """
        original_width, original_height = image.size
        
        # Calculate scaling to fit within target dimensions
        scale_width = target_width / original_width
        scale_height = target_height / original_height
        scale = min(scale_width, scale_height)  # Use smaller scale to fit entirely
        
        # Calculate new dimensions
        new_width = int(original_width * scale)
        new_height = int(original_height * scale)
        
        # Resize the image
        resized = image.resize((new_width, new_height), Image.Resampling.LANCZOS)
        
        # Create target canvas with white background (Apple requirement)
        canvas = Image.new('RGB', (target_width, target_height), (255, 255, 255))
        
        # Center the resized image on the canvas
        x_offset = (target_width - new_width) // 2
        y_offset = (target_height - new_height) // 2
        
        canvas.paste(resized, (x_offset, y_offset))
        
        return canvas

    def create_clean_screenshot(self, input_path, target_width, target_height):
        """Create a clean, App Store compliant screenshot"""
        # Load original screenshot
        original = Image.open(input_path).convert('RGB')
        
        # Resize and fit to Apple's exact requirements
        compliant_screenshot = self.resize_and_fit_screenshot(original, target_width, target_height)
        
        return compliant_screenshot

    def convert_single_file(self, input_file, dimension_set, index):
        """Convert a single screenshot file to App Store compliant format"""
        try:
            # Create clean screenshot
            screenshot = self.create_clean_screenshot(
                input_file, 
                dimension_set["width"], 
                dimension_set["height"]
            )
            
            # Generate output filename based on input filename
            input_name = input_file.stem  # Get filename without extension
            output_name = f"appstore_{dimension_set['name']}_{index+1:02d}_{input_name}.png"
            output_path = self.output_dir / output_name
            
            # Save with Apple requirements: PNG, 72 DPI, no transparency
            screenshot.save(output_path, 'PNG', dpi=(72, 72), optimize=True)
            
            print(f"✅ Converted: {input_file.name} → {output_name}")
            return output_path
            
        except Exception as e:
            print(f"❌ Error converting {input_file.name}: {e}")
            return None

    def convert_all_screenshots(self):
        """Convert all original screenshots to App Store compliant format"""
        print("🍎 Converting All Original Screenshots to App Store Compliant Format")
        print("=" * 70)
        
        # Get all PNG files
        screenshot_files = self.get_all_screenshot_files()
        
        if not screenshot_files:
            print("❌ No PNG files found in the input directory!")
            return []
        
        print(f"📱 Found {len(screenshot_files)} original screenshots to convert")
        print("Following strict Apple guidelines:")
        print("• PNG format, 72 DPI, no transparency")
        print("• Actual app interface only (no promotional overlays)")  
        print("• Portrait orientation only")
        print("• Exact Apple specified dimensions")
        print("=" * 70)
        
        generated_files = []
        
        # Convert screenshots for each dimension set
        for dim_name, dim_set in self.dimensions.items():
            print(f"\n📱 Creating {dim_set['width']}×{dim_set['height']} screenshots...")
            
            for i, screenshot_file in enumerate(screenshot_files):
                output_path = self.convert_single_file(screenshot_file, dim_set, i)
                if output_path:
                    generated_files.append(output_path)
        
        print("\n" + "=" * 70)
        print(f"✨ Successfully converted {len(generated_files)} App Store compliant screenshots!")
        print(f"📁 Output directory: {self.output_dir}")
        
        print(f"\n📏 Dimensions Generated:")
        for dim_name, dim_set in self.dimensions.items():
            print(f"• {dim_set['width']}×{dim_set['height']} ({dim_name})")
            print(f"  - {len(screenshot_files)} screenshots converted")
        
        print(f"\n📱 Original Files Converted:")
        for i, screenshot_file in enumerate(screenshot_files):
            print(f"{i+1:2d}. {screenshot_file.name}")
        
        print(f"\n✅ Ready for App Store Connect upload!")
        print("💡 Use the primary 1290×2796 screenshots for your main submission")
        
        return generated_files

if __name__ == "__main__":
    input_dir = "_APP_STORE/screenshots/iPhone Screenshots"
    output_dir = "_APP_STORE/screenshots/appstore_all_compliant"
    
    converter = AllOriginalsConverter(input_dir, output_dir)
    converted_files = converter.convert_all_screenshots()
    
    print(f"\n🎯 Total files generated: {len(converted_files)}")
    print("🚀 All original screenshots are now App Store Connect ready!")