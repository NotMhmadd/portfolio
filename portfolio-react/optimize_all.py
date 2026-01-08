#!/usr/bin/env python3
"""
Media Optimization Script - Full Recursive
Compresses ALL images to max 2.5MB and videos to max 10MB
"""

import os
import subprocess
import shutil
from pathlib import Path
from PIL import Image

IMAGES_DIR = Path(__file__).parent / "images"
BACKUP_DIR = Path(__file__).parent / "originals_backup"
MAX_IMAGE_SIZE_MB = 2.5
MAX_VIDEO_SIZE_MB = 10
MAX_WIDTH = 1800

def get_file_size_mb(path):
    return os.path.getsize(path) / (1024 * 1024)

def optimize_image(src_path, max_size_mb=2.5):
    """Compress image to be under max_size_mb."""
    try:
        original_size = get_file_size_mb(src_path)
        if original_size <= max_size_mb:
            return None
        
        with Image.open(src_path) as img:
            # Resize if too wide
            if img.width > MAX_WIDTH:
                ratio = MAX_WIDTH / img.width
                new_height = int(img.height * ratio)
                img = img.resize((MAX_WIDTH, new_height), Image.Resampling.LANCZOS)
            
            # Convert to RGB if needed
            if img.mode == 'RGBA':
                img = img.convert('RGB')
            elif img.mode != 'RGB':
                img = img.convert('RGB')
            
            # Save as JPG with reducing quality until under limit
            new_path = src_path.with_suffix('.jpg')
            quality = 85
            
            while quality >= 40:
                img.save(new_path, 'JPEG', quality=quality, optimize=True)
                if get_file_size_mb(new_path) <= max_size_mb:
                    break
                quality -= 5
            
            # Remove original if different
            if new_path != src_path and src_path.exists():
                os.remove(src_path)
            
            new_size = get_file_size_mb(new_path)
            return {'original': original_size, 'new': new_size, 'quality': quality}
    except Exception as e:
        print(f"    Error: {e}")
        return None

def compress_video(src_path, max_size_mb=10):
    """Compress video using ffmpeg."""
    try:
        original_size = get_file_size_mb(src_path)
        if original_size <= max_size_mb:
            return None
        
        # Get duration
        probe = subprocess.run(
            ['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'default=noprint_wrappers=1:nokey=1', str(src_path)],
            capture_output=True, text=True
        )
        duration = float(probe.stdout.strip()) if probe.stdout.strip() else 10
        
        # Calculate bitrate
        target_bitrate = int((max_size_mb * 1024 * 1024 * 8) / duration / 1000 * 0.85)
        target_bitrate = max(target_bitrate, 500)
        
        temp_path = src_path.with_suffix('.temp.mp4')
        
        subprocess.run([
            'ffmpeg', '-y', '-i', str(src_path),
            '-c:v', 'libx264', '-preset', 'medium', '-b:v', f'{target_bitrate}k',
            '-c:a', 'aac', '-b:a', '128k', '-movflags', '+faststart',
            str(temp_path)
        ], capture_output=True)
        
        if temp_path.exists():
            os.remove(src_path)
            shutil.move(temp_path, src_path)
            return {'original': original_size, 'new': get_file_size_mb(src_path)}
        return None
    except Exception as e:
        print(f"    Error: {e}")
        return None

def main():
    print("=" * 60)
    print("FULL RECURSIVE MEDIA OPTIMIZATION")
    print(f"Max image: {MAX_IMAGE_SIZE_MB}MB | Max video: {MAX_VIDEO_SIZE_MB}MB")
    print("=" * 60)
    
    image_ext = {'.jpg', '.jpeg', '.png', '.webp'}
    video_ext = {'.mp4', '.mov', '.webm'}
    
    images_done = 0
    videos_done = 0
    saved = 0
    
    # Walk through ALL subdirectories
    for root, dirs, files in os.walk(IMAGES_DIR):
        root_path = Path(root)
        
        for filename in sorted(files):
            file_path = root_path / filename
            ext = file_path.suffix.lower()
            size = get_file_size_mb(file_path)
            
            if ext in image_ext and size > MAX_IMAGE_SIZE_MB:
                print(f"📷 {file_path.relative_to(IMAGES_DIR)} ({size:.1f}MB)")
                result = optimize_image(file_path, MAX_IMAGE_SIZE_MB)
                if result:
                    saved += result['original'] - result['new']
                    images_done += 1
                    print(f"   → {result['new']:.2f}MB (q={result['quality']})")
            
            elif ext in video_ext and size > MAX_VIDEO_SIZE_MB:
                print(f"🎬 {file_path.relative_to(IMAGES_DIR)} ({size:.1f}MB)")
                result = compress_video(file_path, MAX_VIDEO_SIZE_MB)
                if result:
                    saved += result['original'] - result['new']
                    videos_done += 1
                    print(f"   → {result['new']:.2f}MB")
    
    print("\n" + "=" * 60)
    print(f"Done! Images: {images_done} | Videos: {videos_done} | Saved: {saved:.1f}MB")
    print("=" * 60)

if __name__ == "__main__":
    main()
