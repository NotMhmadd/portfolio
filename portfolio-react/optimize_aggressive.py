#!/usr/bin/env python3
"""
Aggressive image optimization for fast web loading.
Target: All images under 300KB, max 1200px width.
"""

import os
from PIL import Image
import sys

IMAGES_DIR = "images"
MAX_WIDTH = 1200
JPEG_QUALITY = 65
TARGET_SIZE_KB = 300

def optimize_image(filepath):
    """Aggressively optimize a single image."""
    try:
        original_size = os.path.getsize(filepath)
        
        # Skip if already small enough
        if original_size <= TARGET_SIZE_KB * 1024:
            return False, original_size, original_size
        
        with Image.open(filepath) as img:
            # Convert to RGB if necessary (for PNG with transparency)
            if img.mode in ('RGBA', 'P'):
                # Create white background for transparent images
                background = Image.new('RGB', img.size, (255, 255, 255))
                if img.mode == 'P':
                    img = img.convert('RGBA')
                background.paste(img, mask=img.split()[3] if len(img.split()) == 4 else None)
                img = background
            elif img.mode != 'RGB':
                img = img.convert('RGB')
            
            # Resize if too wide
            if img.width > MAX_WIDTH:
                ratio = MAX_WIDTH / img.width
                new_height = int(img.height * ratio)
                img = img.resize((MAX_WIDTH, new_height), Image.LANCZOS)
            
            # Save as JPEG with aggressive compression
            # Change extension to .jpg
            base, ext = os.path.splitext(filepath)
            new_filepath = base + '.jpg'
            
            # Try different quality levels to get under target size
            quality = JPEG_QUALITY
            while quality >= 40:
                img.save(new_filepath, 'JPEG', quality=quality, optimize=True)
                new_size = os.path.getsize(new_filepath)
                if new_size <= TARGET_SIZE_KB * 1024:
                    break
                quality -= 10
            
            # If original was PNG and we created a new JPG, remove the PNG
            if ext.lower() == '.png' and os.path.exists(new_filepath):
                if new_filepath != filepath:
                    os.remove(filepath)
            
            new_size = os.path.getsize(new_filepath)
            return True, original_size, new_size
            
    except Exception as e:
        print(f"Error processing {filepath}: {e}")
        return False, 0, 0

def main():
    if not os.path.exists(IMAGES_DIR):
        print(f"Error: {IMAGES_DIR} directory not found")
        return
    
    total_original = 0
    total_new = 0
    processed = 0
    skipped = 0
    
    # Get all image files
    image_files = []
    for root, dirs, files in os.walk(IMAGES_DIR):
        for file in files:
            if file.lower().endswith(('.jpg', '.jpeg', '.png')):
                image_files.append(os.path.join(root, file))
    
    print(f"Found {len(image_files)} images to process...")
    print(f"Target: {TARGET_SIZE_KB}KB max, {MAX_WIDTH}px max width, {JPEG_QUALITY}% quality")
    print("-" * 50)
    
    for i, filepath in enumerate(image_files, 1):
        optimized, orig_size, new_size = optimize_image(filepath)
        total_original += orig_size
        total_new += new_size
        
        if optimized:
            processed += 1
            reduction = ((orig_size - new_size) / orig_size) * 100 if orig_size > 0 else 0
            print(f"[{i}/{len(image_files)}] {os.path.basename(filepath)}: {orig_size//1024}KB -> {new_size//1024}KB ({reduction:.0f}% smaller)")
        else:
            skipped += 1
            if i % 50 == 0:
                print(f"[{i}/{len(image_files)}] Progress...")
    
    print("-" * 50)
    print(f"Processed: {processed} images")
    print(f"Skipped (already small): {skipped} images")
    print(f"Total: {total_original // (1024*1024)}MB -> {total_new // (1024*1024)}MB")
    print(f"Saved: {(total_original - total_new) // (1024*1024)}MB")

if __name__ == "__main__":
    main()
