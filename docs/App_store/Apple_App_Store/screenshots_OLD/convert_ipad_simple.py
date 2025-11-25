#!/usr/bin/env python3
"""
Convert iPad Screenshots to App Store Compliant Format
Portrait only, no landscape, no borders
"""

import os
from pathlib import Path
from PIL import Image

class iPadSimpleConverter:
    def __init__(self, input_dir, output_dir):
        self.input_dir = Path(input_dir)
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(exist_ok=True)
        
        # Apple App Store required dimensions for iPad displays (portrait only)
        self.dimensions = {
            # iPad 13" Display (Primary)
            "primary": {"width": 2064, "height": 2752, "name": "ipad_13"},
            
            # iPad 12.9" Display (Alternative)
            "alternative": {"width": 2048, "height": 2732, "name": "ipad_12"}
        }

    def get_all_screenshot_files(self):
        """Get all PNG files from the input directory"""
        png_files = list(self.input_dir.glob("*.PNG")) + list(self.input_dir.glob("*.png"))
        png_files.sort()
        return png_files

    def resize_no_borders(self, image, target_width, target_height):
        """Resize to exact dimensions without white borders"""
        original_width, original_height = image.size
        target_aspect = target_width / target_height
        original_aspect = original_width / original_height
        
        if original_aspect > target_aspect:
            # Original is wider, crop width
            new_width = int(original_height * target_aspect)
            left = (original_width - new_width) // 2
            image = image.crop((left, 0, left + new_width, original_height))
        else:
            # Original is taller, crop height
            new_height = int(original_width / target_aspect)
            top = (original_height - new_height) // 2
            image = image.crop((0, top, original_width, top + new_height))
        
        return image.resize((target_width, target_height), Image.Resampling.LANCZOS)

    def convert_single_file(self, input_file, dimension_set, index):
        """Convert a single screenshot file"""
        try:
            original = Image.open(input_file).convert('RGB')
            screenshot = self.resize_no_borders(original, dimension_set["width"], dimension_set["height"])
            
            input_name = input_file.stem
            output_name = f"appstore_{dimension_set['name']}_{index+1:02d}_{input_name}.png"
            output_path = self.output_dir / output_name
            
            screenshot.save(output_path, 'PNG', dpi=(72, 72), optimize=True)
            print(f"✅ {input_file.name} → {output_name}")
            return output_path
            
        except Exception as e:
            print(f"❌ Error: {input_file.name}: {e}")
            return None

    def convert_all_screenshots(self):
        """Convert all iPad screenshots"""
        print("🍎 Converting iPad Screenshots to App Store Compliant")
        print("=" * 55)
        
        screenshot_files = self.get_all_screenshot_files()
        
        if not screenshot_files:
            print("❌ No PNG files found!")
            return []
        
        print(f"📱 Found {len(screenshot_files)} iPad screenshots")
        print("• Portrait only, no landscape")
        print("• No white borders")
        print("• Apple compliant dimensions")
        print("=" * 55)
        
        generated_files = []
        
        for dim_name, dim_set in self.dimensions.items():
            print(f"\n📱 Creating {dim_set['width']}×{dim_set['height']} screenshots...")
            
            for i, screenshot_file in enumerate(screenshot_files):
                output_path = self.convert_single_file(screenshot_file, dim_set, i)
                if output_path:
                    generated_files.append(output_path)
        
        print("\n" + "=" * 55)
        print(f"✨ Generated {len(generated_files)} compliant screenshots!")
        print(f"📁 Output: {self.output_dir}")
        
        print(f"\n📏 Dimensions:")
        print(f"• 2064×2752 (iPad 13\" - primary)")
        print(f"• 2048×2732 (iPad 12.9\" - alternative)")
        
        print(f"\n📱 Files converted: {len(screenshot_files)}")
        for i, f in enumerate(screenshot_files):
            print(f"{i+1}. {f.name}")
        
        print(f"\n✅ Ready for App Store Connect!")
        
        return generated_files

if __name__ == "__main__":
    input_dir = "_APP_STORE/screenshots/iPad Screenshots"
    output_dir = "_APP_STORE/screenshots/ipad_compliant"
    
    converter = iPadSimpleConverter(input_dir, output_dir)
    converter.convert_all_screenshots()