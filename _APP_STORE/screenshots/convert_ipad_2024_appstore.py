#!/usr/bin/env python3
"""
iPad App Store Screenshot Converter for DNS Chat (2024 Specifications)
Converts iPad screenshots to 2024 App Store-compliant dimensions (2752×2064px - 13" iPad)
"""

import os
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import math

# 2024 iPad App Store screenshot dimensions (iPad 13" - iPad Pro M4)
SCREENSHOT_WIDTH = 2752
SCREENSHOT_HEIGHT = 2064

class iPad2024ScreenshotConverter:
    def __init__(self, input_dir, output_dir):
        self.input_dir = Path(input_dir)
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(exist_ok=True)
        
        # Modern color palette (consistent with existing designs)
        self.colors = {
            "primary_blue": (0, 122, 255),
            "soft_purple": (88, 86, 214), 
            "vibrant_green": (52, 199, 89),
            "warm_orange": (255, 149, 0),
            "deep_red": (255, 59, 48),
            "gradient_blue": (64, 156, 255),
            "background_light": (248, 248, 250),
            "background_dark": (28, 28, 30),
            "text_primary": (28, 28, 30),
            "text_secondary": (99, 99, 102)
        }
        
        # Screenshot configurations optimized for iPad presentations
        self.screenshot_configs = [
            {
                "title": "DNS Chat\nfor iPad",
                "subtitle": "Revolutionary DNS-based chat technology\noptimized for the large iPad display",
                "highlight": "Professional iPad Experience",
                "color": self.colors["primary_blue"],
                "theme": "light"
            },
            {
                "title": "Real-Time DNS\nDashboard",
                "subtitle": "Comprehensive network monitoring\nwith detailed logs and analytics",
                "highlight": "Advanced Monitoring",
                "color": self.colors["vibrant_green"],
                "theme": "light"
            },
            {
                "title": "Intelligent Network\nOptimization", 
                "subtitle": "Smart fallback systems that adapt\nto any network configuration",
                "highlight": "Enterprise-Grade",
                "color": self.colors["soft_purple"],
                "theme": "light"
            },
            {
                "title": "Seamless\nMultitasking",
                "subtitle": "Take advantage of iPad's large screen\nfor productive conversations",
                "highlight": "iPad Optimized",
                "color": self.colors["warm_orange"],
                "theme": "light"
            },
            {
                "title": "Professional\nLogging",
                "subtitle": "Detailed DNS query analytics\nwith export capabilities",
                "highlight": "Developer Tools",
                "color": self.colors["deep_red"],
                "theme": "light"
            },
            {
                "title": "Privacy &\nSecurity",
                "subtitle": "DNS-over-HTTPS with advanced\nsecurity configurations",
                "highlight": "Enterprise Security",
                "color": self.colors["gradient_blue"],
                "theme": "light"
            },
            {
                "title": "Universal\nCompatibility",
                "subtitle": "Seamless sync across iPad,\niPhone, and macOS devices",
                "highlight": "Cross-Platform",
                "color": self.colors["vibrant_green"],
                "theme": "light"
            },
            {
                "title": "Innovation\nLeadership",
                "subtitle": "First-of-its-kind DNS chat\ntechnology for professionals",
                "highlight": "Cutting Edge",
                "color": self.colors["soft_purple"],
                "theme": "light"
            }
        ]

    def get_font(self, size, bold=False):
        """Get system font with fallback"""
        try:
            font_path = "/System/Library/Fonts/Helvetica.ttc"
            return ImageFont.truetype(font_path, size)
        except:
            return ImageFont.load_default()

    def create_ipad_mockup(self, screenshot_path, scale=0.8):
        """Create a professional iPad mockup with accurate proportions"""
        # Load screenshot
        screenshot = Image.open(screenshot_path).convert('RGBA')
        
        # iPad dimensions for mockup (landscape orientation)
        device_width = int(1024 * scale)   # iPad standard width in landscape
        device_height = int(768 * scale)   # iPad standard height in landscape
        corner_radius = int(20 * scale)    # iPad has less rounded corners than iPhone
        
        # Resize screenshot to device dimensions
        screenshot = screenshot.resize((device_width, device_height), Image.Resampling.LANCZOS)
        
        # Create device frame
        frame_padding = 8
        frame_width = device_width + (frame_padding * 2)
        frame_height = device_height + (frame_padding * 2)
        
        # Create frame background
        frame = Image.new('RGBA', (frame_width, frame_height), (0, 0, 0, 0))
        draw = ImageDraw.Draw(frame)
        
        # Draw device frame (elegant iPad styling)
        draw.rounded_rectangle([0, 0, frame_width-1, frame_height-1], 
                             radius=corner_radius + frame_padding, 
                             fill=(50, 50, 50, 255),
                             outline=(120, 120, 120, 255), width=2)
        
        # Create rounded corners mask for screenshot
        mask = Image.new('L', (device_width, device_height), 0)
        mask_draw = ImageDraw.Draw(mask)
        mask_draw.rounded_rectangle([0, 0, device_width, device_height], 
                                  radius=corner_radius, fill=255)
        
        # Apply mask to screenshot
        screenshot.putalpha(mask)
        
        # Paste screenshot into frame
        frame.paste(screenshot, (frame_padding, frame_padding), screenshot)
        
        # Add sophisticated shadow
        shadow_offset = 30
        shadow = Image.new('RGBA', (frame_width + shadow_offset*2, frame_height + shadow_offset*2), (0, 0, 0, 0))
        shadow_draw = ImageDraw.Draw(shadow)
        shadow_draw.rounded_rectangle([shadow_offset, shadow_offset + 10, 
                                     frame_width + shadow_offset, frame_height + shadow_offset + 10],
                                    radius=corner_radius + frame_padding,
                                    fill=(0, 0, 0, 40))
        
        # Blur shadow for realism
        shadow = shadow.filter(ImageFilter.GaussianBlur(radius=15))
        
        # Composite shadow and frame
        result = Image.new('RGBA', shadow.size, (0, 0, 0, 0))
        result = Image.alpha_composite(result, shadow)
        result.paste(frame, (shadow_offset, shadow_offset), frame)
        
        return result

    def create_gradient_background(self, color, theme="light"):
        """Create a sophisticated gradient background optimized for iPad aspect ratio"""
        bg = Image.new('RGB', (SCREENSHOT_WIDTH, SCREENSHOT_HEIGHT), 
                      self.colors["background_light"] if theme == "light" else self.colors["background_dark"])
        
        # Create elegant gradient overlay
        overlay = Image.new('RGBA', (SCREENSHOT_WIDTH, SCREENSHOT_HEIGHT), (0, 0, 0, 0))
        draw = ImageDraw.Draw(overlay)
        
        # Diagonal gradient optimized for landscape layout
        for y in range(SCREENSHOT_HEIGHT):
            for x in range(SCREENSHOT_WIDTH):
                # Create diagonal gradient from top-left
                distance = math.sqrt((x/SCREENSHOT_WIDTH)**2 + (y/SCREENSHOT_HEIGHT)**2) / math.sqrt(2)
                alpha = int(35 * (1 - distance))  # Slightly stronger gradient for iPad
                if alpha > 0:
                    draw.point((x, y), fill=(*color, alpha))
        
        bg = Image.alpha_composite(bg.convert('RGBA'), overlay)
        return bg.convert('RGB')

    def add_text_elements(self, img, config):
        """Add text elements optimized for iPad landscape layout"""
        draw = ImageDraw.Draw(img)
        
        # Text positioning (optimized for iPad landscape aspect ratio)
        text_x = 100
        text_start_y = 250
        
        # Colors
        text_color = self.colors["text_primary"]
        subtitle_color = self.colors["text_secondary"]
        highlight_color = config["color"]
        
        # Fonts (scaled for iPad screenshots)
        title_font = self.get_font(110, bold=True)
        subtitle_font = self.get_font(42)
        highlight_font = self.get_font(34, bold=True)
        
        # Draw highlight badge
        highlight_text = config["highlight"].upper()
        highlight_bbox = draw.textbbox((0, 0), highlight_text, font=highlight_font)
        highlight_width = highlight_bbox[2] - highlight_bbox[0]
        
        badge_x = text_x
        badge_y = text_start_y
        badge_padding = 24
        
        # Badge background with professional styling
        draw.rounded_rectangle([badge_x - badge_padding, badge_y - badge_padding,
                              badge_x + highlight_width + badge_padding, badge_y + 42 + badge_padding],
                             radius=28, fill=(*highlight_color, 25))
        
        # Badge border for sophistication
        draw.rounded_rectangle([badge_x - badge_padding, badge_y - badge_padding,
                              badge_x + highlight_width + badge_padding, badge_y + 42 + badge_padding],
                             radius=28, outline=(*highlight_color, 90), width=3)
        
        # Badge text
        draw.text((badge_x, badge_y), highlight_text, fill=highlight_color, font=highlight_font)
        
        # Draw title
        title_y = badge_y + 120
        title_lines = config["title"].split('\n')
        for i, line in enumerate(title_lines):
            draw.text((text_x, title_y + i * 130), line, fill=text_color, font=title_font)
        
        # Draw subtitle
        subtitle_y = title_y + len(title_lines) * 130 + 70
        subtitle_lines = config["subtitle"].split('\n')
        for i, line in enumerate(subtitle_lines):
            draw.text((text_x, subtitle_y + i * 55), line, fill=subtitle_color, font=subtitle_font)
        
        return img

    def convert_screenshot(self, input_path, config, index):
        """Convert a single iPad screenshot to 2024 App Store format"""
        if not input_path.exists():
            print(f"Warning: Input file not found: {input_path}")
            return None
        
        # Create background
        background = self.create_gradient_background(config["color"], config["theme"])
        
        # Create iPad mockup
        ipad_mockup = self.create_ipad_mockup(input_path)
        
        # Position iPad mockup (right side, optimized for landscape text layout)
        ipad_x = SCREENSHOT_WIDTH - ipad_mockup.width - 80
        ipad_y = (SCREENSHOT_HEIGHT - ipad_mockup.height) // 2
        
        # Composite iPad onto background
        background = background.convert('RGBA')
        background.paste(ipad_mockup, (ipad_x, ipad_y), ipad_mockup)
        
        # Add text elements
        final_image = self.add_text_elements(background, config)
        
        # Generate output filename
        original_name = input_path.stem
        output_name = f"ipad_2024_appstore_{index+1:02d}_{original_name}.png"
        output_path = self.output_dir / output_name
        
        # Save with high quality
        final_image.convert('RGB').save(output_path, 'PNG', quality=95, optimize=True)
        
        print(f"✅ Converted: {input_path.name} → {output_name}")
        return output_path

    def convert_all_screenshots(self):
        """Convert all iPad screenshots to 2024 App Store format"""
        print("📱 Converting iPad screenshots to 2024 App Store format...")
        print("=" * 65)
        
        # Get all PNG files from input directory
        input_files = sorted([f for f in self.input_dir.glob("*.PNG")])
        
        if not input_files:
            print("❌ No PNG files found in input directory")
            return []
        
        generated_files = []
        
        for i, input_file in enumerate(input_files):
            # Use config cyclically if we have more screenshots than configs
            config_index = i % len(self.screenshot_configs)
            config = self.screenshot_configs[config_index]
            
            output_path = self.convert_screenshot(input_file, config, i)
            if output_path:
                generated_files.append(output_path)
        
        print("=" * 65)
        print(f"✨ Successfully converted {len(generated_files)} iPad screenshots!")
        print(f"📁 Output directory: {self.output_dir}")
        print(f"📐 Dimensions: {SCREENSHOT_WIDTH}×{SCREENSHOT_HEIGHT}px (2024 App Store compliant)")
        print(f"📱 Target device: iPad 13\" (iPad Pro M4 and similar)")
        
        print(f"\n📱 iPad 2024 App Store Screenshots:")
        for i, output_file in enumerate(generated_files):
            config = self.screenshot_configs[i % len(self.screenshot_configs)]
            print(f"{i+1:2d}. {output_file.name}")
            print(f"    {config['title'].replace(chr(10), ' ')} - {config['highlight']}")
        
        return generated_files

if __name__ == "__main__":
    input_dir = "/Users/mvneves/dev/MOBILE/chat-dns/_APP_STORE/screenshots/iPad Screenshots"
    output_dir = "/Users/mvneves/dev/MOBILE/chat-dns/_APP_STORE/screenshots/ipad_2024_appstore"
    
    converter = iPad2024ScreenshotConverter(input_dir, output_dir)
    converter.convert_all_screenshots()