#!/usr/bin/env python3
"""
Apple App Store Compliant Screenshot Generator for DNS Chat
Creates screenshots following strict Apple App Store guidelines for iPhone 6.9" displays
"""

import os
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import math

class AppStoreCompliantGenerator:
    def __init__(self, input_dir, output_dir):
        self.input_dir = Path(input_dir)
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(exist_ok=True)
        
        # Apple App Store required dimensions for iPhone 6.9" displays
        self.dimensions = {
            "primary": {"width": 1290, "height": 2796, "name": "6.9_primary"},
            "alternative": {"width": 1320, "height": 2868, "name": "6.9_alternative"}
        }
        
        # Screenshot selection and order (most important first for App Store)
        self.screenshots = [
            {
                "input": "IMG_8874.PNG",  # Chat interface - Hero shot
                "title": "AI Chat via DNS",
                "description": "Revolutionary chat app using DNS queries"
            },
            {
                "input": "IMG_8870.PNG",  # DNS in action
                "title": "DNS Magic in Action", 
                "description": "Real-time DNS fallback monitoring"
            },
            {
                "input": "IMG_8871.PNG",  # Network optimization
                "title": "Network Optimization",
                "description": "Smart DNS method detection"
            },
            {
                "input": "IMG_8872.PNG",  # First chat experience
                "title": "Seamless Experience",
                "description": "Instant setup and chat"
            },
            {
                "input": "IMG_8873.PNG",  # Features overview
                "title": "Powerful Features",
                "description": "Advanced DNS query logging"
            }
        ]

    def resize_and_fit_screenshot(self, image, target_width, target_height):
        """
        Resize screenshot to fit Apple's exact dimensions while maintaining aspect ratio
        and ensuring the entire interface is visible (letterboxing if needed)
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
        """
        Create a clean, App Store compliant screenshot showing only the app interface
        """
        # Load original screenshot
        original = Image.open(input_path).convert('RGB')
        
        # Resize and fit to Apple's exact requirements
        compliant_screenshot = self.resize_and_fit_screenshot(original, target_width, target_height)
        
        return compliant_screenshot

    def generate_compliant_screenshot(self, config, dimension_set, index):
        """Generate a single App Store compliant screenshot"""
        input_path = self.input_dir / config["input"]
        if not input_path.exists():
            print(f"Warning: Input file not found: {input_path}")
            return None
        
        # Create clean screenshot following Apple guidelines
        screenshot = self.create_clean_screenshot(
            input_path, 
            dimension_set["width"], 
            dimension_set["height"]
        )
        
        # Save with Apple-compliant naming
        output_name = f"appstore_{dimension_set['name']}_{index+1:02d}.png"
        output_path = self.output_dir / output_name
        
        # Save with Apple requirements: PNG, 72 DPI, no transparency
        screenshot.save(output_path, 'PNG', dpi=(72, 72), optimize=True)
        
        print(f"✅ Generated: {output_name} ({dimension_set['width']}×{dimension_set['height']})")
        return output_path

    def generate_all_screenshots(self):
        """Generate all App Store compliant screenshots"""
        print("🍎 Generating Apple App Store Compliant Screenshots")
        print("=" * 60)
        print("Following strict Apple guidelines:")
        print("• PNG format, 72 DPI, no transparency")
        print("• Actual app interface only (no promotional overlays)")
        print("• Exact Apple specified dimensions")
        print("• Optimized for iPhone 6.9\" displays")
        print("=" * 60)
        
        generated_files = []
        
        # Generate screenshots for each dimension set
        for dim_name, dim_set in self.dimensions.items():
            print(f"\n📱 Creating {dim_set['width']}×{dim_set['height']} screenshots...")
            
            for i, config in enumerate(self.screenshots):
                output_path = self.generate_compliant_screenshot(config, dim_set, i)
                if output_path:
                    generated_files.append(output_path)
        
        print("\n" + "=" * 60)
        print(f"✨ Successfully generated {len(generated_files)} App Store compliant screenshots!")
        print(f"📁 Output directory: {self.output_dir}")
        
        print("\n📋 App Store Submission Order:")
        for i, config in enumerate(self.screenshots):
            print(f"{i+1}. {config['title']} - {config['description']}")
        
        print(f"\n📏 Dimensions Generated:")
        for dim_name, dim_set in self.dimensions.items():
            print(f"• {dim_set['width']}×{dim_set['height']} ({dim_name})")
        
        print(f"\n✅ Ready for App Store Connect upload!")
        print("💡 Use the primary 1290×2796 screenshots for your main submission")
        
        return generated_files

    def create_landscape_versions(self):
        """Create landscape versions if needed (optional)"""
        print("\n🔄 Creating landscape versions...")
        
        landscape_generated = []
        for dim_name, dim_set in self.dimensions.items():
            # Swap width and height for landscape
            landscape_width = dim_set["height"]
            landscape_height = dim_set["width"]
            
            print(f"\n📱 Creating {landscape_width}×{landscape_height} landscape screenshots...")
            
            for i, config in enumerate(self.screenshots):
                input_path = self.input_dir / config["input"]
                if not input_path.exists():
                    continue
                
                # Create landscape screenshot
                screenshot = self.create_clean_screenshot(
                    input_path, landscape_width, landscape_height
                )
                
                # Save landscape version
                output_name = f"appstore_{dim_set['name']}_landscape_{i+1:02d}.png"
                output_path = self.output_dir / output_name
                screenshot.save(output_path, 'PNG', dpi=(72, 72), optimize=True)
                
                print(f"✅ Generated: {output_name} ({landscape_width}×{landscape_height})")
                landscape_generated.append(output_path)
        
        return landscape_generated

if __name__ == "__main__":
    input_dir = "_APP_STORE/screenshots/iPhone Screenshots"
    output_dir = "_APP_STORE/screenshots/appstore_compliant"
    
    generator = AppStoreCompliantGenerator(input_dir, output_dir)
    
    # Generate portrait screenshots (required)
    portrait_files = generator.generate_all_screenshots()
    
    # Generate landscape screenshots (optional)
    landscape_files = generator.create_landscape_versions()
    
    print(f"\n🎯 Total files generated: {len(portrait_files + landscape_files)}")
    print("🚀 Ready for App Store Connect submission!")