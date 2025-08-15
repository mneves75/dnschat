#!/usr/bin/env python3
"""
iPhone App Store Screenshot Converter for DNS Chat (2024 Specifications)
Converts iPhone screenshots to 2024 App Store-compliant dimensions (1320×2868px)
"""

import os
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import math

# 2024 iPhone App Store screenshot dimensions (iPhone 6.9" - iPhone 16 Pro Max)
SCREENSHOT_WIDTH = 1320
SCREENSHOT_HEIGHT = 2868

class iPhone2024ScreenshotConverter:
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
        
        # Screenshot configurations optimized for iPhone presentations
        self.screenshot_configs = [
            {
                "title": "Revolutionary\nDNS Chat",
                "subtitle": "The world's first chat app using\nDNS queries for AI conversations",
                "highlight": "DNS-Powered AI",
                "color": self.colors["primary_blue"],
                "theme": "light"
            },
            {
                "title": "Real-Time DNS\nMonitoring",
                "subtitle": "Watch your messages travel through\nmultiple DNS fallback methods",
                "highlight": "Live Network Tracking",
                "color": self.colors["vibrant_green"],
                "theme": "light"
            },
            {
                "title": "Smart Network\nOptimization", 
                "subtitle": "Automatically finds the fastest\nDNS method for your network",
                "highlight": "Auto-Optimization",
                "color": self.colors["soft_purple"],
                "theme": "light"
            },
            {
                "title": "Seamless\nExperience",
                "subtitle": "Get started instantly with\nintelligent setup and smart defaults",
                "highlight": "Zero Configuration",
                "color": self.colors["warm_orange"],
                "theme": "light"
            },
            {
                "title": "Advanced\nLogging",
                "subtitle": "Comprehensive DNS query logs\nwith detailed method tracking",
                "highlight": "Professional Tools",
                "color": self.colors["deep_red"],
                "theme": "light"
            },
            {
                "title": "Privacy\nFirst",
                "subtitle": "DNS-over-HTTPS support for\nenhanced security and privacy",
                "highlight": "Secure by Design",
                "color": self.colors["gradient_blue"],
                "theme": "light"
            },
            {
                "title": "Cross-Platform\nSync",
                "subtitle": "Works seamlessly across\niOS, Android, and macOS",
                "highlight": "Universal Access",
                "color": self.colors["vibrant_green"],
                "theme": "light"
            },
            {
                "title": "Innovation\nLeader",
                "subtitle": "Pioneering the future of\ncommunication technology",
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

    def create_iphone_mockup(self, screenshot_path, scale=0.75):
        """Create a professional iPhone mockup with accurate proportions"""
        # Load screenshot
        screenshot = Image.open(screenshot_path).convert('RGBA')
        
        # iPhone dimensions for mockup (scaled appropriately)
        device_width = int(375 * scale)  # iPhone standard width
        device_height = int(812 * scale)  # iPhone standard height
        corner_radius = int(40 * scale)
        
        # Resize screenshot to device dimensions
        screenshot = screenshot.resize((device_width, device_height), Image.Resampling.LANCZOS)
        
        # Create device frame
        frame_padding = 6
        frame_width = device_width + (frame_padding * 2)
        frame_height = device_height + (frame_padding * 2)
        
        # Create frame background
        frame = Image.new('RGBA', (frame_width, frame_height), (0, 0, 0, 0))
        draw = ImageDraw.Draw(frame)
        
        # Draw device frame (sleek modern design)
        draw.rounded_rectangle([0, 0, frame_width-1, frame_height-1], 
                             radius=corner_radius + frame_padding, 
                             fill=(40, 40, 40, 255),
                             outline=(80, 80, 80, 255), width=2)
        
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
        shadow_offset = 25
        shadow = Image.new('RGBA', (frame_width + shadow_offset*2, frame_height + shadow_offset*2), (0, 0, 0, 0))
        shadow_draw = ImageDraw.Draw(shadow)
        shadow_draw.rounded_rectangle([shadow_offset, shadow_offset + 8, 
                                     frame_width + shadow_offset, frame_height + shadow_offset + 8],
                                    radius=corner_radius + frame_padding,
                                    fill=(0, 0, 0, 35))
        
        # Blur shadow
        shadow = shadow.filter(ImageFilter.GaussianBlur(radius=12))
        
        # Composite shadow and frame
        result = Image.new('RGBA', shadow.size, (0, 0, 0, 0))
        result = Image.alpha_composite(result, shadow)
        result.paste(frame, (shadow_offset, shadow_offset), frame)
        
        return result

    def create_gradient_background(self, color, theme="light"):
        """Create a sophisticated gradient background"""
        bg = Image.new('RGB', (SCREENSHOT_WIDTH, SCREENSHOT_HEIGHT), 
                      self.colors["background_light"] if theme == "light" else self.colors["background_dark"])
        
        # Create elegant gradient overlay
        overlay = Image.new('RGBA', (SCREENSHOT_WIDTH, SCREENSHOT_HEIGHT), (0, 0, 0, 0))
        draw = ImageDraw.Draw(overlay)
        
        # Radial gradient for modern look
        center_x, center_y = SCREENSHOT_WIDTH // 3, SCREENSHOT_HEIGHT // 4
        max_distance = math.sqrt(SCREENSHOT_WIDTH**2 + SCREENSHOT_HEIGHT**2)
        
        for y in range(SCREENSHOT_HEIGHT):
            for x in range(SCREENSHOT_WIDTH):
                distance = math.sqrt((x - center_x)**2 + (y - center_y)**2)
                alpha = int(30 * (1 - distance / max_distance))  # Subtle gradient
                if alpha > 0:
                    draw.point((x, y), fill=(*color, alpha))
        
        bg = Image.alpha_composite(bg.convert('RGBA'), overlay)
        return bg.convert('RGB')

    def add_text_elements(self, img, config):
        """Add text elements optimized for iPhone layout"""
        draw = ImageDraw.Draw(img)
        
        # Text positioning (optimized for iPhone aspect ratio)
        text_x = 70
        text_start_y = 180
        
        # Colors
        text_color = self.colors["text_primary"]
        subtitle_color = self.colors["text_secondary"]
        highlight_color = config["color"]
        
        # Fonts (scaled for iPhone screenshots)
        title_font = self.get_font(72, bold=True)
        subtitle_font = self.get_font(32)
        highlight_font = self.get_font(26, bold=True)
        
        # Draw highlight badge
        highlight_text = config["highlight"].upper()
        highlight_bbox = draw.textbbox((0, 0), highlight_text, font=highlight_font)
        highlight_width = highlight_bbox[2] - highlight_bbox[0]
        
        badge_x = text_x
        badge_y = text_start_y
        badge_padding = 18
        
        # Badge background with modern styling
        draw.rounded_rectangle([badge_x - badge_padding, badge_y - badge_padding,
                              badge_x + highlight_width + badge_padding, badge_y + 32 + badge_padding],
                             radius=22, fill=(*highlight_color, 25))
        
        # Badge border for elegance
        draw.rounded_rectangle([badge_x - badge_padding, badge_y - badge_padding,
                              badge_x + highlight_width + badge_padding, badge_y + 32 + badge_padding],
                             radius=22, outline=(*highlight_color, 80), width=2)
        
        # Badge text
        draw.text((badge_x, badge_y), highlight_text, fill=highlight_color, font=highlight_font)
        
        # Draw title
        title_y = badge_y + 90
        title_lines = config["title"].split('\n')
        for i, line in enumerate(title_lines):
            draw.text((text_x, title_y + i * 85), line, fill=text_color, font=title_font)
        
        # Draw subtitle
        subtitle_y = title_y + len(title_lines) * 85 + 50
        subtitle_lines = config["subtitle"].split('\n')
        for i, line in enumerate(subtitle_lines):
            draw.text((text_x, subtitle_y + i * 42), line, fill=subtitle_color, font=subtitle_font)
        
        return img

    def convert_screenshot(self, input_path, config, index):
        """Convert a single iPhone screenshot to 2024 App Store format"""
        if not input_path.exists():
            print(f"Warning: Input file not found: {input_path}")
            return None
        
        # Create background
        background = self.create_gradient_background(config["color"], config["theme"])
        
        # Create iPhone mockup
        phone_mockup = self.create_iphone_mockup(input_path)
        
        # Position phone mockup (right side, optimized for text space)
        phone_x = SCREENSHOT_WIDTH - phone_mockup.width - 50
        phone_y = (SCREENSHOT_HEIGHT - phone_mockup.height) // 2 + 100
        
        # Composite phone onto background
        background = background.convert('RGBA')
        background.paste(phone_mockup, (phone_x, phone_y), phone_mockup)
        
        # Add text elements
        final_image = self.add_text_elements(background, config)
        
        # Generate output filename
        original_name = input_path.stem
        output_name = f"iphone_2024_appstore_{index+1:02d}_{original_name}.png"
        output_path = self.output_dir / output_name
        
        # Save with high quality
        final_image.convert('RGB').save(output_path, 'PNG', quality=95, optimize=True)
        
        print(f"✅ Converted: {input_path.name} → {output_name}")
        return output_path

    def convert_all_screenshots(self):
        """Convert all iPhone screenshots to 2024 App Store format"""
        print("📱 Converting iPhone screenshots to 2024 App Store format...")
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
        print(f"✨ Successfully converted {len(generated_files)} iPhone screenshots!")
        print(f"📁 Output directory: {self.output_dir}")
        print(f"📐 Dimensions: {SCREENSHOT_WIDTH}×{SCREENSHOT_HEIGHT}px (2024 App Store compliant)")
        print(f"📱 Target device: iPhone 6.9\" (iPhone 16 Pro Max and similar)")
        
        print(f"\n📱 iPhone 2024 App Store Screenshots:")
        for i, output_file in enumerate(generated_files):
            config = self.screenshot_configs[i % len(self.screenshot_configs)]
            print(f"{i+1:2d}. {output_file.name}")
            print(f"    {config['title'].replace(chr(10), ' ')} - {config['highlight']}")
        
        return generated_files

if __name__ == "__main__":
    input_dir = "/Users/mvneves/dev/MOBILE/chat-dns/_APP_STORE/screenshots/iPhone Screenshots"
    output_dir = "/Users/mvneves/dev/MOBILE/chat-dns/_APP_STORE/screenshots/iphone_2024_appstore"
    
    converter = iPhone2024ScreenshotConverter(input_dir, output_dir)
    converter.convert_all_screenshots()