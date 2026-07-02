import sharp from 'sharp';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, '..', 'assets', 'icon.png');
const SIZE = 1024;

const BOOKS = [
  { color: '#a7563d', h: 0.78, w: 1.10 },
  { color: '#7a3527', h: 0.62, w: 0.90 },
  { color: '#b89b73', h: 0.70, w: 1.05 },
  { color: '#8a5a2b', h: 0.55, w: 0.85 },
  { color: '#2c4a3a', h: 0.72, w: 1.00 },
];

function buildSvg(size) {
  const frameInset = size * 0.05;
  const frameThickness = size * 0.055;
  const innerX = frameInset + frameThickness;
  const innerY = frameInset + frameThickness;
  const innerW = size - 2 * (frameInset + frameThickness);
  const innerH = size - 2 * (frameInset + frameThickness);

  const bookGap = innerW * 0.012;
  const totalW = BOOKS.reduce((s, b) => s + b.w, 0);
  const usable = innerW - bookGap * (BOOKS.length - 1) - innerW * 0.06;
  const baseline = innerY + innerH - innerH * 0.05;

  let books = '';
  let cx = innerX + innerW * 0.03;
  BOOKS.forEach((b, i) => {
    const bw = (b.w / totalW) * usable;
    const bh = innerH * b.h;
    const by = baseline - bh;
    const band1Y = by + bh * 0.30;
    const band2Y = by + bh * 0.38;
    const bandH = bh * 0.028;
    books += `
      <g>
        <rect x="${cx}" y="${by}" width="${bw}" height="${bh}" fill="${b.color}"/>
        <rect x="${cx}" y="${by}" width="${bw}" height="${bh * 0.18}" fill="url(#topShine)"/>
        <rect x="${cx}" y="${band1Y}" width="${bw}" height="${bandH}" fill="#d8a548"/>
        <rect x="${cx}" y="${band2Y}" width="${bw}" height="${bandH}" fill="#d8a548"/>
        <rect x="${cx}" y="${by + bh * 0.85}" width="${bw}" height="${bh * 0.15}" fill="url(#bottomShade)"/>
      </g>`;
    cx += bw + bookGap;
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="wood" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#a26436"/>
      <stop offset="0.55" stop-color="#7a4622"/>
      <stop offset="1" stop-color="#553012"/>
    </linearGradient>
    <linearGradient id="interior" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#3a2410"/>
      <stop offset="0.4" stop-color="#4a2f18"/>
      <stop offset="1" stop-color="#3a2410"/>
    </linearGradient>
    <linearGradient id="topShine" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="rgba(255,255,255,0.22)"/>
      <stop offset="1" stop-color="rgba(255,255,255,0)"/>
    </linearGradient>
    <linearGradient id="bottomShade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="rgba(0,0,0,0)"/>
      <stop offset="1" stop-color="rgba(0,0,0,0.45)"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.5" cy="0.55" r="0.6">
      <stop offset="0" stop-color="rgba(255,190,110,0.08)"/>
      <stop offset="1" stop-color="rgba(0,0,0,0)"/>
    </radialGradient>
  </defs>

  <!-- Warm background -->
  <rect x="0" y="0" width="${size}" height="${size}" fill="url(#wood)"/>

  <!-- Inner compartment -->
  <rect x="${frameInset}" y="${frameInset}"
        width="${size - 2 * frameInset}" height="${size - 2 * frameInset}"
        fill="url(#interior)" rx="${size * 0.008}"/>

  <!-- Inner shadow around frame -->
  <rect x="${frameInset}" y="${frameInset}"
        width="${size - 2 * frameInset}" height="${size - 2 * frameInset}"
        fill="none" stroke="rgba(0,0,0,0.55)" stroke-width="${size * 0.010}"
        rx="${size * 0.008}"/>

  <!-- Books -->
  ${books}

  <!-- Shelf plank shadow underneath books -->
  <rect x="${frameInset}" y="${baseline}"
        width="${size - 2 * frameInset}" height="${size * 0.008}"
        fill="rgba(0,0,0,0.6)"/>

  <!-- Warm glow -->
  <rect x="0" y="0" width="${size}" height="${size}" fill="url(#glow)"/>
</svg>`;
}

const svg = buildSvg(SIZE);
writeFileSync(join(__dirname, 'icon.svg'), svg);

await sharp(Buffer.from(svg))
  .resize(SIZE, SIZE)
  .png()
  .toFile(OUT);

console.log(`Wrote ${OUT}`);
