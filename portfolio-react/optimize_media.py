#!/usr/bin/env python3
"""
Media Optimization Script for Portfolio
- Images: Max 2.5MB, progressively reduces quality until target is met
- Videos: Compressed using ffmpeg
"""

import os
import subprocess
import shutil
from pathlib import Path
from PIL import Image

# Configuration
IMAGES_DIR = Path(__file__).parent / "images"
BACKUP_DIR = Path(__file__).parent / "originals_backup"
MAX_IMAGE_SIZE_MB = 2.5
MAX_VIDEO_SIZE_MB = 10  # Target for videos
MAX_WIDTH = 1800
INITIAL_JPG_QUALITY = 85

def get_file_size_mb(path):
    return os.path.getsize(path) / (1024 * 1024)

def optimize_image_to_target(src_path, max_size_mb=2.5):
    """Optimize image, progressively reducing quality until under target size."""
    try:
        original_size = get_file_size_mb(src_path)
        
        # If already under target, skip
        if original_size <= max_size_mb:
            return None
        
        with Image.open(src_path) as img:
            # Convert RGBA to RGB for JPG
            if img.mode == 'RGBA' and src_path.suffix.lower() in ['.jpg', '.jpeg']:
                img = img.convert('RGB')
            
            # Resize if too wide
            if img.width > MAX_WIDTH:
                ratio = MAX_WIDTH / img.width
                new_height = int(img.height * ratio)
                img = img.resize((MAX_WIDTH, new_height), Image.Resampling.LANCZOS)
            
            # For PNG files that are too big, convert to JPG
            if src_path.suffix.lower() == '.png' and original_size > max_size_mb:
                # Try saving as optimized PNG first
                temp_path = src_path.with_suffix('.tmp.png')
                if img.mode == 'RGBA':
                    # Check if image actually uses transparency
                    if img.split()[3].getextrema()[0] < 255:
                        # Has transparency, keep as PNG but optimize more
                        img.save(temp_path, 'PNG', optimize=True)
                        if get_file_size_mb(temp_path) <= max_size_mb:
                            shutil.move(temp_path, src_path)
                            new_size = get_file_size_mb(src_path)
                            return {'original': original_size, 'new': new_size, 'reduction': ((original_size - new_size) / original_size) * 100}
                        os.remove(temp_path)
                    
                    # No real transparency or still too big, convert to RGB
                    img = img.convert('RGB')
                
                # Save as JPG with progressive quality reduction
                new_path = src_path.with_suffix('.jpg')
                quality = INITIAL_JPG_QUALITY
                
                while quality >= 50:
                    img.save(new_path, 'JPEG', quality=quality, optimize=True)
                    if get_file_size_mb(new_path) <= max_size_mb:
                        break
                    quality -= 5
                
                # Remove original PNG, keep JPG
                if new_path != src_path:
                    os.remove(src_path)
                
                new_size = get_file_size_mb(new_path)
                return {
                    'original': original_size, 
                    'new': new_size, 
                    'reduction': ((original_size - new_size) / original_size) * 100,
                    'converted': f'{src_path.suffix} → .jpg'
                }
            
            # For JPG, progressively reduce quality
            elif src_path.suffix.lower() in ['.jpg', '.jpeg']:
                quality = INITIAL_JPG_QUALITY
                
                while quality >= 50:
                    img.save(src_path, 'JPEG', quality=quality, optimize=True)
                    if get_file_size_mb(src_path) <= max_size_mb:
                        break
                    quality -= 5
                
                new_size = get_file_size_mb(src_path)
                return {
                    'original': original_size, 
                    'new': new_size, 
                    'reduction': ((original_size - new_size) / original_size) * 100,
                    'quality': quality
                }
            
            else:
                # Other formats - just resize
                img.save(src_path)
                new_size = get_file_size_mb(src_path)
                return {'original': original_size, 'new': new_size, 'reduction': ((original_size - new_size) / original_size) * 100}
                
    except Exception as e:
        print(f"  Error: {e}")
        return None

def compress_video(src_path, max_size_mb=10):
    """Compress video using ffmpeg."""
    try:
        original_size = get_file_size_mb(src_path)
        
        # Skip if already small enough
        if original_size <= max_size_mb:
            return None
        
        # Check if ffmpeg is available
        result = subprocess.run(['which', 'ffmpeg'], capture_output=True)
        if result.returncode != 0:
            print("  ffmpeg not installed, skipping video compression")
            return None
        
        # Calculate target bitrate
        # Get video duration
        probe_cmd = [
            'ffprobe', '-v', 'error', '-show_entries', 'format=duration',
            '-of', 'default=noprint_wrappers=1:nokey=1', str(src_path)
        ]
        result = subprocess.run(probe_cmd, capture_output=True, text=True)
        duration = float(result.stdout.strip()) if result.stdout.strip() else 10
        
        # Target bitrate in kbps (target_size_bytes * 8 / duration_seconds / 1000)
        target_bitrate = int((max_size_mb * 1024 * 1024 * 8) / duration / 1000 * 0.9)  # 90% to ensure under limit
        target_bitrate = max(target_bitrate, 500)  # Minimum 500kbps
        
        temp_path = src_path.with_suffix('.temp.mp4')
        
        cmd = [
            'ffmpeg', '-y', '-i', str(src_path),
            '-c:v', 'libx264', '-preset', 'medium',
            '-b:v', f'{target_bitrate}k',
            '-c:a', 'aac', '-b:a', '128k',
            '-movflags', '+faststart',
            str(temp_path)
        ]
        
        result = subprocess.run(cmd, capture_output=True, text=True)
        
        if result.returncode == 0 and temp_path.exists():
            # Replace original with compressed
            os.remove(src_path)
            shutil.move(temp_path, src_path)
            new_size = get_file_size_mb(src_path)
            return {
                'original': original_size,
                'new': new_size,
                'reduction': ((original_size - new_size) / original_size) * 100
            }
        else:
            if temp_path.exists():
                os.remove(temp_path)
            print(f"  ffmpeg error: {result.stderr[:100] if result.stderr else 'unknown'}")
            return None
            
    except Exception as e:
        print(f"  Error: {e}")
        return None

def main():
    if not IMAGES_DIR.exists():
        print(f"Images directory not found: {IMAGES_DIR}")
        return
    
    BACKUP_DIR.mkdir(exist_ok=True)
    
    print("=" * 60)
    print("MEDIA OPTIMIZATION - MAX 2.5MB PER IMAGE")
    print("=" * 60)
    
    image_extensions = {'.jpg', '.jpeg', '.png', '.webp'}
    video_extensions = {'.mp4', '.mov', '.webm'}
    
    total_original = 0
    total_new = 0
    processed = 0
    videos_processed = 0
    
    for folder in sorted(IMAGES_DIR.iterdir()):
        if not folder.is_dir():
            continue
        
        # Check if any files need processing
        needs_processing = False
        for f in folder.iterdir():
            if f.suffix.lower() in image_extensions and get_file_size_mb(f) > MAX_IMAGE_SIZE_MB:
                needs_processing = True
                break
            if f.suffix.lower() in video_extensions and get_file_size_mb(f) > MAX_VIDEO_SIZE_MB:
                needs_processing = True
                break
        
        if not needs_processing:
            continue
            
        print(f"\n📁 {folder.name}")
        
        # Ensure backup folder exists
        backup_folder = BACKUP_DIR / folder.name
        backup_folder.mkdir(exist_ok=True)
        
        for file_path in sorted(folder.iterdir()):
            # Process images over 2.5MB
            if file_path.suffix.lower() in image_extensions:
                size = get_file_size_mb(file_path)
                if size > MAX_IMAGE_SIZE_MB:
                    # Backup if not already backed up
                    backup_path = backup_folder / file_path.name
                    if not backup_path.exists():
                        shutil.copy2(file_path, backup_path)
                    
                    result = optimize_image_to_target(file_path, MAX_IMAGE_SIZE_MB)
                    if result:
                        total_original += result['original']
                        total_new += result['new']
                        processed += 1
                        extra = result.get('converted', f"q={result.get('quality', 'opt')}")
                        print(f"  ✓ {file_path.name}: {result['original']:.2f}MB → {result['new']:.2f}MB ({extra})")
            
            # Process videos over 10MB
            elif file_path.suffix.lower() in video_extensions:
                size = get_file_size_mb(file_path)
                if size > MAX_VIDEO_SIZE_MB:
                    # Backup if not already backed up
                    backup_path = backup_folder / file_path.name
                    if not backup_path.exists():
                        shutil.copy2(file_path, backup_path)
                    
                    print(f"  🎬 Compressing {file_path.name} ({size:.1f}MB)...")
                    result = compress_video(file_path, MAX_VIDEO_SIZE_MB)
                    if result:
                        total_original += result['original']
                        total_new += result['new']
                        videos_processed += 1
                        print(f"     → {result['new']:.2f}MB ({result['reduction']:.0f}% smaller)")
    
    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)
    print(f"Images compressed: {processed}")
    print(f"Videos compressed: {videos_processed}")
    if total_original > 0:
        print(f"Total saved: {total_original - total_new:.2f}MB")
    print("=" * 60)

if __name__ == "__main__":
    main()
