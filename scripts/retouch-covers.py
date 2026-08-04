"""Retouch AI-generated poster covers: remove real actor-name bands by
reconstructing the local background (column interpolation), so they can be used
as copyright/publicity-clean placeholder covers in store screenshots.

Originals are left untouched; cleaned copies are written with a -clean suffix.
"""
from PIL import Image, ImageDraw, ImageFilter
from pathlib import Path

BASE = Path("assets/screenshot-covers")


def rebuild_band(img, box, lx, rx, hf=32, vf=8, blur=10):
    """Replace the rectangle `box`=(x0,y0,x1,y1) with a horizontally
    interpolated fill built from clean columns at x=lx (left) and x=rx (right),
    preserving the per-row vertical colour so smooth skies/darks reconstruct
    seamlessly. The fill is pasted through a feathered mask (hf/vf = horizontal/
    vertical inset, blur = edge softness) so the patch edges blend into the
    surrounding texture and leave no visible rectangle. Keep `blur` small so the
    opaque core still fully covers the text being removed."""
    x0, y0, x1, y1 = box
    h = y1 - y0
    w = x1 - x0
    left = img.crop((lx, y0, lx + 1, y1))
    right = img.crop((rx, y0, rx + 1, y1))
    strip = Image.new(img.mode, (2, h))
    strip.paste(left, (0, 0))
    strip.paste(right, (1, 0))
    fill = strip.resize((w, h), Image.BILINEAR)

    mask = Image.new("L", (w, h), 0)
    ImageDraw.Draw(mask).rectangle([hf, vf, w - hf, h - vf], fill=255)
    mask = mask.filter(ImageFilter.GaussianBlur(blur))
    img.paste(fill, (x0, y0), mask)


def blur_block(img, box, radius=5):
    """Heavily blur a rectangle so tiny billing-block text (which repeats the
    real actor names) becomes an unreadable smudge while still reading as a
    credits block."""
    region = img.crop(box).filter(ImageFilter.GaussianBlur(radius))
    img.paste(region, (box[0], box[1]))


# --- Cover 2: Summer Lighthouses (501x998) — smooth sunset sky --------------
c2 = Image.open(BASE / "cover2-summer.png").convert("RGB")
# Name band "LILY COLLINS / JOSH O'CONNOR" (near full width so the opaque
# core covers every letter; feather falls only on clean sky at the margins)
rebuild_band(c2, (15, 392, 486, 508), lx=8, rx=491, hf=30, vf=6, blur=9)
# Bottom billing block (tiny cast/crew text) -> unreadable (keep the
# "COMING THIS SUMMER" tagline below it sharp)
blur_block(c2, (22, 872, 479, 934), radius=5)
c2.save(BASE / "cover2-summer-clean.png")
print("cover2 saved", c2.size)

# --- Cover 3: The Silent Interrogation (1024x1536) — dark background --------
c3 = Image.open(BASE / "cover3-interrogation.png").convert("RGB")
# Cast line "JACK O'CONNELL | HANNAH WADDINGHAM | ALFRED MOLINA" (near full
# width; feather lands on the dark clean background at the margins)
rebuild_band(c3, (12, 636, 1012, 788), lx=6, rx=1018, hf=40, vf=10, blur=12)
# Bottom billing block (tiny text still spells the real names) -> unreadable
blur_block(c3, (40, 1408, 984, 1484), radius=6)
c3.save(BASE / "cover3-interrogation-clean.png")
print("cover3 saved", c3.size)
