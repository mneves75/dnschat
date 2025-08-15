#!/usr/bin/env python3
"""
Convert iPad Screenshots to Exact App Store Dimensions
Only resize to the specified dimensions, no other changes
"""

import os
from pathlib import Path
from PIL import Image

class iPadExactConverter:
    def __init__(self, input_dir, output_dir):
        self.input_dir = Path(input_dir)
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(exist_ok=True)
        
        # Exact App Store dimensions as specified
        self.dimensions = [
            {"width": 2064, "height": 2752, "name": "2064x2752"},
            {"width": 2752, "height": 2064, "name": "2752x2064"},
            {"width": 2048, "height": 2732, "name": "2048x2732"},
            {"width": 2732, "height": 2048, "name": "2732x2048"}
        ]

    def get_all_screenshot_files(self):
        """Get all PNG files from the input directory"""
        png_files = list(self.input_dir.glob("*.PNG")) + list(self.input_dir.glob("*.png"))
        png_files.sort()
        return png_files

    def resize_exact(self, image, target_width, target_height):
        """Resize to exact dimensions without any modifications"""
        return image.resize((target_width, target_height), Image.Resampling.LANCZOS)

    def convert_single_file(self, input_file, dimension_set, index):
        """Convert a single screenshot file to exact dimensions"""
        try:
            original = Image.open(input_file).convert('RGB')
            resized = self.resize_exact(original, dimension_set["width"], dimension_set["height"])
            
            input_name = input_file.stem
            output_name = f"appstore_{dimension_set['name']}_{index+1:02d}_{input_name}.png"
            output_path = self.output_dir / output_name
            
            resized.save(output_path, 'PNG', dpi=(72, 72), optimize=True)
            print(f"✅ {input_file.name} → {output_name}")
            return output_path
            
        except Exception as e:
            print(f"❌ Error: {input_file.name}: {e}")
            return None

    def convert_all_screenshots(self):
        """Convert all iPad screenshots to exact App Store dimensions"""
        print("🍎 Converting iPad Screenshots to Exact App Store Dimensions")
        print("=" * 60)
        
        screenshot_files = self.get_all_screenshot_files()
        
        if not screenshot_files:
            print("❌ No PNG files found!")
            return []
        
        print(f"📱 Found {len(screenshot_files)} iPad screenshots")
        print("📏 Converting to exact dimensions:")
        for dim in self.dimensions:
            print(f"  • {dim['width']} × {dim['height']}px")
        print("=" * 60)
        
        generated_files = []
        
        for dimension_set in self.dimensions:
            print(f"\n📱 Creating {dimension_set['width']}×{dimension_set['height']} screenshots...")
            
            for i, screenshot_file in enumerate(screenshot_files):
                output_path = self.convert_single_file(screenshot_file, dimension_set, i)
                if output_path:
                    generated_files.append(output_path)
        
        print("\n" + "=" * 60)
        print(f"✨ Generated {len(generated_files)} screenshots!")
        print(f"📁 Output: {self.output_dir}")
        
        print(f"\n📱 Original files converted: {len(screenshot_files)}")
        for i, f in enumerate(screenshot_files):
            print(f"{i+1}. {f.name}")
        
        print(f"\n✅ All dimensions created as specified!")
        
        return generated_files

if __name__ == "__main__":
    input_dir = "_APP_STORE/screenshots/iPad Screenshots"
    output_dir = "_APP_STORE/screenshots/ipad_exact_dimensions"
    
    converter = iPadExactConverter(input_dir, output_dir)
    converter.convert_all_screenshots()