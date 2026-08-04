"""Build App Store-ready screenshot sets from the raw 1125x2436 iPhone shots.

- iPhone 6.9" : 1320x2868, full-bleed (cover-crop, ~2px trim).
- iPad 13"    : 2048x2732, phone shot contained + padded on the app's dark
                background (no alpha), for the iPad listing.

Ordered/renamed for a sensible store sequence. Re-runnable.
"""
from PIL import Image
from pathlib import Path

RAW = Path("store/screenshots-raw")
OUT_IP = Path("store/screenshots-iphone69")
OUT_PAD = Path("store/screenshots-ipad13")
OUT_IP.mkdir(exist_ok=True)
OUT_PAD.mkdir(exist_ok=True)

BG = (29, 20, 12)  # app background #1d140c

# Store order: lead with the concept (landing), then the best Discover cards,
# then the swipe interactions (Watched / Skip).
ORDER = [
    ("IMG_9502", "01_landing"),
    ("IMG_9496", "02_discover_summer"),
    ("IMG_9500", "03_watched"),
    ("IMG_9494", "04_skip"),
    ("IMG_9499", "05_discover_interrogation"),
    ("IMG_9497", "06_watched_summer"),
    ("IMG_9495", "07_watched_echoes"),
    ("IMG_9498", "08_skip_summer"),
    ("IMG_9501", "09_skip_interrogation"),
]


def cover(im, tw, th):
    w, h = im.size
    s = max(tw / w, th / h)
    im2 = im.resize((round(w * s), round(h * s)), Image.LANCZOS)
    x = (im2.width - tw) // 2
    y = (im2.height - th) // 2
    return im2.crop((x, y, x + tw, y + th))


def contain_pad(im, tw, th, bg):
    w, h = im.size
    s = min(tw / w, th / h)
    im2 = im.resize((round(w * s), round(h * s)), Image.LANCZOS)
    canvas = Image.new("RGB", (tw, th), bg)
    canvas.paste(im2, ((tw - im2.width) // 2, (th - im2.height) // 2))
    return canvas


for src, name in ORDER:
    im = Image.open(RAW / f"{src}.PNG").convert("RGB")
    cover(im, 1320, 2868).save(OUT_IP / f"{name}.png")
    contain_pad(im, 2048, 2732, BG).save(OUT_PAD / f"{name}.png")
    print("built", name)

print("done")
