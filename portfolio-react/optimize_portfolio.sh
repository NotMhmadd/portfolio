#!/bin/bash
# Portfolio Image Optimization Script
# Optimizes images for web while maintaining high quality for design portfolio
# Uses jpegoptim for JPGs and pngquant for PNGs

IMAGES_DIR="./images"
BACKUP_DIR="./images_backup_$(date +%Y%m%d_%H%M%S)"

# Quality settings - balanced for design portfolio
# JPG: 80-85 is good for design work (maintains sharpness)
# PNG: 80-90 quality with pngquant preserves gradients well
JPG_QUALITY=82
PNG_QUALITY="70-85"

echo "============================================"
echo "Portfolio Image Optimization"
echo "============================================"
echo ""

# Calculate initial size
INITIAL_SIZE=$(find "$IMAGES_DIR" -type f \( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" \) ! -name "._*" -exec du -ch {} + 2>/dev/null | tail -1 | awk '{print $1}')
echo "Initial total size: $INITIAL_SIZE"

# Create backup
echo ""
echo "Creating backup in $BACKUP_DIR..."
cp -R "$IMAGES_DIR" "$BACKUP_DIR"
echo "Backup created."

echo ""
echo "Optimizing JPG/JPEG files..."
echo "-------------------------------------------"

# Optimize JPGs with jpegoptim (lossy compression with quality limit)
find "$IMAGES_DIR" -type f \( -iname "*.jpg" -o -iname "*.jpeg" \) ! -name "._*" -print0 | while IFS= read -r -d '' file; do
    original_size=$(ls -la "$file" | awk '{print $5}')
    jpegoptim --max=$JPG_QUALITY --strip-all --quiet "$file"
    new_size=$(ls -la "$file" | awk '{print $5}')
    if [ "$original_size" != "$new_size" ]; then
        savings=$(echo "scale=1; ($original_size - $new_size) / 1024" | bc)
        echo "Optimized: $(basename "$file") (-${savings}KB)"
    fi
done

echo ""
echo "Optimizing PNG files..."
echo "-------------------------------------------"

# Optimize PNGs with pngquant (lossy but high quality)
find "$IMAGES_DIR" -type f -iname "*.png" ! -name "._*" -print0 | while IFS= read -r -d '' file; do
    original_size=$(ls -la "$file" | awk '{print $5}')
    # pngquant with quality range, skip if already optimized, overwrite original
    pngquant --quality=$PNG_QUALITY --skip-if-larger --force --ext .png "$file" 2>/dev/null
    new_size=$(ls -la "$file" | awk '{print $5}')
    if [ "$original_size" != "$new_size" ]; then
        savings=$(echo "scale=1; ($original_size - $new_size) / 1024" | bc)
        echo "Optimized: $(basename "$file") (-${savings}KB)"
    fi
done

# Calculate final size
echo ""
echo "============================================"
FINAL_SIZE=$(find "$IMAGES_DIR" -type f \( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" \) ! -name "._*" -exec du -ch {} + 2>/dev/null | tail -1 | awk '{print $1}')
echo "Final total size: $FINAL_SIZE"
echo "Backup saved to: $BACKUP_DIR"
echo "============================================"
echo ""
echo "Done! Refresh your website to see the changes."
echo "If quality is too low, restore from backup:"
echo "  rm -rf $IMAGES_DIR && mv $BACKUP_DIR $IMAGES_DIR"
