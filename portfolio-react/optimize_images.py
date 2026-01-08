#!/usr/bin/env python3
"""
Image Optimization Script for Portfolio
Compresses images to web-friendly sizes while maintaining quality for a design portfolio.
- JPG: Quality 85, max width 1800px
- PNG: Optimized, max width 1800px
- Creates backup of originals in 'originals_backup' folder
"""

import os
import shutil
from pathlib import Path
from PIL import Image

# Configuration
IMAGES_DIR = Path(__file__).parent / "images"
BACKUP_DIR = Path(__file__).parent / "originals_backup"
MAX_WIDTH = 1800  # Max width in pixels - good for retina displays
JPG_QUALITY = 85  # High quality for design portfolio
PNG_OPTIMIZE = True

def get_file_size_mb(path):
    return os.path.getsize(path) / (1024 * 1024)

def optimize_image(src_path, dest_path):
    """Optimize a single image."""
    try:
        with Image.open(src_path) as img:
            # Get original size
            original_size = get_file_size_mb(src_path)
            
            # Convert RGBA to RGB for JPG (if needed)
            if img.mode == 'RGBA' and src_path.suffix.lower() in ['.jpg', '.jpeg']:
                img = img.convert('RGB')
            
            # Resize if too wide
            if img.width > MAX_WIDTH:
                ratio = MAX_WIDTH / img.width
                new_height = int(img.height * ratio)
                img = img.resize((MAX_WIDTH, new_height), Image.Resampling.LANCZOS)
            
            # Save with optimization
            if src_path.suffix.lower() in ['.jpg', '.jpeg']:
                img.save(dest_path, 'JPEG', quality=JPG_QUALITY, optimize=True)
            elif src_path.suffix.lower() == '.png':
                img.save(dest_path, 'PNG', optimize=PNG_OPTIMIZE)
            else:
                # For other formats, just copy
                shutil.copy2(src_path, dest_path)
                return None
            
            new_size = get_file_size_mb(dest_path)
            reduction = ((original_size - new_size) / original_size) * 100 if original_size > 0 else 0
            
            return {
                'original': original_size,
                'new': new_size,
                'reduction': reduction
            }
    except Exception as e:
        print(f"  Error processing {src_path}: {e}")
        return None

def main():
    if not IMAGES_DIR.exists():
        print(f"Images directory not found: {IMAGES_DIR}")
        return
    
    # Create backup directory
    BACKUP_DIR.mkdir(exist_ok=True)
    
    total_original = 0
    total_new = 0
    processed = 0
    skipped = 0
    
    print("=" * 60)
    print("IMAGE OPTIMIZATION FOR PORTFOLIO")
    print("=" * 60)
    print(f"Max width: {MAX_WIDTH}px | JPG quality: {JPG_QUALITY}")
    print(f"Source: {IMAGES_DIR}")
    print(f"Backup: {BACKUP_DIR}")
    print("=" * 60)
    
    # Find all images
    image_extensions = {'.jpg', '.jpeg', '.png', '.webp'}
    
    for folder in sorted(IMAGES_DIR.iterdir()):
        if not folder.is_dir():
            continue
        
        print(f"\n📁 {folder.name}")
        
        # Create backup subfolder
        backup_folder = BACKUP_DIR / folder.name
        backup_folder.mkdir(exist_ok=True)
        
        for img_path in sorted(folder.iterdir()):
            if img_path.suffix.lower() not in image_extensions:
                continue
            
            # Skip if already small
            size_mb = get_file_size_mb(img_path)
            if size_mb < 0.1:  # Skip files under 100KB
                skipped += 1
                continue
            
            # Backup original
            backup_path = backup_folder / img_path.name
            if not backup_path.exists():
                shutil.copy2(img_path, backup_path)
            
            # Optimize in place
            result = optimize_image(img_path, img_path)
            
            if result:
                total_original += result['original']
                total_new += result['new']
                processed += 1
                
                status = "✓" if result['reduction'] > 10 else "~"
                print(f"  {status} {img_path.name}: {result['original']:.2f}MB → {result['new']:.2f}MB ({result['reduction']:.0f}% smaller)")
    
    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)
    print(f"Processed: {processed} images")
    print(f"Skipped (already small): {skipped} images")
    if total_original > 0:
        total_reduction = ((total_original - total_new) / total_original) * 100
        print(f"Total size: {total_original:.2f}MB → {total_new:.2f}MB")
        print(f"Saved: {total_original - total_new:.2f}MB ({total_reduction:.0f}%)")
    print(f"\nOriginals backed up to: {BACKUP_DIR}")
    print("=" * 60)

if __name__ == "__main__":
    main()
