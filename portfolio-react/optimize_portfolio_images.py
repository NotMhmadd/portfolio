#!/usr/bin/env python3
"""
Portfolio Image Optimizer
Optimizes images for web viewing while maintaining quality for a design portfolio.
- Converts large PNGs to optimized JPEGs (quality 85%)
- Resizes images exceeding 2000px width
- Targets < 500KB per image
- Preserves aspect ratios
"""

import os
import sys
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    print("Installing Pillow...")
    os.system(f"{sys.executable} -m pip install Pillow")
    from PIL import Image

# Configuration
IMAGES_DIR = Path("images")
MAX_WIDTH = 2000
MAX_HEIGHT = 2000
JPEG_QUALITY = 85
TARGET_SIZE_KB = 500
SKIP_FOLDERS = {"images_backup_20260107_150230"}

def get_file_size_kb(path):
    return os.path.getsize(path) / 1024

def optimize_image(image_path):
    """Optimize a single image file."""
    path = Path(image_path)
    original_size = get_file_size_kb(path)
    
    # Skip small files
    if original_size <= TARGET_SIZE_KB:
        return None, "skipped (already optimized)"
    
    try:
        with Image.open(path) as img:
            # Get original format
            original_format = img.format
            
            # Convert RGBA to RGB for JPEG conversion
            if img.mode in ('RGBA', 'P'):
                # For PNGs with transparency, keep as PNG but optimize
                if original_format == 'PNG':
                    # Check if image actually has transparency
                    if img.mode == 'RGBA':
                        extrema = img.split()[-1].getextrema()
                        has_transparency = extrema[0] < 255
                    else:
                        has_transparency = False
                    
                    if has_transparency:
                        # Keep as PNG, just resize if needed
                        resized = False
                        if img.width > MAX_WIDTH or img.height > MAX_HEIGHT:
                            img.thumbnail((MAX_WIDTH, MAX_HEIGHT), Image.LANCZOS)
                            resized = True
                        
                        # Save optimized PNG
                        img.save(path, 'PNG', optimize=True)
                        new_size = get_file_size_kb(path)
                        if resized:
                            return new_size, f"resized PNG {original_size:.0f}KB -> {new_size:.0f}KB"
                        return new_size, f"optimized PNG {original_size:.0f}KB -> {new_size:.0f}KB"
                
                # Convert to RGB for JPEG
                img = img.convert('RGB')
            
            # Resize if too large
            resized = False
            if img.width > MAX_WIDTH or img.height > MAX_HEIGHT:
                img.thumbnail((MAX_WIDTH, MAX_HEIGHT), Image.LANCZOS)
                resized = True
            
            # Determine output format and path
            if path.suffix.lower() in ['.png'] and original_size > TARGET_SIZE_KB * 2:
                # Convert large PNGs to JPEG
                new_path = path.with_suffix('.jpg')
                img.save(new_path, 'JPEG', quality=JPEG_QUALITY, optimize=True)
                new_size = get_file_size_kb(new_path)
                
                # Only keep JPEG if it's significantly smaller
                if new_size < original_size * 0.7:
                    os.remove(path)
                    return new_size, f"converted to JPG {original_size:.0f}KB -> {new_size:.0f}KB"
                else:
                    os.remove(new_path)
                    # Just optimize the PNG
                    with Image.open(path) as img2:
                        if img2.mode == 'RGBA':
                            img2 = img2.convert('RGB')
                        if resized:
                            img2.thumbnail((MAX_WIDTH, MAX_HEIGHT), Image.LANCZOS)
                        img2.save(path, 'PNG', optimize=True)
                    new_size = get_file_size_kb(path)
                    return new_size, f"optimized PNG {original_size:.0f}KB -> {new_size:.0f}KB"
            else:
                # Save as same format
                if path.suffix.lower() in ['.jpg', '.jpeg']:
                    img.save(path, 'JPEG', quality=JPEG_QUALITY, optimize=True)
                else:
                    img.save(path, optimize=True)
                
                new_size = get_file_size_kb(path)
                action = "resized & compressed" if resized else "compressed"
                return new_size, f"{action} {original_size:.0f}KB -> {new_size:.0f}KB"
                
    except Exception as e:
        return None, f"error: {str(e)}"

def main():
    print("=" * 60)
    print("Portfolio Image Optimizer")
    print("=" * 60)
    
    # Find all images
    image_extensions = {'.jpg', '.jpeg', '.png', '.gif', '.webp'}
    images = []
    
    for root, dirs, files in os.walk(IMAGES_DIR):
        # Skip backup folders
        if any(skip in root for skip in SKIP_FOLDERS):
            continue
        
        for file in files:
            if Path(file).suffix.lower() in image_extensions:
                images.append(Path(root) / file)
    
    print(f"Found {len(images)} images to process")
    print("-" * 60)
    
    # Track statistics
    optimized = 0
    skipped = 0
    errors = 0
    total_saved = 0
    
    for i, img_path in enumerate(sorted(images), 1):
        relative_path = str(img_path)
        original_size = get_file_size_kb(img_path)
        
        new_size, status = optimize_image(img_path)
        
        if new_size is not None:
            saved = original_size - new_size
            total_saved += saved
            optimized += 1
            print(f"[{i}/{len(images)}] {relative_path}: {status}")
        elif "skipped" in status:
            skipped += 1
        elif "error" in status:
            errors += 1
            print(f"[{i}/{len(images)}] {relative_path}: {status}")
    
    print("-" * 60)
    print(f"Summary:")
    print(f"  Optimized: {optimized}")
    print(f"  Skipped (already small): {skipped}")
    print(f"  Errors: {errors}")
    print(f"  Total space saved: {total_saved/1024:.1f} MB")
    print("=" * 60)

if __name__ == "__main__":
    main()
