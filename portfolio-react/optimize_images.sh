#!/bin/bash
# Image optimization script for portfolio
# Requires: ImageMagick (brew install imagemagick)

IMAGES_DIR="images"
OUTPUT_DIR="images_optimized"

# Create output directory
mkdir -p "$OUTPUT_DIR"

echo "Optimizing images..."

# Find all image files and optimize them
find "$IMAGES_DIR" -type f \( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" \) | while read file; do
    # Get relative path
    rel_path="${file#$IMAGES_DIR/}"
    output_path="$OUTPUT_DIR/$rel_path"
    output_dir=$(dirname "$output_path")
    
    # Create directory structure
    mkdir -p "$output_dir"
    
    # Get file size in KB
    size_kb=$(stat -f%z "$file" 2>/dev/null || stat --printf="%s" "$file" 2>/dev/null)
    size_kb=$((size_kb / 1024))
    
    # Only optimize if file is larger than 200KB
    if [ "$size_kb" -gt 200 ]; then
        echo "Optimizing: $rel_path (${size_kb}KB)"
        
        # For JPG files - resize if wider than 1600px, quality 85%
        if [[ "$file" =~ \.(jpg|jpeg)$ ]]; then
            convert "$file" -resize '1600x1600>' -quality 85 "$output_path"
        # For PNG files - resize if wider than 1600px, optimize
        elif [[ "$file" =~ \.png$ ]]; then
            convert "$file" -resize '1600x1600>' -quality 90 "$output_path"
        fi
    else
        # Just copy smaller files
        cp "$file" "$output_path"
    fi
done

echo "Done! Optimized images saved to $OUTPUT_DIR"
echo ""
echo "To use optimized images, update public/images symlink:"
echo "  rm public/images"
echo "  ln -s ../images_optimized public/images"
