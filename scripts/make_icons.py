import zlib
import struct
import math
import os

def create_png(width, height, draw_fn):
    png = b'\x89PNG\r\n\x1a\n'
    ihdr_data = struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0)
    ihdr_crc = zlib.crc32(b'IHDR' + ihdr_data) & 0xffffffff
    png += struct.pack('>I', len(ihdr_data)) + b'IHDR' + ihdr_data + struct.pack('>I', ihdr_crc)

    raw = bytearray()
    for y in range(height):
        raw.append(0)  # filter type None
        for x in range(width):
            r, g, b, a = draw_fn(x, y, width, height)
            raw.extend((r, g, b, a))

    idat_data = zlib.compress(bytes(raw), 9)
    idat_crc = zlib.crc32(b'IDAT' + idat_data) & 0xffffffff
    png += struct.pack('>I', len(idat_data)) + b'IDAT' + idat_data + struct.pack('>I', idat_crc)

    iend_crc = zlib.crc32(b'IEND') & 0xffffffff
    png += struct.pack('>I', 0) + b'IEND' + struct.pack('>I', iend_crc)
    return png

def draw_sayayin_icon(x, y, width, height, is_maskable=False):
    cx = width / 2.0
    cy = height / 2.0
    dx = x - cx
    dy = y - cy
    dist = math.sqrt(dx * dx + dy * dy)
    
    # Base background: #121212
    bg_r, bg_g, bg_b = 18, 18, 18
    
    max_radius = width * (0.36 if is_maskable else 0.42)
    inner_radius = max_radius * 0.85
    
    # Outer ki aura
    if dist < max_radius * 1.25 and dist >= max_radius:
        aura_intensity = 1.0 - (dist - max_radius) / (max_radius * 0.25)
        aura_intensity = max(0.0, min(1.0, aura_intensity))
        # Orange glow #FF6600
        r = int(bg_r + (255 - bg_r) * aura_intensity * 0.45)
        g = int(bg_g + (102 - bg_g) * aura_intensity * 0.45)
        b = int(bg_b + (0 - bg_b) * aura_intensity * 0.45)
        return (r, g, b, 255)
    
    # Dragon Ball sphere
    if dist < max_radius:
        # Radial gradient with top-left specular highlight
        hl_dx = x - (cx - max_radius * 0.3)
        hl_dy = y - (cy - max_radius * 0.3)
        hl_dist = math.sqrt(hl_dx * hl_dx + hl_dy * hl_dy)
        
        norm_dist = dist / max_radius
        norm_hl = max(0.0, 1.0 - hl_dist / (max_radius * 1.1))
        
        # Base orange: from #FF9900 at center to #E65100 at edge
        base_r = int(255 - norm_dist * 35)
        base_g = int(140 - norm_dist * 60)
        base_b = int(10)
        
        # Specular glint
        spec = math.pow(norm_hl, 3) * 120
        r = min(255, int(base_r + spec))
        g = min(255, int(base_g + spec * 0.8))
        b = min(255, int(base_b + spec * 0.4))
        
        # Stylized 4-pointed Dragon Star in the center
        # Center star coordinates relative to center
        # Check if inside a 4-pointed star
        abs_dx = abs(dx)
        abs_dy = abs(dy)
        star_size = max_radius * 0.45
        
        # Astroid / star curve: (x/a)^(2/3) + (y/a)^(2/3) <= 1
        if star_size > 0 and (abs_dx / star_size) < 1.0 and (abs_dy / star_size) < 1.0:
            val = math.pow(abs_dx / star_size, 0.7) + math.pow(abs_dy / star_size, 0.7)
            if val <= 1.0:
                # Deep crimson red star (#C62828) with golden outline
                edge = 1.0 - val
                if edge < 0.15:
                    # Gold border #FFF
                    return (255, 235, 120, 255)
                else:
                    return (216, 27, 34, 255)
                    
        return (r, g, b, 255)
        
    return (bg_r, bg_g, bg_b, 255)

os.makedirs('public', exist_ok=True)

# Generate 192x192
print("Generating icon-192.png...")
png_192 = create_png(192, 192, lambda x, y, w, h: draw_sayayin_icon(x, y, w, h, False))
with open('public/icon-192.png', 'wb') as f:
    f.write(png_192)

# Generate 512x512
print("Generating icon-512.png...")
png_512 = create_png(512, 512, lambda x, y, w, h: draw_sayayin_icon(x, y, w, h, False))
with open('public/icon-512.png', 'wb') as f:
    f.write(png_512)

# Generate maskable 512x512
print("Generating icon-maskable.png...")
png_maskable = create_png(512, 512, lambda x, y, w, h: draw_sayayin_icon(x, y, w, h, True))
with open('public/icon-maskable.png', 'wb') as f:
    f.write(png_maskable)

# Generate apple-touch-icon 180x180
print("Generating apple-touch-icon.png...")
png_apple = create_png(180, 180, lambda x, y, w, h: draw_sayayin_icon(x, y, w, h, False))
with open('public/apple-touch-icon.png', 'wb') as f:
    f.write(png_apple)

print("All icons generated successfully!")
