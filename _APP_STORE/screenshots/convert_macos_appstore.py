#!/usr/bin/env python3
"""
macOS App Store Screenshot Converter for DNS Chat
Converts macOS screenshots to App Store-compliant dimensions and format
"""

import os
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import math

# macOS App Store screenshot dimensions (2560x1600 is optimal for high-res displays)
SCREENSHOT_WIDTH = 2560
SCREENSHOT_HEIGHT = 1600

class MacOSScreenshotConverter:
    def __init__(self, input_dir, output_dir):
        self.input_dir = Path(input_dir)
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(exist_ok=True)
        
        # Modern color palette (matching existing mobile versions)
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
        
        # Screenshot configurations with macOS-focused messaging
        self.screenshot_configs = [
            {
                "title": "DNS Chat\nfor macOS",
                "subtitle": "Revolutionary DNS-based chat\nbrings AI conversations to your Mac",
                "highlight": "Native macOS App",
                "color": self.colors["primary_blue"],
                "theme": "light"
            },
            {
                "title": "Real-Time DNS\nMonitoring",
                "subtitle": "Watch DNS queries live with\ncomprehensive network insights",
                "highlight": "Live Network Tracking",
                "color": self.colors["vibrant_green"],
                "theme": "light"
            },
            {
                "title": "Intelligent\nFallback System",
                "subtitle": "Automatically switches between\nDNS methods for optimal performance",
                "highlight": "Smart Network Handling",
                "color": self.colors["soft_purple"],
                "theme": "light"
            },
            {
                "title": "Seamless\nChat Experience",
                "subtitle": "Clean, intuitive interface\noptimized for macOS workflow",
                "highlight": "Native Mac Experience",
                "color": self.colors["warm_orange"],
                "theme": "light"
            },
            {
                "title": "Developer\nFriendly",
                "subtitle": "Open source with extensive\nlogging and customization options",
                "highlight": "Professional Tools",
                "color": self.colors["deep_red"],
                "theme": "light"
            },
            {
                "title": "Privacy\nFirst",
                "subtitle": "DNS-over-HTTPS support\nfor enhanced security and privacy",
                "highlight": "Secure by Design",
                "color": self.colors["primary_blue"],
                "theme": "light"
            },
            {
                "title": "Multi-Platform\nCompatibility",
                "subtitle": "Works across iOS, Android,\nand macOS with sync capabilities",
                "highlight": "Universal Access",
                "color": self.colors["vibrant_green"],
                "theme": "light"
            },
            {
                "title": "Revolutionary\nTechnology",
                "subtitle": "First-of-its-kind DNS chat\ntechnology pioneering new standards",
                "highlight": "Innovation Leader",
                "color": self.colors["soft_purple"],
                "theme": "light"
            }
        ]

    def get_font(self, size, bold=False):
        """Get system font with fallback"""
        try:
            font_path = "/System/Library/Fonts/Helvetica.ttc"
            if bold:
                # Try to get bold variant
                return ImageFont.truetype(font_path, size)
            else:
                return ImageFont.truetype(font_path, size)
        except:
            return ImageFont.load_default()

    def create_macos_mockup(self, screenshot_path, scale=0.85):
        """Create a professional macOS window mockup"""
        # Load screenshot
        screenshot = Image.open(screenshot_path).convert('RGBA')
        
        # Calculate target dimensions (maintaining aspect ratio)
        original_width, original_height = screenshot.size
        aspect_ratio = original_width / original_height
        
        # Scale to fit nicely in the App Store screenshot
        target_height = int(SCREENSHOT_HEIGHT * scale * 0.8)  # Leave room for text
        target_width = int(target_height * aspect_ratio)
        
        # Ensure it doesn't exceed width limits
        max_width = int(SCREENSHOT_WIDTH * 0.6)
        if target_width > max_width:
            target_width = max_width
            target_height = int(target_width / aspect_ratio)
        
        # Resize screenshot
        screenshot = screenshot.resize((target_width, target_height), Image.Resampling.LANCZOS)
        
        # Create macOS window frame
        window_padding = 30
        title_bar_height = 28
        frame_width = target_width + (window_padding * 2)
        frame_height = target_height + (window_padding * 2) + title_bar_height
        corner_radius = 8
        
        # Create window background
        window = Image.new('RGBA', (frame_width, frame_height), (0, 0, 0, 0))
        draw = ImageDraw.Draw(window)
        
        # Draw window background (macOS style)
        draw.rounded_rectangle([0, 0, frame_width-1, frame_height-1], 
                             radius=corner_radius, 
                             fill=(245, 245, 245, 255),
                             outline=(200, 200, 200, 255), width=1)
        
        # Draw title bar
        draw.rounded_rectangle([0, 0, frame_width-1, title_bar_height + corner_radius], 
                             radius=corner_radius, 
                             fill=(230, 230, 230, 255))
        
        # Draw title bar separator
        draw.line([(0, title_bar_height), (frame_width, title_bar_height)], 
                 fill=(200, 200, 200, 255), width=1)
        
        # Draw traffic light buttons (macOS style)
        button_y = title_bar_height // 2
        button_radius = 6
        
        # Close button (red)
        draw.ellipse([12, button_y - button_radius, 12 + button_radius*2, button_y + button_radius], 
                    fill=(255, 95, 87, 255))
        # Minimize button (yellow)
        draw.ellipse([34, button_y - button_radius, 34 + button_radius*2, button_y + button_radius], 
                    fill=(255, 189, 46, 255))
        # Maximize button (green)
        draw.ellipse([56, button_y - button_radius, 56 + button_radius*2, button_y + button_radius], 
                    fill=(39, 201, 63, 255))
        
        # Create content area mask
        content_y = title_bar_height
        mask = Image.new('L', (target_width, target_height), 0)
        mask_draw = ImageDraw.Draw(mask)
        mask_draw.rectangle([0, 0, target_width, target_height], fill=255)
        
        # Apply mask to screenshot
        screenshot.putalpha(mask)
        
        # Paste screenshot into window
        window.paste(screenshot, (window_padding, content_y + window_padding), screenshot)
        
        # Add subtle shadow
        shadow_size = 20
        shadow = Image.new('RGBA', (frame_width + shadow_size*2, frame_height + shadow_size*2), (0, 0, 0, 0))
        shadow_draw = ImageDraw.Draw(shadow)
        shadow_draw.rounded_rectangle([shadow_size, shadow_size + 8, 
                                     frame_width + shadow_size, frame_height + shadow_size + 8],
                                    radius=corner_radius,
                                    fill=(0, 0, 0, 40))
        
        # Blur shadow
        shadow = shadow.filter(ImageFilter.GaussianBlur(radius=8))
        
        # Composite shadow and window
        result = Image.new('RGBA', shadow.size, (0, 0, 0, 0))
        result = Image.alpha_composite(result, shadow)
        result.paste(window, (shadow_size, shadow_size), window)
        
        return result

    def create_gradient_background(self, color, theme="light"):
        """Create a subtle gradient background"""
        bg = Image.new('RGB', (SCREENSHOT_WIDTH, SCREENSHOT_HEIGHT), 
                      self.colors["background_light"] if theme == "light" else self.colors["background_dark"])
        
        # Create subtle gradient overlay
        overlay = Image.new('RGBA', (SCREENSHOT_WIDTH, SCREENSHOT_HEIGHT), (0, 0, 0, 0))
        draw = ImageDraw.Draw(overlay)
        
        # Diagonal gradient for more visual interest
        for y in range(SCREENSHOT_HEIGHT):
            for x in range(SCREENSHOT_WIDTH):
                distance = math.sqrt((x/SCREENSHOT_WIDTH)**2 + (y/SCREENSHOT_HEIGHT)**2)
                alpha = int(20 * (1 - distance))  # Subtle gradient
                if alpha > 0:
                    draw.point((x, y), fill=(*color, alpha))
        
        bg = Image.alpha_composite(bg.convert('RGBA'), overlay)
        return bg.convert('RGB')

    def add_text_elements(self, img, config):
        """Add text elements to the screenshot"""
        draw = ImageDraw.Draw(img)
        
        # Text positioning (left side)
        text_x = 80
        text_start_y = 200
        
        # Colors
        text_color = self.colors["text_primary"]
        subtitle_color = self.colors["text_secondary"]
        highlight_color = config["color"]
        
        # Fonts (scaled for macOS screenshots)
        title_font = self.get_font(84, bold=True)
        subtitle_font = self.get_font(36)
        highlight_font = self.get_font(28, bold=True)
        
        # Draw highlight badge
        highlight_text = config["highlight"].upper()
        highlight_bbox = draw.textbbox((0, 0), highlight_text, font=highlight_font)
        highlight_width = highlight_bbox[2] - highlight_bbox[0]
        
        badge_x = text_x
        badge_y = text_start_y
        badge_padding = 20
        
        # Badge background
        draw.rounded_rectangle([badge_x - badge_padding, badge_y - badge_padding,
                              badge_x + highlight_width + badge_padding, badge_y + 36 + badge_padding],
                             radius=24, fill=(*highlight_color, 30))
        
        # Badge text
        draw.text((badge_x, badge_y), highlight_text, fill=highlight_color, font=highlight_font)
        
        # Draw title
        title_y = badge_y + 100
        title_lines = config["title"].split('\n')
        for i, line in enumerate(title_lines):
            draw.text((text_x, title_y + i * 100), line, fill=text_color, font=title_font)
        
        # Draw subtitle
        subtitle_y = title_y + len(title_lines) * 100 + 60
        subtitle_lines = config["subtitle"].split('\n')
        for i, line in enumerate(subtitle_lines):
            draw.text((text_x, subtitle_y + i * 50), line, fill=subtitle_color, font=subtitle_font)
        
        return img

    def convert_screenshot(self, input_path, config, index):
        """Convert a single macOS screenshot"""
        if not input_path.exists():
            print(f"Warning: Input file not found: {input_path}")
            return None
        
        # Create background
        background = self.create_gradient_background(config["color"], config["theme"])
        
        # Create macOS window mockup
        window_mockup = self.create_macos_mockup(input_path)
        
        # Position window mockup (right side, centered)
        window_x = SCREENSHOT_WIDTH - window_mockup.width - 100
        window_y = (SCREENSHOT_HEIGHT - window_mockup.height) // 2
        
        # Composite window onto background
        background = background.convert('RGBA')
        background.paste(window_mockup, (window_x, window_y), window_mockup)
        
        # Add text elements
        final_image = self.add_text_elements(background, config)
        
        # Generate output filename
        original_name = input_path.stem
        output_name = f"macos_appstore_{index+1:02d}_{original_name}.png"
        output_path = self.output_dir / output_name
        
        # Save
        final_image.convert('RGB').save(output_path, 'PNG', quality=95, optimize=True)
        
        print(f"✅ Converted: {input_path.name} → {output_name}")
        return output_path

    def convert_all_screenshots(self):
        """Convert all macOS screenshots to App Store format"""
        print("🖥️  Converting macOS screenshots to App Store format...")
        print("=" * 60)
        
        # Get all PNG files from input directory
        input_files = sorted([f for f in self.input_dir.glob("*.png")])
        
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
        
        print("=" * 60)
        print(f"✨ Successfully converted {len(generated_files)} macOS screenshots!")
        print(f"📁 Output directory: {self.output_dir}")
        print(f"📐 Dimensions: {SCREENSHOT_WIDTH}×{SCREENSHOT_HEIGHT}px (App Store compliant)")
        
        print(f"\n🖥️  macOS App Store Screenshots:")
        for i, output_file in enumerate(generated_files):
            config = self.screenshot_configs[i % len(self.screenshot_configs)]
            print(f"{i+1:2d}. {output_file.name}")
            print(f"    {config['title'].replace(chr(10), ' ')} - {config['highlight']}")
        
        return generated_files

if __name__ == "__main__":
    input_dir = "_APP_STORE/screenshots/macOS Screenshots"
    output_dir = "_APP_STORE/screenshots/macos_appstore"
    
    converter = MacOSScreenshotConverter(input_dir, output_dir)
    converter.convert_all_screenshots()