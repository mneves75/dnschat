#!/usr/bin/env python3
"""
Modern App Store Screenshot Generator for DNS Chat
Creates beautiful, modern App Store screenshots with device frames and modern design
"""

import os
import shutil
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import colorsys

# Configuration
SCREENSHOT_WIDTH = 1242
SCREENSHOT_HEIGHT = 2688
DEVICE_WIDTH = 414
DEVICE_HEIGHT = 896
DEVICE_CORNER_RADIUS = 44

class ModernScreenshotGenerator:
    def __init__(self, input_dir, output_dir):
        self.input_dir = Path(input_dir)
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(exist_ok=True)
        
        # Define color schemes for each screenshot
        self.color_schemes = [
            {"name": "hero", "gradient": [(0, 97, 255), (96, 239, 255)]},  # Blue gradient
            {"name": "features", "gradient": [(17, 153, 142), (56, 239, 125)]},  # Green gradient  
            {"name": "privacy", "gradient": [(131, 96, 195), (46, 191, 145)]},  # Purple-green gradient
            {"name": "network", "gradient": [(255, 107, 107), (254, 202, 87)]},  # Red-yellow gradient
            {"name": "onboarding", "gradient": [(79, 172, 254), (0, 242, 254)]}  # Light blue gradient
        ]
        
        # Content for each screenshot
        self.content = [
            {
                "title": "Chat Through\nDNS Magic",
                "subtitle": "The world's first AI chat app that uses DNS queries instead of traditional APIs",
                "badges": ["Revolutionary Technology", "No Traditional APIs", "Privacy-First"],
                "icon": "🌐"
            },
            {
                "title": "Real-Time\nDNS Monitoring", 
                "subtitle": "Watch your messages travel through multiple DNS fallback methods with detailed timing",
                "badges": ["Native DNS", "UDP Fallback", "TCP Fallback", "HTTPS Fallback"],
                "icon": "⚡"
            },
            {
                "title": "Network\nOptimization",
                "subtitle": "Automatically tests and optimizes DNS methods for your network conditions",
                "badges": ["Auto-Detection", "Performance Tuned", "Global Infrastructure"],
                "icon": "🔧"
            },
            {
                "title": "Seamless\nExperience", 
                "subtitle": "Start chatting immediately with intelligent onboarding that gets you running in seconds",
                "badges": ["Instant Setup", "Smart Defaults", "No Configuration"],
                "icon": "💬"
            },
            {
                "title": "Powerful\nFeatures",
                "subtitle": "Advanced DNS query logging, customizable settings, and enterprise-grade reliability", 
                "badges": ["Query Logs", "Custom Settings", "Enterprise Ready"],
                "icon": "✨"
            }
        ]

    def create_gradient_background(self, width, height, color1, color2):
        """Create a diagonal gradient background"""
        image = Image.new('RGB', (width, height))
        draw = ImageDraw.Draw(image)
        
        # Create diagonal gradient
        for y in range(height):
            for x in range(width):
                # Calculate position on diagonal (0 to 1)
                diagonal_pos = (x + y) / (width + height)
                
                # Interpolate between colors
                r = int(color1[0] + (color2[0] - color1[0]) * diagonal_pos)
                g = int(color1[1] + (color2[1] - color1[1]) * diagonal_pos)
                b = int(color1[2] + (color2[2] - color1[2]) * diagonal_pos)
                
                draw.point((x, y), (r, g, b))
        
        return image

    def create_device_frame(self, screenshot_img):
        """Create a modern device frame around the screenshot"""
        # Create device frame with rounded corners
        frame = Image.new('RGBA', (DEVICE_WIDTH + 16, DEVICE_HEIGHT + 16), (0, 0, 0, 0))
        draw = ImageDraw.Draw(frame)
        
        # Draw device frame (black with rounded corners)
        draw.rounded_rectangle([0, 0, DEVICE_WIDTH + 15, DEVICE_HEIGHT + 15], 
                             radius=DEVICE_CORNER_RADIUS, fill=(0, 0, 0, 255))
        
        # Create inner screen area
        screen_area = Image.new('RGBA', (DEVICE_WIDTH, DEVICE_HEIGHT), (0, 0, 0, 0))
        
        # Resize and fit the screenshot
        screenshot_resized = screenshot_img.resize((DEVICE_WIDTH, DEVICE_HEIGHT), Image.Resampling.LANCZOS)
        
        # Create rounded corners for the screen
        mask = Image.new('L', (DEVICE_WIDTH, DEVICE_HEIGHT), 0)
        mask_draw = ImageDraw.Draw(mask)
        mask_draw.rounded_rectangle([0, 0, DEVICE_WIDTH, DEVICE_HEIGHT], 
                                  radius=DEVICE_CORNER_RADIUS-8, fill=255)
        
        # Apply mask to screenshot
        screenshot_resized.putalpha(mask)
        
        # Paste screenshot into frame
        frame.paste(screenshot_resized, (8, 8), screenshot_resized)
        
        return frame

    def create_text_overlay(self, width, height, content, step_num):
        """Create text overlay for the screenshot"""
        overlay = Image.new('RGBA', (width, height), (0, 0, 0, 0))
        draw = ImageDraw.Draw(overlay)
        
        try:
            # Try to load system fonts
            title_font = ImageFont.truetype("Arial Bold", 72)
            subtitle_font = ImageFont.truetype("Arial", 28) 
            badge_font = ImageFont.truetype("Arial Bold", 18)
            step_font = ImageFont.truetype("Arial Bold", 16)
        except:
            # Fallback to default font
            title_font = ImageFont.load_default()
            subtitle_font = ImageFont.load_default()
            badge_font = ImageFont.load_default()
            step_font = ImageFont.load_default()
        
        # Draw step indicator
        step_text = f"{step_num} of 5"
        step_bbox = draw.textbbox((0, 0), step_text, font=step_font)
        step_width = step_bbox[2] - step_bbox[0]
        step_x = (width - step_width) // 2
        
        # Step indicator background
        draw.rounded_rectangle([step_x - 24, 40, step_x + step_width + 24, 72],
                             radius=20, fill=(255, 255, 255, 51))
        draw.text((step_x, 48), step_text, fill=(255, 255, 255, 255), font=step_font)
        
        # Position text on the right side
        text_x = 460
        text_y = 200
        
        # Draw app icon background
        icon_size = 120
        draw.rounded_rectangle([text_x, text_y, text_x + icon_size, text_y + icon_size],
                             radius=24, fill=(0, 212, 255, 255))
        
        # Draw icon emoji (simplified as text)
        icon_font = ImageFont.load_default()
        draw.text((text_x + 40, text_y + 40), content["icon"], fill=(255, 255, 255, 255), font=icon_font)
        
        # Draw title
        title_y = text_y + 160
        lines = content["title"].split('\n')
        for i, line in enumerate(lines):
            draw.text((text_x, title_y + i * 80), line, fill=(255, 255, 255, 255), font=title_font)
        
        # Draw subtitle
        subtitle_y = title_y + len(lines) * 80 + 40
        
        # Word wrap subtitle
        words = content["subtitle"].split()
        lines = []
        current_line = ""
        max_width = 600
        
        for word in words:
            test_line = current_line + (" " if current_line else "") + word
            bbox = draw.textbbox((0, 0), test_line, font=subtitle_font)
            if bbox[2] - bbox[0] <= max_width:
                current_line = test_line
            else:
                if current_line:
                    lines.append(current_line)
                current_line = word
        if current_line:
            lines.append(current_line)
        
        for i, line in enumerate(lines):
            draw.text((text_x, subtitle_y + i * 36), line, fill=(255, 255, 255, 230), font=subtitle_font)
        
        # Draw badges
        badge_y = subtitle_y + len(lines) * 36 + 40
        badge_x = text_x
        
        for badge in content["badges"]:
            bbox = draw.textbbox((0, 0), badge, font=badge_font)
            badge_width = bbox[2] - bbox[0] + 48
            
            # Badge background
            draw.rounded_rectangle([badge_x, badge_y, badge_x + badge_width, badge_y + 48],
                                 radius=24, fill=(255, 255, 255, 51))
            
            # Badge text
            draw.text((badge_x + 24, badge_y + 15), badge, fill=(255, 255, 255, 255), font=badge_font)
            
            badge_x += badge_width + 16
            if badge_x > text_x + 400:  # Wrap to next line
                badge_x = text_x
                badge_y += 64
        
        return overlay

    def generate_screenshot(self, input_image_path, scheme, content, step_num, output_name):
        """Generate a single modern screenshot"""
        # Load original screenshot
        original = Image.open(input_image_path).convert('RGBA')
        
        # Create gradient background
        background = self.create_gradient_background(
            SCREENSHOT_WIDTH, SCREENSHOT_HEIGHT, 
            scheme["gradient"][0], scheme["gradient"][1]
        )
        
        # Create device frame with screenshot
        device_frame = self.create_device_frame(original)
        
        # Calculate device position (centered on left side)
        device_x = 80
        device_y = (SCREENSHOT_HEIGHT - DEVICE_HEIGHT) // 2
        
        # Create final image
        final_image = background.copy()
        final_image.paste(device_frame, (device_x, device_y), device_frame)
        
        # Add text overlay
        text_overlay = self.create_text_overlay(SCREENSHOT_WIDTH, SCREENSHOT_HEIGHT, content, step_num)
        final_image = Image.alpha_composite(final_image.convert('RGBA'), text_overlay)
        
        # Save final image
        output_path = self.output_dir / output_name
        final_image.convert('RGB').save(output_path, 'PNG', quality=95)
        print(f"Generated: {output_path}")

    def generate_all_screenshots(self):
        """Generate all modern screenshots"""
        # Mapping of input files to content
        input_files = [
            "IMG_8874.PNG",  # Chat interface
            "IMG_8870.PNG",  # DNS in action  
            "IMG_8871.PNG",  # Network optimization
            "IMG_8872.PNG",  # First chat
            "IMG_8873.PNG"   # Powerful features
        ]
        
        for i, (input_file, scheme, content) in enumerate(zip(input_files, self.color_schemes, self.content)):
            input_path = self.input_dir / input_file
            if input_path.exists():
                output_name = f"modern_screenshot_{i+1}_{scheme['name']}.png"
                self.generate_screenshot(input_path, scheme, content, i+1, output_name)
            else:
                print(f"Warning: Input file not found: {input_path}")

if __name__ == "__main__":
    input_dir = "_APP_STORE/screenshots/iPhone Screenshots"
    output_dir = "_APP_STORE/screenshots/modern"
    
    generator = ModernScreenshotGenerator(input_dir, output_dir)
    generator.generate_all_screenshots()
    
    print("\n✅ Modern App Store screenshots generated successfully!")
    print(f"📁 Output directory: {output_dir}")
    print("\n📱 Screenshots created:")
    print("1. modern_screenshot_1_hero.png - Chat Through DNS Magic")
    print("2. modern_screenshot_2_features.png - Real-Time DNS Monitoring") 
    print("3. modern_screenshot_3_privacy.png - Network Optimization")
    print("4. modern_screenshot_4_network.png - Seamless Experience")
    print("5. modern_screenshot_5_onboarding.png - Powerful Features")