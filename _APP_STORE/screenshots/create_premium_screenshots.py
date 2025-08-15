#!/usr/bin/env python3
"""
Premium App Store Screenshot Generator for DNS Chat
Creates clean, professional App Store screenshots following 2024 design trends
"""

import os
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import math

# App Store screenshot dimensions (iPhone 6.7" displays)
SCREENSHOT_WIDTH = 1242
SCREENSHOT_HEIGHT = 2688

class PremiumScreenshotGenerator:
    def __init__(self, input_dir, output_dir):
        self.input_dir = Path(input_dir)
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(exist_ok=True)
        
        # Modern color palette
        self.colors = {
            "primary_blue": (0, 122, 255),
            "soft_purple": (88, 86, 214), 
            "vibrant_green": (52, 199, 89),
            "warm_orange": (255, 149, 0),
            "deep_red": (255, 59, 48),
            "background_light": (248, 248, 250),
            "background_dark": (28, 28, 30),
            "text_primary": (28, 28, 30),
            "text_secondary": (99, 99, 102)
        }
        
        # Screenshot configurations
        self.screenshots = [
            {
                "input": "IMG_8874.PNG",
                "title": "Revolutionary\nDNS Technology",
                "subtitle": "The world's first chat app using\nDNS queries instead of APIs",
                "highlight": "Chat through DNS",
                "color": self.colors["primary_blue"],
                "theme": "light"
            },
            {
                "input": "IMG_8870.PNG", 
                "title": "Real-Time DNS\nMonitoring",
                "subtitle": "Watch your messages travel through\nmultiple DNS fallback methods",
                "highlight": "Live DNS tracking",
                "color": self.colors["vibrant_green"],
                "theme": "light"
            },
            {
                "input": "IMG_8871.PNG",
                "title": "Smart Network\nOptimization", 
                "subtitle": "Automatically finds the fastest\nDNS method for your network",
                "highlight": "Auto-optimization",
                "color": self.colors["soft_purple"],
                "theme": "light"
            },
            {
                "input": "IMG_8872.PNG",
                "title": "Seamless\nExperience",
                "subtitle": "Get started instantly with\nintelligent setup and smart defaults",
                "highlight": "Zero configuration",
                "color": self.colors["warm_orange"],
                "theme": "light"
            },
            {
                "input": "IMG_8873.PNG",
                "title": "Enterprise-Grade\nFeatures",
                "subtitle": "Advanced logging, custom settings,\nand rock-solid reliability",
                "highlight": "Professional tools",
                "color": self.colors["deep_red"],
                "theme": "light"
            }
        ]

    def get_font(self, size, bold=False):
        """Get system font with fallback"""
        try:
            if bold:
                return ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", size)
            else:
                return ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", size)
        except:
            return ImageFont.load_default()

    def create_device_mockup(self, screenshot_path, scale=0.7):
        """Create a clean device mockup"""
        # Load screenshot
        screenshot = Image.open(screenshot_path).convert('RGBA')
        
        # Calculate scaled dimensions
        device_width = int(375 * scale)  # iPhone width
        device_height = int(812 * scale)  # iPhone height
        corner_radius = int(40 * scale)
        
        # Resize screenshot to device dimensions
        screenshot = screenshot.resize((device_width, device_height), Image.Resampling.LANCZOS)
        
        # Create device frame
        frame_padding = 8
        frame_width = device_width + (frame_padding * 2)
        frame_height = device_height + (frame_padding * 2)
        
        # Create frame background
        frame = Image.new('RGBA', (frame_width, frame_height), (0, 0, 0, 0))
        draw = ImageDraw.Draw(frame)
        
        # Draw device frame (subtle border)
        draw.rounded_rectangle([0, 0, frame_width-1, frame_height-1], 
                             radius=corner_radius + frame_padding, 
                             fill=(34, 34, 34, 255),
                             outline=(60, 60, 60, 255), width=2)
        
        # Create rounded corners mask for screenshot
        mask = Image.new('L', (device_width, device_height), 0)
        mask_draw = ImageDraw.Draw(mask)
        mask_draw.rounded_rectangle([0, 0, device_width, device_height], 
                                  radius=corner_radius, fill=255)
        
        # Apply mask to screenshot
        screenshot.putalpha(mask)
        
        # Paste screenshot into frame
        frame.paste(screenshot, (frame_padding, frame_padding), screenshot)
        
        # Add subtle shadow
        shadow = Image.new('RGBA', (frame_width + 40, frame_height + 40), (0, 0, 0, 0))
        shadow_draw = ImageDraw.Draw(shadow)
        shadow_draw.rounded_rectangle([20, 30, frame_width + 20, frame_height + 30],
                                    radius=corner_radius + frame_padding,
                                    fill=(0, 0, 0, 30))
        
        # Blur shadow
        shadow = shadow.filter(ImageFilter.GaussianBlur(radius=10))
        
        # Composite shadow and frame
        result = Image.new('RGBA', shadow.size, (0, 0, 0, 0))
        result = Image.alpha_composite(result, shadow)
        result.paste(frame, (20, 20), frame)
        
        return result

    def create_gradient_background(self, color, theme="light"):
        """Create a subtle gradient background"""
        bg = Image.new('RGB', (SCREENSHOT_WIDTH, SCREENSHOT_HEIGHT), 
                      self.colors["background_light"] if theme == "light" else self.colors["background_dark"])
        
        # Create subtle gradient overlay
        overlay = Image.new('RGBA', (SCREENSHOT_WIDTH, SCREENSHOT_HEIGHT), (0, 0, 0, 0))
        draw = ImageDraw.Draw(overlay)
        
        # Gradient from color to transparent
        for y in range(SCREENSHOT_HEIGHT):
            alpha = int(25 * (1 - y / SCREENSHOT_HEIGHT))  # Fade from 25 to 0
            draw.line([(0, y), (SCREENSHOT_WIDTH, y)], fill=(*color, alpha))
        
        bg = Image.alpha_composite(bg.convert('RGBA'), overlay)
        return bg.convert('RGB')

    def add_text_elements(self, img, config):
        """Add text elements to the screenshot"""
        draw = ImageDraw.Draw(img)
        
        # Text positioning
        text_x = 60
        text_start_y = 120
        
        # Colors
        text_color = self.colors["text_primary"]
        subtitle_color = self.colors["text_secondary"]
        highlight_color = config["color"]
        
        # Fonts
        title_font = self.get_font(68, bold=True)
        subtitle_font = self.get_font(32)
        highlight_font = self.get_font(24, bold=True)
        
        # Draw highlight badge
        highlight_text = config["highlight"].upper()
        highlight_bbox = draw.textbbox((0, 0), highlight_text, font=highlight_font)
        highlight_width = highlight_bbox[2] - highlight_bbox[0]
        
        badge_x = text_x
        badge_y = text_start_y
        badge_padding = 16
        
        # Badge background
        draw.rounded_rectangle([badge_x - badge_padding, badge_y - badge_padding,
                              badge_x + highlight_width + badge_padding, badge_y + 32 + badge_padding],
                             radius=20, fill=(*highlight_color, 25))
        
        # Badge text
        draw.text((badge_x, badge_y), highlight_text, fill=highlight_color, font=highlight_font)
        
        # Draw title
        title_y = badge_y + 80
        title_lines = config["title"].split('\n')
        for i, line in enumerate(title_lines):
            draw.text((text_x, title_y + i * 85), line, fill=text_color, font=title_font)
        
        # Draw subtitle
        subtitle_y = title_y + len(title_lines) * 85 + 40
        subtitle_lines = config["subtitle"].split('\n')
        for i, line in enumerate(subtitle_lines):
            draw.text((text_x, subtitle_y + i * 45), line, fill=subtitle_color, font=subtitle_font)
        
        return img

    def generate_screenshot(self, config, index):
        """Generate a single premium screenshot"""
        input_path = self.input_dir / config["input"]
        if not input_path.exists():
            print(f"Warning: Input file not found: {input_path}")
            return
        
        # Create background
        background = self.create_gradient_background(config["color"], config["theme"])
        
        # Create device mockup
        device_mockup = self.create_device_mockup(input_path)
        
        # Position device mockup (right side, centered)
        device_x = SCREENSHOT_WIDTH - device_mockup.width - 80
        device_y = (SCREENSHOT_HEIGHT - device_mockup.height) // 2
        
        # Composite device onto background
        background = background.convert('RGBA')
        background.paste(device_mockup, (device_x, device_y), device_mockup)
        
        # Add text elements
        final_image = self.add_text_elements(background, config)
        
        # Save
        output_name = f"premium_screenshot_{index+1}.png"
        output_path = self.output_dir / output_name
        final_image.convert('RGB').save(output_path, 'PNG', quality=95, optimize=True)
        
        print(f"✅ Generated: {output_name}")
        return output_path

    def generate_all_screenshots(self):
        """Generate all premium screenshots"""
        print("🎨 Generating premium App Store screenshots...")
        print("=" * 50)
        
        generated_files = []
        for i, config in enumerate(self.screenshots):
            output_path = self.generate_screenshot(config, i)
            if output_path:
                generated_files.append(output_path)
        
        print("=" * 50)
        print(f"✨ Successfully generated {len(generated_files)} premium screenshots!")
        print(f"📁 Output directory: {self.output_dir}")
        
        print("\n📱 App Store Screenshots:")
        for i, config in enumerate(self.screenshots):
            print(f"{i+1}. {config['title'].replace(chr(10), ' ')} - {config['highlight']}")
        
        return generated_files

if __name__ == "__main__":
    input_dir = "_APP_STORE/screenshots/iPhone Screenshots"
    output_dir = "_APP_STORE/screenshots/premium"
    
    generator = PremiumScreenshotGenerator(input_dir, output_dir)
    generator.generate_all_screenshots()