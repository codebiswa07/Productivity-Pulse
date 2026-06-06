#!/bin/bash
# Simple icon generator using SVG → PNG (requires Inkscape or rsvg-convert)
# If neither is available, use online tools to convert icon.svg to PNG sizes

cat > icon.svg << 'SVG_EOF'
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
  <rect width="128" height="128" rx="24" fill="#3b82f6"/>
  <circle cx="64" cy="64" r="32" fill="none" stroke="#fff" stroke-width="8"/>
  <polyline points="64,40 64,64 80,72" fill="none" stroke="#fff" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="64" cy="64" r="4" fill="#fff"/>
</svg>
SVG_EOF

# Try to generate PNGs
for SIZE in 16 32 48 128; do
  if command -v rsvg-convert &>/dev/null; then
    rsvg-convert -w $SIZE -h $SIZE icon.svg -o icon${SIZE}.png
  elif command -v convert &>/dev/null; then
    convert -background none icon.svg -resize ${SIZE}x${SIZE} icon${SIZE}.png
  else
    echo "Skipping icon${SIZE}.png — install librsvg or ImageMagick"
    cp icon.svg icon${SIZE}.png  # fallback: just copy SVG (Chrome will show it)
  fi
done

rm -f icon.svg
